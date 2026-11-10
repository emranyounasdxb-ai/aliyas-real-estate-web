import Link from 'next/link';
import { ArrowUp, ArrowUpRight, Mail, MapPin, Phone, Smartphone } from '@/components/brand-icons';
import { Brand } from './brand';
import { EnquiryTrigger } from './enquiry-trigger';
import { SocialGlyph } from './social-glyph';
import { businessContact } from '@/lib/contact';
import { socialLinks } from '@/lib/socials';

export function Footer() {
  return (
    <footer className="site-footer">
      <div className="footer-invitation">
        <div className="container footer-invitation-inner" data-reveal>
          <div>
            <p className="footer-eyebrow">YOUR NEXT CHAPTER</p>
            <h2>Let’s find a place that feels like you.</h2>
            <p className="footer-invitation-copy">
              A considered approach to UAE off-plan property.
            </p>
          </div>
          <div className="footer-invitation-actions">
            <EnquiryTrigger className="footer-advisor">
              Speak to an advisor <ArrowUpRight size={19} strokeWidth={1.5} aria-hidden="true" />
            </EnquiryTrigger>
            <a
              className="footer-whatsapp"
              href={businessContact.whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              <SocialGlyph name="WhatsApp" />
              WhatsApp
            </a>
          </div>
        </div>
      </div>
      <div className="footer-main">
        <div className="footer-top container" data-reveal>
          <div className="footer-brand">
            <Brand light />
            <p>
              Discover UAE off-plan homes with Aliyas. Explore locations, compare projects and
              connect with our team to find a home that fits your plans.
            </p>
            <span>UAE OFF-PLAN REAL ESTATE</span>
          </div>
          <nav className="footer-links" aria-labelledby="footer-explore">
            <h2 id="footer-explore">Explore</h2>
            <Link href="/projects">Off-plan projects</Link>
            <Link href="/developers">Developers</Link>
            <Link href="/journal">The Journal</Link>
            <Link href="/about">About Aliyas</Link>
            <Link className="footer-underlined" href="/projects/compare">
              Compare projects <ArrowUpRight size={17} aria-hidden="true" />
            </Link>
          </nav>
          <nav className="footer-links" aria-labelledby="footer-places">
            <h2 id="footer-places">Find your place</h2>
            {['Dubai', 'Abu Dhabi', 'Ras Al Khaimah', 'Ajman'].map((name) => (
              <Link key={name} href={`/projects?${new URLSearchParams({ emirate: name })}`}>
                {name}
              </Link>
            ))}
            <Link className="footer-underlined" href="/projects">
              View all projects <ArrowUpRight size={17} aria-hidden="true" />
            </Link>
          </nav>
          <div className="footer-connect">
            <h2>Visit. Call. Connect.</h2>
            <a className="footer-phone" href={`tel:${businessContact.phone}`}>
              <Phone size={20} aria-hidden="true" />
              {businessContact.phoneLabel}
            </a>
            <a href={`tel:${businessContact.mobile}`}>
              <Smartphone size={20} aria-hidden="true" />
              {businessContact.mobileLabel}
            </a>
            <a href={`mailto:${businessContact.email}`}>
              <Mail size={20} aria-hidden="true" />
              {businessContact.email}
            </a>
            <a
              className="footer-address"
              href={businessContact.mapUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              <MapPin size={20} aria-hidden="true" />
              <span>{businessContact.address.replace(', Block B', '')}</span>
            </a>
            <a
              className="footer-underlined footer-directions"
              href={businessContact.mapUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              Get directions <ArrowUpRight size={17} aria-hidden="true" />
            </a>
          </div>
        </div>
        <div className="footer-social-row container">
          <div className="footer-social-group">
            <span>FOLLOW ALIYAS</span>
            <nav aria-label="Social media">
              {socialLinks.map((social) => (
                <a
                  key={social.name}
                  href={social.url}
                  aria-label={social.name}
                  title={social.name}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <SocialGlyph name={social.name} />
                </a>
              ))}
            </nav>
          </div>
          <a className="footer-back-top" href="#site-top">
            Back to top{' '}
            <span>
              <ArrowUp size={19} strokeWidth={1.5} aria-hidden="true" />
            </span>
          </a>
        </div>
        <div className="footer-bottom container">
          <span>© {new Date().getFullYear()} Aliyas Real Estate</span>
          <a href="https://aliyasgroup.com/" target="_blank" rel="noopener noreferrer">
            A project of Aliyas Group
          </a>
          <span className="footer-legal-links">
            <Link href="/privacy">Privacy policy</Link>
            <Link href="/terms">Website terms</Link>
          </span>
        </div>
      </div>
    </footer>
  );
}
