# Developer project display — 31 October 2026

The collection remains uncapped: all 575 sourced project/phase records are retained. The user's latest display requirements supersede the earlier all-projects hero behavior.

- Each developer hero receives the first **15** verified records at most. The user's subsequent instruction adds image-only stock slides when there are fewer than 15 verified records, completing a 15-slide visual carousel without adding project records. The approved curved shape, real project names, owned links and scroll-driven animation remain. See docs/developer-hero-stock-images.md for this later update.
- Each developer listing page renders at most **15** cards. Emaar's 108 records therefore occupy eight pages, with three records on the last page. Every owner uses the same pagination logic without sharing project data.
- Links use `?page=2#developer-projects`, preserve current filters, support modified clicks/new tabs, and work with browser back/forward and refresh. Normal clicks update the listing through Next-compatible history navigation, without rebuilding the hero. After a page change, scrolling and keyboard focus move to the listing heading.
- Location filtering happens before pagination. Changing or clearing a location resets to page one. Empty results hide pagination. Invalid page values fall back to page one; out-of-range numeric values clamp to the last page.
- Direct visits render the requested slice on the server, including with JavaScript disabled. Developer profile pages render on demand; project detail pages retain their existing pre-rendered URLs. Paginated profile metadata uses the requested page's canonical URL and title.
- Project detail collection links return to the page containing that record. Browser back still restores the user's actual previous URL, including filters.
- Pagination uses the existing neutral/gold theme, current-page indication, disabled boundaries, visible keyboard focus and 48px-high controls. Narrow screens place page numbers above Previous/Next; no horizontal overflow occurs.

## Verification

Optimized production build and TypeScript pass: **aJ_bxdGLymuHTFqDGjXmH**. Preview PID **66996** at http://127.0.0.1:3000, final page-eight response 200. Formatting passes for all changed application files and tests.

Initial regression run: 18 cases passed, covering all 30 owner collections, all 575 detail URLs, reference geometry, mobile/desktop scroll and pin release, touch emulation, reduced motion, detail enquiries/gallery and ownership. One no-JavaScript case exposed duplicate fallback/rendered cards from the old Suspense boundary. Removed that obsolete boundary from the now request-rendered profile. Also completed page-aware metadata and detail back links before the final build.

Final build: **5 pagination cases + 2 targeted scroll/filter cases passed**. Coverage includes every owner's complete partition without duplicate/missing IDs; invalid pages; filter-before-slice behavior; page two and final page; refresh and history; final project's detail/back link; server-rendered pagination without JavaScript; native touch at 320/768; responsive geometry at 320/390/768/1024/1440 in light/dark; keyboard activation and result focus; and scoped axe checks. The final wheel test confirms the pinned hero releases after 15 and pagination does not restart it. Browser emulation, not physical-device testing. No enquiries were submitted.

Evidence: `artifacts/developer-pagination/build-final.log`, `tests-final.log`, `motion-final.log`, `pagination-320-light.png`, `pagination-320-dark.png`, `pagination-1440-light.png`, `pagination-1440-dark.png`. The responsive screenshots were recaptured on the final build. Initial run/failure artifacts remain for traceability.

No project records, source links, original logos, approved images, or content details were changed. No dependencies or deployment.
