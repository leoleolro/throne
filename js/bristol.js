// Bristol Stool Scale — the clinical reference for stool form.
// Each type carries the plain-English reading a clinician would give it.

export const BRISTOL = [
  {
    type: 1,
    name: 'Separate hard lumps',
    short: 'Hard lumps',
    meaning: 'Severe constipation. Stool sat in the colon long enough for most water to be absorbed.',
    tone: 'bad',
    transit: 'Very slow transit (~100h)',
  },
  {
    type: 2,
    name: 'Lumpy sausage',
    short: 'Lumpy',
    meaning: 'Mild constipation. Formed but compacted and usually hard to pass.',
    tone: 'poor',
    transit: 'Slow transit',
  },
  {
    type: 3,
    name: 'Sausage with cracks',
    short: 'Cracked',
    meaning: 'Normal. On the firm side of healthy.',
    tone: 'good',
    transit: 'Normal transit',
  },
  {
    type: 4,
    name: 'Smooth soft sausage',
    short: 'Smooth',
    meaning: 'The ideal. Well-hydrated, well-fibred, easy to pass.',
    tone: 'ideal',
    transit: 'Normal transit (~40h)',
  },
  {
    type: 5,
    name: 'Soft blobs, clear edges',
    short: 'Soft blobs',
    meaning: 'Lacking fibre. Still normal-ish, but trending fast.',
    tone: 'good',
    transit: 'Slightly fast transit',
  },
  {
    type: 6,
    name: 'Mushy, ragged edges',
    short: 'Mushy',
    meaning: 'Mild diarrhoea. Often inflammation, a bug, or something you ate.',
    tone: 'poor',
    transit: 'Fast transit',
  },
  {
    type: 7,
    name: 'Watery, no solid pieces',
    short: 'Watery',
    meaning: 'Diarrhoea. Watch your hydration and electrolytes.',
    tone: 'bad',
    transit: 'Very fast transit (~10h)',
  },
];

export const BRISTOL_BY_TYPE = Object.fromEntries(BRISTOL.map((b) => [b.type, b]));

export const TONE_COLOR = {
  ideal: 'var(--ok)',
  good: 'var(--ok-dim)',
  poor: 'var(--warn)',
  bad: 'var(--bad)',
};

// Stool colour, with the physiology behind each one.
export const COLORS = [
  { id: 'brown', name: 'Brown', hex: '#6b4423', normal: true, meaning: 'Normal. Bile pigment doing its job.' },
  { id: 'lightBrown', name: 'Light brown', hex: '#a3703f', normal: true, meaning: 'Normal range.' },
  { id: 'darkBrown', name: 'Dark brown', hex: '#3f2715', normal: true, meaning: 'Normal. Often slower transit or iron-rich food.' },
  { id: 'green', name: 'Green', hex: '#4f7a3a', normal: false, meaning: 'Fast transit (bile has not broken down) or lots of leafy greens.' },
  { id: 'yellow', name: 'Yellow', hex: '#d4b13f', normal: false, meaning: 'Greasy or floating yellow can mean fat malabsorption.' },
  { id: 'orange', name: 'Orange', hex: '#cf7a35', normal: false, meaning: 'Usually beta-carotene — carrots, squash, supplements.' },
  { id: 'pale', name: 'Pale / clay', hex: '#cfc0a5', normal: false, meaning: 'Little or no bile reaching the gut. Worth a doctor if it repeats.' },
  { id: 'black', name: 'Black / tarry', hex: '#1c1917', normal: false, meaning: 'Iron or Pepto can do this — but so can upper-GI bleeding.' },
  { id: 'red', name: 'Red', hex: '#a83232', normal: false, meaning: 'Beetroot can do this. So can blood. Do not assume beetroot.' },
];

export const COLOR_BY_ID = Object.fromEntries(COLORS.map((c) => [c.id, c]));

export const BLOOD_OPTIONS = [
  { id: 'none', name: 'None', severity: 0 },
  { id: 'paper', name: 'On the paper', severity: 1 },
  { id: 'bowl', name: 'In the bowl', severity: 2 },
  { id: 'mixed', name: 'Mixed into stool', severity: 3 },
];

