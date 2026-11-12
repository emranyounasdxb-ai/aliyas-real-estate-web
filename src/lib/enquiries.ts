import { randomUUID, createHash } from 'node:crypto';
import { appendFile, mkdir } from 'node:fs/promises';
import path from 'node:path';
import { z } from 'zod';
import nodemailer from 'nodemailer';

const cleanText = (min: number, max: number) =>
  z
    .string()
    .trim()
    .min(min)
    .max(max)
    .refine((value) => !/[\u0000-\u0008\u000b\u000c\u000e-\u001f]/.test(value));

export const enquirySchema = z
  .object({
    name: cleanText(2, 100),
    email: z.email().trim().max(254),
    phone: z
      .string()
      .trim()
      .max(30)
      .refine((value) => value === '' || /^[+\d\s().-]{7,30}$/.test(value)),
    interest: z.enum(['A new home', 'An investment', 'A specific project', 'Just exploring']),
    project: cleanText(0, 120).optional().default(''),
    message: cleanText(10, 2000),
    consent: z.literal(true),
    website: z.literal(''),
  })
  .strict();

export function isSameOriginRequest(request: Request): boolean {
  const origin = request.headers.get('origin');
  if (!origin || request.headers.get('sec-fetch-site') === 'cross-site') return false;
  try {
    const requestUrl = new URL(request.url);
    // Next can normalize request.url to localhost while the browser uses 127.0.0.1.
    // Host is the actual destination header; never take it from x-forwarded-host.
    const host = request.headers.get('host') || requestUrl.host;
    const browserOrigin = new URL(origin);
    if (origin !== browserOrigin.origin || browserOrigin.host.toLowerCase() !== host.toLowerCase())
      return false;
    if (browserOrigin.protocol === requestUrl.protocol) return true;
    // A fixed configured origin allows HTTPS termination in front of a Node server.
    return Boolean(
      process.env.NEXT_PUBLIC_SITE_URL &&
      origin === new URL(process.env.NEXT_PUBLIC_SITE_URL).origin,
    );
  } catch {
    return false;
  }
}

type LimitEntry = { count: number; expires: number };
const limits = new Map<string, LimitEntry>();
let globalWindow: LimitEntry = { count: 0, expires: 0 };

// Local, single-process abuse controls. A distributed deployment needs a shared store.
export function consumeRateLimit(email?: string, now = Date.now()): boolean {
  for (const [key, entry] of limits) if (entry.expires <= now) limits.delete(key);
  if (!email) {
    if (globalWindow.expires <= now) globalWindow = { count: 0, expires: now + 60_000 };
    globalWindow.count += 1;
    return globalWindow.count <= 60;
  }
  const key = createHash('sha256').update(email.toLowerCase()).digest('hex');
  const entry = limits.get(key) ?? { count: 0, expires: now + 15 * 60_000 };
  entry.count += 1;
  limits.set(key, entry);
  if (limits.size > 1000) return false;
  return entry.count <= 5;
}

export async function readBoundedJson(request: Request, maxBytes = 8192): Promise<unknown> {
  const declaredLength = Number(request.headers.get('content-length'));
  if (declaredLength > maxBytes) throw new Error('Payload too large');
  const reader = request.body?.getReader();
  if (!reader) throw new Error('Missing body');
  const chunks: Uint8Array[] = [];
  let received = 0;
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      received += value.byteLength;
      if (received > maxBytes) {
        await reader.cancel();
        throw new Error('Payload too large');
      }
      chunks.push(value);
    }
  } finally {
    reader.releaseLock();
  }
  return JSON.parse(Buffer.concat(chunks).toString('utf8'));
}

