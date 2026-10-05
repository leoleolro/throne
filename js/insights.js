// Analysis: descriptive stats, a composite gut score, and a rule engine that
// explains itself. Every insight carries the evidence that produced it.

import { BRISTOL_BY_TYPE, COLOR_BY_ID, BLOOD_OPTIONS } from './bristol.js';

const DAY = 86400000;
const bloodSeverity = Object.fromEntries(BLOOD_OPTIONS.map((b) => [b.id, b.severity]));

export const dayKey = (d) => {
  const x = new Date(d);
  return `${x.getFullYear()}-${String(x.getMonth() + 1).padStart(2, '0')}-${String(x.getDate()).padStart(2, '0')}`;
};

export const startOfDay = (d) => {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
};

/**
 * Walks back day by day using calendar arithmetic. Subtracting 86400000ms skips
 * a calendar day across a DST transition — `setDate` does not.
 */
function* daysBack(n) {
  const d = startOfDay(new Date());
  for (let i = 0; i < n; i++) {
    yield new Date(d);
    d.setDate(d.getDate() - 1);
  }
}

export function withinDays(entries, days) {
  const cutoff = Date.now() - days * DAY;
  const now = Date.now();
  // An entry dated in the future would otherwise land in every window at once.
  return entries.filter((e) => {
    const t = new Date(e.ts).getTime();
    return Number.isFinite(t) && t >= cutoff && t <= now;
  });
}

const mean = (xs) => (xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : 0);
const pct = (n, d) => (d ? (n / d) * 100 : 0);
const round1 = (n) => Math.round(n * 10) / 10;

/**
 * A day with no entry is ambiguous: you may not have gone, or you may not have
 * logged. Treating both as zero told diligent users the truth and told forgetful
 * users they were constipated. So: explicit "nothing today" marks count as real
 * zeroes, and a run of 3+ unrecorded days is treated as a gap in the record and
 * excluded from the denominator rather than counted as constipation.
 */
export function computeStats(entries, days = 30, { noneDays = [] } = {}) {
  const scoped = withinDays(entries, days);
  const n = scoped.length;
  // One-tap entries carry default symptom values, not observed ones. Averaging
  // them would report comfort nobody actually claimed.
  const reviewed = scoped.filter((e) => !e.quick);
  const bristols = scoped.map((e) => e.bristol);

  const distribution = Array.from({ length: 7 }, (_, i) => ({
    type: i + 1,
    count: scoped.filter((e) => e.bristol === i + 1).length,
  }));

  const byDay = new Map();
  for (const e of scoped) {
    const k = dayKey(e.ts);
    byDay.set(k, (byDay.get(k) || 0) + 1);
  }

  // Walk the window day by day to separate "known zero" from "no record".
  const noneSet = new Set(noneDays);
  const dayRows = [];
  for (const d of daysBack(days)) {
    const key = dayKey(d);
    const count = byDay.get(key) || 0;
    dayRows.push({ key, count, known: count > 0 || noneSet.has(key) });
  }
  const gapKeys = new Set();
  let run = [];
  for (const row of [...dayRows].reverse()) {
    if (row.known) { if (run.length >= 3) run.forEach((k) => gapKeys.add(k)); run = []; }
    else run.push(row.key);
  }
  if (run.length >= 3) run.forEach((k) => gapKeys.add(k));
  const attributedRows = dayRows.filter((r) => !gapKeys.has(r.key));
  const attributedDays = attributedRows.length;

  const hourCounts = Array.from({ length: 24 }, () => 0);
  for (const e of scoped) hourCounts[new Date(e.ts).getHours()]++;

  // Colour defaults to brown on one-tap entries. Counting that as an observation
  // would report a clean bill of health for stools nobody looked at.
  const colorCounts = new Map();
  for (const e of reviewed) colorCounts.set(e.color, (colorCounts.get(e.color) || 0) + 1);

  const tagCounts = new Map();
  for (const e of scoped) for (const t of e.tags) tagCounts.set(t, (tagCounts.get(t) || 0) + 1);

  // Gaps between consecutive movements, in hours.
  const times = scoped.map((e) => new Date(e.ts).getTime()).sort((a, b) => a - b);
  const gaps = times.slice(1).map((t, i) => (t - times[i]) / 3600000);

  return {
    days,
    count: n,
    daysLogged: byDay.size,
    noneDaysCount: dayRows.filter((r) => noneSet.has(r.key) && r.count === 0).length,
    gapDays: gapKeys.size,
    attributedDays,
    attributedRows,
    coverage: days ? attributedDays / days : 0,
    perDay: round1(attributedDays ? n / attributedDays : 0),
    avgBristol: n ? round1(mean(bristols)) : null,
    idealPct: pct(scoped.filter((e) => e.bristol >= 3 && e.bristol <= 5).length, n),
    constipatedPct: pct(scoped.filter((e) => e.bristol <= 2).length, n),
    loosePct: pct(scoped.filter((e) => e.bristol >= 6).length, n),
    normalColorPct: pct(reviewed.filter((e) => COLOR_BY_ID[e.color]?.normal).length, reviewed.length),
    reviewedCount: reviewed.length,
    avgStrain: reviewed.length ? round1(mean(reviewed.map((e) => e.strain))) : null,
    avgPain: reviewed.length ? round1(mean(reviewed.map((e) => e.pain))) : null,
    avgUrgency: reviewed.length ? round1(mean(reviewed.map((e) => e.urgency))) : null,
    avgComplete: reviewed.length ? round1(mean(reviewed.map((e) => e.complete))) : 4,
    bloodCount: scoped.filter((e) => e.blood !== 'none').length,
    mucusCount: scoped.filter((e) => e.mucus).length,
    distribution,
    byDay,
    hourCounts,
    colorCounts,
    tagCounts,
    medianGapH: gaps.length ? round1(median(gaps)) : null,
    longestGapH: gaps.length ? round1(Math.max(...gaps)) : null,
    scoped,
  };
}

