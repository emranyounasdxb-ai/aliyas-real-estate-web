import areaData from '../data/locations.json' with { type: 'json' };

export const emirates = [
  'Dubai',
  'Abu Dhabi',
  'Sharjah',
  'Ras Al Khaimah',
  'Ajman',
  'Fujairah',
  'Umm Al Quwain',
] as const;
export type Emirate = (typeof emirates)[number];
export type Area = {
  id: string;
  name: string;
  shortName?: string;
  emirate: Emirate;
  aliases: readonly string[];
};
const key = (value: string) =>
  value
    .normalize('NFKC')
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, ' ')
    .trim();
const ids = new Set<string>();
export const areas: readonly Area[] = Object.freeze(
  areaData.map((record) => {
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(record.id) || ids.has(record.id))
      throw new Error(`Duplicate or invalid area ID: ${record.id}`);
    if (!(emirates as readonly string[]).includes(record.emirate))
      throw new Error(`Unknown emirate: ${record.emirate}`);
    ids.add(record.id);
    return Object.freeze({
      ...record,
      emirate: record.emirate as Emirate,
      aliases: Object.freeze(record.aliases),
    });
  }),
);
export function getArea(id: string | null | undefined) {
  return areas.find((area) => area.id === id);
}
export function areasForEmirate(emirate = '') {
  return areas.filter((area) => !emirate || area.emirate === emirate);
}
export function resolveEmirate(value: string) {
  const query = key(value);
  if (query === 'rak') return 'Ras Al Khaimah';
  return emirates.find((emirate) => key(emirate) === query);
}
export function resolveArea(value: string, emirate = '') {
  const query = key(value);
  const matches = areasForEmirate(emirate).filter((area) =>
    [area.id, area.name, ...area.aliases].some((name) => key(name) === query),
  );
  return matches.length === 1 ? matches[0] : undefined;
}
export function areaLabel(area: Area) {
  return area.shortName ? `${area.name} (${area.shortName})` : area.name;
}
export type LocationFilter = { emirate: string; area: string; invalid: boolean };
export function readLocationFilter(emirateValue = '', areaValue = ''): LocationFilter {
  const emirate = emirateValue ? resolveEmirate(emirateValue) : undefined;
  const area = areaValue ? resolveArea(areaValue, emirate) : undefined;
  return {
    emirate: emirate ?? (emirateValue || area?.emirate || ''),
    area: area?.id ?? areaValue,
    invalid: Boolean((emirateValue && !emirate) || (areaValue && !area)),
  };
}
export function updateLocationQuery(
  query: URLSearchParams,
  field: 'emirate' | 'area',
  value: string,
) {
  const next = new URLSearchParams(query);
  if (field === 'emirate') {
    if (value) next.set('emirate', value);
    else next.delete('emirate');
    const currentArea = resolveArea(next.get('area') ?? '');
    if (!value || currentArea?.emirate !== value) next.delete('area');
  } else {
    const area = getArea(value);
    if (area) {
      next.set('area', area.id);
      next.set('emirate', area.emirate);
    } else next.delete('area');
  }
  return next;
}
export function locationHref(area: Area) {
  return `/projects?${new URLSearchParams({ emirate: area.emirate, area: area.id })}`;
}
export type LocatedProject = {
  areaId: string | null;
  emirate: string | null;
  location?: string | null;
};
export function matchesLocation(project: LocatedProject, filter: LocationFilter) {
  return (
    !filter.invalid &&
    (!filter.emirate || project.emirate === filter.emirate) &&
    (!filter.area || project.areaId === filter.area)
  );
}
export function locationSearchText(project: LocatedProject) {
  const area = getArea(project.areaId);
  return [project.location, project.emirate, area?.name, ...(area?.aliases ?? [])]
    .filter(Boolean)
    .join(' ');
}
/** Reject conflicting geography; an area ID is the authoritative community assignment. */
export function projectLocation(project: LocatedProject) {
  if (!project.areaId)
    return { areaId: null, location: project.location ?? null, emirate: project.emirate };
  const area = getArea(project.areaId);
  if (!area) throw new Error(`Unknown project area: ${project.areaId}`);
  if (project.emirate && project.emirate !== area.emirate)
    throw new Error(`Area/emirate mismatch: ${project.areaId}`);
  if (project.location && resolveArea(project.location, area.emirate)?.id !== area.id)
    throw new Error(`Area/location mismatch: ${project.areaId}`);
  return { areaId: area.id, location: area.name, emirate: area.emirate };
}
