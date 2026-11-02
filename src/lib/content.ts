import { projectLocation } from './locations';
import { journalArticles } from './journal-articles';

export type Project = {
  slug: string;
  name: string;
  developer: string;
  developerSlug: string;
  areaId: string;
  location: string;
  emirate: string;
  type: string;
  price: number;
  bedrooms: string;
  handover: string;
  paymentPlan: string;
  image: string;
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

export const catalogueNotice =
  'Preview collection: prices, payment plans and completion dates are illustrative, not live offers. Photography is for inspiration and does not depict the named projects. Request verified availability before making a decision.';
export const formatPrice = (price: number) =>
  `AED ${price >= 1000000 ? `${(price / 1000000).toFixed(2).replace(/0$/, '')}M` : `${Math.round(price / 1000)}K`}`;

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
    dateModified: article.date,
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

export const projects: Project[] = [
  {
    slug: 'creek-waters',
    name: 'Creek Waters',
    developer: 'Emaar',
    developerSlug: 'emaar',
    areaId: 'dubai-creek-harbour',
    location: 'Dubai Creek Harbour',
    emirate: 'Dubai',
    type: 'Apartment',
    price: 1700000,
    bedrooms: '1–4',
    handover: '2027',
    paymentPlan: '90 / 10',
    image: '/images/project-1.jpg',
    gallery: [
      {
        src: '/images/project-1.jpg',
        label: 'Exterior inspiration',
      },
      {
        src: '/images/concept-apartment-interior.png',
        label: 'Interior concept',
      },
      {
        src: '/images/concept-apartment-detail.png',
        label: 'Material study',
      },
    ],
    description:
      'A waterfront address in Dubai Creek Harbour, where contemporary architecture meets the rhythm of the creek. Creek Waters brings a city perspective to waterside living, with an emphasis on open views and a connected neighbourhood.',
    amenities: [
      'Waterfront setting',
      'Contemporary architecture',
      'Community spaces',
      'Open-plan living',
    ],
    featured: true,
    source: 'https://www.emaar.com/en/properties/creek-waters',
  },
  {
    slug: 'the-acres',
    name: 'The Acres',
    developer: 'Meraas',
    developerSlug: 'meraas',
    areaId: 'dubai-dubailand',
    location: 'Dubailand',
    emirate: 'Dubai',
    type: 'Villa',
    price: 5500000,
    bedrooms: '3–5',
    handover: '2028',
    paymentPlan: '65 / 35',
    image: '/images/project-2.jpg',
    gallery: [
      {
        src: '/images/project-2.jpg',
        label: 'Exterior inspiration',
      },
      {
        src: '/images/concept-villa-interior.png',
        label: 'Interior concept',
      },
      {
        src: '/images/concept-villa-detail.png',
        label: 'Material study',
      },
    ],
    description:
      'A collection of standalone villas woven into a landscape of gardens and lagoons. The Acres puts nature at the centre of everyday life, with architecture that creates a flowing connection between indoor and outdoor spaces.',
    amenities: ['Standalone villas', 'Landscaped gardens', 'Swimmable lagoons', 'Walking routes'],
    featured: true,
    source: 'https://meraas.com/en/project/the-acres-villas',
  },
  {
    slug: 'sobha-solis',
    name: 'Sobha Solis',
    developer: 'Sobha',
    developerSlug: 'sobha',
    areaId: 'dubai-motor-city',
    location: 'Motor City',
    emirate: 'Dubai',
    type: 'Apartment',
    price: 1100000,
    bedrooms: '1–3',
    handover: '2027',
    paymentPlan: '60 / 40',
    image: '/images/project-3.jpg',
    gallery: [
      {
        src: '/images/project-3.jpg',
        label: 'Exterior inspiration',
      },
      {
        src: '/images/concept-apartment-interior.png',
        label: 'Interior concept',
      },
      {
        src: '/images/concept-apartment-detail.png',
        label: 'Material study',
      },
    ],
    description:
      'An active take on contemporary apartment living in Dubai’s Motor City. Sobha Solis combines a residential setting with space for movement, recreation and everyday connection.',
    amenities: [
      'Fitness-focused spaces',
      'Contemporary residences',
      'Community areas',
      'Outdoor recreation',
    ],
    featured: true,
    source: 'https://sobharealty.com/sobha-communities/sobha-solis',
  },
  {
    slug: 'gardenia-bay',
    name: 'Gardenia Bay',
    developer: 'Aldar',
    developerSlug: 'aldar',
    areaId: 'abu-dhabi-yas-island',
    location: 'Yas Island',
    emirate: 'Abu Dhabi',
    type: 'Apartment',
    price: 1450000,
    bedrooms: 'Studio–3',
    handover: '2027',
    paymentPlan: '50 / 50',
    image: '/images/concept-apartment-interior.png',
    gallery: [
      {
        src: '/images/concept-apartment-interior.png',
        label: 'Interior inspiration',
      },
      {
        src: '/images/project-3.jpg',
        label: 'Exterior inspiration',
      },
      {
        src: '/images/concept-apartment-detail.png',
        label: 'Material study',
      },
    ],
    description:
      'A waterside community on Yas Island shaped around balance, greenery and shared experiences. Gardenia Bay brings the calm of a waterfront promenade into a neighbourhood connected to Abu Dhabi’s island lifestyle.',
    amenities: ['Waterfront promenade', 'Swimming pool', 'Gymnasium', 'Community spaces'],
    featured: false,
    source: 'https://www.aldar.com/properties/en/uae/yas-island/gardenia-bay',
  },
  {
    slug: 'cala-del-mar',
    name: 'Cala del Mar',
    developer: 'Ellington',
    developerSlug: 'ellington',
    areaId: 'rak-al-marjan-island',
    location: 'Al Marjan Island',
    emirate: 'Ras Al Khaimah',
    type: 'Apartment',
    price: 2300000,
    bedrooms: '1–3',
    handover: '2027',
    paymentPlan: '50 / 50',
    image: '/images/concept-apartment-detail.png',
    gallery: [
      {
        src: '/images/concept-apartment-detail.png',
        label: 'Exterior inspiration',
      },
      {
        src: '/images/concept-apartment-interior.png',
        label: 'Interior concept',
      },
      {
        src: '/images/concept-apartment-detail.png',
        label: 'Material study',
      },
    ],
    description:
      'A coastal residential address on Al Marjan Island in Ras Al Khaimah. Cala del Mar pairs Ellington’s design-led approach with a setting shaped by the sea, expansive skies and an unhurried island atmosphere.',
    amenities: [
      'Coastal setting',
      'Design-led interiors',
      'Island location',
      'Residential shared spaces',
    ],
    featured: false,
    source: 'https://ellingtonproperties.ae/en/property-for-sale/cala-del-mar-ras-al-khaimah',
  },
  {
    slug: 'damac-islands',
    name: 'DAMAC Islands',
    developer: 'DAMAC',
    developerSlug: 'damac',
    areaId: 'dubai-dubailand',
    location: 'Dubailand',
    emirate: 'Dubai',
    type: 'Townhouse',
    price: 2750000,
    bedrooms: '4–5',
    handover: '2029',
    paymentPlan: '75 / 25',
    image: '/images/project-6.jpg',
    gallery: [
      {
        src: '/images/project-6.jpg',
        label: 'Exterior inspiration',
      },
      {
        src: '/images/concept-villa-interior.png',
        label: 'Interior concept',
      },
      {
        src: '/images/concept-villa-detail.png',
        label: 'Material study',
      },
    ],
    description:
      'An island-inspired residential concept in Dubai, with a focus on outdoor living and a relaxed community experience. Explore this sample profile as a starting point for a conversation about your preferred home and location.',
    amenities: [
      'Island-inspired setting',
      'Outdoor spaces',
      'Family residences',
      'Community living',
    ],
    featured: false,
    source: 'https://www.damacproperties.com/',
  },
];

// Existing illustrative records must agree with the canonical location registry.
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
