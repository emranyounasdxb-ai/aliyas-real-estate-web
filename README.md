# Aliyas Real Estate

A local UAE off-plan property discovery website with a bold architectural design system. Built with Next.js App Router, TypeScript, React, GSAP ScrollTrigger and Lenis. Fonts and photography are served locally. Runtime dependencies use stable npm releases checked on 29 October 2026 and are locked in `package-lock.json`.

## Run locally

```powershell
npm install
npm run dev
```

Open **http://127.0.0.1:3000**. For the faster production preview:

```powershell
npm run build
npm start
```

Stop the previous server before starting another on port 3000. The project includes Node 26.13.0 locally; npm scripts resolve the local runtime. `.node-version` also records the version for a version manager. No system-wide settings are changed.

## Included

- Open homepage with oversized LIVE BEYOND typography, a new sculptural architectural concept, approved centered-logo navigation, immediate property search, a full-width dark collection chapter, interactive city selection and a compact journal.
- Animated projects/developers menus, header search, saved-project shortcut and enquiry action. Original gold logo stays centered on desktop and mobile; keyboard dismissal, focus restoration and reduced motion are supported.
- The original Aliyas gold logo, clean white `#F8F9F7`, ink `#151917`, deep ink `#0C100E` and restrained gold `#B89B58`. Roboto Condensed headings, Lato controls and Hind body copy are served locally. The shared system removes framed page containers, pill navigation and heavy boxed cards.
- GSAP horizontal four-project gallery on larger screens, a native swipe gallery on mobile, masked hero text, image wipes and parallax. Lenis wheel smoothing works in narrow desktop panels; touch stays native. Reduced motion retains a functional native gallery. Keyboard focus follows every project link.
- Developer-owned project detail pages with original source links, dated research, unit-area tables, payment references, disclosed gaps, gallery lightboxes and project-specific enquiry actions. No invented documents or exact plot coordinates.
- Search, emirate/type/budget filters, sorting, saved favourites and a persistent side-by-side comparison for up to three projects.
- The approved 30-developer network, a 575-record project catalogue, journal pagination and article pages. Developer heroes retain 15 slides and project lists use 15-card pagination.
- About, contact, privacy, useful 404, keyboard navigation and mobile menu.
- Accessible enquiry drawers with project/document-specific messages, official phone/email/WhatsApp links, persisted receipts, validation, bounded requests, anti-spam limits and same-origin checks. Optional SMTP delivery is available through server environment variables and remains disabled without configuration.
- Server-rendered content, per-page metadata, canonical URLs, social metadata, structured data, sitemap and robots controls.
- Responsive Next Image AVIF/WebP delivery, lazy-loading below the fold, local fonts and security headers.

## Content and configuration

- Developer-owned project records are in `src/data/developer-projects/`; the approved network is in `src/data/approved-developer-network.json`. Legacy homepage previews and shared editorial content are in `src/lib/content.ts`. Research progress, protected identities and field-level provenance are recorded in `docs/project-detail-research-progress.md`, `docs/project-detail-research-queue.json` and `docs/project-detail-source-ledger.json`.
- Edit photography in `public/images`; provenance is in `docs/assets.md`, `docs/generated-hero.md` and `docs/generated-future-hero.md`.
- Business contacts are in `src/lib/contact.ts`; public social links are in `src/lib/socials.ts`. Original logo and footer profiles came from the supplied official website; see `docs/brand.md`. Licensing claims are not invented.
- Researched project details distinguish developer sources, original documents, broker mirrors and portal references. Published prices and payment schedules may be historical; completion dates are forecasts. Unavailable or conflicting information stays explicitly unconfirmed. Legacy homepage preview offers remain illustrative. Photography does not depict the named developments and still requires replacement with approved, licensed project imagery. Research completion does not confirm live stock or permission to publish.
- Configure `NEXT_PUBLIC_SITE_URL` with your public HTTPS origin before the production build. The local preview is intentionally **noindex**. A public origin enables normal indexing.
- Enquiries are appended to private `.data/enquiries.jsonl`. No live email or CRM credentials are configured. Optional SMTP setup and delivery-status details are in `docs/enquiries.md`. A serverless or multi-instance deployment requires durable shared storage and a distributed rate limiter.
- Do not expose `.data`, include it in Git, or upload it with a static deployment.

## Validation

```powershell
npm run typecheck
npm run test:unit
npm test
npm run build
npm audit --omit=dev
```

Browser tests use the locally installed Microsoft Edge and an existing server at `http://127.0.0.1:3000`. They cover discovery, filters, saved state, navigation, mobile behaviour and accessibility. Test reports are ignored. `npm run format` formats the source. Lighthouse is installed for production performance checks; scores vary with machine/browser and must not be treated as guarantees.

## Structure

`src/app` owns routes and SEO; `src/components` owns reusable UI and interactions; `src/lib` owns catalogue data and enquiry validation/persistence. Most content pages are statically generated. Filtering and forms use small interactive client components.

Public deployment, a CMS/dashboard, verified inventory, domain configuration and live CRM/email credentials remain launch work; this delivery is the requested running local website with official business contacts and social links.
