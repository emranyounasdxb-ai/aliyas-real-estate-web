# Reference-led Home redesign — 30 October 2026

The user requested the homepage layout and whole-section entrance/exit choreography from [Real Estate Agency on Dribbble](https://dribbble.com/shots/23924439-Real-Estate-Agency). The actual 38.05-second video was downloaded through the accessible page and reviewed as frames and transition sequences. The initial verification page disappeared when the reference was reopened visibly; no CAPTCHA was solved or bypassed.

## Retained implementation

- A white split hero pairs three-line editorial typography with a licensed beach-level Burj Al Arab photograph, restrained rounded controls and the original compact Aliyas header.
- The skyline begins as a smaller rounded image, expands while pinned beneath the header, and releases into the dark property gallery. Marquee text follows scroll progress.
- The gallery is a two-column image composition with five illustrative project previews and an interactive four-destination map. Save/Compare remain connected to the existing catalogue. On phones it becomes a single column.
- Whole opaque sections pass from one to the next: the outgoing panel scales proportionally and gains rounded corners as the incoming sheet rises from underneath. This includes collection → company story → services, then the dark journey → white values, and the final editorial sections.
- Service disclosures enter at staggered horizontal offsets. Three circles move from a horizontal row into a triangular intersection, then merge into one circle before the dark section releases. Scroll reverses the sequence; there is no autoplay.
- Staggered architectural/lifestyle images, useful project search, developer links, Journal and FAQ complete the page. Home uses scoped styles; inner-page design is unchanged.

Main implementation: `src/app/page.tsx`, `src/app/luxury-home.css`, `src/components/luxury-home-motion.tsx`, `src/components/home-destination-card.tsx`; the style import is in `src/app/layout.tsx`.

## Corrections made during verification

- GSAP cleanup uses a layout effect so pinned wrappers are removed before React removes their elements.
- The circle scene uses transform pinning within its animated parent. Its start calculation removes the parent entrance translation; the desktop scene now pins at approximately 76px, matching the header.
- Mobile circle centering uses layout margins rather than a CSS translate that GSAP could absorb into its animation coordinates. Final circles and result text share the same vertical center.
- Initial deep links compensate for animated card entrance offsets. The map lands at about 84px on mobile, leaving the 60px header and 24px breathing space.
- Accordion toggles refresh scroll geometry. Responsive matchMedia contexts revert cleanly when crossing breakpoints. Reduced-motion preferences render ordinary unpinned document flow.
- Mobile native search selects use 16px type. Saved links use the catalogue's actual `saved=1` parameter. Screen-reader selection feedback remains contained within its card.

## Verification and limits

The final production build and TypeScript pass with 119 generated pages. Browser review covered 320/390px phones, 768px tablet, 1024px laptop and 1440px desktop, including light/dark examples, no horizontal overflow, compact header geometry and image composition. Native browser scrolling/keyboard input verified panorama pin/expand/release, circle row/triangle/merge/release and whole-panel handoffs. At 320px the final circle centers and the result stage center agree vertically (354.92px in the recorded exit state).

Production interaction checks covered search (Abu Dhabi + Apartment reaches the filtered Gardenia Bay result), Ajman map selection, Save/Compare and removal of temporary selections, service disclosures, FAQ expansion, mobile menu/Escape, enquiry open/Escape/focus return, saved-catalogue navigation and direct section links. No production-origin console error was observed. A development-only HMR DOM-removal error from an earlier intermediate implementation remains in the browser's old log; it was addressed by layout-effect cleanup and was not observed in production navigation.

Reduced motion is implemented and source-reviewed, but no new runtime media-emulation or physical/native-touch-device suite was run in this pass. Earlier 48-case test results and Lighthouse 84/100/100 describe the previous homepage, not this rebuild. No fresh Lighthouse score or complete automated accessibility certification is claimed.

The original header/footer, Aliyas logo, company logo DP and developer hero source are preserved. Static ownership checks confirm six developer files, each with 15 projects and zero mismatched developer owners. Home, Emaar profile and its owned Project 15 return HTTP 200. All project photography remains explicitly illustrative; approved inventory and actual project images are still required. SMTP/CRM delivery remains a separate configuration dependency. No package installation, public deployment, staff photo, invented metric or commercial promise was introduced.

## Evidence

`artifacts/reference-home/` contains the reference contact sheets, desktop/mobile screenshots, skyline entry/expanded states, gallery/story and story/services handoffs, circle triangle/exit states and final mobile circle states. `before-1440.png` and `before-390.png` are preserved captures from the prior approved seven-change homepage; after captures show this build. Comparison-board captions disclose the viewport differences. Screenshots are actual browser captures, not generated mockups.

The optimized local preview remains at http://127.0.0.1:3000. This implements the reference's composition and motion language using Aliyas content and existing assets; it does not claim identical photography, copy or frame-for-frame pixel equality.

## Second reference correction pass — 30 October 2026

The user rejected the first pass as insufficiently close. Fresh comparison with video frames 0, 5, 11, 14, 17, 26, 29 and 34 identified specific differences, which were corrected:

- Replaced the aerial hero angle with a licensed beach-level photograph, simplified the heading to three lines and removed the extra supporting paragraph. Original brand navigation remains intact.
- Joined the expanding skyline directly to the charcoal gallery, removed the oversized visible collection introduction and simplified project overlays. Save/Compare remain available on hover/focus and are continuously visible on narrow/coarse-pointer layouts.
- Enlarged all four service pills equally: 116px desktop, 84px tablet and 70px at 390px. Their thumbnails, labels and arrows now follow the reference proportions.
- Rebalanced the company story and its three factual site-capability rows; original company logo DP is retained. No invented business metrics or team photos were added.
- Corrected whole-section exits from horizontal-only scaling to proportional scaling (0.94 desktop / 0.98 mobile). The circle action appears near the end of the merge, rather than being visible throughout.
- Replaced the short image grid with twelve cards arranged in five staggered desktop columns and a central logo/action. It becomes three columns on tablet and two on mobile. Increased image source sizes to suit the covered portrait frames.
- Matched the reference's seven-item benefits rhythm and seven-row FAQ in a separate pale panel. Search/developer discovery follows the image gallery, preserving its functional controls.

The final optimized production build and TypeScript pass, generating 119 pages. Current preview process is PID54180 on port3000. Fresh browser checks cover 320px dark cards/menu/enquiry, 390px hero/actions/anchor, 768px composition, 1024px circle progression/FAQ and 1440px desktop geometry. No horizontal document overflow was found. The collection anchor settles at 84px on the 390px viewport after smooth scrolling completes; an intermediate position was not a defect. Save/Compare toggles work and temporary selections were cleared. Menu/enquiry Escape and FAQ keyboard activation work. The current browser error/warning log is empty.

Evidence is in `artifacts/reference-home/pass2/`: `before-hero.png` and `after-hero-final.png` are actual 1440×900 captures; gallery, services, five-column mosaic, 390px hero, 320px dark gallery, 768px hero and 1024px FAQ captures record the other changes. A frame saved as `laptop-1024-panel-exit.png` shows the FAQ following native scrolling, not the circle exit; do not use that filename as proof of an exit frame. Raw screenshots are unchanged. Reduced-motion behavior was source-reviewed; no new emulated-media, physical touch, complete automated suite or Lighthouse result is claimed. No further runtime source changes were needed after the final build.
