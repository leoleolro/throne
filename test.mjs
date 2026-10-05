// Headless check of the data + analysis layers.
const mem = new Map();
globalThis.localStorage = {
  getItem: (k) => (mem.has(k) ? mem.get(k) : null),
  setItem: (k, v) => mem.set(k, String(v)),
  removeItem: (k) => mem.delete(k),
};
const base = new URL('./js/', import.meta.url).href;
const store = await import(base + 'store.js');
const { generateDemo } = await import(base + 'demo.js');
const ins = await import(base + 'insights.js');

let fails = 0;
const ok = (name, cond, extra = '') => {
  if (!cond) { fails++; console.log(`FAIL ${name} ${extra}`); }
  else console.log(`ok   ${name}${extra ? ' — ' + extra : ''}`);
};

// --- round-trip -------------------------------------------------------------
const demoData = generateDemo(60);
store.replaceAll(demoData.entries, demoData.noneDays);
const n = store.getEntries().length;
ok('demo generates entries', n > 40, `${n} entries`);

const json = store.exportJSON();
const csv = store.exportCSV();
ok('csv header + rows', csv.split('\n').length === n + 1, `${csv.split('\n').length - 1} rows`);
ok('csv escapes quotes/commas', !csv.split('\n').some((r) => r.split(',').length < 14));

store.clearAll();
ok('clearAll empties', store.getEntries().length === 0);
const imported = store.importJSON(json);
ok('import restores everything', imported === n && store.getEntries().length === n);
store.importJSON(json, { merge: true });
ok('merge dedupes by id', store.getEntries().length === n);

// --- malformed input --------------------------------------------------------
try { store.importJSON('{"nope":1}'); ok('rejects bad file', false); }
catch { ok('rejects bad file', true); }
const weird = store.normalizeEntry({ bristol: 99, complete: -4, tags: 'nope', durationMin: '' });
ok('clamps out-of-range', weird.bristol === 7 && weird.complete === 1 && Array.isArray(weird.tags) && weird.durationMin === null);

// --- analysis ---------------------------------------------------------------
const entries = store.getEntries();
const score = ins.gutScore(entries, 14);
ok('score in range', score.score >= 0 && score.score <= 100, `score ${score.score}`);
ok('score parts sum weights to 100', score.parts.reduce((a, p) => a + p.weight, 0) === 100);
ok('empty log yields no score', ins.gutScore([], 14).score === null);

const trend = ins.bristolTrend(entries, 30);
ok('trend has one point per day', trend.length === 30);

const cards = ins.evaluate(entries);
ok('rules fire on demo data', cards.length > 0, cards.map((c) => `${c.level}:${c.title}`).join(' | '));
ok('empty log gets a friendly card', ins.evaluate([]).length === 1);

// Red flags must fire.
const now = new Date();
const bleed = [0, 1, 2].map((i) => store.normalizeEntry({
  ts: new Date(now - i * 86400000).toISOString(), bristol: 2, blood: 'mixed', color: 'black',
}));
const flagged = ins.evaluate(bleed).map((c) => c.level);
ok('blood + black stools raise alerts', flagged.filter((l) => l === 'alert').length >= 2, flagged.join(','));

const stats = ins.computeStats(entries, 30);
ok('stats internally consistent',
  stats.distribution.reduce((a, d) => a + d.count, 0) === stats.count &&
  stats.hourCounts.reduce((a, b) => a + b, 0) === stats.count);

// --- guidance content integrity ---------------------------------------------
const guide = await import(base + 'guidance.js');
const { BRISTOL, COLORS } = await import(base + 'bristol.js');

const refIds = [];
const collect = (arr) => (arr || []).forEach((i) => refIds.push(...(i.sources || [])));
Object.values(guide.FOCUS_GUIDANCE).forEach((f) => {
  collect(f.eat); collect(f.doAlso);
  refIds.push(...(f.mechanismSources || []), ...(f.watchForSources || []));
});
collect(guide.MYTHS); collect(guide.MAINTENANCE); collect(guide.SELF_TESTS); collect(guide.TIMESCALES);
collect(Object.values(guide.CAUTIONS)); collect(Object.values(guide.COLOR_GUIDANCE));
refIds.push(...guide.FIBRE_MODEL.sources, ...guide.TARGETS.fibre.sources, ...guide.TARGETS.fluid.sources);
ok('every source citation resolves', refIds.every((id) => guide.SOURCES[id]),
  `${refIds.length} citations, ${Object.keys(guide.SOURCES).length} sources`);
