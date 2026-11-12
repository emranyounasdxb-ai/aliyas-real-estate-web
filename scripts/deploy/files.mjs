import { createReadStream } from 'node:fs';
import { open, readdir, lstat, readFile, mkdir, rename, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import path from 'node:path';

export const HASH = /^[a-f0-9]{64}$/;
export const RELEASE = /^[a-f0-9]{40}-[a-z0-9-]{1,60}$/;
export function safePath(name) {
  if (typeof name !== 'string' || !name || name.length > 1000 || /[\\\x00-\x1f\x7f:]/.test(name) || name.startsWith('/'))
    throw new Error('Invalid deployment path');
  if (name.split('/').some(p => !p || p === '.' || p === '..')) throw new Error('Unsafe deployment path');
  return name;
}
export function inside(root, name) {
  safePath(name);
  const target = path.resolve(root, name);
  if (!target.startsWith(path.resolve(root) + path.sep)) throw new Error('Path leaves deployment root');
  return target;
}
export async function sha256(filename) {
  const hash = createHash('sha256');
  for await (const chunk of createReadStream(filename)) hash.update(chunk);
  return hash.digest('hex');
}
export async function atomicJson(filename, data) {
  await mkdir(path.dirname(filename), { recursive: true });
  await writeFile(`${filename}.partial`, JSON.stringify(data) + '\n', { mode: 0o600 });
  await rename(`${filename}.partial`, filename);
}
export async function jsonOr(filename, fallback) {
  try { return JSON.parse(await readFile(filename, 'utf8')); }
  catch (error) { if (error.code === 'ENOENT') return fallback; throw error; }
}
export function validateManifest(manifest) {
  if (manifest?.version !== 1 || !RELEASE.test(manifest.release) || !Array.isArray(manifest.files) || manifest.files.length > 150_000)
    throw new Error('Invalid release manifest');
  const paths = new Set(), objects = new Map();
  for (const file of manifest.files) {
    safePath(file.path);
    if (!['runtime', 'public'].includes(file.scope) || !HASH.test(file.hash) || !Number.isSafeInteger(file.bytes) || file.bytes < 0 || file.bytes > 4 * 1024 ** 3 || ![0o644, 0o755].includes(file.mode))
      throw new Error('Invalid release file');
    if (file.path.split('/').some(p => p.startsWith('.env') || p === '.data') || (file.scope === 'runtime' && file.path.startsWith('public/')))
      throw new Error('Private or misplaced file in release');
    const key = `${file.scope}/${file.path}`;
    if (paths.has(key)) throw new Error('Duplicate release path');
    paths.add(key);
    if (objects.has(file.hash) && objects.get(file.hash) !== file.bytes) throw new Error('Conflicting object size');
    objects.set(file.hash, file.bytes);
  }
  return manifest;
}
export async function scanFiles(root, scope) {
  const output = [];
  async function scan(folder, prefix = '') {
    for (const entry of (await readdir(folder, { withFileTypes: true })).sort((a,b) => a.name.localeCompare(b.name))) {
      const relative = prefix + entry.name;
      if (relative === '.next/cache' || entry.name.startsWith('.env') || entry.name === '.DS_Store') continue;
      const absolute = path.join(folder, entry.name);
      const stats = await lstat(absolute);
      if (stats.isSymbolicLink()) throw new Error(`Flatten build symlinks before packaging: ${relative}`);
      if (stats.isDirectory()) { await scan(absolute, relative + '/'); continue; }
      if (!stats.isFile()) throw new Error(`Not a regular deployment file: ${relative}`);
      let hash, bytes = stats.size, pointer = false;
      if (scope === 'public' && bytes < 1024) {
        const text = await readFile(absolute, 'utf8');
        const match = /^version https:\/\/git-lfs.github.com\/spec\/v1\r?\noid sha256:([a-f0-9]{64})\r?\nsize (\d+)\r?\n?$/.exec(text);
        if (match) { hash = match[1]; bytes = Number(match[2]); pointer = true; }
      }
      hash ??= await sha256(absolute);
      output.push({ scope, path: safePath(relative), hash, bytes, mode: (stats.mode & 0o111) && scope === 'runtime' ? 0o755 : 0o644, local: absolute, pointer });
    }
  }
  await scan(root);
  return output;
}

// A bounded JSON header followed by exactly `bytes` raw bytes per object.
// Object names are hashes; there are no archive paths, symlinks or executable metadata.
export async function createBundle(filename, files) {
  const handle = await open(filename, 'wx', 0o600);
  try {
    for (const file of files) {
      if (!HASH.test(file.hash)) throw new Error('Invalid object hash');
      await handle.writeFile(JSON.stringify({ hash: file.hash, bytes: file.bytes }) + '\n');
      let size = 0;
      const hash = createHash('sha256');
      for await (const chunk of createReadStream(file.local)) {
        await handle.writeFile(chunk);
        size += chunk.length;
        hash.update(chunk);
      }
      if (size !== file.bytes || hash.digest('hex') !== file.hash) throw new Error(`Source changed while packaging: ${file.path}`);
    }
  } finally { await handle.close(); }
}