function median(xs) {
  const s = [...xs].sort((a, b) => a - b);
  const m = Math.floor(s.length / 2);
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
}

/**
 * How many of the last `days` have any record. Deliberately not a streak: a
 * streak's failure mode is a fabricated entry to protect it, and this log is
 * only worth anything if every row is an observation.
 */
export function loggingCoverage(entries, days = 7, { noneDays = [] } = {}) {
  const keys = new Set(entries.map((e) => dayKey(e.ts)));
  const none = new Set(noneDays);
  let n = 0;
  for (const d of daysBack(days)) {
    const k = dayKey(d);
    if (keys.has(k) || none.has(k)) n++;
  }
  return { logged: n, of: days };
}

/** Consecutive days (ending today or yesterday) with at least one entry. */
export function loggingStreak(entries) {
  if (!entries.length) return 0;
  const keys = new Set(entries.map((e) => dayKey(e.ts)));
  let streak = 0;
  const cursor = startOfDay(new Date());
  if (!keys.has(dayKey(cursor))) cursor.setDate(cursor.getDate() - 1);
  while (keys.has(dayKey(cursor))) {
    streak++;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
}

/**
 * Composite 0–100 gut score over the window. Each part is scored
 * independently so the breakdown tells you what to actually change.
 */
export function gutScore(entries, days = 14, opts = {}) {
  const s = computeStats(entries, days, opts);
  if (s.count < 3) {
    return { score: null, parts: [], reason: `Log at least 3 movements in ${days} days for a score.` };
  }

  const parts = [];

  // Form: share of type 3–5, with a bonus for type 4.
  const fourPct = pct(s.scoped.filter((e) => e.bristol === 4).length, s.count);
  parts.push({
    key: 'form',
    label: 'Form',
    weight: 35,
    value: Math.min(100, s.idealPct * 0.85 + fourPct * 0.3),
    note: `${Math.round(s.idealPct)}% in the healthy 3–5 band`,
  });

  // Frequency and regularity are only meaningful over days we actually have a
  // record for. With too little of the window accounted for, they are dropped
  // rather than guessed — the remaining weights renormalise.
  const perDay = s.attributedDays ? s.count / s.attributedDays : 0;
  const covered = s.coverage >= 0.5 && s.attributedDays >= 5;
  if (covered) {
    parts.push({
      key: 'frequency',
      label: 'Frequency',
      weight: 25,
      value: frequencyScore(perDay),
      note: `${round1(perDay)} per day over ${s.attributedDays} recorded days`,
    });
  }

  // Comfort: strain, pain, urgency, and the feeling of not finishing. Only
  // scored when enough entries actually recorded symptoms — the remaining
  // weights renormalise, so a one-tap logger gets a smaller but honest score
  // rather than a free 100 for comfort they never reported.
  if (s.reviewedCount >= 3) {
    const discomfort = (s.avgStrain + s.avgPain + s.avgUrgency) / 9;   // 0..1
    const incomplete = (5 - s.avgComplete) / 4;                        // 0..1
    parts.push({
      key: 'comfort',
      label: 'Comfort',
      weight: 20,
      value: Math.max(0, 100 - (discomfort * 75 + incomplete * 45)),
      note: `strain ${s.avgStrain}/3 · pain ${s.avgPain}/3`,
    });
  }

  // Colour: share in the normal brown range, with a hard hit for red flags.
  // Gated on reported entries for the same reason as comfort.
  if (s.reviewedCount >= 3) {
    const flagged = s.scoped.filter((e) => ['black', 'red', 'pale'].includes(e.color)).length;
    parts.push({
      key: 'colour',
      label: 'Colour',
      weight: 10,
      value: Math.max(0, s.normalColorPct - flagged * 12),
      note: `${Math.round(s.normalColorPct)}% normal brown of ${s.reviewedCount} recorded`,
    });
  }

  // Regularity: how tightly clustered your daily counts are.
  if (covered) {
    parts.push({
      key: 'regularity',
      label: 'Regularity',
      weight: 10,
      value: regularityScore(s),
      note: s.medianGapH ? `typical gap ${s.medianGapH}h` : 'not enough gaps yet',
    });
  }

  const totalW = parts.reduce((a, p) => a + p.weight, 0);
  const rounded = parts.map((p) => ({ ...p, value: Math.round(clamp(p.value, 0, 100)) }));
  // A single number implies a rounded assessment. Below half the available
  // weight it would be one component wearing a comprehensive-looking badge, so
  // show the parts and withhold the composite.
  if (totalW < 50) {
    return {
      score: null, parts: rounded, stats: s,
      reason: 'Only part of the picture is recorded so far, so there is no overall score yet. Add detail to a few entries and it appears.',
    };
  }
  const score = Math.round(parts.reduce((a, p) => a + clamp(p.value, 0, 100) * p.weight, 0) / totalW);
  return { score, parts: rounded, stats: s };
}

function frequencyScore(perDay) {
  if (perDay >= 0.7 && perDay <= 1.6) return 100;
  if (perDay > 1.6) return Math.max(20, 100 - (perDay - 1.6) * 45);
  if (perDay >= 0.43) return 60 + ((perDay - 0.43) / 0.27) * 40;   // 3/week → 1/day
  return Math.max(0, (perDay / 0.43) * 60);
}

function regularityScore(stats) {
  const counts = stats.attributedRows.map((r) => r.count);
  if (!counts.length) return 0;
  const m = mean(counts);
  if (m === 0) return 0;
  const sd = Math.sqrt(mean(counts.map((c) => (c - m) ** 2)));
  return clamp(100 - (sd / Math.max(m, 0.5)) * 55, 0, 100);
}

const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));

