import type { Developer } from './content';
import { getDeveloperProjects } from './developer-projects';
import { developerProjectHref } from './developer-project-url';
import { DEVELOPER_HERO_LIMIT } from './developer-project-pagination';
import { getProjectMedia } from './project-media';

export type DeveloperProjectPreview = {
  kind: 'project';
  id: string;
  developerSlug: string;
  developerName: string;
  title: string;
  image: string;
  imageResponsiveWidth?: number;
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
    .map((project) => {
      const media = getProjectMedia(project);
      const cover = media?.images.find((image) => image.src === media.cardImage);
      return {
        kind: 'project',
        id: project.id,
        developerSlug: developer.slug,
        developerName: developer.name,
        title: project.name,
        image: media?.cardImage || project.image,
        imageResponsiveWidth: cover?.responsiveWidth,
        placeholder: project.placeholder,
        href: developerProjectHref(project),
        nameVerified: Boolean(project.nameSource),
      };
    });
  return projects;
}