ok('every source has a real URL',
  Object.values(guide.SOURCES).every((s) => /^https?:\/\/\S+$/.test(s.url) && s.label));

// Every focus the classifier can emit must have guidance behind it.
const focuses = ['hard', 'loose', 'maintain', 'alternating', 'mixed'];
ok('every dietary focus has guidance', focuses.every((f) => guide.FOCUS_GUIDANCE[f]));
ok('colour guidance covers every colour', COLORS.every((c) => guide.COLOR_GUIDANCE[c.id]));
ok('every caution key is defined', ['defecatory', 'medication', 'lowFodmap', 'bileAcid']
  .every((k) => guide.CAUTIONS[k]));

// The classifier must land on a real focus for each shaped log.
const shaped = (bristol, n = 12) => Array.from({ length: n }, (_, i) => store.normalizeEntry({
  ts: new Date(Date.now() - i * 43200000).toISOString(), bristol,
}));
ok('hard log classifies as hard', ins.dietaryFocus(shaped(1)).focus === 'hard');
ok('loose log classifies as loose', ins.dietaryFocus(shaped(7)).focus === 'loose');
ok('healthy log classifies as maintain', ins.dietaryFocus(shaped(4)).focus === 'maintain');
ok('sparse log stays unknown', ins.dietaryFocus(shaped(4, 2)).focus === 'unknown');

// Floating alone must never raise a flag (Levitt & Duane 1972).
const floaters = Array.from({ length: 8 }, (_, i) => store.normalizeEntry({
  ts: new Date(Date.now() - i * 86400000).toISOString(), bristol: 4, floats: true,
}));
ok('floating alone raises no fat-malabsorption flag',
  !ins.evaluate(floaters).some((c) => /fat not being absorbed/i.test(c.title)));
const greasy = floaters.map((e) => ({ ...e, greasy: true, color: 'pale' }));
ok('the greasy + pale + floating cluster does flag',
  ins.evaluate(greasy).some((c) => /fat not being absorbed/i.test(c.title)));

// --- one-tap logging defaults ------------------------------------------------
// A quick-logged entry carries only a type and a timestamp; everything else must
// fall back to values that do not silently distort the statistics.
store.clearAll();
const quick = store.addEntry({ ts: new Date().toISOString(), bristol: 4, complete: 4 });
ok('quick log needs only a type', quick.bristol === 4 && quick.color === 'brown');
ok('quick log records no false symptoms',
  quick.urgency === 0 && quick.strain === 0 && quick.pain === 0 &&
  quick.blood === 'none' && !quick.mucus && !quick.greasy && !quick.floats);
ok('quick log leaves duration unset rather than zero', quick.durationMin === null);
store.deleteEntry(quick.id);
ok('undo removes it cleanly', store.getEntries().length === 0);

// One-tap entries must not be scored as though the user reported no symptoms.
// All within today, so coverage is unambiguous whatever the clock or timezone.
store.clearAll();
const quickOnly = Array.from({ length: 6 }, (_, i) => store.addEntry({
  ts: new Date(Date.now() - i * 600000).toISOString(), bristol: 4, quick: true,
}));
const quickScore = ins.gutScore(store.getEntries(), 14);
ok('neither comfort nor colour is scored from one-tap defaults',
  !quickScore.parts.some((p) => p.key === 'comfort' || p.key === 'colour'),
  `parts: ${quickScore.parts.map((p) => p.key).join(', ')}`);
ok('and no colour is claimed as observed',
  ins.computeStats(store.getEntries(), 14).colorCounts.size === 0);
// Below half the available weight, a composite would be one component wearing a
// comprehensive-looking badge — so the parts show and the number is withheld.
ok('no composite score is claimed from one component alone',
  quickScore.score === null && quickScore.parts.length > 0 && !!quickScore.reason,
  `parts: ${quickScore.parts.map((p) => p.key).join(', ')}`);
ok('no false comfort praise from defaults',
  !ins.evaluate(store.getEntries()).some((c) => /Comfortable, regular rhythm/.test(c.title)));

// Once the same entries carry reported symptoms, comfort returns.
quickOnly.forEach((e) => store.updateEntry(e.id, { quick: false, strain: 0, pain: 0, urgency: 0, complete: 5 }));
const reviewedScore = ins.gutScore(store.getEntries(), 14);
ok('comfort returns once symptoms are reported',
  reviewedScore.parts.some((p) => p.key === 'comfort'));
