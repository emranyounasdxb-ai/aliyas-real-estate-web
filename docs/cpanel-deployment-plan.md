# cPanel migration and incremental deployment

Prepared 12 November 2026 (Asia/Dubai).

## Requested outcome

Replace the WordPress website on `aliyasrealestate.ae` with this Next.js application on the existing InMotion Hosting account. Preserve every hosted email account, mailbox, email setting and mail-routing record. After the initial migration, successful pushes to `main` must deploy only new or changed deployment files.

The user explicitly clarified that no part of this WordPress installation should remain on the hosting account. Keep the verified rollback backup **off the hosting account, on the local PC**. Include WordPress files, its dedicated database, plugins/themes/uploads, caches, installation-specific scheduled jobs, installer records and account-accessible WordPress backups in the cleanup inventory. Do not confuse unrelated applications, mail data or hosting service files with WordPress. Provider-managed backups outside the account require separate verification with the host and must not be claimed as removed without evidence.

This document records an in-progress migration, not a completed deployment. The authenticated hosting inspection is complete, a verified off-host WordPress backup exists, and an isolated deployment receiver is installed. On 12 November the user explicitly authorized immediate WordPress deletion, accepted downtime and prohibited a temporary holding page. WordPress's 24 webroot entries, its sole database and dedicated database user, both account-hosted backup copies and the WP Toolkit installation registration have been removed. Only the SSL `.well-known` directory remains in the document root. The 13 mailbox names and email account/password configuration hashes match their pre-removal values. Mail settings and DNS have not been changed. Automatic production activation remains disabled while the custom application is prepared.

## Verified starting point

- Repository: `emranyounasdxb-ai/aliyas-real-estate-web`, branch `main`.
- Last released commit: `f2bbed59d96cd10a1e5ecfcb2fffcb941fb58fb9`.
- Next.js 16.4.3 application with a Node.js `POST /api/enquiries` endpoint, SMTP support and private filesystem persistence.
- The installed Next.js documentation specifies Node.js 20.9 as its minimum. The local development runtime is Node.js 26.13.0. The actual hosting runtime and dependency compatibility still need verification; the framework minimum alone is not a production compatibility check.
- A Linux standalone build and FTPS workflow is being introduced. The `CPANEL_DEPLOY_ENABLED` repository variable gates production transfer and remains disabled until migration verification completes. This is a Node deployment, not a static export.
- Public assets: **38,274 files, 36,394,714,529 bytes (36.39 GB)**, with no symlinks in the inspected `public` tree. Most bytes are project photographs, source PDFs and complete floor-plan images.
- Hosting provider confirmed by the user: **InMotion Hosting**.
- Public DNS observed during preflight: apex A `213.165.245.187`; MX priority 0 points to `aliyasrealestate.ae` itself; nameservers `ns3.inmotionhosting.com` and `ns4.inmotionhosting.com`.
- Observed SPF includes the apex A/MX and `213.165.245.187`. Website DNS and mail delivery are therefore coupled. Keep this migration on the existing hosting and preserve these records. Any later IP migration requires a separate mail-routing review.
- Authenticated cPanel inspection confirms the domain document root is `/home/aliyasrealestate/public_html`, on Linux x86_64. Node.js 24.22.3, npm 11.19.1 and Passenger Application Manager are available. Approximately 699 GiB and 56.7 million inodes are free on the inspected filesystem.
- Browser access works in the user's Chrome profile. External SSH ports 22 and 2222 time out from this PC; cPanel Terminal works. The approved temporary SSH key was imported and authorized, and must be revoked before migration completion.
- Explicit FTPS on port 21 to the server hostname passes TLS certificate validation. The user created `github-deploy` with its root restricted to `aliyas-deploy`, outside email folders and the live document root. Its password is held in a private local file, never in this repository.
- The 3,513,897,925-byte WordPress archive was downloaded outside the repository. Its local SHA-256 matches the server archive, and a complete archive listing succeeded with 104,443 entries, including `files/wp-config.php` and `sqldump.sql`. Private backup paths and mailbox inventory are retained only in local migration artifacts.

## Implemented deployment layout

