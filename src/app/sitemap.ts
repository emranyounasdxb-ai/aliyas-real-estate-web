import type { MetadataRoute } from 'next';
import { developers, allArticles } from '@/lib/content';
import { developerProjectHref } from '@/lib/developer-project-url';
import { getPublicListings } from '@/lib/public-listings';
export default function sitemap(): MetadataRoute.Sitemap {
  const origin = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
  const paths = [
    '',
    '/projects',
    '/developers',
    '/journal',
    '/about',
    '/contact',
    '/privacy',
    ...developers.map((d) => `/developers/${d.slug}`),
    ...getPublicListings().map(developerProjectHref),
    ...allArticles
      .filter((article) => article.status !== 'planned')
      .map((a) => `/journal/${a.slug}`),
  ];
  return paths.map((path) => ({
    url: `${origin}${path}`,
    changeFrequency: 'weekly',
    priority: path === '' ? 1 : path.split('/').length === 2 ? 0.8 : 0.6,
  }));
}
