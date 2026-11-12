import type { NextConfig } from 'next';

const isDev = process.env.NODE_ENV !== 'production';
const previewSlot = process.env.ALIYAS_ISOLATED_PREVIEW ?? '';
const nextConfig: NextConfig = {
  ...(process.env.ALIYAS_STANDALONE === '1' ? { output: 'standalone' as const } : {}),
  ...(process.env.ALIYAS_BUILD_ID ? { generateBuildId: async () => process.env.ALIYAS_BUILD_ID! } : {}),
  distDir: /^[12]$/.test(previewSlot) ? `artifacts/next-preview-${previewSlot}` : '.next',
  poweredByHeader: false,
  images: { formats: ['image/webp'], qualities: [75, 85] },
  async headers() {
    return [
      {
        // Versioned, content-addressed variants can be cached without going stale.
        source: '/images/project-responsive/:path*',
        headers: [{ key: 'Cache-Control', value: 'public, max-age=31536000, immutable' }],
      },
      {
        source: '/images/navigation-responsive/:path*',
        headers: [{ key: 'Cache-Control', value: 'public, max-age=31536000, immutable' }],
      },
      {
        // Only content-hashed, pre-optimized journal assets live in this folder.
        source: '/images/journal/:path*',
        headers: [{ key: 'Cache-Control', value: 'public, max-age=31536000, immutable' }],
      },
      {
        // Content-hashed lossless masters for editorial decoration only.
        source: '/images/inspiration/:path*',
        headers: [{ key: 'Cache-Control', value: 'public, max-age=31536000, immutable' }],
      },
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
          {
            key: 'Content-Security-Policy',
            value: `default-src 'self'; script-src 'self' 'unsafe-inline' ${isDev ? "'unsafe-eval'" : ''}; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; font-src 'self'; connect-src 'self' ${isDev ? 'ws: wss:' : ''}; frame-src 'self' https://www.openstreetmap.org; frame-ancestors 'none'; base-uri 'self'; form-action 'self'; object-src 'none'`,
          },
        ],
      },
    ];
  },
};
export default nextConfig;
