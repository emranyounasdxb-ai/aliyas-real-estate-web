# Avelia imagery approval sample

**Latest decision, 4 November 2026:** the user explicitly resumed the approved complete pattern across all575 pages. See `project-page-enhancement-resume.md` and the live `project-page-enhancement-queue.json` for current counts. Do not ask for sample approval again. Historical approval-pending and shutdown-pause notes below are superseded.

3 November 2026. Scope: **one project and its listing card**, not a rollout across the catalogue.

- Detail page: http://127.0.0.1:3000/developers/emaar/projects/avelia
- Card: http://127.0.0.1:3000/developers/emaar?page=4#developer-projects
- Protected owner/identity: Emaar, `emaar-project-49`, `avelia`.
- Official source: https://www.emaar.com/en/properties/avelia-at-the-valley

## Images and presentation

Six images were retrieved from the original CMS assets linked by Emaar's Avelia page and visually inspected. They are developer renders of the proposed project, not photographs of completed buildings. The gallery credits Emaar and links to its project page.

The page uses a community hero, two supporting images, six selectable thumbnails, an uncropped full-image viewer and two interior images within the overview. The listing card uses the daylight landscape/villas exterior from the same collection. The gallery supports keyboard navigation, Escape dismissal and native touch swipes.

| Role | Original Emaar asset |
| --- | --- |
| Community hero | https://www.emaar.com/cms-media/uploads/426917_hero_slide_0_1dbd1ea039_prod.jpg |
| Living and dining | https://www.emaar.com/cms-media/uploads/426908_interior_0_52bdc8fdc5_prod.jpg |
| Pool setting | https://www.emaar.com/cms-media/uploads/426905_exterior_1_6dee242781_prod.jpg |
| Bedroom and terrace | https://www.emaar.com/cms-media/uploads/426911_interior_1_bb86450a9f_prod.jpg |
| Family living | https://www.emaar.com/cms-media/uploads/426914_interior_2_36dacd59a2_prod.jpg |
| Listing card / landscape and villas | https://www.emaar.com/cms-media/uploads/426902_exterior_0_4fa8fcc839_prod.jpg |

## Quality and scope

The downloaded JPEG masters are preserved byte for byte, including their original dimensions and metadata. No source resizing, upscaling, recolouring, generated replacements or watermark removal was performed. SHA-256, dimensions, original URLs and byte counts are recorded in `src/data/project-media/emaar/avelia.json`. The hero is 1620 × 832; the other five originals are 1024 × 768. The existing Next Image service delivers responsive AVIF/WebP variants at quality 85. The measured desktop hero variant was 82,443 bytes versus its 1,709,986-byte original; this is an image-delivery observation, not a page-speed score.

Only Avelia opts into `src/lib/project-media.ts`. The canonical 575 project records, identities, aliases, researched facts and original media baseline remain unchanged. Other cards and pages retain their current imagery. The shared card renderer uses the selected project's official media only when that explicit registry entry exists. The 15-slide developer heroes and 15-card pagination remain unchanged.

This is a local design approval sample. No deployment, publication, Git push or bulk image rollout is authorized by this sample task. Publication rights and broader imagery rollout remain separate from the visual review. See Emaar's linked asset usage policy before any public use.

## Verification

Evidence is retained locally in `artifacts/project-media-pilot/`. Initial screenshots taken before image decoding were incomplete and are not used as before/after quality evidence. Final screenshots wait for image decoding. Tests cover source-byte preservation, isolation to one owner, responsive light/dark layouts, accessible gallery controls, enquiry context and the updated card. Final production build and results are recorded in `docs/verification.md` after the touch-dismissal recheck.

Global project-card image/status badges have been removed at the user's request, including Emaar render, Illustrative image, Design preview and Off-plan; developer attribution remains. Final verification: optimized build zHEpMi6uu8svKapnrhiax, preview PID44360, eight scoped tests passed (41.4s), plus HTTP/image-delivery smoke and visual card review. No other project's imagery was changed.

## Location and connectivity sample — 3 November 2026

Avelia now has a sourced location section at `/developers/emaar/projects/avelia#location`. The enhancement is restricted to protected ID `emaar-project-49`; other projects retain their existing location content. `src/data/project-locations/avelia.json` records field provenance and community scope independently of the protected canonical records.

