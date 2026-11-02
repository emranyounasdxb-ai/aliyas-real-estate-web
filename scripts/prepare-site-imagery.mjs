import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

// Editorial decoration only. Never import this registry into project records.
const selections = [
  [
    'waterfrontCity',
    1,
    'Illustration of a Dubai inspired waterfront with curved residences',
    'Home panorama and Dubai inspiration tile',
  ],
  [
    'beachfront',
    2,
    'Illustration of ivory beachfront apartments beside a palm lined promenade',
    'Home apartment inspiration and discovery thumbnail',
  ],
  [
    'mangrove',
    3,
    'Illustration of low rise residences beside mangroves at sunset',
    'Home Abu Dhabi inspiration tile',
  ],
  [
    'courtyard',
    4,
    'Illustration of a shaded courtyard with stone walls and a traditional wind tower',
    'About materials and shade vignette',
  ],
  [
    'mountain',
    6,
    'Illustration of a stone villa and pool set against rugged mountains',
    'Home Ras Al Khaimah inspiration tile',
  ],
  [
    'desertVilla',
    8,
    'Illustration of a contemporary courtyard villa in a desert landscape',
    'Home private villa inspiration tile',
  ],
  [
    'townhomes',
    9,
    'Illustration of a leafy residential lane with contemporary townhouses',
    'Home townhouse inspiration tile',
  ],
  [
    'waterfrontVilla',
    10,
    'Illustration of a waterside villa and yacht at blue hour',
    'Home waterfront lifestyle tile',
  ],
  [
    'penthouse',
    11,
    'Illustration of a double height living room overlooking the city skyline',
    'Home city residence inspiration tile',
  ],
  [
    'coastalBedroom',
    12,
    'Illustration of a sunlit bedroom opening towards the sea',
    'About daylight and space vignette',
  ],
  [
    'kitchen',
    13,
    'Illustration of a warm contemporary kitchen with a green stone island',
    'Home considered interiors tile',
  ],
  [
    'arrival',
    14,
    'Illustration of a travertine entrance hall with a curved stair and skylight',
    'Home Aliyas perspective visual and contact thumbnail',
  ],
  [
    'studio',
    16,
    'Illustration of a compact studio with integrated storage and a foldaway desk',
    'Home shortlist thumbnail and Journal layout reading path',
  ],
  [
    'dining',
    17,
    'Illustration of a terracotta dining room opening onto a planted terrace',
    'Journal reading guide editorial image',
  ],
  [
    'gardenBath',
    19,
    'Illustration of a stone bathtub beside a secluded planted courtyard',
    'Journal considered home reading path',
  ],
  [
    'terrace',
    23,
    'Illustration of a shaded seaside terrace with natural materials',
    'Contact page lifestyle visual',
  ],
  [
    'community',
    25,
    'Illustration of a landscaped community walking path in morning light',
    'About everyday surroundings vignette',
  ],
  [
    'facade',
    26,
    'Illustration of bronze screens and pale stone residential balconies',
    'Home design perspectives tile',
  ],
  [
    'marina',
    27,
    'Illustration of a marina promenade with sailboats at sunset',
    'Home destinations thumbnail and Journal neighbourhood reading path',
  ],
  [
    'golf',
    28,
    'Illustration of villas and green fairways around a lake in morning mist',
    'Home room for family inspiration tile',
  ],
];
const skipped = {
  5: 'Umm Al Quwain concept: no matching destination section in the approved four-place homepage.',
  7: 'Fujairah concept: no matching destination section in the approved four-place homepage.',
  15: 'Rooftop pool: reserve image; no additional amenities section needed in this edit.',
  18: 'Commercial office tower: outside the residential decoration placements.',
  20: 'Commercial workspace: outside the residential decoration placements.',
  21: 'Retail boulevard: reserve image; avoid adding a section solely to use an image.',
  22: 'Logistics hub: unrelated to the residential pages being decorated.',
  24: 'Hotel lobby: could imply a real Aliyas office or a residential project.',
  29: 'Illustrated consultation: retain the approved company logo DP, not invented team/client photography.',
  30: 'Clinic reception: unrelated to the residential website.',
};
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const source = process.argv[2];
assert.ok(source, 'Pass the owner-supplied Site images directory.');
const files = await fs.readdir(source);
const out = path.join(root, 'public/images/inspiration');
await fs.mkdir(out, { recursive: true });
const media = {};
const audit = [];
for (const [key, number, alt, placement] of selections) {
  const matches = files.filter((name) => name.endsWith(`-${number}.png`));
  assert.equal(matches.length, 1, `Expected one image for ${number}`);
  const input = await fs.readFile(path.join(source, matches[0]));
  const output = await sharp(input).webp({ lossless: true, effort: 6 }).toBuffer();
  const before = await sharp(input).removeAlpha().raw().toBuffer();
  const after = await sharp(output).removeAlpha().raw().toBuffer();
  assert.ok(before.equals(after), `Lossless pixel comparison failed: ${matches[0]}`);
  const hash = createHash('sha256').update(output).digest('hex').slice(0, 12);
  const filename = `${key.replace(/[A-Z]/g, (letter) => '-' + letter.toLowerCase())}-${hash}.webp`;
  await fs.writeFile(path.join(out, filename), output);
  const { width, height } = await sharp(output).metadata();
  media[key] = { src: `/images/inspiration/${filename}`, alt, width, height };
  audit.push({
    key,
    source: matches[0],
    placement,
    src: media[key].src,
    originalBytes: input.length,
    losslessBytes: output.length,
    pixelsIdentical: true,
  });
}
await fs.writeFile(
  path.join(root, 'src/lib/site-imagery.json'),
  JSON.stringify(media, null, 2) + '\n',
);
await fs.writeFile(
  path.join(root, 'docs/site-imagery-manifest.json'),
  JSON.stringify(
    {
      purpose: 'Editorial inspiration only, not inventory or team photography',
      images: audit,
      skipped,
    },
    null,
    2,
  ) + '\n',
);
console.log(
  JSON.stringify({
    count: audit.length,
    sourceBytes: audit.reduce((n, a) => n + a.originalBytes, 0),
    losslessBytes: audit.reduce((n, a) => n + a.losslessBytes, 0),
    allPixelsIdentical: true,
  }),
);
