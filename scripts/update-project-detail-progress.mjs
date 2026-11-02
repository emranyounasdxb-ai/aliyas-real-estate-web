import fs from 'node:fs';

const network = JSON.parse(fs.readFileSync('src/data/approved-developer-network.json', 'utf8'));
const records = network.flatMap((owner) =>
  JSON.parse(fs.readFileSync(`src/data/developer-projects/${owner.slug}.json`, 'utf8'))
    .projects.filter((p) => p.nameSource || !p.placeholder),
);
const path = 'docs/project-detail-research-queue.json';
if (!fs.existsSync(path)) {
  if (records.length !== 575) throw new Error('Expected the authorized 575-record scope');
  fs.writeFileSync(path, JSON.stringify(records.map(({ id, slug, developerSlug, name }) => ({ id, slug, developerSlug, name })), null, 2) + '\n');
}
const queue = JSON.parse(fs.readFileSync(path, 'utf8'));
const byId = new Map(records.map((p) => [p.id, p]));
for (const item of queue) {
  const p = byId.get(item.id);
  if (!p || p.slug !== item.slug || p.developerSlug !== item.developerSlug || p.name !== item.name) throw new Error(`Scope identity changed: ${item.id}`);
}
const done = queue.filter((p) => byId.get(p.id).research?.status === 'reviewed');
const next = queue.find((p) => byId.get(p.id).research?.status !== 'reviewed');
const ledger = queue.filter((p) => byId.get(p.id).research).map((p) => ({
  ...p,
  ...byId.get(p.id).research,
}));
fs.writeFileSync('docs/project-detail-source-ledger.json', JSON.stringify(ledger, null, 2) + '\n');
const lines = [
  '# Project detail research progress', '',
  `Scope: ${queue.length} records across ${network.length} developers. Reviewed and populated: **${done.length}/${queue.length}**. Remaining: **${queue.length - done.length}**.`, '',
  next ? `Next: **${next.name}** (${next.developerSlug}, ${next.id}).` : 'All scoped records reviewed. Complete final verification before handoff.', '',
  'Read docs/project-detail-research-plan.md before continuing. Reviewed records may retain explicitly documented gaps; images remain illustrative and publication is deferred.', '',
  '| Developer | Reviewed | Total |', '| --- | ---: | ---: |',
  ...network.map((o) => `| ${o.name} | ${done.filter((p) => p.developerSlug === o.slug).length} | ${queue.filter((p) => p.developerSlug === o.slug).length} |`), '',
  '## Reviewed entries', '',
  ...done.map((p) => `- ${p.name} — /developers/${p.developerSlug}/projects/${p.slug} — checked ${byId.get(p.id).research.reviewedOn}`), '',
  '## Verification', '',
  'Batch verification is recorded in docs/verification.md and artifacts/project-details/. A populated record is not a claim of confirmed stock availability or approved imagery.', '',
];
fs.writeFileSync('docs/project-detail-research-progress.md', lines.join('\n'));
console.log(`${done.length}/${queue.length} reviewed. Next: ${next?.id ?? 'none'}`);
