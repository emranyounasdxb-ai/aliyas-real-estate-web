import fs from 'node:fs/promises';
import { createHash } from 'node:crypto';
import sharp from 'sharp';
const selection = process.argv[2];
if (!selection) throw Error('Supply a reviewed selection JSON');
const c = JSON.parse(await fs.readFile(selection, 'utf8'));
if (
  !c.floorPlans &&
  (!c.unavailableFloorPlans?.note ||
    !/^\d{4}-\d{2}-\d{2}$/.test(c.unavailableFloorPlans.reviewedOn) ||
    !c.unavailableFloorPlans.sources?.length ||
    c.unavailableFloorPlans.sources.some(
      (source) => !source.label || new URL(source.url).protocol !== 'https:',
    ))
)
  throw Error('Missing reviewed floor-plan availability evidence');
if (c.floorPlans && c.unavailableFloorPlans) throw Error('Conflicting floor-plan availability');
const queueFile = 'docs/project-page-enhancement-queue.json';
const q = JSON.parse(await fs.readFile(queueFile, 'utf8'));
const owner = q.projects.find((p) => p.id === c.id);
if (!owner || owner.slug !== c.slug || owner.developerSlug !== c.developerSlug)
  throw Error('Protected owner mismatch');
const identity = { projectId: c.id, projectSlug: c.slug, developerSlug: c.developerSlug };
const base = `/images/projects/${c.developerSlug}/${c.slug}`;
await fs.mkdir('public' + base, { recursive: true });
const digest = (bytes) => createHash('sha256').update(bytes).digest('hex');
async function read(asset) {
  if (asset.cache) return fs.readFile(asset.cache);
  const r = await fetch(asset.url);
  if (!r.ok) throw Error(`${r.status}: ${asset.url}`);
  return Buffer.from(await r.arrayBuffer());
}
async function save(name, bytes, ext) {
  const sha256 = digest(bytes),
    src = `${base}/${name}-${sha256.slice(0, 12)}.${ext}`;
  await fs.writeFile('public' + src, bytes);
  return { src, sha256, originalBytes: bytes.length };
}
const images = [];
for (const asset of c.images) {
  const bytes = await read(asset);
  const metadata = await sharp(bytes).metadata();
  if (!metadata.width || !metadata.height) throw Error('Invalid source image');
  const extension =
    metadata.format === 'heif' && metadata.compression === 'av1'
      ? 'avif'
      : metadata.format === 'jpeg'
        ? 'jpg'
        : metadata.format;
  if (!['jpg', 'png', 'webp', 'avif'].includes(extension)) throw Error('Unsupported source format');
  const blur = await sharp(bytes)
    .resize({ width: 20, withoutEnlargement: true })
    .webp({ quality: 45 })
    .toBuffer();
  images.push({
    ...(await save(asset.name, bytes, extension)),
    label: asset.label,
    alt: asset.alt,
    position: asset.position,
    width: metadata.width,
    height: metadata.height,
    blurDataURL: `data:image/webp;base64,${blur.toString('base64')}`,
    sourceUrl: asset.url,
    ...(asset.photograph === true ? { photograph: true } : {}),
  });
}
const byName = (name) => {
  const i = c.images.findIndex((asset) => asset.name === name);
  if (i < 0) throw Error('Unknown selected image');
  return images[i].src;
};
const photoCount = images.filter((image) => image.photograph).length;
const kind =
  photoCount === 0
    ? 'developer-render'
    : photoCount === images.length
      ? 'developer-photo'
      : 'developer-mixed';
