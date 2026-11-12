import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, mkdir, writeFile, readFile, stat, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { sha256, scanFiles, createBundle, validateManifest, safePath } from '../scripts/deploy/files.mjs';
import { ingestBundle, materialize } from '../scripts/deploy/receiver.mjs';

const release = 'a'.repeat(40) + '-test';
async function fixture(run) {
  const parent = path.resolve(tmpdir());
  const root = await mkdtemp(path.join(parent, 'aliyas-deployment-test-'));
  try { await run(root); }
  finally {
    assert.equal(path.dirname(path.resolve(root)), parent);
    assert.ok(path.basename(root).startsWith('aliyas-deployment-test-'));
    await rm(root, { recursive: true, force: true });
  }
}

test('deployment paths cannot escape into mail or private data', () => {
  for (const name of ['../mail/test', '/home/mail', 'a/../../etc', 'a\\..\\etc', 'a\r\nb', 'a//b', 'C:/mail']) assert.throws(() => safePath(name));
  assert.equal(safePath('images/project/photo.webp'), 'images/project/photo.webp');
  assert.throws(() => validateManifest({ version: 1, release, files: [{ scope: 'runtime', path: '.env.production', hash: 'a'.repeat(64), bytes: 1, mode: 0o644 }] }));
});

test('LFS pointers describe real image bytes without downloading unchanged assets', async () => fixture(async root => {
  const hash = 'b'.repeat(64);
  await writeFile(path.join(root, 'image.webp'), `version https://git-lfs.github.com/spec/v1\noid sha256:${hash}\nsize 4000000\n`);
  const [file] = await scanFiles(root, 'public');
  assert.equal(file.hash, hash); assert.equal(file.bytes, 4_000_000); assert.equal(file.pointer, true);
}));

test('binary bundles preserve images and empty files; truncated or corrupt objects never become verified', async () => fixture(async root => {
  const source = path.join(root, 'source'), objects = path.join(root, 'objects');
  await mkdir(source); await mkdir(objects);
  await writeFile(path.join(source, 'photo.webp'), Buffer.from([0, 255, 1, 10, 13, 99]));
  await writeFile(path.join(source, 'empty.txt'), '');
  const files = await scanFiles(source, 'public');
  const bundle = path.join(root, 'test.bundle');
  await createBundle(bundle, files);
  const index = {};
  assert.equal(await ingestBundle(bundle, objects, index), 2);
  for (const file of files) {
    assert.equal(index[file.hash], file.bytes);
    assert.equal(await sha256(path.join(objects, file.hash.slice(0, 2), file.hash)), file.hash);
  }
  const bytes = await readFile(bundle);
  await writeFile(path.join(root, 'truncated.bundle'), bytes.subarray(0, bytes.length - 1));
  await assert.rejects(() => ingestBundle(path.join(root, 'truncated.bundle'), objects, {}), /Truncated/);
  bytes[bytes.length - 1] ^= 1;
  await writeFile(path.join(root, 'corrupt.bundle'), bytes);
  await assert.rejects(() => ingestBundle(path.join(root, 'corrupt.bundle'), objects, {}), /checksum/);
}));

test('new releases reuse immutable asset inodes while runtime changes stay isolated', async () => fixture(async root => {
  const source = path.join(root, 'source'), objects = path.join(root, 'objects');
  await mkdir(path.join(source, '.next'), { recursive: true }); await mkdir(objects);
  await writeFile(path.join(source, 'server.js'), 'server-original');
  await writeFile(path.join(source, '.next/BUILD_ID'), 'test-build');
  const runtime = await scanFiles(source, 'runtime');
  const asset = { ...runtime[0], scope: 'public', path: 'images/test.webp', mode: 0o644 };
  const files = [...runtime, asset];
  const bundle = path.join(root, 'objects.bundle');
  await createBundle(bundle, [...new Map(files.map(f => [f.hash, f])).values()]);
  const index = {}; await ingestBundle(bundle, objects, index);
  const config = { objects, releases: path.join(root, 'releases') };
  const manifest = { version: 1, release, files: files.map(({ local, pointer, ...f }) => f) };
  const first = await materialize(manifest, config, index);
  const second = await materialize({ ...manifest, release: 'b'.repeat(40) + '-test' }, config, index);
  await writeFile(path.join(first, 'server.js'), 'runtime-mutated');
  assert.equal(await readFile(path.join(second, 'server.js'), 'utf8'), 'server-original');
  assert.equal((await stat(path.join(first, 'public/images/test.webp'))).ino, (await stat(path.join(second, 'public/images/test.webp'))).ino);
  assert.equal(await sha256(path.join(objects, runtime.find(f => f.path === 'server.js').hash.slice(0, 2), runtime.find(f => f.path === 'server.js').hash)), runtime.find(f => f.path === 'server.js').hash);
}));

test('missing cached objects cannot publish a partial release', async () => fixture(async root => {
  const file = { scope: 'runtime', path: 'server.js', hash: 'a'.repeat(64), bytes: 1, mode: 0o644 };
  const manifest = { version: 1, release, files: [file, { ...file, path: '.next/BUILD_ID' }] };
  await assert.rejects(() => materialize(manifest, { objects: root, releases: path.join(root, 'releases') }, {}), /Object not verified/);
  await assert.rejects(() => stat(path.join(root, 'releases', release, '.aliyas-complete.json')));
}));
