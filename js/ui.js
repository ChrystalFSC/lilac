// Rendering and interaction.
(() => {
  const D = Lilac.dates;
  const store = Lilac.store;
  const t = (k, v) => Lilac.i18n.t(k, v);
  const $ = (id) => document.getElementById(id);
  const SVG = "http://www.w3.org/2000/svg";
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  let viewMonth = (() => { const d = new Date(); return new Date(d.getFullYear(), d.getMonth(), 1); })();
  let editingKey = null;
  let firstPaint = true;
  let noneTapped = null; // "None" for today leaves no record, so remember the tap for this visit
  let lastAnalysis = null;

  const BLANK = { flow: "none", pain: "none", clots: false, soaked: false, leaked: false, painkillersFailed: false, symptoms: [], note: "" };

  function el(tag, attrs = {}, text) {
    const node = document.createElement(tag);
    for (const [k, v] of Object.entries(attrs)) {
      if (k === "class") node.className = v;
      else node.setAttribute(k, v);
    }
    if (text != null) node.textContent = text;
    return node;
  }

  function svg(tag, attrs = {}) {
    const node = document.createElementNS(SVG, tag);
    for (const [k, v] of Object.entries(attrs)) node.setAttribute(k, v);
    return node;
  }

  function icon(id, cls = "ic") {
    const s = svg("svg", { class: cls, "aria-hidden": "true" });
    s.appendChild(svg("use", { href: `#${id}` }));
    return s;
  }

  // ---------- Greeting ----------
  function renderGreeting() {
    const h = new Date().getHours();
    const key = h < 12 ? "greet.morning" : h < 18 ? "greet.afternoon" : "greet.evening";
    const name = Lilac.sync?.info().name || "";
    const g = $("greeting");
    g.replaceChildren(icon("i-sparkle"), document.createTextNode(t(key, { name })));
  }

  // ---------- Dial ----------
  // A progress ring: lilac-to-rose for days so far, rose for the period,
  // a soft rose band where the next period is expected, and a pearl for today.
  function renderDial(a) {
    const root = $("dial");
    root.replaceChildren();
    const C = 160, R = 132;

    const defs = svg("defs");
    defs.innerHTML = `
      <linearGradient id="cycleGrad" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stop-color="#9A7CE6"/><stop offset="0.55" stop-color="#C07ACB"/><stop offset="1" stop-color="#EE8FB2"/>
      </linearGradient>
      <linearGradient id="periodGrad" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stop-color="#E46E9A"/><stop offset="1" stop-color="#B23A68"/>
      </linearGradient>
      <radialGradient id="faceGrad" cx="0.5" cy="0.35" r="0.75">
        <stop offset="0" style="stop-color:var(--card-solid)"/><stop offset="1" style="stop-color:var(--lilac-soft)"/>
      </radialGradient>`;
    root.appendChild(defs);

    const cycleLen = Math.round(a.avgCycle);
    const total = a.hasData ? Math.max(cycleLen + a.spread + 1, a.cycleDay) : 28;
    const deg = (dayPos) => (dayPos / total) * 360; // dayPos 0 = start of day 1
    const pt = (r, d) => {
      const rad = (d - 90) * Math.PI / 180;
      return [C + r * Math.cos(rad), C + r * Math.sin(rad)];
    };
    const arc = (from, to, cls) => {
      const a0 = deg(from), a1 = Math.min(deg(to), a0 + 359.5);
      const [x0, y0] = pt(R, a0), [x1, y1] = pt(R, a1);
      const p = svg("path", {
        d: `M ${x0} ${y0} A ${R} ${R} 0 ${a1 - a0 > 180 ? 1 : 0} 1 ${x1} ${y1}`,
        class: `dial-arc ${cls}`, pathLength: "1",
      });
      root.appendChild(p);
      return p;
    };

    root.appendChild(svg("circle", { cx: C, cy: C, r: R, class: "dial-track" }));
    root.appendChild(svg("circle", { cx: C, cy: C, r: 112, fill: "url(#faceGrad)" }));
    root.appendChild(svg("circle", { cx: C, cy: C, r: 112, class: "dial-face-edge" }));

    if (a.hasData) {
      arc(cycleLen - a.spread, cycleLen + 1 + a.spread, "window");
      const todayPos = a.cycleDay - 0.5;
      const animate = firstPaint && !reduceMotion ? " draw" : "";
      if (todayPos > 0.05) arc(0.05, todayPos, "elapsed" + animate).setAttribute("stroke", "url(#cycleGrad)");
      const periodEnd = Math.min(a.lastPeriod.length, a.cycleDay) - 0.5;
      if (periodEnd > 0.05) arc(0.05, periodEnd, "period" + animate).setAttribute("stroke", "url(#periodGrad)");
    }

    for (let day = 1; day <= total; day++) {
      const [x, y] = pt(R, deg(day - 0.5));
      root.appendChild(svg("circle", { cx: x, cy: y, r: 1.6, class: "dial-dot" }));
    }

    if (a.hasData) {
      const [x, y] = pt(R, deg(a.cycleDay - 0.5));
      root.appendChild(svg("circle", { cx: x, cy: y, r: 16, class: "dial-halo" }));
      root.appendChild(svg("circle", { cx: x, cy: y, r: 11, class: "dial-pearl" }));
      root.appendChild(svg("circle", { cx: x, cy: y, r: 4, class: "dial-pearl-core" }));
    }

    const phase = svg("text", { x: C, y: C - 48, class: "dial-phase", "text-anchor": "middle" });
    const big = svg("text", { x: C, y: C + 30, class: "dial-day", "text-anchor": "middle" });
    const sub = svg("text", { x: C, y: C + 58, class: "dial-sub", "text-anchor": "middle" });
    if (a.hasData) {
      phase.textContent = t(`phase.${a.phase}`);
      big.textContent = a.cycleDay;
      sub.textContent = t("dial.of", { n: cycleLen });
    } else {
      phase.textContent = t("dial.empty");
      sub.textContent = t("dial.emptySub");
      root.appendChild(svg("use", { href: "#i-sparkle", x: C - 26, y: C - 34, width: 52, height: 52, class: "dial-empty-ic" }));
    }
    root.append(phase, big, sub);

    $("dial-label").textContent = a.hasData
      ? t("dial.label", { day: a.cycleDay, n: cycleLen, from: D.short(a.windowStart), to: D.short(a.windowEnd) })
      : t("dial.labelEmpty");
  }

  // ---------- Status ----------
  function renderStatus(a) {
    const box = $("status");
    box.replaceChildren();

    if (!a.hasData) {
      box.append(
        el("p", { class: "eyebrow" }, t("status.welcome")),
        el("h1", { class: "headline", id: "status-heading" }, t("status.welcomeHeadline")),
        el("p", { class: "lede" }, t("status.welcomeLede")),
      );
      return;
    }

    let eyebrow, headline, lede;
    const range = `${D.short(a.windowStart)} – ${D.short(a.windowEnd)}`;
    const basis = a.basis === "history"
      ? t("status.basisHistory", { n: a.usedCycles, avg: a.avgCycle.toFixed(1) })
      : t("status.basisDefault");

    if (a.phase === "period") {
      eyebrow = t("status.period");
      headline = t("status.periodHeadline", { n: a.cycleDay });
      lede = t("status.periodLede", { n: Math.round(a.avgPeriod), range });
    } else if (a.phase === "late") {
      eyebrow = t("status.late");
      headline = t("status.lateHeadline", { n: a.daysLate });
      lede = t("status.lateLede", { range });
    } else {
      eyebrow = t(a.daysUntil <= 0 ? "status.anyDay" : "status.next");
      headline = range;
      lede = a.daysUntil > 0 ? t("status.inDays", { n: a.daysUntil, basis }) : basis;
    }

    box.append(
      el("p", { class: "eyebrow" }, eyebrow),
      el("h1", { class: "headline", id: "status-heading" }, headline),
      el("p", { class: "lede" }, lede),
    );
    if (a.phase === "period" || a.phase === "late") box.append(el("p", { class: "basis" }, basis));

    if (a.phase !== "late" && a.daysUntil > 1) {
      const remind = el("button", { class: "soft-btn remind", type: "button" });
      remind.append(icon("i-bell"), el("span", {}, t("remind.button")));
      remind.addEventListener("click", () => downloadReminder(a));
      box.append(remind);
    }
  }

  // ---------- Calendar reminder (.ics) ----------
  function downloadReminder(a) {
    const ymd = (k) => k.replace(/-/g, "");
    const esc = (s) => s.replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/,/g, "\\,").replace(/\n/g, "\\n");
    const stamp = new Date().toISOString().replace(/[-:]/g, "").replace(/\.\d+Z$/, "Z");
    const summary = esc(t("ics.summary"));
    const ics = [
      "BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//Lilac//Period tracker//EN", "CALSCALE:GREGORIAN",
      "BEGIN:VEVENT",
      `UID:lilac-${ymd(a.windowStart)}@lilac`,
      `DTSTAMP:${stamp}`,
      `DTSTART;VALUE=DATE:${ymd(a.windowStart)}`,
      `DTEND;VALUE=DATE:${ymd(D.addDays(a.windowStart, 1))}`,
      `SUMMARY:${summary}`,
      `DESCRIPTION:${esc(t("ics.description", { from: D.short(a.windowStart), to: D.short(a.windowEnd) }))}`,
      "BEGIN:VALARM", "ACTION:DISPLAY", `DESCRIPTION:${summary}`, "TRIGGER:-PT15H", "END:VALARM",
      "END:VEVENT", "END:VCALENDAR",
    ].join("\r\n");
    const blob = new Blob([ics], { type: "text/calendar" });
    const link = el("a", { href: URL.createObjectURL(blob), download: "lilac-reminder.ics" });
    document.body.appendChild(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(link.href), 1000);
    toast(t("remind.done"));
  }

  // ---------- Check-in ----------
  function renderCheckin() {
    const today = D.today();
    const entry = store.getDay(today);
    const current = entry ? entry.flow : (noneTapped === today ? "none" : null);
    document.querySelectorAll(".flow-btn").forEach((b) => {
      b.setAttribute("aria-pressed", String(b.dataset.flow === current));
    });
  }

  document.querySelectorAll(".flow-btn").forEach((b) => {
    b.addEventListener("click", () => {
      const today = D.today();
      const flow = b.dataset.flow;
      const existing = store.getDay(today) || BLANK;
      if (flow === "none") noneTapped = today;
      const ok = store.setDay(today, { ...BLANK, ...existing, flow });
      if (!ok) { alert(t("alert.saveFailed")); return; }
      render();
      toast(t("toast.savedToday"));
      if (flow !== "none") petals(b);
    });
  });

  // ---------- Stats ----------
  function renderStats(a) {
    const box = $("stats");
    box.replaceChildren();
    const days = (n) => [String(n), t("unit.days", { n })];
    const tiles = [
      { ic: "i-loop", label: t("stats.cycle"), value: a.basis === "history" ? days(Math.round(a.avgCycle)) : null },
      { ic: "i-drop", label: t("stats.period"), value: a.periodMeasured ? days(Math.round(a.avgPeriod)) : null },
      { ic: "i-calendar", label: t("stats.recorded"), value: [String(a.cycles.length), ""] },
      {
        ic: "i-moon", label: t("stats.next"),
        value: !a.hasData ? null
          : a.phase === "late" ? [t("stats.late"), ""]
          : a.daysUntil <= 0 ? [t("stats.anyDay"), ""]
          : days(a.daysUntil),
      },
    ];
    tiles.forEach((s, i) => {
      const card = el("div", { class: "card stat" });
      if (firstPaint && !reduceMotion) { card.classList.add("rise"); card.style.animationDelay = `${200 + i * 70}ms`; }
      const ic = el("span", { class: "stat-ic" });
      ic.appendChild(icon(s.ic));
      const value = el("p", { class: "stat-value" });
      if (s.value) {
        value.textContent = s.value[0];
        if (s.value[1]) value.appendChild(el("small", {}, s.value[1]));
      } else {
        value.textContent = "–";
      }
      card.append(ic, value, el("p", { class: "stat-label" }, s.label));
      box.appendChild(card);
    });
  }

  // ---------- Calendar ----------
  function renderCalendar(a) {
    const grid = $("days");
    grid.replaceChildren();
    $("month-label").textContent = D.month(viewMonth);
    $("weekdays").replaceChildren(...D.weekdays().map((w) => el("span", {}, w)));

    const days = store.all();
    const periodSet = new Set();
    for (const p of a.periods) {
      for (let i = 0; i < p.length; i++) periodSet.add(D.addDays(p.start, i));
    }

    const first = new Date(viewMonth);
    const lead = (first.getDay() + 6) % 7; // Monday-first
    const inMonth = new Date(first.getFullYear(), first.getMonth() + 1, 0).getDate();
    const cells = Math.ceil((lead + inMonth) / 7) * 7;
    const start = D.addDays(D.toKey(first), -lead);

    let row;
    for (let i = 0; i < cells; i++) {
      if (i % 7 === 0) { row = el("div", { role: "row", class: "week" }); grid.appendChild(row); }
      const key = D.addDays(start, i);
      const entry = days[key];
      const outside = D.fromKey(key).getMonth() !== first.getMonth();
      const future = key > a.today;
      const classes = ["day"];
      if (outside) classes.push("is-outside");
      if (key === a.today) classes.push("is-today");
      if (entry && Lilac.cycle.PERIOD_FLOWS.includes(entry.flow)) classes.push("is-period", `flow-${entry.flow}`);
      else if (periodSet.has(key)) classes.push("is-period", "flow-gap");
      else if (entry?.flow === "spotting") classes.push("is-spotting");
      if (a.predicted?.has(key)) classes.push("is-predicted");

      const btn = el("button", { type: "button", class: classes.join(" "), role: "gridcell" });
      btn.dataset.key = key;
      if (key === a.today) btn.dataset.today = "";
      if (future) btn.disabled = true;

      const parts = [D.long(key)];
      if (entry && entry.flow !== "none") parts.push(t("cal.bleeding", { flow: t(`flow.${entry.flow}`) }));
      if (a.predicted?.has(key)) parts.push(t("cal.estimated"));
      if (key === a.today) parts.push(t("cal.today"));
      btn.setAttribute("aria-label", parts.join(", "));

      btn.appendChild(el("span", { class: "num" }, D.fromKey(key).getDate()));
      if (entry && (entry.pain !== "none" || entry.symptoms.length || entry.note)) {
        btn.appendChild(el("span", { class: "mark", "aria-hidden": "true" }));
      }
      btn.addEventListener("click", () => openDay(key));
      row.appendChild(btn);
    }
  }

  // ---------- Guidance ----------
  function renderGuidance(a) {
    const list = $("guidance");
    list.replaceChildren();
    for (const g of Lilac.guidance.build(a, store.all())) {
      const li = el("li", { class: g.flag ? "guide guide-flag" : "guide" });
      const ic = el("span", { class: "guide-ic" });
      ic.appendChild(icon(g.flag ? "i-heart" : "i-leaf"));
      li.appendChild(ic);
      if (g.flag) li.appendChild(el("p", { class: "guide-tag" }, t("guide.flag")));
      li.append(el("h3", {}, g.title), el("p", {}, g.body));
      li.appendChild(el("a", { href: g.source.url, target: "_blank", rel: "noopener noreferrer", class: "source" },
        t("guide.source", { label: g.source.label })));
      list.appendChild(li);
    }
  }

  // ---------- History ----------
  function renderHistory(a) {
    const list = $("history");
    list.replaceChildren();
    if (!a.cycles.length) {
      list.appendChild(el("li", { class: "history-empty" }, t(a.hasData ? "history.waiting" : "history.empty")));
      return;
    }
    const SCALE = 50; // days shown across the bar
    for (const c of a.cycles.slice().reverse().slice(0, 12)) {
      const li = el("li", { class: "cycle-row" });
      const out = c.length < 21 || c.length > 35;
      li.append(
        el("span", { class: "cycle-date" }, D.withYear(c.start)),
        el("span", { class: `cycle-len${out ? " is-out" : ""}` }, t("history.days", { n: c.length })),
      );
      const bar = el("span", { class: "bar", "aria-hidden": "true" });
      const band = el("span", { class: "bar-band" });
      band.style.left = `${(21 / SCALE) * 100}%`;
      band.style.width = `${(14 / SCALE) * 100}%`;
      const bleed = el("span", { class: "bar-bleed" });
      bleed.style.width = `${Math.min(c.periodLength, SCALE) / SCALE * 100}%`;
      const fill = el("span", { class: "bar-fill" });
      fill.style.width = `${Math.min(c.length, SCALE) / SCALE * 100}%`;
      bar.append(band, fill, bleed);
      li.append(bar, el("span", { class: "cycle-bleed" }, t("history.period", { n: c.periodLength })));
      list.appendChild(li);
    }
  }

  // ---------- Toast + petals ----------
  let toastTimer = null;
  function toast(text) {
    const box = $("toast");
    box.replaceChildren(icon("i-sparkle"), document.createTextNode(text));
    box.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => box.classList.remove("show"), 2200);
  }

  function petals(from) {
    if (reduceMotion) return;
    const layer = $("petals");
    const r = from.getBoundingClientRect();
    const cx = r.left + r.width / 2, cy = r.top + r.height / 2;
    for (let i = 0; i < 12; i++) {
      const p = el("span", { class: "petal" });
      const angle = (Math.PI * 2 * i) / 12 + Math.random() * 0.4;
      const dist = 50 + Math.random() * 50;
      p.style.left = `${cx - 6}px`;
      p.style.top = `${cy - 8}px`;
      p.style.setProperty("--dx", `${Math.cos(angle) * dist}px`);
      p.style.setProperty("--dy", `${Math.sin(angle) * dist - 20}px`);
      p.style.setProperty("--rot", `${Math.random() * 360}deg`);
      layer.appendChild(p);
      setTimeout(() => p.remove(), 950);
    }
  }

  // ---------- Day dialog ----------
  const dialog = $("day-dialog");
  const form = $("day-form");

  function openDay(key) {
    editingKey = key;
    const e = store.getDay(key) || {};
    $("day-title").textContent = D.long(key);
    form.flow.value = e.flow || "none";
    form.pain.value = e.pain || "none";
    for (const name of ["clots", "soaked", "leaked", "painkillersFailed"]) form[name].checked = !!e[name];
    const syms = new Set(e.symptoms || []);
    form.querySelectorAll('input[name="symptoms"]').forEach((cb) => { cb.checked = syms.has(cb.value); });
    form.note.value = e.note || "";
    dialog.showModal();
  }

  dialog.addEventListener("close", () => {
    if (dialog.returnValue === "save" && editingKey) {
      const ok = store.setDay(editingKey, {
        flow: form.flow.value,
        pain: form.pain.value,
        clots: form.clots.checked,
        soaked: form.soaked.checked,
        leaked: form.leaked.checked,
        painkillersFailed: form.painkillersFailed.checked,
        symptoms: [...form.querySelectorAll('input[name="symptoms"]:checked')].map((cb) => cb.value),
        note: form.note.value.trim(),
      });
      if (!ok) alert(t("alert.saveFailed"));
      else toast(t("toast.saved"));
      render();
    }
    const cell = $("days").querySelector(`[data-key="${editingKey}"]`);
    editingKey = null;
    cell?.focus();
  });

  $("clear-day").addEventListener("click", () => {
    if (editingKey) store.clearDay(editingKey);
    dialog.close("cleared");
    render();
  });

  // ---------- Controls ----------
  $("checkin-more").addEventListener("click", () => openDay(D.today()));
  $("prev-month").addEventListener("click", () => { viewMonth.setMonth(viewMonth.getMonth() - 1); render(); });
  $("next-month").addEventListener("click", () => { viewMonth.setMonth(viewMonth.getMonth() + 1); render(); });

  $("export").addEventListener("click", () => {
    const blob = new Blob([store.exportJSON()], { type: "application/json" });
    const a = el("a", { href: URL.createObjectURL(blob), download: `lilac-${D.today()}.json` });
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  });

  $("import-file").addEventListener("change", async (ev) => {
    const file = ev.target.files[0];
    ev.target.value = "";
    if (!file) return;
    if (!confirm(t("confirm.import"))) return;
    try {
      store.importJSON(await file.text());
      render();
    } catch (err) {
      alert(t("alert.importFailed"));
    }
  });

  $("wipe").addEventListener("click", () => {
    const synced = Lilac.sync.info().status !== "unconfigured" && Lilac.sync.info().status !== "signed-out";
    if (!confirm(t(synced ? "confirm.wipeSynced" : "confirm.wipe"))) return;
    store.wipe();
    render();
  });

  // ---------- Language ----------
  $("lang-toggle").addEventListener("click", () => {
    Lilac.i18n.setLang(Lilac.i18n.lang() === "zh" ? "en" : "zh");
  });
  Lilac.i18n.onChange(() => {
    render();
    if (editingKey) $("day-title").textContent = D.long(editingKey);
  });
  Lilac.sync?.onStatus(() => renderGreeting());

  // ---------- Render ----------
  function render() {
    const a = Lilac.cycle.analyze(store.all());
    lastAnalysis = a;
    renderGreeting();
    renderDial(a);
    renderStatus(a);
    renderCheckin();
    renderStats(a);
    renderCalendar(a);
    renderGuidance(a);
    renderHistory(a);
    firstPaint = false;
  }

  function entrance() {
    if (reduceMotion) return;
    document.querySelectorAll(".hero-copy, .dial-wrap, .checkin, .grid > .card, .history-panel").forEach((n, i) => {
      n.classList.add("rise");
      n.style.animationDelay = `${i * 90}ms`;
    });
  }

  Lilac.render = render;
  Lilac.i18n.apply();
  store.load();
  entrance();
  render();
})();
