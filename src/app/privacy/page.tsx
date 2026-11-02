import type { Metadata } from 'next';
import Link from 'next/link';
import '@/components/info-pages.css';

export const metadata: Metadata = {
  title: 'Privacy notice | Aliyas Real Estate',
  description:
    'How enquiries and saved property preferences are handled in the Aliyas Real Estate local website preview.',
  alternates: { canonical: '/privacy' },
  robots: { index: false, follow: true },
};

export default function PrivacyPage() {
  return (
    <div className="info-page info-privacy">
      <nav className="info-breadcrumb" aria-label="Breadcrumb">
        <Link href="/">Home</Link>
        <span>/</span>
        <span>Privacy notice</span>
      </nav>
      <div className="info-intro">
        <p className="info-eyebrow">YOUR INFORMATION, EXPLAINED</p>
        <h1>
          Privacy <em>notice.</em>
        </h1>
        <p>
          This notice describes the local preview of the Aliyas website. It is not a policy for a
          live brokerage service.
        </p>
      </div>
      <div className="info-prose">
        <section>
          <h2>Information you choose to share</h2>
          <p>
            The enquiry form collects your name, email address, optional telephone number, property
            interests, message and consent. It also records an enquiry reference and submission
            time. Please avoid including identity documents, payment details or other sensitive
            information in your message.
          </p>
        </section>
        <section>
          <h2>Where enquiries go</h2>
          <p>
            In this preview, enquiries are saved on the computer running the website. They are not
            sent by email or delivered to an external CRM. Saved enquiries are not publicly
            accessible through the website. Optional email delivery can be enabled by the website
            operator; when enabled, the enquiry details are also submitted to Aliyas through its
            configured email provider. The receipt screen reports whether email submission
            succeeded.
          </p>
        </section>
        <section>
          <h2>Saved properties and comparisons</h2>
          <p>
            When you save a property, its identifier is stored in your browser so you can return to
            your shortlist. You can remove a saved property using its save button, or clear this
            website’s browser storage to remove the whole shortlist. The comparison tool also stores
            up to three project identifiers in your browser. Remove individual projects or use
            “Clear comparison” to clear that selection. Browser storage is not shared between
            devices.
          </p>
        </section>
        <section>
          <h2>Analytics and tracking</h2>
          <p>
            This preview does not include advertising pixels or analytics trackers. The server may
            process standard technical request information to deliver the site. Temporary anti-spam
            controls keep counts of submissions; enquiry details are not written to application logs
            by the enquiry form.
          </p>
        </section>
        <section>
          <h2>Managing your information</h2>
          <p>
            The person operating this local preview can access or delete saved enquiries on this
            computer. Contact the person who shared the preview if you want an enquiry removed.
            Enquiries remain on that computer until removed by its operator.
          </p>
        </section>
        <section>
          <h2>Before the website goes live</h2>
          <p>
            A live service will need an appropriate retention policy and a privacy notice reflecting
            its actual hosting, enquiry delivery and analytics arrangements. This notice will need
            to be updated when those arrangements change.
          </p>
        </section>
        <section id="image-credits">
          <h2>Image credits</h2>
          <p>
            Ajman Corniche photograph by{' '}
            <a
              href="https://commons.wikimedia.org/wiki/File:Ajman_corniche.jpg"
              target="_blank"
              rel="noopener noreferrer"
            >
              Narimich, via Wikimedia Commons
            </a>
            , licensed under{' '}
            <a
              href="https://creativecommons.org/licenses/by-sa/4.0/"
              target="_blank"
              rel="noopener noreferrer"
            >
              Creative Commons Attribution-ShareAlike 4.0
            </a>
            . The photograph is cropped and resized for display. Developer logos remain the artwork
            of their respective brands. The Aliyas company profile uses the original Aliyas logo.
          </p>
        </section>
        <p className="info-updated">Preview notice · Updated 29 October 2026</p>
      </div>
    </div>
  );
}
