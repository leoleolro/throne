// UI layer: views, forms, routing. Rendering is string-based with delegated
// events — small enough to stay legible, no framework needed.

import * as store from './store.js';
import {
  BRISTOL, BRISTOL_BY_TYPE, COLORS, COLOR_BY_ID, BLOOD_OPTIONS,
  SCALE_0_3, DEFAULT_TAGS, bristolArt, TONE_COLOR,
} from './bristol.js';
import {
  computeStats, gutScore, bristolTrend, evaluate, tagCorrelations,
  loggingCoverage, dayKey, withinDays, dietaryFocus, activeCautions,
} from './insights.js';
import { barChart, lineChart, calendarHeatmap, hourHistogram, stackedBar, scoreRing, meter } from './charts.js';
import { generateDemo } from './demo.js';
import {
  SOURCES, COLOR_GUIDANCE, MYTHS, MAINTENANCE, FREQUENCY_FACTS, FOCUS_GUIDANCE,
  CAUTIONS, TARGETS, FIBRE_MODEL, FIBRE_TABLE, FIBRE_TABLE_NOTE, TIMESCALES,
  TIMESCALE_NOTE, SELF_TESTS, STRENGTH_LABEL,
} from './guidance.js';

const VIEWS = ['log', 'history', 'trends', 'insights', 'eat', 'settings'];
const $ = (sel, root = document) => root.querySelector(sel);
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) =>
  ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

const ui = {
  view: 'log',
  trendDays: 30,
  historyRange: 30,
  log: { detailsOpen: false },
  logFormOpen: false,
  edit: { detailsOpen: true },
};

let draft = freshDraft();
let editDraft = null;

function freshDraft() {
  return store.normalizeEntry({ ts: new Date().toISOString(), bristol: 4, complete: 4 });
}

// ---- small utils -----------------------------------------------------------

