import fs from 'node:fs/promises';
import path from 'node:path';
import { createHash } from 'node:crypto';
import sharp from 'sharp';

// Run from the repository root. This audit reads existing assets; it never fetches
// sources, changes a selection, or rewrites an image.
const args = process.argv.slice(2);
let outputPath = 'artifacts/project-card-uniqueness/audit.json';
let perceptual = true;
for (let index = 0; index < args.length; index++) {
  if (args[index] === '--no-perceptual') perceptual = false;
  else if (args[index] === '--output' && args[index + 1]) outputPath = args[++index];
  else {
    console.error(
      'Usage: node scripts/audit-project-card-images.mjs [--output path.json] [--no-perceptual]',
    );
    process.exit(2);
  }
}

const algorithmVersion = `project-card-images-v1:sharp-${sharp.versions.sharp}:vips-${sharp.versions.vips}`;
const cachePath = 'artifacts/project-card-uniqueness/audit-fingerprints.json';
const mediaDirectory = 'src/data/project-media';
const selectionDirectory = 'docs/project-page-enhancement-selections';
// These two reviewed projects predate the standard persisted selection format.
// Their owned source manifests remain authoritative; no other missing selection is allowed.
const legacySelections = new Map([
  [
    'emaar/avelia',
    {
      id: 'emaar-project-49',
      reason: 'Avelia is the approved original pilot and predates rollout selection files.',
    },
  ],
  [
    'emaar/valia',
    {
      id: 'emaar-project-01',
      reason:
        'Valia is the first reviewed Emaar rollout, before persisted selection files; see docs/project-page-enhancements/emaar/valia.md.',
    },
  ],
]);
const errors = [];
const exceptions = [];
const records = [];
const cosine = Array.from({ length: 8 }, (_, frequency) =>
  Array.from({ length: 32 }, (_, value) => Math.cos(((2 * value + 1) * frequency * Math.PI) / 64)),
);
const bitCounts = Array.from(
  { length: 16 },
  (_, value) => value.toString(2).replaceAll('0', '').length,
);

const digest = (bytes) => createHash('sha256').update(bytes).digest('hex');
const readJson = async (file) => JSON.parse(await fs.readFile(file, 'utf8'));
const problem = (file, code, message) => errors.push({ file, code, message });
const identity = (record) => ({
  id: record.id,
  owner: record.owner,
  slug: record.slug,
  src: record.src,
});

function isSourceUrl(value) {
  try {
    const url = new URL(value);
    return url.protocol === 'https:' && !!url.hostname;
  } catch {
    return false;
  }
}

function bitsToHex(bits) {
  let hex = '';
  for (let index = 0; index < bits.length; index += 4)
    hex += parseInt(bits.slice(index, index + 4).join(''), 2).toString(16);
  return hex;
}

function perceptualHash(data) {
  const rows = Array.from({ length: 32 }, () => Array(8).fill(0));
  for (let y = 0; y < 32; y++)
    for (let frequency = 0; frequency < 8; frequency++)
      for (let x = 0; x < 32; x++) rows[y][frequency] += data[y * 32 + x] * cosine[frequency][x];
  const values = [];
  for (let vertical = 0; vertical < 8; vertical++)
    for (let horizontal = 0; horizontal < 8; horizontal++) {
      let value = 0;
      for (let y = 0; y < 32; y++) value += rows[y][horizontal] * cosine[vertical][y];
      values.push(value);
    }
  // Exclude the DC coefficient (overall brightness) from the median and hash.
  const median = [...values.slice(1)].sort((a, b) => a - b)[31];
  return bitsToHex(values.map((value, index) => (index > 0 && value > median ? 1 : 0)));
}

function differenceHash(data) {
  const bits = [];
  for (let y = 0; y < 16; y++)
    for (let x = 0; x < 16; x++) bits.push(data[y * 17 + x] > data[y * 17 + x + 1] ? 1 : 0);
  return bitsToHex(bits);
}

