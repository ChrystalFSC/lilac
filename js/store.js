// Storage. Data lives in this browser's localStorage. Each day also carries a
// "stamp" (when it last changed, deletions included) so sync can keep the newest version.
window.Lilac = window.Lilac || {};

Lilac.store = (() => {
  const KEY = "lilac.v1";
  let state = { days: {}, stamps: {} };
  const listeners = [];

  function load() {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && typeof parsed.days === "object") {
          state = { days: parsed.days, stamps: parsed.stamps || {} };
          // Data from before sync existed: give old days a stamp so they upload.
          for (const k of Object.keys(state.days)) if (!state.stamps[k]) state.stamps[k] = 1;
        }
      }
    } catch (e) {
      // Storage blocked (private mode, etc.). The app still works for this visit.
    }
    return state;
  }

  function save() {
    try {
      localStorage.setItem(KEY, JSON.stringify(state));
      return true;
    } catch (e) {
      return false;
    }
  }

  function changed() {
    const ok = save();
    listeners.forEach((fn) => fn());
    return ok;
  }

  function getDay(key) {
    return state.days[key] || null;
  }

  function isEmptyEntry(e) {
    return e.flow === "none" && e.pain === "none" && !e.clots && !e.soaked &&
      !e.leaked && !e.painkillersFailed && e.symptoms.length === 0 && !e.note;
  }

  function setDay(key, entry) {
    if (isEmptyEntry(entry)) delete state.days[key];
    else state.days[key] = entry;
    state.stamps[key] = Date.now();
    return changed();
  }

  function clearDay(key) {
    delete state.days[key];
    state.stamps[key] = Date.now();
    return changed();
  }

  function clean(v) {
    return {
      flow: ["none", "spotting", "light", "medium", "heavy"].includes(v.flow) ? v.flow : "none",
      pain: ["none", "mild", "moderate", "severe"].includes(v.pain) ? v.pain : "none",
      clots: !!v.clots, soaked: !!v.soaked, leaked: !!v.leaked, painkillersFailed: !!v.painkillersFailed,
      symptoms: Array.isArray(v.symptoms) ? v.symptoms.filter((s) => typeof s === "string") : [],
      note: typeof v.note === "string" ? v.note.slice(0, 500) : "",
    };
  }

  function exportJSON() {
    return JSON.stringify({ app: "lilac", version: 1, exported: new Date().toISOString(), days: state.days }, null, 2);
  }

  // Replaces everything. Days that disappear are recorded as deleted so other devices follow.
  function importJSON(text) {
    const parsed = JSON.parse(text);
    if (!parsed || typeof parsed.days !== "object") throw new Error("This file doesn't contain Lilac data.");
    const days = {};
    for (const [k, v] of Object.entries(parsed.days)) {
      if (/^\d{4}-\d{2}-\d{2}$/.test(k) && v && typeof v === "object") days[k] = clean(v);
    }
    const now = Date.now();
    for (const k of new Set([...Object.keys(state.days), ...Object.keys(days)])) state.stamps[k] = now;
    state.days = days;
    return changed();
  }

  function wipe() {
    const now = Date.now();
    for (const k of Object.keys(state.days)) state.stamps[k] = now;
    state.days = {};
    return changed();
  }

  // --- Used by sync ---
  function stamps() {
    return { ...state.stamps };
  }

  // Apply newer versions from the server without triggering another upload.
  function applyRemote(records) {
    for (const r of records) {
      if ((state.stamps[r.date] || 0) >= r.stamp) continue; // edited here while syncing
      if (r.entry) state.days[r.date] = clean(r.entry);
      else delete state.days[r.date];
      state.stamps[r.date] = r.stamp;
    }
    save();
  }

  return {
    load, getDay, setDay, clearDay, exportJSON, importJSON, wipe,
    all: () => state.days, stamps, applyRemote,
    onChange: (fn) => listeners.push(fn),
  };
})();