function toLocalInput(iso) {
  const d = new Date(iso);
  const p = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}T${p(d.getHours())}:${p(d.getMinutes())}`;
}
const fromLocalInput = (s) => (s ? new Date(s).toISOString() : new Date().toISOString());

const timeFmt = (d) => new Date(d).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });

function timeAgo(d) {
  const mins = Math.round((Date.now() - new Date(d)) / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const h = Math.round(mins / 60);
  if (h < 24) return `${h}h ago`;
  const days = Math.round(h / 24);
  return days === 1 ? 'yesterday' : `${days} days ago`;
}

function dayLabel(key) {
  const today = dayKey(new Date());
  const y = new Date(); y.setDate(y.getDate() - 1);
  if (key === today) return 'Today';
  if (key === dayKey(y)) return 'Yesterday';
  const [Y, M, D] = key.split('-').map(Number);
  return new Date(Y, M - 1, D).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' });
}

let toastTimer;
let toastActions = [];
/** `actions` turns the toast into an undo affordance rather than a notification. */
function toast(msg, actions = []) {
  const el = $('#toast');
  toastActions = actions;
  el.innerHTML = `<span>${esc(msg)}</span>` + actions.map((a, i) =>
    `<button type="button" class="toast-btn" data-act="toast-action" data-idx="${i}">${esc(a.label)}</button>`).join('');
  el.hidden = false;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => { el.hidden = true; toastActions = []; }, actions.length ? 7000 : 2200);
}
function dismissToast() {
  $('#toast').hidden = true;
  toastActions = [];
  clearTimeout(toastTimer);
}

/** Reports the save honestly: a blocked write must not show a success toast. */
function savedToast(msg, actions = []) {
  if (store.isPersisted()) return toast(msg, actions);
  toast('Not saved — this browser is blocking storage', [
    { label: 'Why?', run: () => alert(
      'Throne keeps everything in this browser\'s local storage.\n\n'
      + 'Private browsing blocks it entirely, and a full disk or restrictive site '
      + 'settings can too. Nothing you log will survive a reload until that is '
      + 'resolved.\n\nExport a backup from the Data tab if you have entries you '
      + 'need to keep.') },
  ]);
}

function download(filename, text, type) {
  const url = URL.createObjectURL(new Blob([text], { type }));
  const a = document.createElement('a');
  a.href = url; a.download = filename;
  document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1500);
}

// ---- shared entry form -----------------------------------------------------

/**
 * Urgency, Straining and Pain all render None/Mild/Moderate/Severe. Without a
 * group name a screen reader announces six identical sets and the user cannot
 * tell which signal they are rating.
 */
function segButtons(target, field, options, current, labelId) {
  return `<div class="seg" role="group"${labelId ? ` aria-labelledby="${labelId}"` : ''}>${options.map((o) => `
    <button type="button" data-target="${target}" data-field="${field}" data-value="${esc(o.value)}"
      aria-pressed="${String(o.value) === String(current)}">${esc(o.label)}</button>`).join('')}</div>`;
}

function formHTML(d, target) {
  const b = BRISTOL_BY_TYPE[d.bristol];
  const col = COLOR_BY_ID[d.color] || COLORS[0];
  const open = ui[target].detailsOpen ? 'open' : '';

  return `
  <div class="field">
    <span class="field-label" id="lbl-${target}-bristol">Form — Bristol scale</span>
    <div class="bristol-grid" role="group" aria-labelledby="lbl-${target}-bristol">
      ${BRISTOL.map((x) => `
        <button type="button" class="bristol-opt" data-target="${target}" data-field="bristol" data-value="${x.type}"
          aria-pressed="${x.type === d.bristol}" title="${esc(x.name)}"
          style="${x.type === d.bristol ? `color:${TONE_COLOR[x.tone]}` : ''}">
          <span class="b-num">${x.type}</span>
          ${bristolArt(x.type)}
          <span class="b-name">${esc(x.short)}</span>
        </button>`).join('')}
    </div>
    <div class="bristol-readout" style="border-left-color:${TONE_COLOR[b.tone]}">
      <b>Type ${b.type} — ${esc(b.name)}</b>
      <span>${esc(b.meaning)} <em>${esc(b.transit)}.</em></span>
    </div>
  </div>

  <div class="field">
    <span class="field-label" id="lbl-${target}-color">Colour</span>
    <div class="swatches" role="group" aria-labelledby="lbl-${target}-color">
      ${COLORS.map((c) => `
        <button type="button" class="swatch" data-target="${target}" data-field="color" data-value="${c.id}"
          aria-pressed="${c.id === d.color}" title="${esc(c.meaning)}">
          <i style="background:${c.hex}"></i>${esc(c.name)}
        </button>`).join('')}
    </div>
    ${col.normal ? '' : `<p class="sub" style="margin:8px 0 0">${esc(col.meaning)}</p>`}
  </div>

  <div class="field">
    <label class="field-label" for="when-${target}">When</label>
    <input type="datetime-local" id="when-${target}" data-target="${target}" data-field="ts"
      max="${toLocalInput(new Date())}" value="${toLocalInput(d.ts)}">
  </div>

  <details class="more" data-target="${target}" ${open}>
    <summary>Symptoms &amp; details${open ? '' : ' — optional'}</summary>
    <div>
      <div class="field">
        <span class="field-label" id="lbl-${target}-urgency">Urgency</span>
        ${segButtons(target, 'urgency', SCALE_0_3.map((l, i) => ({ label: l, value: i })), d.urgency, `lbl-${target}-urgency`)}
      </div>
      <div class="field">
        <span class="field-label" id="lbl-${target}-strain">Straining</span>
        ${segButtons(target, 'strain', SCALE_0_3.map((l, i) => ({ label: l, value: i })), d.strain, `lbl-${target}-strain`)}
      </div>
      <div class="field">
        <span class="field-label" id="lbl-${target}-pain">Pain</span>
        ${segButtons(target, 'pain', SCALE_0_3.map((l, i) => ({ label: l, value: i })), d.pain, `lbl-${target}-pain`)}
      </div>
      <div class="field">
        <span class="field-label" id="lbl-${target}-blood">Blood</span>
        ${segButtons(target, 'blood', BLOOD_OPTIONS.map((o) => ({ label: o.name, value: o.id })), d.blood, `lbl-${target}-blood`)}
      </div>
      <div class="field">
        <span class="field-label" id="lbl-${target}-volume">Amount</span>
        ${segButtons(target, 'volume', [
          { label: 'Small', value: 'small' }, { label: 'Medium', value: 'medium' }, { label: 'Large', value: 'large' },
        ], d.volume, `lbl-${target}-volume`)}
      </div>
      <div class="field">
        <span class="field-label" id="lbl-${target}-complete">Felt fully emptied</span>
        ${segButtons(target, 'complete', [1, 2, 3, 4, 5].map((n) => ({ label: String(n), value: n })), d.complete, `lbl-${target}-complete`)}
        <p class="sub" style="margin:6px 0 0">1 = still needed to go · 5 = completely done</p>
      </div>
      <div class="row">
        <label class="check"><input type="checkbox" data-target="${target}" data-field="mucus" ${d.mucus ? 'checked' : ''}> Mucus</label>
        <label class="check"><input type="checkbox" data-target="${target}" data-field="floats" ${d.floats ? 'checked' : ''}> Floated</label>
      </div>
      <label class="check"><input type="checkbox" data-target="${target}" data-field="greasy" ${d.greasy ? 'checked' : ''}> Greasy, foul or hard to flush</label>
      <p class="sub" style="margin:2px 0 12px">Floating on its own is just gas and means nothing. Floating <em>plus</em> greasy and pale is the combination that matters.</p>
      <div class="field">
        <label class="field-label" for="dur-${target}">Time on the throne (min)</label>
        <input type="number" id="dur-${target}" min="0" max="120" inputmode="numeric" placeholder="e.g. 4"
          data-target="${target}" data-field="durationMin" value="${d.durationMin ?? ''}">
      </div>
      <div class="field">
        <span class="field-label" id="lbl-${target}-tags">Context — food, meds, how you felt</span>
        <div class="seg" role="group" aria-labelledby="lbl-${target}-tags">
          ${DEFAULT_TAGS.map((t) => `
            <button type="button" class="chip" data-target="${target}" data-tag="${esc(t)}"
              aria-pressed="${d.tags.includes(t)}">${esc(t)}</button>`).join('')}
        </div>
      </div>
      <div class="field">
        <label class="field-label" for="notes-${target}">Notes</label>
        <textarea id="notes-${target}" data-target="${target}" data-field="notes" placeholder="Anything else worth remembering.">${esc(d.notes)}</textarea>
      </div>
    </div>
  </details>`;
}

// ---- views -----------------------------------------------------------------

function renderLog(entries) {
  const todayKey = dayKey(new Date());
  const today = entries.filter((e) => dayKey(e.ts) === todayKey);
  const last = entries[0];
  const markedNone = store.getNoneDays().includes(todayKey);

  return `
  <div class="card">
    <h2>${last ? 'Log it' : 'How was it?'}</h2>
    <p class="sub">${last
      ? `Last logged ${esc(timeAgo(last.ts))} · ${today.length} today`
      : 'Tap the shape that matches. That is the whole thing.'}</p>
    <div class="bristol-grid quick-grid">
      ${BRISTOL.map((x) => `
        <button type="button" class="bristol-opt quick" data-act="quick-log" data-value="${x.type}"
          style="color:${TONE_COLOR[x.tone]}" title="${esc(x.name)} — ${esc(x.meaning)}">
          <span class="b-num">${x.type}</span>
          ${bristolArt(x.type)}
          <span class="b-name">${esc(x.short)}</span>
        </button>`).join('')}
    </div>
    <p class="sub quick-hint">One tap saves it with the time. You can add detail straight after, or never.</p>
    ${today.length ? '' : `
    <button type="button" class="btn secondary none-btn" data-act="toggle-none"
      aria-pressed="${markedNone}">${markedNone ? '✓ Marked: nothing today' : 'Nothing today'}</button>
    <p class="sub quick-hint">Recording a blank day is real data. Without it the app cannot tell a day you did not go from a day you forgot to log.</p>`}
  </div>

  <details class="card detail-form" data-panel="logform" ${ui.logFormOpen ? 'open' : ''}>
    <summary>Log with full detail instead</summary>
    <div class="detail-form-body">
      ${formHTML(draft, 'log')}
      <div class="btn-row" style="margin-top:14px">
        <button class="btn" type="button" data-act="save-log">Save entry</button>
        <button class="btn secondary slim" type="button" data-act="reset-log" style="flex:0 0 auto">Reset</button>
      </div>
    </div>
  </details>

  ${today.length ? `
  <h3 class="section-title">Today</h3>
  ${today.map(entryRow).join('')}` : ''}`;
}

function entryRow(e) {
  const b = BRISTOL_BY_TYPE[e.bristol];
  const c = COLOR_BY_ID[e.color] || COLORS[0];
  const flags = [];
  if (e.blood !== 'none') flags.push('<span class="pill bad">blood</span>');
  if (e.pain >= 2) flags.push('<span class="pill warn">pain</span>');
  if (e.mucus) flags.push('<span class="pill">mucus</span>');
  const meta = [
    e.quick ? null : c.name,
    e.strain ? `strain ${e.strain}/3` : null,
    e.urgency ? `urgency ${e.urgency}/3` : null,
    e.tags.length ? e.tags.join(', ') : null,
  ].filter(Boolean).join(' · ');

  return `<button class="entry" type="button" data-act="edit" data-id="${esc(e.id)}">
    <span class="entry-art" style="color:${TONE_COLOR[b.tone]}">${bristolArt(e.bristol)}</span>
    <span class="entry-main">
      <span class="entry-title">
        <i class="dot-color" style="background:${e.quick ? 'transparent' : c.hex};${e.quick ? 'border-style:dashed' : ''}"
          title="${e.quick ? 'Logged in one tap — colour not recorded' : esc(c.name)}"></i>
        Type ${e.bristol} · ${esc(b.short)} ${flags.join(' ')}
      </span>
      <span class="entry-meta">${esc(meta)}${e.notes ? ` · ${esc(e.notes.slice(0, 40))}` : ''}</span>
    </span>
    <span class="entry-time">${esc(timeFmt(e.ts))}</span>
  </button>`;
}

function renderHistory(entries) {
  const ranges = [7, 30, 90, 0];
  const scoped = ui.historyRange ? withinDays(entries, ui.historyRange) : entries;

  const groups = new Map();
  for (const e of scoped) {
    const k = dayKey(e.ts);
    if (!groups.has(k)) groups.set(k, []);
    groups.get(k).push(e);
  }

  const head = `
  <div class="card">
    <h2>History</h2>
    <p class="sub">${scoped.length} entr${scoped.length === 1 ? 'y' : 'ies'} · tap any one to edit</p>
    <div class="seg">${ranges.map((r) => `
      <button type="button" data-act="range" data-value="${r}" aria-pressed="${r === ui.historyRange}">
        ${r ? `${r} days` : 'All'}</button>`).join('')}</div>
  </div>`;

  if (!scoped.length) {
    return head + `<div class="empty-state"><div class="big">🧻</div>
      <p>Nothing logged in this window.</p></div>`;
  }

  return head + [...groups.entries()].map(([k, list]) => `
    <div class="day-group">
      <div class="day-head"><span>${esc(dayLabel(k))}</span><span>${list.length}×</span></div>
      ${list.map(entryRow).join('')}
    </div>`).join('');
}

function renderTrends(entries) {
  const days = ui.trendDays;
  const opts = { noneDays: store.getNoneDays() };
  const s = computeStats(entries, days, opts);
  const score = gutScore(entries, Math.min(days, 14), opts);
  const trend = bristolTrend(entries, days);

  const tiles = [
    { val: s.count, label: 'Movements', note: `${s.perDay}/day over ${s.attributedDays}d` },
    { val: s.avgBristol ?? '–', label: 'Avg type', note: s.avgBristol ? BRISTOL_BY_TYPE[Math.round(s.avgBristol)].short : '—' },
    { val: `${Math.round(s.idealPct)}%`, label: `Healthy 3–5 · ${days}d`, note: `${Math.round(s.constipatedPct)}% hard · ${Math.round(s.loosePct)}% loose` },
    { val: s.medianGapH != null ? `${s.medianGapH}h` : '–', label: 'Typical gap', note: s.longestGapH ? `longest ${s.longestGapH}h` : '—' },
  ];

  const dist = s.distribution.map((d) => ({
    label: String(d.type),
    value: d.count,
    color: TONE_COLOR[BRISTOL_BY_TYPE[d.type].tone],
    title: `Type ${d.type} — ${BRISTOL_BY_TYPE[d.type].name}: ${d.count}`,
  }));

  const colorSegs = COLORS.map((c) => ({ label: c.name, value: s.colorCounts.get(c.id) || 0, color: c.hex }));

  return `
  <div class="card">
    <div class="dialog-head"><h2>Trends</h2>
      <div class="seg">${[7, 30, 90].map((d) => `
        <button type="button" data-act="trend-days" data-value="${d}" aria-pressed="${d === days}">${d}d</button>`).join('')}
      </div>
    </div>

    <div class="score-row">
      ${scoreRing(score.score, { label: score.parts.map((p) => `${p.label} ${p.value}`).join(', ') })}
      <div class="score-parts">
        ${score.score == null && !score.parts.length ? `<p class="sub">${esc(score.reason)}</p>` : ''}
        ${score.score == null && score.parts.length ? `<p class="sub" style="grid-column:1/-1">${esc(score.reason)}</p>` : ''}
        ${score.parts.map((p) => `
          <div class="part-row">
            <span class="p-label">${esc(p.label)}</span>
            ${meter(p.value, p.value >= 75 ? 'var(--ok)' : p.value >= 50 ? 'var(--warn)' : 'var(--bad)')}
            <span class="p-val">${p.value}</span>
            <span class="part-note">${esc(p.note)}</span>
          </div>`).join('')}
      </div>
    </div>
    <p class="sub" style="margin:12px 0 0">Gut score weighs ${esc(score.parts.map((p) => p.label.toLowerCase()).join(', ') || 'nothing yet')} over the last 14 days.</p>
    ${score.score != null && !score.parts.some((p) => p.key === 'frequency') ? `
    <p class="sub" style="margin:6px 0 0"><b>Frequency is not scored yet.</b> Too much of this window has no record, and the app will not read unlogged days as days you did not go. Tap "Nothing today" on blank days to fill the gaps.</p>` : ''}
    ${s.gapDays ? `
    <p class="sub" style="margin:6px 0 0">${s.gapDays} unrecorded day${s.gapDays === 1 ? '' : 's'} excluded — rates cover the ${s.attributedDays} days with a record.</p>` : ''}
    ${score.score != null && !score.parts.some((p) => p.key === 'comfort') ? `
    <p class="sub" style="margin:6px 0 0"><b>Comfort is not scored yet.</b> One-tap entries do not record straining or pain, and the app will not assume you had none. Add detail to a few entries and it joins the score.</p>` : ''}
  </div>

  <div class="tiles">
    ${tiles.map((t) => `<div class="tile">
      <div class="tile-val">${esc(t.val)}</div>
      <div class="tile-label">${esc(t.label)}</div>
      <div class="tile-note">${esc(t.note)}</div>
    </div>`).join('')}
  </div>

  <div class="card" style="margin-top:14px">
    <h3>Consistency over time</h3>
    <p class="sub">7-day rolling average Bristol type. The shaded band is the healthy zone.</p>
    ${lineChart(trend, {
      min: 1, max: 7, yTicks: [1, 4, 7],
      bands: [{ from: 3, to: 5, color: 'var(--ok)' }],
    })}
  </div>

  <div class="card">
    <h3>Type distribution</h3>
    <p class="sub">Where your ${s.count} movements landed on the scale.</p>
    ${barChart(dist, { height: 140, label: 'Bristol type distribution' })}
  </div>

  <div class="card">
    <h3>Daily rhythm</h3>
    <p class="sub">Each square is a day over the last six months — darker means more movements.</p>
    ${calendarHeatmap(computeStats(entries, 182, opts).byDay, { weeks: 26 })}
    <div class="cal-legend"><span>Less</span>
      <i class="cal-0" style="background:var(--surface-2)"></i>
      <i style="background:color-mix(in srgb, var(--accent) 32%, var(--surface-2))"></i>
      <i style="background:color-mix(in srgb, var(--accent) 58%, var(--surface-2))"></i>
      <i style="background:color-mix(in srgb, var(--accent) 80%, var(--surface-2))"></i>
      <i style="background:var(--accent)"></i><span>More</span></div>
  </div>

  <div class="card">
    <h3>Time of day</h3>
    <p class="sub">When your gut actually wakes up.</p>
    ${hourHistogram(s.hourCounts)}
  </div>

  <div class="card">
    <h3>Colour mix</h3>
    <p class="sub">${s.reviewedCount
      ? `${Math.round(s.normalColorPct)}% in the normal brown range, across the ${s.reviewedCount} ${s.reviewedCount === 1 ? 'entry' : 'entries'} where you recorded a colour.`
      : 'No colours recorded yet — one-tap entries do not assume one.'}</p>
    ${stackedBar(colorSegs)}
  </div>`;
}

function renderInsights(entries) {
  const opts = { noneDays: store.getNoneDays() };
  const cards = evaluate(entries, opts);
  const corr = tagCorrelations(entries);
  const s = computeStats(entries, 30, opts);

  return `
  <div class="card">
    <h2>What your log is saying</h2>
    <p class="sub">Pattern-matching over your last 30 days. Red items are the ones worth a doctor's opinion.</p>
    ${cards.map((c) => `
      <div class="insight ${c.level}">
        <span class="lvl">${c.level === 'alert' ? 'See a doctor' : c.level === 'warn' ? 'Worth attention' : c.level === 'good' ? 'Going well' : 'Note'}</span>
        <h3>${esc(c.title)}</h3>
        <p>${esc(c.detail)}</p>
        <div class="evidence">Based on: ${esc(c.evidence)}</div>
      </div>`).join('')}
  </div>

  ${corr.length ? `
  <div class="card">
    <h3>Tags that travel with looser or firmer stools</h3>
    <p class="sub">Correlation across your own log — not proof of cause. Your 90-day average is type ${corr[0].baseline}.</p>
    ${corr.map((c) => `
      <div class="corr">
        <span><b>${esc(c.tag)}</b> <span class="muted">· ${c.count} entries · avg type ${c.avg}</span></span>
        <span class="corr-delta ${c.delta > 0 ? 'looser' : 'firmer'}">${c.delta > 0 ? '+' : ''}${c.delta}</span>
      </div>`).join('')}
  </div>` : ''}

  <div class="card">
    <h3>The Bristol scale, in full</h3>
    <p class="sub">Your 30-day count next to each type.</p>
    ${BRISTOL.map((b) => {
      const n = s.distribution[b.type - 1].count;
      return `<div class="corr">
        <span style="display:flex;align-items:center;gap:10px">
          <span class="entry-art" style="color:${TONE_COLOR[b.tone]};width:28px;height:28px">${bristolArt(b.type)}</span>
          <span><b>Type ${b.type} — ${esc(b.name)}</b><br><span class="muted" style="font-size:12px">${esc(b.meaning)}</span></span>
        </span>
        <span class="mono muted nowrap">${n}×</span>
      </div>`;
    }).join('')}
  </div>

  <div class="disclaimer">
    <b>This is not a diagnosis.</b> Throne matches patterns in what you logged against
    well-established gut-health guidance. It cannot examine you and it does not know your
    history. Anything red here — blood, black or pale stools, severe pain, or a change in
    habit lasting more than three weeks — is a reason to talk to a clinician, not to
    self-treat. Bring this log with you; it is exactly the kind of detail they ask for.
  </div>`;
}

const CONFIDENCE_NOTE = {
  good: 'Based on a solid two weeks of logging.',
  fair: 'Based on a thin two weeks — keep logging to sharpen this.',
  low: 'Based on very few entries, so treat it as a first guess.',
  none: '',
};

const evBadge = (strength) => strength
  ? `<span class="ev ev-${strength}">${esc(STRENGTH_LABEL[strength] || strength)}</span>` : '';

/** Superscript source markers that link out to the real paper or guideline. */
function refs(ids = []) {
  return ids.map((id) => {
    const src = SOURCES[id];
    if (!src) return '';
    return `<a class="source-ref" href="${esc(src.url)}" target="_blank" rel="noopener"
      title="${esc(src.label)}">[${esc(src.label.split(/[—,(]/)[0].trim().slice(0, 12))}]</a>`;
  }).join('');
}

function adviceRow(a) {
  return `<div class="advice">
    <div class="advice-icon">${a.icon || '•'}</div>
    <div class="advice-body">
      <div class="advice-title">${esc(a.title)}${evBadge(a.strength)}</div>
      <div class="advice-why">${esc(a.why)}${refs(a.sources)}</div>
      ${a.dose ? `<span class="advice-dose">${esc(a.dose)}</span>` : ''}
      ${a.caution ? `<div class="advice-why" style="margin-top:5px"><em>${esc(a.caution)}</em></div>` : ''}
    </div>
  </div>`;
}

function renderEat(entries) {
  const opts = { noneDays: store.getNoneDays() };
  const f = dietaryFocus(entries, 14, opts);
  const s = computeStats(entries, 30, opts);
  const g = FOCUS_GUIDANCE[f.focus];
  const cautions = activeCautions(entries, f.focus);
  const usedSources = new Set();
  const track = (ids = []) => ids.forEach((i) => usedSources.add(i));

  if (g) {
    track(g.mechanismSources); track(g.watchForSources);
    [...(g.eat || []), ...(g.doAlso || [])].forEach((a) => track(a.sources));
  }
  cautions.forEach((c) => track(CAUTIONS[c.key]?.sources));
  MYTHS.forEach((m) => track(m.sources));
  MAINTENANCE.forEach((m) => track(m.sources));
  SELF_TESTS.forEach((t) => track(t.sources));
  TIMESCALES.forEach((t) => track(t.sources));
  track(FIBRE_MODEL.sources); track(TARGETS.fibre.sources); track(TARGETS.fluid.sources);
  track(FREQUENCY_FACTS.sources);
  Object.values(COLOR_GUIDANCE).forEach((c) => track(c.sources));

  const showMaintenance = f.focus === 'maintain' || f.focus === 'unknown';

  return `
  <div class="focus-banner">
    <span class="focus-conf">${f.focus === 'unknown' ? 'Needs more data' : 'Your last 14 days'}</span>
    <h2>${esc(f.headline)}</h2>
    <div class="focus-because">${esc(f.because)}</div>
    ${CONFIDENCE_NOTE[f.confidence] ? `<p class="sub" style="margin:8px 0 0">${esc(CONFIDENCE_NOTE[f.confidence])}</p>` : ''}
  </div>

  ${cautions.length ? cautions.map((c) => {
    const cau = CAUTIONS[c.key];
    return `<div class="insight warn">
      <span class="lvl">Before you change your diet</span>
      <h3>${esc(cau.title)}</h3>
      <p>${esc(cau.detail)}${refs(cau.sources)}</p>
      <div class="evidence">Based on: ${esc(c.evidence)}</div>
    </div>`;
  }).join('') : ''}

  ${g && g.mechanism ? `
  <div class="card">
    <h3>${esc(g.title)}</h3>
    <p class="sub" style="margin-bottom:10px">${esc(g.explains)}</p>
    <p style="font-size:13.5px;margin:0">${esc(g.mechanism)}${refs(g.mechanismSources)}</p>
  </div>` : ''}

  ${g && g.eat.length ? `
  <div class="card">
    <h3>What to eat</h3>
    <p class="sub">Ordered by strength of evidence, not by how often you have heard it.</p>
    ${g.eat.map(adviceRow).join('')}
  </div>` : ''}

  ${g && g.doAlso.length ? `
  <div class="card">
    <h3>Also worth doing</h3>
    ${g.doAlso.map(adviceRow).join('')}
  </div>` : ''}

  ${showMaintenance ? `
  <div class="card">
    <h3>Keeping it that way</h3>
    ${MAINTENANCE.map((m) => `<div class="advice"><div class="advice-icon">·</div>
      <div class="advice-body"><div class="advice-why">${esc(m.text)}${evBadge(m.strength)}${refs(m.sources)}</div></div></div>`).join('')}
  </div>` : ''}

  ${f.focus === 'loose' || f.focus === 'alternating' ? `
  <div class="card">
    <h3>Two things you can test yourself</h3>
    <p class="sub">These split the possible causes roughly in half, which is more than a list of them can do.</p>
    ${SELF_TESTS.map((t) => `<div class="advice">
      <div class="advice-icon">?</div>
      <div class="advice-body">
        <div class="advice-title">${esc(t.question)}${evBadge(t.strength)}</div>
        <div class="advice-why">${esc(t.detail)}${refs(t.sources)}</div>
      </div></div>`).join('')}
  </div>` : ''}

  ${g && g.watchFor ? `
  <div class="insight alert">
    <span class="lvl">When to stop adjusting your diet</span>
    <h3>Get this looked at</h3>
    <p>${esc(g.watchFor)}${refs(g.watchForSources)}</p>
  </div>` : ''}

  <div class="card">
    <h3>How long before anything changes</h3>
    <p class="sub">The number most people get wrong — abandoning at day five something that needed four weeks.</p>
    ${TIMESCALES.map((t) => `<div class="target-row">
      <span><b>${esc(t.when)}</b><br><span class="muted" style="font-size:12px">${esc(t.what)}</span></span>
      <span>${refs(t.sources)}</span>
    </div>`).join('')}
    <p class="sub" style="margin:12px 0 0">${esc(TIMESCALE_NOTE)}</p>
  </div>

  <details class="card" style="padding:0">
    <summary style="padding:16px;cursor:pointer;font-weight:650;font-size:14px">Where fibre actually comes from</summary>
    <div style="padding:0 16px 16px">
      <p class="sub" style="margin-top:0">${esc(FIBRE_MODEL.headline)}${refs(FIBRE_MODEL.sources)}</p>
      <p style="font-size:13px">${esc(FIBRE_MODEL.detail)}</p>
      <div class="target-row">
        <span>Daily target</span>
        <span class="target-val">${TARGETS.fibre.uk}g <span class="muted" style="font-weight:400">UK · US ${TARGETS.fibre.us.women}–${TARGETS.fibre.us.men}g</span>${refs(TARGETS.fibre.sources)}</span>
      </div>
      <div class="target-row">
        <span>Total water <span class="muted">(food included)</span></span>
        <span class="target-val">${TARGETS.fluid.women}–${TARGETS.fluid.men}L${refs(TARGETS.fluid.sources)}</span>
      </div>
      <p class="sub" style="margin:10px 0">${esc(TARGETS.fibre.typical)} ${esc(TARGETS.fibre.note)}</p>
      <div class="table-scroll">
        <table class="food-table">
          <thead><tr><th>Food</th><th>Portion</th><th class="num">Fibre</th><th>Behaviour in the gut</th></tr></thead>
          <tbody>${FIBRE_TABLE.map((r) => `<tr>
            <td><b>${esc(r.food)}</b></td>
            <td class="portion">${esc(r.portion)}</td>
            <td class="num">${r.g}g</td>
            <td><span class="fibre-kind kind-${r.kind}">${esc(r.kind)}</span> <span class="portion">${esc(r.behaviour)}</span></td>
          </tr>`).join('')}</tbody>
        </table>
      </div>
      <p class="sub" style="margin:10px 0 0">${esc(FIBRE_TABLE_NOTE)}${refs(['bnf'])}</p>
    </div>
  </details>

  <details class="card" style="padding:0">
    <summary style="padding:16px;cursor:pointer;font-weight:650;font-size:14px">Things you have been told that are not true</summary>
    <div style="padding:0 16px 16px">
      ${MYTHS.map((m) => `<div class="advice">
        <div class="advice-icon">✗</div>
        <div class="advice-body">
          <div class="advice-title">${esc(m.claim)}${evBadge(m.strength)}</div>
          <div class="advice-why"><b>${esc(m.verdict)}.</b> ${esc(m.detail)}${refs(m.sources)}</div>
        </div></div>`).join('')}
    </div>
  </details>

  <details class="card" style="padding:0">
    <summary style="padding:16px;cursor:pointer;font-weight:650;font-size:14px">What each type means</summary>
    <div style="padding:0 16px 16px">
      ${BRISTOL.map((b) => {
        const n = s.distribution[b.type - 1].count;
        return `<details class="type-acc">
          <summary>
            <span class="acc-art" style="color:${TONE_COLOR[b.tone]}">${bristolArt(b.type)}</span>
            <span class="acc-title">Type ${b.type} — ${esc(b.name)}</span>
            <span class="acc-count">${n}×</span>
          </summary>
          <div class="acc-body">
            <p>${esc(b.meaning)}</p>
            <p class="sub" style="margin:0">${esc(b.transit)}.</p>
          </div>
        </details>`;
      }).join('')}
      <p class="sub" style="margin:12px 0 0"><b>${esc(FREQUENCY_FACTS.headline)}</b> ${esc(FREQUENCY_FACTS.detail)}${refs(FREQUENCY_FACTS.sources)}</p>
    </div>
  </details>

  <details class="card" style="padding:0">
    <summary style="padding:16px;cursor:pointer;font-weight:650;font-size:14px">What the colours mean</summary>
    <div style="padding:0 16px 16px">
      ${COLORS.map((c) => {
        const cg = COLOR_GUIDANCE[c.id];
        if (!cg) return '';
        const n = s.colorCounts.get(c.id) || 0;
        return `<div class="advice">
          <div class="advice-icon"><i style="display:inline-block;width:15px;height:15px;border-radius:50%;background:${c.hex};border:1px solid rgba(128,128,128,.4)"></i></div>
          <div class="advice-body">
            <div class="advice-title">${esc(c.name)}
              ${cg.urgency === 'high' ? '<span class="ev ev-strong" style="color:var(--bad);border-color:var(--bad)">See a doctor</span>' : ''}
              ${n ? `<span class="acc-count" style="float:right">${n}×</span>` : ''}</div>
            <div class="advice-why">${esc(cg.text)}${refs(cg.sources)}</div>
            ${cg.caveat ? `<div class="advice-why" style="margin-top:4px"><em>${esc(cg.caveat)}</em></div>` : ''}
          </div></div>`;
      }).join('')}
    </div>
  </details>

  <details class="card" style="padding:0">
    <summary style="padding:16px;cursor:pointer;font-weight:650;font-size:14px">Sources</summary>
    <div style="padding:0 16px 16px">
      <p class="sub" style="margin-top:0">Every claim on this page traces to one of these. Where the evidence is thin, it says so rather than rounding up.</p>
      <div class="source-list">
        ${[...usedSources].filter((id) => SOURCES[id]).sort().map((id) =>
          `<div>· <a href="${esc(SOURCES[id].url)}" target="_blank" rel="noopener">${esc(SOURCES[id].label)}</a></div>`).join('')}
      </div>
    </div>
  </details>

  <div class="disclaimer">
    <b>General information, not personal medical advice.</b> This is nutrition guidance
    matched to the pattern in your own log. It cannot examine you, does not know your
    history, and none of it replaces a clinician — particularly for anything in a red box above.
  </div>`;
}

function renderSettings(entries) {
  const settings = store.getSettings();
  const bytes = new Blob([store.exportJSON()]).size;
  const first = entries.at(-1);

  return `
  <div class="card">
    <h2>Your data</h2>
    <p class="sub">${entries.length} entries${first ? `, since ${new Date(first.ts).toLocaleDateString()}` : ''} · ${(bytes / 1024).toFixed(1)} KB
      stored in this browser only. Nothing is uploaded anywhere.</p>
    <div class="btn-row" style="margin-bottom:10px">
      <button class="btn secondary" type="button" data-act="export-json">Export JSON</button>
      <button class="btn secondary" type="button" data-act="export-csv">Export CSV</button>
    </div>
    <div class="btn-row">
      <button class="btn secondary" type="button" data-act="import">Import backup</button>
    </div>
    <input type="file" id="importFile" accept="application/json,.json" hidden>
  </div>

  <div class="card">
    <h3>Appearance</h3>
    <p class="sub">Theme</p>
    <div class="seg">
      ${['system', 'light', 'dark'].map((t) => `
        <button type="button" data-act="theme" data-value="${t}" aria-pressed="${settings.theme === t}">${t}</button>`).join('')}
    </div>
  </div>

  <div class="card">
    <h3>Try it with sample data</h3>
    <p class="sub">Loads 60 days of realistic entries so the charts and insights have something to chew on. This replaces what is there now.</p>
    <button class="btn secondary" type="button" data-act="demo">Load 60 days of demo data</button>
  </div>

  <div class="card">
    <h3>Danger zone</h3>
    <p class="sub">Deleting is permanent and there is no cloud copy. Export first.</p>
    <button class="btn danger" type="button" data-act="clear">Delete everything</button>
  </div>

  <div class="disclaimer">
    Throne stores everything in this browser's local storage on this device. Clearing site
    data, or using private browsing, will remove it. Export a JSON backup if it matters to you.
  </div>`;
}

// ---- render loop -----------------------------------------------------------

/**
 * Rebuilding a view with innerHTML throws focus to <body>. For a keyboard or
 * screen-reader user that made the detail form unusable — every tag chip reset
 * the tab position to the top of an 83-control form. Remember which control was
 * active by its data attributes, and restore it after the swap.
 */
function focusKey(el) {
  if (!el || el === document.body) return null;
  const d = el.dataset || {};
  if (d.tag) return `[data-tag="${CSS.escape(d.tag)}"][data-target="${d.target}"]`;
  if (d.field) return `[data-field="${CSS.escape(d.field)}"]${d.value != null ? `[data-value="${CSS.escape(d.value)}"]` : ''}[data-target="${d.target}"]`;
  // History rows all share data-act="edit", so the id is what makes it the row
  // you were actually on rather than the first one.
  if (d.act) return `[data-act="${CSS.escape(d.act)}"]`
    + (d.id != null ? `[data-id="${CSS.escape(d.id)}"]` : '')
    + (d.value != null ? `[data-value="${CSS.escape(d.value)}"]` : '');
  return null;
}

function restoreFocus(sel, root = document) {
  if (!sel) return;
  const el = root.querySelector(sel);
  if (el) el.focus({ preventScroll: true });
}

function render() {
  const keep = focusKey(document.activeElement);
  const entries = store.getEntries();

  for (const v of VIEWS) $(`#view-${v}`).hidden = v !== ui.view;
  document.querySelectorAll('.tab').forEach((t) => {
    const on = t.dataset.view === ui.view;
    t.setAttribute('aria-current', on ? 'page' : 'false');
  });

  const target = $(`#view-${ui.view}`);
  if (ui.view === 'log') target.innerHTML = renderLog(entries);
  if (ui.view === 'history') target.innerHTML = renderHistory(entries);
  if (ui.view === 'trends') target.innerHTML = renderTrends(entries);
  if (ui.view === 'insights') target.innerHTML = renderInsights(entries);
  if (ui.view === 'eat') target.innerHTML = renderEat(entries);
  if (ui.view === 'settings') target.innerHTML = renderSettings(entries);

  const cov = loggingCoverage(entries, 7, { noneDays: store.getNoneDays() });
  const chip = $('#streakChip');
  chip.hidden = cov.logged === 0;
  chip.textContent = `${cov.logged}/${cov.of} days logged`;
  chip.title = 'Days in the last week with any record. Not a streak — this log is only useful if every entry is a real observation.';
  restoreFocus(keep);
}

