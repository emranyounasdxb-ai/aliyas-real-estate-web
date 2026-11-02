/** Developer ownership remains part of every listing URL. Safe to import in client components. */
export function developerProjectHref(project: { developerSlug: string; slug: string }) {
  return `/developers/${project.developerSlug}/projects/${project.slug}`;
}
