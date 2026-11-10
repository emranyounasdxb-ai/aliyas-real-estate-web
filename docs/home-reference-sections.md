# Homepage reference sections — 10 November 2026

The user's two reference images are implemented as a five-panel buying journey after the featured collection and an architectural paper-plan visual at the end of the homepage. The latter takes the place of the previous plain closing CTA so there are not two consecutive closing enquiry sections. The hero, search, featured project data, developer logo marquee, personal brief, FAQ and journal are retained.

## Behaviour and assets

- Five continuous portrait panels on desktop. Smaller screens use native horizontal scrolling, previous/next controls and a current-step announcement. Every step links to a working search, saved collection, comparison or contextual enquiry.
- The closing section uses transparent artwork, live HTML text and the existing enquiry drawer. The WhatsApp link is retained.
- The journey uses the existing Cassia exterior and villa kitchen from The Wilds, plus owner-supplied journal images 082 (floor plan), 048 (purchase paperwork) and 059 (key handover). These are editorial journey visuals, not portraits of Aliyas employees or testimonials.
- Prepared 400/800px portrait WebP variants are mapped in `src/lib/home-reference-media.json`. Original project and journal files are unchanged.
- The paper-plan artwork has 640/1080/1536px WebP delivery variants with alpha preserved. Its lossless master is `public/images/inspiration/home-plan-master-870bef7888e7.webp`. Decoded-pixel comparison found zero differences in visible pixels or alpha; only unused RGB values in fully transparent pixels are normalized by WebP.
- All new images load directly from versioned static paths with the existing immutable asset caching. They use native lazy loading, intrinsic dimensions and responsive sources, with no blur placeholders or runtime image processing.
- Mobile scrolling respects reduced motion. No automatic carousel motion was added; the existing developer logo marquee remains unchanged.

## Generated artwork provenance

Mode: built-in image generation with the user-provided rolled-plan reference; transparent background enabled. No API key, CLI fallback or third-party service was used.

Reference: `C:/Users/emran/AppData/Local/Temp/codex-clipboard-da34fa76-c81b-4ea5-aa63-61faca7505ae.png`.

Original generated PNG (retained): `C:/Users/emran/.codex/generated_images/01a1bace-377e-7b13-a0a6-550c48014eae/exec-58a09d2c-6deb-4e34-8292-4445a2274db7.png`.

Prompt:

> Create a premium architectural advertising cutout for the ALIYAS real estate homepage. The attached image is a COMPOSITION AND STYLE REFERENCE ONLY, not a listing to reproduce and not a request to preserve its text. Create one original, photorealistic architectural diorama: an elegant contemporary UAE villa with two storeys and a roof terrace, warm ivory travertine, slim bronze details, glass balconies, natural planted garden, small driveway and one discreet silver car. The villa rises three-dimensionally from an unfurled cream architectural drawing sheet. The sheet forms the base plane with subtle precise architectural linework near its exposed edges; its left and right edges curl into substantial realistic paper rolls, like the reference. The road and garden emerge naturally from the paper surface. Three-quarter front view, beautifully realistic architectural materials, restrained soft daylight, nuanced contact shadows, convincing thick paper texture, no surreal floating objects. Show the whole building and both rolled edges within the frame with generous safe margins. Wide landscape 3:2 composition suitable for the visual half of a website section. Truly transparent alpha background outside the paper and architecture, preserving soft translucent contact shadows, no enclosing box or colored backdrop. No people, no text, no typography, no logos, no watermark, no labels, no prices. The scene is an editorial visual of a home taking shape from a plan, not documentary photography of a named property.

The visual is not attached to a named project, price or availability claim. Its alt text identifies it as an architectural concept.

## Validation

The production build passed, including TypeScript and 1,152 static routes. All 23 homepage checks passed in development. Four focused checks passed again against the production preview: developer motion and reduced motion, mobile journey navigation and desktop resizing, and working destinations/contextual enquiry with keyboard focus restoration. Form submissions were intercepted in tests; no real enquiry was sent.

Visual checks covered 320, 390, 768, 1440 and 1920px widths, plus light and dark themes. No browser errors or page overflow were recorded. Both new sections use the existing homepage typography and colors. The final tablet heading adjustment and compiled production assets were visually checked after the build.

The active local preview is `http://127.0.0.1:3000`, isolated build slot 1, build `SC2exhWcJSlsxdjeqSsTq`. The existing slot 2 preview was replaced only after the new build completed successfully. Temporary development processes were stopped and the preexisting TypeScript configuration snapshots restored.

Validation results and local preview screenshots are recorded in `artifacts/home-reference-sections/`, including `verification.json` and `new-homepage-sections.png`. No repository push or public deployment is included in this change.
