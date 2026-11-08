import type { ProjectResearch } from './project-research';

// These asset-only research notes predate the separately approved imagery rollout.
// Exact matching keeps commercial uncertainties and mixed factual notes intact.
const replacedImageryNotes = new Set([
  'Official project photography is being supplied separately; current images remain illustrative.',
  'Project photographs will be supplied separately; existing images are illustrative.',
  'Official project photography is deferred; existing images are illustrative.',
  'Official photography will be added later; current images are illustrative.',
  'Official project photography is deferred; current images remain illustrative.',
  'Official photographs are deferred; existing imagery is illustrative.',
  'Official photography is deferred; existing images remain illustrative.',
  'Official photographs are deferred; the current images remain illustrative.',
  'Official photography is deferred; the existing imagery is illustrative.',
  'Photography remains illustrative until the separate image task.',
  'Official imagery is deferred; existing photography remains illustrative.',
  'Official imagery remains deferred; existing photographs are illustrative.',
  'Official project photography is deferred; existing images remain illustrative.',
  'Official project imagery is deferred; existing photographs remain illustrative.',
  'Official imagery is deferred; existing project photographs remain illustrative.',
  'Official project images remain deferred; existing images are illustrative.',
  'Official project imagery is deferred; current images remain illustrative.',
  'Official project imagery is deferred; existing photographs are illustrative.',
  'Official project imagery is deferred; existing photography remains illustrative.',
  'Project imagery remains deferred; existing photographs are illustrative.',
  'Official project images remain deferred; photography is illustrative.',
  'Official project images are deferred; existing photography is illustrative.',
  'Official project imagery is deferred; photography on this preview remains illustrative.',
  'Project imagery remains deferred; existing photography is illustrative.',
  'Existing project photography remains illustrative; real imagery is deferred.',
  'Existing photography remains illustrative; real imagery is deferred.',
  'Photography remains illustrative; real project images are deferred.',
]);

const replacedImagerySuffixes = [
  ' Existing photography remains illustrative; real imagery is deferred.',
  ' Existing photography remains illustrative.',
  ' Photography remains illustrative.',
  ' Illustrative images remain unchanged.',
  ' Images remain illustrative.',
];

export function getDisplayedResearchUnresolved(
  research: ProjectResearch,
  hasProjectMedia: boolean,
  researchNoteReplacements: Record<string, string> = {},
) {
  return hasProjectMedia
    ? research.unresolved
        .filter((note) => !replacedImageryNotes.has(note))
        .map((note) => {
          const suffix = replacedImagerySuffixes.find((value) => note.endsWith(`.${value}`));
          const displayed = suffix ? note.slice(0, -suffix.length) : note;
          return researchNoteReplacements[displayed] ?? displayed;
        })
    : research.unresolved;
}
