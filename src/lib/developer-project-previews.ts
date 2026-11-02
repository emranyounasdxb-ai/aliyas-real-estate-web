import type { Developer } from './content';
import { getDeveloperProjects } from './developer-projects';
import { developerProjectHref } from './developer-project-url';
import { DEVELOPER_HERO_LIMIT } from './developer-project-pagination';
import { developerHeroInspiration } from './developer-hero-imagery';

export type DeveloperProjectPreview = {
  kind: 'project';
  id: string;
  developerSlug: string;
  developerName: string;
  title: string;
  image: string;
  placeholder: boolean;
  href: string;
  nameVerified: boolean;
};

export type DeveloperHeroSlide =
  | DeveloperProjectPreview
  | {
      kind: 'inspiration';
      id: string;
      developerSlug: string;
      image: string;
      alt: string;
    };

/** Keep the scroll-driven showcase short; the full owned collection is paginated below. */
export function getDeveloperProjectPreviews(developer: Developer): DeveloperHeroSlide[] {
  const projects: DeveloperProjectPreview[] = getDeveloperProjects(developer.slug)
    .slice(0, DEVELOPER_HERO_LIMIT)
    .map((project) => ({
      kind: 'project',
      id: project.id,
      developerSlug: developer.slug,
      developerName: developer.name,
      title: project.name,
      image: project.image,
      placeholder: project.placeholder,
      href: developerProjectHref(project),
      nameVerified: Boolean(project.nameSource),
    }));
  if (!projects.length) return [];
  const images: DeveloperHeroSlide[] = developerHeroInspiration(
    developer.slug,
    DEVELOPER_HERO_LIMIT - projects.length,
  ).map((image, index) => ({
    kind: 'inspiration',
    id: `${developer.slug}-hero-inspiration-${index + 1}`,
    developerSlug: developer.slug,
    image: image.src,
    alt: image.alt,
  }));
  return [...projects, ...images];
}
