// Persistence. Everything lives in localStorage on this device — no network, ever.

const KEY = 'throne.data';
const SCHEMA_VERSION = 1;

const DEFAULT_SETTINGS = {
  theme: 'system',       // system | light | dark
};

function blank() {
  return { version: SCHEMA_VERSION, entries: [], noneDays: [], settings: { ...DEFAULT_SETTINGS } };
}

function migrate(raw) {
  if (!raw || typeof raw !== 'object') return blank();
  const data = { ...blank(), ...raw };
  data.settings = { ...DEFAULT_SETTINGS, ...(raw.settings || {}) };
  data.entries = Array.isArray(raw.entries) ? raw.entries.map(normalizeEntry) : [];
  data.noneDays = Array.isArray(raw.noneDays)
    ? [...new Set(raw.noneDays.filter((d) => /^\d{4}-\d{2}-\d{2}$/.test(d)))] : [];
  data.version = SCHEMA_VERSION;
  return data;
}

export function normalizeEntry(e = {}) {
  return {
    // Ids reach a DOM attribute, so an imported file must not choose their shape.
    id: typeof e.id === 'string' && /^[\w.:-]{1,64}$/.test(e.id) ? e.id : cryptoId(),
    ts: e.ts || new Date().toISOString(),
    bristol: clampInt(e.bristol, 1, 7, 4),
    color: e.color || 'brown',
    volume: e.volume || 'medium',        // small | medium | large
    urgency: clampInt(e.urgency, 0, 3, 0),
    strain: clampInt(e.strain, 0, 3, 0),
    pain: clampInt(e.pain, 0, 3, 0),
    blood: e.blood || 'none',
    mucus: !!e.mucus,
    floats: !!e.floats,
    greasy: !!e.greasy,
    complete: clampInt(e.complete, 1, 5, 4), // felt fully emptied, 1..5
    durationMin: e.durationMin === '' || e.durationMin == null ? null : Number(e.durationMin),
    // True when logged in one tap: the symptom fields hold defaults, not
    // observations, and must not be averaged as though they were reported.
    quick: !!e.quick,
    tags: Array.isArray(e.tags) ? e.tags.slice(0, 24) : [],
    notes: (e.notes || '').slice(0, 2000),
  };
}

function clampInt(v, lo, hi, dflt) {
  const n = Number(v);
  if (!Number.isFinite(n)) return dflt;
  return Math.min(hi, Math.max(lo, Math.round(n)));
}

export function cryptoId() {
  if (globalThis.crypto?.randomUUID) return crypto.randomUUID();
  return 'id-' + Math.random().toString(36).slice(2) + Date.now().toString(36);
}

// Chrome, Firefox and Edge exempt a persisted origin from eviction. Safari
// ignores it, but there is no cost to asking.
if (typeof navigator !== 'undefined' && navigator.storage?.persist) {
  navigator.storage.persisted?.().then((already) => {
    if (!already) navigator.storage.persist().catch(() => {});
  }).catch(() => {});
}

let state = load();
const listeners = new Set();

let loadFailed = false;

function load() {
  const raw = localStorage.getItem(KEY);
  try {
    return migrate(JSON.parse(raw));
  } catch (err) {
    // The next write would overwrite the damaged original and turn a
    // recoverable problem into a permanent one. Keep a copy first.
    if (raw) {
      loadFailed = true;
      try { localStorage.setItem(`${KEY}.corrupt.${Date.now()}`, raw); } catch { /* nothing more we can do */ }
      console.error('Saved data could not be read; the original was copied aside.', err);
    }
    return blank();
  }
}

/** True when existing data failed to parse and was set aside rather than lost. */
export function loadWasCorrupt() {
  return loadFailed;
}

let writeOk = true;

function persist() {
  try {
    localStorage.setItem(KEY, JSON.stringify(state));
    writeOk = true;
  } catch (err) {
    // Safari private browsing throws on every write, and iOS can evict storage.
    // Swallowing this silently is how three weeks of logging disappears on the
    // next reload, so the UI is told rather than shown a success message.
    writeOk = false;
    console.error('Could not save — storage is blocked or full.', err);
  }
}

/** False when the last write did not reach disk. */
export function isPersisted() {
  return writeOk;
}

function emit() {
  persist();
  for (const fn of listeners) fn(state);
}

// Two tabs each hold their own copy of state; without this, whichever saves last
// erases the other's entries with no indication.
if (typeof window !== 'undefined') {
  window.addEventListener('storage', (ev) => {
    if (ev.key !== KEY || ev.newValue == null) return;
    try {
      state = migrate(JSON.parse(ev.newValue));
      for (const fn of listeners) fn(state);
    } catch { /* a malformed write from elsewhere is not worth crashing over */ }
  });
}

export function subscribe(fn) {
  listeners.add(fn);
  fn(state);
  return () => listeners.delete(fn);
}

/** Entries, newest first. */
export function getEntries() {
  return [...state.entries].sort((a, b) => new Date(b.ts) - new Date(a.ts));
}

/** Days the user explicitly marked as "no movement", as local YYYY-MM-DD keys. */
export function getNoneDays() {
  return [...state.noneDays];
}

