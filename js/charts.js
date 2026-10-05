// Hand-rolled SVG charts. No dependencies, theme-aware, and they degrade
// gracefully to an empty-state when there is nothing to draw.

const esc = (s) => String(s).replace(/[&<>"']/g, (c) =>
  ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

function empty(msg, h = 120) {
  return `<div class="chart-empty" style="height:${h}px">${esc(msg)}</div>`;
}

/** Vertical bars with labels under each. items: {label, value, color?, title?} */
export function barChart(items, { height = 150, max = null, valueFmt = (v) => v, label = 'Distribution' } = {}) {
  const total = items.reduce((a, i) => a + i.value, 0);
  if (!total) return empty('No data in this window', height);
  const summary = `${label}: ` + items.filter((i) => i.value)
    .map((i) => `${i.label}, ${i.value}`).join('; ') + '.';
  const peak = max ?? Math.max(...items.map((i) => i.value));
  const W = 100 / items.length;
  return `<p class="sr-only">${esc(summary)}</p><div class="bars" aria-hidden="true" style="height:${height}px">${items.map((it, i) => {
    const h = peak ? (it.value / peak) * 100 : 0;
    return `<div class="bar-col" style="width:${W}%" title="${esc(it.title ?? `${it.label}: ${it.value}`)}">
      <div class="bar-val">${it.value ? esc(valueFmt(it.value)) : ''}</div>
      <div class="bar-track"><div class="bar-fill" style="height:${h}%;background:${it.color || 'var(--accent)'}"></div></div>
      <div class="bar-label">${esc(it.label)}</div>
    </div>`;
  }).join('')}</div>`;
}

/**
 * Line chart over time with optional horizontal comfort bands.
 * points: {date, value|null}. Nulls break the line rather than faking data.
 */
export function lineChart(points, { height = 190, min = 1, max = 7, bands = [], yTicks = [1, 4, 7], yFmt = (v) => v, label = '' } = {}) {
  const real = points.filter((p) => p.value != null);
  if (real.length < 2) return empty('Not enough days logged yet', height);
  const first = points[0].date, last = points.at(-1).date;
  const fmt = (d) => d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });

  const W = 600, H = height, padL = 26, padR = 8, padT = 10, padB = 22;
  const x = (i) => padL + (i / (points.length - 1)) * (W - padL - padR);
  const y = (v) => padT + (1 - (v - min) / (max - min)) * (H - padT - padB);

  const bandSvg = bands.map((b) =>
    `<rect x="${padL}" y="${y(b.to)}" width="${W - padL - padR}" height="${Math.abs(y(b.from) - y(b.to))}"
       fill="${b.color}" opacity="${b.opacity ?? 0.13}"/>`).join('');

  const grid = yTicks.map((t) =>
    `<line x1="${padL}" x2="${W - padR}" y1="${y(t)}" y2="${y(t)}" class="grid"/>
     <text x="${padL - 6}" y="${y(t) + 4}" class="axis" text-anchor="end">${esc(yFmt(t))}</text>`).join('');

  // Split into contiguous runs so gaps stay gaps.
  const runs = [];
  let cur = [];
  points.forEach((p, i) => {
    if (p.value == null) { if (cur.length) runs.push(cur); cur = []; }
    else cur.push([x(i), y(p.value)]);
  });
  if (cur.length) runs.push(cur);

  const paths = runs.map((run) => {
    const d = run.map(([px, py], i) => `${i ? 'L' : 'M'}${px.toFixed(1)},${py.toFixed(1)}`).join(' ');
    const area = run.length > 1
      ? `<path d="${d} L${run.at(-1)[0].toFixed(1)},${H - padB} L${run[0][0].toFixed(1)},${H - padB} Z" fill="url(#lineGrad)" opacity=".5"/>`
      : '';
    return area + `<path d="${d}" class="line" fill="none"/>`;
  }).join('');

  const dots = runs.flatMap((r) => r).filter((_, i, arr) => arr.length < 40 || i % 3 === 0)
    .map(([px, py]) => `<circle cx="${px.toFixed(1)}" cy="${py.toFixed(1)}" r="2.6" class="dot"/>`).join('');

  const inBand = bands.length
    ? real.filter((p) => p.value >= bands[0].from && p.value <= bands[0].to).length : 0;
  const alt = label || `Trend from ${fmt(first)} to ${fmt(last)}: `
    + `starts at ${real[0].value.toFixed(1)}, ends at ${real.at(-1).value.toFixed(1)}`
    + (bands.length ? `. ${inBand} of ${real.length} days sit inside the healthy band.` : '.');
  return `<svg class="chart" viewBox="0 0 ${W} ${H}" role="img" aria-label="${esc(alt)}">
    <defs><linearGradient id="lineGrad" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="var(--accent)" stop-opacity=".38"/>
      <stop offset="100%" stop-color="var(--accent)" stop-opacity="0"/>
    </linearGradient></defs>
    ${bandSvg}${grid}${paths}${dots}
    <text x="${padL}" y="${H - 6}" class="axis">${esc(fmt(first))}</text>
    <text x="${W - padR}" y="${H - 6}" class="axis" text-anchor="end">${esc(fmt(last))}</text>
  </svg>`;
}

