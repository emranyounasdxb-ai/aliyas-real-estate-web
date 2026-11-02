import type { Project } from './content';
import type { DeveloperProjectRecord } from './developer-projects';
import { locationSearchText, matchesLocation, type LocationFilter } from './locations';
export type ApprovedListing = DeveloperProjectRecord & { developerName: string };
export type CatalogueEntry = {
  key: string;
  name: string;
  developer: string;
  developerSlug: string;
  areaId: string | null;
  location: string | null;
  emirate: string | null;
  type: string | null;
  price: number | null;
  featured: boolean;
  sample?: Project;
  approved?: ApprovedListing;
};
export function catalogueEntries(
  samples: readonly Project[],
  approved: readonly ApprovedListing[],
): CatalogueEntry[] {
  const identities = new Set(
    approved.map((item) => `${item.developerSlug}:${item.name.toLowerCase().trim()}`),
  );
  return [
    ...samples
      .filter((item) => !identities.has(`${item.developerSlug}:${item.name.toLowerCase().trim()}`))
      .map((sample) => ({ ...sample, key: sample.slug, sample })),
    ...approved.map((item) => ({
      key: item.id,
      name: item.name,
      developer: item.developerName,
      developerSlug: item.developerSlug,
      areaId: item.areaId,
      location: item.location,
      emirate: item.emirate,
      type: item.type,
      price: item.price,
      featured: false,
      approved: item,
    })),
  ];
}
export type CatalogueFilters = LocationFilter & {
  type?: string;
  developer?: string;
  query?: string;
  budget?: string;
  sort?: string;
  savedOnly?: boolean;
  saved?: readonly string[];
  collectionSlugs?: readonly string[];
};
export function filterCatalogue(entries: readonly CatalogueEntry[], filter: CatalogueFilters) {
  return entries
    .filter(
      (item) =>
        matchesLocation(item, filter) &&
        (!filter.type || item.type === filter.type) &&
        (!filter.developer || item.developerSlug === filter.developer) &&
        (!filter.budget || (item.price !== null && item.price <= Number(filter.budget))) &&
        (!filter.savedOnly || filter.saved?.includes(item.key)) &&
        (!filter.collectionSlugs || filter.collectionSlugs.includes(item.key)) &&
        `${item.name} ${item.developer} ${locationSearchText(item)}`
          .toLowerCase()
          .includes((filter.query ?? '').toLowerCase().trim()),
    )
    .sort((a, b) => {
      if (filter.sort === 'price-low' || filter.sort === 'price-high') {
        if (a.price === null) return b.price === null ? 0 : 1;
        if (b.price === null) return -1;
        return filter.sort === 'price-low' ? a.price - b.price : b.price - a.price;
      }
      return filter.sort === 'name'
        ? a.name.localeCompare(b.name)
        : Number(b.featured) - Number(a.featured);
    });
}