/** A day with entries cannot also be a "nothing" day, so recording one clears it. */
export function setNoneDay(dayKey, on = true) {
  const has = state.noneDays.includes(dayKey);
  if (on && !has) state.noneDays.push(dayKey);
  else if (!on && has) state.noneDays = state.noneDays.filter((d) => d !== dayKey);
  else return;
  emit();
}

export function getSettings() {
  return { ...state.settings };
}

export function setSettings(patch) {
  state.settings = { ...state.settings, ...patch };
  emit();
}

export function addEntry(entry) {
  const e = normalizeEntry(entry);
  // Logging a movement contradicts an earlier "nothing today" for that day.
  const key = e.ts.slice(0, 10);
  const local = new Date(e.ts);
  const localKey = `${local.getFullYear()}-${String(local.getMonth() + 1).padStart(2, '0')}-${String(local.getDate()).padStart(2, '0')}`;
  state.noneDays = state.noneDays.filter((d) => d !== localKey && d !== key);
  state.entries.push(e);
  emit();
  return e;
}

export function updateEntry(id, patch) {
  const i = state.entries.findIndex((e) => e.id === id);
  if (i === -1) return null;
  state.entries[i] = normalizeEntry({ ...state.entries[i], ...patch, id });
  emit();
  return state.entries[i];
}

export function deleteEntry(id) {
  const before = state.entries.length;
  state.entries = state.entries.filter((e) => e.id !== id);
  if (state.entries.length !== before) emit();
}

export function replaceAll(entries, noneDays = []) {
  state.entries = entries.map(normalizeEntry);
  state.noneDays = [...new Set(noneDays)];
  emit();
}

export function clearAll() {
  state = blank();
  emit();
}

// ---- import / export -------------------------------------------------------

export function exportJSON() {
  return JSON.stringify({
    app: 'throne',
    schema: SCHEMA_VERSION,
    exportedAt: new Date().toISOString(),
    // Scales are recorded so the file still makes sense without the app.
    fields: {
      bristol: '1 hardest - 7 most liquid (Bristol Stool Scale)',
      urgency: '0 none - 3 severe', strain: '0 none - 3 severe', pain: '0 none - 3 severe',
      complete: '1 still needed to go - 5 completely emptied',
      quick: 'true = logged in one tap; symptom fields are defaults, not observations',
      noneDays: 'local YYYY-MM-DD dates explicitly recorded as no movement',
    },
    ...state,
  }, null, 2);
}

const CSV_COLS = ['date', 'time', 'ts', 'bristol', 'bristol_name', 'color', 'volume',
  'urgency', 'strain', 'pain', 'blood', 'mucus', 'floats', 'greasy', 'complete',
  'durationMin', 'quick', 'tags', 'notes'];

const BRISTOL_NAMES = {
  1: 'separate hard lumps', 2: 'lumpy sausage', 3: 'sausage with cracks',
  4: 'smooth soft sausage', 5: 'soft blobs', 6: 'mushy ragged edges', 7: 'watery',
};

export function exportCSV() {
  const esc = (v) => {
    let s = v == null ? '' : String(v);
    // A leading =, +, -, @ or control char makes spreadsheets treat the cell as a
    // formula. This file is meant to be handed to a clinician, so it must not
    // execute anything when they open it.
    if (/^[=+\-@\t\r]/.test(s)) s = "'" + s;
    return /[",\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s;
  };
  const cell = (e, c) => {
    const d = new Date(e.ts);
    const p = (n) => String(n).padStart(2, '0');
    // The app is local-time throughout; a raw UTC stamp imports as text and can
    // land a 23:30 entry on the following day in a spreadsheet.
    if (c === 'date') return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
    if (c === 'time') return `${p(d.getHours())}:${p(d.getMinutes())}`;
    if (c === 'bristol_name') return BRISTOL_NAMES[e.bristol] || '';
    if (c === 'tags') return e.tags.join('|');
    return e[c];
  };
  const rows = getEntries().map((e) => CSV_COLS.map((c) => esc(cell(e, c))).join(','));
  // BOM so Excel on Windows reads it as UTF-8 rather than mangling accents.
  return '\uFEFF' + [CSV_COLS.join(','), ...rows].join('\n');
}

/** Accepts our own JSON export, or a bare array of entries. */
export function importJSON(text, { merge = false } = {}) {
  const parsed = JSON.parse(text);
  const incoming = Array.isArray(parsed) ? parsed : parsed.entries;
  if (!Array.isArray(incoming)) throw new Error('No entries found in that file.');
  const clean = incoming.map(normalizeEntry);
  if (merge) {
    const seen = new Set(state.entries.map((e) => e.id));
    state.entries.push(...clean.filter((e) => !seen.has(e.id)));
  } else {
    state.entries = clean;
  }
  if (!Array.isArray(parsed) && Array.isArray(parsed.noneDays)) {
    state.noneDays = merge
      ? [...new Set([...state.noneDays, ...parsed.noneDays])]
      : [...new Set(parsed.noneDays)];
  }
  if (!Array.isArray(parsed) && parsed.settings) {
    state.settings = { ...state.settings, ...parsed.settings };
  }
  emit();
  return clean.length;
}
