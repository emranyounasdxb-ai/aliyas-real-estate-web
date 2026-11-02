/** Editorial groups refer only to the existing preview catalogue, never developer-owned records. */
export const curatedCollections = [
  {
    slug: 'waterfront',
    title: 'Waterfront living',
    description: 'A new rhythm, by the water.',
    image: '/images/project-5.jpg',
    projects: ['creek-waters', 'gardenia-bay', 'cala-del-mar'],
  },
  {
    slug: 'villas',
    title: 'Private villas',
    description: 'Room to live your own way.',
    image: '/images/project-2.jpg',
    projects: ['the-acres'],
  },
  {
    slug: 'city',
    title: 'City residences',
    description: 'Connected to what moves you.',
    image: '/images/concept-apartment-interior.png',
    projects: ['sobha-solis', 'creek-waters'],
  },
] as const;

export function findCuratedCollection(slug: string) {
  return curatedCollections.find((collection) => collection.slug === slug);
}
