import { projectPublicText } from './project-public-copy';

/** Short display captions; the original descriptions and source records remain intact. */
export function projectImageLabel(label: string): string {
  const description = label
    .replace(/^Shared villa-series\s+/i, '')
    .replace(/^Original brochure\s+/i, '')
    .replace(/^Earlier brochure\s+/i, 'Earlier design · ')
    .replace(/^Proposed\s+/i, '')
    .replace(/\s*·\s*capture date (?:unverified|unavailable)$/i, '')
    .replace(/\s+concept\b/gi, '')
    .replace(/\baerial illustration (?:showing|of)\s+/i, 'Aerial view of ')
    .replace(/\s+illustrated in\s+.+$/i, '')
    .replace(/\s+illustration in\s+.+$/i, '')
    .replace(/\s+illustrated (at|from)\s+/i, ' $1 ')
    .replace(/^(?:Developer[’']s\s+)?illustrated\s+/i, '')
    .replace(/\s+in the shared launch gallery$/i, '')
    .replace(/\s+/g, ' ')
    .trim();
  return description ? description[0].toUpperCase() + description.slice(1) : 'Project view';
}

export function projectPlanLabel(label: string): string {
  return label
    .replace(/\b(?:attributed |broker )?(?:home[- ]|unit[- ])?preview(?: image)?s?\b/gi, (match) =>
      match.endsWith('s') ? 'layouts' : 'layout',
    )
    .replace(/\bconcept(s)?\b/gi, (_, plural) => (plural ? 'designs' : 'design'))
    .replace(/\bdesign designs?\b/gi, 'designs')
    .replace(/\s+/g, ' ')
    .trim();
}

/** Keep drawing and route qualifications, without publishing the research workflow. */
export function projectMediaNote(note?: string): string | undefined {
  if (!note) return undefined;
  const sentences = projectPublicText(note).split(/(?<=[.!?])\s+(?=[A-Z])/);
  const display = sentences
    .filter(
      (sentence) =>
        !/form[- ]gated|unretrieved|not retrieved|not extracted|preview resolution|inspected broker|source browser|retrieved packet|could not|not accessible|\babsent\b|\bpending\b/i.test(
          sentence,
        ) &&
        !/\b(?:drawings?|sheets?|layouts?|floor plans?|packets?|plans?)\b.*\b(?:unavailable|absent|not available|not supplied|not published)\b/i.test(
          sentence,
        ),
    )
    .map(projectPlanLabel)
    .map((sentence) =>
      sentence
        .replace(/\billustrated\b/gi, 'shown')
        .replace(/\billustrates\b/gi, 'shows')
        .replace(/\billustrate\b/gi, 'show')
        .replace(/\billustration\b/gi, 'view'),
    )
    .join(' ')
    .trim();
  return display || undefined;
}

/** An unverified or missing figure is not useful as a displayed home area. */
export function projectPlanArea(area: string): string | undefined {
  return !/\d/.test(area) ||
    /unverified|unconfirmed|to be confirmed|disputed|not (?:printed|stated|given|published|available)|not supplied|unavailable|absent/i.test(
      area,
    )
    ? undefined
    : area;
}
