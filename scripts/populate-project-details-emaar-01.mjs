import fs from 'node:fs';
import { execFileSync } from 'node:child_process';

// Manually reviewed source facts. No scrape-to-publish or inferred commercial values.
const reviewedOn = '2026-10-31';
const file = 'src/data/developer-projects/emaar.json';
const collection = JSON.parse(fs.readFileSync(file, 'utf8'));
const source = (id, label, url, kind, derivedWords) => ({ id, label, url, kind, checkedOn: reviewedOn, derivedWords });
const unit = (label, area) => ({ label, area: `${area} sq ft total area`, sourceIds: ['plans'] });
const reportedStages = (id = 'portal') => [
  { stage: 'On booking, as reported', percent: 10, sourceIds: [id] },
  { stage: 'During construction, as reported', percent: 70, sourceIds: [id] },
  { stage: 'On handover, as reported', percent: 20, sourceIds: [id] },
];
const commonUnresolved = [
  'Current unit availability, a dated sales quotation and the applicable sales agreement.',
  'Service charges, parking allocation, furnishing specifications and all purchase charges require unit-specific confirmation.',
  'Official project photography is being supplied separately; current images remain illustrative.',
];
const batch = [
  {
    id: 'emaar-project-01', name: 'Valia',
    description: 'Valia brings one to four bedroom apartments to Dubai Creek Harbour. Its tower rises above a mixed use podium, with balconies facing the Creek, the city or the community park. The choice is between smaller city homes and larger family layouts within the same waterfront neighbourhood.',
    areaId: 'dubai-creek-harbour', location: 'Dubai Creek Harbour', emirate: 'Dubai', type: 'Apartment', bedrooms: '1–4', price: 1960000, handover: null, paymentPlan: '80/20 reported',
    amenities: ['Adult swimming pool', 'Children’s pool', 'Yoga deck', 'Outdoor fitness space', 'Padel court', 'Splash pad', 'Outdoor play areas', 'Barbecue area', 'Cabanas', 'Communal lawn'],
    research: {
      overview: ['The brochure describes a tall entrance lobby, layouts planned for everyday use and systems that monitor energy use. Its neighbourhood setting combines a boulevard with quieter park space. The planned Blue Line Metro is a future connection, rather than an operating station promised with the home.'],
      community: 'Dubai Creek Harbour',
      locationNote: 'Emaar identifies Creek Marina, Creek Beach, Harbour Promenade and Ras Al Khor Wildlife Sanctuary among the surrounding destinations. The brochure’s travel estimates depend on traffic and do not establish a guaranteed journey time.',
      priceLabel: 'Advertised from', priceNote: 'Emaar publishes a starting price of AED 1,960,000. This is an advertised entry price, not confirmation that a particular apartment remains available at that figure.',
      paymentNote: 'GRAF reports an 80/20 launch plan. An accessible official payment schedule was not found, so booking amounts and instalment dates remain subject to developer confirmation.',
      handoverNote: 'The completion date needs confirmation: GRAF reports Q4 2030, while a Bayut listing shows December 2030 in its description and Q3 2030 in its structured field. Neither replaces a dated developer schedule.',
      units: [unit('1 bedroom apartment', '816.88–829.47'), unit('2 bedroom apartment', '1,241.83–1,253.24'), unit('3 bedroom apartment', '1,652.15–1,694.45'), unit('4 bedroom apartment', '2,560.84–2,561.06')],
      paymentStages: [],
      facts: [{ label: 'Layout detail', value: 'The four bedroom Type A1 plan includes a maid’s room and several balconies; this does not describe every apartment.', sourceIds: ['plans'] }],
      extraSources: [source('broker', 'GRAF: Valia launch report', 'https://graf.ae/launches/valia-dubai-creek-harbour/', 'broker', 70), source('listing', 'Bayut: Valia listing and date discrepancy', 'https://www.bayut.com/property/details-16757945.html', 'portal', 60)],
      fieldSources: { paymentPlan: ['broker'], handover: ['broker', 'listing'], overview: ['brochure'] },
      unresolved: ['Conflicting Q3/Q4 2030 handover references; official completion date not published in the reviewed developer page or brochure.', 'Official booking percentage, instalment dates and project-wide payment schedule.'],
    },
  },
  {
    id: 'emaar-project-02', name: 'Golf Trails',
    description: 'Golf Trails is a midrise residential collection beside the golf course in Emaar South. Emaar lists one to three bedroom apartments alongside three bedroom townhouses. The plans include compact apartments and larger homes with more outdoor space, giving buyers distinct layouts to compare within one development.',
    areaId: 'dubai-south', location: 'Dubai South', emirate: 'Dubai', type: 'Apartment / Townhouse', bedrooms: '1–3', price: 1906888, handover: 'Q4 2030 reported', paymentPlan: '80/20 reported',
    amenities: ['Adult and children’s pools', 'Gym', 'Multipurpose room', 'Sports courts', 'Open lawns', 'Children’s play area', 'Community golf course'],
    research: {
      overview: ['The brochure pairs open living spaces and neutral finishes with a podium for exercise and leisure. The golf course is a community feature; membership, access conditions and a particular unit’s view should be checked separately.'],
      community: 'Emaar South',
      locationNote: 'Emaar South sits within Dubai South, near Al Maktoum International Airport and Expo City. Emaar also identifies Golf Views, Golf Point and Urbana III nearby. Compare the actual route for your daily journey rather than relying only on a marketing drive time.',
      priceLabel: 'Published units from', priceNote: 'The current Emaar page lists units from AED 1,906,888. Its key facts separately retain a launch price of about AED 1.25 million. The lower launch figure is not used here as a current availability claim.',
      paymentNote: 'Bayut’s project information reports 10% on booking, 70% during construction and 20% at handover. These are portal-reported launch terms; obtain the current unit schedule before relying on them.',
      handoverNote: 'Bayut’s project summary reports Q4 2030. Individual adverts can show other quarters, and the reviewed Emaar page does not give a completion date. Treat this as a reported target, subject to the developer’s sales documents.',
      units: [unit('1 bedroom apartment', '718.71–755.41'), unit('2 bedroom apartment', '1,092.75–1,483.81'), unit('3 bedroom apartment', '1,605.22–1,969.26'), unit('3 bedroom townhouse', '2,603.14–2,610.46')],
      paymentStages: reportedStages(),
      facts: [{ label: 'Building arrangement', value: 'The floor plan booklet labels the apartment building G + P + 10 and the townhouses G + P.', sourceIds: ['plans'] }],
      extraSources: [source('portal', 'Bayut: Golf Trails project information', 'https://www.bayut.com/for-sale/property/dubai/dubai-south/emaar-south/golf-trails/', 'portal', 120), source('summary', 'Bayut: Golf Trails completion summary', 'https://www.bayut.com/new-projects/dubai/dubai-south/emaar-south/golf-trails/', 'portal', 60)],
      fieldSources: { paymentPlan: ['portal'], handover: ['summary'], overview: ['brochure'], amenities: ['official', 'brochure'] },
      unresolved: ['Official current completion date and payment schedule are absent from the reviewed developer page and brochure.', 'The Emaar live unit price differs from its launch-price key fact; confirm the selected unit’s quoted price.', 'Bayut’s published two bedroom Type 2 range starts at 1,069 sq ft; the linked official plan starts at 1,169.72 sq ft. The table uses the official plan.'],
    },
  },
  {
    id: 'emaar-project-03', name: 'Golf Fields',
    description: 'Golf Fields overlooks the golf landscape at Emaar South, with one to three bedroom apartments and three bedroom townhouses. Pools, exercise areas and outdoor gathering spaces form part of the proposed setting. The official plans show a broad spread of sizes, including townhouses with substantially more space than the apartments.',
    areaId: 'dubai-south', location: 'Dubai South', emirate: 'Dubai', type: 'Apartment / Townhouse', bedrooms: '1–3', price: 1260000, handover: 'Q1 2030 reported', paymentPlan: '80/20 reported',
    amenities: ['Adult and children’s pools', 'Splash pad', 'Children’s play area', 'Padel court', 'Event lawn', 'Barbecue area', 'Table tennis', 'Indoor and outdoor yoga areas', 'Indoor and outdoor gym'],
    research: {
      overview: ['The brochure places emphasis on natural light and views, with a mix of smaller apartments and family homes. Residence sizes below come from the project’s own plan booklet, rather than rounded figures in advertisements.'],
      community: 'Emaar South', locationNote: 'The address is within Emaar South in Dubai South. The developer identifies nearby Golf Views, Golf Point and Urbana III. Al Maktoum International Airport is part of the wider district context; airport access and commute times depend on the route and traffic.',
      priceLabel: 'Advertised from', priceNote: 'Emaar advertises apartments from AED 1,260,000. This starting figure is not a townhouse price or a guarantee of remaining stock. Request the current unit quotation and applicable charges.',
      paymentNote: 'Bayut and Property Finder report a 10% booking payment, 70% during construction and 20% at handover. The official project page does not publish the dated instalment schedule; these portal figures require developer confirmation.',
      handoverNote: 'Property Finder reports February 2030 and Bayut reports Q1 2030. These are consistent portal targets, but the reviewed developer documents do not confirm a contractual completion date.',
      units: [unit('1 bedroom apartment', '791.26–960.79'), unit('2 bedroom apartment', '1,177.79–1,401.25'), unit('3 bedroom apartment', '1,632.99–2,150.41'), unit('3 bedroom townhouse', '2,670.10–2,778.17')],
      paymentStages: reportedStages(), facts: [],
      extraSources: [source('portal', 'Bayut: Golf Fields project information', 'https://www.bayut.com/for-sale/property/dubai/dubai-south/emaar-south/golf-fields/', 'portal', 85), source('finder', 'Property Finder: Golf Fields development', 'https://www.propertyfinder.ae/en/new-projects/emaar-properties/golf-fields', 'portal', 65)],
      fieldSources: { paymentPlan: ['portal', 'finder'], handover: ['portal', 'finder'], overview: ['brochure'] },
      unresolved: ['Developer confirmation of the reported Q1 2030 target and the dated payment schedule.'],
    },
  },
  {
    id: 'emaar-project-04', name: 'Golf Vale',
    description: 'Golf Vale offers apartments and townhouses in Emaar South, with golf views and shared spaces for swimming, fitness and outdoor recreation. Its one to three bedroom apartment collection spans notably different floor areas. The three bedroom townhouses provide another option for buyers comparing internal space and terraces.',
    areaId: 'dubai-south', location: 'Dubai South', emirate: 'Dubai', type: 'Apartment / Townhouse', bedrooms: '1–3', price: 1987888, handover: 'Q1 2030 reported', paymentPlan: '80/20 reported',
    amenities: ['Adult and children’s pools', 'Splash pad', 'Children’s play area', 'Padel court', 'Event lawn', 'Barbecue area', 'Table tennis', 'Indoor and outdoor yoga areas', 'Indoor and outdoor gym'],
    research: {
      overview: ['Wood tones, stone, metal and glass are part of the interior direction described in the brochure. The floor plans are more useful than a single headline size: balcony and terrace allocations vary, so compare the total area with the suite area for the specific layout.'],
      community: 'Emaar South', locationNote: 'Golf Vale is within Emaar South, Dubai South. The developer places it in the same community as Golf Views, Golf Point and Urbana III. The wider district includes access towards Al Maktoum International Airport and Expo City.',
      priceLabel: 'Published units from', priceNote: 'Emaar’s page lists available units from AED 1,987,888 while retaining an earlier AED 1.09 million starting-price statement. This page uses the published unit-price figure; it is a dated reference, not a reserved offer.',
      paymentNote: 'Property Finder reports 10% at sales launch, 70% during construction and 20% on handover. The developer page and brochure reviewed here do not provide a dated payment sheet. Confirm the schedule applicable to a new booking.',
      handoverNote: 'Property Finder reports March 2030, within Q1 2030. The completion target remains portal-reported until checked against Emaar’s current sales documentation.',
      units: [unit('1 bedroom apartment', '672.10–868.65'), unit('2 bedroom apartment', '986.19–1,314.10'), unit('3 bedroom apartment', '1,724.20–2,167.10'), unit('3 bedroom townhouse', '2,789.50–2,815.60')],
      paymentStages: reportedStages(), facts: [],
      extraSources: [source('portal', 'Property Finder: Golf Vale development', 'https://www.propertyfinder.ae/en/new-projects/emaar-properties/golf-vale', 'portal', 110)],
      fieldSources: { paymentPlan: ['portal'], handover: ['portal'], overview: ['brochure', 'plans'] },
      unresolved: ['The older advertised starting price differs from the current Emaar unit-price display.', 'Official confirmation of the March 2030 completion target and dated booking schedule.'],
    },
  },
  {
    id: 'emaar-project-05', name: 'Fior 1',
    description: 'Fior 1 is an apartment development at Rashid Yachts & Marina. Emaar’s one to three bedroom collection is planned around marina views, landscaped areas and a waterfront promenade with shops and places to eat. The floor plans include apartments with very different balcony and terrace proportions.',
    areaId: 'dubai-rashid-yachts-marina', location: 'Rashid Yachts & Marina', emirate: 'Dubai', type: 'Apartment', bedrooms: '1–3', price: 2200000, handover: 'Q3 2030 reported', paymentPlan: '80/20 reported',
    amenities: ['Infinity pool', 'Gym', 'Children’s play areas', 'Landscaped gardens', 'Multipurpose rooms', 'Retail outlets'],
    research: {
      overview: ['A larger total area does not always mean the same increase in enclosed living space. In the official booklet, three bedroom Type C has 1,507.27 sq ft of suite space and 1,465.61 sq ft of balcony area. Compare these separately when considering an outdoor-focused layout.'],
      community: 'Rashid Yachts & Marina', locationNote: 'The project sits within the Mina Rashid waterfront district. Emaar identifies the QE2 floating hotel, Downtown Dubai, Dubai Mall and Dubai International Airport as surrounding destinations. These references describe connectivity, not walking distance.',
      priceLabel: 'Advertised from', priceNote: 'Emaar publishes a starting price of AED 2,200,000. Portal launch figures can differ slightly; this page uses the developer’s advertised figure and does not imply a specific unit is currently available.',
      paymentNote: 'Property Finder’s Fior 1 collection reports a 10/70/20 plan. Treat the split as portal-reported launch information, with booking requirements and the dated schedule to be checked against the current developer offer.',
      handoverNote: 'Property Finder reports Q3 2030. Broker adverts also refer to July 2030, but the reviewed developer page and brochure do not confirm that date. The quarter shown is a reported target, not a completion guarantee.',
      units: [unit('1 bedroom apartment', '759.82–906.75'), unit('2 bedroom apartment', '1,140.54–1,440.21'), unit('3 bedroom apartment', '1,591.99–2,972.88')],
      paymentStages: reportedStages(), facts: [],
      extraSources: [source('portal', 'Property Finder: Fior 1 project collection', 'https://www.propertyfinder.ae/en/buy/dubai/properties-for-sale-mina-rashid-fior-1.html', 'portal', 100), source('listing', 'Property Finder: reported July 2030 target', 'https://www.propertyfinder.ae/en/plp/buy/apartment-for-sale-dubai-mina-rashid-fior-1-86181599.html', 'portal', 30)],
      fieldSources: { paymentPlan: ['portal'], handover: ['portal', 'listing'], overview: ['plans'] },
      unresolved: ['Official current instalment schedule and completion date; public portal references are provisional.'],
    },
  },
];

