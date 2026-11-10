# Project card image audit — 8 November 2026

All 575 public project card covers across 30 developers were checked by file contents, normalized pixels, whole-image and crop fingerprints, and visual contact-sheet review. Six legacy illustrative covers were reviewed separately and were distinct. The original 575-project research and completed rollout checkpoint remain unchanged.

The initial audit found seven byte-identical groups affecting 16 projects. Further visual and perceptual review found nine pairs of repeated or very similar compositions. Eighteen covers were changed across eight developers. Every replacement is an existing image published in that project’s own reviewed gallery, with its original source URL, hash, bytes, alternative text and image positioning retained. Related releases sometimes share developer concepts: a different cover does not imply exclusive photography or different delivered architecture.

## Final asset validation

- 575 selected files decoded and freshly hashed; 575 distinct SHA-256 hashes.
- Zero invalid ownership, source, byte count, hash or saved-selection checks.
- Zero exact-byte or normalized-pixel duplicate groups; zero near-match pairs at the documented whole-image/crop thresholds.
- All 575 original gallery arrays are unchanged. Selection inputs (`cardName`) match each changed manifest (`cardImage`). Avelia and Valia are documented early-media exceptions without rollout selection files; their unchanged owned manifests and selected bytes are validated.
- Similarity detection is a review aid, not proof that all future crops or edits will be detected. Visual review covered every current card, including broad-threshold false positives and the very similar Ellington Views and Samana Greenfield compositions.

Run `node scripts/audit-project-card-images.mjs` from the repository root for the full audit, or add `--no-perceptual` for the selection/bytes/exact-duplicate guard. The script never fetches or alters assets; its versioned fingerprint cache is optional and current bytes are always rehashed. Exact duplicates or invalid selections fail the command; perceptual candidates require human review. Reports and contact sheets are under `artifacts/project-card-uniqueness/`.

## Applied cover selections

