import type { Article } from './content';
import journalImages from './journal-images.json' with { type: 'json' };
import journalResearch from './journal-research.json' with { type: 'json' };
import additionalPlans from './journal-additional-plans.json' with { type: 'json' };
import longTailPlans from './journal-longtail-plans.json' with { type: 'json' };

// Owner-supplied titles, in the owner's order. IDs/slugs stay fixed when copy or media changes.
// No body, publication date, read-time estimate or property image is invented for these previews.
type ArticlePlan = {
  id: string;
  slug: string;
  title: string;
  category: string;
  outline: string[];
};
export const journalArticlePlans: ArticlePlan[] = [
  {
    id: 'aliyas-journal-001',
    slug: 'uae-real-estate-outlook-2026',
    title: 'UAE Real Estate Outlook 2026: Finding Opportunities in a Changing Market',
    category: 'Market perspectives',
    outline: [
      'Understanding the 2026 market context',
      'Questions to ask when assessing an opportunity',
      'Putting your priorities into a research plan',
    ],
  },
  {
    id: 'aliyas-journal-002',
    slug: 'uae-real-estate-adapting-to-iran-conflict',
    title: 'How UAE Real Estate Is Adapting to the Iran Conflict',
    category: 'Market perspectives',
    outline: [
      'Regional context and sources to review',
      'How to evaluate reported market changes',
      'Questions for a property discussion',
    ],
  },
  {
    id: 'aliyas-journal-003',
    slug: 'dubai-property-market-2026',
    title: 'Dubai Property Market 2026: New Opportunities for Thoughtful Buyers',
    category: 'Market perspectives',
    outline: [
      'A closer look at Dubai market information',
      'Comparing opportunities against your goals',
      'Preparing a considered shortlist',
    ],
  },
  {
    id: 'aliyas-journal-004',
    slug: 'uae-property-regional-uncertainty-long-term-value',
    title: 'UAE Property During Regional Uncertainty: A Guide to Long-Term Value',
    category: 'Market perspectives',
    outline: [
      'Separating short term events from personal goals',
      'Questions about long term property value',
      'Building a review checklist',
    ],
  },
  {
    id: 'aliyas-journal-005',
    slug: 'foundations-of-uae-real-estate',
    title: 'Beyond the Headlines: Understanding the Foundations of UAE Real Estate',
    category: 'Market perspectives',
    outline: [
      'Which market foundations to examine',
      'Reading evidence beyond the headlines',
      'Connecting research to your priorities',
    ],
  },
  {
    id: 'aliyas-journal-006',
    slug: 'balanced-dubai-property-market-homebuyers',
    title: 'How a More Balanced Dubai Property Market Can Benefit Homebuyers',
    category: 'Market perspectives',
    outline: [
      'What market balance means',
      'Comparing buyer choices and conditions',
      'Questions to explore before deciding',
    ],
  },
  {
    id: 'aliyas-journal-007',
    slug: 'iran-conflict-uae-property-buyers',
    title: 'Iran Conflict and UAE Property: What Buyers Can Focus on Today',
    category: 'Market perspectives',
    outline: [
      'Checking the context behind the headlines',
      'Setting practical property priorities',
      'Preparing questions for professional advice',
    ],
  },
  {
    id: 'aliyas-journal-008',
    slug: 'location-quality-uae-property-market',
    title: 'Why Location and Quality Matter More in the UAE’s Changing Property Market',
    category: 'Market perspectives',
    outline: [
      'Defining your location requirements',
      'What to look for when comparing quality',
      'Recording a consistent comparison',
    ],
  },
  {
    id: 'aliyas-journal-009',
    slug: 'uae-real-estate-resilience',
    title: 'UAE Real Estate Resilience: The Role of Residents, Businesses and Infrastructure',
    category: 'Market perspectives',
    outline: [
      'Understanding the idea of market resilience',
      'Residents, businesses and infrastructure',
      'Assessing evidence over time',
    ],
  },
  {
    id: 'aliyas-journal-010',
    slug: 'regional-uncertainty-uae-property-buyers-guide',
    title: 'Navigating Regional Uncertainty: A Practical UAE Property Buyer’s Guide',
    category: 'Market perspectives',
    outline: [
      'Defining your goals and time horizon',
      'Organising reliable research',
      'A checklist for your next conversation',
    ],
  },
  {
    id: 'aliyas-journal-011',
    slug: 'dubai-property-negotiating-power-buyers',
    title: 'Greater Negotiating Power: What Today’s Dubai Property Market Means for Buyers',
    category: 'Buying guides',
    outline: [
      'Understanding the terms of a property offer',
      'Preparing evidence for a negotiation',
      'Reviewing the complete agreement',
    ],
  },
  {
    id: 'aliyas-journal-012',
    slug: 'buying-home-dubai-2026',
    title: 'Buying a Home in Dubai in 2026: Making the Most of Wider Choices',
    category: 'Buying guides',
    outline: [
      'Defining the home you need',
      'Organising and comparing your choices',
      'Moving from shortlist to further research',
    ],
  },
  {
    id: 'aliyas-journal-013',
    slug: 'better-decisions-dubai-property-market',
    title: 'From Fast Decisions to Better Decisions: Dubai’s Evolving Property Market',
    category: 'Buying guides',
    outline: [
      'Recognising your decision criteria',
      'Creating time for useful research',
      'Comparing the tradeoffs clearly',
    ],
  },
  {
    id: 'aliyas-journal-014',
    slug: 'fairly-priced-properties-uae',
    title: 'How to Find Fairly Priced Properties in the UAE',
    category: 'Buying guides',
    outline: [
      'Choosing relevant comparison properties',
      'Looking at the complete cost',
      'Questions to ask about a proposed price',
    ],
  },
  {
    id: 'aliyas-journal-015',
    slug: 'ready-properties-dubai-immediate-use-costs',
    title: 'Ready Properties in Dubai: The Appeal of Immediate Use and Clearer Costs',
    category: 'Buying guides',
    outline: [
      'Understanding the ready property option',
      'Inspecting condition and practical requirements',
      'Preparing a cost review',
    ],
  },
  {
    id: 'aliyas-journal-016',
    slug: 'off-plan-property-2026',
    title: 'Off-Plan Property in 2026: Finding Quality, Transparency and Long-Term Potential',
    category: 'Buying guides',
    outline: [
      'Defining your off plan priorities',
      'Reviewing project information and transparency',
      'Questions about delivery and future use',
    ],
  },
  {
    id: 'aliyas-journal-017',
    slug: 'ready-vs-off-plan-uae',
    title: 'Ready vs Off-Plan in the UAE: Choosing the Right Opportunity for Your Goals',
    category: 'Buying guides',
    outline: [
      'Setting your timing and ownership goals',
      'Comparing ready and off plan considerations',
      'Creating a personal decision framework',
    ],
  },
  {
    id: 'aliyas-journal-018',
    slug: 'compare-developer-payment-plans-uae',
    title: 'How to Compare Developer Payment Plans in Today’s UAE Market',
    category: 'Buying guides',
    outline: [
      'Reading the payment schedule',
      'Comparing timing, terms and total costs',
      'Questions to clarify before committing',
    ],
  },
  {
    id: 'aliyas-journal-019',
    slug: 'first-uae-property-research',
    title: 'Your First UAE Property: Building Confidence Through Better Research',
    category: 'Buying guides',
    outline: [
      'Planning your first property research',
      'Collecting and organising information',
      'Preparing for professional conversations',
    ],
  },
  {
    id: 'aliyas-journal-020',
    slug: 'buying-for-long-term-living-uae',
    title: 'Buying for Long-Term Living: A Fresh Perspective on UAE Real Estate',
    category: 'Buying guides',
    outline: [
      'Thinking about everyday life over time',
      'Choosing a location and a flexible home',
      'Reviewing your long term priorities',
    ],
  },
  {
    id: 'aliyas-journal-021',
    slug: 'abu-dhabi-real-estate-2026',
    title: 'Abu Dhabi Real Estate 2026: Exploring the Foundations of Residential Demand',
    category: 'Places & communities',
    outline: [
      'A starting point for Abu Dhabi research',
      'Exploring residential demand information',
      'Comparing communities against your needs',
    ],
  },
  {
    id: 'aliyas-journal-022',
    slug: 'ajman-property-2026',
    title: 'Ajman Property in 2026: Exploring Value Beyond Dubai',
    category: 'Places & communities',
    outline: [
      'Introducing your Ajman property research',
      'Comparing location, space and costs',
      'Questions for a community visit',
    ],
  },
  {
    id: 'aliyas-journal-023',
    slug: 'sharjah-real-estate-family-living',
    title: 'Sharjah Real Estate: Discovering Communities Designed for Family Living',
    category: 'Places & communities',
    outline: [
      'Defining your family living priorities',
      'Exploring Sharjah communities',
      'Checking services and daily journeys',
    ],
  },
  {
    id: 'aliyas-journal-024',
    slug: 'ras-al-khaimah-property-lifestyle',
    title: 'Ras Al Khaimah Property: Exploring Lifestyle and Long-Term Potential',
    category: 'Places & communities',
    outline: [
      'Getting to know Ras Al Khaimah',
      'Comparing lifestyle and location choices',
      'Questions about future plans and use',
    ],
  },
  {
    id: 'aliyas-journal-025',
    slug: 'fujairah-real-estate-coastal-living',
    title: 'Fujairah Real Estate: A Fresh Look at Coastal Living in the UAE',
    category: 'Places & communities',
    outline: [
      'Exploring coastal living priorities',
      'Getting to know Fujairah locations',
      'A checklist for further research',
    ],
  },
  {
    id: 'aliyas-journal-026',
    slug: 'umm-al-quwain-property-living',
    title: 'Umm Al Quwain Property: Exploring a Quieter Side of UAE Living',
    category: 'Places & communities',
    outline: [
      'Defining your preferred pace of life',
      'Exploring Umm Al Quwain communities',
      'Checking connections and everyday needs',
    ],
  },
  {
    id: 'aliyas-journal-027',
    slug: 'dubai-or-abu-dhabi-property',
    title: 'Dubai or Abu Dhabi? Finding the Right Property Market for Your Priorities',
    category: 'Places & communities',
    outline: [
      'Setting shared comparison criteria',
      'Exploring Dubai and Abu Dhabi',
      'Building a shortlist around your priorities',
    ],
  },
  {
    id: 'aliyas-journal-028',
    slug: 'ajman-vs-sharjah-property',
    title: 'Ajman vs Sharjah: Comparing Space, Lifestyle and Property Costs',
    category: 'Places & communities',
    outline: [
      'Comparing your space requirements',
      'Considering lifestyle and travel',
      'Organising property cost information',
    ],
  },
  {
    id: 'aliyas-journal-029',
    slug: 'uae-diverse-residential-communities',
    title: 'Beyond the Skyline: Exploring the UAE’s Diverse Residential Communities',
    category: 'Places & communities',
    outline: [
      'Looking at different community types',
      'Matching surroundings to your routine',
      'Planning useful neighbourhood visits',
    ],
  },
  {
    id: 'aliyas-journal-030',
    slug: 'waterfront-city-suburban-uae-home',
    title: 'Waterfront, City or Suburban Living: Finding Your Ideal UAE Home',
    category: 'Places & communities',
    outline: [
      'Defining your ideal setting',
      'Comparing waterfront, city and suburban choices',
      'Balancing the everyday tradeoffs',
    ],
  },
  {
    id: 'aliyas-journal-031',
    slug: 'uae-rental-property-2026',
    title: 'UAE Rental Property in 2026: Focusing on Sustainable Income',
    category: 'Property & lifestyle',
    outline: [
      'Clarifying rental ownership goals',
      'Reviewing income and expense information',
      'Questions about ongoing management',
    ],
  },
  {
    id: 'aliyas-journal-032',
    slug: 'established-communities-rental-demand',
    title: 'How Established Communities Can Support Long-Term Rental Demand',
    category: 'Property & lifestyle',
    outline: [
      'Defining an established community',
      'Researching rental demand indicators',
      'Reviewing evidence and assumptions',
    ],
  },
  {
    id: 'aliyas-journal-033',
    slug: 'family-villas-uae',
    title: 'Family Villas in the UAE: Understanding Their Lifestyle Appeal',
    category: 'Property & lifestyle',
    outline: [
      'Understanding your family space needs',
      'Exploring villa layouts and surroundings',
      'Considering practical ownership requirements',
    ],
  },
  {
    id: 'aliyas-journal-034',
    slug: 'townhouses-uae',
    title: 'Townhouses in the UAE: Balancing Space, Community and Budget',
    category: 'Property & lifestyle',
    outline: [
      'Exploring townhouse living',
      'Comparing space and community features',
      'Reviewing costs against your budget',
    ],
  },
  {
    id: 'aliyas-journal-035',
    slug: 'smaller-apartments-accessible-property',
    title: 'Smaller Apartments, Clearer Budgets: Exploring Accessible Property Options',
    category: 'Property & lifestyle',
    outline: [
      'Defining usable space for your needs',
      'Comparing compact apartment layouts',
      'Building a complete budget',
    ],
  },
  {
    id: 'aliyas-journal-036',
    slug: 'uae-office-real-estate',
    title: 'UAE Office Real Estate: Understanding Resilient Business Demand',
    category: 'Property & lifestyle',
    outline: [
      'Understanding office property research',
      'Exploring business location requirements',
      'Reviewing demand information and costs',
    ],
  },
  {
    id: 'aliyas-journal-037',
    slug: 'uae-industrial-logistics-property',
    title: 'Industrial and Logistics Property: Exploring Another Side of UAE Real Estate',
    category: 'Property & lifestyle',
    outline: [
      'Introducing industrial and logistics property',
      'Exploring location and operational requirements',
      'Preparing specialist research questions',
    ],
  },
  {
    id: 'aliyas-journal-038',
    slug: 'mixed-use-communities-uae',
    title: 'Mixed-Use Communities: Bringing Homes, Workplaces and Everyday Life Together',
    category: 'Property & lifestyle',
    outline: [
      'Understanding mixed use community design',
      'Exploring connections between daily activities',
      'Comparing convenience and personal preferences',
    ],
  },
  {
    id: 'aliyas-journal-039',
    slug: 'property-management-long-term-value',
    title: 'How Better Property Management Helps Protect Long-Term Value',
    category: 'Property & lifestyle',
    outline: [
      'Understanding property management responsibilities',
      'Comparing service scope and reporting',
      'Planning maintenance and communication',
    ],
  },
  {
    id: 'aliyas-journal-040',
    slug: 'energy-efficient-homes-uae',
    title: 'Energy-Efficient Homes in the UAE: Comfort, Practicality and Lasting Appeal',
    category: 'Property & lifestyle',
    outline: [
      'Exploring comfort and energy use',
      'Questions about building features and systems',
      'Reviewing practical information and costs',
    ],
  },
  {
    id: 'aliyas-journal-041',
    slug: 'uae-infrastructure-property-story',
    title: 'How UAE Infrastructure Investment Supports the Long-Term Property Story',
    category: 'Long term thinking',
    outline: [
      'Understanding infrastructure in property research',
      'Checking project information and timelines',
      'Connecting infrastructure to everyday needs',
    ],
  },
  {
    id: 'aliyas-journal-042',
    slug: 'business-growth-uae-property-demand',
    title: 'The Role of Business Growth in Supporting UAE Property Demand',
    category: 'Long term thinking',
    outline: [
      'Exploring links between business and property',
      'Reviewing demand information',
      'Distinguishing evidence from assumptions',
    ],
  },
  {
    id: 'aliyas-journal-043',
    slug: 'headlines-to-long-term-uae-property-plans',
    title: 'From Short-Term Headlines to Long-Term Plans: A UAE Property Perspective',
    category: 'Long term thinking',
    outline: [
      'Setting your personal time horizon',
      'Putting headlines into context',
      'Building a repeatable research process',
    ],
  },
  {
    id: 'aliyas-journal-044',
    slug: 'uae-property-portfolio-diversification',
    title: 'Building a More Resilient UAE Property Portfolio Through Diversification',
    category: 'Long term thinking',
    outline: [
      'Clarifying portfolio goals',
      'Questions about diversification and exposure',
      'Preparing for qualified advice',
    ],
  },
  {
    id: 'aliyas-journal-045',
    slug: 'recognise-quality-uae-real-estate',
    title: 'Looking Beyond Price: How to Recognise Quality in UAE Real Estate',
    category: 'Long term thinking',
    outline: [
      'Defining quality in practical terms',
      'Comparing design, construction and management',
      'Creating a consistent quality checklist',
    ],
  },
  {
    id: 'aliyas-journal-046',
    slug: 'buying-during-uncertainty-uae-checklist',
    title: 'Buying During Uncertainty: A Clear Checklist for UAE Property Buyers',
    category: 'Long term thinking',
    outline: [
      'Clarifying priorities and constraints',
      'Collecting documents and information',
      'Reviewing unanswered questions',
    ],
  },
  {
    id: 'aliyas-journal-047',
    slug: 'assess-uae-developer-track-record',
    title: 'How to Assess a UAE Developer’s Track Record Before You Buy',
    category: 'Long term thinking',
    outline: [
      'Identifying relevant completed projects',
      'Checking delivery and quality information',
      'Questions for further verification',
    ],
  },
  {
    id: 'aliyas-journal-048',
    slug: 'uae-property-total-ownership-costs',
    title: 'Understanding Total Ownership Costs: Planning a Stronger UAE Property Purchase',
    category: 'Long term thinking',
    outline: [
      'Mapping purchase and recurring cost categories',
      'Collecting current cost information',
      'Preparing a complete ownership budget',
    ],
  },
  {
    id: 'aliyas-journal-049',
    slug: 'uae-real-estate-2027',
    title: 'UAE Real Estate in 2027: Positive Drivers and Developments to Watch',
    category: 'Long term thinking',
    outline: [
      'Framing the outlook as questions to research',
      'Tracking announced developments and evidence',
      'Reviewing plans as information changes',
    ],
  },
  {
    id: 'aliyas-journal-050',
    slug: 'your-next-move-uae-real-estate-aliyas',
    title: 'Your Next Move in UAE Real Estate: Finding the Right Opportunity with Aliyas',
    category: 'Long term thinking',
    outline: [
      'Defining your next property goal',
      'Organising a considered shortlist',
      'Preparing a conversation with Aliyas',
    ],
  },
  ...additionalPlans,
  ...longTailPlans,
];