- Community/road and map pin: official Avelia page, https://www.emaar.com/en/properties/avelia-at-the-valley, checked 3 November 2026. Its rendered page data supplies latitude25.005951/longitude55.462341. This is the developer-published project map pin, not a surveyed villa entrance. Raw source evidence is retained locally as `artifacts/project-media-pilot/avelia-source.html`.
- Regional diagram: the same page's map fallback asset, https://www.emaar.com/cms-media/uploads/04_MAP_2400x1600px_3bf197e315.jpg. Native2400×1400 JPEG preserved byte for byte; SHA256 and byte count recorded in the location manifest. Full-size opening is available. The caption explains the diagram is not to scale and future transport lines may not be operational.
- Travel estimates: developer-linked brochure https://www.emaar.com/cms-media/uploads/Ovelle_and_Avelia_brochure_62bdfb4140.pdf, physical page5. Downloaded and visually checked using Poppler rendering (`location-brochure-page5.png`): Rugby Sevens5min, Dubai Outlet Mall8min, Dubai International Airport20min, Downtown Dubai25min. This shared linked file includes Ovelle-labelled residence pages, as already noted in the earlier research. Only its explicitly community-wide connectivity panel is used; no Ovelle residence facts are assigned to Avelia. These are community estimates, not live traffic, measured kilometres or a promised journey from a particular villa. No kilometre figures were invented.

A native keyboard-accessible disclosure opens an OpenStreetMap embed at the sourced pin. The content security policy narrowly permits frames from `https://www.openstreetmap.org`; other directives remain unchanged. GET-only Google Maps directions link provides a fallback. No API key, user geolocation, new dependency, deployment, push or enquiry submission. Initial map-test failure came from an outdated Leaflet selector; inspection confirmed OpenStreetMap now renders MapLibre. The corrected test checks the actual map/marker and successful map tile responses. The interactive map was independently visually reviewed with loaded tiles.

Final location verification: production build `PwstUZ98UY9dnav9cFd_H`, PID36836, all9 scoped browser cases passed in54.6s. Fresh natural mobile/desktop viewport screenshots and loaded interactive tiles were visually reviewed; location anchors retain the existing sticky-navigation offset. No public rollout.

## Floor plan sample — 3 November 2026

Avelia has an on-page floor plan section and section-navigation entry. All six own-project layouts from the previously verified Avelia plan PDF are selectable: four-bedroom TypeA/B, five-bedroom Medium TypeA/B, five-bedroom Premium TypeA/B. Complete sheets show ground, first and second floors; no diagram content, developer notices or logos were cropped or altered. Existing researched built-up areas are reused without new measurements or calculations. The source is honestly labelled an Emaar document hosted by Mitchell’s, not an official-domain download. The official Avelia page's conflicting Ovelle-labelled download remains excluded from these residence plans.

Source: https://www.mitchellscommercialrealty.com/downloads/ovelle-avelia/AVELIA_TV_FLOORPLAN.pdf. Ordinary source re-fetch on3November returned HTTP200 and SHA256 `402a1886cf249fe7dc3b73869628db52b776495d56a06c9104a4236c299df9c6`, matching the previously researched original. That original PDF is preserved byte for byte locally for viewing/downloading. Complete physical pages2–7 were rendered with Poppler `pdftoppm -f 2 -l 7 -scale-to 2400 -png`; each2400×1778 lossless PNG was visually checked for AVELIA ownership, type, area and all three floors. Asset hashes, physical page numbers, source URL and review date are recorded in `src/data/project-floor-plans/avelia.json`. This is document rendering, not generated or reconstructed floor plans.

The on-page preview preserves the entire sheet and loads only the selected layout. The modal offers full-sheet fit and native2400px original-size scroll/pan, keyboard/Escape/focus restoration, contextual PDF page links and document qualifications. No new dependency or external PDF iframe required. Only Avelia opts into the sample; all575 canonical records and other projects' media remain unchanged. No push/deployment/bulk rollout.

Floor-plan verification complete: ten scoped cases passed before the final touch-close correction; both floor-plan cases passed again after it (19.7s), including native pan/immediate close and keyboard/full-sheet-fit checks. Current optimized local build `U-9BJ_Ak7Hy0TCsUHHhKf`, preview PID68896. Fresh desktop fit/mobile viewport screenshots reviewed. No bulk rollout or publication.