for (const item of batch) {
  const project = collection.projects.find(p => p.id === item.id);
  if (!project || project.name !== item.name) throw new Error(`Identity mismatch: ${item.id}`);
  if (project.research?.status === 'reviewed') { console.log(`Already reviewed: ${item.id}`); continue; }
  const capture = JSON.parse(fs.readFileSync(`artifacts/project-details/emaar/${project.slug}.json`, 'utf8'));
  const brochure = capture.links.find(l => /view brochure/i.test(l.text))?.url;
  const plans = capture.links.find(l => /floor plans/i.test(l.text))?.url;
  if (!brochure || !plans) throw new Error(`Official document links missing: ${item.id}`);
  const { extraSources, fieldSources, unresolved, ...details } = item.research;
  const research = {
    status: 'reviewed', reviewedOn,
    sources: [source('official', `Emaar: ${item.name}`, project.nameSource.url, 'developer', 190), source('brochure', `Emaar: ${item.name} brochure`, brochure, 'official-document', 110), source('plans', `Emaar: ${item.name} floor plans`, plans, 'official-document', 160), ...extraSources],
    fieldSources: { description: ['official'], overview: ['official'], location: ['official'], type: ['official'], bedrooms: ['official'], amenities: ['official'], price: ['official'], units: ['plans'], documents: ['official'], ...fieldSources },
    reviewCoverage: {
      identity: 'Project-specific official page and current name matched to the existing owned record.',
      location: `Official address checked; community ${details.community} retained separately from filter grouping.`,
      residences: 'Types and bedroom mix checked against the official project page and plan booklet.',
      areas: 'All published floor-plan pages reviewed; total-area ranges calculated by bedroom/property type. These are layouts, not availability.',
      amenities: 'Only the project page or linked brochure amenities used; community features are identified separately.',
      pricing: details.priceNote,
      payment: details.paymentNote,
      handover: details.handoverNote,
      documents: 'Official brochure and floor-plan PDFs downloaded and text reviewed. No linked official payment sheet found. Images not imported.',
    },
    ...details, unresolved: [...unresolved, ...commonUnresolved],
  };
  const { research: omitted, id, name, ...fields } = item;
  Object.assign(project, fields, { brochureUrl: brochure, floorPlanUrl: plans, research });
  fs.writeFileSync(file, JSON.stringify(collection, null, 2) + '\n');
  execFileSync(process.execPath, ['scripts/update-project-detail-progress.mjs'], { stdio: 'inherit' });
}
