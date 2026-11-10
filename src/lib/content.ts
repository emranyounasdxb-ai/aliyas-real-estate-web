import { projectLocation } from './locations';
import { journalArticles } from './journal-articles';

export type Project = {
  id: string;
  slug: string;
  href: string;
  name: string;
  developer: string;
  developerSlug: string;
  areaId: string;
  location: string;
  emirate: string;
  type: string;
  price: number;
  priceLabel: string;
  bedrooms: string;
  handover: string | null;
  paymentPlan: string;
  image: string;
  imageAlt: string;
  gallery?: readonly { src: string; label: string }[];
  description: string;
  amenities: string[];
  featured: boolean;
  source: string;
};
export type { Developer } from './developers';
export type ArticleSection = {
  heading: string;
  body: string;
  bullets?: string[];
  table?: { caption: string; columns: string[]; rows: string[][]; note?: string };
  chart?: {
    title: string;
    unit: string;
    kind: string;
    values: { label: string; value: number }[];
    note: string;
  };
};
export type Article = {
  id?: string;
  sequence?: number;
  status?: 'planned' | 'published';
  slug: string;
  title: string;
  category: string;
  excerpt: string;
  image: string;
  imageAlt?: string;
  imageSrcSet?: string;
  imageWidth?: number;
  imageHeight?: number;
  readTime?: string;
  date?: string;
  researchedAt?: string;
  introduction?: string;
  takeaways?: string[];
  references?: { label: string; url: string; period: string }[];
  sections: ArticleSection[];
};

export { catalogueNotice, formatPrice } from './listing-format';

export function breadcrumbSchema(
  section: 'projects' | 'developers' | 'journal',
  slug: string,
  name: string,
) {
  const origin = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
  const labels = { projects: 'Off-plan projects', developers: 'Developers', journal: 'Journal' };
  return {
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: new URL('/', origin).href },
      {
        '@type': 'ListItem',
        position: 2,
        name: labels[section],
        item: new URL(`/${section}`, origin).href,
      },
      { '@type': 'ListItem', position: 3, name, item: new URL(`/${section}/${slug}`, origin).href },
    ],
  };
}

export function articleSchema(article: Article) {
  const origin = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
  return {
    '@type': 'Article',
    headline: article.title,
    description: article.excerpt,
    datePublished: article.date,
    dateModified: article.researchedAt || article.date,
    articleSection: article.category,
    inLanguage: 'en',
    image: article.image ? new URL(article.image, origin).href : undefined,
    mainEntityOfPage: new URL(`/journal/${article.slug}`, origin).href,
    author: { '@type': 'Organization', name: 'Aliyas Real Estate', url: new URL('/', origin).href },
    publisher: {
      '@type': 'Organization',
      name: 'Aliyas Real Estate',
      url: new URL('/', origin).href,
    },
  };
}

export function serializeSchema(graph: unknown[]) {
  return JSON.stringify({ '@context': 'https://schema.org', '@graph': graph }).replace(
    /</g,
    '\\u003c',
  );
}

