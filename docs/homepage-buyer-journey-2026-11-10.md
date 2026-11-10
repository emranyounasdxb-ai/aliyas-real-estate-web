# Homepage buyer journey — 10 November 2026

## What changed

The homepage now takes a buyer from a concise project search to two deliberately selected projects, a personalised shortlist request, the named Aliyas team, useful buyer answers and the latest journal stories. City image cards remain absent. The existing cinematic project hero, responsive static WebP assets, saved projects, comparison and enquiry drawer are retained.

The search starts with keyword, emirate and budget. Additional area and property-type filters remain available in an accessible disclosure; collapsing it retains selections and changing emirate clears an incompatible area. The shortlist request transfers purpose, emirate and budget to the existing enquiry form, including its investment/home interest. It never sends without the visitor completing and submitting the enquiry.

## Editorial evidence

Checked official developer pages on 10 November 2026:

- Artistry Two Residences: https://www.select-group.ae/developments/artistry-two-residences — residences from AED 2.3M, 50/50 payment plan, planned handover 2029; Dubai Design District. Own project card and interior images retained.
- Yas Riva Reserve: https://www.aldar.com/properties/en/yasrivareserve — inland four-bedroom villas from AED 7.9M; four to six bedroom villas; 50% on handover. Price explicitly labelled inland villas because the project cover shows a waterfront home. No broker-estimated handover date is promoted on the homepage.
- Rivage is excluded from homepage selection: existing research includes the developer sell-out announcement dated 19 November 2024. No claim of current unit availability is made for the featured projects.

The main catalogue already has matching starting prices for the two featured records. The 575 protected project records are unchanged. `src/lib/home-collection.ts` holds the small editorial selection, developer source links and clearly scoped price labels. Future price updates should recheck the linked developer pages and keep the catalogue consistent.

Company leadership names and roles are shared with the existing About page through `src/lib/company-team.ts`; their provenance and owner-approved logo display pictures are recorded in `docs/about-content.md`. The registered developer count comes from the owner-approved network. Office/contact links use the existing supplied business record. No reviews, ratings, licence claims, sales results, guarantees or invented portraits were introduced.

## Verification

- TypeScript check passes.
- 19 focused browser checks pass on development preview: viewport widths 320, 390, 768, 1440 and 1920; keyboard disclosure and dialog focus; search/advanced filters; saved and compared records; shortlist transfer and changing preferences; enquiry validation/success/error with intercepted requests; official project links; WCAG A/AA checks on homepage and dialog in light and dark mode.
- Five responsive-image checks passed separately: project/gallery variants, same-project fallback, homepage mobile hero/journal and catalogue image.
- Visual review caught and corrected a global developer-mark positioning conflict, heading specificity conflict, duplicate footer invitation and initial hero/header overlap.
- Enquiry API calls in browser tests are intercepted: no real message is sent and live email delivery is not certified by these checks.
- Production build, final screenshots and local preview handoff: recorded below after completion.

No Git push or public deployment is part of this change.

## Completed local handoff

- Optimized production build succeeded: 1,152 static pages generated; homepage prerendered.
- All 24 focused Playwright tests passed against that production build (58.7 seconds).
- Final desktop/mobile screenshots are in `artifacts/home-conversion/`; light and dark layouts and 320–1920px widths were inspected. Normal-motion heading reveal was also verified.
- One unthrottled local desktop load recorded DOMContentLoaded at 433ms and load at 664ms, with approximately 239KB transferred scripts and no browser page errors. This is a local observation, not a deployed-network performance guarantee.
- The tested slot-1 production build is running at http://127.0.0.1:3000/ (PID 71648 at handoff). The updated page was opened in the visible local browser and retained for the user.
- Temporary development and port-3112 test servers stopped. Original TypeScript/Next environment config snapshots restored after Next's temporary preview modifications.
- No Git push or public deployment performed.