async function fingerprint(bytes) {
  const image = sharp(bytes).rotate().toColourspace('srgb').removeAlpha();
  const pixels = await image.clone().resize(128, 96, { fit: 'fill' }).raw().toBuffer();
  const result = { pixel: digest(pixels) };
  for (const [mode, fit] of [
    ['full', 'fill'],
    ['crop', 'cover'],
  ]) {
    const [p, d, rgb] = await Promise.all([
      image.clone().resize(32, 32, { fit }).greyscale().raw().toBuffer(),
      image.clone().resize(17, 16, { fit }).greyscale().raw().toBuffer(),
      image.clone().resize(16, 16, { fit }).raw().toBuffer(),
    ]);
    result[mode] = {
      p: perceptualHash(p),
      d: differenceHash(d),
      rgb: rgb.toString('base64'),
    };
  }
  return result;
}

function validFingerprint(value) {
  return (
    /^[a-f0-9]{64}$/.test(value?.pixel ?? '') &&
    ['full', 'crop'].every(
      (mode) =>
        /^[a-f0-9]{16}$/.test(value?.[mode]?.p ?? '') &&
        /^[a-f0-9]{64}$/.test(value?.[mode]?.d ?? '') &&
        typeof value?.[mode]?.rgb === 'string' &&
        Buffer.from(value[mode].rgb, 'base64').length === 16 * 16 * 3,
    )
  );
}

function hashDistance(a, b) {
  let total = 0;
  for (let index = 0; index < a.length; index++)
    total += bitCounts[parseInt(a[index], 16) ^ parseInt(b[index], 16)];
  return total;
}

function meanDifference(a, b) {
  let total = 0;
  for (let index = 0; index < a.length; index++) total += Math.abs(a[index] - b[index]);
  return total / a.length;
}

function duplicateGroups(items, key, include = () => true) {
  const groups = new Map();
  for (const item of items) {
    const hash = key(item);
    if (!hash) continue;
    const group = groups.get(hash) ?? [];
    group.push(item);
    groups.set(hash, group);
  }
  return [...groups]
    .filter(([, group]) => group.length > 1 && include(group))
    .map(([hash, group]) => ({ hash, projects: group.map(identity) }));
}