/** GitHub-style calendar of daily movement counts. */
export function calendarHeatmap(byDay, { weeks = 13 } = {}) {
  const totalLogged = [...byDay.values()].reduce((a, b) => a + b, 0);
  const cell = 15, gap = 3;
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const end = new Date(today);
  end.setDate(end.getDate() + (6 - end.getDay()));          // pad to end of this week
  const start = new Date(end);
  start.setDate(start.getDate() - (weeks * 7 - 1));

  const key = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  const W = weeks * (cell + gap), H = 7 * (cell + gap) + 16;

  let cells = '', months = '';
  let lastMonth = -1;
  for (let w = 0; w < weeks; w++) {
    for (let d = 0; d < 7; d++) {
      const date = new Date(start);
      date.setDate(start.getDate() + w * 7 + d);
      const future = date > today;
      const n = byDay.get(key(date)) || 0;
      const level = future ? 'future' : n === 0 ? 0 : n === 1 ? 1 : n === 2 ? 2 : n <= 4 ? 3 : 4;
      cells += `<rect x="${w * (cell + gap)}" y="${d * (cell + gap) + 16}" width="${cell}" height="${cell}" rx="3"
        class="cal-cell cal-${level}"><title>${date.toDateString()} — ${future ? 'upcoming' : `${n} logged`}</title></rect>`;
      if (d === 0 && date.getMonth() !== lastMonth && date <= today) {
        lastMonth = date.getMonth();
        months += `<text x="${w * (cell + gap)}" y="10" class="axis">${date.toLocaleString(undefined, { month: 'short' })}</text>`;
      }
    }
  }
  const alt = `Daily calendar over ${weeks} weeks: ${totalLogged} movements across ${byDay.size} days with a record.`;
  return `<svg class="chart cal" viewBox="0 0 ${W} ${H}" role="img" aria-label="${esc(alt)}">${months}${cells}</svg>`;
}

/** 24-hour histogram — when your body actually goes. */
export function hourHistogram(counts) {
  const total = counts.reduce((a, b) => a + b, 0);
  if (!total) return empty('No timing data yet', 110);
  const peak = Math.max(...counts);
  const busiest = counts.map((c, h) => ({ c, h })).filter((x) => x.c)
    .sort((a, b) => b.c - a.c).slice(0, 3)
    .map((x) => `${String(x.h).padStart(2, '0')}:00 (${x.c})`).join(', ');
  const summary = `Time of day across ${total} movements. Most common: ${busiest}.`;
  return `<p class="sr-only">${esc(summary)}</p><div class="hours" aria-hidden="true">${counts.map((c, h) => {
    const pctH = peak ? (c / peak) * 100 : 0;
    const label = h % 6 === 0 ? `${String(h).padStart(2, '0')}` : '';
    return `<div class="hour-col" title="${h}:00 — ${c} logged">
      <div class="hour-track"><div class="hour-fill" style="height:${pctH}%"></div></div>
      <div class="hour-label">${label}</div></div>`;
  }).join('')}</div>`;
}

/** Single stacked bar — used for colour mix. segments: {label, value, color} */
export function stackedBar(segments) {
  const total = segments.reduce((a, s) => a + s.value, 0);
  if (!total) return empty('No data yet', 60);
  const summary = 'Colour mix: ' + segments.filter((s) => s.value)
    .map((s) => `${s.label} ${Math.round((s.value / total) * 100)}%`).join(', ') + '.';
  return `<p class="sr-only">${esc(summary)}</p><div class="stack" aria-hidden="true">${segments.filter((s) => s.value).map((s) =>
    `<div class="stack-seg" style="width:${(s.value / total) * 100}%;background:${s.color}"
       title="${esc(s.label)}: ${s.value} (${Math.round((s.value / total) * 100)}%)"></div>`).join('')}</div>
    <div class="stack-legend">${segments.filter((s) => s.value).map((s) =>
      `<span class="legend-item"><i style="background:${s.color}"></i>${esc(s.label)} <b>${Math.round((s.value / total) * 100)}%</b></span>`).join('')}</div>`;
}

/** Score ring, 0–100. */
export function scoreRing(score, { size = 132, label = '' } = {}) {
  const r = size / 2 - 11, c = 2 * Math.PI * r;
  const shown = score == null ? 0 : score;
  const hue = score == null ? 'var(--muted)'
    : score >= 75 ? 'var(--ok)' : score >= 50 ? 'var(--warn)' : 'var(--bad)';
  // role="img" prunes the subtree, so the number rendered below is never read
  // out. The label has to carry it.
  const alt = score == null ? 'Gut score not available yet' : `Gut score ${score} out of 100${label ? '. ' + label : ''}`;
  return `<svg class="ring" viewBox="0 0 ${size} ${size}" width="${size}" height="${size}" role="img" aria-label="${esc(alt)}">
    <circle cx="${size / 2}" cy="${size / 2}" r="${r}" class="ring-track"/>
    <circle cx="${size / 2}" cy="${size / 2}" r="${r}" class="ring-fill"
      stroke="${hue}" stroke-dasharray="${(c * shown) / 100} ${c}"
      transform="rotate(-90 ${size / 2} ${size / 2})"/>
    <text x="50%" y="50%" class="ring-num" text-anchor="middle" dy="4">${score == null ? '–' : score}</text>
    <text x="50%" y="50%" class="ring-sub" text-anchor="middle" dy="24">/ 100</text>
  </svg>`;
}

/** Horizontal meter used in the score breakdown. */
export function meter(value, color = 'var(--accent)') {
  return `<div class="meter"><div class="meter-fill" style="width:${Math.max(0, Math.min(100, value))}%;background:${color}"></div></div>`;
}
