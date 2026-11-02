# Project location system

Implemented locally on 30 October 2026. The same location registry drives homepage search, project catalogue filters, developer-owned listing filters and header search shortcuts.

## Visitor behaviour

- Emirate and area/community are separate, linked controls. Choosing an area selects its parent emirate. Changing the emirate clears an incompatible area while retaining other filters.
- The initial registry contains 21 areas across Dubai, Abu Dhabi, Sharjah, Ras Al Khaimah and Ajman. All seven emirates can be filtered; Fujairah and Umm Al Quwain do not yet have community entries. This is an expandable directory, not an exhaustive list of UAE communities or a claim of inventory availability.
- JBR, JLT, Dubai Marina and Dubai South have homepage and header search shortcuts. Keyboard typeahead understands aliases such as JLT and Marina.
- Location filters combine with property type, budget, developer, search and saved/collection filters. Unknown prices do not match a numeric budget. Unknown locations do not match a specified area or emirate.
- Selections are encoded in the URL and survive refresh, browser Back and shared links. Example: `/projects?emirate=Dubai&area=dubai-dubailand`.
- Developer filters stay within the current developer's own records and scoped project URLs. Empty locations show an honest empty state with a recovery action. Invalid or conflicting URL locations do not silently broaden the results.
- The custom gold-accented dropdown works in light/dark themes, with keyboard selection and inside the mobile filter dialog. No visible animation playback controls were introduced.

## Adding approved project data

1. Find the area in `src/data/locations.json`. If absent, add a verified community with a unique, permanent `id`, its display `name`, parent `emirate` and useful `aliases`. An optional `shortName` supplies familiar abbreviations. Keep IDs stable because shared links use them.
2. Edit only the project's owning file in `src/data/developer-projects/<developer-slug>.json`. Preserve its existing `id`, `slug` and `developerSlug` unless a separate URL migration is planned.
3. Set `areaId` to the registry ID. `location` and `emirate` may remain null: the loader derives their canonical labels from the area. If provided, they must agree with the registry; conflicting geography fails validation.
4. Add the real approved project details and assets before switching `placeholder` to false. An approved project must have a recognised area ID. Unknown details must remain null rather than invented values.
5. Rebuild and review its developer route and `/projects` location results. Non-placeholder records belonging to the approved 30-developer network are automatically included in the main catalogue. Legacy developer routes remain separate. If an approved record has the same owner and name as an illustrative sample, the approved listing replaces that sample in the catalogue.

This is a shared file-backed data and filtering system. It does not add a separate administration dashboard or publish any listings externally.

## Current records and safeguards

- The six existing illustrative catalogue projects received area IDs corresponding to their already supplied location labels. Their preview status and other data remain unchanged.
- Every existing developer slot has an explicit nullable `areaId`. The approved 30-developer network retains 15 separately owned slots per developer. The ten legacy collections retain their existing records and routes too.
- All 600 developer-owned slots still have unknown location data; none were assigned arbitrary areas. Real project locations are a remaining content dependency.
- Identity, ownership, area existence and area/emirate agreement are checked when loading the collections. Public URLs remain scoped to the developer.

## Geography references

These primary sources were consulted for community naming; they are not evidence of Aliyas inventory in those communities. Existing illustrative project-to-community mappings were retained from local data.

- [Dubai Government neighbourhood guide](https://www.dubai.ae/web/dubai.ae/visit/staying-in-dubai/dubai-neighborhoods/): Dubai community names, including JBR, JLT, Dubai Marina and Dubai South.
- [Emaar Dubai Hills Estate](https://www.emaar.com/en/our-communities/dubai-hills-estate): Dubai Hills Estate naming.
- [Visit Abu Dhabi islands](https://visitabudhabi.ae/where-to-go/islands): Yas, Saadiyat and Al Reem island names.
- [Visit Ras Al Khaimah: Al Marjan Island](https://visitrasalkhaimah.com/location/place/al-marjan-island/), [Mina Al Arab](https://visitrasalkhaimah.com/location/place/mina-al-arab/) and [destination website](https://visitrasalkhaimah.com/?lang=en): Ras Al Khaimah community names.
- [Ajman Tourism visitor guide](https://visit-ajman.ae/media/2659/18_ajman_tourism_visitors_guide-english.pdf) and [MOCCAE Al Zorah Reserve](https://www.moccae.gov.ae/ar/knowledge/ecotourism/al-zorah-reserve): Al Zorah naming and emirate.
- [Arada Aljada](https://www.arada.com/en/aljada/) and [Shurooq Maryam Island](https://shurooq.gov.ae/portfolio/maryam-island): Sharjah community names.

## Verification

Production build `foXM3j0sONSCCiwub7DP3` passed Next.js compilation and TypeScript checks, generating 764 routes. The local production preview runs on `http://127.0.0.1:3000`.

21 targeted Playwright cases passed: eight location cases, seven shared-interface cases and six recovery/comparison cases. Coverage includes canonical aliases, invalid geography, filter intersections, ownership, approved-record catalogue integration using an in-memory fixture, homepage submission, refresh/history, keyboard typeahead, native-touch emulation at 320px, developer-specific empty/recovery states and light/dark accessibility checks. No fixture data was written to the production catalogue.

Layout containment checked at 320, 390, 768, 1024 and 1440px. Screenshots in `artifacts/location-system/` cover homepage desktop/mobile/tablet, catalogue desktop/laptop, developer listings and mobile filter dialog/options. Browser emulation was used; physical-device testing was not performed. Existing enquiry controls were exercised without sending a form. No deployment occurred.
