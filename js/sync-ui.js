// Sync status button and the sign-in dialog.
(() => {
  const sync = Lilac.sync;
  const t = (k, v) => Lilac.i18n.t(k, v);
  const $ = (id) => document.getElementById(id);
  const chip = $("sync-chip");
  const note = $("storage-note");
  const dialog = $("sync-dialog");
  const body = $("sync-body");
  let mode = "signin"; // "signin" | "create"

  const CHIP = {
    unconfigured: "chip.off", "signed-out": "chip.off",
    idle: "chip.synced", syncing: "chip.syncing", synced: "chip.synced", offline: "chip.offline", error: "chip.error",
  };
  const isOn = (s) => ["idle", "syncing", "synced", "offline", "error"].includes(s);
  const errorText = (key) => (key.startsWith("err.") ? t(key) : key);

  function el(tag, attrs = {}, text) {
    const node = document.createElement(tag);
    for (const [k, v] of Object.entries(attrs)) {
      if (k === "class") node.className = v;
      else node.setAttribute(k, v);
    }
    if (text != null) node.textContent = text;
    return node;
  }

  function ago(date) {
    const secs = Math.round((Date.now() - date) / 1000);
    if (secs < 60) return t("sync.justNow");
    const mins = Math.round(secs / 60);
    if (mins < 60) return t("sync.minAgo", { n: mins });
    return date.toLocaleTimeString(Lilac.i18n.locale(), { hour: "numeric", minute: "2-digit" });
  }

  function paintChip(i) {
    chip.textContent = t(CHIP[i.status] || "chip.off");
    chip.dataset.state = i.status;
    note.textContent = t(isOn(i.status) ? "storage.synced" : "storage.local");
  }

  // A small form helper: fields, a submit label, and an async action that may throw.
  function form({ intro, fields, submit, action }) {
    const f = el("form", { class: "sync-form", novalidate: "" });
    if (intro) f.appendChild(el("p", {}, intro));
    for (const fd of fields) {
      const label = el("label", { class: "field" });
      label.appendChild(el("span", {}, fd.label));
      label.appendChild(el("input", {
        name: fd.name, type: fd.type, autocomplete: fd.autocomplete, required: "",
        autocapitalize: "none", spellcheck: "false",
      }));
      if (fd.help) label.appendChild(el("span", { class: "field-help" }, fd.help));
      f.appendChild(label);
    }
    const error = el("p", { class: "sync-error", role: "alert" });
    const btn = el("button", { class: "btn btn-primary", type: "submit" }, submit);
    const foot = el("div", { class: "sync-actions" });
    foot.appendChild(btn);
    f.append(error, foot);
    f.addEventListener("submit", async (ev) => {
      ev.preventDefault();
      error.textContent = "";
      btn.disabled = true;
      btn.textContent = t("sync.working");
      try {
        await action(Object.fromEntries(new FormData(f)));
      } catch (e) {
        error.textContent = e.message || String(e);
      } finally {
        btn.disabled = false;
        btn.textContent = submit;
      }
    });
    return f;
  }

  function switcher(label, to) {
    const b = el("button", { class: "link-btn", type: "button" }, label);
    b.addEventListener("click", () => {
      mode = to;
      paintDialog();
      body.querySelector("input")?.focus();
    });
    return b;
  }

  function paintDialog() {
    const i = sync.info();
    body.replaceChildren();

    if (i.status === "unconfigured") {
      body.append(el("p", {}, t("sync.unconfigured1")), el("p", {}, t("sync.unconfigured2")));
      return;
    }

    if (i.status === "signed-out") {
      if (mode === "create") {
        body.append(form({
          intro: t("sync.createIntro"),
          fields: [
            { name: "username", label: t("sync.username"), type: "text", autocomplete: "username", help: t("sync.usernameHelp") },
            { name: "password", label: t("sync.password"), type: "password", autocomplete: "new-password", help: t("sync.passwordHelp") },
            { name: "confirm", label: t("sync.confirm"), type: "password", autocomplete: "new-password" },
          ],
          submit: t("sync.create"),
          action: async ({ username, password, confirm }) => {
            const u = sync.checkUsername(username);
            if (password.length < 8) throw new Error(t("err.passwordShort"));
            if (password !== confirm) throw new Error(t("err.passwordMismatch"));
            await sync.signUp(u, password);
            mode = "signin";
          },
        }), switcher(t("sync.haveAccount"), "signin"));
        return;
      }
      body.append(form({
        intro: t("sync.signInIntro"),
        fields: [
          { name: "username", label: t("sync.username"), type: "text", autocomplete: "username" },
          { name: "password", label: t("sync.password"), type: "password", autocomplete: "current-password" },
        ],
        submit: t("sync.signIn"),
        action: async ({ username, password }) => { await sync.signIn(sync.checkUsername(username), password); },
      }), switcher(t("sync.createLink"), "create"));
      return;
    }

    // Signed in
    const line = i.status === "syncing" ? t("sync.syncingNow")
      : i.status === "offline" || i.status === "error" ? errorText(i.errorKey)
      : i.lastSynced ? t("sync.lastSynced", { when: ago(i.lastSynced) }) : t("sync.ready");
    body.append(
      el("p", {}, t("sync.signedInAs", { name: i.name })),
      el("p", { class: i.status === "error" ? "sync-error" : "muted" }, line),
      el("p", { class: "muted" }, t("sync.auto")),
    );
    const actions = el("div", { class: "sync-actions" });
    const out = el("button", { class: "btn btn-quiet", type: "button" }, t("sync.signOut"));
    out.addEventListener("click", async () => {
      if (!confirm(t("sync.signOutConfirm"))) return;
      await sync.signOut();
    });
    actions.append(out);
    body.appendChild(actions);
  }

  chip.addEventListener("click", () => {
    paintDialog();
    dialog.showModal();
  });

  let lastStatus = null;
  sync.onStatus((i) => {
    paintChip(i);
    // Repaint the dialog when the status changes, but not while someone is typing in it.
    // Just signed in: close the dialog; syncing carries on by itself.
    if (dialog.open && lastStatus === "signed-out" && i.status === "idle") dialog.close();
    else if (dialog.open && i.status !== lastStatus) paintDialog();
    lastStatus = i.status;
  });

  Lilac.i18n.onChange(() => {
    paintChip(sync.info());
    if (dialog.open) paintDialog();
  });

  paintChip(sync.info());
  sync.init();
})();
