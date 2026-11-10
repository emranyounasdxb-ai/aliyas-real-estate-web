# Local release verification — 10 November 2026

Target checkout: `E:/Projects/aliyas-real-estate-web`. Target remote:
`https://github.com/emranyounasdxb-ai/aliyas-real-estate-web.git`, branch `main`.
The user authorized a normal Git push after the required checks pass. This is not a deployment.

## Regression suite maintenance

The first release run exposed tests still targeting the retired six-project demo,
the removed homepage destination map, and the earlier pinned four-card home rail.
The diagnostic run was interrupted after recording that failure; it is not a passing
full-suite result. No tests have been skipped or marked expected-failure to permit a push.

The corresponding tests now exercise the approved replacement surfaces:

- 575 sourced project records, 15-card catalogue pages, current stable project IDs,
  and all seven emirate filters. Existing malformed-storage and legacy-redirect
  tests remain in place.
- The shared seven-city navigation instead of the removed homepage map, including
  keyboard navigation, exact filter destinations, layout containment and accessibility.
- The current photographic hero and its search link, two featured project profiles,
  and the five-step buying journey instead of retired hero view buttons and scroll pinning.
  Wheel, touch, keyboard, viewport changes, reduced motion and dialog scroll locking
  remain covered.
- The three newest dated journal stories and their actual covers instead of retired
  demo story placement and SVG images.
- Canonical reviewed project galleries and their complete thumbnail sets instead
  of three-image placeholder galleries. Wraparound, focus restoration, ownership,
  source links and project enquiries remain covered.
- The restored 30-developer marquee, including motion, pause/resume, hover,
  keyboard accessibility and reduced-motion behavior.

A real usability regression found during this work was corrected: homepage Save,
Compare and comparison-link targets now have a minimum height of 44px instead of 40px.
The broader run also caught catalogue price rows shifting with longer payment
terms, and visible homepage setting labels missing from their link names. Desktop
catalogue cards now share intrinsic row heights with CSS subgrid, retaining all
text; homepage and floor-plan button names include their visible labels.

Additional corrections found by the full suite:

- Navigation backdrop buttons no longer shrink on pointer-down, so clicks near
  the screen edge dismiss the menu reliably.
- Dark enquiry fields use matching border rules with enough specificity to remain
  consistent in both development and production CSS ordering.
- Two-column mobile metadata no longer applies the third-column handover span
  to the property type when a card has only two metadata values.
- The home search anchor uses the global header offset rather than adding a
  second 96px margin.
- Buying-journey buttons retain their intended step during native swipe inertia.
  A local idle timer handles completion because Lenis intercepts native scrollend
  events. New touch or wheel input cancels the pending button request.
- Catalogue Save and Compare controls now share a 44px height and one baseline;
  legacy comparison-wrapper spacing no longer offsets the Compare button.
- Mobile comparison selectors have a zero minimum intrinsic width. Long project
  names truncate within their own controls instead of widening the entire page.
- Mobile empty-state spacing keeps the 48px recovery action in the first 844px
  viewport, including before JavaScript hydration.
- Journal featured links include their visible caption in the accessible name;
  developer directory links use their visible content as their accessible name.

Already-completed legacy test cases were corrected to use the current developer
logo stage, canonical Acres/Gardenia records and the published travel-time wording.
The enquiry test now selects its own listbox, rather than a floor-plan select's
native options elsewhere on the page. Comparison assertions retain the actual
commercial price qualifications. No source facts or qualifiers were removed to
make a check pass. The active 575-page sweep was not edited.

The mobile accessibility matrix previously ran twelve full-page axe scans in one
45-second test (42.7 seconds even in its passing baseline). It is now parameterized
as four independent theme/width cases with the same 45-second per-case limit.
All twelve route scans, 15-card ownership assertions and overflow assertions are
unchanged. This brings the canonical suite from 192 to 195 cases; no checks are skipped.

## Recorded checks

- Unit tests: 20 passed (enquiry handling, journal collection/pagination, public copy).
- Production dependency audit: zero reported vulnerabilities.
- Project integrity: 575 protected projects, 1,724 manifests, 23,701 verified asset hashes.
- Card image audit: 575 distinct covers; zero exact, normalized-pixel or near duplicates.
- Final production build `hBRR7umFBVGHmqbdiYWV2`: successful, 1,152 generated pages.
- TypeScript: successful after restoring the normal generated-file configuration.
- Browser coverage: all 195 current cases have passing production verification,
  including the complete 575-page render/source-link sweep. No current case is
  missing, skipped or left failing. Coverage is reconciled by Playwright case ID
  across the full run and targeted correction runs, not presented as one clean run.
  The original full run recorded 169 passes and 23 failures; correction runs recorded
  37/39 and 26/27 passes, followed by all four parameterized mobile cases passing.
  Earlier failures and their traces remain available for audit. Detailed case/build
  provenance is in `release-browser-results-2026-11-10.json`.
- Staged-file audit: no oversized ordinary Git blobs and no credential/private-key
  file paths. Project media and responsive variants use Git LFS.
- Local preview: `http://127.0.0.1:3000`, isolated production slot 1, final build above.
  User-browser refresh was unavailable because local browser control is disabled
  in Work settings; the production page was verified through the browser test runner.
- Git LFS object and pointer integrity: `git lfs fsck --objects --pointers` passed.
  The staged inventory contains 37,335 LFS paths (36,935 distinct objects),
  35,949,111,226 bytes, with no missing downloads or checkout files.
- This is the pre-push verification record. Handoff uses a normal push to the
  repository and branch above. Remote SHA and CI results are recorded after the
  transfer; no deployment command is part of this handoff.

Detailed local logs and original test snapshots are under
`artifacts/release-verification-2026-11-10/` (ignored by Git).