// Compact client projection of the matching researched developer records and project-media covers.
// Keep commercial values aligned with src/data/developer-projects and covers with src/data/project-media.
export const projects: Project[] = [
  {
    id: 'sobha-project-19',
    slug: 'sobha-solis',
    href: '/developers/sobha/projects/sobha-solis',
    name: 'Sobha Solis',
    developer: 'Sobha',
    developerSlug: 'sobha',
    areaId: 'dubai-motor-city',
    location: 'Motor City',
    emirate: 'Dubai',
    type: 'Apartment',
    price: 2000000,
    priceLabel: 'Developer starting price',
    bedrooms: '1–3',
    handover: null,
    paymentPlan: '60/40 · Property Finder',
    image: '/images/projects/sobha/sobha-solis/solis-towers-5e5be3412632.jpg',
    imageAlt: 'Sobha render showing the four Sobha Solis towers beside Dubai Autodrome.',
    description:
      'Sobha Solis comprises four residential towers above a shared residents’ podium in Motor City. One- to three-bedroom apartments, including a marketed 1.5-bedroom category, sit alongside facilities focused on fitness, social activities and the nearby motorsport setting.',
    amenities: [
      'Lap pool',
      'Racetrack viewing deck',
      'Outdoor cinema',
      'Children’s pool and play area',
      'Co-working spaces',
      'Library',
      'Dog park',
      'Jogging paths',
      'Fitness centre',
      'Steam and sauna',
    ],
    featured: true,
    source: 'https://sobharealty.com/properties-in-dubai/sobha-solis',
  },
  {
    id: 'aldar-project-21',
    slug: 'gardenia-bay',
    href: '/developers/aldar/projects/gardenia-bay',
    name: 'Gardenia Bay',
    developer: 'Aldar',
    developerSlug: 'aldar',
    areaId: 'abu-dhabi-yas-island',
    location: 'Yas Island',
    emirate: 'Abu Dhabi',
    type: 'Apartment',
    price: 805000,
    priceLabel: 'Original launch price',
    bedrooms: 'Studio–3',
    handover: '2028 target',
    paymentPlan: '5/45/50 · original release',
    image: '/images/projects/aldar/gardenia-bay/canal-aerial-6c92b49523ac.webp',
    imageAlt: 'Aldar render showing gardenia Bay buildings along the Yas Island canal.',
    description:
      'Gardenia Bay is Aldar’s canal-side residential community on Yas Island, opposite Yas Park. Its original apartment collection ranges from studios to three-bedroom homes, with shaded outdoor spaces and a waterfront promenade connecting daily life to the landscape.',
    amenities: [
      'Beach club',
      'Swimming pool',
      'Gym',
      'Dog park',
      'Meeting rooms',
      'Private cinema',
      'Mosque',
      'Waterfront promenade',
    ],
    featured: true,
    source: 'https://www.aldar.com/properties/en/uae/yas-island/gardenia-bay',
  },
  {
    id: 'ellington-project-19',
    slug: 'cala-del-mar',
    href: '/developers/ellington/projects/cala-del-mar',
    name: 'Cala Del Mar',
    developer: 'Ellington',
    developerSlug: 'ellington',
    areaId: 'rak-al-marjan-island',
    location: 'Al Marjan Island',
    emirate: 'Ras Al Khaimah',
    type: 'Apartment',
    price: 2300000,
    priceLabel: 'Launch price · sold out',
    bedrooms: 'Studio–4',
    handover: 'Q2 2027 target',
    paymentPlan: '50/50 · published plan',
    image: '/images/projects/ellington/cala-del-mar/cala-del-mar-tower-51903002907d.jpg',
    imageAlt: 'Ellington Properties render of Cala Del Mar tower from the waterfront.',
    description:
      'Cala Del Mar is Ellington’s waterfront apartment development on Al Marjan Island in Ras Al Khaimah. Curved balconies and shared fitness, play and pool spaces shape its coastal residential setting.',
    amenities: [
      'Infinity-edge pool and floating deck',
      'Residents’ beach access',
      'Fitness studio',
      'Virtual training and rowing zones',
      'Outdoor yoga',
      'Clubhouse lounge',
      'Children’s play areas',
    ],
    featured: true,
    source: 'https://ellingtonproperties.ae/en/property-for-sale/cala-del-mar-ras-al-khaimah',
  },
  {
    id: 'damac-project-07',
    slug: 'damac-islands',
    href: '/developers/damac/projects/damac-islands',
    name: 'DAMAC Islands',
    developer: 'DAMAC',
    developerSlug: 'damac',
    areaId: 'dubai-dubailand',
    location: 'Dubailand',
    emirate: 'Dubai',
    type: 'Townhouse',
    price: 2250000,
    priceLabel: 'Original launch price',
    bedrooms: '4–7',
    handover: null,
    paymentPlan: '75/25 · original release',
    image: '/images/projects/damac/damac-islands/villa-arrival-5c0449f700b0.jpg',
    imageAlt: 'DAMAC render showing seven-bedroom villa entrance at DAMAC Islands.',
    description:
      "DAMAC Islands is an inland Dubailand community of four- and five-bedroom townhouses and six- and seven-bedroom villas. Its original masterplan takes inspiration from six tropical destinations, arranging homes around lagoons and recreation spaces. It is separate from DAMAC Islands 2 and from Nakheel's Dubai Islands.",
    amenities: [
      'Central fountain hub',
      'Aqua park',
      'Jungle river',
      'Jungle swings',
      'Aqua dome',
      'Waterfall lagoon',
      'Mini-golf island',
      'Gondola-style paddling',
    ],
    featured: false,
    source: 'https://preprod.damacproperties.com/en/projects/damac-islands/',
  },
];

projects.forEach(projectLocation);

export { developers } from './developers';

