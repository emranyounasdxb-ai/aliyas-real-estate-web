# Visual assets

Composition refinement: `concept-villa-interior.png`, `concept-villa-detail.png`, `concept-apartment-interior.png` and `concept-apartment-detail.png` were generated with imagegen. Villa imagery uses `project-2.jpg` as an architectural reference; apartment imagery uses `project-3.jpg`. These are labeled inspiration/concept images, not actual photographs of any named development. The original generated assets remain in the Codex generated-images directory. Each developer record stores its own gallery references; shared bitmap assets do not share project data.

Richness update, 29 October 2026: `aliyas-architecture-arrival.png` and `aliyas-architecture-detail.png` were created with imagegen using the existing `aliyas-future-architecture.png` concept as the visual reference. These are architectural concepts, not verified project or office photographs. They are labeled as concepts in the hero, Perspective section and project galleries. Original generated files are retained in the Codex generated-images directory.

The destination map uses Natural Earth public-domain 1:50m country geometry from https://github.com/nvkelso/natural-earth-vector/blob/master/geojson/ne_50m_admin_0_countries.geojson. Projected SVG path and approximate city points are stored locally in `src/lib/uae-map-data.ts`; no external map requests occur at runtime. The map is a destination guide, not a survey or boundary authority.

Aliyas company photographs were explicitly declined by the owner. The About page instead uses the original supplied Aliyas gold logo, unchanged, inside a CSS company avatar. No team or office photography or synthetic staff portraits were added.

Developer logos are original artwork, displayed without color filters or redrawing:

- Emaar: https://www.emaar.com/cms-media/uploads/EMAAR-English-Logo.png (linked by the official Emaar brand guidelines).
- Sobha: https://sobharealty.com/themes/sobha_uplift/images/footer-logo.svg
- DAMAC: https://aliyasrealestate.ae/wp-content/uploads/2024/12/8.webp (existing Aliyas media item titled “Damac logo”).
- Aldar: official homepage image at https://images1.cmp.optimizely.com/assets/aldar-logo-frame-15px2x.png/Zz01ZDEwOTJkMGRjMTAxMWYwODY0ZTI2OTk2YzEyNDVkYw==
- Ellington: https://cf90163a.delivery.rocketcdn.me/wp-content/uploads/Ellington-Logo_Black-2.png (official Ellington homepage).
- Meraas: original inline logo SVG from https://meraas.com/.

The directory architecture images remain illustrative previews, identified as such. Project records remain placeholders pending approved project data.

Ajman Corniche: https://commons.wikimedia.org/wiki/File:Ajman_corniche.jpg, photograph by Narimich, CC BY-SA 4.0 (https://creativecommons.org/licenses/by-sa/4.0/). Original JPEG is saved at `public/images/ajman.jpg`; CSS crops and Next.js display resizing apply. Visible attribution and source/license links are included in the Ajman locations panel and navigation, with a full credit in the Privacy page. Rights in this photograph remain under CC BY-SA 4.0.


## Developer expansion — 30 October 2026

Twenty additional original developer logos were copied unchanged from the owner's legacy directory. See [developer-directory-migration.md](developer-directory-migration.md) for the exact asset URLs and profile mappings. The existing six logos were preserved. CSS contains each logo within its plate without cropping. Architecture and project gallery images remain illustrative placeholders.


## Owner-approved 30-developer network

Fourteen new logos are from the developers’ official websites. Original colors and paths remain intact; Alef uses its official sticky-header ink. Bloom’s HTML viewbox attribute was capitalized to valid standalone SVG viewBox. White Eagle Hills and Al Zorah artwork sits on a dark plate. Wasl and Al Zorah are limited to native-scale display to avoid enlarging small source files.

- select-group: https://cdn.prod.website-files.com/63b6a14f5c053488b83bcaca/63b6c006b5182366c1aedbde_Select-Group-Logo.svg
- nshama: https://nshama.ae/wp-content/themes/nshama/img/nashama-logo.svg
- deyaar: https://www.deyaar.ae/wp-content/uploads/2023/07/Logo_black.svg
- wasl: https://www.wasl.ae/sites/default/files/waslEnglishWhiteLogo1.png
- mag: https://mag.global/brand/mag-logo-512.png
- union-properties: https://upae.b-cdn.net/wp-content/uploads/2025/11/Bilingual-Secondary-Logo-OPT2-1.png
- eagle-hills: https://eaglehills.com/wp-content/uploads/2026/04/cropped-EH-logo-1.png
- modon: https://www.modon.com/ResourcePackages/ModonCorporate/Assets/src/Assets/images/modon-logo-black.png
- imkan: https://www.imkan.ae/themes/custom/imkan/logos/logo-en.svg
- al-hamra: https://alhamra.ae/media/e01pne1i/logo-red.svg
- al-zorah: https://www.alzorahcity.com/assets/img/logo-2.png
- rak-properties: https://www.rakproperties.ae/wp-content/themes/RAK/images/rak-logo.svg
- alef: https://www.alefgroup.ae/ (inline header SVG, official sticky ink)
- bloom: https://bloomholding.com/ (inline header SVG)

Directory-only corrections: Emaar uses the original glyph symbols from https://properties.emaar.com/en/ (unmodified paths); Aldar uses its official framed black SVG from https://www.aldar.com/en/explore-aldar/aldar-brand, asset https://images1.cmp.optimizely.com/assets/logo-black/Zz0wNjA0OGJiMDVkMjQxMWYwYWYzZDBlYzc2YmI1MDFlOA==. DAMAC uses its existing original image with blank canvas trimmed; logo artwork is unchanged. The homepage’s existing six assets/composition remain unchanged.
