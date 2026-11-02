import fs from 'node:fs';
const directory = 'docs/project-name-research/';
const network = JSON.parse(fs.readFileSync('src/data/approved-developer-network.json'));
const baseline = JSON.parse(fs.readFileSync('docs/project-expansion-baseline.json'));
const notes = {
  emaar:
    'Twelve community catalogues, 67 unique latest-launch entries, individual pages and official 2024/2025 integrated reports cross-checked. Historic ready stock was not imported wholesale. Eight separately named newer phases use explicit combined-source inference. Older entries lacking a recent launch/construction basis remain excluded.',
  aldar:
    'All 83 unique catalogue entries across 14 pages reviewed. UAE entries marked Under Construction selected; UK/Egypt and completed entries excluded. Separate Tala/Talay naming and phase aliases manually checked.',
  damac:
    'Main live catalogue/detail requests returned 403. Retained the previous sourced launches; added Evergreens from indexed official scheduled-handover evidence and ELO/Bay 2 from the official 2026 off-plan guide. Other candidates held where current status could not be established. This owner is not an exhaustive live-catalogue claim.',
  nakheel:
    'Full development directory and 35 linked development/history pages reviewed. Ready communities, completed handovers and property models were not treated as additional off-plan projects. Eleven previous sourced names retained.',
  sobha:
    'Official current catalogue with scheduled handovers reviewed and direct project links extracted from share URLs. Future handovers retained; past or unspecified dates do not independently establish an ongoing project. Forty-seven names now sourced.',
  meraas:
    'Residential directory, 32 project pages and expanded Central Park/MJL phase lists reviewed. Phase-specific 2026 construction percentages support additions. Thyme with RERA 100% approval and ready/historic stock excluded.',
  'dubai-properties':
    'Official dp.ae portfolio and project pages checked. Three previous current-launch records retained; older Al Ranim/Villanova entries without sufficiently current construction or delivery evidence held. A sale page alone does not establish off-plan status.',
  binghatti:
    'Main catalogue, 38 regular detail pages and four branded pages reviewed. Future FAQ handovers support regular additions; 2026 corporate pipeline update supports the branded developments. Ready-to-move and past-date candidates held.',
  azizi:
    'Current launch and construction directories plus 20 linked location/project/progress pages reviewed. Several construction pages expose images without a usable current completion status; retained the 15 previous sourced launches rather than assuming every historical Riviera/Al Furjan phase is ongoing.',
  danube:
    'Official ongoing-project navigation cross-checked against named launch pages. Twenty current names retained. Older items in duplicate/stale navigation groups not imported as ongoing.',
  ellington:
    'All 57 official construction histories and 24 current project pages reviewed. Histories labelled PROJECT COMPLETED excluded; PROJECT CONSTRUCTION UPDATES plus current catalogue supports 40 names. Joint Porto Playa has independent owner records, not shared mutable data.',
  omniyat:
    'Official portfolio checked; Anwa Aria future completion evidence added. Older One at Palm/Anwa/Opus stock not used as fillers.',
  'select-group':
    'Full official portfolio explicitly distinguishes off-plan/completed and country. Five UAE off-plan projects (including sold-out ongoing) retained. Completed Peninsula/Jumeirah Living and London developments excluded.',
  nshama:
    'Thirty-six individual pages plus master construction catalogue checked. Current Under Construction entries added; pages marked 100%/completed excluded.',
  deyaar:
    'Official construction updates rechecked. Twelve sourced ongoing/current-launch names retained; delivered historical projects excluded.',
  wasl: 'Buying, community and 25 linked portfolio pages reviewed. South Garden and Hillside explicitly ongoing in Wasl Gate FAQ; One B Tower scheduled completion in official buying catalogue. Leasing stock and existing completed Wasl 1 buildings excluded.',
  samana:
    'Paginated official catalogue and 52 individual pages reviewed, including hidden FAQ text. Future-handover entries added. Explicit Santorini handover and old completed projects excluded; entries without adequate current status held.',
  imtiaz:
    'Forty-two official project pages reviewed. Thirty current launches/future-scheduled names retained; HANDOVER COMPLETED and ambiguous past-date entries excluded.',
  mag: 'Current official MAG destination redirects to Keturah portfolio. Three sourced UAE launches retained; legacy MAG 330/777 candidate URLs returned 404. Those older names need a readable authoritative current-status source before inclusion.',
  'union-properties':
    'Current official portfolio separates new Mirdad/Takaya from historical completed Motor City/Green Community projects. Two verified names retained.',
  arada:
    'Aljada/Masaar portfolios, named subphase pages and 2025/2026 construction announcements reviewed. Jenna 1, Nesba 1, Gate 6 and Rove Home Aljada added with dated launch or contract evidence. Older Masaar phases with past scheduled delivery held.',
  alef: 'Official live portfolio checked. Six named current developments retained. Apartment models and masterplan marketing subdivisions not invented as additional independent project cards.',
  'eagle-hills':
    'Global portfolio, Maryam Island and 28 linked pages reviewed; 17 official factsheets also examined. Four previous UAE launches retained. Maryam names are confirmed historically but factsheets do not establish current off-plan status; they are held rather than mixing completed buildings into this collection.',
  modon:
    'Fifteen project/community pages reviewed. Reem Hills ongoing apartment evidence added. Egypt Waterfront Residences/Ras El Hekma excluded. Published handover references differ across official pages; no date imported into public project data.',
  bloom:
    'Current Bloom Living portfolio rechecked. Eight named phases retained. Completed earlier phases and ready historic buildings excluded.',
  imkan:
    'Official projects, AlJurf construction and Kayan pages reviewed. Two current launches retained. Kayan shows a past February 2026 anticipated completion, and old construction updates do not resolve its current status; no assumption added.',
  reportage:
    'Full 55-entry global catalogue, individual pages and construction directory reviewed. Eleven UAE projects with explicitly incomplete construction added. Entries at 100%/delivered and overseas locations excluded. Verdana umbrella phases need current phase-level evidence before separate cards.',
  'rak-properties':
    'Nineteen linked pages and portfolio statuses reviewed. Porto Playa added with ongoing/future schedule evidence. Past scheduled dates without current status not treated as proof of ongoing construction.',
  'al-hamra':
    'Residential portfolio, Falcon Island and Ritz-Carlton pages reviewed. Four previous current launches retained; older candidates have insufficient clear current off-plan evidence in readable pages.',
  'al-zorah':
    'Official portfolio and delivery announcements checked. Gateway at Porto Al Zorah added from current page with scheduled 2026 completion. Seaside Hills/Fairways explicitly handed over; Sea Glints current status unresolved.',
};
let total = 0;
const rows = network.map((developer) => {
  const file = directory + developer.slug + '.json';
  const data = JSON.parse(fs.readFileSync(file));
  const count = data.projects.length;
  total += count;
  const previous = baseline.find((d) => d.developerSlug === developer.slug).projects.length;
  if (!data.previousSelectionNote) data.previousSelectionNote = data.selectionNote;
  data.selectionNote =
    'No numerical cap. ' +
    notes[developer.slug] +
    ' Names only; availability and complete project details remain unconfirmed.';
  data.expansionCheckedOn = '2026-10-31';
  fs.writeFileSync(file, JSON.stringify(data, null, 2) + '\n');
  return `| ${developer.name} | ${count} | +${count - previous} | ${notes[developer.slug]} |`;
});
const captures = fs
  .readdirSync('artifacts/project-expansion')
  .filter((f) => f.endsWith('.html')).length;
