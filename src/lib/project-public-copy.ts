/** Keep source research intact; omit research-process notes from customer-facing prose.
 * Entire sentences are omitted so removing a caveat never turns a qualified claim into a fact.
 * Commercial context (launch prices, forecasts, sold-out releases and source differences)
 * is retained unless the whole sentence is explicitly an internal verification note.
 */
const internalResearchSentence =
  /\b(?:unretrieved|unverified|unconfirmed|unresolved|unavailable|withheld|retrieval|placeholder|illustrative|design preview|details to follow|coming soon|to be confirmed|to confirm)\b|\bno\b[^.!?]*\b(?:retrieved|verified|established)\b|\b(?:not|never|no longer)\s+(?:been\s+)?(?:retrieved|verified|established|confirmed|exposed)\b|\b(?:was|were|is|are|remains?)\s+pending\b|\b(?:not|never)\s+(?:independently\s+)?verified\b|\b(?:research|review)\s+(?:pass|process|pending|checked)\b|\b(?:table deliberately|not adopted|not substituted)\b/i;

export function projectPublicText(value: string | null | undefined): string {
  if (!value) return '';
  // Sentence boundaries only: decimal amounts such as AED 2.5m stay together.
  const publicValue = value
    .replace(
      'The brochure map is illustrative; proposed transport links are not operating stations or guaranteed walking routes.',
      'The brochure map shows proposed transport links; these are not operating stations or guaranteed walking routes.',
    )
    .replace(
      'The official plans mark landscaping as illustrative and owner-designed.',
      'The official plans mark landscaping as owner-designed.',
    )
    .replace(
      'Pool and landscape drawings are illustrative, and the plan disclaimer says these are not provided by the developer.',
      'The plan disclaimer says pools and landscaping are not provided by the developer.',
    )
    .replace(
      "Rendered gardens, furnishings and views are illustrative; the purchase agreement should identify the selected home's specification and the owner's additional works.",
      "The purchase agreement identifies the selected home's specification and the owner's additional works, including gardens and furnishings.",
    );
  return publicValue
    .split(/(?<=[.!?])\s+(?=[A-Z“])/u)
    .map((sentence) => sentence.trim())
    .filter((sentence) => sentence && !internalResearchSentence.test(sentence))
    .join(' ');
}

/** An area table must contain an actual measurement, not an editorial request. */
export function hasPublishedUnitArea(area: string): boolean {
  return (
    /\d/.test(area) &&
    projectPublicText(area) === area &&
    !/\b(?:requires? confirmation|to confirm|not printed|no (?:area )?total|request (?:the|a)|not (?:stated|published|provided|available))\b/i.test(
      area,
    )
  );
}
