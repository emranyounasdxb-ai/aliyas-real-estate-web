# Aliyas identity and public contacts

Updated 29 October 2026. The user supplied the original gold logo and explicitly authorized using details from https://aliyasrealestate.ae/.

## Identity

- Clean canvas: `#F8F9F7`, with pure white surfaces.
- Ink: `#151917`; deep ink: `#0C100E`.
- Muted gold: `#B89B58` for borders and decoration. Light gold `#D4C391` buttons use charcoal text. Dark gold `#80632E` is used where small text requires contrast.
- Roboto Condensed headings, Lato UI, Hind body. All fonts are served locally.
- The higher-resolution original logo was obtained from the official site's own image srcset: https://aliyasrealestate.ae/wp-content/uploads/2024/08/ALIYAS-Gold-Footer-Logo-768x292.webp and saved unchanged as `public/brand/aliyas-gold-logo-hd.webp`. The user's 300px copy is preserved in the same folder.

## Design system

The latest direction replaces the earlier framed beige/pill layout. Global tokens live in `src/app/globals.css`, shared navigation/footer in `brand.css`, homepage composition in `future-home.css` and inner-page rules in `brand-pages.css`. Legacy token names alias the same new palette so functional components remain consistent.

- Layout: an open 90% grid, up to 1440px content width, full-width collection/footer chapters. Following user feedback, the centered header is compact: 76px at widths of at least 1100px and 60px below that breakpoint. Original logo artwork sits directly on white, centered independently of the navigation wings. Header styling lives in `src/components/header.css`; page offsets and collection pinning share `--header-height`. Hero spacing below the header is 20px on desktop and 18px on smaller screens.
- Navigation: three-city photographic projects menu, six developer profile links, catalogue search, saved projects and enquiry drawer. Mobile preserves centered branding and contains scrolling. GSAP entrances/exits respect reduced motion; Escape, focus return, outside click and Tab exit are supported.
- Type: condensed display headings, tight tracking and clear scale. Uppercase labels are reserved for navigation/section context; readable sentence-case copy explains actual actions.
- Shape:0–4px corners on content surfaces; circles identify standalone directional actions. Fine rules establish grouping instead of repeated card borders/shadows.
- Motion: masked headline entrance and architectural image wipe; a measured horizontal project sequence on desktop; native scroll-snap on mobile; city image crossfades. All essential content remains usable with reduced motion, keyboard navigation and without pinned animations.
- Content: retained project discovery, comparison, favourites, journal and contextual enquiries. Real business contacts/socials remain centralized. The architectural hero is a labelled concept; provenance is in `generated-future-hero.md`.

## Footer

The approved footer uses a compact white invitation strip above charcoal `#111512`, the original gold logo, Explore/Find your place navigation, official contact details, seven social icons and a back-to-top link. Ajman is included in footer destinations and both catalogue/home location filters. It currently has no sample listings; the empty state says so. Styling lives in `src/components/footer.css`; the footer uses the existing GSAP reveal system and respects reduced motion. Preview disclosures remain visible.

## Light and dark themes

The header moon/sun button switches the entire site between the existing light palette and a charcoal palette (`#111512` canvas, `#1A201C` surfaces, `#F3F4EF` text, muted gold). The original logo and photographs are preserved. Default is light; a saved choice is restored before paint from browser storage. Choice persists across routes/reloads and synchronizes between tabs; switching also works when storage is unavailable. Semantic overrides live in `src/app/themes.css`, with the small client control in `src/components/theme-toggle.tsx`. Fixed dark photo overlays and the charcoal footer retain their intended contrast.

## Company details

Phone, mobile, email, office and map destination were supplied directly by the user. The official home page confirms the office phone/email/address and its “A Project of Aliyas Group” footer attribution. These are centralized in `src/lib/contact.ts`.

## Social profiles

`src/lib/socials.ts` uses the visible social footer's Facebook, Instagram, LinkedIn, YouTube, TikTok, X and Pinterest destinations. The legacy site's structured data lists an alternative Facebook handle and two TikTok handles; the visible footer destinations were used rather than silently merging conflicting accounts. External account ownership/content was not independently authenticated.

The old site's property prices, handovers and investment claims were not imported as current inventory. Existing catalogue data and photography remain labelled illustrative until approved, current project assets and terms are available.