// Approved media/body is keyed by immutable ID, so each update belongs to one article.
// Titles, slugs and order stay in the owner-approved plans above.
const journalArticleMedia: Partial<
  Record<string, Pick<Article, 'image' | 'imageAlt' | 'imageSrcSet' | 'imageWidth' | 'imageHeight'>>
> = journalImages;

type JournalArticleContent = Partial<
  Record<string, Partial<Omit<Article, 'id' | 'slug' | 'title' | 'sequence' | 'category'>>>
>;
// Validated by scripts/compile-journal-research.mjs before each research batch build.
export const journalArticleContent = journalResearch as JournalArticleContent;

export const allJournalArticles: Article[] = journalArticlePlans.map(
  ({ outline, ...plan }, index) => ({
    ...plan,
    sequence: index + 1,
    status: 'planned',
    image: '',
    excerpt: 'This article is in preparation. The full story will be added soon.',
    sections: outline.map((heading) => ({ heading, body: '' })),
    ...journalArticleMedia[plan.id],
    ...journalArticleContent[plan.id],
  }),
);

// Only complete, published stories belong in public collections and recommendations.
export const journalArticles = allJournalArticles.filter(
  (article) =>
    article.status === 'published' &&
    article.sections.length > 0 &&
    article.sections.every((section) => section.body.trim()),
);
