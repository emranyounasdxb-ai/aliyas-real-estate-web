import fs from 'node:fs/promises';
import path from 'node:path';
import { createHash } from 'node:crypto';
import sharp from 'sharp';

// A single, explicitly scoped approval sample. Original image bytes are preserved.
const selections = [
  ['community', '426917_hero_slide_0_1dbd1ea039_prod.jpg', 'The community', 'Emaar render of landscaped paths, trees and villas at Avelia', '50% 50%'],
  ['living', '426908_interior_0_52bdc8fdc5_prod.jpg', 'Living and dining', 'Emaar render of Avelia’s living and dining room opening towards a garden', '50% 50%'],
  ['pool', '426905_exterior_1_6dee242781_prod.jpg', 'Pool setting', 'Emaar render of Avelia’s pool and landscaped outdoor seating at dusk', '50% 55%'],
  ['bedroom', '426911_interior_1_bb86450a9f_prod.jpg', 'Bedroom and terrace', 'Emaar render of an Avelia bedroom with doors opening onto a terrace', '50% 50%'],
  ['family', '426914_interior_2_36dacd59a2_prod.jpg', 'Family living', 'Emaar render of a timber detailed Avelia family room facing a pool terrace', '50% 50%'],
  ['landscape', '426902_exterior_0_4fa8fcc839_prod.jpg', 'Landscape and villas', 'Emaar render of Avelia villas around landscaped paths and a basketball court', '50% 50%'],
];
const output = 'public/images/projects/emaar/avelia';
await fs.mkdir(output, { recursive: true });
await fs.mkdir('src/data/project-media/emaar', { recursive: true });
const images = [];
for (const [name, original, label, alt, position] of selections) {
  const sourceUrl = `https://www.emaar.com/cms-media/uploads/${original}`;
  const cached = path.join('artifacts/project-media-pilot', original);
  let bytes;
  try { bytes = await fs.readFile(cached); }
  catch {
    const response = await fetch(sourceUrl);
    if (!response.ok) throw new Error(`${sourceUrl}: ${response.status}`);
    bytes = Buffer.from(await response.arrayBuffer());
  }
  const sha256 = createHash('sha256').update(bytes).digest('hex');
  const filename = `${name}-${sha256.slice(0, 12)}.jpg`;
  await fs.writeFile(path.join(output, filename), bytes);
  const { width, height, format } = await sharp(bytes).metadata();
  if (format !== 'jpeg' || !width || !height) throw new Error(`Invalid original: ${original}`);
  const blur = await sharp(bytes).resize({ width: 20, withoutEnlargement: true }).webp({ quality: 45 }).toBuffer();
  images.push({ src: `/images/projects/emaar/avelia/${filename}`, label, alt, position,
    width, height, blurDataURL: `data:image/webp;base64,${blur.toString('base64')}`,
    sourceUrl, sha256, originalBytes: bytes.length });
}
await fs.writeFile('src/data/project-media/emaar/avelia.json', JSON.stringify({
  projectId: 'emaar-project-49', developerSlug: 'emaar', projectSlug: 'avelia',
  status: 'reviewed', kind: 'developer-render',
  source: { name: 'Emaar', url: 'https://www.emaar.com/en/properties/avelia-at-the-valley', checkedOn: '2026-11-03' },
  use: 'Approved local page pattern. Wider local rollout authorized; no public deployment requested.',
  cardImage: images[5].src,
  editorialImages: [images[1].src, images[3].src],
  images,
}, null, 2) + '\n', 'utf8');
console.log(`Prepared ${images.length} byte-identical Emaar originals; no resizing or upscaling of source masters.`);
