import { projectLocation } from './locations';
import type { ProjectResearch } from './project-research';
import selectGroup from '@/data/developer-projects/select-group.json' with { type: 'json' };
import nshama from '@/data/developer-projects/nshama.json' with { type: 'json' };
import deyaar from '@/data/developer-projects/deyaar.json' with { type: 'json' };
import wasl from '@/data/developer-projects/wasl.json' with { type: 'json' };
import mag from '@/data/developer-projects/mag.json' with { type: 'json' };
import unionProperties from '@/data/developer-projects/union-properties.json' with { type: 'json' };
import alef from '@/data/developer-projects/alef.json' with { type: 'json' };
import eagleHills from '@/data/developer-projects/eagle-hills.json' with { type: 'json' };
import modon from '@/data/developer-projects/modon.json' with { type: 'json' };
import bloom from '@/data/developer-projects/bloom.json' with { type: 'json' };
import imkan from '@/data/developer-projects/imkan.json' with { type: 'json' };
import rakProperties from '@/data/developer-projects/rak-properties.json' with { type: 'json' };
import alHamra from '@/data/developer-projects/al-hamra.json' with { type: 'json' };
import alZorah from '@/data/developer-projects/al-zorah.json' with { type: 'json' };
import danube from '@/data/developer-projects/danube.json' with { type: 'json' };
import binghatti from '@/data/developer-projects/binghatti.json' with { type: 'json' };
import sankari from '@/data/developer-projects/sankari.json' with { type: 'json' };
import imtiaz from '@/data/developer-projects/imtiaz.json' with { type: 'json' };
import aark from '@/data/developer-projects/aark.json' with { type: 'json' };
import azizi from '@/data/developer-projects/azizi.json' with { type: 'json' };
import vincitore from '@/data/developer-projects/vincitore.json' with { type: 'json' };
import aquaProperties from '@/data/developer-projects/aqua-properties.json' with { type: 'json' };
import samana from '@/data/developer-projects/samana.json' with { type: 'json' };
import omniyat from '@/data/developer-projects/omniyat.json' with { type: 'json' };
import object1 from '@/data/developer-projects/object-1.json' with { type: 'json' };
import majid from '@/data/developer-projects/majid.json' with { type: 'json' };
import nakheel from '@/data/developer-projects/nakheel.json' with { type: 'json' };
import dubaiProperties from '@/data/developer-projects/dubai-properties.json' with { type: 'json' };
import octaProperties from '@/data/developer-projects/octa-properties.json' with { type: 'json' };
import goldenBridge from '@/data/developer-projects/golden-bridge.json' with { type: 'json' };
import meydan from '@/data/developer-projects/meydan.json' with { type: 'json' };
import arada from '@/data/developer-projects/arada.json' with { type: 'json' };
import alHabtoor from '@/data/developer-projects/al-habtoor.json' with { type: 'json' };
import reportage from '@/data/developer-projects/reportage.json' with { type: 'json' };
import emaar from '@/data/developer-projects/emaar.json' with { type: 'json' };
import sobha from '@/data/developer-projects/sobha.json' with { type: 'json' };
import damac from '@/data/developer-projects/damac.json' with { type: 'json' };
import aldar from '@/data/developer-projects/aldar.json' with { type: 'json' };
import ellington from '@/data/developer-projects/ellington.json' with { type: 'json' };
import meraas from '@/data/developer-projects/meraas.json' with { type: 'json' };

export type DeveloperProjectRecord = {
  /** Keep this ID stable when replacing a placeholder with approved information. */
  id: string;
  slug: string;
  developerSlug: string;
  name: string;
  /** Verifies the name only; placeholder remains true until full details are approved. */
  nameSource?: { url: string; checkedOn: string };
  previousSlugs?: readonly string[];
  image: string;
  gallery?: readonly { src: string; label: string }[];
  placeholder: boolean;
  description: string | null;
  areaId: string | null;
  location: string | null;
  emirate: string | null;
  type: string | null;
  bedrooms: string | null;
  price: number | null;
  handover: string | null;
  paymentPlan: string | null;
  amenities: readonly string[];
  brochureUrl: string | null;
  floorPlanUrl: string | null;
  /** Sourced details are independent of pending project photography/publication. */
  research?: ProjectResearch;
};
type Collection = { developerSlug: string; projects: DeveloperProjectRecord[] };

