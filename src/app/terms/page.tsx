import type { Metadata } from 'next';
import Link from 'next/link';
import { businessContact } from '@/lib/contact';
import '@/components/info-pages.css';

export const metadata: Metadata = {
  title: 'Website terms',
  description:
    'Information about browsing Aliyas Real Estate, comparing properties and making an enquiry.',
  alternates: { canonical: '/terms' },
  robots: { index: false, follow: true },
};

export default function TermsPage() {
  return (
    <div className="info-page info-privacy">
      <nav className="info-breadcrumb" aria-label="Breadcrumb">
        <Link href="/">Home</Link>
        <span>/</span>
        <span>Website terms</span>
      </nav>
      <div className="info-intro">
        <p className="info-eyebrow">Using this website</p>
        <h1>Website terms.</h1>
        <p>
          These terms cover the use of this website. A property purchase or reservation is governed
          by its separate agreement and applicable terms.
        </p>
      </div>
      <div className="info-prose">
        <section>
          <h2>Project information</h2>
          <p>
            Prices, payment plans, handover dates and availability can change. Confirm the current
            details and final specifications in the relevant developer documents before making a
            reservation. Images do not replace the specifications in your property agreement.
          </p>
        </section>
        <section>
          <h2>Exploring and comparing</h2>
          <p>
            You can browse without an account, save project references in this browser and compare
            up to three projects. These actions do not reserve a property or create a purchase
            commitment.
          </p>
        </section>
        <section>
          <h2>Enquiries</h2>
          <p>
            An enquiry lets you describe your requirements and is stored by this website. Your
            receipt states whether it was also submitted for email delivery. Read the{' '}
            <Link href="/privacy">privacy notice</Link> before sharing your details. An enquiry does
            not reserve a property or create a purchase commitment.
          </p>
        </section>
        <section>
          <h2>Images and external websites</h2>
          <p>
            Developer and social links take you to independent websites. Image sources and
            applicable credits are listed in the{' '}
            <Link href="/privacy#image-credits">image credits</Link>.
          </p>
        </section>
        <section>
          <h2>Ask Aliyas</h2>
          <p>
            For current project information, email{' '}
            <a href={`mailto:${businessContact.email}`}>{businessContact.email}</a> or call{' '}
            <a href={`tel:${businessContact.phone}`}>{businessContact.phoneLabel}</a>.
          </p>
        </section>
      </div>
      <Link className="info-button" href="/projects">
        Explore projects
      </Link>
    </div>
  );
}