- `aliyas-deploy`: restricted FTPS exchange directory with incoming content bundles, release requests, acknowledgements and manifests. This is not web-accessible.
- `aliyas-runtime`: deployment receiver, verified content-addressed objects, release directories and private logs. A serialized cron job checks for completed uploads once per minute.
- `aliyas-app`: stable Passenger entry point and private runtime environment. `current` will identify the active, verified release.
- `aliyas-private/enquiries`: persistent enquiry records, outside the release tree and FTP root.
- `aliyas-runtime/image-cache`: persistent generated Next.js image copies shared across releases, so deployment does not flush the image cache. Gallery/card images already use prepared responsive WebP files. Floor-plan previews request screen-sized images; the full-size viewer and PDF links retain the original source files.

Bundles contain only SHA-256 object identifiers and bounded byte lengths; they cannot contain archive paths or symlinks. The server verifies bundle and individual object hashes before adding them to its cache. Runtime files are copied into each release; immutable public assets are linked from the verified cache. Candidate routes and enquiry validation are checked on a loopback port before activation. Successful deployment state is recorded only after the HTTPS health check identifies the expected release. Failed health checks restore the preceding release. No recurring deployment deletes mail, WordPress or unrelated hosting files.

The initial seed populates the complete public tree once. To accelerate this one-time migration, large assets can be downloaded directly from this public GitHub repository to the hosting cache, with every object checked against its committed LFS SHA-256 and size. This needs no GitHub credential on the hosting account. Remaining files and runtime objects use FTPS. Later runs read the verified object inventory and last successful release manifest; only absent or changed bytes are transferred over FTPS. Git LFS pointers are used as content hashes, so unchanged large assets do not need to be downloaded from GitHub on every runner. Static bundle cleanup and retention must preserve cached clients and rollback requirements.

## Inspect after sign-in

1. Confirm the cPanel account and the exact document root for `aliyasrealestate.ae`, including any addon domains or shared directories. Do not assume the entire `public_html` directory belongs only to WordPress.
2. Inspect Setup Node.js App, Application Manager or the applicable Web Apps interface. Record supported Node versions, server OS/architecture, Passenger/startup mechanism, environment-variable support and restart procedure.
3. Check FTPS certificate/hostname/port, directory restrictions, rename support, and whether SSH or a cPanel API is available for release activation and server-side copying. Do not disable TLS certificate validation.
4. Check available disk space, file/inode quota, memory/process limits and backup capacity. Allow for the 36.39 GB public tree, app build/runtime, the existing site and rollback backups. Avoid copying the entire public tree for every release.
5. Record the existing email account inventory and routing/settings without reading mailbox contents unnecessarily. Keep mail folders, account configuration and certificates outside deployment credentials' scope.
6. Identify WordPress's exact files and database from its own configuration. Record existing URLs, redirects, cron jobs, web-server rules and SSL/ACME files. Separate unrelated databases and applications.

## Hosting requirements

FTP transfers files; it does not itself provide the Node.js runtime required by this application's enquiry endpoint and server features. Verify the production Node.js app before enabling automated activation. The user-authorized immediate WordPress removal supersedes the original zero-downtime cutover sequence below. A plain static export would require an explicit backend adaptation and is not the selected migration approach.

Build the deployment artifact for the actual Linux/runtime target. Do not upload the Windows development `node_modules` or a Windows standalone build as a Linux production package. Next.js standalone output is a candidate after the host's startup mechanism has been tested; a Passenger-specific entry point may be needed.

Set `NEXT_PUBLIC_SITE_URL=https://aliyasrealestate.ae` before the production build. Configure a private persistent `ENQUIRY_DATA_DIR` on the server, outside public files and disposable release directories. On this cPanel host the opt-in `SENDMAIL_ENABLED=true` transport can use the existing `/sbin/sendmail` service with `SMTP_FROM` and `SMTP_TO`, without copying or resetting mailbox passwords. SMTP remains available for other hosts. Candidate processes force both transports off; delivery behavior is tested with a stub and no real test email. Keep credentials out of Git, public files, workflow logs and build artifacts. Verify host/origin handling through the real HTTPS proxy.

## Migration sequence

