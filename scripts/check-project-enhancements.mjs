import fs from 'node:fs';
import { createHash } from 'node:crypto';
const q = JSON.parse(fs.readFileSync('docs/project-page-enhancement-queue.json', 'utf8'));
if (q.projects.length !== 575 || new Set(q.projects.map((p) => p.id)).size !== 575)
  throw Error('Protected queue mismatch');
const owners = new Map(q.projects.map((p) => [p.id, p]));
let files = 0,
  assets = 0;
const mediaEntries = [];
const floorPlanOwners = new Set();
for (const group of ['project-media', 'project-locations', 'project-floor-plans']) {
  const seen = new Set();
  for (const f of fs
    .readdirSync(`src/data/${group}`, { recursive: true })
    .filter((f) => String(f).endsWith('.json'))) {
    const d = JSON.parse(fs.readFileSync(`src/data/${group}/${f}`, 'utf8')),
      p = owners.get(d.projectId);
    if (
      !p ||
      p.slug !== d.projectSlug ||
      p.developerSlug !== d.developerSlug ||
      seen.has(d.projectId)
    )
      throw Error(`Owner mismatch: ${group}/${f}`);
    seen.add(d.projectId);
    files++;
    if (group === 'project-media') mediaEntries.push(d);
    if (group === 'project-floor-plans') floorPlanOwners.add(d.projectId);
    const sources =
      group === 'project-floor-plans'
        ? [
            ...new Map(
              [d.source, ...d.plans.flatMap((p) => (p.source ? [p.source] : []))].map((s) => [
                s.pdf,
                s,
              ]),
            ).values(),
          ]
        : [];
    const items =
      group === 'project-media'
        ? d.images
        : group === 'project-locations'
          ? d.map
            ? [d.map]
            : []
          : [...d.plans, ...sources.map((s) => ({ src: s.pdf, sha256: s.sha256 }))];
    for (const asset of items) {
      if (!asset.src.startsWith(`/images/projects/${p.developerSlug}/${p.slug}/`))
        throw Error('Asset assigned to another owner');
      const b = fs.readFileSync(`public${asset.src}`);
      if (createHash('sha256').update(b).digest('hex') !== asset.sha256)
        throw Error('Asset hash mismatch');
      assets++;
    }
    if (
      group === 'project-media' &&
      (!d.images.some((i) => i.src === d.cardImage) ||
        (d.editorialImages || []).some((src) => !d.images.some((i) => i.src === src)))
    )
      throw Error('Invalid media selection');
    if (
      group === 'project-locations' &&
      d.travel.destinations.some(
        ({ name, minutes, maxMinutes, timeQualifier, distanceKm }) =>
          !name ||
          !Number.isFinite(minutes) ||
          minutes < 0 ||
          (maxMinutes !== undefined && (!Number.isFinite(maxMinutes) || maxMinutes <= minutes)) ||
          (timeQualifier !== undefined &&
            (timeQualifier !== 'within' || maxMinutes !== undefined)) ||
          (distanceKm !== undefined && (!Number.isFinite(distanceKm) || distanceKm <= 0)),
      )
    )
      throw Error(`Invalid travel estimate: ${f}`);
    if (
      group === 'project-floor-plans' &&
      d.plans.some(
        (p) =>
          !p.area ||
          (p.imageSource
            ? p.sourcePage !== undefined ||
              p.source ||
              !p.imageSource.label ||
              new URL(p.imageSource.url).protocol !== 'https:' ||
              (p.imageSource.background !== undefined && p.imageSource.background !== 'dark')
            : !Number.isInteger(p.sourcePage) || p.sourcePage < 1),
      )
    )
      throw Error('Invalid source sheet');
  }
}
for (const media of mediaEntries) {
  const unavailable = media.unavailableFloorPlans;
  if (floorPlanOwners.has(media.projectId)) {
    if (unavailable) throw Error('Conflicting floor-plan availability');
  } else if (
    !unavailable?.note ||
    !/^\d{4}-\d{2}-\d{2}$/.test(unavailable.reviewedOn) ||
    !unavailable.sources?.length ||
    unavailable.sources.some((source) => !source.label || new URL(source.url).protocol !== 'https:')
  ) {
    throw Error('Missing reviewed floor-plan availability evidence');
  }
}
console.log(
  JSON.stringify({
    protectedProjects: q.projects.length,
    reviewedManifests: files,
    verifiedAssetHashes: assets,
  }),
);
