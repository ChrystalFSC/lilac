// Colour theme and light/dark choice. Loaded in <head> so the saved theme is applied
// before the page is first drawn. Preferences carry a "stamp" so sync keeps the newest.
window.Lilac = window.Lilac || {};

Lilac.theme = (() => {
  const KEY = "lilac.prefs";
  const THEMES = ["lilac", "rose", "peach", "mint", "ocean"];
  const MODES = ["auto", "light", "dark"];
  const root = document.documentElement;
  const media = window.matchMedia("(prefers-color-scheme: dark)");
  const listeners = [];

  function clean(p) {
    return {
      theme: THEMES.includes(p?.theme) ? p.theme : "lilac",
      mode: MODES.includes(p?.mode) ? p.mode : "auto",
      stamp: Number(p?.stamp) || 0,
    };
  }

  let prefs = clean(null);
  try { prefs = clean(JSON.parse(localStorage.getItem(KEY))); } catch (e) { /* defaults */ }

  function scheme() {
    return prefs.mode === "auto" ? (media.matches ? "dark" : "light") : prefs.mode;
  }

  function apply(animate) {
    if (animate && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      root.classList.add("theme-anim");
      setTimeout(() => root.classList.remove("theme-anim"), 400);
    }
    root.dataset.theme = prefs.theme;
    root.dataset.scheme = scheme();
    // Browser bar colour on phones follows the page background.
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute("content", getComputedStyle(root).getPropertyValue("--bg").trim() || "#F6F0FF");
  }

  // fromSync: a newer choice arrived from another device; keep its stamp and don't sync it back.
  function set(next, fromSync = false) {
    const merged = clean({ ...prefs, ...next, stamp: fromSync ? next.stamp : Date.now() });
    if (merged.theme === prefs.theme && merged.mode === prefs.mode && merged.stamp === prefs.stamp) return;
    prefs = merged;
    try { localStorage.setItem(KEY, JSON.stringify(prefs)); } catch (e) { /* not remembered */ }
    apply(true);
    listeners.forEach((fn) => fn(prefs, fromSync));
  }

  media.addEventListener("change", () => { if (prefs.mode === "auto") apply(true); });
  apply(false);
  window.addEventListener("load", () => apply(false));

  return {
    THEMES, MODES, set,
    get: () => ({ ...prefs }),
    onChange: (fn) => listeners.push(fn),
  };
})();