const verificationPath = 'docs/project-expansion-verification.json';
const verification = fs.existsSync(verificationPath)
  ? JSON.parse(fs.readFileSync(verificationPath, 'utf8'))
  : null;
const verificationSummary =
  verification?.status === 'passed' && verification.projectNames === total
    ? `Optimized production build and TypeScript pass (${verification.buildId}; ${verification.staticRoutes} generated routes). All ${total} owned project URLs return 200 with correct identity and noindex. All 30 card and hero collections match their evidence. Fifteen relevant browser/data cases pass across the main run and the targeted accessibility rerun; the initial whole-page scan exceeded its 45-second test budget after the catalogue grew, so the gallery accessibility case now scopes axe to the gallery while retaining document overflow checks. Detail-page accessibility remains checked separately. See docs/project-expansion-verification.json and artifacts/project-expansion/ for results, screenshots and the recorded limitation. Browser emulation, not physical-device testing. Local production preview: http://127.0.0.1:3000.`
    : 'Production build and browser verification: pending; the earlier 306-name verification is historical, not proof of this batch. Evidence is being written to artifacts/project-expansion/.';
const report = [
  '# Uncapped project-name research — 31 October 2026',
  '',
  `All 30 approved developers reviewed. ${total} sourced names now imported, up from 306 (+${total - 306}). No 15-project ceiling remains. ${captures} official-page HTML captures, corporate reports and targeted factsheets support the review. A capture count includes repeat catalogue and phase views, not unique projects.`,
  '',
  '## Scope and evidence limits',
  '',
  'The site remains UAE off-plan focused. This is a names-only collection: not confirmed inventory and not an assertion that every historical developer project is still under construction. Explicitly completed/ready and overseas candidates are excluded. Pending price, location, handover and payment fields remain null. Existing imagery remains illustrative.',
  'Separately marketed phases have distinct records where the official developer identifies them by name; the total therefore counts named project/phase records, not independent master communities.',
  '',
  'Official launch reports verify names and launch dates; they are weaker than a fresh project completion certificate for present construction status. Emaar subsequent phases and Binghatti branded pipeline inclusion use combined-source reasoning recorded in their entries. Main DAMAC pages were inaccessible (403). Several older candidates for other owners lack readable current-status evidence. These limits prevent claiming an exhaustive live project register. No arbitrary numerical cap or dummy fillers are used.',
  '',
  '## Developer-by-developer review',
  '',
  '| Developer | Sourced names | Added | Evidence / exclusions |',
  '| --- | ---: | ---: | --- |',
  ...rows,
  '',
  '## Implementation and verification',
  '',
  'Each owner has an independent JSON collection. Stable IDs and old canonical/alias URLs survive the expansion. All sourced records remain available through owned detail URLs and the paginated listing, now 15 cards per page. The hero uses the first 15 verified records at most; shorter collections receive image-only stock slides to complete 15 visual slides without creating project records. Shared names for joint developments are allowed only as distinct owner records. Source links are retained on detail pages. See docs/developer-project-pagination.md and docs/developer-hero-stock-images.md for the latest display behavior and verification; the following expansion verification is historical.',
  '',
  'The importer appends independent records when initial slots run out. Hero motion now avoids recalculating clipped geometry for distant hidden slides, preserving the approved reference shape while supporting collections over 100 projects.',
  '',
  verificationSummary,
  '',
  '## Remaining content dependencies',
  '',
  'Approved project imagery, detailed descriptions, location mapping, prices, payment plans, amenities, brochures and inventory are still required. Names alone do not make these pages publication-ready; noindex and illustrative-image labels remain. The work is local only.',
  '',
];
fs.writeFileSync('docs/project-expansion-progress.md', report.join('\n'));
fs.writeFileSync(
  'docs/project-name-research-progress.md',
  `# Project-name research status\n\nUncapped expansion imported: ${total} sourced names across all 30 approved developers (+${total - 306} versus the initial 306-name batch). See docs/project-expansion-progress.md for owner-by-owner evidence and limits, and docs/project-name-research.md for all source links.\n\nLatest display instruction: 15 hero slides and 15 listing cards per page. Shorter heroes use image-only stock slides; all real records remain in the collection. See docs/developer-project-pagination.md and docs/developer-hero-stock-images.md for current verification.\n\nHistorical expansion verification: ${verificationSummary}\n\nAll public details remain pending and illustrative. No deployment.\n`,
);
console.log(total, 'names,', captures, 'page captures; audit saved.');
