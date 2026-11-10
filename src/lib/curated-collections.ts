/** Editorial groups use stable IDs from the researched developer project catalogue. */
export const curatedCollections = [
  {
    slug: 'waterfront',
    title: 'Waterfront living',
    description: 'A new rhythm, by the water.',
    image: '/images/projects/aldar/gardenia-bay/canal-aerial-6c92b49523ac.webp',
    projects: ['aldar-project-21', 'ellington-project-19'],
  },
  {
    slug: 'villas',
    title: 'Private villas',
    description: 'Room to live your own way.',
    image: '/images/projects/emaar/serro-2/villa-23b95af33f49.jpg',
    projects: ['emaar-project-07', 'emaar-project-49', 'meraas-project-09'],
  },
  {
    slug: 'city',
    title: 'City residences',
    description: 'Connected to what moves you.',
    image: '/images/projects/sobha/sobha-solis/solis-towers-5e5be3412632.jpg',
    projects: ['sobha-project-19'],
  },
] as const;

export function findCuratedCollection(slug: string) {
  return curatedCollections.find((collection) => collection.slug === slug);
}
