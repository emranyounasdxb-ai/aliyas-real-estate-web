import additions from '@/data/additional-developers.json' with { type: 'json' };
import networkProfiles from '@/data/network-developer-profiles.json' with { type: 'json' };
import approvedNetwork from '@/data/approved-developer-network.json' with { type: 'json' };

export type Developer = {
  slug: string;
  name: string;
  tagline: string;
  description: string;
  image: string;
  website: string;
  registeredWithAliyas?: boolean;
  market?: string;
};

// Registration confirmed by the owner for the 25 entries on the legacy directory.
const registeredSlugs = new Set([
  'emaar',
  'sobha',
  'damac',
  'ellington',
  'meraas',
  'danube',
  'binghatti',
  'sankari',
  'imtiaz',
  'aark',
  'azizi',
  'vincitore',
  'aqua-properties',
  'samana',
  'omniyat',
  'object-1',
  'majid',
  'nakheel',
  'dubai-properties',
  'octa-properties',
  'golden-bridge',
  'meydan',
  'arada',
  'al-habtoor',
  'reportage',
]);

const existingDevelopers: Developer[] = [
  {
    slug: 'emaar',
    name: 'Emaar',
    tagline: 'Shaping the city’s signature addresses.',
    description:
      'Emaar is the developer behind a range of Dubai communities, including Dubai Creek Harbour and The Oasis.',
    image: '/images/project-1.jpg',
    website: 'https://www.emaar.com/',
  },
  {
    slug: 'sobha',
    name: 'Sobha',
    tagline: 'A considered approach to contemporary living.',
    description:
      'Sobha Realty develops residential communities in Dubai, including Sobha Solis in Motor City. Its portfolio offers a starting point for exploring different residential settings and architectural approaches.',
    image: '/images/project-3.jpg',
    website: 'https://sobharealty.com/',
  },
  {
    slug: 'damac',
    name: 'DAMAC',
    tagline: 'Distinctive places, expressive lifestyles.',
    description:
      'DAMAC Properties develops residential and lifestyle destinations, including the DAMAC Islands community in Dubai.',
    image: '/images/project-6.jpg',
    website: 'https://www.damacproperties.com/',
  },
  {
    slug: 'aldar',
    name: 'Aldar',
    tagline: 'A connected vision for Abu Dhabi.',
    description:
      'Aldar develops communities across Abu Dhabi and beyond. Gardenia Bay on Yas Island brings a waterfront focus to its residential portfolio, with shared amenities and spaces shaped around everyday life.',
    image: '/images/project-4.jpg',
    website: 'https://www.aldar.com/',
  },
  {
    slug: 'ellington',
    name: 'Ellington',
    tagline: 'Homes with design at their heart.',
    description:
      'Ellington Properties takes a design-led approach to residential development. Its portfolio includes Cala del Mar on Al Marjan Island in Ras Al Khaimah, a coastal setting with a distinctive island outlook.',
    image: '/images/project-5.jpg',
    website: 'https://ellingtonproperties.ae/',
  },
  {
    slug: 'meraas',
    name: 'Meraas',
    tagline: 'Neighbourhoods made to be experienced.',
    description:
      'Meraas develops destinations and residential communities in Dubai. The Acres is its nature-focused villa community, bringing gardens, lagoons and an outdoor way of life into the residential experience.',
    image: '/images/project-2.jpg',
    website: 'https://meraas.com/',
  },
];

const previousProfiles: Developer[] = [...existingDevelopers, ...additions].map((developer) => ({
  ...developer,
  registeredWithAliyas: registeredSlugs.has(developer.slug),
}));

const profilesBySlug = new Map(
  [...previousProfiles, ...networkProfiles].map((developer) => [developer.slug, developer]),
);

/** Owner-approved network, in the exact supplied order (30 October 2026). */
export const developers: Developer[] = approvedNetwork.map((entry) => {
  const profile = profilesBySlug.get(entry.slug);
  if (!profile) throw new Error(`Missing approved developer profile: ${entry.slug}`);
  return { ...profile, ...entry, registeredWithAliyas: true };
});

// Retain previously shared profile/project URLs and their separately owned data.
// Only the approved network appears in the directory and developer sitemap.
const approvedSlugs = new Set(developers.map(({ slug }) => slug));
export const allDeveloperProfiles: Developer[] = [
  ...developers,
  ...previousProfiles.filter(({ slug }) => !approvedSlugs.has(slug)),
];

// Keep the approved homepage's existing six-brand composition.
export const featuredDevelopers = ['emaar', 'sobha', 'damac', 'aldar', 'ellington', 'meraas'].map(
  (slug) => developers.find((developer) => developer.slug === slug)!,
);
