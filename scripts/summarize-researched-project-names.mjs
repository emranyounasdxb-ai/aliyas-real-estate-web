import { readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const network = JSON.parse(
  await readFile(resolve(root, 'src/data/approved-developer-network.json'), 'utf8'),
);
const records = await Promise.all(
  network.map(async (developer) => ({
    ...developer,
    research: JSON.parse(
      await readFile(resolve(root, 'docs/project-name-research', `${developer.slug}.json`), 'utf8'),
    ),
  })),
);
const total = records.reduce((sum, d) => sum + d.research.projects.length, 0);
const baseline = JSON.parse(
  await readFile(resolve(root, 'docs/project-expansion-baseline.json'), 'utf8'),
);
const previousCount = (slug) =>
  baseline.find((d) => d.developerSlug === slug)?.projects.length ?? 0;
const report = [
  '# Verified project names — 31 October 2026',
  '',
  `${records.length} approved developers; ${total} sourced names, ${total - 306} added in the uncapped expansion. There is no per-developer numerical limit. Only verified names are shown.`,
  '',
  'This is a names-only import, not confirmed inventory. Prices, locations, bedroom counts, completion dates and payment plans remain pending; existing imagery is illustrative. Public pages retain this disclosure and noindex until full content is approved.',
  '',
  'Names are checked against official project catalogues, individual pages, construction histories and launch reports. This is not a claim to an exhaustive live register or a chronological launch ranking. Some current status assessments rely on launch evidence rather than a fresh completion certificate; the entry-level evidence records those limits. Sold-out ongoing developments may be represented. Identifiably completed, overseas and ambiguous candidates are excluded. See project-expansion-progress.md for the owner-by-owner audit and remaining evidence gaps.',
  '',
  '| Developer | Verified names | Added this expansion |',
  '| --- | ---: | ---: |',
  ...records.map(
    (d) =>
      `| ${d.name} | ${d.research.projects.length} | ${d.research.projects.length - previousCount(d.slug)} |`,
  ),
  '',
  '## Ownership and links',
  '',
  'Each developer retains its separate source JSON and stable project IDs. Cards and the hero use the same verified collection and canonical scoped URLs. Previous placeholder slugs redirect to those canonical pages. Unverified slots are hidden and have no public detail route. Their underlying data is retained for later approved additions.',
  '',
  '## Sources and selections',
];
for (const d of records)
  report.push(
    '',
    `### ${d.name}`,
    '',
    d.research.selectionNote,
    '',
    ...d.research.projects.map((p, i) => `${i + 1}. [${p.name}](${p.url})`),
  );
await writeFile(resolve(root, 'docs/project-name-research.md'), report.join('\n') + '\n');
console.log(`${records.length} developers, ${total} sourced project names, no per-developer cap.`);
