# Twelve design improvements

Implemented against the local website. The approved centered header, footer columns and concave developer hero remain intact. Each developer still owns fifteen independent project records and detail URLs. New company photography was explicitly declined; the original Aliyas logo is used as a company profile avatar instead.

| Task | Implementation |
| --- | --- |
| 1. Dark-mode contrast | Shared foreground/background action tokens, readable gold home actions, and an opaque dark/white gallery control. Removed the conflicting gallery theme override. |
| 2. Typography | Existing Roboto Condensed/Lato/Hind pairing retained. Main home labels are 12px, body copy 16–18px, and common headings/cards have consistent scales. |
| 3. Mobile home hero | Smaller responsive title/image treatment. On short phones the primary action moves above the image, keeping it in the first viewport at 320×568 and 390×640. |
| 4. Mobile contact | WhatsApp/call actions precede the enquiry form. The form appears before the longer contact story, imagery and social links; it starts at approximately 400px at 390px width. |
| 5. Mobile listing filters | Sticky Filter/Sort bar and an accessible native modal with location/type/budget controls, live result count, reset, Escape/focus restoration, scroll lock and URL-based state. |
| 6. Project cards | Shared image treatment, title/metadata/price/action alignment. Mobile cards use a compact image-and-details layout; all fifteen developer cards remain rendered. |
| 7. Project detail navigation | Sticky section tabs with active-section indicators, correct header offsets and smooth/reduced-motion anchor navigation for both detail templates. |
| 8. Repeated CTAs and spacing | Duplicate About and article CTA blocks removed. Article ends in related reading before the shared footer invitation. Common spacing is consistent across page templates. |
| 9. Developer/company identity | Original developer marks with illustrative directory previews. Aliyas company avatar, branded About banner, official office and contact details. No staff or office photos added. |
| 10. Journal | Featured editorial layout, aligned story actions, article contents navigation with active state, readable article column and related stories. |
| 11. Mobile navigation/comparison | One visible mobile close control. Comparison uses smaller image summaries and a narrow sticky label column; existing selection/persistence behavior remains. |
| 12. Locations/motion | Ajman is present in the home location explorer, mega-menu and search hints, using credited real Ajman imagery. Hover/menu/reveal timings use a consistent motion system and respect reduced motion. |

Implementation styles are in `src/app/design-system.css`; reusable section navigation is `src/components/section-navigation.tsx`. Asset provenance and the owner's company-photo preference are recorded in `docs/visual-assets.md`.

Browser evidence is saved under `artifacts/design-polish/`, including desktop/mobile, sticky navigation, brand marks, the logo avatar, filter modal, Journal and dark-mode captures. Automated design checks cover mobile content order, contrast, filter interactions, sticky/active tabs, editorial/brand structure, Ajman/menu/comparison behavior and WCAG checks across eight page templates in both themes and desktop/mobile widths.

Final validation: 67 distinct browser checks and six enquiry unit cases pass across the regression and repaired runs. Eight targeted checks also pass on the optimized production server. TypeScript and the 119-page production build pass. The final local preview is at http://127.0.0.1:3000/.
