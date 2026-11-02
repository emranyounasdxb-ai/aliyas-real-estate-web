import fs from 'node:fs';
const root = 'artifacts/project-expansion/';
const records = JSON.parse(fs.readFileSync(root + 'emaar-community-records.json'));
const source = 'https://smartagm-documents-files.s3.amazonaws.com/documents/files/Emaar-Development_Integrated-Report-for-the-Year-2024_EN.pdf';
const groups = {
  1: ['Aeon', 'Oria', 'Valo', 'MANGROVE', 'ARLO', 'Palace Residences Creek Blue', 'Altus', 'Address Residences'],
  2: ['Parkside Hills', 'Park Lane', 'Vida Residences', 'Palace Residences', 'Club Place', 'Parkland', 'Address Residences', 'Golf Hillside', 'Vida Residences Club Point', 'Hillsedge'],
  3: ['Fairway Villas 3', 'Greenway', 'Golf Lane', 'Greenway 2', 'Golf Point', 'Greenridge', 'Greenville', 'Golf Dale', 'Golf Acres'],
  4: ['Ocean Point', 'Ocean Star', 'Marina Views', 'Ocean Cove', 'Pier Point', 'Porto View', 'Marina Place 1', 'Marina Place 2'],
  8: ['Palmiera 2', 'Mirage', 'Palmiera 3', 'Lavita'],
  9: ['Farm Gardens 2', 'Lillia', 'Venera', 'Velora', 'Avena', 'Avena 2', 'Farm Grove', 'Velora 2'],
  11: ['Terra Heights'],
};
const norm = s => s.toLowerCase().replace(/[^a-z0-9]/g, '');
const emaar = [];
for (const [idx, names] of Object.entries(groups)) {
  const community = JSON.parse(fs.readFileSync(`${root}emaar-community-${idx}.json`));
  for (const name of names) {
    const match = records.find(p => p.collection === community.url && norm(p.name) === norm(name));
    if (!match) { console.log('Missing current match:', idx, name); continue; }
    const qualified = ['Address Residences', 'Palace Residences', 'Vida Residences'].includes(match.name)
      ? match.name + ' ' + (idx === '1' ? 'Dubai Creek Harbour' : 'Dubai Hills Estate') : match.name;
    emaar.push({...match, name: qualified, statusSource: source,
      evidence: 'Official 2024 integrated report, PDF pages 8–9, identifies this UAE launch; exact spelling and community checked against the current official catalogue. No delivered notice for this name was found. Names only; launch evidence does not establish current inventory.'});
  }
}
const reviewedMeraas = [
  [15, 'Madinat Jumeirah Living Jomana', 'Official June 2026 progress update reports 96.01% and ongoing final works before handover.'],
  [16, 'Bluewaters Bay', 'Official September 2026 update reports 40.88% construction.'],
  [17, 'Bulgari Lighthouse Dubai', 'Official September 2026 update reports 72.50% construction.'],
  [18, 'Madinat Jumeirah Living Lamaa', 'Official phase-specific June 2026 update reports Lamaa 98.01% with handover preparations ongoing.'],
  [19, 'Central Park Plaza', 'Official phase-specific RERA September 2026 update reports 43.68% and ongoing construction across both towers.'],
  [19, 'Central Park Erin', 'Official phase-specific March 2026 update reports Erin 92.08% with ongoing finishing, approvals and handover preparations.'],
  [20, 'Bulgari Ocean Mansions', 'Official construction update: marine works completed, preparing to start main construction.'],
];
const meraas = reviewedMeraas.map(([index, name, evidence]) => ({name, evidence, url: JSON.parse(fs.readFileSync(`${root}meraas-deep-${index}.json`)).url}));
fs.writeFileSync('docs/project-expansion-reviewed-6.json', JSON.stringify({emaar, meraas}, null, 2));
console.log('Reviewed', emaar.length, 'Emaar and', meraas.length, 'Meraas candidates.');
