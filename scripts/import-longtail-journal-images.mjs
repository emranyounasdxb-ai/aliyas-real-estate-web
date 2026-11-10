import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

// The supplied index and the article plan must agree for every individual image.
// Alt text describes the visible scene without identifying an unsourced property.
const descriptions = [
  'A couple and adviser walking beside apartment buildings',
  'Banknotes, a calculator and house keys on a table',
  'Packed furniture in a moving van outside an apartment building',
  'A suitcase inside a bright apartment overlooking the sea',
  'A coastal residential skyline seen from above at sunset',
  'Apartment buildings and a landscaped entrance lit at dusk',
  'A home office screen displaying a rental income spreadsheet',
  'A compact living area beside a separate bedroom',
  'An unfinished interior overlooking completed apartments',
  'A person making a contactless payment at a card terminal',
  'A cafe table overlooking a residential street',
  'A boat near waterfront apartment buildings',
  'A close view of apartment balconies and windows',
  'Waves on a beach beside a coastal apartment skyline',
  'A kayaker passing through a mangrove channel',
  'An inspector checking an apartment window frame with a level',
  'An aerial view of neighbouring residential villas',
  'A shaded villa courtyard with a palm tree and garden',
  'Morning traffic viewed through a commuter car windscreen',
  'A parent and child arranging groceries in a kitchen',
  'Utility meters and pipes inside an apartment cupboard',
  'Furniture and moving boxes in a bright apartment',
  'A child playing in an apartment overlooking a shared courtyard',
  'A worker cleaning a residential swimming pool',
  'A gardener maintaining landscaping outside apartment buildings',
  'A cleaner working in an empty apartment bedroom',
  'A photographer and tripod reflected in a dining room mirror',
  'A distance meter and measuring tape in an empty apartment',
  'A moisture meter being used beneath a bathroom basin',
  'A person overlooking a residential skyline from a terrace',
  'Residential towers and building sites illuminated at night',
  'A family sharing food on the floor of a new apartment',
  'Stone, timber and tile samples on a workbench',
  'A resident watering plants on an apartment balcony',
  'A suitcase by an airport window overlooking aircraft and the city',
  'A construction excavation beside completed residential towers',
  'An engineer flying an inspection drone over a building site',
  'A wall calendar with coloured markers beside an apartment',
  'A person testing a light switch in a new apartment',
  'A shower fitting and tiled wall in a bathroom',
  'An apartment building entrance intercom at dusk',
  'A worker cleaning apartment windows above a waterfront',
  'A compact apartment with a wall bed and living area',
  'A bicycle beside a landscaped residential cycle path',
  'A quiet street lined with modern townhouses',
  'A residential waterfront with a boat and illuminated buildings',
  'A family park between landscaped apartment buildings',
  'A bridge over a lake surrounded by residential towers',
  'A metro train passing through a landscaped residential neighbourhood',
  'A cleaner making a bed in a furnished apartment',
  'An apartment kitchen and living area with built-in storage',
  'The open door of a bank vault',
  'A residential building scale model in a sales gallery',
  'A surveyor measuring near a residential building',
  'Waterfront towers and a lower-rise residential neighbourhood',
  'A family sitting beside a neighbourhood street and school bus',
  'A waterfront skyline reflected in shallow water',
  'A stamp and closed folder on a desk overlooking the water',
  'A residential building parking area and service equipment',
  'A landscaped courtyard between modern apartment buildings',
  'A tree-lined path beside modern residential villas',
  'An outdoor basketball court surrounded by apartments',
  'A landscaped waterfront walkway and residential buildings at night',
  'A waterfront promenade beside apartment buildings',
  'An apartment balcony overlooking the water and skyline',
  'Residential buildings seen through the windows of a commuter bus',
  'A family sharing a picnic in a green park',
  'Construction workers and a concrete mixer at an apartment development',
  'A residential corridor lined with doors, plants and doormats',
  'A dripping kitchen tap over a sink',
  'A coastal city skyline viewed across the water',
  'Books and framed photographs on shelves in an apartment',
  'A ceiling sprinkler and smoke detector above a living area',
  'A boardwalk leading to coastal villas and landscaped grounds',
  'A family walking beside a waterfront apartment building',
  'A residential facade with patterned terracotta shading',
  'A worker plastering an apartment wall',
  'Two people talking at an apartment doorway',
  'A residential gym overlooking apartment towers',
  'Two waterfront housing photographs displayed on a corkboard',
  'Coastal residential buildings backed by mountains at sunset',
  'Residential and hotel buildings under construction beside the water',
  'An aerial view of coastal roads and waterfront homes',
  'A golf course and residential buildings beside palm trees',
  'A corroded balcony door hinge near the sea',
  'A residential lobby with a curved stone staircase',
  'A technician testing a kitchen extractor in an apartment',
  'Shallow tidal water and flamingos near a residential coastline',
  'A shaded terrace overlooking a mountainous coast',
  'Binoculars on a railing overlooking a coastal neighbourhood',
  'A divided residential road between apartment buildings and villas',
  'A compact apartment bedroom with simple furnishings',
  'An apartment dining area with an open-plan kitchen',
  'A buyer and adviser discussing finance at a table',
  'A balance scale holding miniature bank and residential buildings',
  'A magnifying glass over a property credential card',
  'A crack in the exterior wall of a residential building',
  'A passport booklet on an apartment entry table',
  'An hourglass on a windowsill overlooking apartment buildings',
  'Two people reviewing and signing a property management document',
];