| Developer / project | New cover | Existing source |
| --- | --- | --- |
| emaar / grove-ridge | Pool courtyard | [Source](https://www.emaar.com/cms-media/uploads/429512_exterior_2_4fb1b3da12_prod.jpg) |
| emaar / elva | Townhouses at dusk | [Source](https://www.emaar.com/cms-media/uploads/396791_exterior_0_7d55d00540_prod.jpg) |
| emaar / kaia | Corner outlook | [Source](https://www.emaar.com/cms-media/uploads/396880_exterior_2_5211616b59_prod.jpg) |
| emaar / equiterra-2 | Aerial view over the Equiterra 2 linear park | [Source](https://www.emaar.com/cms-media/uploads/425754_property_Hero_Image_9fceac0575_prod.jpg) |
| emaar / sera-2 | Pool and planted terraces | [Source](https://www.mitchellscommercialrealty.com/downloads/sera-1-sera-2/SERA2_RYM_BROCHURE.pdf#page=6) |
| emaar / altan | Gardens | [Source](https://www.emaar.com/cms-media/uploads/410798_exterior_0_e427e4dbb2_prod.jpg) |
| emaar / chevalia-estate-2 | Garden elevation | [Source](https://www.emaar.com/cms-media/uploads/420708_hero_slide_0_46e776d223_prod.jpg) |
| emaar / palace-residences-hillside-b | Landscaped walkway and pavilion | [Source](https://www.emaar.com/cms-media/uploads/PRO_EXT_3_b9fabb44fa_prod.jpg) |
| bloom / bloom-living-marbella | Shared villa-series 6 BR frontage concept | [Source](https://bloomholding.com/application/files/9717/5853/1427/BL_Marbella_EBrochure_Web.pdf#page=16) |
| imtiaz / sunset-bay-3-by-imtiaz | Shared developer concept · roof pool | [Source](https://imtiaz.ae/uploads/property/exterior_gallery/29/9.jpg) |
| imtiaz / sunset-bay-4-by-imtiaz | Shared developer concept · building and wider district | [Source](https://imtiaz.ae/uploads/property/exterior_gallery/32/4_E.jpg) |
| wasl / cedarwood-estates-south | the proposed South four-bedroom villa rear | [Source](https://www.rapiddealsuae.com/jumeirah-golf-estates/documents/cedar-brochure.pdf#page=27) |
| ellington / ellington-views-ii | the Ellington Views II beach club deck | [Source](https://www.mitchellscommercialrealty.com/downloads/ellington-views-ii/ELLINGTON_VIEWS_II_BROCHURE.pdf#page=16) |
| sobha / the-serene | Shared retail frontage below the towers | [Source](https://sobharealty.com/sites/default/files/2025-08/SOBHA%20CENTRAL%20-%20THE%20SERENE%20BROCHURE_0.pdf#page=18) |
| sobha / coraline-beach-residences | Landscaped Coraline courtyard at dusk | [Source](https://sobharealty.com/sites/default/files/2024-10/Coraline%20Beach%20Residences%20Brochure_7thOct_compressed.pdf#page=32) |
| samana / samana-ocean-pearl-2 | the proposed complete building and roads from above | [Source](https://www.samanadevelopers.com/storage/projects-files/2025/09/01/10/45/e654ce95f17a218653f26a0b299c7855.pdf#page=6) |
| deyaar / parkfive-ember | the shared pool deck after dusk | [Source](https://www.deyaar.ae/wp-content/uploads/2025/09/Ember_ParkFive_Brochure.pdf#page=24) |
| samana / samana-greenfield-2 | the proposed development setting | [Source](https://www.samanadevelopers.com/storage/projects-files/2026/08/18/01/56/8ccf8c9cde3cd2954a7415686541b8f5.pdf#page=11) |

The shared selection updates catalogue and developer cards, developer hero slides, related cards, and owned curated/saved cards. After the follow-up below, it also controls the initial detail-page image and OpenGraph. Original source files, floor plans, location data, protected IDs/slugs and researched project text were not changed.

## Browser validation

Optimized production build `hNMVxVv5AAVMZh4xo0d7M` passed, including TypeScript and 1,052 generated pages. The local preview runs on `http://127.0.0.1:3000` (Node26, PID49264).

All five Playwright tests in `project-card-images.spec.ts` and `catalogue-rollout.spec.ts` passed. They cover all575 unique owned selections; the Malaga/Marbella and Vista/Grove cards at1440px and390px; image decoding, alt text, links and keyboard focus; catalogue/saved resolution, pagination and both themes at320/390/768/1024/1440px with reduced motion and accessibility checks. A separate browser pass loaded all18 changed catalogue covers and confirmed each rendered source matches the updated manifest, with zero page errors. Bloom’s updated hero was also visually checked at1440px and390px. No form behavior changed; no enquiry was submitted.

Evidence: `artifacts/project-card-uniqueness/audit-final.json`, `browser-tests.log`, `browser-review.json`, `bloom-corrected-cards.png`, `emaar-corrected-cards.png`, and desktop/mobile card and hero screenshots. `git diff --check` passed. This change is local and has not been committed or pushed.

## Follow-up: detail-page opening image

The user reported that images still appeared unchanged in Chrome. Fresh HTTP responses and the user's actual Chrome tab both confirmed updated listing covers; the detail pages still opened with `media.images[0]`. In particular, Malaga and Marbella shared the same original opening lakeside concept despite having different selected card covers. This was a display-selection mismatch, not evidence of a stale server or failed asset replacement.

The owned project page now derives a cover-first display gallery from `cardImage`, retaining every other original image in order. The manifest inventory and source bytes stay unchanged. The gallery is keyed by project ID so route changes reset its selection, and OpenGraph uses the same cover. This supersedes earlier notes about the displayed opening image remaining at original gallery index zero. Regression coverage checks the card-to-detail transition, all retained images, OpenGraph, keyboard image browsing and restored focus at desktop/mobile widths.

Follow-up build `NgWXdb-RyEZory_22TrBL` passed; current local preview PID35824. All575 generated detail pages have the selected card cover as both their opening image and OpenGraph image (`detail-html-check.json`). Six existing/related browser checks passed. The new card-to-detail check initially timed out decoding an image during a temporary optimizer delay; raw assets and HTML remained healthy. Once optimization recovered, its focused rerun passed all four sample projects at1440px/390px in31.5seconds (`detail-cover-recheck.log`), completing all seven checks. Subsequent optimized-image probes returned200 in33–634ms. Large cache initialization is a possible explanation for the startup delay, not a confirmed root cause; no optimization settings or source assets were changed. The user's Chrome now shows the updated Marbella opening image in a retained preview tab. No commit or push was made.