export const SCALE_0_3 = ['None', 'Mild', 'Moderate', 'Severe'];

export const DEFAULT_TAGS = [
  'coffee', 'alcohol', 'dairy', 'spicy', 'greasy', 'high fibre', 'low fibre',
  'gluten', 'travel', 'stress', 'poor sleep', 'exercise', 'antibiotics',
  'probiotic', 'laxative', 'period', 'sick', 'iron', 'opioid', 'magnesium',
  'low FODMAP', 'sugar-free',
];

// Abstract line-art for each Bristol type. 64x64, inherits currentColor.
export function bristolArt(type) {
  const f = 'fill="currentColor"';
  switch (type) {
    case 1:
      return `<svg viewBox="0 0 64 64" aria-hidden="true">
        <circle cx="18" cy="24" r="7" ${f}/><circle cx="36" cy="19" r="6" ${f}/>
        <circle cx="48" cy="30" r="6.5" ${f}/><circle cx="24" cy="41" r="6.5" ${f}/>
        <circle cx="41" cy="44" r="7" ${f}/></svg>`;
    case 2:
      return `<svg viewBox="0 0 64 64" aria-hidden="true">
        <circle cx="13" cy="32" r="9" ${f}/><circle cx="26" cy="30" r="10.5" ${f}/>
        <circle cx="39" cy="33" r="10" ${f}/><circle cx="52" cy="31" r="8.5" ${f}/>
        <path d="M13 24h39" stroke="var(--art-notch)" stroke-width="2" stroke-linecap="round" opacity=".7"/>
        <circle cx="20" cy="34" r="2.2" fill="var(--art-notch)"/><circle cx="33" cy="31" r="2" fill="var(--art-notch)"/>
        <circle cx="46" cy="35" r="2" fill="var(--art-notch)"/></svg>`;
    case 3:
      return `<svg viewBox="0 0 64 64" aria-hidden="true">
        <rect x="6" y="22" width="52" height="20" rx="10" ${f}/>
        <path d="M20 22v20M32 22v20M44 22v20" stroke="var(--art-notch)" stroke-width="2.6" stroke-linecap="round" fill="none"/></svg>`;
    case 4:
      return `<svg viewBox="0 0 64 64" aria-hidden="true">
        <path d="M14 40c-6 0-9-4-9-8s3-8 9-8h36c6 0 9 4 9 8s-3 8-9 8z" ${f}/>
        <path d="M12 30c4-2 8-2 12 0s8 2 12 0 8-2 12 0" stroke="var(--art-notch)" stroke-width="2" fill="none" stroke-linecap="round" opacity=".55"/></svg>`;
    case 5:
      return `<svg viewBox="0 0 64 64" aria-hidden="true">
        <ellipse cx="20" cy="25" rx="12" ry="9" ${f}/><ellipse cx="43" cy="22" rx="10" ry="8" ${f}/>
        <ellipse cx="32" cy="43" rx="14" ry="9.5" ${f}/></svg>`;
    case 6:
      return `<svg viewBox="0 0 64 64" aria-hidden="true">
        <path d="M9 34c-3-5 1-10 6-10 0-6 7-9 12-6 3-5 11-5 14 0 6-2 11 2 10 8 5 2 6 8 2 11-2 5-9 6-13 3-4 4-12 4-16 0-6 2-13-1-15-6z" ${f}/>
        <circle cx="22" cy="30" r="2" fill="var(--art-notch)"/><circle cx="38" cy="27" r="1.8" fill="var(--art-notch)"/>
        <circle cx="46" cy="36" r="1.8" fill="var(--art-notch)"/><circle cx="29" cy="38" r="1.6" fill="var(--art-notch)"/></svg>`;
    case 7:
      return `<svg viewBox="0 0 64 64" aria-hidden="true">
        <path d="M4 40c6-3 10 3 16 0s10-5 16-2 10 4 16 1v8c-6 3-10-1-16 1s-10 4-16 1-10-4-16-1z" ${f}/>
        <path d="M10 27c5-3 9 2 14 0s9-4 14-1 9 3 14 0" stroke="currentColor" stroke-width="3" fill="none" stroke-linecap="round" opacity=".5"/></svg>`;
    default:
      return '';
  }
}
