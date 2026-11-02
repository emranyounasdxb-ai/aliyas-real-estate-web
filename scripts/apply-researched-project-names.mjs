import { readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';

// Deliberately names only. Ownership, stable IDs, imagery and all pending detail fields survive.
const root = resolve(import.meta.dirname, '..');
const owners = process.argv.slice(2);
if (!owners.length) throw new Error('Supply the developer slugs whose research has been reviewed.');
for (const owner of owners) {
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(owner)) throw new Error('Invalid owner');
  const research = JSON.parse(
    await readFile(resolve(root, 'docs/project-name-research', `${owner}.json`), 'utf8'),
  );
  const path = resolve(root, 'src/data/developer-projects', `${owner}.json`);
  const collection = JSON.parse(await readFile(path, 'utf8'));
  if (research.developerSlug !== owner || collection.developerSlug !== owner)
    throw new Error('Owner mismatch');
  if (!research.projects.length) throw new Error(`Empty reviewed collection: ${owner}`);
  const used = new Set();
  for (const entry of research.projects) {
    const slug = entry.name
      .normalize('NFKD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
    if (
      !slug ||
      used.has(slug) ||
      !entry.evidence ||
      !entry.checkedOn ||
      new URL(entry.url).protocol !== 'https:'
    )
      throw new Error(`Invalid evidence: ${owner}/${slug}`);
    used.add(slug);
    let project = collection.projects.find((p) => p.nameSource && p.name === entry.name);
    project ??= collection.projects.find((p) => !p.nameSource && p.placeholder);
    if (!project) {
      // A new independent record, never a shared object or copied approved project data.
      const sequence =
        Math.max(0, ...collection.projects.map((p) => Number(p.id.match(/-(\d+)$/)?.[1] ?? 0))) + 1;
      const id = `${owner}-project-${String(sequence).padStart(2, '0')}`;
      const image = collection.projects[(sequence - 1) % collection.projects.length].image;
      project = {
        id,
        slug,
        developerSlug: owner,
        name: entry.name,
        image,
        placeholder: true,
        description: null,
        areaId: null,
        location: null,
        emirate: null,
        type: null,
        bedrooms: null,
        price: null,
        handover: null,
        paymentPlan: null,
        amenities: [],
        brochureUrl: null,
        floorPlanUrl: null,
        gallery: [{ src: image, label: 'Illustrative exterior' }],
      };
      collection.projects.push(project);
    }
    if (project.developerSlug !== owner || !project.id.startsWith(`${owner}-`))
      throw new Error('Project owner mismatch');
    if (project.slug !== slug) {
      project.previousSlugs = [...new Set([...(project.previousSlugs ?? []), project.slug])];
      project.slug = slug;
    }
    project.name = entry.name;
    project.nameSource = { url: entry.url, checkedOn: entry.checkedOn };
  }
  await writeFile(path, JSON.stringify(collection, null, 2) + '\n');
  console.log(
    `${owner}: ${research.projects.length} verified project names; other slots remain hidden.`,
  );
}
