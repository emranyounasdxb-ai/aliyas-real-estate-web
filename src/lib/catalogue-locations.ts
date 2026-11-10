import type { Project } from './content';
import type { DeveloperProjectRecord } from './developer-projects';
import { locationSearchText, matchesLocation, type LocationFilter } from './locations';
/** Only the fields needed to filter and render a catalogue card cross the client boundary. */
export type ApprovedListing = Pick<
  DeveloperProjectRecord,
  | 'id'
  | 'slug'
  | 'developerSlug'
  | 'name'
  | 'image'
  | 'areaId'
  | 'location'
  | 'emirate'
  | 'type'
  | 'bedrooms'
  | 'price'
  | 'handover'
  | 'paymentPlan'
> & {
  developerName: string;
  placeholder?: boolean;
  imageAlt?: string;
  imagePosition?: string;
  imageResponsiveWidth?: number;
  hasProjectMedia?: boolean;
  selectable?: boolean;
  community?: string;
  priceLabel?: string;
};
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

/** Populate filters from the recorded catalogue, including mixed property types. */
export function cataloguePropertyTypes(
  listings: readonly Pick<ApprovedListing, 'type'>[],
): string[] {
  const preferred = ['Apartment', 'Villa', 'Townhouse', 'Penthouse', 'Duplex', 'Office'];
  const types = new Set(
    listings.flatMap((listing) =>
      (listing.type || '')
        .split('/')
        .map((type) => type.trim())
        .filter(Boolean),
    ),
  );
  return [...types].sort((a, b) => {
    const aIndex = preferred.indexOf(a);
    const bIndex = preferred.indexOf(b);
    return (
      (aIndex < 0 ? preferred.length : aIndex) - (bIndex < 0 ? preferred.length : bIndex) ||
      a.localeCompare(b)
    );
  });
}
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
        (!filter.type ||
          Boolean(item.type?.split('/').some((type) => type.trim() === filter.type))) &&
        (!filter.developer || item.developerSlug === filter.developer) &&
        (!filter.budget || (item.price !== null && item.price <= Number(filter.budget))) &&
        (!filter.savedOnly ||
          filter.saved?.includes(item.key) ||
          (item.approved && filter.saved?.includes(item.approved.slug))) &&
        (!filter.collectionSlugs ||
          filter.collectionSlugs.includes(item.key) ||
          (item.approved && filter.collectionSlugs.includes(item.approved.slug))) &&
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
