# Motion diagnosis — reference redesign

Reviewed the previous implementation before the reference-based redesign on 29 October 2026. No application source files were changed by this review.

## Confirmed causes

1. **Narrow browser previews have no smooth scrolling.** Lenis is instantiated only when both `(min-width: 801px)` and `(pointer: fine)` match. A 700px-wide desktop browser with a mouse receives native wheel scrolling even though the device supports smooth wheel interpolation.
2. **Expanding a narrow preview does not recover smoothing.** The width/pointer test is evaluated once inside a GSAP media-query callback that only watches reduced-motion. A viewport resize does not rerun that callback.
3. **There is no reference-style scroll scene.** The old homepage has only one scrubbed animation: a 12% vertical hero-image parallax. Every other section uses an unobserved-after-entry 30px/opacity reveal. There are no pinned sections, stacked cards or scrubbed editorial transitions.
4. **Lenis integration omits the documented lag-smoothing setting.** The installed Lenis README's GSAP integration calls `gsap.ticker.lagSmoothing(0)` after attaching Lenis to the GSAP ticker. Omitting it may make background-to-foreground or long-frame recovery feel delayed, although it was not the direct narrow-preview failure.

## Standalone browser evidence

Microsoft Edge, normal-motion, fresh context, a single 800px wheel input. Positions were sampled every 100ms:

| Context | Fine pointer | Reduced motion | Scroll positions |
| --- | --- | --- | --- |
| 1440 × 1000 | Yes | No | 565, 691, 731, 775, 789, 795, 798, 799, 800 |
| 700 × 900 | Yes | No | 800, 800, 800, 800, 800, 800 |
| 1440 × 1000 | Yes | Yes | 800, 800, 800, 800, 800, 800 |

No browser runtime errors occurred. The production build timestamp was newer than the reviewed motion source, so the observed old behavior was not caused by an outdated build at the time of review.

## Implementation guidance

- Enable wheel smoothing for fine-pointer devices independent of viewport width. Keep native touch scrolling and respect reduced-motion. Observe every breakpoint that changes animation setup through GSAP media-query conditions.
- Use one GSAP ticker loop, convert its seconds to milliseconds for Lenis, call `lenis.on('scroll', ScrollTrigger.update)`, and follow the installed Lenis lag-smoothing guidance.
- Build a stable pinned wrapper containing stacked card children. Animate the children, never the pinned wrapper itself. Avoid transformed ancestors around the pinned region.
- For the reference's layered-card composition, move the next card upward from `yPercent: 110` to zero while the previous cards scale slightly and shift upward, leaving their top edges visible. Scrub the sequence to scroll position.
- Preserve normal document-flow content for reduced-motion and before JavaScript enhancement. Add absolute stacking only when animation setup is active, then revert it during cleanup.
- Use responsive end distances, `invalidateOnRefresh`, default pin spacing and an appropriate `anticipatePin` setting. Refresh measurements after fonts/images settle. Use `pinReparent` only for a demonstrated containing-block problem.
- Do not apply generic entrance transforms to the pinned wrapper or its ancestors.

## Regression checks

1. At 700px and 1440px, one wheel input must produce multiple increasing intermediate scroll positions before settling.
2. Loading at 700px then resizing to 1440px must preserve/reconfigure smoothing correctly.
3. At 10%, 50% and 90% of the stack's scroll range, card positions/scales must differ and visibly progress; reversing scroll should reverse the scene.
4. Reduced-motion keeps every project readable in flow, without scroll pinning.
5. Navigation away and back must not leave duplicate ticker callbacks, pin spacers or inline transform state.

## Primary documentation

- [Lenis official README and GSAP integration](https://github.com/darkroomengineering/lenis#gsap-scrolltrigger) — also inspected directly in the installed `node_modules/lenis/README.md`.
- [GSAP ScrollTrigger](https://gsap.com/docs/v3/Plugins/ScrollTrigger/) — Context7 official-documentation results cover `pin`, `pinSpacing`, `anticipatePin` and `pinReparent`.
- [GSAP matchMedia](https://gsap.com/docs/v3/GSAP/gsap.matchMedia/) — responsive setup and automatic cleanup.

## Redesign verification

The replacement implementation on the development preview at port 3001 resolves the diagnosed behavior:

- A 700px-wide normal-motion browser now interpolates an 800px wheel input through 315, 495, 584, 625, 652, 664, 672, 676, 678, 679, 680px. The final 680px reflects the intended 0.85 wheel multiplier.
- Resizing that same tab to 1440px preserves interpolation: 327, 496, 575, 625, 649, 664, 671, 676, 678, 679, 680px.
- The pinned project sequence progresses through all five cards at 0%, 25%, 50%, 75% and 100% of its scroll range. The desktop chapter remains pinned at approximately 105px from the top. Final card tops are spaced by 23px, producing the reference's visible layered edges.
- At 390 × 844px, card five is fully visible from y=326.7 to y=746.7, with no horizontal overflow.
- Reduced-motion produces zero pin spacers and five normally flowing, non-inert cards.
- Client navigation to About removes the pin spacer. Returning home creates exactly one spacer, one enhanced stack and one active card. No runtime errors occurred.

The test script and screenshots are in ignored `artifacts/redesign/`. The route check explicitly waits for navigation because development compilation can take longer than a fixed short delay.
