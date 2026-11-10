import { getAllDeveloperProjects, type DeveloperProjectRecord } from './developer-projects';
import { developers } from './developers';
import { getProjectMedia } from './project-media';
import { projectImageLabel } from './project-media-copy';
import { projectPublicText } from './project-public-copy';
import type { ApprovedListing } from './catalogue-locations';

const developerNames = new Map(developers.map(({ slug, name }) => [slug, name]));

/** Reviewed, sourced projects in the approved developer network can be public. */
export function isPublicProject(project: DeveloperProjectRecord): boolean {
  return (
    developerNames.has(project.developerSlug) &&
    (!project.placeholder ||
      (project.research?.status === 'reviewed' && Boolean(getProjectMedia(project))))
  );
}

export function projectCardListing(
  project: DeveloperProjectRecord,
  developerName: string,
): ApprovedListing {
  const media = getProjectMedia(project);
  const cover = media?.images.find((image) => image.src === media.cardImage) || media?.images[0];
  return {
    id: project.id,
    slug: project.slug,
    developerSlug: project.developerSlug,
    developerName,
    name: project.name,
    image: cover?.src || project.image,
    imageAlt: cover
      ? `${project.name} — ${projectImageLabel(cover.label)}, ${cover.photograph ? 'project photograph' : 'project render'}`
      : project.name,
    imagePosition: cover?.position,
    imageResponsiveWidth: cover?.responsiveWidth,
    hasProjectMedia: Boolean(media),
    selectable: isPublicProject(project),
    areaId: project.areaId,
    location: project.location,
    emirate: project.emirate,
    type: project.type,
    bedrooms: project.bedrooms,
    price: project.price,
    handover: projectPublicText(project.handover) || null,
    paymentPlan: projectPublicText(project.paymentPlan) || null,
    community: project.research?.community || undefined,
    priceLabel: projectPublicText(project.research?.priceLabel) || undefined,
  };
}

/** Build the same lightweight, owned catalogue for the homepage and project browser. */
export function getPublicListings(): ApprovedListing[] {
  return getAllDeveloperProjects().flatMap((project) => {
    const developerName = developerNames.get(project.developerSlug);
    if (!developerName || !isPublicProject(project)) return [];
    return [projectCardListing(project, developerName)];
  });
}
