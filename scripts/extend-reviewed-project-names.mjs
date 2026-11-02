import fs from 'node:fs';
const additions = JSON.parse(fs.readFileSync(process.argv[2], 'utf8'));
const key = (s) =>
  s
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '');
for (const [owner, entries] of Object.entries(additions)) {
  const path = `docs/project-name-research/${owner}.json`;
  const data = JSON.parse(fs.readFileSync(path, 'utf8'));
  const added = [];
  for (const entry of entries) {
    if (!entry.name || !entry.evidence || !entry.url?.startsWith('https://'))
      throw new Error(`Invalid reviewed entry for ${owner}`);
    // Several separately named phases may share one official catalogue or report URL.
    if (data.projects.some((p) => key(p.name) === key(entry.name))) continue;
    data.projects.push({ ...entry, checkedOn: '2026-10-31' });
    added.push(entry.name);
  }
  data.expansionCheckedOn = '2026-10-31';
  data.selectionNote = data.selectionNote.replace(
    /^(14 entries labelled[\s\S]*|15.*)$/,
    'Current official project sources reviewed. Names only; availability and full project details are not asserted.',
  );
  if (!data.selectionNote.includes('No numerical cap'))
    data.selectionNote +=
      ' No numerical cap applies to the expanded collection. New names require official UAE launch, ongoing-construction or future-handover evidence; completed and ambiguous candidates are not used as fillers.';
  fs.writeFileSync(path, JSON.stringify(data, null, 2) + '\n');
  console.log(`${owner}: +${added.length}, total ${data.projects.length}: ${added.join(', ')}`);
}
