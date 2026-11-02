import type { MetadataRoute } from 'next';
export default function robots(): MetadataRoute.Robots {
  const url = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
  const local = /localhost|127\.0\.0\.1/.test(new URL(url).hostname);
  return {
    rules: { userAgent: '*', ...(local ? { disallow: '/' } : { allow: '/', disallow: ['/api/'] }) },
    sitemap: `${url}/sitemap.xml`,
  };
}