/** 7-day rolling average of Bristol type, one point per day. */
export function bristolTrend(entries, days = 30) {
  const dates = [...daysBack(days)].reverse();
  return dates.map((date) => {
    const end = new Date(date); end.setDate(end.getDate() + 1);   // exclusive
    const start = new Date(date); start.setDate(start.getDate() - 6);
    const win = entries.filter((e) => {
      const t = new Date(e.ts).getTime();
      return t >= start.getTime() && t < end.getTime();
    });
    return {
      date,
      value: win.length ? mean(win.map((e) => e.bristol)) : null,
      count: win.length,
    };
  });
}

/**
 * Does a tag travel with looser or firmer stools than your baseline?
 * Purely descriptive — a correlation across your own log, not a cause.
 */
export function tagCorrelations(entries, { minCount = 3 } = {}) {
  const scoped = withinDays(entries, 90);
  if (scoped.length < 8) return [];
  const baseline = mean(scoped.map((e) => e.bristol));
  const byTag = new Map();
  for (const e of scoped) for (const t of e.tags) {
    if (!byTag.has(t)) byTag.set(t, []);
    byTag.get(t).push(e.bristol);
  }
  return [...byTag.entries()]
    .filter(([, v]) => v.length >= minCount)
    .map(([tag, v]) => ({ tag, count: v.length, avg: round1(mean(v)), delta: round1(mean(v) - baseline) }))
    .filter((r) => Math.abs(r.delta) >= 0.6)
    .sort((a, b) => Math.abs(b.delta) - Math.abs(a.delta))
    .slice(0, 6)
    .map((r) => ({ ...r, baseline: round1(baseline) }));
}

