import { open, mkdir, stat, lstat, readdir, unlink, rename, copyFile, link, chmod, symlink, readlink, readFile } from 'node:fs/promises';
import { createReadStream, createWriteStream } from 'node:fs';
import { createHash } from 'node:crypto';
import { pipeline } from 'node:stream/promises';
import { Transform } from 'node:stream';
import { spawn } from 'node:child_process';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { HASH, RELEASE, inside, sha256, atomicJson, jsonOr, validateManifest } from './files.mjs';

export async function ingestBundle(filename, objectRoot, index) {
  const size = (await stat(filename)).size;
  const handle = await open(filename, 'r');
  let offset = 0, count = 0;
  try {
    while (offset < size) {
      const header = Buffer.alloc(200);
      const { bytesRead } = await handle.read(header, 0, Math.min(200, size - offset), offset);
      const newline = header.subarray(0, bytesRead).indexOf(10);
      if (newline < 0) throw new Error('Truncated bundle header');
      const entry = JSON.parse(header.subarray(0, newline).toString('utf8'));
      if (!HASH.test(entry.hash) || !Number.isSafeInteger(entry.bytes) || entry.bytes < 0 || entry.bytes > 4 * 1024 ** 3)
        throw new Error('Invalid bundle object');
      offset += newline + 1;
      if (offset + entry.bytes > size) throw new Error('Truncated bundle object');
      const destination = inside(objectRoot, `${entry.hash.slice(0, 2)}/${entry.hash}`);
      await mkdir(path.dirname(destination), { recursive: true });
      const temporary = destination + '.partial';
      const hash = createHash('sha256');
      if (entry.bytes === 0) {
        const file = await open(temporary, 'w', 0o600); await file.close();
      } else {
        await pipeline(
          createReadStream(filename, { start: offset, end: offset + entry.bytes - 1 }),
          new Transform({ transform(chunk, _encoding, callback) { hash.update(chunk); callback(null, chunk); } }),
          createWriteStream(temporary, { mode: 0o600 }),
        );
      }
      if (hash.digest('hex') !== entry.hash) {
        await unlink(temporary);
        throw new Error('Bundle object checksum mismatch');
      }
      await rename(temporary, destination);
      index[entry.hash] = entry.bytes;
      offset += entry.bytes;
      count++;
    }
  } finally { await handle.close(); }
  return count;
}

export async function materialize(manifest, config, index) {
  validateManifest(manifest);
  if (!manifest.files.some(f => f.scope === 'runtime' && f.path === 'server.js')) throw new Error('Standalone server is missing');
  if (!manifest.files.some(f => f.scope === 'runtime' && f.path === '.next/BUILD_ID')) throw new Error('Next build is missing');
  const destination = inside(config.releases, manifest.release);
  if (await stat(path.join(destination, '.aliyas-complete.json')).then(() => true).catch(() => false)) return destination;
  const previous = config.app ? await jsonOr(path.join(config.app, 'current/.aliyas-complete.json'), null) : null;
  if (previous?.files) validateManifest(previous);
  const retained = (previous?.files || []).filter(f => f.scope === 'public' || f.path.startsWith('.next/static/'));
  const files = [...new Map([...retained, ...manifest.files].map(f => [`${f.scope}/${f.path}`, f])).values()];
  for (const file of files) {
    if (index[file.hash] !== file.bytes) throw new Error(`Object not verified: ${file.hash}`);
    const object = inside(config.objects, `${file.hash.slice(0, 2)}/${file.hash}`);
    const status = await lstat(object);
    if (!status.isFile() || status.isSymbolicLink() || status.size !== file.bytes) throw new Error('Object cache is inconsistent');
    const output = inside(destination, file.scope === 'public' ? `public/${file.path}` : file.path);
    await mkdir(path.dirname(output), { recursive: true });
    // Only immutable public/static files share inodes. Runtime caches must never mutate another release.
    if (file.scope === 'public' || file.path.startsWith('.next/static/')) {
      try { await link(object, output); }
      catch (error) { if (error.code !== 'EEXIST') throw error; }
    } else {
      await copyFile(object, output);
    }
    await chmod(output, file.mode);
  }
  await atomicJson(path.join(destination, '.aliyas-complete.json'), { ...manifest, files });
  return destination;
}

