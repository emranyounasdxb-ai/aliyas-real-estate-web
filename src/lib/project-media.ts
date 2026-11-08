import { mediaEntries } from '@/data/project-enhancement-registry';
import type { DeveloperProjectRecord } from './developer-projects';

/** Opt-in detail-page media. A sample never changes another project's imagery or data. */
export function getProjectMedia(
  project: Pick<DeveloperProjectRecord, 'id' | 'slug' | 'developerSlug'>,
) {
  const media = mediaEntries.find((item) => item.projectId === project.id);
  if (!media) return null;
  if (project.slug !== media.projectSlug || project.developerSlug !== media.developerSlug)
    throw new Error('Project media owner mismatch');
  return media;
}
