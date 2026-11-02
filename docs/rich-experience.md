# Aliyas richness update — 29 October 2026

The eight approved enhancements are implemented locally:

1. Original Aliyas artwork inside a charcoal identity panel, accompanied by native SVG architectural line work. The logo is not redrawn or recolored.
2. Project galleries use one large image, two supporting concept images, a thumbnail strip and a keyboard-operated lightbox. Escape restores focus to the exact opening tile. Phone layouts retain the main image and thumbnails.
3. Three home collections — Waterfront living, Private villas, City residences — link to explicit subsets of the existing preview catalogue. Collection filtering combines with other filters and works with browser history. It does not merge the 90 developer-owned records into the sample catalogue.
4. Three scroll-driven architectural concept views on desktop/tablet, two on phones. Original hero composition remains; there is no timed autoplay or new pinned section. View buttons work with reduced motion.
5. An offline SVG UAE map with four selectable destination markers/labels synchronized with the existing destination tabs, imagery, details and listing link. Approximate city locations are labeled. No map service or API key is required.
6. All six original developer logos appear in the home strip with consistent display frames and appropriate original light/dark plates.
7. Selected cards have fine borders, soft depth and modest hover elevation. Charcoal identity panels, bright surfaces and restrained gold details adapt to both themes. Reduced motion removes decorative transforms.
8. Aliyas Perspective combines the original logo, architectural line work, a concept material detail and editorial copy. No company/staff photographs were added.

## Placeholder gallery ownership

The subsequent six-refinement update replaces generic tower supporting views with category-compatible villa or apartment interior/detail concepts. See `docs/composition-refinements.md` for the current visual and responsive behavior.

Every developer project has its own explicit `gallery` array in its owner JSON file. The primary preview comes from that record; the two additional views are shared **concept inspiration assets**, not actual photography of any named development. Reusing a concept asset does not link or merge project records. All real inventory and commercial data remain pending.

When approved data arrives, replace the relevant record's `image` and every `gallery` entry with its approved imagery and labels before changing `placeholder` to `false`. The 15 records per developer, stable IDs, ownership checks, noindex rules and scoped URLs are preserved.