store.clearAll();

// --- unlogged days are not zero days -----------------------------------------
// The bug this guards: someone who logs normally then forgets for a week used to
// be scored as constipated, because a missing day counted as a day of no output.
store.clearAll();
const day = 86400000;
// Seven days of healthy logging, then a seven-day gap with no record at all.
for (let i = 7; i < 14; i++) {
  store.addEntry({ ts: new Date(Date.now() - i * day).toISOString(), bristol: 4 });
}
const gapped = store.getEntries();
const gapStats = ins.computeStats(gapped, 14);
ok('a long unrecorded run is detected as a gap', gapStats.gapDays >= 6, `${gapStats.gapDays} gap days`);
ok('rates use only the days on record', gapStats.attributedDays <= 8 && gapStats.perDay >= 0.8,
  `${gapStats.perDay}/day over ${gapStats.attributedDays}d`);
ok('forgetting to log is not reported as constipation',
  !ins.evaluate(gapped).some((c) => /Constipation pattern/.test(c.title)));
ok('the gap itself is surfaced instead',
  ins.evaluate(gapped).some((c) => /gaps in your log/i.test(c.title)));
// Frequency over 7 recorded days is a real rate, so it is scored — but the note
// must disclose the denominator rather than implying the full window.
ok('frequency is scored over recorded days and says so',
  /over 7 recorded days/.test(ins.gutScore(gapped, 14).parts.find((p) => p.key === 'frequency')?.note || ''));
// With almost nothing on record it is dropped entirely.
const sparse = [store.normalizeEntry({ ts: new Date().toISOString(), bristol: 4 })];
ok('frequency is dropped when the window is nearly empty',
  !ins.gutScore(sparse, 14).parts.some((p) => p.key === 'frequency'));

// Marking those days as genuine blanks turns them into real zeroes.
const blanks = [];
for (let i = 0; i < 7; i++) {
  const d = new Date(Date.now() - i * day);
  blanks.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`);
}
const marked = ins.computeStats(gapped, 14, { noneDays: blanks });
ok('explicit blank days close the gap', marked.gapDays === 0, `${marked.attributedDays} of 14 days accounted for`);
// 7 movements over 14 known days is 0.5/day — above 3/week, so NOT constipation.
ok('a real 0.5/day is correctly not called constipation',
  !ins.evaluate(gapped, { noneDays: blanks }).some((c) => /Constipation pattern/.test(c.title)));
// Genuinely going 4 times in 14 recorded days is below 3/week, and must be caught.
store.clearAll();
for (let i = 0; i < 4; i++) store.addEntry({ ts: new Date(Date.now() - i * 3 * day).toISOString(), bristol: 2 });
const allBlanks = Array.from({ length: 14 }, (_, i) => {
  const d = new Date(Date.now() - i * day);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
});
ok('genuine infrequency IS reported once days are accounted for',
  ins.evaluate(store.getEntries(), { noneDays: allBlanks }).some((c) => /Constipation pattern/.test(c.title)));

// Logging a movement must clear a contradicting blank-day mark.
store.clearAll();
const todayKey = (() => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`; })();
store.setNoneDay(todayKey, true);
ok('a blank day can be marked', store.getNoneDays().includes(todayKey));
store.addEntry({ ts: new Date().toISOString(), bristol: 4 });
ok('logging a movement clears that day\'s blank mark', !store.getNoneDays().includes(todayKey));

// Blank days must survive a backup round-trip.
store.setNoneDay('2026-01-15', true);
const roundTripped = store.exportJSON();
store.clearAll();
store.importJSON(roundTripped);
ok('blank days survive export and import', store.getNoneDays().includes('2026-01-15'));
store.clearAll();

