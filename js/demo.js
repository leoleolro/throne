// Seeded sample data, so a new user can see what the app looks like with
// history behind it. Deterministic — same seed, same story every time.

import { cryptoId } from './store.js';

function mulberry32(a) {
  return function () {
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const pick = (rnd, arr) => arr[Math.floor(rnd() * arr.length)];

/**
 * 60 days of a believable gut: mostly healthy, a loose stretch around a
 * holiday, a constipated stretch during a busy work week.
 */
export function generateDemo(days = 60, seed = 20260831) {
  const rnd = mulberry32(seed);
  const out = [];
  const now = new Date();

  for (let d = days - 1; d >= 0; d--) {
    const date = new Date(now);
    date.setDate(now.getDate() - d);
    date.setHours(0, 0, 0, 0);

    const looseSpell = d <= 41 && d >= 36;   // a bad few days ~5 weeks back
    const stressSpell = d <= 12 && d >= 6;   // busy stretch more recently
    let count = 1;
    if (looseSpell) count = 2 + Math.floor(rnd() * 2);
    else if (stressSpell) count = rnd() < 0.45 ? 0 : 1;
    else count = rnd() < 0.16 ? 2 : rnd() < 0.1 ? 0 : 1;

    for (let i = 0; i < count; i++) {
      const hour = i === 0 ? 6 + Math.floor(rnd() * 4) : 12 + Math.floor(rnd() * 9);
      const ts = new Date(date);
      ts.setHours(hour, Math.floor(rnd() * 60), 0, 0);
      if (ts > now) continue;

      let bristol;
      if (looseSpell) bristol = pick(rnd, [5, 6, 6, 6, 7]);
      else if (stressSpell) bristol = pick(rnd, [1, 2, 2, 3]);
      else bristol = pick(rnd, [3, 3, 4, 4, 4, 4, 5, 5, 2, 6]);

      const strain = bristol <= 2 ? 1 + Math.round(rnd() * 2) : rnd() < 0.2 ? 1 : 0;
      const urgency = bristol >= 6 ? 2 + Math.round(rnd()) : rnd() < 0.25 ? 1 : 0;
      const pain = bristol <= 2 && rnd() < 0.4 ? 1 : bristol >= 6 && rnd() < 0.3 ? 1 : 0;

      const tags = [];
      if (rnd() < 0.5) tags.push('coffee');
      if (looseSpell) tags.push(pick(rnd, ['travel', 'greasy', 'alcohol']));
      if (stressSpell) tags.push(pick(rnd, ['stress', 'low fibre', 'poor sleep']));
      if (bristol >= 5 && rnd() < 0.35) tags.push('dairy');
      if (bristol <= 4 && rnd() < 0.3) tags.push('high fibre');
      if (rnd() < 0.15) tags.push('exercise');

      out.push({
        id: cryptoId(),
        ts: ts.toISOString(),
        bristol,
        color: looseSpell && rnd() < 0.3 ? 'green' : rnd() < 0.12 ? 'lightBrown' : rnd() < 0.08 ? 'darkBrown' : 'brown',
        volume: bristol >= 6 ? pick(rnd, ['small', 'medium']) : pick(rnd, ['medium', 'medium', 'large']),
        urgency, strain, pain,
        blood: bristol <= 2 && strain >= 2 && rnd() < 0.12 ? 'paper' : 'none',
        mucus: looseSpell && rnd() < 0.2,
        floats: rnd() < 0.18,
        complete: bristol >= 3 && bristol <= 5 ? (rnd() < 0.75 ? 5 : 4) : 2 + Math.round(rnd() * 2),
        durationMin: bristol <= 2 ? 6 + Math.floor(rnd() * 10) : 2 + Math.floor(rnd() * 5),
        tags,
        notes: looseSpell && i === 0 && rnd() < 0.3 ? 'Stomach felt off all morning.' : '',
      });
    }
  }
  // The demo represents someone who logs diligently, so its blank days are
  // recorded as real zeroes rather than left ambiguous.
  const logged = new Set(out.map((e) => e.ts.slice(0, 10)));
  const noneDays = [];
  for (let d = days - 1; d >= 0; d--) {
    const date = new Date(now);
    date.setDate(now.getDate() - d);
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    const iso = new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
    if (!logged.has(iso) && !out.some((e) => {
      const t = new Date(e.ts);
      return `${t.getFullYear()}-${String(t.getMonth() + 1).padStart(2, '0')}-${String(t.getDate()).padStart(2, '0')}` === key;
    })) noneDays.push(key);
  }
  return { entries: out, noneDays };
}