/**
 * Which dietary problem should this person work on first?
 * Classifies the recent log into one focus area so the guidance shown is the
 * guidance that applies — advice for hard stools is close to the opposite of
 * advice for loose ones, so showing both at once would be useless.
 */
export function dietaryFocus(entries, days = 14, opts = {}) {
  const s = computeStats(entries, days, opts);
  if (s.count < 3) {
    return {
      focus: 'unknown',
      confidence: 'none',
      headline: 'Not enough logged yet',
      because: `Log at least 3 movements in ${days} days and this becomes specific to you.`,
      stats: s,
    };
  }

  const hard = s.constipatedPct;
  const loose = s.loosePct;
  const perDay = s.attributedDays ? s.count / s.attributedDays : 0;
  const infrequent = s.attributedDays >= 7 && perDay < 0.43;   // under 3 per week
  const confidence = s.count >= 10 ? 'good' : s.count >= 6 ? 'fair' : 'low';

  // Both extremes present in the same window — alternating is its own pattern.
  if (hard >= 25 && loose >= 25) {
    return {
      focus: 'alternating', confidence, stats: s,
      headline: 'Swinging between hard and loose',
      because: `${Math.round(hard)}% type 1–2 and ${Math.round(loose)}% type 6–7 in ${days} days`,
    };
  }
  if (hard >= 35 || infrequent) {
    return {
      focus: 'hard', confidence, stats: s,
      headline: infrequent && hard < 35 ? 'Going less often than is comfortable' : 'Stools are running hard',
      because: infrequent
        ? `${s.count} movements in ${days} days (${round1(perDay)}/day)`
        : `${Math.round(hard)}% of movements were type 1–2`,
    };
  }
  if (loose >= 35) {
    return {
      focus: 'loose', confidence, stats: s,
      headline: 'Stools are running loose',
      because: `${Math.round(loose)}% of movements were type 6–7`,
    };
  }
  if (s.idealPct >= 65 && s.avgStrain < 1.5) {
    return {
      focus: 'maintain', confidence, stats: s,
      headline: 'Your gut is in good shape',
      because: `${Math.round(s.idealPct)}% type 3–5, strain ${s.avgStrain}/3`,
    };
  }
  return {
    focus: 'mixed', confidence, stats: s,
    headline: 'Mixed, with room to tighten up',
    because: `${Math.round(s.idealPct)}% type 3–5 over ${days} days`,
  };
}

/**
 * A change from your own established pattern is more meaningful than any
 * deviation from a population average — and a log is the only thing that can
 * establish that baseline. Compares the recent window against the stretch
 * before it, and only speaks up when both windows hold enough data.
 */