export async function saveEnquiry(input: z.infer<typeof enquirySchema>): Promise<string> {
  const reference = `ALY-${randomUUID().replaceAll('-', '').slice(0, 12).toUpperCase()}`;
  // Runtime data is created on demand; it must not be bundled into the server build.
  const directory = path.resolve(
    /* turbopackIgnore: true */ process.env.ENQUIRY_DATA_DIR || path.join(process.cwd(), '.data'),
  );
  await mkdir(directory, { recursive: true, mode: 0o700 });
  const { website: _website, ...details } = input;
  await appendFile(
    path.join(directory, 'enquiries.jsonl'),
    `${JSON.stringify({ reference, createdAt: new Date().toISOString(), ...details })}\n`,
    { encoding: 'utf8', mode: 0o600 },
  );
  return reference;
}

export type EnquiryDelivery = 'not_configured' | 'accepted' | 'failed';

/** Delivery is opt-in. Acceptance means queued by the configured mail service. */
export async function deliverEnquiry(
  input: z.infer<typeof enquirySchema>,
  reference: string,
): Promise<EnquiryDelivery> {
  const sendmail = process.env.SENDMAIL_ENABLED === 'true';
  if (!sendmail && process.env.SMTP_ENABLED !== 'true') return 'not_configured';
  const addresses = z.object({ from: z.email(), to: z.email() }).safeParse({
    from: process.env.SMTP_FROM,
    to: process.env.SMTP_TO,
  });
  if (!addresses.success) return 'failed';
  const configuration = z
    .object({
      host: z
        .string()
        .trim()
        .min(1)
        .max(253)
        .regex(/^[a-zA-Z0-9.-]+$/),
      port: z.coerce.number().int().min(1).max(65535),
      user: z.string().min(1).max(320),
      pass: z.string().min(1).max(1000),
      from: z.email(),
      to: z.email(),
    })
    .safeParse({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT || '587',
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
      from: process.env.SMTP_FROM,
      to: process.env.SMTP_TO,
    });
  if (!sendmail && !configuration.success) return 'failed';
  const { from, to } = addresses.data;
  const transportOptions = sendmail
    ? { sendmail: true as const, path: '/sbin/sendmail', newline: 'unix' }
    : (() => {
        if (!configuration.success) throw new Error('Invalid mail configuration');
        const { host, port, user, pass } = configuration.data;
        return {
          host, port, secure: port === 465, requireTLS: port !== 465,
          auth: { user, pass }, connectionTimeout: 10_000,
          greetingTimeout: 5_000, socketTimeout: 10_000, dnsTimeout: 5_000,
        };
      })();
  const transporter = nodemailer.createTransport({
    ...transportOptions,
    logger: false, debug: false, disableFileAccess: true, disableUrlAccess: true,
  });
  try {
    const result = await transporter.sendMail({
      from: { name: 'Aliyas Real Estate', address: from },
      to,
      replyTo: { name: input.name.replace(/[\r\n]/g, ' '), address: input.email },
      subject: `Aliyas property enquiry ${reference}`,
      text: [
        `Enquiry reference: ${reference}`,
        `Name: ${input.name}`,
        `Email: ${input.email}`,
        `Phone: ${input.phone || 'Not provided'}`,
        `Interest: ${input.interest}`,
        `Project: ${input.project || 'General enquiry'}`,
        '',
        input.message,
        '',
        'The sender consented to storing their details with this enquiry.',
      ].join('\n'),
      disableFileAccess: true,
      disableUrlAccess: true,
    });
    if (sendmail) return result.response === 'Messages queued for delivery' ? 'accepted' : 'failed';
    return result.accepted?.length > 0 && result.rejected?.length === 0 ? 'accepted' : 'failed';
  } catch {
    // Avoid logging credentials, provider responses, or personal enquiry details.
    return 'failed';
  } finally {
    transporter.close();
  }
}

export async function recordEnquiryDelivery(
  reference: string,
  status: EnquiryDelivery,
): Promise<void> {
  const directory = path.resolve(
    /* turbopackIgnore: true */ process.env.ENQUIRY_DATA_DIR || path.join(process.cwd(), '.data'),
  );
  await appendFile(
    path.join(directory, 'enquiry-delivery.jsonl'),
    `${JSON.stringify({ reference, status, attemptedAt: new Date().toISOString() })}\n`,
    { encoding: 'utf8', mode: 0o600 },
  );
}
