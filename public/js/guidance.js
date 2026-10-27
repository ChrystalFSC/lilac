// Guidance rules. Every message is drawn from the linked source; wording (in js/i18n.js)
// stays close to the source and never goes beyond what it says. Checked against the pages in Oct 2026.
window.Lilac = window.Lilac || {};

Lilac.guidance = (() => {
  const D = Lilac.dates;
  const t = (k, v) => Lilac.i18n.t(k, v);

  const SRC = {
    periods: { label: "NHS · Periods", url: "https://www.nhs.uk/conditions/periods/" },
    irregular: { label: "NHS · Irregular periods", url: "https://www.nhs.uk/conditions/irregular-periods/" },
    heavy: { label: "NHS · Heavy periods", url: "https://www.nhs.uk/conditions/heavy-periods/" },
    pain: { label: "NHS · Period pain", url: "https://www.nhs.uk/conditions/period-pain/" },
    pms: { label: "NHS · PMS", url: "https://www.nhs.uk/conditions/pre-menstrual-syndrome/" },
    missed: { label: "NHS · Stopped or missed periods", url: "https://www.nhs.uk/conditions/stopped-or-missed-periods/" },
    tss: { label: "NHS · Toxic shock syndrome", url: "https://www.nhs.uk/conditions/toxic-shock-syndrome/" },
    bull: { label: "Bull et al., npj Digital Medicine 2019", url: "https://doi.org/10.1038/s41746-019-0152-7" },
    fertility: { label: "NHS · Fertility in the menstrual cycle", url: "https://www.nhs.uk/conditions/periods/fertility-in-the-menstrual-cycle/" },
    cleveland: { label: "Cleveland Clinic · Menstrual cycle", url: "https://my.clevelandclinic.org/health/articles/10132-menstrual-cycle" },
    ovulationPain: { label: "NHS · Ovulation pain", url: "https://www.nhs.uk/conditions/ovulation-pain/" },
    discharge: { label: "NHS · Vaginal discharge", url: "https://www.nhs.uk/conditions/vaginal-discharge/" },
  };

  function recentDays(days, todayKey, n) {
    return Object.entries(days).filter(([k]) => k <= todayKey && D.diff(k, todayKey) < n);
  }

  function build(a, days) {
    const flags = [];
    const tips = [];
    const recent90 = recentDays(days, a.today, 90);

    if (!a.hasData) {
      return [{ title: t("g.welcome.t"), body: t("g.welcome.b"), source: SRC.periods }];
    }

    // --- Things worth checking with a doctor ---
    const outOfRange = a.cycles.slice(-6).filter((c) => c.length < 21 || c.length > 35);
    if (outOfRange.length) {
      flags.push({
        title: outOfRange.length === 1
          ? t("g.irregular.one", { n: outOfRange[0].length })
          : t("g.irregular.many", { n: outOfRange.length }),
        body: t("g.irregular.b"),
        source: SRC.irregular,
      });
    }

    const longPeriods = a.periods.slice(-6).filter((p) => p.length > 7);
    if (longPeriods.length) {
      flags.push({
        title: t("g.long.t", { n: longPeriods[longPeriods.length - 1].length }),
        body: t("g.long.b"),
        source: SRC.irregular,
      });
    }

    const heavySigns = recent90.filter(([, e]) => e.clots || e.soaked || e.leaked);
    const lastHeavyDays = Object.entries(days)
      .filter(([k, e]) => k >= a.lastPeriod.start && k <= a.lastPeriod.end && e.flow === "heavy").length;
    if (heavySigns.length || lastHeavyDays >= 3) {
      flags.push({ title: t("g.heavy.t"), body: t("g.heavy.b"), source: SRC.heavy });
    }

    const severe = recent90.filter(([, e]) => e.pain === "severe");
    if (severe.length) {
      const urgent = severe.some(([, e]) => e.painkillersFailed);
      flags.push({
        title: t(urgent ? "g.painUrgent.t" : "g.pain.t"),
        body: t(urgent ? "g.painUrgent.b" : "g.pain.b"),
        source: SRC.pain,
      });
    }

    const periodDays = new Set();
    for (const p of a.periods) {
      for (let i = -2; i < p.length + 2; i++) periodDays.add(D.addDays(p.start, i));
    }
    const between = recent90.filter(([k, e]) => e.flow === "spotting" && !periodDays.has(k));
    if (between.length) {
      flags.push({ title: t("g.between.t"), body: t("g.between.b"), source: SRC.periods });
    }

    if (a.phase === "late") {
      const missedThree = a.cycleDay > Math.round(a.avgCycle) * 3;
      (missedThree ? flags : tips).push(missedThree
        ? { title: t("g.missed3.t"), body: t("g.missed3.b"), source: SRC.missed }
        : { title: t("g.late.t", { n: a.daysLate }), body: t("g.late.b"), source: SRC.missed });
    }

    // --- Care for where you are in your cycle ---
    if (a.phase === "period") {
      tips.push({ title: t("g.easePain.t"), body: t("g.easePain.b"), source: SRC.pain });
      tips.push({ title: t("g.tss.t"), body: t("g.tss.b"), source: SRC.tss });
    } else if (a.phase === "premenstrual") {
      tips.push({ title: t("g.pms.t"), body: t("g.pms.b"), source: SRC.pms });
    }

    const loggedSymptoms = new Set(recent90.flatMap(([, e]) => e.symptoms || []));
    if (loggedSymptoms.size && a.phase !== "premenstrual") {
      tips.push({ title: t("g.diary.t"), body: t("g.diary.b"), source: SRC.pms });
    }

    if (a.usedCycles < 3) {
      tips.push({
        title: t("g.sharper.t"),
        body: a.basis === "history" ? t("g.sharper.history", { n: a.usedCycles }) : t("g.sharper.default"),
        source: SRC.bull,
      });
    }

    return [...flags.map((f) => ({ ...f, flag: true })), ...tips];
  }

  return { build, SRC };
})();
