import { getPublicListings } from './public-listings';

/** Editorial selection. Commercial facts checked against developer pages on 10 November 2026. */
const featured = [
  {
    id: 'select-group-project-01',
    slug: 'artistry-two-residences',
    setting: 'City living',
    summary: 'Apartments and duplex penthouses overlooking Dubai Canal in the heart of d3.',
    priceLabel: 'Residences from',
    startingPrice: 2_300_000,
    plan: '50 / 50',
    timingLabel: 'Planned handover',
    timing: '2029',
    source: 'https://www.select-group.ae/developments/artistry-two-residences',
  },
  {
    id: 'aldar-project-01',
    slug: 'yas-riva-reserve',
    setting: 'Room for family life',
    summary:
      'Four to six bedroom villas, gardens and canal walks on the quieter side of Yas Island.',
    priceLabel: 'Inland villas from',
    startingPrice: 7_900_000,
    plan: '50 / 50',
    timingLabel: 'Home types',
    timing: '4–6 bedroom villas',
    source: 'https://www.aldar.com/properties/en/yasrivareserve',
  },
] as const;

export function getHomeCollection() {
  const listings = getPublicListings();
  return featured.map((editorial) => {
    const project = listings.find((listing) => listing.slug === editorial.slug);
    if (!project || project.id !== editorial.id)
      throw new Error(`Home project mismatch: ${editorial.slug}`);
    return { ...project, editorial };
  });
}

export type HomeCollectionProject = ReturnType<typeof getHomeCollection>[number];
