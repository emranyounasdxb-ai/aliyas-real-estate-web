# Homepage design correction — 10 November 2026

This checkpoint supersedes the homepage composition in homepage-buyer-journey-2026-11-10.md.

Owner feedback: developer logos must keep scrolling; do not place the team on the homepage without actual portraits. The previous static six-logo row and company-logo team avatars were rejected. Preserve the team only on the existing About page unless the owner asks otherwise.

Implemented:
- Restored the original moving developer marquee with all 30 approved developers. Added a real pause/resume control, retained hover/keyboard pause, offscreen pause and reduced-motion manual scrolling. Disabled speculative page prefetch on its 60 rendered links.
- Removed the entire homepage team section and its names/avatar display.
- Reworked the hero into a clean editorial split: readable type on the brand's light surface and an unobscured, edge-to-edge Talay project image. Mobile stacks the composition without horizontal clipping. Existing source image and responsive WebP delivery are retained.
- Replaced the heavy bordered project cards with alternating image/detail sections. Current developer-backed commercial facts and original project images remain connected to the correct records.
- Simplified search presentation; existing advanced filters and shortlist submission flow retained.
- Condensed the six buyer questions into native keyboard-accessible accordions, preserving all answers while reducing the text wall.

Verification: TypeScript passes. Nineteen existing flow/layout/accessibility checks passed, followed by both new motion/keyboard/reduced-motion tests. The initial keyboard test was corrected to use an actual Tab interaction instead of programmatic mouse-context focus. Desktop and mobile rendered screenshots were inspected. Production build and local browser handoff recorded after completion.

No project records, article content or About-page team content were changed. No Git push or public deployment is authorized by this correction.


Final local handoff: the optimized production build passed, including all 1,152 static pages. Thirteen targeted checks passed against the production build (37.3 seconds), covering motion, keyboard operation, reduced motion, preference transfer, forms, viewport widths and WCAG AA checks. A final tablet typography correction was rebuilt and visually rechecked. The final build is running at http://127.0.0.1:3000/ (PID 72004 at handoff). Final browser evidence confirms the marquee is moving, the homepage has zero team elements and no page errors. Screenshots are in artifacts/home-editorial/. Original TypeScript environment snapshots restored; no temporary preview server remains.
