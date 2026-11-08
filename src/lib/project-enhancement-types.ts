import type sampleMedia from '@/data/project-media/emaar/avelia.json';
import type sampleLocation from '@/data/project-locations/avelia.json';
import type samplePlans from '@/data/project-floor-plans/avelia.json';

export type ProjectMediaData = Omit<typeof sampleMedia, 'images'> & {
  editorialImages?: string[];
  unavailableFloorPlans?: {
    note: string;
    reviewedOn: string;
    sources: { url: string; label: string }[];
  };
  images: ((typeof sampleMedia.images)[number] & { photograph?: boolean })[];
};
export type ProjectLocationData = Omit<typeof sampleLocation, 'map' | 'pin' | 'road' | 'travel'> & {
  projectName?: string;
  road?: string;
  map: (typeof sampleLocation.map & { alt?: string; caption?: string }) | null;
  pin: typeof sampleLocation.pin | null;
  travel: Omit<typeof sampleLocation.travel, 'page' | 'destinations'> & {
    page?: number;
    destinations: ((typeof sampleLocation.travel.destinations)[number] & {
      maxMinutes?: number;
      timeQualifier?: 'within';
      distanceKm?: number;
    })[];
  };
  travelHeading?: string;
  travelNote?: string;
  sourceLabel?: string;
};
type ProjectFloorPlanSheet = Omit<(typeof samplePlans.plans)[number], 'sourcePage'> &
  (
    | { sourcePage: number; source?: typeof samplePlans.source; imageSource?: never }
    | {
        imageSource: { url: string; label: string; background?: 'dark' };
        sourcePage?: never;
        source?: never;
      }
  );

export type ProjectFloorPlanData = Omit<typeof samplePlans, 'plans'> & {
  plans: ProjectFloorPlanSheet[];
  eyebrow?: string;
  introduction?: string;
  selectorLabel?: string;
  note?: string;
  researchNoteReplacements?: Record<string, string>;
};
