import assert from 'node:assert/strict';
import { test } from 'node:test';
import { mkdtemp, readFile, unlink, rmdir } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';

// Dynamic path allows Node's native TypeScript runner without changing app resolution.
const sourcePath = '../src/lib/enquiries.ts';
const {
  enquirySchema,
  isSameOriginRequest,
  readBoundedJson,
  consumeRateLimit,
  saveEnquiry,
  deliverEnquiry,
} = await import(sourcePath);
const valid = {
  name: 'Preview Tester',
  email: 'preview@example.test',
  phone: '+971 50 123 4567',
  interest: 'A new home',
  project: '',
  message: 'I would like to explore waterfront homes.',
  consent: true,
  website: '',
};

test('disabled or incomplete SMTP never attempts delivery or claims acceptance', async () => {
  const keys = [
    'SMTP_ENABLED',
    'SMTP_HOST',
    'SMTP_PORT',
    'SMTP_USER',
    'SMTP_PASS',
    'SMTP_FROM',
    'SMTP_TO',
  ];
  const previous = new Map(keys.map((key) => [key, process.env[key]]));
  try {
    for (const key of keys) delete process.env[key];
    assert.equal(await deliverEnquiry(enquirySchema.parse(valid), 'ALY-TEST'), 'not_configured');
    process.env.SMTP_ENABLED = 'true';
    assert.equal(await deliverEnquiry(enquirySchema.parse(valid), 'ALY-TEST'), 'failed');
  } finally {
    for (const key of keys) {
      const value = previous.get(key);
      if (value === undefined) delete process.env[key];
      else process.env[key] = value;
    }
  }
});

test('same-origin validation uses the destination host and rejects foreign origins', () => {
  const request = (origin: string, extra: Record<string, string> = {}) =>
    new Request('http://localhost:3000/api/enquiries', {
      method: 'POST',
      headers: { Host: '127.0.0.1:3000', Origin: origin, ...extra },
    });
  assert.equal(isSameOriginRequest(request('http://127.0.0.1:3000')), true);
  assert.equal(isSameOriginRequest(request('http://localhost:3000')), false);
  assert.equal(isSameOriginRequest(request('https://example.test')), false);
  assert.equal(isSameOriginRequest(request('null')), false);
  assert.equal(
    isSameOriginRequest(request('http://127.0.0.1:3000', { 'sec-fetch-site': 'cross-site' })),
    false,
  );
  assert.equal(
    isSameOriginRequest(request('https://example.test', { 'x-forwarded-host': 'example.test' })),
    false,
  );
});

test('validates required fields, consent, spam trap and unexpected properties', () => {
  assert.equal(enquirySchema.safeParse(valid).success, true);
  for (const invalid of [
    { ...valid, email: 'invalid' },
    { ...valid, name: 'A' },
    { ...valid, message: 'short' },
    { ...valid, consent: false },
    { ...valid, website: 'spam' },
    { ...valid, role: 'admin' },
    { ...valid, phone: 'not a phone number' },
  ]) {
    assert.equal(enquirySchema.safeParse(invalid).success, false);
  }
});

test('caps request bodies independently of declared content length', async () => {
  const request = new Request('http://localhost/api/enquiries', {
    method: 'POST',
    body: JSON.stringify(valid),
  });
  assert.deepEqual(await readBoundedJson(request), valid);
  const oversized = new Request('http://localhost/api/enquiries', {
    method: 'POST',
    headers: { 'content-length': '1' },
    body: 'x'.repeat(8193),
  });
  await assert.rejects(readBoundedJson(oversized), /Payload too large/);
  await assert.rejects(
    readBoundedJson(new Request('http://localhost/api/enquiries', { method: 'POST', body: '{' })),
  );
});

test('email limits expire and case changes cannot bypass the limit', () => {
  const now = Date.now();
  for (let index = 0; index < 5; index += 1)
    assert.equal(consumeRateLimit('limit@example.test', now), true);
  assert.equal(consumeRateLimit('LIMIT@example.test', now), false);
  assert.equal(consumeRateLimit('limit@example.test', now + 901_000), true);
});

test('persists an enquiry before returning a reference', async () => {
  const directory = await mkdtemp(path.join(tmpdir(), 'aliyas-enquiry-test-'));
  const previousDirectory = process.env.ENQUIRY_DATA_DIR;
  process.env.ENQUIRY_DATA_DIR = directory;
  try {
    const reference = await saveEnquiry(enquirySchema.parse(valid));
    assert.match(reference, /^ALY-[A-F0-9]{12}$/);
    const record = JSON.parse(await readFile(path.join(directory, 'enquiries.jsonl'), 'utf8'));
    assert.equal(record.reference, reference);
    assert.equal(record.email, valid.email);
    assert.equal(record.consent, true);
    assert.equal('website' in record, false);
    assert.equal(Number.isFinite(Date.parse(record.createdAt)), true);
  } finally {
    if (previousDirectory === undefined) delete process.env.ENQUIRY_DATA_DIR;
    else process.env.ENQUIRY_DATA_DIR = previousDirectory;
    // Delete only the known test file and now-empty temporary directory.
    await unlink(path.join(directory, 'enquiries.jsonl')).catch(() => undefined);
    await rmdir(directory);
  }
});
