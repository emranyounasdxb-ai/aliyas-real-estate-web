# Complete developer hero carousels — 31 October 2026

The user requested image-only slides from the supplied stock folder to complete heroes with fewer than 15 verified projects. This supersedes the earlier no-filler hero display, but does not add inventory or project records.

## Implementation

- All 30 approved developers now have exactly 15 hero slides. The first slides retain the owner's verified project names, IDs and detail links, capped at 15. Only the 16 shorter collections receive stock slides: 137 visual slides in total.
- Stock slides have descriptive image alt text, but no project name, project ID, link, caption or commercial fields. They cannot appear in listing filters, project detail pages, counts, pagination or source records. Existing 575 project/phase records remain intact.
- Reused 15 architectural/interior assets already imported from `C:/Users/emran/Downloads/Aliyas Real estate/Site images`. The per-owner deterministic sequence does not repeat an image within a hero. Provenance is recorded in `docs/site-imagery-manifest.json`.
- Full-resolution lossless masters and originals are unchanged. Next Image continues serving responsive AVIF/WebP variants at quality 85, with explicit sizing and lazy loading after the initial seven slides. No new image dependency or asset conversion.
- Existing reference-shaped concave geometry, scroll-driven motion, hearts, three visible phone cards/seven wide-screen cards and 15-slide scroll limit are retained. Stock heroes explicitly identify stock inspiration in the existing footer note. Controls use “slides” rather than calling stock imagery projects.
- At 768–1100px, heroes with stock slides reserve 26px more vertical space for verified captions. Testing found the five-line Waldorf Astoria name clipped after widening Al Hamra's carousel from four to fifteen slides. The full name now fits without changing its font, truncating text or altering image shapes. Normal-motion measurement accounts for this space on short screens.

## Short collections

| Developer | Verified records | Image-only slides |
| --- | ---: | ---: |
| Nakheel | 11 | 4 |
| Dubai Properties | 3 | 12 |
| OMNIYAT | 9 | 6 |
| Select Group | 5 | 10 |
| Deyaar | 12 | 3 |
| Wasl | 10 | 5 |
| MAG | 3 | 12 |
| Union Properties | 2 | 13 |
| Alef | 6 | 9 |
| Eagle Hills | 4 | 11 |
| Modon | 10 | 5 |
| Bloom | 8 | 7 |
| IMKAN | 2 | 13 |
| RAK Properties | 11 | 4 |
| Al Hamra | 4 | 11 |
| Al Zorah | 3 | 12 |

## Verification

Optimized build/TypeScript passed: `09SSxn62teCq-vg5kociI` (1052 generated routes). Production preview PID 49112 serves http://127.0.0.1:3000.

The initial six-case targeted run passed five cases: all 30 hero counts; stock provenance/data separation; four short collections' normal-motion geometry and final-slide release; Union Properties touch/keyboard/reduced-motion and both-theme axe checks; and an actual Emaar project link/source. The remaining caption case found the Al Hamra tablet clipping described above. After the CSS correction, both caption geometry at 320/390/768/1024/1440 light/dark and the short-collection scroll-release cases passed on the final build. No unresolved failures.

A final separate native-touch-emulation check used Al Hamra at 390×844, 820×1180, 844×390 and 1024×600. Every gesture advanced the strip, and pinned scene heights fit the available viewport (653/600/306/516px respectively). Final screenshots visually reviewed: Al Zorah desktop, Al Hamra 768px light and Union Properties 320px light/dark. Tablet captions are fully visible; image-only slides have no fabricated names; phone focus indication remains visible.

Evidence: `artifacts/hero-stock-images/build-final.log`, `tests-final.log`, `touch-fit-final.json`, `al-zorah-desktop.png`, `al-hamra-light-768.png`, `union-properties-stock-light-320.png`, `union-properties-stock-dark-320.png`. Initial test/failure artifacts remain for traceability. Tests: `tests/verified-project-heroes.spec.ts` and the all-developer case in `tests/developer-hero.spec.ts`.

Browser emulation, not physical-device testing. No forms changed or submitted, no dependency changes, and no deployment. The earlier all-575-detail verification remains applicable because no underlying project record or route was changed.
