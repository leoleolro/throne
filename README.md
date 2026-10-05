# Throne — poop & gut-health tracker

A private bowel-movement tracker. Log what happened on the Bristol stool scale,
and the app turns that into trends and plain-English readings of what your gut
has been doing.

Everything is stored in your browser's local storage on your device. There is no
account, no server, no analytics, and nothing is ever uploaded.

## Running it

```bash
node poop-tracker/serve.mjs
```

Then open <http://localhost:4180>. (ES modules need `http://`, so opening
`index.html` straight off the disk won't work.) In Claude Code the `throne`
entry in `.claude/launch.json` starts the same server.

On a phone: open it over your local network and use *Add to Home Screen* — the
web manifest and service worker make it launch full-screen and work offline.

## Logging

One tap on a Bristol shape saves an entry with the timestamp; the toast offers
Undo and Add detail for a few seconds. The full form is still there, collapsed
underneath, for when you want to record symptoms.

A one-tap entry is marked `quick`, and that matters: its symptom and colour
fields hold defaults, not observations. The app will not average them as though
you reported them, so Comfort and Colour drop out of the gut score until you
actually record some — and the score renormalises over what remains rather than
awarding a free 100.

**"Nothing today"** records a blank day. Without it the app cannot tell a day you
did not go from a day you forgot to log, and the difference matters: a run of
three or more unrecorded days is treated as a gap in the record and excluded
from the rates, rather than counted as constipation.

## What it tracks

Per entry: Bristol type 1–7, colour, amount, urgency, straining, pain, blood,
mucus, floating, how complete it felt, time on the throne, free-text notes, and
context tags (coffee, dairy, stress, travel, antibiotics…).

## What it tells you

- **Gut score** (0–100) over 14 days, broken into form, frequency, comfort,
  colour and regularity — so the number always says *what* to change.
- **Trends**: 7-day rolling Bristol average against the healthy 3–5 band, type
  distribution, a six-month calendar, time-of-day histogram, colour mix.
- **Insights**: a rule engine that flags constipation and diarrhoea patterns,
  straining, incomplete evacuation, and the red flags that genuinely warrant a
  doctor — blood, black or tarry stools, pale/clay stools, recurring severe
  pain. Every card shows the evidence that triggered it.
- **Tag correlations**: which tags travel with looser or firmer stools than your
  own baseline. Correlation across your log, not proof of cause.
- **Eat**: dietary guidance matched to the pattern in *your* log — because advice
  for hard stools is close to the inverse of advice for loose ones. Every
  recommendation carries its evidence grade and links to the paper or guideline
  behind it.

## The evidence rule

Content in `js/guidance.js` follows one rule: if a claim could not be verified
against an authoritative source, it does not ship. Absence beats invention.

Each item is graded **strong** (guideline or good RCT/meta-analysis), **moderate**,
or **thin**, and links out to its source. The app is as willing to tell you a
popular remedy does not work as to recommend one — the "things you have been told
that are not true" section exists because several widely repeated claims did not
survive checking:

- **Floating stool means fat malabsorption.** A 1972 NEJM study compressed floating
  stools and they sank. Buoyancy tracks gas, not fat. The app therefore refuses to
  flag floating on its own, and only reacts to the greasy + pale + foul cluster.
- **A spoon of olive oil greases things along.** Edible oils are absorbed in the
  small intestine and never reach the colon.
- **Eat leafy greens for fibre.** Spinach carries ~1g per 80g portion; lentils
  carry 8.1g per 120g.
- **30 plants a week.** Traced to an American Gut comparison of two subgroups of
  ~40 people; 30 was a bin boundary chosen for analysis, not a tested optimum.
- **Magnesium citrate loosens more because it absorbs better.** Backwards — poorer
  absorption is what leaves magnesium in the gut to work osmotically.

Two design decisions follow directly from the research:

- **Blood is never graded by where it appeared.** The convention that paper-only
  bleeding implies a harmless anorectal source is standard teaching but could not
  be verified, so any logged blood raises the same flag.
- **Cautions outrank tips.** If you strain hard on well-formed stool, the app says
  the problem may be the pelvic floor rather than the stool, and that more fibre
  will likely make it worse — rather than recommending fibre again.

## What it refuses to claim

The recurring rule is that the app must not report an assumption as an
observation. In practice:

- Symptoms and colour are only averaged over entries where they were recorded.
- Frequency and regularity are measured over days with a record, not the
  calendar. Forgetting to log is reported as a gap, never as constipation.
- The composite score is withheld entirely when less than half the available
  weight is scoreable — one component wearing a comprehensive-looking badge is
  worse than no number.
- The header shows "5/7 days logged", not a streak. A streak's failure mode is
  inventing an entry to protect it, and this log is only worth keeping if every
  row is something you actually saw.

## Your data

`Data` tab → export JSON (full backup, re-importable) or CSV (for a spreadsheet
or to hand to a clinician). Import can merge or replace. Delete-everything is
there too, and it is genuinely permanent — there is no cloud copy.

## Checking it still works

```bash
node poop-tracker/test.mjs
```

63 checks covering the store round-trip (export → clear → import → merge-dedupe),
input clamping on malformed data, score bounds and weighting, that the red-flag
rules fire, that every one of the 93 citations resolves to a real source, and
that floating alone raises no flag while the full steatorrhea cluster does.

Also guards the failure modes that are easy to reintroduce: a hostile entry id
from an imported backup (it reaches a DOM attribute), spreadsheet formula
injection in the CSV, future-dated entries landing in every window at once, a
blocked write being reported rather than swallowed, and a burst of entries in one
day being praised as a healthy daily rhythm.

Run it under a few timezones — the rolling windows walk calendar days rather than
subtracting 86,400,000ms, because that skips a day across a DST transition:

```bash
TZ=America/New_York node poop-tracker/test.mjs
```

## Not a medical device

Throne matches patterns against well-established gut-health guidance. It cannot
examine you and does not know your history. Blood, black or pale stools, severe
pain, or any change in habit lasting more than three weeks is a reason to talk
to a clinician.

## Layout

```
index.html          shell + tab bar
css/styles.css      theming (light/dark/system), all components
js/bristol.js       Bristol scale, colours, tag vocabulary, SVG art
js/store.js         localStorage persistence, schema + migrations, import/export
js/insights.js      stats, gut score, trends, tag correlation, rule engine,
                     dietary-focus classifier, baseline-shift detection
js/charts.js        dependency-free SVG charts
js/app.js           views, forms, routing, events, focus preservation
js/demo.js          seeded 60-day sample dataset
serve.mjs           dev static server (dev only — the app itself is static files)
sw.js               offline cache
test.mjs            headless checks for the data + analysis layers
```