// --- security and robustness -------------------------------------------------
// An imported backup must not be able to choose an entry id: it reaches a DOM
// attribute, so a crafted one breaks out and runs script against the whole log.
store.clearAll();
store.importJSON(JSON.stringify({ entries: [
  { id: '" autofocus onfocus="alert(1)', bristol: 4, ts: new Date().toISOString() },
] }));
const importedId = store.getEntries()[0].id;
ok('a hostile entry id is rejected on import', !/["\'<>]/.test(importedId), `id: ${importedId}`);

// CSV goes to a clinician's spreadsheet; a note must not execute there.
store.clearAll();
store.addEntry({ ts: new Date().toISOString(), bristol: 4, notes: '=HYPERLINK("http://evil","x")' });
const csvCell = store.exportCSV().split('\n')[1];
ok('CSV formulas are neutralised', csvCell.includes("'=HYPERLINK"), 'leading apostrophe added');

// A future-dated entry must not land in every window at once.
store.clearAll();
store.addEntry({ ts: new Date(Date.now() + 400 * day).toISOString(), bristol: 7 });
for (let i = 1; i < 6; i++) store.addEntry({ ts: new Date(Date.now() - i * day).toISOString(), bristol: 4 });
const futureStats = ins.computeStats(store.getEntries(), 14);
ok('future-dated entries are excluded from windows', futureStats.count === 5,
  `counted ${futureStats.count} of 6`);

// A burst of entries in one day is not a comfortable daily rhythm.
store.clearAll();
for (let i = 0; i < 20; i++) store.addEntry({ ts: new Date(Date.now() - i * 1800000).toISOString(), bristol: 7, quick: false });
ok('a one-day burst is not praised as a regular rhythm',
  !ins.evaluate(store.getEntries()).some((c) => /Comfortable, regular rhythm/.test(c.title)));

// DST: the rolling trend must not skip a calendar day.
store.clearAll();
const trendDays = ins.bristolTrend([], 30).map((p) => p.date);
const distinct = new Set(trendDays.map((d) => `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`));
ok('the trend covers 30 distinct calendar days', distinct.size === 30, `${distinct.size} distinct`);
ok('every trend point sits at local midnight',
  trendDays.every((d) => d.getHours() === 0 && d.getMinutes() === 0));
store.clearAll();

// A blocked write must be reported, not swallowed.
store.clearAll();
const realSet = globalThis.localStorage.setItem;
globalThis.localStorage.setItem = () => { throw new Error('QuotaExceededError'); };
store.addEntry({ ts: new Date().toISOString(), bristol: 4 });
ok('a blocked write is reported rather than swallowed', store.isPersisted() === false);
globalThis.localStorage.setItem = realSet;
store.addEntry({ ts: new Date().toISOString(), bristol: 4 });
ok('and recovers once storage works again', store.isPersisted() === true);

// baselineShift must not divide by a window the data does not cover.
store.clearAll();
// 20 days of history: 2/day in the older stretch, 1/day recently — a SLOWDOWN.
for (let i = 15; i < 20; i++) {
  store.addEntry({ ts: new Date(Date.now() - i * day).toISOString(), bristol: 4 });
  store.addEntry({ ts: new Date(Date.now() - i * day - 3600000).toISOString(), bristol: 4 });
}
for (let i = 0; i < 14; i++) store.addEntry({ ts: new Date(Date.now() - i * day).toISOString(), bristol: 4 });
const shift = ins.baselineShift(store.getEntries());
ok('a short history does not fake a frequency increase',
  shift === null || !shift.changes.some((c) => /going more often/.test(c)),
  shift ? shift.changes.join('; ') : 'withheld until enough baseline exists');
store.clearAll();

// Exports must still be intelligible years from now, and safe to open.
store.clearAll();
store.addEntry({ ts: new Date().toISOString(), bristol: 4, notes: 'café — üm' });
const meta = JSON.parse(store.exportJSON());
ok('the export identifies itself', meta.app === 'throne' && meta.schema >= 1);
ok('the export documents its scales', !!meta.fields?.bristol && !!meta.fields?.quick);
const exportCsv = store.exportCSV();
ok('CSV carries a UTF-8 BOM for Excel', exportCsv.charCodeAt(0) === 0xFEFF);
const header = exportCsv.slice(1).split('\n')[0].split(',');
ok('CSV has local date and time columns', header[0] === 'date' && header[1] === 'time');
ok('CSV names the Bristol type in words', header.includes('bristol_name'));
const row = exportCsv.slice(1).split('\n')[1].split(',');
ok('the local date matches the entry, not UTC', (() => {
  const d = new Date(store.getEntries()[0].ts);
  const p = (n) => String(n).padStart(2, '0');
  return row[0] === `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
})(), row[0]);
store.clearAll();

console.log(fails ? `\n${fails} FAILURE(S)` : '\nAll logic checks passed.');
process.exit(fails ? 1 : 0);
