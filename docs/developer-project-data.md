# Developer project data

Each record now also has an independent `gallery` array of `{ src, label }` entries. The current extra images are explicitly labeled architectural concept inspiration. Replace **all** gallery entries with approved project imagery, together with `image`, before setting `placeholder` to `false`; do not leave concept inspiration labeled as actual project photography. Gallery arrays and their entries are frozen after loading.

Each developer owns an independent file under `src/data/developer-projects/`: `emaar.json`, `sobha.json`, `damac.json`, `aldar.json`, `ellington.json`, and `meraas.json`. Each currently contains fifteen explicit project records (90 total). There is no shared project template or runtime slot generator.

The hero, listing cards and detail pages all read the same records through `src/lib/developer-projects.ts`. Detail URLs are scoped to both developer and project: `/developers/emaar/projects/emaar-project-01`. Looking up an Emaar project under Sobha returns 404. Related projects stay within the current developer.

To add approved information, edit only the relevant project object in its developer's file. Keep its `id` and `developerSlug` stable. Replace `name`, `image`, `description`, `location`, `emirate`, `type`, `bedrooms`, `price` (numeric AED), `handover`, `paymentPlan`, `amenities`, `brochureUrl`, and `floorPlanUrl`. Null means pending; no values are copied from another project. `slug` controls the detail URL; preserve it to avoid breaking existing links, or add a redirect when changing it.

Set `placeholder` to `false` after the project content is approved. Until then the detail page is noindex and excluded from the sitemap. Ownership mismatches, duplicate IDs, duplicate slugs within a developer and invalid URL slugs fail during data loading/build. The shared card/page components control design only; they never substitute another developer's data.
