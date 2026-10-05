// Researched guidance content. Every claim here traces to a source in SOURCES,
// and each carries the strength of the evidence behind it so the app can be
// honest about the difference between "trial-backed" and "widely repeated".
//
// Rule for this file: if a claim could not be verified against an authoritative
// source, it does not go in. Absence is better than invention.

export const SOURCES = {
  ccColour: { label: 'Cleveland Clinic — Stool colour', url: 'https://my.clevelandclinic.org/health/articles/stool-poop-color' },
  ccPale: { label: 'Cleveland Clinic — Clay-coloured / pale stool', url: 'https://my.clevelandclinic.org/health/symptoms/clay-colored-or-pale-stool' },
  ccSteat: { label: 'Cleveland Clinic — Steatorrhea', url: 'https://my.clevelandclinic.org/health/symptoms/24049-steatorrhea-fatty-stool' },
  ccMelena: { label: 'Cleveland Clinic — Melena', url: 'https://my.clevelandclinic.org/health/symptoms/25058-melena' },
  ccMucus: { label: 'Cleveland Clinic — Mucus in stool', url: 'https://my.clevelandclinic.org/health/articles/mucus-in-stool' },
  ccGastro: { label: 'Cleveland Clinic — Gastrocolic reflex', url: 'https://my.clevelandclinic.org/health/body/gastrocolic-reflex' },
  nhsFibre: { label: 'NHS — How to get more fibre into your diet', url: 'https://www.nhs.uk/live-well/eat-well/digestive-health/how-to-get-more-fibre-into-your-diet/' },
  levitt: { label: 'Levitt & Duane, "Floating Stools — Flatus versus Fat", NEJM 1972', url: 'https://doi.org/10.1056/NEJM197205042861804' },
  rao: { label: 'Rao et al., "The Nose Knows Not", Clin Infect Dis 2013', url: 'https://academic.oup.com/cid/article-abstract/56/4/615/353070' },
  wastyk: { label: 'Wastyk et al., "Gut-microbiota-targeted diets modulate human immune status", Cell 2021', url: 'https://www.cell.com/cell/fulltext/S0092-8674(21)00754-6' },
  americanGut: { label: 'McDonald et al., "American Gut", mSystems 2018', url: 'https://journals.asm.org/doi/10.1128/msystems.00031-18' },
  cummings: { label: 'Cummings et al., "Diets high and low in animal fat", J Clin Invest 1978', url: 'https://doi.org/10.1172/JCI109020' },
  bowelDiary: { label: 'Bowel-diary study of stool frequency (PMC2557101)', url: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC2557101/' },
  wgo: { label: 'World Gastroenterology Organisation — Constipation guideline', url: 'https://www.worldgastroenterology.org/guidelines/constipation/constipation-english' },
  agaAcg: { label: 'AGA/ACG joint clinical practice guideline on chronic constipation', url: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC11775994/' },
  dimidi: { label: 'Dimidi et al., "Dietary management of chronic constipation", Proc Nutr Soc', url: 'https://www.cambridge.org/core/journals/proceedings-of-the-nutrition-society/article/dietary-management-of-chronic-constipation-a-review-of-evidencebased-strategies-and-clinical-guidelines/F83DAC358FF4253E61AE7B82E420E612' },
  gearry: { label: 'Gearry et al., "2 green kiwifruits daily", Am J Gastroenterol 2023', url: 'https://journals.lww.com/ajg/fulltext/2023/06000/consumption_of_2_green_kiwifruits_daily_improves.26.aspx' },
  aptMeta: { label: 'van der Schoot et al., fruit vs psyllium meta-analysis, Aliment Pharmacol Ther 2023', url: 'https://onlinelibrary.wiley.com/doi/10.1111/apt.17782' },
  holma: { label: 'Holma et al., rye bread and intestinal transit, J Nutr 2010', url: 'https://jn.nutrition.org/article/S0022-3166(22)07001-8/fulltext' },
  anti: { label: 'Anti et al., water intake and constipation, Hepatogastroenterology 1998', url: 'https://www.unboundmedicine.com/medline/citation/9684123/full_citation' },
  hepar: { label: 'Magnesium-sulfate mineral water RCTs (Hépar)', url: 'https://www.sciencedirect.com/science/article/pii/S1542356513018934' },
  modi: { label: 'Modi et al., defecation posture modification device, J Clin Gastroenterol 2019', url: 'https://www.ncbi.nlm.nih.gov/pmc/articles/PMC6382038/' },
  nhsConstipation: { label: 'NHS — Constipation', url: 'https://www.nhs.uk/conditions/constipation/' },
  pharmMyths: { label: 'Debunking Constipation Myths: What Community Pharmacists Need to Know', url: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC13310362/' },
  monash: { label: 'Monash University — High and low FODMAP foods', url: 'http://www.monashfodmap.com/about-fodmap-and-ibs/high-and-low-fodmap-foods/' },
  fodmapStat: { label: 'StatPearls — Low FODMAP diet', url: 'https://www.ncbi.nlm.nih.gov/books/NBK562224/' },
  gaoExercise: { label: 'Gao et al., exercise for constipation meta-analysis, Scand J Gastroenterol 2019', url: 'https://pubmed.ncbi.nlm.nih.gov/30843436/' },
  bda: { label: 'British Dietetic Association — Fibre', url: 'https://www.bda.uk.com/resource/fibre.html' },
  mcrorie: { label: 'McRorie & McKeown, "Understanding the physics of functional fibers", J Acad Nutr Diet 2017', url: 'https://pubmed.ncbi.nlm.nih.gov/27863994/' },
  fibreMeta: { label: 'Fibre supplementation in constipation: systematic review & meta-analysis, 2022', url: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC9535527/' },
  bnf: { label: 'British Nutrition Foundation — Fibre', url: 'https://www.nutrition.org.uk/nutritional-information/fibre/' },
  statFibre: { label: 'StatPearls — Dietary fiber', url: 'https://www.ncbi.nlm.nih.gov/books/NBK559033/' },
  efsaWater: { label: 'EFSA — Dietary reference values for water, EFSA Journal 2010', url: 'https://efsa.onlinelibrary.wiley.com/doi/10.2903/j.efsa.2010.1459' },
  birt: { label: 'Birt et al., "Resistant starch: promise for improving human health", Adv Nutr', url: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC3823506/' },
  rao1998: { label: 'Rao et al., "Is coffee a colonic stimulant?", Eur J Gastroenterol Hepatol 1998', url: 'https://pubmed.ncbi.nlm.nih.gov/9581985/' },
  russell: { label: 'Russell et al., high-protein/low-carb diets and colonic metabolites, Am J Clin Nutr 2011', url: 'https://pubmed.ncbi.nlm.nih.gov/21389180/' },
  deSchryver: { label: 'De Schryver et al., physical activity and colonic transit, 2005', url: 'https://pubmed.ncbi.nlm.nih.gov/16028436/' },
  mori: { label: 'Mori et al., magnesium oxide for chronic constipation RCT, J Neurogastroenterol Motil 2019', url: 'https://www.jnmjournal.org/journal/view.html?doi=10.5056%2Fjnm18194' },
  ironMeta: { label: 'Ferrous sulfate GI side effects: systematic review & meta-analysis', url: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC4336293/' },
  statSteat: { label: 'StatPearls — Steatorrhea', url: 'https://www.ncbi.nlm.nih.gov/books/NBK541055/' },
  nhsDiarrhoea: { label: 'NHS — Diarrhoea and vomiting', url: 'https://www.nhs.uk/conditions/diarrhoea-and-vomiting/' },
  ccDiarrhoea: { label: 'Cleveland Clinic — Diarrhea', url: 'https://my.clevelandclinic.org/health/diseases/4108-diarrhea' },
  aafp: { label: 'Chronic Diarrhea in Adults: Evaluation and Differential Diagnosis, Am Fam Physician 2020', url: 'https://www.aafp.org/pubs/afp/issues/2020/0415/p472.html' },
  cochraneAAD: { label: 'Goldenberg et al., Probiotics for preventing paediatric antibiotic-associated diarrhoea, Cochrane 2015', url: 'https://www.cochranelibrary.com/cdsr/doi/10.1002/14651858.CD004827.pub4/full' },
  bamReview: { label: 'Systematic review: idiopathic bile acid malabsorption by SeHCAT in IBS-D', url: 'https://pubmed.ncbi.nlm.nih.gov/19570102/' },
  statDiarrhoea: { label: 'StatPearls — Diarrhea', url: 'https://www.ncbi.nlm.nih.gov/books/NBK448082/' },
  efsaErythritol: { label: 'EFSA — Re-evaluation of erythritol (E 968), 2023', url: 'https://efsa.onlinelibrary.wiley.com/doi/10.2903/j.efsa.2023.8430' },
};

/**
 * Per-colour reading. `benign` is the everyday explanation, `matters` is the one
 * you would not want to miss. Urgency drives how the app presents it.
 */
export const COLOR_GUIDANCE = {
  brown: {
    urgency: 'none', sources: ['ccColour'],
    text: 'The usual result of bile pigment breaking down over a normal transit. Nothing to act on — it is persistent changes, not a single day, that are worth noting.',
  },
  lightBrown: {
    urgency: 'none', sources: ['ccColour'],
    text: 'Usually a faster transit or a lighter diet. Worth watching only if it keeps drifting toward pale or clay, which points at bile not reaching the gut.',
  },
  darkBrown: {
    urgency: 'none', sources: ['ccColour'],
    text: 'Normally a slower transit, or more red meat, iron or dark foods. Worth a second look only if it shades into true black and turns tarry.',
  },
  green: {
    urgency: 'low', sources: ['ccColour'],
    text: 'Often leafy greens, green dye, or food moving too fast for bile to finish turning brown. Persistent green with diarrhoea or pain is worth a GP visit.',
  },
  yellow: {
    urgency: 'medium', sources: ['ccColour', 'ccSteat'],
    text: 'Often fatty food or a fast transit. Greasy, foul, floating and hard to flush together suggest fat malabsorption — coeliac or pancreatic — and needs testing.',
  },
  orange: {
    urgency: 'low', sources: ['ccColour'],
    text: 'Usually beta-carotene from carrots, sweet potato or squash. If it persists without those foods, it can mean less bile is reaching your gut.',
    caveat: 'Weaker sourcing than the other colours — no dedicated clinical page was verified for orange specifically.',
  },
  pale: {
    urgency: 'high', sources: ['ccPale'],
    text: 'Rarely dietary. Pale stool means bile is not reaching your gut; with yellow eyes or dark urine, seek care the same day, not next week.',
  },
  black: {
    urgency: 'high', sources: ['ccMelena'],
    text: 'Iron, bismuth, charcoal or liquorice can colour stool black harmlessly. Black that is tarry, sticky and strongly foul is digested blood, and is urgent.',
  },
  red: {
    urgency: 'high', sources: ['ccColour'],
    text: 'Beetroot and red food colouring are common and harmless. Visible blood should always be looked at by a doctor, however small the amount seems.',
  },
};

/**
 * Popular claims that do not survive contact with the evidence. Worth showing
 * because each one is something a user has probably been told.
 */
export const MYTHS = [
  {
    claim: 'Floating stool means fat malabsorption',
    verdict: 'Not on its own',
    detail: 'A 1972 NEJM study compressed floating stools and they sank — buoyancy tracks gas, not fat. Degassed floaters and sinkers had similar density, and patients with genuine fat malabsorption had normal gas content. Floating alone is a normal variant. It only matters alongside grease, pallor and a foul smell.',
    strength: 'strong', sources: ['levitt', 'ccSteat'],
  },
  {
    claim: 'You can tell a gut infection by the smell',
    verdict: 'No',
    detail: 'Unblinded studies suggested nurses could identify C. difficile by odour. When properly blinded, they averaged 45% correct — no better than chance, and unaffected by years of experience. The earlier results were confounded by everything else visible about the patient.',
    strength: 'strong', sources: ['rao'],
  },
  {
    claim: '30 different plants a week',
    verdict: 'A good habit, not a validated number',
    detail: 'This comes from American Gut, comparing roughly 40 people eating more than 30 plant types against roughly 44 eating fewer than 10. Thirty was a bin boundary chosen for analysis, not a tested optimum — nobody compared 25 against 35 — and plant variety tracks closely with income and education. Eat a wide range of plants; do not count to a number.',
    strength: 'moderate', sources: ['americanGut'],
  },
  {
    claim: 'Cutting dietary fat improves stool form',
    verdict: 'Not if your gut is healthy',
    detail: 'Six healthy men ate 62g versus 152g of fat a day for four weeks each — a huge contrast. There was no change in bowel habit, stool weight or transit time. Bile acid excretion rose, but colonic function did not budge. Fibre and fluid are the levers; fat is not.',
    strength: 'moderate', sources: ['cummings'],
  },
  {
    claim: 'A spoonful of olive oil greases things along',
    verdict: 'The mechanism is wrong',
    detail: 'Edible oils are absorbed in the small intestine and never reach the colon, so they cannot coat stool the way mineral oil does. There is thin trial signal in dialysis patients, who are a very particular group. Olive oil is good food; it is not a laxative.',
    strength: 'strong', sources: ['pharmMyths'],
  },
  {
    claim: 'Eat magnesium-rich foods for constipation',
    verdict: 'Not supported',
    detail: 'The magnesium trials that worked used magnesium sulfate in mineral water or magnesium oxide tablets at pharmacological doses. No trial evidence shows that magnesium from spinach, nuts or seeds relieves constipation — food does not deliver anywhere near that dose.',
    strength: 'moderate', sources: ['dimidi'],
  },
  {
    claim: 'Eat leafy greens for fibre',
    verdict: 'Good food, poor fibre source',
    detail: 'Spinach carries about 1g of fibre per 80g portion — you would need thirty portions to reach the 30g target. Legumes and wholegrain staples do roughly 80% of the work: one 120g serving of lentils is 8g. Eat the greens for other reasons.',
    strength: 'strong', sources: ['bnf'],
  },
  {
    claim: 'Magnesium citrate loosens more because it absorbs better',
    verdict: 'Backwards',
    detail: 'Magnesium salts work osmotically — they stay in the gut and pull water in. POORER absorption means more stays in the lumen to do that. Magnesium oxide is also the only form formally tested in randomised trials for chronic constipation. Glycinate is the form usually chosen to avoid the laxative effect.',
    strength: 'moderate', sources: ['mori'],
  },
  {
    claim: 'Eight glasses of water a day',
    verdict: 'No basis',
    detail: 'There is no trial basis for this figure. EFSA sets adequate total water intake at 2.0L for women and 2.5L for men, and that explicitly includes the water in food. Fluid also works mainly as a permission slip for fibre rather than as a laxative on its own — in the trial that showed a benefit, everyone was already eating 25g of fibre.',
    strength: 'moderate', sources: ['efsaWater', 'anti'],
  },
  {
    claim: 'Eat the BRAT diet when you have diarrhoea',
    verdict: 'Superseded, though sources still disagree',
    detail: 'The American Academy of Pediatrics moved away from bananas-rice-applesauce-toast because it is too restrictive to support recovery — low in protein, fat and fibre — and now advises resuming a normal balanced diet within about 24 hours. Worth being straight with you: some clinical sources, including Cleveland Clinic, still list these foods. The safe reading is that they are fine to eat and a poor plan to live on.',
    strength: 'moderate', sources: ['ccDiarrhoea', 'nhsDiarrhoea'],
  },
  {
    claim: 'Take a probiotic for diarrhoea',
    verdict: 'Only some, for some situations',
    detail: 'Effects are strain-specific, so "a probiotic" is not a category that predicts anything. The best-supported use is preventing antibiotic-associated diarrhoea, where Lactobacillus rhamnosus or Saccharomyces boulardii at 5 to 40 billion CFU a day look most appropriate; in children the Cochrane review found 8% affected on probiotics against 19% on control, at moderate quality with substantial heterogeneity. Outside that situation the evidence thins out quickly.',
    strength: 'moderate', sources: ['cochraneAAD'],
  },
];

/** For an already-healthy log. Maintenance, not treatment. */
export const MAINTENANCE = [
  { text: 'Keep aiming for around 30g of fibre a day from a range of sources; most people sit nearer 20g, so there is usually room.', strength: 'strong', sources: ['nhsFibre'] },
  { text: 'Eat a wide variety of plants across the week rather than a lot of any single one — variety matters more than hitting a particular number.', strength: 'moderate', sources: ['americanGut'] },
  { text: 'Add fermented foods like yoghurt, kefir, kimchi or kombucha regularly; the trial evidence is early but points the right way.', strength: 'moderate', sources: ['wastyk'] },
  { text: 'Eat at reasonably regular times, especially breakfast, since a meal after the overnight fast is what prompts the colon to move.', strength: 'strong', sources: ['ccGastro'] },
  { text: 'Trust your own baseline over any population average, and pay attention when your pattern shifts and stays shifted for more than a week or two.', strength: 'strong', sources: ['bowelDiary'] },
];

/** Context for the frequency numbers the app shows elsewhere. */
export const FREQUENCY_FACTS = {
  headline: 'Three a day to three a week is the outer boundary of normal — not a target.',
  detail: 'Bowel diaries put most healthy people between 0.9 and 1.7 movements a day, clustered near one. More striking: in that data, people with constipation and with diarrhoea both averaged slightly MORE movements per day than the healthy group. Frequency alone did not separate them — form, urgency and straining did. That is why this app weights form more heavily than frequency.',
  sources: ['bowelDiary'],
};


/**
 * Guidance keyed to the dietaryFocus() outcome. Interventions are ordered by
 * strength of evidence, not by popularity — several very familiar remedies sit
 * near the bottom, and one (olive oil) is in MYTHS instead.
 */
export const FOCUS_GUIDANCE = {
  hard: {
    title: 'Hard, slow stools',
    explains: 'Types 1 and 2 are hard, lumpy stools that take effort to pass, which usually means waste moved slowly through your colon and had too much water pulled out of it. The fix is mostly about keeping water in the stool and helping it move along, rather than pushing harder.',
    mechanism: 'Your colon reabsorbs about 99% of the water reaching it. The longer stool sits there, the more water comes out and the harder it sets. So you have three levers: hold water in the stool with gel-forming fibre, pull water in osmotically with sorbitol or magnesium, or speed transit so there is less time to dry out.',
    mechanismSources: ['wgo'],
    eat: [
      { icon: '🥝', title: 'Two green kiwifruit a day', why: 'The best-evidenced whole food. In a three-country randomised trial it beat a fibre-matched psyllium supplement on bowel movements per week, with fewer side effects.', dose: '2–3 daily', strength: 'strong', sources: ['gearry', 'aptMeta'] },
      { icon: '🍞', title: 'Swap white bread for wholegrain rye', why: 'Cut total gut transit time by roughly 21 hours in trials — close to a full day faster — and added about 1.4 movements a week.', dose: '6–8 slices daily', strength: 'strong', sources: ['holma', 'aptMeta'], caution: 'Expect more wind; the same trials found rye worsened flatulence.' },
      { icon: '🥄', title: 'If you use a supplement, make it psyllium', why: 'The only fibre supplement the joint AGA/ACG guideline endorses. It gels, resists fermentation and carries water the length of the colon.', dose: 'over 10g a day, for at least 4 weeks', strength: 'strong', sources: ['agaAcg', 'dimidi'], caution: 'Start at about a teaspoon and build up over weeks, always with water. Going straight to a full dose causes cramping and wind.' },
      { icon: '💧', title: 'Around 2 litres of fluid a day, alongside the fibre', why: 'On a 25g fibre diet, people drinking 2 litres had significantly more bowel movements than those drinking to thirst. Fluid is what lets fibre soften stool instead of hardening it.', dose: '~2 L daily', strength: 'moderate', sources: ['anti', 'wgo'] },
      { icon: '🫗', title: 'Magnesium-rich mineral water', why: 'Four trials of magnesium-sulfate mineral water found a markedly better treatment response than low-mineral water.', dose: '0.5–1 L daily', strength: 'strong', sources: ['hepar'] },
      { icon: '🍑', title: 'Prunes, in a real portion', why: 'The sorbitol in prunes pulls water into the stool osmotically. Trials used doses far larger than a token few.', dose: '50g twice daily', strength: 'moderate', sources: ['dimidi'], caution: 'Head-to-head, prunes were about as good as psyllium — not dramatically better, despite the reputation.' },
      { icon: '🌾', title: 'Build toward 30g of fibre a day', why: 'The UK target is 30g and most people manage about 18g, so there is usually real room. Add it over a couple of weeks, not overnight.', dose: '30 g/day (UK); US targets are ~25g women, ~38g men', strength: 'moderate', sources: ['bda'], caution: 'Worth knowing: one trial of a generally high-fibre diet found no benefit over a moderate one, and more bloating. Specific fibres beat "eat more fibre".' },
    ],
    doAlso: [
      { icon: '🦶', title: 'Put your knees above your hips', why: 'A footstool relaxes the puborectalis muscle, which otherwise kinks the rectum at about 90 degrees to keep you continent. In a crossover study of over a thousand movements it tripled the odds of feeling empty and cut straining sharply.', strength: 'moderate', sources: ['modi', 'nhsConstipation'] },
      { icon: '🚶', title: 'Regular aerobic movement', why: 'A meta-analysis of nine trials found exercise probably helps, though the authors were candid that the studies were methodologically weak.', strength: 'moderate', sources: ['gaoExercise'] },
      { icon: '⏰', title: 'Do not put off the urge', why: 'Suppressing it lets the colon pull out more water and, over time, blunts the rectum\'s sensitivity. Named directly by the NHS as a cause.', strength: 'moderate', sources: ['nhsConstipation'] },
    ],
    watchFor: 'Constipation lasting more than three weeks, or not budging with these changes, is worth a GP visit rather than more fibre.',
  },

  loose: {
    title: 'Loose, fast stools',
    explains: 'Types 6 and 7 mean contents moved through too fast for water to be reabsorbed, or something in the gut actively pulled water in. Type 5 is the mild end of the same direction — still within normal, but trending fast.',
    mechanism: 'Loose stool is water that did not come out. That happens when transit is too fast to absorb it, when something osmotically active holds it in the lumen, or when the gut is actively secreting. The osmotic causes are the ones you can usually find yourself, by working through what you are eating.',
    mechanismSources: ['mcrorie'],
    eat: [
      { icon: '🥄', title: 'Psyllium firms loose stool too', why: 'The counter-intuitive one. Psyllium regulates water rather than speeding or slowing things, so the same fibre that softens hard stool also thickens loose stool. Its gel resists dehydration in both directions.', dose: 'start low, build with water', strength: 'strong', sources: ['mcrorie'] },
      { icon: '🍬', title: 'Audit sugar alcohols first', why: 'Sorbitol, xylitol, mannitol and maltitol in sugar-free gum, mints and diet products are poorly absorbed and pull water into the gut. EU law requires a laxative warning above 10% added polyol, and they are banned outright from beverages for this reason.', dose: 'tolerance is roughly 20–50g/day, far less in IBS', strength: 'strong', sources: ['efsaErythritol'] },
      { icon: '☕', title: 'Look at the coffee', why: 'Caffeinated coffee produced colonic motor activity about 60% stronger than water and comparable to a full meal. Decaf did much of it too, so switching is not a guaranteed escape.', strength: 'strong', sources: ['rao1998'] },
      { icon: '💊', title: 'Check your supplements', why: 'Magnesium citrate and oxide are osmotic laxatives by design — if you take magnesium for other reasons, that may be the whole story. High-dose vitamin C behaves similarly.', strength: 'moderate', sources: ['mori'] },
      { icon: '🧅', title: 'Ease off heavily fermented fibre for now', why: 'Inulin and FOS — in onions, garlic, chicory and many added-fibre products — are fermented fast, producing gas and urgency without adding bulk. They were the fibres that drove the flatulence signal in the meta-analysis.', strength: 'strong', sources: ['fibreMeta', 'mcrorie'] },
      { icon: '🥛', title: 'Test whether dairy is doing it', why: 'Undigested lactose is osmotically active — it holds water in the gut and pulls more in, giving watery stool with bloating and wind. It is one of the easiest causes to confirm or rule out yourself.', strength: 'strong', sources: ['statDiarrhoea'] },
      { icon: '🗓️', title: 'A low-FODMAP trial, if this is persistent', why: 'FODMAPs pull water in and ferment rapidly. A structured trial runs 2–6 weeks and then MUST move to reintroduction — long-term elimination is not evidence-based and narrows the microbiome.', dose: '2–6 weeks, then reintroduce', strength: 'moderate', sources: ['monash', 'fodmapStat'], caution: 'Best done with a dietitian. Staying in the elimination phase is a common and harmful mistake.' },
    ],
    doAlso: [
      { icon: '🧂', title: 'Rehydrate with more than water', why: 'Water alone replaces the fluid but not the salts, and it lacks the glucose that drives sodium and water absorption across the gut wall. Oral rehydration sachets from a pharmacy are the right tool if you are showing dehydration signs.', strength: 'strong', sources: ['nhsDiarrhoea'] },
      { icon: '🥤', title: 'Skip fruit juice and fizzy drinks', why: 'The NHS names these specifically — their sugar load is osmotic and makes diarrhoea worse, which is the opposite of what you want from a drink you reached for to rehydrate.', strength: 'strong', sources: ['nhsDiarrhoea'] },
      { icon: '🍽️', title: 'Eat normally as soon as you can face it', why: 'Small, frequent meals, going easy on fatty and spicy food. Restrictive recovery diets have fallen out of favour — see the note on BRAT below.', strength: 'strong', sources: ['nhsDiarrhoea', 'ccDiarrhoea'] },
    ],
    watchFor: 'Diarrhoea lasting more than 7 days, blood, being unable to keep fluids down, or dehydration signs mean call 111 or your GP. Anything past four weeks is chronic by definition and needs investigating.',
    watchForSources: ['nhsDiarrhoea', 'aafp'],
  },

  maintain: {
    title: 'Keep doing what you are doing',
    explains: 'Types 3 to 4 are the target, and 5 is generally fine. If your log sits here, the app\'s job is to stop you fixing what is not broken.',
    mechanism: 'Most healthy people land between 0.9 and 1.7 movements a day. The classic "three a day to three a week" is the outer boundary of normal, not a goal to hit.',
    mechanismSources: ['bowelDiary'],
    eat: [],
    doAlso: [],
    watchFor: 'The thing to watch is not any population average but a shift away from your own pattern that holds for more than two or three weeks.',
  },

  alternating: {
    title: 'Swinging between hard and loose',
    explains: 'Alternating constipation and looseness within the same fortnight is a pattern in its own right, and it is the classic presentation of IBS with mixed bowel habit.',
    mechanism: 'Chasing each swing with the opposite intervention tends to amplify the swing. The more useful move is to stabilise: a regulating fibre, regular meals, and one change at a time held long enough to read.',
    mechanismSources: ['mcrorie'],
    eat: [
      { icon: '🥄', title: 'Psyllium, because it works both ways', why: 'It regulates stool water rather than pushing in one direction, which is exactly what an alternating pattern needs. It is the one intervention that is not a bet on which way you will swing next.', dose: 'over 10g a day, built up slowly', strength: 'strong', sources: ['mcrorie', 'agaAcg'] },
      { icon: '🍽️', title: 'Eat at regular times', why: 'A substantial meal was the strongest colonic stimulus measured in manometry testing — stronger than coffee. Regular meals give the colon a regular cue.', strength: 'moderate', sources: ['rao1998'] },
      { icon: '📓', title: 'Change one thing at a time', why: 'With four-week readouts and high day-to-day variance, several simultaneous changes cannot be told apart. This is the problem your log is actually good at solving.', strength: 'strong', sources: ['fibreMeta'] },
    ],
    doAlso: [],
    watchFor: 'A persistent mixed pattern with pain is worth discussing as possible IBS, which has real treatments beyond diet.',
  },

  mixed: {
    title: 'Mostly fine, with room to tighten up',
    explains: 'Your log is not showing a clear problem in either direction, but it is not settling into the healthy band either.',
    mechanism: 'With no dominant pattern, the highest-value move is the boring one: get fibre closer to target from foods that actually carry it, and keep meals and sleep regular enough that the colon has a rhythm to follow.',
    mechanismSources: ['bnf'],
    eat: [
      { icon: '🫘', title: 'One extra portion of legumes a day', why: 'The single most efficient way to close the typical 10–14g fibre gap. Lentils carry 8.1g per 120g; kidney beans 9.4g.', dose: '120g', strength: 'strong', sources: ['bnf'] },
      { icon: '🌾', title: 'Move staples to wholegrain', why: 'Wholemeal bread carries 5.8g per two slices, and swapping white bread for rye cut transit time by about 21 hours in trials.', strength: 'strong', sources: ['bnf', 'holma'] },
      { icon: '🥛', title: 'Add fermented foods regularly', why: 'Ten weeks of fermented foods raised microbial diversity and lowered inflammatory markers, with bigger servings doing more. Note it did not measure stool form.', strength: 'moderate', sources: ['wastyk'] },
    ],
    doAlso: [],
    watchFor: '',
  },
};

/**
 * Situations where the standard advice is the wrong advice. These matter more
 * than the tips do — an app that keeps recommending fibre to someone whose
 * problem is not fibre is actively unhelpful.
 */
export const CAUTIONS = {
  defecatory: {
    title: 'Straining hard even though the stool is well formed',
    detail: 'If your form sits in the healthy 3–5 band but you are straining and rarely feel empty, the problem may be the outlet rather than the stool — a defecatory disorder, where the pelvic floor does not relax on cue. Diet reliably fails for this, and piling on more fibre tends to make it worse. It is diagnosed with anorectal testing, and treated with biofeedback rather than food.',
    strength: 'strong', sources: ['wgo', 'agaAcg'],
  },
  medication: {
    title: 'A medication may be doing this',
    detail: 'Opioid painkillers are the most important, followed by iron supplements, tricyclic antidepressants, calcium channel blockers, antacids containing calcium or aluminium, antihistamines and some antipsychotics. This is the best-documented modifiable cause of constipation — worth raising with whoever prescribed it before changing your diet.',
    strength: 'strong', sources: ['wgo', 'nhsConstipation'],
  },
  bileAcid: {
    title: 'Bile acid malabsorption is worth asking about',
    detail: 'If loose stools have been going on for weeks and no food seems to explain them, this is the diagnosis most often missed. Bile acids that should be reabsorbed reach the colon instead and pull water in. It turns up in roughly a third of people investigated for chronic functional diarrhoea, and up to about 35% of those with IBS or microscopic colitis — yet it is rarely tested for, partly because the SeHCAT scan is not widely available. It responds to specific treatment, so it is worth naming to your GP rather than waiting to be offered it.',
    strength: 'moderate', sources: ['bamReview', 'aafp'],
  },
  lowFodmap: {
    title: 'A low-FODMAP diet can cause this',
    detail: 'FODMAPs pull water into the gut, and sorbitol — the active ingredient in prunes — is one. Restricting them is a recognised treatment for IBS, but staying in the elimination phase long-term is not evidence-based and can worsen constipation and reduce microbiome diversity. If you have been eliminating for months, you should be reintroducing with a dietitian.',
    strength: 'moderate', sources: ['fodmapStat', 'monash'],
  },
};


/**
 * Daily targets, with the honest caveat that the UK and US define them
 * differently — the US figure is energy-scaled, which personalises better.
 */
export const TARGETS = {
  fibre: {
    uk: 30, us: { women: 25, men: 38 }, usPerKcal: 14,
    typical: 'Most UK adults manage 16–20g; in the US it is about 17g, and roughly 94% of people miss the target.',
    note: 'The gap is usually 10–14g — about one extra portion of legumes a day.',
    sources: ['nhsFibre', 'bnf', 'statFibre'],
  },
  fluid: {
    women: 2.0, men: 2.5,
    note: 'EFSA adequate intake for TOTAL water — and it explicitly includes the water in your food, so it is not a glasses-of-water target.',
    sources: ['efsaWater'],
  },
};

/**
 * The axis most apps get wrong. Soluble vs insoluble barely predicts what you
 * see in the bowl; whether the fibre survives fermentation does.
 */
export const FIBRE_MODEL = {
  headline: 'Whether a fibre survives fermentation matters more than whether it dissolves.',
  detail: 'Only two things produce a laxative effect in the large bowel: coarse insoluble particles that mechanically provoke secretion, and gel-forming soluble fibre whose water-holding resists dehydration. Both only work if the fibre resists fermentation and reaches the stool intact. Heavily fermented fibres — inulin, FOS, most oligosaccharides — are largely consumed by bacteria before stool forms, so they make gas rather than bulk.',
  sources: ['mcrorie'],
};

/**
 * Fibre grams per realistic portion, from the British Nutrition Foundation.
 * `kind` is directional, not measured: no authoritative source publishes
 * per-food soluble/insoluble grams, and nearly every whole food contains both.
 */
export const FIBRE_TABLE = [
  { food: 'Red kidney beans', portion: '120g', g: 9.4, kind: 'mixed', behaviour: 'Fermentable — bulk plus gas' },
  { food: 'Wholegrain pasta', portion: '180g', g: 8.8, kind: 'insoluble', behaviour: 'Bulking' },
  { food: 'Baked beans', portion: '200g', g: 8.5, kind: 'mixed', behaviour: 'Highly fermentable' },
  { food: 'Lentils', portion: '120g', g: 8.1, kind: 'mixed', behaviour: 'Fermentable + resistant starch' },
  { food: 'Quinoa', portion: '180g', g: 6.3, kind: 'insoluble', behaviour: 'Bulking' },
  { food: 'Chickpeas', portion: '120g', g: 6.2, kind: 'mixed', behaviour: 'Highly fermentable' },
  { food: 'Wholemeal bread', portion: '2 slices', g: 5.8, kind: 'insoluble', behaviour: 'Bulking' },
  { food: 'Bran flakes', portion: '40g', g: 5.4, kind: 'insoluble', behaviour: 'Coarse — mechanical, survives fermentation' },
  { food: 'Baked potato, with skin', portion: '220g', g: 4.6, kind: 'mixed', behaviour: 'Bulking; resistant starch if cooled' },
  { food: 'Bulgur wheat', portion: '180g', g: 4.4, kind: 'insoluble', behaviour: 'Bulking' },
  { food: 'Oats', portion: '45g dry', g: 3.5, kind: 'soluble', behaviour: 'Viscous, gel-forming' },
  { food: 'Berries', portion: '80g', g: 3.3, kind: 'soluble', behaviour: 'Fermentable' },
  { food: 'Green beans', portion: '80g', g: 3.3, kind: 'insoluble', behaviour: 'Bulking' },
  { food: 'Carrots', portion: '80g', g: 3.1, kind: 'mixed', behaviour: 'Mild bulking' },
  { food: 'Dates', portion: '30g', g: 3.0, kind: 'mixed', behaviour: 'Fermentable; sorbitol' },
  { food: 'Dried apricots', portion: '30g', g: 3.0, kind: 'soluble', behaviour: 'Fermentable; sorbitol' },
  { food: 'Almonds', portion: '20g', g: 2.0, kind: 'insoluble', behaviour: 'Mild bulking' },
  { food: 'Pear', portion: '80g', g: 1.8, kind: 'soluble', behaviour: 'Fermentable; sorbitol' },
  { food: 'Sunflower seeds', portion: '20g', g: 1.6, kind: 'insoluble', behaviour: 'Mild bulking' },
  { food: 'Pumpkin seeds', portion: '20g', g: 1.3, kind: 'insoluble', behaviour: 'Mild bulking' },
  { food: 'Broccoli', portion: '80g', g: 1.1, kind: 'insoluble', behaviour: 'Bulking; fructans' },
  { food: 'Banana', portion: '80g', g: 1.1, kind: 'soluble', behaviour: 'Resistant starch when green' },
  { food: 'Apple', portion: '80g', g: 1.0, kind: 'soluble', behaviour: 'Fermentable' },
  { food: 'Spinach', portion: '80g', g: 1.0, kind: 'insoluble', behaviour: 'Bulking' },
];

export const FIBRE_TABLE_NOTE = 'Legumes and wholegrain staples do most of the work. At 1g per portion, you would need thirty servings of spinach to reach 30g — leafy greens are excellent food and a poor fibre source.';

/**
 * How long a change actually takes to show up. This is the number most people
 * get wrong, abandoning a change at day five that needed four weeks.
 */
export const TIMESCALES = [
  { when: 'Minutes to hours', what: 'Coffee, a substantial meal, toilet posture', sources: ['rao1998'] },
  { when: 'Days to a week', what: 'Osmotic magnesium; removing sugar alcohols or FODMAPs', sources: ['mori'] },
  { when: '2 to 6 weeks', what: 'A low-FODMAP trial — which must then move to reintroduction', sources: ['monash'] },
  { when: 'At least 4 weeks', what: 'Fibre, dietary or supplemental, and only above about 10g a day', sources: ['fibreMeta'] },
  { when: '10 weeks or more', what: 'Microbiome composition shifting', sources: ['wastyk'] },
  { when: '12 weeks', what: 'Exercise changing colonic transit time', sources: ['deSchryver'] },
];

export const TIMESCALE_NOTE = 'Change one thing at a time. With four-week readouts and high day-to-day variance, several simultaneous changes are uninterpretable — which is exactly the problem a log is good at solving.';


/**
 * Two discriminators a person can apply at home. These are worth more than a
 * list of possible causes, because they split the field roughly in half.
 */
export const SELF_TESTS = [
  {
    question: 'Does it settle when you do not eat?',
    detail: 'Osmotic diarrhoea — the kind caused by something you are eating, such as lactose, fructose or a sugar alcohol — improves with fasting, because the trigger stops arriving. Secretory diarrhoea continues regardless of whether you eat. If skipping a meal reliably calms it, the cause is probably on your plate and you can find it.',
    strength: 'strong', sources: ['aafp'],
  },
  {
    question: 'Does it wake you at night?',
    detail: 'This one matters. Diarrhoea that wakes you from sleep points toward an organic cause rather than a functional one — IBS characteristically improves at night and with fasting. Nocturnal symptoms are a reason to be seen rather than to keep adjusting your diet.',
    strength: 'strong', sources: ['aafp'],
  },
];

export const STRENGTH_LABEL = { strong: 'Strong evidence', moderate: 'Moderate', weak: 'Thin evidence' };
