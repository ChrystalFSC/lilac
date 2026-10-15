// Cycle maths: turns logged days into periods, cycles and an estimate of the next period.
//
// Method (the calendar method): next start = last start + average of up to the last
// 6 cycle lengths. The estimate is shown as a window of ± the standard deviation
// (at least 2 days), because real cycles vary: in a study of 612,613 cycles only 13%
// were exactly 28 days and the mean was 29.3 days (Bull et al., npj Digit Med 2019).
window.Lilac = window.Lilac || {};

Lilac.cycle = (() => {
  const D = Lilac.dates;
  const PERIOD_FLOWS = ["light", "medium", "heavy"];
  const MAX_GAP = 2;          // days of no bleeding still treated as the same period
  const RECENT = 6;           // cycles used for the average
  const DEFAULT_CYCLE = 28;   // NHS (irregular periods): the average cycle is about 28 days
  const DEFAULT_PERIOD = 5;   // NHS: bleeding lasts 2–7 days, about 5 days is typical

  const mean = (xs) => xs.reduce((a, b) => a + b, 0) / xs.length;
  const sd = (xs) => {
    if (xs.length < 2) return 0;
    const m = mean(xs);
    return Math.sqrt(xs.reduce((a, x) => a + (x - m) ** 2, 0) / (xs.length - 1));
  };

  function groupPeriods(days, todayKey) {
    const keys = Object.keys(days)
      .filter((k) => k <= todayKey && PERIOD_FLOWS.includes(days[k].flow))
      .sort();
    const periods = [];
    for (const k of keys) {
      const last = periods[periods.length - 1];
      if (last && D.diff(last.end, k) <= MAX_GAP + 1) last.end = k;
      else periods.push({ start: k, end: k });
    }
    periods.forEach((p) => { p.length = D.diff(p.start, p.end) + 1; });
    return periods;
  }

  function analyze(days, todayKey = D.today()) {
    const periods = groupPeriods(days, todayKey);
    const cycles = [];
    for (let i = 1; i < periods.length; i++) {
      cycles.push({
        start: periods[i - 1].start,
        length: D.diff(periods[i - 1].start, periods[i].start),
        periodLength: periods[i - 1].length,
      });
    }

    const result = {
      today: todayKey, periods, cycles,
      hasData: periods.length > 0,
      basis: "none", usedCycles: 0,
      avgCycle: DEFAULT_CYCLE, avgPeriod: DEFAULT_PERIOD, spread: 4,
    };
    if (!periods.length) return result;

    // Gaps over 60 days are more likely a missed log than a cycle; leave them out of the average.
    const usable = cycles.filter((c) => c.length >= 15 && c.length <= 60).slice(-RECENT);
    if (usable.length) {
      const lens = usable.map((c) => c.length);
      result.avgCycle = mean(lens);
      result.spread = usable.length >= 3 ? Math.max(2, Math.ceil(sd(lens))) : 3;
      result.basis = "history";
      result.usedCycles = usable.length;
    } else {
      result.basis = "default";
    }
    const finished = periods.filter((p) => D.diff(p.end, todayKey) > MAX_GAP).slice(-RECENT);
    if (finished.length) result.avgPeriod = mean(finished.map((p) => p.length));
    result.periodMeasured = finished.length > 0;

    const last = periods[periods.length - 1];
    const cycleLen = Math.round(result.avgCycle);
    const periodLen = Math.round(result.avgPeriod);

    result.lastPeriod = last;
    result.cycleDay = D.diff(last.start, todayKey) + 1;
    result.nextStart = D.addDays(last.start, cycleLen);
    result.windowStart = D.addDays(result.nextStart, -result.spread);
    result.windowEnd = D.addDays(result.nextStart, result.spread);
    result.daysUntil = D.diff(todayKey, result.nextStart);
    result.daysLate = Math.max(0, D.diff(result.windowEnd, todayKey));
    result.inPeriod = D.diff(last.end, todayKey) <= 1 && result.cycleDay <= 10;

    if (result.inPeriod) result.phase = "period";
    else if (result.daysLate > 0) result.phase = "late";
    else if (result.daysUntil <= 7) result.phase = "premenstrual";
    else result.phase = "between";

    // Estimated period days for the next three cycles (calendar shading).
    // While late, the estimate rolls forward to start tomorrow rather than sit in the past.
    result.predicted = new Set();
    let start = result.daysLate > 0 ? D.addDays(todayKey, 1) : result.nextStart;
    for (let n = 0; n < 3; n++) {
      for (let i = 0; i < periodLen; i++) {
        const k = D.addDays(start, i);
        if (k > todayKey) result.predicted.add(k);
      }
      start = D.addDays(start, cycleLen);
    }
    return result;
  }

  return { analyze, PERIOD_FLOWS };
})();