function openEditor(id) {
  const e = store.getEntries().find((x) => x.id === id);
  if (!e) return;
  editDraft = { ...e };
  ui.edit.detailsOpen = true;
  renderDialog();
  $('#entryDialog').showModal();
}

function renderDialog() {
  if (!editDraft) return;
  const keep = focusKey(document.activeElement);
  $('#entryDialog').innerHTML = `
    <div class="dialog-inner">
      <div class="dialog-head">
        <h2 id="dialogTitle">Edit entry</h2>
        <button class="icon-btn" type="button" data-act="close-dialog" aria-label="Close">✕</button>
      </div>
      ${formHTML(editDraft, 'edit')}
      <div class="btn-row" style="margin-top:16px">
        <button class="btn" type="button" data-act="save-edit">Save changes</button>
        <button class="btn danger slim" type="button" data-act="delete-entry" style="flex:0 0 auto">Delete</button>
      </div>
    </div>`;
  restoreFocus(keep, $('#entryDialog'));
}

// ---- theme -----------------------------------------------------------------

function applyTheme(theme) {
  if (theme === 'system') document.documentElement.removeAttribute('data-theme');
  else document.documentElement.setAttribute('data-theme', theme);
}

// ---- events ----------------------------------------------------------------

function draftFor(target) { return target === 'edit' ? editDraft : draft; }