const repo = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const source = process.argv[2];
assert.ok(source, 'Pass the directory containing the 100 supplied images.');
const sourceRoot = path.resolve(source);
const index = JSON.parse(await fs.readFile(path.join(sourceRoot, 'index.json'), 'utf8'));
const plans = JSON.parse(
  await fs.readFile(path.join(repo, 'src/lib/journal-longtail-plans.json'), 'utf8'),
);
assert.equal(index.length, 100);
assert.equal(plans.length, 100);
assert.equal(descriptions.length, 100);
assert.equal(new Set(index.map((item) => item.number)).size, 100);
assert.equal(new Set(index.map((item) => item.sha256)).size, 100);
const normalise = (value) =>
  value
    .normalize('NFKC')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
const widths = [480, 768, 1080, 1672];
const output = path.join(repo, 'public/images/journal');
const mediaPath = path.join(repo, 'src/lib/journal-images.json');
const manifestPath = path.join(repo, 'docs/journal-image-manifest.json');
await fs.mkdir(output, { recursive: true });
const media = JSON.parse(await fs.readFile(mediaPath, 'utf8'));
const previousAudit = JSON.parse(await fs.readFile(manifestPath, 'utf8'));
const audit = Array(100);
sharp.cache(false);
sharp.concurrency(2);
let next = 0;
let finished = 0;

async function prepare() {
  while (next < index.length) {
    const item = index[next++];
    const plan = plans[item.number - 1];
    assert.equal(plan.id, `aliyas-journal-${item.number + 100}`);
    assert.equal(normalise(plan.title), normalise(item.keyword), `Title mismatch for ${plan.id}`);
    assert.equal(normalise(path.parse(item.filename).name), normalise(item.keyword));
    const batch = `Batch_${String(item.batch).padStart(2, '0')}`;
    const original = await fs.readFile(path.join(sourceRoot, batch, item.filename));
    const digest = createHash('sha256').update(original).digest('hex');
    assert.equal(digest, item.sha256, `Source hash mismatch for ${plan.id}`);
    const metadata = await sharp(original).metadata();
    assert.equal(metadata.width, 1672);
    assert.equal(metadata.height, 941);
    const variants = [];
    for (const width of widths) {
      const image = sharp(original).resize({ width, withoutEnlargement: true });
      const bytes = await image.webp({ quality: 90, effort: 4 }).toBuffer();
      const check = await sharp(bytes).metadata();
      assert.equal(check.width, width);
      const encodedDigest = createHash('sha256').update(bytes).digest('hex').slice(0, 12);
      const filename = `${plan.id}-${encodedDigest}-${width}.webp`;
      await fs.writeFile(path.join(output, filename), bytes);
      variants.push({ width, url: `/images/journal/${filename}`, bytes: bytes.length });
    }
    media[plan.id] = {
      image: variants.at(-1).url,
      imageAlt: `${descriptions[item.number - 1]}.`,
      imageSrcSet: variants.map((variant) => `${variant.url} ${variant.width}w`).join(', '),
      imageWidth: metadata.width,
      imageHeight: metadata.height,
    };
    audit[item.number - 1] = {
      id: plan.id,
      keyword: item.keyword,
      sourceFilename: item.filename,
      sourceDirectory: `ALIYAS_100_Blog_Images/${batch}`,
      sourceSha256: digest,
      originalBytes: original.length,
      width: metadata.width,
      height: metadata.height,
      encoding: 'WebP quality 90',
      variants,
    };
    finished++;
    if (finished % 10 === 0) console.log(`Prepared ${finished}/100 matched image sets`);
  }
}

await Promise.all(Array.from({ length: 3 }, prepare));
assert.equal(audit.filter(Boolean).length, 100);
await fs.writeFile(mediaPath, `${JSON.stringify(media, null, 2)}\n`);
await fs.writeFile(
  manifestPath,
  `${JSON.stringify(
    [...previousAudit.filter((row) => !audit.some((item) => item.id === row.id)), ...audit].sort(
      (a, b) => a.id.localeCompare(b.id),
    ),
    null,
    2,
  )}\n`,
);
console.log(
  JSON.stringify({
    images: audit.length,
    responsiveFiles: audit.length * widths.length,
    sourceBytes: audit.reduce((a, x) => a + x.originalBytes, 0),
    webpBytes: audit.reduce((a, x) => a + x.variants.reduce((b, v) => b + v.bytes, 0), 0),
  }),
);
