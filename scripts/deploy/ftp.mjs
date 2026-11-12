import { Client } from 'basic-ftp';
import { readFile } from 'node:fs/promises';
import { Writable, Readable } from 'node:stream';

export async function connectFtp() {
  const password = process.env.CPANEL_FTP_PASSWORD ||
    (process.env.CPANEL_FTP_PASSWORD_FILE
      ? (await readFile(process.env.CPANEL_FTP_PASSWORD_FILE, 'utf8')).trim()
      : '');
  if (!password) throw new Error('Missing deployment FTP password');
  const host = process.env.CPANEL_FTP_HOST;
  const user = process.env.CPANEL_FTP_USER;
  if (!host || !user) throw new Error('Missing deployment FTP host or user');
  const client = new Client(60_000);
  try {
    await client.access({ host, user, password, port: 21, secure: true });
    if (!client.ftp.socket.authorized) throw new Error('FTPS certificate was not verified');
    return client;
  } catch (error) {
    client.close();
    throw error;
  }
}

export async function readRemoteJson(client, filename, { optional = false } = {}) {
  let bytes = 0;
  const chunks = [];
  const output = new Writable({
    write(chunk, _encoding, callback) {
      bytes += chunk.length;
      if (bytes > 64 * 1024 * 1024) return callback(new Error('Remote manifest exceeds 64 MiB'));
      chunks.push(chunk);
      callback();
    },
  });
  try {
    await client.downloadTo(output, filename);
  } catch (error) {
    if (optional && error.code === 550) return null;
    throw error;
  }
  return JSON.parse(Buffer.concat(chunks).toString('utf8'));
}

export async function writeRemoteJson(client, filename, value) {
  await client.uploadFrom(Readable.from([JSON.stringify(value) + '\n']), `${filename}.partial`);
  await client.rename(`${filename}.partial`, filename);
}