function rerenderForm(target) {
  if (target === 'edit') renderDialog();
  else render();
}

document.addEventListener('click', (ev) => {
  const btn = ev.target.closest('button');
  if (!btn) return;

  // Tab navigation
  if (btn.classList.contains('tab')) {
    location.hash = btn.dataset.view;
    return;
  }

  // Form field buttons (Bristol, colour, segmented scales)
  if (btn.dataset.field) {
    const t = btn.dataset.target;
    const d = draftFor(t);
    if (!d) return;
    const raw = btn.dataset.value;
    d[btn.dataset.field] = /^-?\d+$/.test(raw) ? Number(raw) : raw;
    rerenderForm(t);
    return;
  }

  // Tag chips
  if (btn.dataset.tag) {
    const t = btn.dataset.target;
    const d = draftFor(t);
    if (!d) return;
    const tag = btn.dataset.tag;
    d.tags = d.tags.includes(tag) ? d.tags.filter((x) => x !== tag) : [...d.tags, tag];
    rerenderForm(t);
    return;
  }

  const act = btn.dataset.act;
  if (!act) return;

  if (act === 'toast-action') {
    const run = toastActions[Number(btn.dataset.idx)]?.run;
    dismissToast();
    run?.();
    return;
  }

  switch (act) {
    case 'quick-log': {
      const type = Number(btn.dataset.value);
      const saved = store.addEntry({ ts: new Date().toISOString(), bristol: type, complete: 4, quick: true });
      render();
      savedToast(`Type ${type} logged`, [
        { label: 'Undo', run: () => { store.deleteEntry(saved.id); render(); toast('Removed'); } },
        { label: 'Add detail', run: () => openEditor(saved.id) },
      ]);
      break;
    }
    case 'save-log': {
      store.addEntry(draft);
      draft = freshDraft();
      ui.log.detailsOpen = false;
      savedToast('Logged ✓');
      render();
      break;
    }
    case 'toggle-none': {
      const key = dayKey(new Date());
      const on = !store.getNoneDays().includes(key);
      store.setNoneDay(key, on);
      render();
      toast(on ? 'Marked as a blank day' : 'Unmarked');
      break;
    }
    case 'reset-log':
      draft = freshDraft();
      render();
      toast('Cleared');
      break;

    case 'edit':
      openEditor(btn.dataset.id);
      break;
    case 'close-dialog':
      $('#entryDialog').close();
      break;
    case 'save-edit':
      // Opening and saving the editor means the symptoms were actually reviewed.
      store.updateEntry(editDraft.id, { ...editDraft, quick: false });
      $('#entryDialog').close();
      savedToast('Updated');
      render();
      break;
    case 'delete-entry':
      if (confirm('Delete this entry? This cannot be undone.')) {
        store.deleteEntry(editDraft.id);
        $('#entryDialog').close();
        toast('Deleted');
        render();
      }
      break;

    case 'range':
      ui.historyRange = Number(btn.dataset.value);
      render();
      break;
    case 'trend-days':
      ui.trendDays = Number(btn.dataset.value);
      render();
      break;

    case 'export-json':
      download(`throne-${dayKey(new Date())}.json`, store.exportJSON(), 'application/json');
      toast('Exported JSON');
      break;
    case 'export-csv':
      download(`throne-${dayKey(new Date())}.csv`, store.exportCSV(), 'text/csv');
      toast('Exported CSV');
      break;
    case 'import':
      $('#importFile').click();
      break;

    case 'theme': {
      const theme = btn.dataset.value;
      store.setSettings({ theme });
      applyTheme(theme);
      render();
      break;
    }
    case 'demo':
      if (store.getEntries().length && !confirm('This replaces your current entries with demo data. Continue?')) return;
      const demo = generateDemo();
      store.replaceAll(demo.entries, demo.noneDays);
      toast('Demo data loaded');
      ui.view = 'trends';
      location.hash = 'trends';
      render();
      break;
    case 'clear':
      if (confirm('Delete every entry permanently?') && confirm('Really? Export first if you want a copy.')) {
        store.clearAll();
        toast('All data deleted');
        render();
      }
      break;
  }
});