export function baselineShift(entries, { recentDays = 14, baselineDays = 60 } = {}) {
  const now = Date.now();
  const recent = entries.filter((e) => new Date(e.ts).getTime() >= now - recentDays * DAY);
  const base = entries.filter((e) => {
    const t = new Date(e.ts).getTime();
    return t < now - recentDays * DAY && t >= now - baselineDays * DAY;
  });
  if (recent.length < 6 || base.length < 10) return null;

  // Dividing by a fixed 46 days when only 5 days of history exist reported a
  // fivefold increase for someone who had actually slowed down.
  const firstTs = Math.min(...entries.map((e) => new Date(e.ts).getTime()));
  const spanDays = (now - firstTs) / DAY;
  const baseDays = Math.min(baselineDays, spanDays) - recentDays;
  if (baseDays < 14) return null;
  const formDelta = mean(recent.map((e) => e.bristol)) - mean(base.map((e) => e.bristol));
  const recentPerDay = recent.length / recentDays;
  const basePerDay = base.length / baseDays;
  const freqRatio = basePerDay ? recentPerDay / basePerDay : 1;

  const changes = [];
  if (Math.abs(formDelta) >= 0.8) {
    changes.push(formDelta > 0
      ? `looser than usual (type ${round1(mean(base.map((e) => e.bristol)))} → ${round1(mean(recent.map((e) => e.bristol)))})`
      : `firmer than usual (type ${round1(mean(base.map((e) => e.bristol)))} → ${round1(mean(recent.map((e) => e.bristol)))})`);
  }
  if (freqRatio >= 1.5 || freqRatio <= 0.66) {
    changes.push(freqRatio > 1
      ? `going more often (${round1(basePerDay)} → ${round1(recentPerDay)} per day)`
      : `going less often (${round1(basePerDay)} → ${round1(recentPerDay)} per day)`);
  }
  if (!changes.length) return null;

  return {
    changes,
    formDelta: round1(formDelta),
    freqRatio: round1(freqRatio),
    evidence: `${recent.length} entries in ${recentDays} days vs ${base.length} in the ${baseDays} before`,
  };
}

/**
 * Cautions where the standard dietary advice is the WRONG advice for this
 * person. These outrank tips: an app that keeps recommending fibre to someone
 * whose problem is not fibre is actively unhelpful.
 */
export function activeCautions(entries, focus) {
  const s = computeStats(entries, 30);
  const out = [];
  if (!s.count) return out;

  const tagged = (name) => (s.tagCounts.get(name) || 0);

  // Straining hard on well-formed stool points at the outlet, not the stool.
  if (s.count >= 6 && s.idealPct >= 60 && s.avgStrain >= 1.5 && s.avgComplete <= 3.2) {
    out.push({ key: 'defecatory', evidence: `${Math.round(s.idealPct)}% healthy form, but strain ${s.avgStrain}/3 and completeness ${s.avgComplete}/5` });
  }
  // The best-documented modifiable cause of constipation.
  if (focus === 'hard' && (tagged('iron') + tagged('opioid')) >= 2) {
    out.push({ key: 'medication', evidence: `${tagged('iron') + tagged('opioid')} entries tagged iron or opioid in 30 days` });
  }
  // Elimination diets cut the very compounds that draw water into hard stool.
  if (focus === 'hard' && tagged('low FODMAP') >= 3) {
    out.push({ key: 'lowFodmap', evidence: `${tagged('low FODMAP')} entries tagged low FODMAP in 30 days` });
  }
  return out;
}

// ---- rule engine -----------------------------------------------------------

const LEVEL_RANK = { alert: 0, warn: 1, info: 2, good: 3 };

