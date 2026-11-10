import { mediaEntries } from '@/data/project-enhancement-registry';
import responsiveWidths from '@/data/project-image-variants.json' with { type: 'json' };
import type { DeveloperProjectRecord } from './developer-projects';

const widths: Record<string, number> = responsiveWidths;
/** Return a prepared display width only for a content-addressed project image. */
export function getProjectImageResponsiveWidth(src: string) {
  const hash = /^\/images\/projects\/.+-([a-f0-9]{12})\.(?:jpg|jpeg|png|webp|avif)$/i.exec(src)?.[1].toLowerCase();
  return hash ? widths[hash] : undefined;
}

const mediaByProject = new Map(
  mediaEntries.map((entry) => [
    entry.projectId,
    {
      ...entry,
      images: entry.images.map((image) => {
        const hash = /-([a-f0-9]{12})\.[a-z0-9]+$/i.exec(image.src)?.[1].toLowerCase();
        const responsiveWidth = hash && image.sha256?.startsWith(hash) ? widths[hash] : undefined;
        return { ...image, responsiveWidth };
      }),
    },
  ]),
);

/** Opt-in detail-page media. A sample never changes another project's imagery or data. */
export function getProjectMedia(
  project: Pick<DeveloperProjectRecord, 'id' | 'slug' | 'developerSlug'>,
) {
  const media = mediaByProject.get(project.id);
  if (!media) return null;
  if (project.slug !== media.projectSlug || project.developerSlug !== media.developerSlug)
    throw new Error('Project media owner mismatch');
  return media;
}
