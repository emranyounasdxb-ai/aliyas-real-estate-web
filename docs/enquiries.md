# Local enquiries

`POST /api/enquiries` accepts same-origin JSON only. The input is validated with Zod, capped at 8 KiB while streaming, and protected by a honeypot and in-memory global/email submission limits. Enquiry details are not logged. Confirmation is returned only after the append operation succeeds.

Enquiries are appended as one JSON record per line to `.data/enquiries.jsonl`, outside `public`. `ENQUIRY_DATA_DIR` may point to a different private directory, for example during an isolated test. This directory must not be committed or exposed by a static server. The implementation requests private filesystem permissions where supported; on Windows use the appropriate directory ACLs. There is no public read endpoint.

The form displays an honest status after submission. With the default `SMTP_ENABLED=false`, it explains that the enquiry was saved locally and no email was sent. It provides direct phone and WhatsApp links using the business details supplied by Aliyas, centralized in `src/lib/contact.ts`.

## Optional SMTP delivery

Nodemailer 10.3.0 provides an opt-in adapter. Set `SMTP_ENABLED=true` together with `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `SMTP_FROM` and `SMTP_TO` in an untracked environment file or the hosting secret manager. The `FROM` address must be an address the SMTP provider permits. The `TO` address is the receiving business inbox. Both are single email addresses. Port 465 uses implicit TLS; other ports require STARTTLS. Certificate validation stays enabled. No credentials have been supplied, and no test email has been sent.

The server saves the enquiry before attempting SMTP. The response distinguishes `not_configured`, `accepted` and `failed`. `accepted` means the SMTP server accepted the message for delivery, not that it arrived in a person's inbox. A failed or disabled delivery never claims the business received an email. The saved receipt remains available, and the user sees direct contact options. An operational status record, without enquiry content, is appended to `.data/enquiry-delivery.jsonl`. There is no automatic retry, duplicate email send, or public endpoint for reading these records.

The SMTP transport sends plain text to a fixed, configured inbox, places the visitor's validated email in `Reply-To`, disables external file/URL access, and has bounded connection timeouts. Provider errors and credentials are not logged. The local form can be tested without email using browser request interception or the disabled default.

## Enquiry drawer

`EnquiryTrigger` opens a native modal dialog with a desktop right drawer and mobile bottom sheet. It accepts `projectSlug`, `projectName`, `initialMessage`, `children` and `className`. The mounted form preserves entered values when closed and reopened. Native modal semantics contain keyboard focus; Escape, backdrop and the close button close it and restore trigger focus. It restores document scroll styles on close/unmount, marks the dialog with `data-lenis-prevent`, and emits `aliyas:enquiry-visibility` with `{open: boolean}` so MotionProvider stops/resumes Lenis. Links inside the drawer close it before navigating.

## Before production

- Configure a durable private datastore and shared rate limiter suitable for the hosting topology. Ephemeral/serverless filesystems are not supported by this local persistence implementation.
- Set verified business contact details, a retention/deletion process and the appropriate live privacy notice.
- Configure and verify the optional SMTP provider if email delivery is required. A CRM adapter is not included because no CRM has been specified. Keep the privacy notice aligned with actual delivery and storage arrangements.
- Ensure HTTPS and proxy configuration preserve the actual destination `Host` header. The browser's `Origin` must match that host. For HTTPS termination in front of HTTP Node, set `NEXT_PUBLIC_SITE_URL` to the fixed public HTTPS origin. The implementation does not trust `x-forwarded-host` or `x-forwarded-proto` for this check. Do not trust arbitrary forwarded headers for abuse controls.
- Restrict filesystem access, backups and operational access to enquiry data. Apply suitable anti-abuse protection before exposing the endpoint publicly.

The local storage design is intentionally small and reviewable. It is not represented as a distributed production enquiry system.
