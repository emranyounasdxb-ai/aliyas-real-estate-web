# Homepage wheel and reveal correction — 10 November 2026

## Reproduced causes

The new horizontal buying journey had `data-lenis-prevent`, which bypassed Lenis for every gesture. Lenis' stylesheet also supplied `overscroll-behavior: contain` on both axes. With the pointer over the photos, a vertical 600px wheel event moved the document by 0px at both 390px and 1440px widths. The actual local browser had normal motion preferences, so this was not a reduced-motion setting.

The homepage had zero `data-reveal` targets. The shared motion provider still existed, but the current homepage markup had never connected its sections to that observer. Only the separate tagline and developer marquee had their own motion.

## Changes

- The journey now excludes only horizontal gestures from Lenis, using `data-lenis-prevent-horizontal`.
- Its vertical overscroll behaviour is explicitly `auto`. Its vertical overflow is `hidden`, so the 32px reveal transforms cannot temporarily create an inner vertical scroll area and intercept a touch gesture.
- Current homepage headings, project imagery and descriptions, journey panels, service steps, FAQ rows, journal entries and the plan section are wired to the existing visibility observer.
- Home reveals move 32px and fade over 700ms. Related items have a capped 320ms stagger. They play once on entry and clear their inline opacity/transform afterward. Images retain their normal fit and static responsive sources.
- Keyboard focus immediately reveals its containing content. Motion preference changes and client navigation clean up pending tweens, observers, event listeners and styles. Reduced-motion users retain fully visible content and native scrolling.
- Developer logo scrolling and horizontal journey browsing are retained.

No package or image changes were needed. The Lenis behaviour was verified against the installed 1.3.27 source and its [official documentation](https://github.com/darkroomengineering/lenis/blob/main/README.md).

## Regression coverage

`tests/home-scroll-motion.spec.ts` exercises real vertical and horizontal wheel input at 390/1440px, both motion preferences, vertical/horizontal emulated touch gestures, an observed intermediate animation frame, one-time reveal completion, keyboard focus, enquiry closure and client navigation back to the homepage. Existing journey controls, link destinations and developer marquee tests are also retained.

The first touch run caught the temporary vertical overflow during image reveal. After the overflow correction, the same touch case passed without changing its expectations. Production verification is recorded in `artifacts/home-scroll-fix/`.

The first production build `yChmclVH2bvyjDXrsCIzf` passed TypeScript and all 1,152 static routes. Ten checks passed; the client-navigation case exposed delayed motion initialization moving an already visible link between pointerdown and mouseup. Initialization now prepares only offscreen content, preserving the position and visibility of anything the visitor can already see. Immediate focus reveal is also limited to `:focus-visible`, so keyboard users get immediate visibility without moving a link during a pointer click.

The final scroll-fix build `7_Jwa80BJKYzlab29eZWl` passed TypeScript and all 1,152 static routes. All 11 targeted tests passed against this production build in 49.6 seconds. The user's existing browser was refreshed and an actual wheel gesture over the photos advanced the document from 3,534px to 4,372px; the service elements were simultaneously observed mid-reveal. That verification used isolated preview slot 1 at `http://127.0.0.1:3000`, process 26436. Subsequent production builds and the current local preview are recorded in `release-verification-2026-11-10.md`.

A recorded desktop run received nine consecutive wheel events and advanced by 612px after every event, including across the photo strip, with zero browser errors. There are 29 connected homepage reveal targets.

`artifacts/home-scroll-fix/scroll-demo.webm` records the actual final production scroll behaviour. `preview-verification.json` and `browser-verification.json` contain the measured positions and computed scroll styles; `production-final-checks.log` contains the final passing results. Earlier diagnostic failures are retained separately. No enquiry was sent, and no Git push or public deployment was performed.