1. Download and verify private rollback backups of the WordPress files and its specific database to a local PC directory outside this repository. Keep those backups off the hosting account after cutover. Record mail configuration and protect email data separately. Account-wide restoration is not the normal website rollback mechanism because it can overwrite newer mail.
2. Create a dedicated application/staging location whose scope excludes mailbox directories, cPanel account configuration, backups, private enquiry storage and other sites.
3. Upload the initial public assets once, with a resumable transfer manifest. Build and test the application in the hosting environment without switching the public domain yet.
4. Verify HTTPS, images/PDFs, project and journal routes, search/filters, enquiry validation/persistence, private-file denial and mail configuration. A real test message requires the user's explicit instruction; otherwise use a stubbed transport and inspect SMTP configuration.
5. Review redirects for WordPress URLs that have relevant replacements. Do not redirect every missing URL to the homepage. Preserve SSL/ACME and hosting-specific routing requirements.
6. Switch the website route/document root to the tested custom application. Keep the domain's existing email hosting and mail DNS records intact. Check public routes and compare email configuration against the preflight snapshot.
7. Remove the identified WordPress installation, its dedicated database and the other installation-specific remnants inventoried above after off-host backup verification and successful cutover. Remove a database user only if it is exclusive to this installation. This is a scoped migration step, not a recurring deployment cleanup. Retain only the off-host private rollback backup.
8. Scan the account-accessible hosting paths and installer/cron records for remaining files or registrations belonging to this WordPress installation. Check that old WordPress administration/API endpoints are no longer served. Compare email accounts, mailbox storage and routing settings against the original snapshot. Record any host-controlled scope that could not be inspected rather than claiming an account inspection covered the entire provider infrastructure.

## Incremental deployment contract

The final workflow must be implemented against verified hosting capabilities, with these properties:

- Trigger on pushes to `main` in the existing repository; serialize deployments to this site. Do not interrupt a deployment while it is activating a release.
- Run appropriate checks and build a production artifact before transfer. Build output, rather than raw source files, is the deployable application.
- Compare a SHA-256 manifest of deployment files with the **last successfully deployed manifest** stored durably on the server. A GitHub runner's temporary workspace, file timestamps alone, or the immediately previous Git commit are not sufficient baselines.
- Transfer only missing or content-changed files through encrypted FTP (FTPS), where supported. For example, changing one image must not resend all unchanged images and PDFs.
- A source edit can change several compiled pages, bundles or manifests. Those changed outputs must also deploy; do not promise that one source change always means one transferred file.
- Keep the large public asset tree shared between releases. If release directories are used, create unchanged runtime files by a supported server-side copy/link mechanism rather than retransmitting them. Activation must use the host's tested restart/release mechanism; FTP alone must not be represented as completing that step.
- Upload into temporary paths and activate only a complete release. Verify transferred files and the public health check before recording the new successful manifest. An interrupted attempt must remain retryable without claiming success.
- Never apply an account-wide or `public_html`-wide delete/mirror operation. Any future cleanup must be limited to files owned by this application's deployment manifest. Preserve prior hashed assets long enough for cached pages and rollback.
- Store deployment credentials as scoped GitHub secrets. Use a dedicated, restricted deployment account rather than exposing the whole cPanel home directory.
- Print useful changed-file counts and transferred bytes without exposing credentials or enquiry data.
- Demonstrate an unchanged second deployment, a one-asset change, a code/content change, and a failed/interrupted transfer before enabling unattended production deployment.

## Email preservation boundary

Mailbox data, email account definitions/passwords, forwarders, filters, routing mode, MX/SPF/DKIM/DMARC and service certificates are outside the website replacement and automated deployment scope. The exact server paths must be inspected first; typical cPanel `mail` and `etc` paths are examples, not verified paths for this account.

Do not delete the hosting account, reset cPanel, replace nameservers, purge the account home directory, or delete an FTP account using a mode that removes unrelated files. Do not use an account-wide restore as a casual website rollback.

## Documentation consulted

- [Next.js deployment options](https://nextjs.org/docs/app/getting-started/deploying), plus the installed 16.4.3 deployment, static-export and output-file-tracing guides.
- [Next.js standalone output](https://nextjs.org/docs/app/api-reference/config/next-config-js/output).
- [cPanel Application Manager](https://docs.cpanel.net/cpanel/software/application-manager/).
- [cPanel Node.js application setup and restart](https://docs.cpanel.net/knowledge-base/web-services/how-to-install-a-node.js-application/).
- [InMotion Setup Node.js App](https://www.inmotionhosting.com/support/edu/cpanel/setup-node-js-app/). Availability depends on the actual account/server, so the documentation is not evidence that this account has it enabled.
- [cPanel FTP Accounts](https://docs.cpanel.net/cpanel/files/ftp-accounts/).
- [cPanel Backup Wizard](https://docs.cpanel.net/cpanel/files/backup-wizard/). Full-account restoration may require the hosting provider/WHM; keep a separately usable website/database rollback backup on the local PC.
