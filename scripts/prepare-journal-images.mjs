import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

// Owner-approved subject matching. The first number is the immutable article ID;
// the second identifies the source filename suffix, NOT the article order.
const originalAssignments = [
  [1, 1, 'Dubai Creek and the city skyline at sunrise'],
  [2, 2, 'Residents in a landscaped courtyard surrounded by modern homes'],
  [3, 3, 'Buyers viewing a bright apartment overlooking Dubai'],
  [4, 5, 'An established stone villa surrounded by mature planting'],
  [5, 6, 'Residential architecture, landscaping and the Dubai skyline'],
  [6, 4, 'A tree lined residential street with midrise apartment buildings'],
  [7, 8, 'A buyer researching property on a terrace overlooking the coast'],
  [8, 7, 'An apartment balcony overlooking green space and city transport links'],
  [9, 9, 'Residents, shops and a tram sharing a walkable urban neighbourhood'],
  [10, 10, 'A property adviser guiding buyers through a residential community'],
  [11, 11, 'A buyer and adviser discussing a property beside a city view'],
  [12, 14, 'A spacious sunlit interior with arched windows and city views'],
  [13, 12, 'A buyer taking time to consider a home from its terrace'],
  [14, 13, 'A surveyor assessing an apartment building and its surroundings'],
  [15, 15, 'Keys on a table inside a furnished apartment ready to use'],
  [16, 16, 'A buyer examining a scale model of a coastal residential development'],
  [17, 17, 'Completed residences beside a development under construction'],
  [18, 18, 'Buyers reviewing a payment plan with an adviser'],
  [19, 19, 'First home buyers inspecting a kitchen together'],
  [20, 20, 'A family spending time together in a bright villa living room'],
  [21, 21, 'A waterfront promenade with the Abu Dhabi skyline'],
  [22, 22, 'Ajman waterfront homes beside a beach at sunset'],
  [23, 24, 'A family walking beside a playground in a Sharjah neighbourhood'],
  [24, 23, 'Lagoon side villas with a mountain backdrop in Ras Al Khaimah'],
  [25, 25, 'A rocky coastline and waterfront homes near Fujairah'],
  [26, 26, 'Waterside homes, mangroves and a quiet creek in Umm Al Quwain'],
  [27, 27, 'Buyers comparing city views of Dubai and Abu Dhabi with an adviser'],
  [28, 28, 'A spacious family apartment terrace overlooking the northern Emirates'],
  [29, 29, 'Different housing styles and local shops along a neighbourhood street'],
  [30, 31, 'Coastal homes, city towers and suburban communities in one panorama'],
  [31, 30, 'A resident working from a sunlit rental apartment'],
  [32, 32, 'An established community with mature trees, shops and apartments'],
  [33, 33, 'A family enjoying a villa garden at golden hour'],
  [34, 34, 'Townhouses arranged around a shared landscaped green'],
  [35, 35, 'A compact studio apartment with built in storage and natural light'],
  [36, 36, 'People collaborating in a bright office overlooking the city'],
  [37, 37, 'Warehouses, delivery vehicles and loading areas at a logistics hub'],
  [38, 38, 'Homes, shops and restaurants sharing a lively mixed use neighbourhood'],
  [39, 39, 'A property manager and technician checking an apartment air conditioner'],
  [40, 40, 'A modern villa with roof solar panels and water conscious landscaping'],
  [41, 41, 'A metro train passing modern residential buildings'],
  [42, 42, 'Business professionals arriving at a landscaped office campus'],
  [43, 44, 'An architect reviewing long term plans beside a coastal city view'],
  [44, 43, 'A varied urban landscape of villas, offices and apartment towers'],
  [45, 45, 'Stone finishes, joinery and natural light inside a carefully detailed home'],
  [46, 46, 'Buyers reviewing a property checklist with an adviser'],
  [47, 47, 'A buyer and surveyor inspecting a completed residential building'],
  [48, 48, 'A calculator, planning documents and a residential scale model'],
  [49, 49, 'A landscaped residential district and growing city skyline at sunrise'],
  [50, 50, 'An adviser welcoming buyers into a bright apartment'],
];

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const source = process.argv[2];
assert.ok(source, 'Pass the directory containing the approved original PNGs.');
// Optional second input imports another owned batch without replacing earlier media.
const assignments = process.argv[3]
  ? JSON.parse(await fs.readFile(path.resolve(process.argv[3]), 'utf8'))
  : originalAssignments;
