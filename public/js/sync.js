// Sync with Supabase using a username and password. The browser copy stays the main copy:
// the app works offline, and each sync merges day by day, keeping whichever version changed last.
// Row level security (supabase/setup.sql) means each account can only read its own rows.
window.Lilac = window.Lilac || {};

Lilac.sync = (() => {
  const cfg = Lilac.config || {};
  const store = Lilac.store;
  const t = (k, v) => Lilac.i18n.t(k, v);
  const configured = !!(cfg.supabaseUrl && cfg.supabaseKey);
  const TABLE = "lilac_entries";
  const POLL_MS = 30000;

  let client = null;
  let user = null;
  let status = configured ? "signed-out" : "unconfigured";
  let errorKey = "";
  let lastSynced = null;
  let running = null;
  let again = false;
  let timer = null;
  const listeners = [];

  const info = () => ({ status, name: user ? displayName(user.email || "") : "", lastSynced, errorKey });
  function set(s, key = "") {
    status = s;
    errorKey = key;
    listeners.forEach((fn) => fn(info()));
  }

  function errorKeyFor(e) {
    const msg = (e && (e.message || e.error_description)) || String(e);
    if (e?.code === "42P01" || e?.code === "PGRST205" || /relation .* does not exist|schema cache/i.test(msg)) return "err.tables";
    if (/failed to fetch|networkerror|load failed/i.test(msg)) return "err.network";
    return "";
  }

  // ---------- Usernames ----------
  // Supabase accounts need an email, so a username becomes "<username>@<usernameDomain>".
  // With "Confirm email" off, nothing is ever sent to it.
  const domain = (cfg.usernameDomain || "users.lilac.app").toLowerCase();

  function checkUsername(raw) {
    const u = String(raw || "").trim().toLowerCase();
    if (!/^[a-z0-9._-]{3,30}$/.test(u)) throw new Error(t("err.username"));
    return u;
  }

  function displayName(address) {
    return address.endsWith(`@${domain}`) ? address.slice(0, -domain.length - 1) : address;
  }

  function authError(error) {
    const msg = error.message || "";
    if (error.code === "invalid_credentials" || /invalid login credentials/i.test(msg)) return t("err.credentials");
    if (error.code === "user_already_exists" || /already registered/i.test(msg)) return t("err.taken");
    if (error.code === "signup_disabled" || /signups not allowed/i.test(msg)) return t("err.signupDisabled");
    if (error.code === "email_not_confirmed") return t("err.confirmEmail");
    if (error.code === "weak_password") return t("err.weakPassword");
    const key = errorKeyFor(error);
    return key ? t(key) : msg;
  }

  async function signIn(username, password) {
    const { error } = await client.auth.signInWithPassword({ email: `${username}@${domain}`, password });
    if (error) throw new Error(authError(error));
  }

  async function signUp(username, password) {
    const { data, error } = await client.auth.signUp({ email: `${username}@${domain}`, password });
    if (error) throw new Error(authError(error));
    if (!data.session) throw new Error(t("err.confirmEmail"));
  }

  async function signOut() {
    clearTimeout(timer);
    if (client) await client.auth.signOut();
    user = null;
    set("signed-out");
  }

  // ---------- Session ----------
  function handleSession(session) {
    const u = session?.user || null;
    if (u && user && u.id === user.id) return; // token refresh, same person
    user = u;
    if (!user) return set("signed-out");
    set("idle");
    schedule(0);
  }

  function init() {
    if (!configured) return set("unconfigured");
    if (!window.supabase?.createClient) return set("offline", "err.library");
    client = window.supabase.createClient(cfg.supabaseUrl, cfg.supabaseKey, {
      auth: { persistSession: true, autoRefreshToken: true },
    });
    // Supabase advises not awaiting its own calls inside this callback, so defer.
    client.auth.onAuthStateChange((_event, session) => { setTimeout(() => handleSession(session), 0); });
    window.addEventListener("online", () => schedule(0));
    document.addEventListener("visibilitychange", () => {
      if (document.visibilityState === "visible") schedule(0);
    });
    window.addEventListener("focus", () => schedule(0));
    // While the app is open on screen, pick up changes made on other devices.
    setInterval(() => {
      if (user && document.visibilityState === "visible" && !running) schedule(0);
    }, POLL_MS);
    store.onChange(() => schedule(1500));
    Lilac.theme?.onChange((_prefs, fromSync) => { if (!fromSync) schedule(800); });
  }

  // ---------- Sync ----------
  function schedule(ms) {
    clearTimeout(timer);
    if (user) timer = setTimeout(syncNow, ms);
  }

  async function fetchAll() {
    const rows = [];
    for (let from = 0; ; from += 1000) {
      const { data, error } = await client.from(TABLE)
        .select("day, entry, stamp").order("day").range(from, from + 999);
      if (error) throw error;
      rows.push(...data);
      if (data.length < 1000) return rows;
    }
  }

  // Appearance (theme + light/dark) follows the account: the newer choice wins.
  // If the settings table hasn't been created yet, skip quietly so entries still sync.
  async function syncPrefs() {
    if (!Lilac.theme) return;
    const { data, error } = await client.from("lilac_settings").select("prefs, stamp").maybeSingle();
    if (error) {
      if (errorKeyFor(error) === "err.tables" || error.code === "42501") return;
      throw error;
    }
    const local = Lilac.theme.get();
    const remoteStamp = Number(data?.stamp) || 0;
    if (data && remoteStamp > local.stamp) {
      Lilac.theme.set({ ...data.prefs, stamp: remoteStamp }, true);
    } else if (local.stamp > remoteStamp) {
      const { error: upErr } = await client.from("lilac_settings").upsert({
        user_id: user.id,
        prefs: { theme: local.theme, mode: local.mode },
        stamp: local.stamp,
        updated_at: new Date().toISOString(),
      }, { onConflict: "user_id" });
      if (upErr && errorKeyFor(upErr) !== "err.tables") throw upErr;
    }
  }

  async function syncNow() {
    if (!client || !user) return;
    if (running) { again = true; return running; }
    if (!navigator.onLine) return set("offline", "err.offline");

    running = (async () => {
      set("syncing");
      try {
        const remote = new Map();
        for (const row of await fetchAll()) remote.set(row.day, { entry: row.entry, stamp: Number(row.stamp) });

        const stamps = store.stamps();
        const days = store.all();
        const pulls = [];
        for (const [date, rec] of remote) {
          if (rec.stamp > (stamps[date] || 0)) pulls.push({ date, entry: rec.entry, stamp: rec.stamp });
        }
        const pushes = [];
        for (const [date, stamp] of Object.entries(stamps)) {
          const rec = remote.get(date);
          if (!rec || stamp > rec.stamp) {
            pushes.push({ user_id: user.id, day: date, entry: days[date] || null, stamp, updated_at: new Date().toISOString() });
          }
        }

        if (pulls.length) {
          store.applyRemote(pulls);
          Lilac.render?.();
        }
        for (let i = 0; i < pushes.length; i += 500) {
          const { error } = await client.from(TABLE).upsert(pushes.slice(i, i + 500), { onConflict: "user_id,day" });
          if (error) throw error;
        }
        await syncPrefs();
        lastSynced = new Date();
        set("synced");
      } catch (e) {
        const key = navigator.onLine ? errorKeyFor(e) : "err.offline";
        set(navigator.onLine ? "error" : "offline", key || (e.message || String(e)));
      } finally {
        running = null;
        if (again) { again = false; schedule(0); }
      }
    })();
    return running;
  }

  return {
    init, checkUsername, signIn, signUp, signOut, syncNow, info,
    onStatus: (fn) => listeners.push(fn),
  };
})();