// Text, number, date and checkbox fields write straight to the draft.
document.addEventListener('input', (ev) => {
  const el = ev.target;
  if (!el.dataset?.field || el.tagName === 'BUTTON') return;
  const d = draftFor(el.dataset.target);
  if (!d) return;
  const f = el.dataset.field;
  if (el.type === 'checkbox') d[f] = el.checked;
  else if (f === 'ts') { if (el.value) d.ts = fromLocalInput(el.value); }
  else if (f === 'durationMin') d.durationMin = el.value === '' ? null : Number(el.value);
  else d[f] = el.value;
});

// Remember whether the details panel was open across re-renders.
document.addEventListener('toggle', (ev) => {
  const el = ev.target;
  if (el.tagName === 'DETAILS' && el.dataset.target) ui[el.dataset.target].detailsOpen = el.open;
  if (el.tagName === 'DETAILS' && el.dataset.panel === 'logform') ui.logFormOpen = el.open;
}, true);

document.addEventListener('change', (ev) => {
  if (ev.target.id !== 'importFile') return;
  const file = ev.target.files?.[0];
  if (!file) return;
  // Escape and Cancel are the reflex when unsure, so they must be the safe branch.
  const replace = store.getEntries().length > 0 && confirm(
    'Replace everything currently in the app with this file?\n\n'
    + 'OK = replace. Cancel = merge the file into what you already have (safe).');
  const merge = !replace;
  const rollback = store.exportJSON();   // dismissing the dialog replaces everything
  file.text()
    .then((text) => {
      const n = store.importJSON(text, { merge });
      render();
      savedToast(`Imported ${n} entries`, [
        { label: 'Undo import', run: () => { store.importJSON(rollback); render(); toast('Import undone'); } },
      ]);
    })
    .catch((err) => alert(`Could not import that file.\n\n${err.message}`));
  ev.target.value = '';
});

$('#themeBtn').addEventListener('click', () => {
  const order = ['system', 'light', 'dark'];
  const next = order[(order.indexOf(store.getSettings().theme) + 1) % order.length];
  store.setSettings({ theme: next });
  applyTheme(next);
  toast(`Theme: ${next}`);
  render();
});

$('#entryDialog').addEventListener('close', () => { editDraft = null; });

function routeFromHash() {
  const v = location.hash.replace('#', '');
  ui.view = VIEWS.includes(v) ? v : 'log';
  render();
  window.scrollTo({ top: 0 });
}
window.addEventListener('hashchange', routeFromHash);

// ---- boot ------------------------------------------------------------------

applyTheme(store.getSettings().theme);
routeFromHash();

if ('serviceWorker' in navigator && location.protocol.startsWith('http')) {
  navigator.serviceWorker.register('sw.js').catch(() => { /* offline support is a bonus, not a requirement */ });
}