export const legacyArticles: Article[] = [
  {
    slug: 'a-home-that-feels-like-you',
    title: 'A home that feels like you.',
    category: 'Design & living',
    excerpt: 'Beyond the beautiful render: the details that make a space work for everyday life.',
    image: '/images/journal-2.jpg',
    imageAlt: 'Light filled contemporary living and dining space with a sculptural staircase',
    readTime: '4 min read',
    date: '2026-10-29',
    sections: [
      {
        heading: 'Start with your everyday rituals',
        body: 'The best place to begin is not the finish schedule. Think about the small moments that make up a day: coffee by a window, a quiet work call, cooking together, or having friends stay. Write down the spaces those moments need. A beautiful home becomes more useful when its layout supports the way you actually live.',
      },
      {
        heading: 'Look beyond the styled room',
        body: 'Show apartments and renders are composed to tell a story. Look for the practical details behind that story: storage beside the entrance, a useful laundry area, enough space to open wardrobes and a sensible place for a dining table. Ask for dimensions and make a simple furniture plan using the pieces you expect to keep.',
      },
      {
        heading: 'Think in light, texture and proportion',
        body: 'A calm interior does not need to be colourless. A small palette of materials can create depth through texture: natural-looking timber, woven fabric, brushed metal and soft stone tones. Look at the direction of the windows and ask how daylight changes across the day. The same finish can feel very different in direct sun and in shade.',
      },
      {
        heading: 'Leave room for life to change',
        body: 'A guest room may become a workspace. A dining corner may become the place where the family gathers. Flexible spaces, uncomplicated circulation and good storage can matter more than an extra decorative feature. Choose a few non-negotiables, then leave yourself room to adapt the rest over time.',
      },
    ],
  },
  {
    slug: 'finding-your-kind-of-neighbourhood',
    title: 'Find your kind of neighbourhood.',
    category: 'Neighbourhood notes',
    excerpt: 'Waterfront, city energy or space to slow down? Begin with the life you want to lead.',
    image: '/images/journal-3.jpg',
    imageAlt: 'Dubai skyline and surrounding city neighbourhoods at sunset',
    readTime: '5 min read',
    date: '2026-10-29',
    sections: [
      {
        heading: 'Picture a normal Tuesday',
        body: 'Holiday impressions are useful, but ordinary days offer a better test. Consider your work routine, school runs, groceries and the people you see regularly. List the journeys you make each week and the services you use most. This creates a more personal shortlist than choosing an address only because it is familiar.',
      },
      {
        heading: 'Visit at more than one time',
        body: 'A place can feel entirely different in the morning, after work and at the weekend. Where access is possible, walk the public areas, notice shade and pedestrian crossings, and observe how people move through the neighbourhood. For communities under construction, ask which amenities exist now and which are planned for later phases.',
      },
      {
        heading: 'Define what connection means to you',
        body: 'For one household, connection means being able to walk to a café. For another, it means an easy drive to family or a direct route to work. Rather than comparing locations with a single score, compare them against your own priorities. Keep travel estimates provisional and check your actual routes at relevant times.',
      },
      {
        heading: 'Balance privacy with activity',
        body: 'Think about the relationship between your home and the spaces around it. A lively promenade can bring convenience and energy; a garden-facing home may offer a quieter outlook. Neither is universally better. A thoughtful choice begins with understanding the atmosphere you would enjoy coming home to.',
      },
    ],
  },
  {
    slug: 'reading-a-floor-plan',
    title: 'The art of reading a floor plan.',
    category: 'The considered home',
    excerpt:
      'A simple guide to spotting flow, usable space and the details a floor plan can reveal.',
    image: '/images/journal-floor-plan-study.svg',
    imageAlt:
      'Concept floor plan showing living, rest and gathering spaces; not a project floor plan',
    readTime: '4 min read',
    date: '2026-10-29',
    sections: [
      {
        heading: 'Follow the journey through the home',
        body: 'Begin at the front door and trace your route to the kitchen, living space and bedrooms. Notice what you see when you enter, where you would leave keys and shoes, and whether private rooms open directly onto busy living areas. A clear sense of movement helps a plan feel intuitive.',
      },
      {
        heading: 'Separate usable space from headline area',
        body: 'A total area figure does not explain how a home will feel. Look at room dimensions, corridor lengths, balcony proportions and the space used by structural elements. Ask how the quoted area has been measured and which spaces it includes, so that you can compare plans consistently.',
      },
      {
        heading: 'Draw the furniture to scale',
        body: 'Place simple rectangles for a sofa, bed, dining table and desk on a copy of the plan. Include the space needed to walk around them and open doors. This small exercise can reveal an awkward corner or show that a room with modest dimensions is more functional than it first appears.',
      },
      {
        heading: 'Ask what the drawing cannot tell you',
        body: 'A plan is one part of the picture. Ceiling heights, window proportions, storage fittings, views and material specifications all affect the experience of a home. Request the relevant drawings and specifications, and clarify which illustrations are conceptual before treating any detail as final.',
      },
    ],
  },
];

export const articles = journalArticles;
export const allArticles = [...articles, ...legacyArticles];