const media = {
  ...identity,
  status: 'reviewed',
  kind,
  source: c.source,
  use: 'Approved local rollout. Original project-specific developer imagery.',
  cardImage: byName(c.cardName),
  editorialImages: c.editorialNames.map(byName),
  images,
  ...(c.unavailableFloorPlans ? { unavailableFloorPlans: c.unavailableFloorPlans } : {}),
};
let location = { ...identity, checkedOn: c.checkedOn, ...c.location };
if (c.location.map) {
  const bytes = await read(c.location.map),
    m = await sharp(bytes).metadata();
  location.map = {
    ...(await save('location', bytes, m.format === 'jpeg' ? 'jpg' : m.format)),
    width: m.width,
    height: m.height,
    sourceUrl: c.location.map.url,
    alt: c.location.map.alt,
    scope: c.location.map.scope,
    caption: c.location.map.caption,
  };
}
let floor = null;
const plans = [];
if (c.floorPlans) {
  const pdf = await read(c.floorPlans);
  if (pdf.subarray(0, 5).toString() !== '%PDF-') throw Error('Not a PDF');
  const original = await save('floor-plans', pdf, 'pdf');
  const documents = new Map();
  for (const doc of c.floorPlans.additionalDocuments || []) {
    if (!/^[a-z0-9-]+$/.test(doc.id) || documents.has(doc.id))
      throw Error('Invalid additional document ID');
    const b = await read(doc);
    if (b.subarray(0, 5).toString() !== '%PDF-') throw Error('Not an additional PDF');
    const saved = await save('floor-plans-' + doc.id, b, 'pdf');
    documents.set(doc.id, {
      url: doc.url,
      label: doc.label,
      reviewedOn: c.checkedOn,
      pdf: saved.src,
      sha256: saved.sha256,
    });
  }
  for (let start = 0; start < c.floorPlans.plans.length; start += 4) {
    const sheets = await Promise.all(
      c.floorPlans.plans.slice(start, start + 4).map(async (plan, index) => {
        const source = plan.documentId ? documents.get(plan.documentId) : undefined;
        if (plan.documentId && !source) throw Error('Unknown plan document');
        const raster = await fs.readFile(plan.cache);
        if (plan.imageSource) {
          if (
            source ||
            plan.sourcePage ||
            new URL(plan.imageSource.url).protocol !== 'https:' ||
            !plan.imageSource.label ||
            (plan.imageSource.background !== undefined && plan.imageSource.background !== 'dark')
          )
            throw Error('Invalid floor plan image source');
          const { width, height, format } = await sharp(raster).metadata();
          if (!width || !height || !['jpeg', 'png', 'webp'].includes(format))
            throw Error('Invalid floor plan image');
          const asset = await save(
            `plan-image-${start + index + 1}`,
            raster,
            format === 'jpeg' ? 'jpg' : format,
          );
          return {
            label: plan.label,
            area: plan.area,
            sourceIds: ['plan-image'],
            imageSource: plan.imageSource,
            ...asset,
            width,
            height,
          };
        }
        const bytes = await sharp(raster).webp({ lossless: true }).toBuffer();
        const { width, height } = await sharp(bytes).metadata();
        const asset = await save(
          `plan-${plan.documentId ? plan.documentId + '-' : ''}page-${plan.sourcePage}`,
          bytes,
          'webp',
        );
        return {
          label: plan.label,
          area: plan.area,
          sourceIds: [plan.documentId ? 'plans-' + plan.documentId : 'plans'],
          sourcePage: plan.sourcePage,
          ...asset,
          width,
          height,
          ...(source ? { source } : {}),
        };
      }),
    );
    plans.push(...sheets);
  }
  const maxDimension = Math.max(0, ...plans.map((plan) => Math.max(plan.width, plan.height)));
  floor = {
    ...identity,
    source: {
      url: c.floorPlans.url,
      label: c.floorPlans.label,
      reviewedOn: c.checkedOn,
      pdf: original.src,
      sha256: original.sha256,
    },
    render: {
      tool: c.floorPlans.renderTool ?? 'Poppler pdftoppm, lossless WebP delivery',
      maxDimension,
      format: 'lossless WebP',
      scope: 'Complete unedited source drawing sheets; original PDF preserved.',
    },
    eyebrow: c.floorPlans.eyebrow,
    introduction: c.floorPlans.introduction,
    selectorLabel: c.floorPlans.selectorLabel,
    note: c.floorPlans.note,
    researchNoteReplacements: c.floorPlans.researchNoteReplacements,
    plans,
  };
} else if (
  await fs.access(`src/data/project-floor-plans/${c.developerSlug}/${c.slug}.json`).then(
    () => true,
    () => false,
  )
) {
  throw Error(
    'An existing drawing manifest needs explicit review before recording unavailable plans',
  );
}
for (const [folder, data] of [
  ['project-media/' + c.developerSlug, media],
  ['project-locations/' + c.developerSlug, location],
  ...(floor ? [['project-floor-plans/' + c.developerSlug, floor]] : []),
]) {
  await fs.mkdir('src/data/' + folder, { recursive: true });
  await fs.writeFile(
    `src/data/${folder}/${c.slug}.json`,
    JSON.stringify(data, null, 2) + '\n',
    'utf8',
  );
}
// Asset conversion can take long enough for another project's verification to finish.
// Merge into the latest queue instead of writing the snapshot read before conversion.
const currentQueue = JSON.parse(await fs.readFile(queueFile, 'utf8'));
const currentOwner = currentQueue.projects.find((project) => project.id === c.id);
if (!currentOwner || currentOwner.slug !== c.slug || currentOwner.developerSlug !== c.developerSlug)
  throw Error('Protected owner changed during preparation');
if (currentOwner.status !== owner.status)
  throw Error('Project status changed during preparation. Review before retrying.');
Object.assign(currentOwner, {
  status: 'integrated-awaiting-verification',
  checkedOn: c.checkedOn,
  imageCount: images.length,
  floorPlanSheets: plans.length,
  sources: [
    ...new Set(
      [
        c.source.url,
        c.location.travel.sourceUrl,
        ...(c.floorPlans
          ? [
              c.floorPlans.url,
              ...(c.floorPlans.additionalDocuments || []).map((d) => d.url),
              ...(c.floorPlans.imageSourceIndex ? [c.floorPlans.imageSourceIndex] : []),
            ]
          : c.unavailableFloorPlans.sources.map((source) => source.url)),
      ].filter(Boolean),
    ),
  ],
  selection,
  evidence: c.evidence,
  review: c.review,
  unavailable: c.unavailable || [],
});
delete currentOwner.verifiedOn;
delete currentOwner.verification;
currentQueue.verifiedCount = currentQueue.projects.filter((project) =>
  ['verified', 'approved-sample'].includes(project.status),
).length;
currentQueue.pending = currentQueue.total - currentQueue.verifiedCount;
const nextProject = currentQueue.projects.find(
  (project) => !['verified', 'approved-sample'].includes(project.status),
);
currentQueue.currentProject = nextProject?.id;
currentQueue.currentDeveloper = nextProject?.developerSlug;
currentQueue.updatedOn = c.checkedOn;
await fs.writeFile(queueFile, JSON.stringify(currentQueue, null, 2) + '\n', 'utf8');
console.log(
  'Prepared',
  c.slug,
  images.length,
  'own images,',
  plans.length,
  'plan sheets. Browser verification required.',
);
