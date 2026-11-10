import { createHash } from 'node:crypto';
import { mkdir, readFile, readdir, rename, writeFile } from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

// The reviewed originals remain unchanged. These content-addressed display copies
// are used only when the corresponding source hash has been verified.
const root = process.cwd();
const originalsRoot = path.resolve(root, 'public/images/projects');
const sampleArg = process.argv.find((argument) => argument.startsWith('--sample='));
const sampleSize = sampleArg ? Number(sampleArg.slice('--sample='.length)) : 0;
if (sampleArg && (!Number.isInteger(sampleSize) || sampleSize < 1))
  throw new Error('Invalid sample size');
const outputDir = path.resolve(
  root,
  sampleSize ? 'artifacts/image-speed/sample-e2' : 'public/images/project-responsive/v1',
);
const manifestFile = path.resolve(
  root,
  sampleSize
    ? 'artifacts/image-speed/sample-manifest.json'
    : 'src/data/project-image-variants.json',
);
const concurrency = 12;
sharp.concurrency(1);
sharp.cache({ memory: 64, files: 20, items: 100 });

async function walk(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  return (
    await Promise.all(
      entries.map((entry) =>
        entry.isDirectory()
          ? walk(path.join(directory, entry.name))
          : [path.join(directory, entry.name)],
      ),
    )
  ).flat();
}
const manifestPaths = (await walk(path.join(root, 'src/data/project-media'))).filter((file) =>
  file.endsWith('.json'),
);
const records = await Promise.all(
  manifestPaths.map(async (file) => JSON.parse(await readFile(file, 'utf8'))),
);
const unique = new Map();
const priority = new Set(
  records.flatMap((record) => [
    record.cardImage,
    ...record.images.slice(0, 3).map((image) => image.src),
  ]),
);
const prefixes = new Map();
for (const record of records) {
  for (const image of record.images) {
    const match = /^\/images\/projects\/.+-([a-f0-9]{12})\.(?:jpg|jpeg|png|webp|avif)$/i.exec(
      image.src,
    );
    if (!match || !image.sha256?.startsWith(match[1]) || !Number.isInteger(image.width))
      throw new Error(`Invalid project image metadata: ${image.src}`);
    if (prefixes.has(match[1]) && prefixes.get(match[1]) !== image.sha256)
      throw new Error(`Image hash prefix collision: ${image.src}`);
    prefixes.set(match[1], image.sha256);
    const group = unique.get(image.sha256);
    if (group) group.aliases.set(image.src, image);
    else unique.set(image.sha256, { image, aliases: new Map([[image.src, image]]) });
  }
}
let images = [...unique.values()].sort((a, b) => {
  if (!sampleSize) {
    const aPriority = [...a.aliases.keys()].some((source) => priority.has(source));
    const bPriority = [...b.aliases.keys()].some((source) => priority.has(source));
    if (aPriority !== bPriority) return aPriority ? -1 : 1;
  }
  return a.image.originalBytes - b.image.originalBytes;
});
if (sampleSize && sampleSize < images.length)
  images = Array.from(
    { length: sampleSize },
    (_, i) => images[Math.floor((i * (images.length - 1)) / Math.max(1, sampleSize - 1))],
  );
await mkdir(outputDir, { recursive: true });
await mkdir(path.dirname(manifestFile), { recursive: true });
const result = {};
const failures = [];
let cursor = 0;
let completed = 0;
let totalBytes = 0;
const started = Date.now();

async function produce(group) {
  const image = group.image;
  let input;
  let digest;
  for (const alias of group.aliases.values()) {
    const sourceFile = path.resolve(root, 'public', `.${alias.src}`);
    if (!sourceFile.startsWith(`${originalsRoot}${path.sep}`))
      throw new Error(`Image outside projects directory: ${alias.src}`);
    const bytes = await readFile(sourceFile);
    const aliasDigest = createHash('sha256').update(bytes).digest('hex');
    if (aliasDigest !== alias.sha256) throw new Error(`Source hash mismatch: ${alias.src}`);
    if (!input) {
      input = bytes;
      digest = aliasDigest;
    }
  }
  if (!input || !digest) throw new Error(`Missing project image: ${image.src}`);
  const metadata = await sharp(input).metadata();
  const rotated = [5, 6, 7, 8].includes(metadata.orientation);
  const actualWidth = rotated ? metadata.height : metadata.width;
  if (!actualWidth) throw new Error(`Missing image dimensions: ${image.src}`);
  const widths = [...new Set([Math.min(640, actualWidth), Math.min(1600, actualWidth)])];
  for (const width of widths) {
    const target = path.join(outputDir, `${digest.slice(0, 12)}-${width}.webp`);
    let size;
    try {
      const existing = await sharp(target).metadata();
      if (existing.format !== 'webp' || existing.width !== width)
        throw new Error('Invalid existing variant');
      size = (await readFile(target)).length;
    } catch {
      const { data, info } = await sharp(input)
        .rotate()
        .resize({ width, withoutEnlargement: true })
        .webp({ quality: 82, effort: 2 })
        .toBuffer({ resolveWithObject: true });
      if (info.width !== width) throw new Error(`Unexpected output width: ${image.src}`);
      const temporary = `${target}.${process.pid}.tmp`;
      await writeFile(temporary, data);
      await rename(temporary, target);
      size = data.length;
    }
    totalBytes += size;
  }
  result[digest.slice(0, 12)] = actualWidth;
}

async function worker() {
  while (cursor < images.length) {
    const group = images[cursor++];
    try {
      await produce(group);
    } catch (error) {
      failures.push({ src: group.image.src, error: String(error) });
    }
    completed += 1;
    if (completed % 100 === 0 || completed === images.length)
      console.log(
        JSON.stringify({
          completed,
          total: images.length,
          failures: failures.length,
          elapsedSeconds: Math.round((Date.now() - started) / 1000),
          outputMB: Math.round(totalBytes / 1e6),
        }),
      );
  }
}
await Promise.all(Array.from({ length: concurrency }, worker));
if (failures.length) {
  const failureFile = path.resolve(root, 'artifacts/image-speed/variant-failures.json');
  await mkdir(path.dirname(failureFile), { recursive: true });
  await writeFile(failureFile, JSON.stringify(failures, null, 2));
  throw new Error(`${failures.length} images could not be prepared; see ${failureFile}`);
}
const ordered = Object.fromEntries(Object.entries(result).sort(([a], [b]) => a.localeCompare(b)));
const temporaryManifest = `${manifestFile}.${process.pid}.tmp`;
await writeFile(temporaryManifest, `${JSON.stringify(ordered)}\n`);
await rename(temporaryManifest, manifestFile);
console.log(
  JSON.stringify({
    images: images.length,
    seconds: (Date.now() - started) / 1000,
    totalBytes,
    manifestFile,
  }),
);
