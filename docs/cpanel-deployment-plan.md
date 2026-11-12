# cPanel deployment

The custom Next.js site was activated on https://aliyasrealestate.ae/ on 12 November 2026. InMotion cPanel runs the Linux standalone build through Passenger on Node.js 24.22.3.

The hosting inspection found all 13 mailboxes and confirmed that their account configuration matched the pre-migration snapshot. Mail routing and DNS stayed on the existing host. The WordPress site files, dedicated database and database user, installation registration, caches and account-hosted backup copies were removed. The verified website and database backup is stored off-host. The temporary SSH key was revoked.

## Updating the site

Push website changes to `main`. The [cPanel deployment workflow](../.github/workflows/cpanel.yml) tests and builds the site, then compares the build and public assets against the verified inventory on the server. It transfers missing content over FTPS. A source edit can change multiple compiled files. Identical releases finish without uploading files or restarting the app.

The workflow uses the repository variables `CPANEL_DEPLOY_ENABLED`, `CPANEL_FTP_HOST` and `CPANEL_FTP_USER`, and the GitHub secret `CPANEL_FTP_PASSWORD`. Setting `CPANEL_DEPLOY_ENABLED` to `false` pauses production transfers while leaving build checks active.

The initial migration cached 35.52 GB of unique Git LFS objects and verified each object's SHA-256 and size. Later builds read LFS pointers and download only assets missing from the verified server inventory. The public library includes original photos, PDFs and full-size drawings. Pages use responsive display copies and lazy-load assets where appropriate. The sampled Avelia floor-plan WebP preview is 44,584 bytes, and its original drawing is 883,315 bytes. The preview cache is shared across deployments.

## Hosting layout

| Account directory | Purpose |
| --- | --- |
| `aliyas-deploy` | Restricted FTPS exchange for uploads, release requests, receipts and the verified inventory |
| `aliyas-runtime` | Deployment receiver, verified objects, releases, logs and generated image cache |
| `aliyas-app` | Passenger entry point, private environment and the `current` release link |
| `aliyas-private/enquiries` | Persistent, private enquiry records |
| `public_html` | Hosting routing rules and the SSL challenge directory |

The receiver runs under a cron lock. It validates uploaded files and tests the candidate on a local port. It activates the release, restarts Passenger and records success once the HTTPS health endpoint reports that release. If the new release fails the health check, the receiver restores the preceding link and restarts Passenger. Retain the preceding release and its assets for rollback.

The enquiry endpoint stores the message before submitting it to the existing local sendmail service. The form and delivery code were checked with invalid requests and a stubbed transport. This verifies validation and transport integration without submitting a customer enquiry.

## Migration checks

- All 815 URLs in the live sitemap returned HTTP 200.
- Desktop and mobile checks covered responsive images, project search, emirate switching, shortlist and comparison, enquiry validation, and original-size floor-plan zoom.
- The isolated FTPS check uploaded one changed object, skipped the unchanged object, ignored an incomplete transfer and rejected a corrupt object.
- Re-running the full initial release uploaded zero bytes and left the release running.
- The sampled drawing and PDF returned valid partial responses, and the optimized WebP returned a cache hit on repeat access.