export function evaluate(entries, opts = {}) {
  const out = [];
  const push = (level, title, detail, evidence) => out.push({ level, title, detail, evidence });

  if (entries.length === 0) {
    push('info', 'Nothing logged yet',
      'Log a few movements and this page starts telling you what your gut has been up to.',
      'No entries');
    return out;
  }

  const d30 = withinDays(entries, 30);
  const d14 = withinDays(entries, 14);
  const s14 = computeStats(entries, 14, opts);

  // --- red flags ---
  // Deliberately NOT graded by where the blood appeared. The convention that
  // paper-only implies an anorectal source is standard teaching but could not be
  // verified against an authoritative source, and the cost of a false
  // reassurance here is far higher than the cost of one extra GP visit.
  const anyBlood = d30.filter((e) => e.blood !== 'none');
  if (anyBlood.length) {
    const where = [...new Set(anyBlood.map((e) => e.blood))]
      .map((b) => BLOOD_OPTIONS.find((o) => o.id === b)?.name.toLowerCase()).filter(Boolean);
    push('alert', anyBlood.length === 1 ? 'You logged blood' : 'You have logged blood more than once',
      'Most rectal bleeding turns out to be haemorrhoids or a small tear, particularly alongside straining — but blood is the one thing not worth self-diagnosing, and where it appears does not reliably tell you where it came from. Get it looked at. Bring this log; the dates and the detail are exactly what you will be asked for.',
      `${anyBlood.length} entr${anyBlood.length === 1 ? 'y' : 'ies'} in 30 days (${where.join(', ')})`);
  }

  const black = d30.filter((e) => e.color === 'black');
  if (black.length >= 2) {
    push('alert', 'Black or tarry stools',
      'Iron tablets and bismuth (Pepto) turn stool black harmlessly. So does bleeding higher up the gut, which does not. If you are not on iron or bismuth, get this checked promptly.',
      `${black.length} entries in the last 30 days`);
  }

  const pale = d30.filter((e) => e.color === 'pale');
  if (pale.length >= 2) {
    push('alert', 'Pale or clay-coloured stools',
      'Stool gets its colour from bile. Pale and repeating suggests bile is not reaching the gut — a liver, gallbladder or bile-duct question for a doctor.',
      `${pale.length} entries in the last 30 days`);
  }

  const severePain = d30.filter((e) => e.pain === 3);
  if (severePain.length >= 2) {
    push('warn', 'Severe pain is recurring',
      'Pain rated severe more than once in a month is worth raising with a clinician — bring this log with you.',
      `${severePain.length} entries rated severe`);
  }

  // --- patterns ---
  if (s14.count) {
    const infrequent = s14.attributedDays >= 7 && s14.count / s14.attributedDays < 0.43;
    if (s14.constipatedPct >= 40 || infrequent) {
      const why = s14.constipatedPct >= 40
        ? `${Math.round(s14.constipatedPct)}% of movements were type 1–2`
        : `${s14.count} movements across ${s14.attributedDays} recorded days`;
      push('warn', 'Constipation pattern',
        'Fewer than three a week, or mostly hard lumpy stools, is the working definition of constipation. The usual levers: more water, 25–30g of fibre a day, movement after meals, and not putting off the urge.',
        why);
    }
    if (s14.loosePct >= 40) {
      push('warn', 'Loose stools are dominating',
        'Two weeks of mostly type 6–7 points at something ongoing — an infection, a food you are reacting to, a medication, or inflammation. Keep fluids and salts up, and if it passes four weeks, see someone.',
        `${Math.round(s14.loosePct)}% of movements were type 6–7`);
    }
    if (s14.reviewedCount >= 3 && s14.avgStrain >= 2) {
      push('warn', 'You are straining a lot',
        'Sustained straining is what turns into haemorrhoids and fissures. A footstool to get your knees above your hips changes the anorectal angle and genuinely helps.',
        `average strain ${s14.avgStrain}/3 over 14 days`);
    }
    if (s14.count >= 6 && s14.idealPct >= 60 && s14.avgStrain >= 1.5 && s14.avgComplete <= 3.2) {
      push('warn', 'Straining hard on well-formed stool',
        'Your form is mostly in the healthy band, yet you are straining and rarely feel finished. That points at the outlet rather than the stool — the pelvic floor not relaxing on cue. More fibre tends to make this worse, not better. It is diagnosed with anorectal testing and treated with biofeedback, so it is worth raising rather than eating around.',
        `${Math.round(s14.idealPct)}% healthy form with strain ${s14.avgStrain}/3 and completeness ${s14.avgComplete}/5`);
    }
    if (s14.reviewedCount >= 3 && s14.avgComplete <= 2.5) {
      push('info', 'Often feels unfinished',
        'A persistent sense of incomplete emptying is a common IBS feature, and also shows up with pelvic floor issues. Worth mentioning if it sticks around.',
        `completeness averaging ${s14.avgComplete}/5`);
    }
    if (s14.mucusCount >= 3) {
      push('info', 'Mucus is showing up regularly',
        'A little mucus is normal. Regular visible mucus, especially with cramping or looseness, is worth a conversation.',
        `${s14.mucusCount} entries in 14 days`);
    }
    // Steatorrhea is a CLUSTER, not any single sign. Levitt & Duane (NEJM 1972)
    // showed floating stools sink once their gas is compressed — buoyancy tracks
    // gas, not fat — so floating alone must never raise a flag.
    const fatty = d30.filter((e) => {
      const signs = [e.greasy, ['yellow', 'pale'].includes(e.color), e.floats].filter(Boolean).length;
      return e.greasy ? signs >= 2 : signs >= 3;
    });
    if (fatty.length >= 2) {
      push('warn', 'Signs of fat not being absorbed',
        'Stool that is greasy, pale, foul and hard to flush suggests fat is passing through undigested — which points at the pancreas, bile, or coeliac disease. Floating by itself is just gas and means nothing; it is the combination that counts. Worth asking for a test if it keeps happening.',
        `${fatty.length} entries with two or more signs together in 30 days`);
    }
    const green = d30.filter((e) => e.color === 'green');
    if (green.length >= 4) {
      push('info', 'Green is frequent',
        'Usually leafy greens, food colouring, or food moving through fast enough that bile has not broken down. Harmless on its own.',
        `${green.length} entries in the last 30 days`);
    }
  }

  // --- the good news ---
  if (s14.count >= 5) {
    if (s14.idealPct >= 70) {
      push('good', 'Your form is genuinely good',
        'Most of your movements land in the healthy 3–5 band. Whatever you are doing with fibre, water and routine — keep it.',
        `${Math.round(s14.idealPct)}% type 3–5 over 14 days`);
    }
    const perDay = s14.count / 14;
    if (perDay >= 0.7 && perDay <= 1.6 && s14.reviewedCount >= 3 &&
        s14.daysLogged >= 7 && s14.avgStrain != null && s14.avgStrain < 1.5) {
      push('good', 'Comfortable, regular rhythm',
        'Roughly daily with little straining is exactly what you want.',
        `${round1(perDay)} per day, strain ${s14.avgStrain}/3`);
    }
  }

  if (s14.gapDays >= 3) {
    push('info', 'There are gaps in your log',
      `${s14.gapDays} of the last 14 days have no record at all. The app will not read those as days you did not go — frequency and regularity are measured only over the ${s14.attributedDays} days it can account for. If you genuinely did not go, tap "Nothing today" so it counts as a real zero.`,
      `${s14.attributedDays} of 14 days recorded`);
  }

  const shift = baselineShift(entries);
  if (shift) {
    push('info', 'Your pattern has shifted',
      `Compared with your own previous weeks you are ${shift.changes.join(' and ')}. A change from your own baseline says more than any population average does — that is the whole point of keeping a log. If it holds for more than about three weeks, mention it to a clinician.`,
      shift.evidence);
  }

  return out.sort((a, b) => LEVEL_RANK[a.level] - LEVEL_RANK[b.level]);
}

export { round1, mean, pct };
export const bristolMeaning = (t) => BRISTOL_BY_TYPE[t]?.meaning ?? '';
