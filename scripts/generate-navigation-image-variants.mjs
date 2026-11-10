import { createHash } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

// These are copies of the credited, existing city photos used in the menu.
const sources = [
  '/images/destinations/dubai-city-photo.jpg',
  '/images/destinations/abu-dhabi-city-photo.jpg',
  '/images/destinations/ras-al-khaimah-city-photo.jpg',
  '/images/destinations/sharjah-city-photo.jpg',
  '/images/destinations/ajman-city-photo.jpg',
  '/images/destinations/fujairah.jpg',
  '/images/destinations/umm-al-quwain-mangroves-photo.jpg',
];
const output = 'public/images/navigation-responsive/v1';
await mkdir(output, { recursive: true });
const manifest = {};
for (const source of sources) {
  const input = await readFile(path.join('public', source.slice(1)));
  const digest = createHash('sha256').update(input).digest('hex').slice(0, 12);
  const metadata = await sharp(input).metadata();
  const originalWidth = [5, 6, 7, 8].includes(metadata.orientation)
    ? metadata.height
    : metadata.width;
  const widths = [...new Set([Math.min(640, originalWidth), Math.min(1280, originalWidth)])];
  const entries = [];
  for (const width of widths) {
    const filename = `${digest}-${width}.webp`;
    const image = await sharp(input)
      .rotate()
      .resize({ width, withoutEnlargement: true })
      .webp({ quality: 82, effort: 2 })
      .toBuffer();
    await writeFile(path.join(output, filename), image);
    entries.push(`/images/navigation-responsive/v1/${filename} ${width}w`);
  }
  manifest[source] = entries.join(', ');
}
await writeFile(
  'src/data/navigation-image-variants.json',
  `${JSON.stringify(manifest, null, 2)}\n`,
);
console.log(`Prepared ${sources.length} navigation photos.`);
