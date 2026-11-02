# Skill-led design refresh — 30 October 2026

## Strategy

The user explicitly requested the installed `landing-page-design` skill after rejecting the previous homepage. This pass applies that skill and its official `redesign-existing-projects` companion to the existing Next/React/GSAP site. Layout A (editorial hero plus purposeful sections) fits a property-discovery homepage. Primary audience: people exploring UAE off-plan homes. Primary action: Explore projects. Browsing and saved selections require no account; no commercial guarantee or invented proof is substituted for that factual reassurance.

## Concrete corrections

- Replaced the three-typeface mix with locally served Manrope through Next Font. Added a shared type/spacing/radius/motion layer, neutral white and charcoal surfaces, restrained original gold accents and Phosphor icons in the changed interface.
- Rebuilt the hero around a readable left-aligned, three-line headline, short supporting copy and one primary action. Kept the original centered logo and beach photograph, with a solid caption instead of an image gradient.
- Moved search, developer profiles and the selected project collection ahead of the cinematic skyline. Reduced the Home collection to three previews plus the destination map; the full catalogue remains accessible.
- Simplified project captions. Save, Compare and the selected comparison link remain visible, including a verified aligned 48px-high row at 320px.
- Added the skill's word-by-word tagline reveal. IntersectionObserver limits observation to visible sections; scroll work is coalesced with requestAnimationFrame. Shared GSAP CustomEase matches cubic-bezier(0.22, 1, 0.36, 1).
- Kept the scroll-driven skyline, proportional section exits, circle journey and staggered image mosaic. Removed animated border-radius/clip-path from changed sequences. No autoplay was added.
- Reduced the benefits to four useful outcomes, standardized service disclosures, and refined Journal, seven-question FAQ and final CTA. The Home finale repeats Explore projects; the previous duplicate footer invitation remains only on inner pages.
- Fixed the mobile menu's containing-block issue so it fills the available height. Improved menu animation, keyboard focus and loading feedback. The FAQ uses an opacity transition rather than height tweening.
- Refined light/dark surfaces and mobile typography. Corrected the tablet hero's orphaned line at 768px, and shorter collection/FAQ wording avoids awkward wraps.
- Added an informational Website terms page and footer link; it describes this local preview and does not create property purchase terms.

## Preserved

Original gold logos, company logo DP, centered compact header, footer contact/column structure, developer hero geometry, all six developer collections with 15 separately owned records, and scoped project detail URLs. No real inventory, prices, personnel photos, testimonials or credentials were added. Existing preview disclosures remain. No dependency installation or public deployment occurred.

## Verification and evidence

The optimized build completed with 120 generated pages (including the new terms route). Final build ID: `K4yDRotBo8z_kUpEwzUR1`. Hidden production process PID 67196 serves `http://127.0.0.1:3000` at this handoff. Home, terms, Emaar and Emaar Project 15 return HTTP 200. Production stderr and the current browser warning/error log are empty.

Fresh browser inspection covered 320/390px mobile, 768px tablet, 1024px laptop and the normal desktop viewport, with light and dark examples. No document horizontal overflow was found in the checked states. At 768px, each final hero heading line is 40px high (120px total). At 390px, the menu panel fills the available viewport beneath the header; Escape closes it. The primary collection anchor, Save/Compare toggles and cleanup, Abu Dhabi + Apartment search results, keyboard FAQ opening and enquiry opening/closing were checked. Invalid email input produces native typeMismatch and retains focus in the email field, preventing submission; no enquiry was sent. The Emaar profile shows 15 unique owned project links and its original curved hero.

Reduced-motion behavior was source-reviewed: pinned sequences are skipped, tagline words remain readable, menu movement is suppressed and the loading bar stops animating. Browser media emulation was unavailable; physical-touch testing, runtime reduced-motion emulation, a fresh complete accessibility suite and Lighthouse were not performed in this pass. Older test counts and performance scores do not describe this refresh.

Actual screenshots are in `artifacts/skill-redesign/`. Before and final desktop images both measure 1380×941. The before/after board scales each equally without changing their content. The 390×844 browser viewport produces a 375×812 captured content image through this browser tool; that difference is retained rather than misreported as a different tested breakpoint.

Evidence: `before-desktop.png`, `after-desktop-final.png`, `before-after.png`, `after-mobile-final.png`, `after-tablet-final.png`, `collection-desktop.png`, `mobile-menu.png`, `selected-320-dark.png`, `tagline-320-dark.png`, `developer-768.png`, `faq-1024.png`.

## Content dependencies

Developer-approved project copy, images, availability and commercial details are still required to replace previews. Production enquiry delivery and persistence remain configuration dependencies. These were not fabricated or silently published.
