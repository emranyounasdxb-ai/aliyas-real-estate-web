import {
  consumeRateLimit,
  deliverEnquiry,
  enquirySchema,
  isSameOriginRequest,
  readBoundedJson,
  recordEnquiryDelivery,
  saveEnquiry,
} from '@/lib/enquiries';

export const runtime = 'nodejs';

const response = (body: object, status: number, extra?: Record<string, string>) =>
  Response.json(body, {
    status,
    headers: { 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff', ...extra },
  });

export async function POST(request: Request) {
  if (!isSameOriginRequest(request)) {
    return response({ error: 'Please submit your enquiry from this website.' }, 403);
  }
  if (!request.headers.get('content-type')?.toLowerCase().startsWith('application/json')) {
    return response({ error: 'This request format is not supported.' }, 415);
  }
  if (!consumeRateLimit())
    return response(
      { error: 'There have been too many requests. Please try again shortly.' },
      429,
      { 'Retry-After': '60' },
    );
  let raw: unknown;
  try {
    raw = await readBoundedJson(request);
  } catch {
    return response(
      { error: 'We could not read your enquiry. Please check the form and try again.' },
      400,
    );
  }
  const result = enquirySchema.safeParse(raw);
  if (!result.success)
    return response(
      { error: 'Please check your name, email and message, and accept the privacy notice.' },
      400,
    );
  if (!consumeRateLimit(result.data.email))
    return response(
      { error: 'You have sent several enquiries. Please wait a little before trying again.' },
      429,
      { 'Retry-After': '900' },
    );
  try {
    const reference = await saveEnquiry(result.data);
    const delivery = await deliverEnquiry(result.data, reference).catch(() => 'failed' as const);
    // Receipt persistence succeeds before SMTP. Audit failure must not lose the receipt.
    await recordEnquiryDelivery(reference, delivery).catch(() => undefined);
    return response({ reference, delivery, message: 'Your enquiry has been saved.' }, 201);
  } catch {
    return response({ error: 'Your enquiry could not be saved. Please try again.' }, 503);
  }
}
