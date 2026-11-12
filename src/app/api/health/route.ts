export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export function GET() {
  return Response.json(
    { status: 'ok', release: process.env.ALIYAS_RELEASE || 'local' },
    { headers: { 'Cache-Control': 'no-store' } },
  );
}
