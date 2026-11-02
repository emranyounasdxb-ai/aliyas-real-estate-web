import imagery from './site-imagery.json' with { type: 'json' };

// Owner-supplied Site images, already imported as full-resolution lossless masters.
// These are visual-only hero slides, never project records or listing imagery.
const inspiration = [
  imagery.waterfrontCity,
  imagery.penthouse,
  imagery.beachfront,
  imagery.arrival,
  imagery.townhomes,
  imagery.coastalBedroom,
  imagery.mountain,
  imagery.kitchen,
  imagery.waterfrontVilla,
  imagery.dining,
  imagery.mangrove,
  imagery.studio,
  imagery.desertVilla,
  imagery.courtyard,
  imagery.gardenBath,
];

export function developerHeroInspiration(developerSlug: string, count: number) {
  const offset =
    [...developerSlug].reduce((sum, letter) => sum + letter.charCodeAt(0), 0) % inspiration.length;
  return Array.from(
    { length: count },
    (_, index) => inspiration[(offset + index) % inspiration.length],
  );
}