async function main() {
  const queuePath = 'docs/project-page-enhancement-queue.json';
  const queue = await readJson(queuePath);
  const protectedProjects = new Map(queue.projects.map((project) => [project.id, project]));
  if (queue.projects.length !== 575 || protectedProjects.size !== 575)
    problem(queuePath, 'protected-project-count', 'Expected 575 distinct protected project IDs.');

  const files = (await fs.readdir(mediaDirectory, { recursive: true }))
    .filter((file) => file.endsWith('.json'))
    .map((file) => file.replaceAll('\\', '/'))
    .sort();
  const seen = new Set();
  const pending = [];
  for (const relative of files) {
    const file = `${mediaDirectory}/${relative}`;
    let media;
    try {
      media = await readJson(file);
    } catch (error) {
      problem(file, 'invalid-manifest', error.message);
      continue;
    }
    const project = protectedProjects.get(media.projectId);
    if (
      !project ||
      project.slug !== media.projectSlug ||
      project.developerSlug !== media.developerSlug ||
      relative !== `${media.developerSlug}/${media.projectSlug}.json` ||
      seen.has(media.projectId)
    ) {
      problem(
        file,
        'project-ownership',
        'Manifest identity/path does not match one protected owner.',
      );
      continue;
    }
    seen.add(media.projectId);
    if (!isSourceUrl(media.source?.url))
      problem(file, 'project-source', 'A valid HTTPS project source URL is required.');
    const selected = Array.isArray(media.images)
      ? media.images.filter((image) => image.src === media.cardImage)
      : [];
    if (selected.length !== 1) {
      problem(file, 'card-selection', 'cardImage must identify exactly one owned gallery image.');
      continue;
    }
    const card = selected[0];
    const ownedPrefix = `/images/projects/${media.developerSlug}/${media.projectSlug}/`;
    if (
      typeof card.src !== 'string' ||
      !card.src.startsWith(ownedPrefix) ||
      card.src.includes('\\') ||
      path.posix.normalize(card.src) !== card.src
    ) {
      problem(file, 'card-ownership', 'Card asset must be inside its own project asset directory.');
      continue;
    }
    if (!/^[a-f0-9]{64}$/.test(card.sha256 ?? ''))
      problem(file, 'card-hash', 'Card metadata must contain a lowercase SHA-256 digest.');
    if (!Number.isSafeInteger(card.originalBytes) || card.originalBytes <= 0)
      problem(file, 'card-bytes', 'Card metadata must contain a positive originalBytes count.');
    if (!isSourceUrl(card.sourceUrl))
      problem(file, 'card-source', 'Card image must retain a valid HTTPS source URL.');

    const selectionPath = `${selectionDirectory}/${media.developerSlug}/${media.projectSlug}.json`;
    try {
      const selection = await readJson(selectionPath);
      const source = selection.images?.find((image) => image.name === selection.cardName);
      const expectedStem = `${selection.cardName}-${String(card.sha256).slice(0, 12)}`;
      if (
        selection.id !== media.projectId ||
        selection.slug !== media.projectSlug ||
        selection.developerSlug !== media.developerSlug ||
        !source ||
        path.posix.parse(card.src).name !== expectedStem ||
        source.url !== card.sourceUrl
      )
        problem(
          selectionPath,
          'selection-sync',
          'cardName, owner, name-hash12 asset basename and source URL must match the media card.',
        );
    } catch (error) {
      const legacy = legacySelections.get(`${media.developerSlug}/${media.projectSlug}`);
      if (error.code === 'ENOENT' && legacy?.id === media.projectId)
        exceptions.push({
          file: selectionPath,
          reason: legacy.reason,
        });
      else problem(selectionPath, 'selection-file', error.message);
    }
    pending.push({
      id: media.projectId,
      owner: media.developerSlug,
      slug: media.projectSlug,
      file,
      src: card.src,
      sourceUrl: card.sourceUrl,
      expectedSha256: card.sha256,
      expectedBytes: card.originalBytes,
    });
  }
  for (const project of protectedProjects.values())
    if (!seen.has(project.id))
      problem(mediaDirectory, 'missing-project', `Missing media manifest for ${project.id}.`);

  let cache = {};
  if (perceptual) {
    try {
      const saved = await readJson(cachePath);
      if (
        saved.algorithmVersion === algorithmVersion &&
        saved.entries &&
        typeof saved.entries === 'object' &&
        !Array.isArray(saved.entries)
      )
        cache = saved.entries;
    } catch {
      // Missing or invalid optional cache is rebuilt from source bytes.
    }
  }
  let cursor = 0;
  let completed = 0;
  const inFlight = new Map();
  await Promise.all(
    Array.from({ length: 4 }, async () => {
      while (cursor < pending.length) {
        const record = pending[cursor++];
        try {
          // Always read and hash the current file, even when its fingerprint is cached.
          const bytes = await fs.readFile(`public${record.src}`);
          record.sha256 = digest(bytes);
          record.bytes = bytes.length;
          if (record.sha256 !== record.expectedSha256)
            problem(
              record.file,
              'asset-hash-mismatch',
              `Current file SHA-256 differs: ${record.src}`,
            );
          if (record.bytes !== record.expectedBytes)
            problem(
              record.file,
              'asset-size-mismatch',
              `Current file byte count differs: ${record.src}`,
            );
          records.push(record);
          if (perceptual && !validFingerprint(cache[record.sha256])) {
            if (!inFlight.has(record.sha256)) inFlight.set(record.sha256, fingerprint(bytes));
            cache[record.sha256] = await inFlight.get(record.sha256);
          }
        } catch (error) {
          problem(record.file, 'asset-read-or-decode', `${record.src}: ${error.message}`);
        }
        completed++;
        if (completed % 100 === 0)
          console.log(`Checked ${completed}/${pending.length} card assets`);
      }
    }),
  );
  records.sort((a, b) => a.file.localeCompare(b.file));
  const exactDuplicates = duplicateGroups(records, (record) => record.sha256);
  let normalizedPixelDuplicates = [];
  const nearMatches = [];
  if (perceptual) {
    const comparable = records.filter((record) => validFingerprint(cache[record.sha256]));
    normalizedPixelDuplicates = duplicateGroups(
      comparable,
      (record) => cache[record.sha256].pixel,
      (group) => new Set(group.map((record) => record.sha256)).size > 1,
    );
    const rgb = new Map(
      comparable.map((record) => [
        record.sha256,
        Object.fromEntries(
          ['full', 'crop'].map((mode) => [
            mode,
            Buffer.from(cache[record.sha256][mode].rgb, 'base64'),
          ]),
        ),
      ]),
    );
    for (let first = 0; first < comparable.length; first++)
      for (let second = first + 1; second < comparable.length; second++) {
        const a = comparable[first];
        const b = comparable[second];
        if (a.sha256 === b.sha256) continue;
        const af = cache[a.sha256];
        const bf = cache[b.sha256];
        const modes = ['full', 'crop'].map((mode) => ({
          mode,
          p: hashDistance(af[mode].p, bf[mode].p),
          d: hashDistance(af[mode].d, bf[mode].d),
          mad: meanDifference(rgb.get(a.sha256)[mode], rgb.get(b.sha256)[mode]),
        }));
        const samePixels = af.pixel === bf.pixel;
        if (
          samePixels ||
          modes.some(({ p, d, mad }) => (p <= 12 && d <= 48) || (p <= 8 && mad < 20))
        )
          nearMatches.push({ a: identity(a), b: identity(b), samePixels, modes });
      }
    nearMatches.sort(
      (a, b) =>
        Math.min(...a.modes.map(({ p, d }) => p + d / 4)) -
        Math.min(...b.modes.map(({ p, d }) => p + d / 4)),
    );
    await fs.mkdir(path.dirname(cachePath), { recursive: true });
    await fs.writeFile(cachePath, JSON.stringify({ algorithmVersion, entries: cache }) + '\n');
  }

  const summary = {
    protectedProjects: protectedProjects.size,
    mediaManifests: files.length,
    checkedCardFiles: records.length,
    uniqueByteImages: new Set(records.map((record) => record.sha256)).size,
    invalidChecks: errors.length,
    exactDuplicateGroups: exactDuplicates.length,
    normalizedPixelDuplicateGroups: perceptual ? normalizedPixelDuplicates.length : null,
    nearMatchPairs: perceptual ? nearMatches.length : null,
    perceptualPerformed: perceptual,
    selectionExceptions: exceptions.length,
    passed: errors.length === 0 && exactDuplicates.length === 0,
  };
  const report = {
    generatedAt: new Date().toISOString(),
    algorithmVersion,
    summary,
    reviewPolicy:
      'Invalid checks and byte-exact duplicate cards fail. Normalized-pixel duplicates and perceptual near matches require human review; similarity alone does not prove incorrect imagery.',
    thresholds: {
      phashAndDhash: { pMax: 12, dMax: 48 },
      phashAndColour: { pMax: 8, madBelow: 20 },
    },
    errors,
    exceptions,
    exactDuplicates,
    normalizedPixelDuplicates,
    nearMatches,
    records,
  };
  await fs.mkdir(path.dirname(outputPath), { recursive: true });
  await fs.writeFile(outputPath, JSON.stringify(report, null, 2) + '\n');
  console.log(JSON.stringify({ ...summary, output: outputPath }, null, 2));
  process.exitCode = summary.passed ? 0 : 1;
}

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
