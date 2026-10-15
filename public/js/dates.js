// Date helpers. Days are stored as local "YYYY-MM-DD" keys so a logged day
// never shifts when the time zone or daylight saving changes.
window.Lilac = window.Lilac || {};

Lilac.dates = (() => {
  const pad = (n) => String(n).padStart(2, "0");

  function toKey(date) {
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
  }

  function fromKey(key) {
    const [y, m, d] = key.split("-").map(Number);
    return new Date(y, m - 1, d);
  }

  function today() {
    return toKey(new Date());
  }

  function addDays(key, n) {
    const d = fromKey(key);
    d.setDate(d.getDate() + n);
    return toKey(d);
  }

  // Whole days from a to b (positive when b is later).
  function diff(a, b) {
    const [ay, am, ad] = a.split("-").map(Number);
    const [by, bm, bd] = b.split("-").map(Number);
    return Math.round((Date.UTC(by, bm - 1, bd) - Date.UTC(ay, am - 1, ad)) / 86400000);
  }

  // Formatters follow the chosen language, and are rebuilt when it changes.
  const cache = {};
  function fmt(name, options) {
    const locale = Lilac.i18n ? Lilac.i18n.locale() : undefined;
    const id = `${locale}|${name}`;
    if (!cache[id]) cache[id] = new Intl.DateTimeFormat(locale, options);
    return cache[id];
  }

  // Weekday names, Monday first.
  function weekdays() {
    const narrow = Lilac.i18n && Lilac.i18n.lang() === "zh";
    const f = fmt(narrow ? "wdN" : "wd", { weekday: narrow ? "narrow" : "short" });
    return [...Array(7)].map((_, i) => f.format(new Date(2024, 0, 1 + i))); // 1 Jan 2024 was a Monday
  }

  return {
    toKey, fromKey, today, addDays, diff,
    weekdays,
    short: (key) => fmt("short", { day: "numeric", month: "short" }).format(fromKey(key)),
    long: (key) => fmt("long", { weekday: "long", day: "numeric", month: "long" }).format(fromKey(key)),
    withYear: (key) => fmt("withYear", { day: "numeric", month: "short", year: "numeric" }).format(fromKey(key)),
    month: (date) => fmt("month", { month: "long", year: "numeric" }).format(date),
  };
})();