async function probe(url, release, timeout = 30_000) {
  const expires = Date.now() + timeout;
  let last = 'No response';
  while (Date.now() < expires) {
    try {
      const response = await fetch(new URL('/api/health', url), { signal: AbortSignal.timeout(4000), cache: 'no-store' });
      const body = await response.json();
      if (response.ok && body.status === 'ok' && body.release === release) return;
      last = `Unexpected health response (${response.status})`;
    } catch (error) { last = error.message; }
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  throw new Error(`Release health check failed: ${last}`);
}

async function checkCandidate(directory, release, config) {
  const log = createWriteStream(path.join(config.logs, `${release}.log`), { flags: 'a', mode: 0o600 });
  const candidate = spawn(process.execPath, ['server.js'], {
    cwd: directory,
    env: { ...process.env, ...config.env, NODE_ENV: 'production', HOSTNAME: '127.0.0.1', PORT: String(config.previewPort), ALIYAS_RELEASE: release, SMTP_ENABLED: 'false', SENDMAIL_ENABLED: 'false' },
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  candidate.stdout.pipe(log, { end: false }); candidate.stderr.pipe(log, { end: false });
  let startupError;
  candidate.on('error', error => { startupError = error; });
  const origin = `http://127.0.0.1:${config.previewPort}`;
  try {
    await probe(origin, release, 45_000);
    if (startupError) throw startupError;
    for (const route of ['/', '/projects', '/developers', '/journal', '/contact', '/sitemap.xml']) {
      const response = await fetch(origin + route, { signal: AbortSignal.timeout(15_000) });
      if (!response.ok) throw new Error(`Preview route ${route}: ${response.status}`);
      await response.arrayBuffer();
    }
    const invalid = await fetch(origin + '/api/enquiries', {
      method: 'POST', headers: { 'Content-Type': 'application/json', Origin: origin }, body: '{}', signal: AbortSignal.timeout(10_000),
    });
    if (invalid.status !== 400) throw new Error(`Unexpected invalid enquiry response: ${invalid.status}`);
  } finally {
    candidate.kill('SIGTERM');
    await new Promise(resolve => {
      if (candidate.exitCode !== null) return resolve();
      const timer = setTimeout(() => { candidate.kill('SIGKILL'); resolve(); }, 5000);
      candidate.once('exit', () => { clearTimeout(timer); resolve(); });
    });
    log.end();
  }
}

async function activate(directory, release, config) {
  const current = path.join(config.app, 'current');
  const previous = await readlink(current).catch(error => { if (error.code === 'ENOENT') return null; throw error; });
  const temporary = path.join(config.app, 'current-next');
  await unlink(temporary).catch(error => { if (error.code !== 'ENOENT') throw error; });
  await symlink(directory, temporary);
  await rename(temporary, current);
  await mkdir(path.join(config.app, 'tmp'), { recursive: true });
  await atomicJson(path.join(config.app, 'tmp/restart.txt'), { release, time: Date.now() });
  try {
    await probe(config.siteUrl, release, 60_000);
  } catch (error) {
    if (previous) {
      await symlink(previous, temporary);
      await rename(temporary, current);
      await atomicJson(path.join(config.app, 'tmp/restart.txt'), { rollback: true, time: Date.now() });
    } else {
      await unlink(current);
    }
    throw error;
  }
}

export async function receive(config) {
  for (const folder of [config.objects, config.releases, config.logs, config.app, path.join(config.exchange, 'inbox'), path.join(config.exchange, 'requests'), path.join(config.exchange, 'receipts'), path.join(config.exchange, 'state')])
    await mkdir(folder, { recursive: true, mode: 0o700 });
  const indexPath = path.join(config.exchange, 'state/objects.json');
  const index = await jsonOr(indexPath, {});
  const inbox = path.join(config.exchange, 'inbox');
  for (const filename of (await readdir(inbox)).filter(n => /^[a-f0-9-]{36}\.json$/.test(n)).sort()) {
    const id = filename.slice(0, -5);
    const receiptPath = path.join(config.exchange, 'receipts', `${id}.json`);
    const prior = await jsonOr(receiptPath, null);
    if (prior) continue;
    try {
      const meta = await jsonOr(path.join(inbox, filename), null);
      const bundle = path.join(inbox, `${id}.bundle`);
      if (!HASH.test(meta?.hash) || !Number.isSafeInteger(meta?.bytes) || meta.bytes < 0 || meta.bytes > 5 * 1024 ** 3 || (await stat(bundle)).size !== meta.bytes || await sha256(bundle) !== meta.hash)
        throw new Error('Bundle checksum or size failed');
      const count = await ingestBundle(bundle, config.objects, index);
      await atomicJson(indexPath, index);
      await atomicJson(receiptPath, { status: 'cached', objects: count });
      await unlink(bundle); await unlink(path.join(inbox, filename));
    } catch (error) {
      await atomicJson(receiptPath, { status: 'failed', error: error.message });
    }
  }
  for (const filename of (await readdir(path.join(config.exchange, 'requests'))).filter(n => n.endsWith('.json')).sort()) {
    const release = filename.slice(0, -5);
    if (!RELEASE.test(release)) continue;
    const receiptPath = path.join(config.exchange, 'receipts', `${release}.json`);
    if (await jsonOr(receiptPath, null)) continue;
    try {
      const manifest = validateManifest(await jsonOr(path.join(config.exchange, 'requests', filename), null));
      if (manifest.release !== release) throw new Error('Release identity mismatch');
      const directory = await materialize(manifest, config, index);
      await checkCandidate(directory, release, config);
      if (config.activate === true) {
        await activate(directory, release, config);
        await atomicJson(path.join(config.exchange, 'state/success.json'), manifest);
      }
      await atomicJson(receiptPath, { status: config.activate ? 'deployed' : 'prepared', release, verifiedAt: new Date().toISOString() });
    } catch (error) {
      await atomicJson(receiptPath, { status: 'failed', release, error: error.message });
    }
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  const config = JSON.parse(await readFile(process.argv[2], 'utf8'));
  await receive(config);
}
