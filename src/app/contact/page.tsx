import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowUpRight, MapPin, Phone, Mail, MessageCircle } from 'lucide-react';
import { EnquiryForm } from '@/components/enquiry-form';
import { businessContact } from '@/lib/contact';
import { socialLinks } from '@/lib/socials';
import siteImagery from '@/lib/site-imagery.json';
import '@/components/info-pages.css';

export const metadata: Metadata = {
  title: 'Contact Aliyas | Start your next chapter',
  description:
    'Tell Aliyas Real Estate what you are looking for in a UAE off-plan home. Explore new communities and send a property enquiry.',
  alternates: { canonical: '/contact' },
};

export default async function ContactPage({
  searchParams,
}: {
  searchParams: Promise<{ project?: string | string[] }>;
}) {
  const query = await searchParams;
  const project = typeof query.project === 'string' ? query.project.slice(0, 120) : '';
  return (
    <div className="info-page contact-page">
      <nav className="info-breadcrumb" aria-label="Breadcrumb">
        <Link href="/">Home</Link>
        <span>/</span>
        <span>Contact</span>
      </nav>
      <div className="info-intro" data-reveal>
        <p className="info-eyebrow">LET’S MAKE ROOM FOR WHAT’S NEXT</p>
        <h1>
          Every great move
          <br />
          starts with <em>a conversation.</em>
        </h1>
      </div>
      <div className="contact-quick-actions" aria-label="Quick contact">
        <a href={businessContact.whatsappUrl} target="_blank" rel="noopener noreferrer">
          <MessageCircle size={18} aria-hidden="true" />
          WhatsApp Aliyas
        </a>
        <a href={`tel:${businessContact.phone}`}>
          <Phone size={18} aria-hidden="true" />
          Call our office
        </a>
      </div>
      <div className="contact-grid">
        <aside className="contact-story" data-reveal>
          <p>
            Whether you have a place in mind or are just beginning to explore, tell us what matters
            to you.
          </p>
          <div className="official-contact-list">
            <a href={`tel:${businessContact.phone}`}>
              <Phone size={19} />
              <span>
                <small>CALL OUR OFFICE</small>
                {businessContact.phoneLabel}
              </span>
              <ArrowUpRight size={17} />
            </a>
            <a href={businessContact.whatsappUrl} target="_blank" rel="noopener noreferrer">
              <MessageCircle size={19} />
              <span>
                <small>CHAT ON WHATSAPP</small>
                {businessContact.mobileLabel}
              </span>
              <ArrowUpRight size={17} />
            </a>
            <a href={`mailto:${businessContact.email}`}>
              <Mail size={19} />
              <span>
                <small>EMAIL OUR TEAM</small>
                {businessContact.email}
              </span>
              <ArrowUpRight size={17} />
            </a>
            <a href={businessContact.mapUrl} target="_blank" rel="noopener noreferrer">
              <MapPin size={19} />
              <span>
                <small>VISIT ALIYAS</small>
                {businessContact.address}
              </span>
              <ArrowUpRight size={17} />
            </a>
          </div>
          <div className="contact-focus">
            <MapPin size={19} aria-hidden="true" />
            <div>
              <strong>Local perspective. A wider horizon.</strong>
              <span>Dubai · Abu Dhabi · Ras Al Khaimah · Ajman</span>
            </div>
          </div>
          <nav className="contact-socials" aria-label="Aliyas social profiles">
            {socialLinks.map((social) => (
              <a key={social.name} href={social.url} target="_blank" rel="noopener noreferrer">
                {social.name} <ArrowUpRight size={12} />
              </a>
            ))}
          </nav>
          <figure className="contact-inspiration">
            <div className="contact-image">
              <Image
                src={siteImagery.terrace.src}
                alt={siteImagery.terrace.alt}
                fill
                quality={85}
                sizes="(max-width: 850px) 90vw, 35vw"
              />
            </div>
            <figcaption>
              Space for your next chapter.<span>Illustrative lifestyle image</span>
            </figcaption>
          </figure>
          <Link className="contact-explore" href="/projects">
            Still finding your inspiration? Explore our collection <ArrowUpRight size={16} />
          </Link>
        </aside>
        <EnquiryForm project={project} />
      </div>
    </div>
  );
}
