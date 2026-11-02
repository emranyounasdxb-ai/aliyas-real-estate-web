# Site decoration images

Imported from the owner's `C:/Users/emran/Downloads/Aliyas Real estate/Site images` folder on 31 October 2026. These are editorial illustrations, never project inventory, real office photography or team portraits.

## Placements

- Home: panorama, Aliyas perspective visual, four small process thumbnails and eleven lifestyle/destination tiles. The real Ajman photograph remains because there is no supplied Ajman illustration. Original home hero, project-card images and company logo DP remain intact.
- About: a new “More than an address” section uses three illustrated vignettes: daylight and space, community surroundings, and materials and shade. Original leadership logo portraits and animated brand card remain intact.
- Journal: the existing reading guide now includes a dining-room illustration and three small visual reading paths. All supplied article covers, article content and nine-per-page pagination remain intact.
- Contact: a coastal lifestyle illustration in a framed figure with its caption below the image. It is labelled illustrative and is not presented as the Aliyas office.

20 distinct images are used. `site-imagery-manifest.json` maps every source filename to its exact placement, hash, output size and pixel verification result. The page-only asset registry is `src/lib/site-imagery.json`; do not import it into developer or project records.

Later user-authorized placement: 15 existing optimized images also supply image-only slides in underfilled developer hero carousels. These slides have no project name, project ID, detail link or listing entry. They are defined separately in `src/lib/developer-hero-imagery.ts`, with an explicit stock-inspiration note in the hero. They never replace real project imagery or enter project records; the source folder and masters remain unchanged. See `developer-hero-stock-images.md`.

## Images intentionally held back

| Filename suffix | Subject | Reason |
| --- | --- | --- |
| 5 | Umm Al Quwain lagoon villas | No matching destination in the approved four-place home section |
| 7 | Fujairah coastal homes | No matching destination in the approved four-place home section |
| 15 | Rooftop pool | Reserve; no new amenities section needed |
| 18 | Office tower | Commercial imagery outside these residential placements |
| 20 | Flexible workspace | Commercial imagery outside these residential placements |
| 21 | Retail boulevard | Reserve; avoid adding a section only to fill it with an image |
| 22 | Logistics hub | Outside the residential page context |
| 24 | Hotel lobby | Could be mistaken for a real office or named development |
| 29 | Property consultation with people | Retain the owner's approved logo DP instead of invented team/client photography |
| 30 | Clinic reception | Unrelated to the residential page context |

The source folder is untouched. Held-back images are not served to visitors.

## Delivery

`scripts/prepare-site-imagery.mjs` imports the selected originals into content-hashed lossless WebP masters at their original 1672 × 941 resolution. Decoded RGB pixels are compared byte-for-byte with each source. All 20 comparisons passed. Combined selected PNG size: 55,676,767 bytes; lossless masters: 39,167,062 bytes (29.7% smaller).

The website delivers responsive Next Image renditions at quality 85 using AVIF/WebP negotiation, native lazy loading and reserved image dimensions. Responsive delivery is resized/compressed; the preserved masters remain lossless. An example 640px AVIF response measured 22,328 bytes. Content-hashed masters carry one-year immutable cache headers. Existing stable dependencies were used, with no new installs.

## Social update

Removed the closed X account from the central social registry at the owner's request. Footer, Contact page and homepage structured `sameAs` data now contain six active destinations. Narrow-screen footer icons use a centered three-by-two arrangement.
