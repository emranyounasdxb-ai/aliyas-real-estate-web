import { mkdir, mkdtemp, rm, stat, readFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { randomUUID } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { connectFtp, readRemoteJson, writeRemoteJson } from './ftp.mjs';
import { scanFiles, createBundle, sha256, validateManifest, HASH } from './files.mjs';

const command = process.argv[2];
if (!['seed-public', 'release', 'status'].includes(command)) throw new Error('Use seed-public, release or status');
let client;
let temporary;
try {
  if (command === 'status') {
    client = await connectFtp();
    const objects = await readRemoteJson(client, '/state/objects.json', { optional: true }) || {};
    const success = await readRemoteJson(client, '/state/success.json', { optional: true });
    console.log(JSON.stringify({ cachedObjects: Object.keys(objects).length, successfulRelease: success?.release || null }));
  } else {
    // Hashing an initial local asset library can outlast the FTP idle timeout.
    // Connect afterwards, and read the newest verified inventory before transfer.
    const files = await scanFiles(path.resolve('public'), 'public');
    if (command === 'release') files.push(...await scanFiles(path.resolve(process.env.CPANEL_RUNTIME_DIR || 'artifacts/cpanel-runtime'), 'runtime'));
    client = await connectFtp();
    for (const directory of ['/inbox', '/requests', '/receipts', '/state']) await client.ensureDir(directory);
    await client.cd('/');
    const existing = await readRemoteJson(client, '/state/objects.json', { optional: true }) || {};
    for (const [hash, bytes] of Object.entries(existing)) if (!HASH.test(hash) || !Number.isSafeInteger(bytes) || bytes < 0) throw new Error('Invalid server object index');
    const previous = await readRemoteJson(client, '/state/success.json', { optional: true });
    if (previous) validateManifest(previous);
    const unique = [...new Map(files.map(f => [f.hash, f])).values()];
    const missing = unique.filter(f => existing[f.hash] !== f.bytes);
    const pointerFiles = missing.filter(f => f.pointer);
    // Hydrate only LFS assets absent from the verified server cache.
    for (let offset = 0; offset < pointerFiles.length; offset += 100) {
      const names = pointerFiles.slice(offset, offset + 100).map(f => path.relative(process.cwd(), f.local).replaceAll('\\', '/'));
      if (names.some(n => /[,\r\n*?\[\]]/.test(n))) throw new Error('LFS path requires explicit review');
      execFileSync('git', ['lfs', 'fetch', '--include=' + names.join(','), '--exclude=', 'origin', 'HEAD'], { stdio: 'inherit' });
      execFileSync('git', ['lfs', 'checkout', '--', ...names], { stdio: 'inherit' });
    }
    const previousPaths = new Map((previous?.files || []).map(f => [`${f.scope}/${f.path}`, f.hash]));
    const changedPaths = files.filter(f => previousPaths.get(`${f.scope}/${f.path}`) !== f.hash).length;
    console.log(JSON.stringify({ files: files.length, changedPaths, newObjects: missing.length, uploadBytes: missing.reduce((n,f) => n + f.bytes, 0) }));
    temporary = await mkdtemp(path.join(process.env.CPANEL_BUNDLE_TEMP || tmpdir(), 'aliyas-bundles-'));
    const batches = [];
    let batch = [], bytes = 0;
    for (const file of missing) {
      if (bytes && bytes + file.bytes > 128 * 1024 ** 2) { batches.push(batch); batch = []; bytes = 0; }
      batch.push(file); bytes += file.bytes;
    }
    if (batch.length) batches.push(batch);
    let uploaded = 0;
    const pendingReceipts = [];
    for (let i = 0; i < batches.length; i++) {
      const id = randomUUID(), bundle = path.join(temporary, `${id}.bundle`);
      await createBundle(bundle, batches[i]);
      const size = (await stat(bundle)).size, hash = await sha256(bundle);
      let last = 0;
      client.trackProgress(progress => {
        if (Date.now() - last >= 15_000) { last = Date.now(); console.log(JSON.stringify({ bundle: i + 1, bundles: batches.length, transferred: uploaded + progress.bytes })); }
      });
      await client.uploadFrom(bundle, `/inbox/${id}.partial`);
      await client.rename(`/inbox/${id}.partial`, `/inbox/${id}.bundle`);
      await writeRemoteJson(client, `/inbox/${id}.json`, { hash, bytes: size });
      client.trackProgress();
      pendingReceipts.push(id);
      uploaded += size;
      await rm(bundle);
      console.log(JSON.stringify({ uploadedBundle: i + 1, bundles: batches.length, transferred: uploaded }));
    }
    for (const id of pendingReceipts) {
      const receipt = await waitReceipt(client, id, 15 * 60_000);
      if (receipt.status !== 'cached') throw new Error(`Object import failed: ${receipt.error || receipt.status}`);
    }
    if (command === 'release') {
      const revision = execFileSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8' }).trim();
      const builtRevision = (await readFile(path.join(process.env.CPANEL_RUNTIME_DIR || 'artifacts/cpanel-runtime', '.aliyas-revision'), 'utf8')).trim();
      if (builtRevision !== revision) throw new Error('Build revision does not match the checked-out assets');
      const suffix = process.env.GITHUB_RUN_ID ? `${process.env.GITHUB_RUN_ID}-${process.env.GITHUB_RUN_ATTEMPT || 1}` : `local-${Date.now()}`;
      const release = `${revision}-${suffix}`;
      const manifest = validateManifest({ version: 1, release, createdAt: new Date().toISOString(), files: files.map(({ local, pointer, ...f }) => f) });
      await writeRemoteJson(client, `/requests/${release}.json`, manifest);
      const receipt = await waitReceipt(client, release, 20 * 60_000);
      if (!['prepared', 'deployed'].includes(receipt.status)) throw new Error(`Release failed: ${receipt.error || receipt.status}`);
      if (process.env.GITHUB_ACTIONS === 'true' && receipt.status !== 'deployed') throw new Error('Production activation is not enabled');
      console.log(JSON.stringify(receipt));
    }
  }
} finally {
  client?.close();
  if (temporary) {
    const base = path.resolve(process.env.CPANEL_BUNDLE_TEMP || tmpdir());
    if (path.dirname(path.resolve(temporary)) !== base || !path.basename(temporary).startsWith('aliyas-bundles-')) throw new Error('Unsafe temporary cleanup target');
    await rm(temporary, { recursive: true, force: true });
  }
}

async function waitReceipt(client, id, timeout) {
  const deadline = Date.now() + timeout;
  let logged = 0;
  while (Date.now() < deadline) {
    const receipt = await readRemoteJson(client, `/receipts/${id}.json`, { optional: true });
    if (receipt) return receipt;
    if (Date.now() - logged > 30_000) { logged = Date.now(); console.log(JSON.stringify({ waitingForServer: id })); }
    await new Promise(resolve => setTimeout(resolve, 5000));
  }
  throw new Error('Server acknowledgement timed out; no successful deployment was recorded');
}