// Separate source files are deliberate: edits to one developer never populate another.
const collections = {
  'select-group': selectGroup,
  nshama: nshama,
  deyaar: deyaar,
  wasl: wasl,
  mag: mag,
  'union-properties': unionProperties,
  alef: alef,
  'eagle-hills': eagleHills,
  modon: modon,
  bloom: bloom,
  imkan: imkan,
  'rak-properties': rakProperties,
  'al-hamra': alHamra,
  'al-zorah': alZorah,
  emaar,
  sobha,
  damac,
  aldar,
  ellington,
  meraas,
  danube: danube,
  binghatti: binghatti,
  sankari: sankari,
  imtiaz: imtiaz,
  aark: aark,
  azizi: azizi,
  vincitore: vincitore,
  'aqua-properties': aquaProperties,
  samana: samana,
  omniyat: omniyat,
  'object-1': object1,
  majid: majid,
  nakheel: nakheel,
  'dubai-properties': dubaiProperties,
  'octa-properties': octaProperties,
  'golden-bridge': goldenBridge,
  meydan: meydan,
  arada: arada,
  'al-habtoor': alHabtoor,
  reportage: reportage,
} as Record<string, Collection>;
const projectIds = new Set<string>();
for (const [owner, collection] of Object.entries(collections)) {
  if (collection.developerSlug !== owner) throw new Error(`Wrong collection owner: ${owner}`);
  const slugs = new Set<string>();
  for (const project of collection.projects) {
    if (project.research) {
      const research = project.research;
      if (!['in-progress', 'reviewed'].includes(research.status))
        throw new Error(`Invalid research status: ${project.id}`);
      const sourceIds = new Set(research.sources.map((source) => source.id));
      for (const source of research.sources) {
        if (
          new URL(source.url).protocol !== 'https:' ||
          !['developer', 'official-document', 'portal', 'broker', 'regulator'].includes(source.kind)
        )
          throw new Error(`Invalid research source: ${project.id}/${source.id}`);
      }
      for (const refs of Object.values(research.fieldSources)) {
        if (!refs || refs.some((id) => !sourceIds.has(id)))
          throw new Error(`Missing field source: ${project.id}`);
      }
    }
    Object.assign(project, projectLocation(project));
    if (!project.placeholder && !project.areaId)
      throw new Error(`Approved project requires an area ID: ${project.id}`);
    if (project.developerSlug !== owner || !project.id.startsWith(`${owner}-`))
      throw new Error(`Project ${project.id} does not belong to ${owner}`);
    const routes = [project.slug, ...(project.previousSlugs ?? [])];
    if (
      projectIds.has(project.id) ||
      routes.some((route) => slugs.has(route)) ||
      new Set(routes).size !== routes.length
    )
      throw new Error(`Duplicate project identity: ${project.id}`);
    if (routes.some((route) => !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(route)))
      throw new Error(`Invalid project URL: ${project.slug}`);
    projectIds.add(project.id);
    routes.forEach((route) => slugs.add(route));
    if (project.nameSource) {
      if (new URL(project.nameSource.url).protocol !== 'https:')
        throw new Error(`Invalid project name source: ${project.id}`);
      Object.freeze(project.nameSource);
    }
    if (project.previousSlugs) Object.freeze(project.previousSlugs);
    Object.freeze(project.amenities);
    if ('gallery' in project && Array.isArray(project.gallery)) {
      project.gallery.forEach(Object.freeze);
      Object.freeze(project.gallery);
    }
    Object.freeze(project);
  }
  Object.freeze(collection.projects);
}

export function getDeveloperProjects(developerSlug: string): readonly DeveloperProjectRecord[] {
  return Object.hasOwn(collections, developerSlug)
    ? collections[developerSlug].projects.filter(
        (project) => project.nameSource || !project.placeholder,
      )
    : [];
}

export function getDeveloperProject(developerSlug: string, projectSlug: string) {
  return getDeveloperProjects(developerSlug).find(
    (project) => project.slug === projectSlug || project.previousSlugs?.includes(projectSlug),
  );
}

export function getAllDeveloperProjects(): readonly DeveloperProjectRecord[] {
  return Object.keys(collections).flatMap(getDeveloperProjects);
}

export { developerProjectHref } from './developer-project-url';