const artifactDirectory = process.argv[3] ? 'journal-100' : 'journal-images';
const files = (await fs.readdir(source)).filter((name) => /-\d+\.png$/i.test(name));
const widths = [480, 768, 1080, 1672];
const output = path.join(root, 'public/images/journal');
await fs.mkdir(output, { recursive: true });
await fs.mkdir(path.join(root, 'artifacts', artifactDirectory), { recursive: true });
const mediaPath = path.join(root, 'src/lib/journal-images.json');
const manifestPath = path.join(root, 'docs/journal-image-manifest.json');
const readExisting = async (filename, fallback) => {
  try {
    return JSON.parse(await fs.readFile(filename, 'utf8'));
  } catch (error) {
    if (error.code === 'ENOENT') return fallback;
    throw error;
  }
};
const media = await readExisting(mediaPath, {});
const previousAudit = await readExisting(manifestPath, []);
const audit = [];
assert.equal(new Set(assignments.map((row) => row[0])).size, assignments.length);
assert.equal(new Set(assignments.map((row) => row[1])).size, assignments.length);

for (const [number, sourceNumber, description] of assignments) {
  const id = `aliyas-journal-${String(number).padStart(3, '0')}`;
  const matches = files.filter((name) => Number(name.match(/-(\d+)\.png$/i)[1]) === sourceNumber);
  assert.equal(matches.length, 1, `Expected one source for ${id}`);
  const original = await fs.readFile(path.join(source, matches[0]));
  const digest = createHash('sha256').update(original).digest('hex');
  const metadata = await sharp(original).metadata();
  assert.equal(metadata.width, 1672);
  assert.ok(metadata.height === 940 || metadata.height === 941, 'Unexpected source height');
  const variants = [];

  for (const width of widths) {
    const pipeline = () => {
      const input = sharp(original);
      return width === metadata.width ? input : input.resize({ width, withoutEnlargement: true });
    };
    // Resample only when a smaller display size is needed; no lossy quantisation.
    const bytes = await pipeline().webp({ lossless: true, effort: 6 }).toBuffer();
    const expected = await pipeline().ensureAlpha().raw().toBuffer();
    const decoded = await sharp(bytes).ensureAlpha().raw().toBuffer();
    assert.ok(expected.equals(decoded), `Pixel comparison failed: ${id} at ${width}px`);
    const filename = `${id}-${digest.slice(0, 12)}-${width}.webp`;
    await fs.writeFile(path.join(output, filename), bytes);
    variants.push({
      width,
      url: `/images/journal/${filename}`,
      bytes: bytes.length,
      losslessPixelsVerified: true,
    });
  }
  // Confirm the import never modifies the owner-supplied original.
  assert.equal(
    createHash('sha256')
      .update(await fs.readFile(path.join(source, matches[0])))
      .digest('hex'),
    digest,
  );
  media[id] = {
    image: variants.at(-1).url,
    imageAlt: `Illustration: ${description ?? matches[0].replace(/-\d+\.png$/i, '').replaceAll('_', ':')}.`,
    imageSrcSet: variants.map((variant) => `${variant.url} ${variant.width}w`).join(', '),
    imageWidth: metadata.width,
    imageHeight: metadata.height,
  };
  audit.push({
    id,
    sourceFilename: matches[0],
    sourceDirectory: path.resolve(source),
    sourceSha256: digest,
    originalBytes: original.length,
    width: metadata.width,
    height: metadata.height,
    variants,
  });
  if (audit.length % 10 === 0)
    console.log(`Prepared and pixel-verified ${audit.length}/${assignments.length} covers`);
}

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
const sum = (field) => audit.reduce((total, item) => total + field(item), 0);
const summary = {
  articles: audit.length,
  responsiveFiles: audit.length * widths.length,
  widths,
  originalBytes: sum((item) => item.originalBytes),
  masterBytes: sum((item) => item.variants.at(-1).bytes),
  card768Bytes: sum((item) => item.variants[1].bytes),
  pixelComparisonsPassed: audit.length * widths.length,
  originalFilesUnchanged: true,
};
await fs.writeFile(
  path.join(root, 'artifacts', artifactDirectory, 'optimization-summary.json'),
  `${JSON.stringify(summary, null, 2)}\n`,
);
console.log(JSON.stringify(summary));
