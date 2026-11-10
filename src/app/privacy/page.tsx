import type { Metadata } from 'next';
import Link from 'next/link';
import { businessContact } from '@/lib/contact';
import '@/components/info-pages.css';

export const metadata: Metadata = {
  title: 'Privacy notice | Aliyas Real Estate',
  description:
    'How Aliyas Real Estate handles website enquiries, saved properties and comparison preferences.',
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
          This notice explains how information is handled when you browse this website, save
          properties or submit an enquiry.
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
            Enquiries are stored on the server hosting this website and are not publicly accessible
            through the website. When email delivery is enabled, enquiry details are also submitted
            to Aliyas through its email provider. Your receipt states whether your enquiry was
            submitted for email delivery. Enquiries are not transferred to an external customer
            database.
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
            This website does not include advertising pixels or analytics trackers. The server may
            process standard technical request information to deliver the site. Temporary anti-spam
            controls keep counts of submissions; enquiry details are not written to application logs
            by the enquiry form.
          </p>
        </section>
        <section>
          <h2>Managing your information</h2>
          <p>
            The website operator can access and delete saved enquiries. To request removal of an
            enquiry, email <a href={`mailto:${businessContact.email}`}>{businessContact.email}</a>{' '}
            and include your enquiry reference. Enquiries remain stored until the website operator
            removes them.
          </p>
        </section>
        <section>
          <h2>Updates to this notice</h2>
          <p>
            This notice reflects the website’s current storage, enquiry delivery and tracking
            arrangements. It will be updated when those arrangements change.
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
          <p>
            Navigation photographs: Dubai by{' '}
            <a
              href="https://www.pexels.com/photo/modern-dubai-skyline-with-burj-khalifa-30336911/"
              target="_blank"
              rel="noopener noreferrer"
            >
              AJ Ahamad
            </a>
            , Abu Dhabi by{' '}
            <a
              href="https://www.pexels.com/photo/body-of-water-near-buildings-1439332/"
              target="_blank"
              rel="noopener noreferrer"
            >
              Adnan Uddin
            </a>{' '}
            and Ajman by{' '}
            <a
              href="https://www.pexels.com/photo/modern-cityscape-of-ajman-uae-34442251/"
              target="_blank"
              rel="noopener noreferrer"
            >
              MAMADO UAE
            </a>{' '}
            are used under the{' '}
            <a href="https://www.pexels.com/license/" target="_blank" rel="noopener noreferrer">
              Pexels licence
            </a>
            .
          </p>
          <p>
            Sharjah by{' '}
            <a
              href="https://commons.wikimedia.org/wiki/File:Sharjah_city_skyline_in_2015.jpg"
              target="_blank"
              rel="noopener noreferrer"
            >
              Mueed Ahmed
            </a>
            , Ras Al Khaimah by{' '}
            <a
              href="https://commons.wikimedia.org/wiki/File:Cloudy_evening_in_RAK_city.jpg"
              target="_blank"
              rel="noopener noreferrer"
            >
              Lintophilip
            </a>{' '}
            and Fujairah by{' '}
            <a
              href="https://commons.wikimedia.org/wiki/File:Fujairah_City.jpg"
              target="_blank"
              rel="noopener noreferrer"
            >
              SurvivorNgugz
            </a>{' '}
            are licensed under{' '}
            <a
              href="https://creativecommons.org/licenses/by-sa/4.0/"
              target="_blank"
              rel="noopener noreferrer"
            >
              CC BY-SA 4.0
            </a>
            .{' '}
            <a
              href="https://commons.wikimedia.org/wiki/File:Umm_Al_Quwain_mangroves_(7267363924).jpg"
              target="_blank"
              rel="noopener noreferrer"
            >
              Umm Al Quwain mangroves by Peter Dowley
            </a>{' '}
            is licensed under{' '}
            <a
              href="https://creativecommons.org/licenses/by/2.0/"
              target="_blank"
              rel="noopener noreferrer"
            >
              CC BY 2.0
            </a>
            . The photographs are resized and cropped for display.
          </p>
        </section>
        <p className="info-updated">Updated 8 November 2026</p>
      </div>
    </div>
  );
}
