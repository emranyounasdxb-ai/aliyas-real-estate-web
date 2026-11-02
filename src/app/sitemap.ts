import type { MetadataRoute } from 'next';
import { projects, developers, allArticles } from '@/lib/content';
import { developerProjectHref, getAllDeveloperProjects } from '@/lib/developer-projects';
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
    ...projects.map((p) => `/projects/${p.slug}`),
    ...developers.map((d) => `/developers/${d.slug}`),
    ...getAllDeveloperProjects()
      .filter((project) => !project.placeholder)
      .map(developerProjectHref),
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
