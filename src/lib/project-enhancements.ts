import { locationEntries, floorPlanEntries } from '@/data/project-enhancement-registry';
import type { DeveloperProjectRecord } from './developer-projects';

type Owner = Pick<DeveloperProjectRecord, 'id' | 'slug' | 'developerSlug'>;
function owned<T extends { projectId: string; projectSlug: string; developerSlug: string }>(
  entries: readonly T[],
  project: Owner,
): T | null {
  const entry = entries.find((item) => item.projectId === project.id);
  if (!entry) return null;
  if (entry.projectSlug !== project.slug || entry.developerSlug !== project.developerSlug)
    throw new Error('Project enhancement owner mismatch');
  return entry;
}
export function getProjectLocation(project: Owner) {
  return owned(locationEntries, project);
}
export function getProjectFloorPlans(project: Owner) {
  return owned(floorPlanEntries, project);
}
