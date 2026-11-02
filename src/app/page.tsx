import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import {
  ArrowDown,
  ArrowUpRight,
  House,
  KeyRound,
  Phone,
  MapPin,
  Heart,
  Layers,
  SlidersHorizontal,
  MessageCircle,
  Bookmark,
  Building2,
  BookOpen,
} from '@/components/brand-icons';
import { DeveloperMarquee } from '@/components/developer-marquee';
import { HomeProjectActions } from '@/components/home-project-actions';
import { HomeSearch } from '@/components/home-search';
import { FAQ } from '@/components/faq';
import { EnquiryTrigger } from '@/components/enquiry-trigger';
import { LuxuryHomeMotion } from '@/components/luxury-home-motion';
import { HomeDestinationCard } from '@/components/home-destination-card';
import { businessContact } from '@/lib/contact';
import { socialLinks } from '@/lib/socials';
import siteImagery from '@/lib/site-imagery.json';
import { projects, developers, legacyArticles as articles } from '@/lib/content';

export const metadata: Metadata = {
  title: { absolute: 'Aliyas Real Estate | Find your next home in the UAE' },
  description:
    'Explore UAE off plan homes with Aliyas. Discover Dubai, Abu Dhabi, Ras Al Khaimah and Ajman, compare projects and build your personal shortlist.',
  alternates: { canonical: '/' },
};
const services = [
  {
    title: 'Find your setting',
    image: siteImagery.marina.src,
    text: 'Explore Dubai, Abu Dhabi, Ras Al Khaimah and Ajman. Start with the place you would like to call home.',
    href: '#home-destinations',
    action: 'Explore destinations',
  },
  {
    title: 'Discover off plan homes',
    image: siteImagery.beachfront.src,
    text: 'Explore the collection by property type, location and budget. Each preview has a dedicated detail page.',
    href: '#find-a-home',
    action: 'Find a home',
  },
  {
    title: 'Build your shortlist',
    image: siteImagery.studio.src,
    text: 'Save the homes that catch your eye. Compare up to three projects side by side, at your own pace.',
    href: '/projects?saved=1',
    action: 'Open saved projects',
  },
  {
    title: 'Connect with Aliyas',
    image: siteImagery.arrival.src,
    text: 'Tell our team what you are looking for. Request current project details, brochures and availability directly.',
    href: '/contact',
    action: 'Contact our team',
  },
];
const settings = [
  {
    title: 'Private villas',
    caption: 'Room to live your way',
    image: siteImagery.desertVilla.src,
    href: '/projects?collection=villas',
  },
  {
    title: 'City residences',
    caption: 'At the heart of it all',
    image: siteImagery.penthouse.src,
    href: '/projects?collection=city',
  },
  {
    title: 'Waterfront living',
    caption: 'A different rhythm',
    image: siteImagery.waterfrontVilla.src,
    href: '/projects?collection=waterfront',
  },
  {
    title: 'Dubai',
    caption: 'A new perspective',
    image: siteImagery.waterfrontCity.src,
    href: '/projects?emirate=Dubai',
  },
  {
    title: 'Abu Dhabi',
    caption: 'Space to find your place',
    image: siteImagery.mangrove.src,
    href: '/projects?emirate=Abu+Dhabi',
  },
  {
    title: 'Ras Al Khaimah',
    caption: 'A wider horizon',
    image: siteImagery.mountain.src,
    href: '/projects?emirate=Ras+Al+Khaimah',
  },
  {
    title: 'Ajman',
    caption: 'A coastal outlook',
    image: '/images/ajman.jpg',
    href: '/projects?emirate=Ajman',
  },
  {
    title: 'Apartment living',
    caption: 'Consider every detail',
    image: siteImagery.beachfront.src,
    href: '/projects?type=Apartment',
  },
  {
    title: 'Townhouses',
    caption: 'A place to grow',
    image: siteImagery.townhomes.src,
    href: '/projects?type=Townhouse',
  },
  {
    title: 'Considered interiors',
    caption: 'A different way to live',
    image: siteImagery.kitchen.src,
    href: '/journal/a-home-that-feels-like-you',
  },
  {
    title: 'Room for family',
    caption: 'Explore the villa collection',
    image: siteImagery.golf.src,
    href: '/projects?type=Villa',
  },
  {
    title: 'Design perspectives',
    caption: 'Discover the developers',
    image: siteImagery.facade.src,
    href: '/developers',
  },
];
const settingColumns = [
  [0, 5],
  [1, 6, 9],
  [2, 7],
  [3, 8, 10],
  [4, 11],
];
const journalCovers = [
  '/images/concept-apartment-interior.png',
  '/images/journal-neighbourhood-study.svg',
  '/images/journal-floor-plan-study.svg',
];
function ContactPill({ light = false }: { light?: boolean }) {
  return (
    <EnquiryTrigger className={`lux-pill ${light ? 'lux-pill-light' : ''}`}>
      <span className="lux-pill-icon">
        <Phone size={17} />
      </span>
      Let’s talk
      <ArrowUpRight size={17} />
    </EnquiryTrigger>
  );
}
export default function Home() {
  return (
    <div className="lux-home" data-luxury-home>
      <LuxuryHomeMotion />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'RealEstateAgent',
            name: 'Aliyas Real Estate',
            url: process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',
            telephone: businessContact.phone,
            email: businessContact.email,
            logo: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/brand/aliyas-gold-logo-hd.webp`,
            address: {
              '@type': 'PostalAddress',
              streetAddress: 'Office 218, Block B, Business Village',
              addressLocality: 'Dubai',
              addressCountry: 'AE',
            },
            sameAs: socialLinks.map((s) => s.url),
          }).replace(/</g, '\\u003c'),
        }}
      />
      <section className="lux-hero" aria-labelledby="lux-title">
        <div className="lux-hero-copy">
          <p className="lux-hero-overline">
            <span className="lux-dot" /> Aliyas real estate <span>Dubai · UAE</span>
          </p>
          <div className="lux-hero-title">
            <p data-lux-enter>A place for what comes next</p>
            <h1 id="lux-title">
              <span data-lux-line>Find your place.</span>
              <span data-lux-line>Shape your</span>
              <span data-lux-line>next chapter.</span>
            </h1>
            <p className="lux-hero-sub" data-lux-enter>
              Discover homes taking shape across the UAE. Explore by location, compare your
              favourites and connect with Aliyas.
            </p>
            <div className="lux-hero-actions" data-lux-enter>
              <a href="#home-projects" className="lux-pill">
                Explore projects <ArrowUpRight size={24} />
              </a>
              <span>
                Browse at your pace.
                <br />
                No account needed.
              </span>
            </div>
          </div>
          <div className="lux-hero-proof" data-lux-enter>
            <span>
              <b>04</b> UAE destinations
            </span>
            <span>
              <b>{developers.length}</b> Developer profiles
            </span>
            <span className="lux-hero-proof-note">One personal shortlist.</span>
          </div>
        </div>
        <div className="lux-hero-image">
          <Image
            src="/images/burj-al-arab-beach.webp"
            alt="Burj Al Arab seen from Jumeirah Beach in Dubai"
            fill
            sizes="(max-width:700px) 700px, 1400px"
            loading="eager"
            fetchPriority="high"
          />
          <span className="lux-hero-photo-label">A different perspective on home</span>
          <div className="lux-image-bottom">
            <div>
              <span>01 / The UAE collection</span>
              <strong>Life, with a wider horizon.</strong>
            </div>
            <span className="lux-hero-location">
              <MapPin size={20} /> Jumeirah, Dubai
            </span>
          </div>
        </div>
      </section>
      <section
        className="lux-find lux-container"
        id="find-a-home"
        aria-labelledby="lux-search-title"
      >
        <div className="lux-section-head">
          <div>
            <p className="lux-kicker">
              <span /> Find your starting point
            </p>
            <h2 id="lux-search-title">A home, on your terms.</h2>
          </div>
          <Link href="/projects" className="lux-text-link">
            Explore all projects
            <ArrowUpRight size={17} />
          </Link>
        </div>
        <HomeSearch />
        <DeveloperMarquee developers={developers.map(({ slug, name }) => ({ slug, name }))} />
      </section>
      <section className="lux-collection" id="home-projects" aria-labelledby="collection-heading">
        <div className="lux-collection-heading lux-section-head">
          <div>
            <p className="lux-kicker">
              <span /> The collection
            </p>
            <h2 id="collection-heading">
              Find a home.
              <br />
              Make it yours.
            </h2>
          </div>
          <p>
            Explore a selection of off plan previews.
            <br />
            Find the details that matter to you.
          </p>
        </div>
        <div className="lux-project-grid">
          {projects.slice(0, 3).map((project, index) => (
            <article className="lux-project-card" key={project.slug} data-lux-card>
              <Link
                href={`/projects/${project.slug}`}
                className="lux-project-visual"
                aria-label={`${project.name} by ${project.developer}, ${project.emirate}. Illustrative project preview.`}
              >
                <Image
                  src={project.image}
                  alt={`${project.name} — illustrative architecture, not project photography`}
                  fill
                  sizes="(max-width:700px) 95vw, 48vw"
                />
                <span className="lux-card-top">
                  <span className="lux-project-number">0{index + 1}</span>
                  <span className="lux-circle-arrow">
                    <ArrowUpRight size={22} />
                  </span>
                </span>
                <div className="lux-card-title">
                  <h3>{project.name}</h3>
                  <p>
                    {project.developer} · {project.emirate}
                  </p>
                </div>
                <span className="lux-preview-tag">Illustrative preview</span>
              </Link>
              <HomeProjectActions slug={project.slug} name={project.name} />
            </article>
          ))}
          <HomeDestinationCard />
        </div>
        <div className="lux-collection-foot">
          <p>
            Preview collection. Photography and details are illustrative.
            <br />
            Ask Aliyas for current developer information.
          </p>
          <Link className="lux-pill lux-pill-light" href="/projects">
            All projects
            <ArrowUpRight size={18} />
          </Link>
        </div>
      </section>
      <section className="lux-panorama" aria-label="Discover a different perspective on UAE living">
        <div className="lux-panorama-stage" data-lux-panorama>
          <div className="lux-panorama-icons" aria-hidden="true">
            <House size={18} />
            <KeyRound size={18} />
          </div>
          <div className="lux-panorama-image">
            <Image
              src={siteImagery.waterfrontCity.src}
              alt={siteImagery.waterfrontCity.alt}
              fill
              sizes="100vw"
              quality={85}
            />
            <div className="lux-panorama-shade" />
            <div className="lux-panorama-marquee" aria-hidden="true">
              A place for your next chapter <span>·</span> A different perspective <span>·</span> A
              place for your next chapter
            </div>
            <p className="lux-panorama-caption">
              Explore the possibilities. Find your place. · Illustrative cityscape
            </p>
          </div>
          <span className="lux-scroll-cue">
            Scroll to discover <ArrowDown size={15} />
          </span>
        </div>
      </section>
      <section className="lux-about lux-container" aria-labelledby="lux-about-title">
        <div className="lux-about-copy">
          <div data-lux-reveal>
            <p className="lux-kicker">
              <span /> The Aliyas perspective
            </p>
            <h2
              id="lux-about-title"
              className="lux-tagline"
              aria-label="Less searching. More finding your place."
            >
              {['Less searching.', 'More finding', 'your place.'].map((line, index) => (
                <span className="lux-tagline-line" key={line}>
                  {line.split(' ').map((word, wordIndex) => (
                    <span data-tagline-word key={wordIndex}>
                      {word}{' '}
                    </span>
                  ))}
                </span>
              ))}
            </h2>
            <p className="lux-about-intro">
              Find the locations and homes that fit your plans. Keep your shortlist in one place,
              then ask Aliyas for the details that matter.
            </p>
            <Link className="lux-team-link" href="/about">
              <span className="lux-logo-dp">
                <Image src="/brand/aliyas-gold-logo-hd.webp" alt="" width={100} height={38} />
              </span>
              <span>
                Meet Aliyas
                <br />
                <b>Your real estate connection</b>
              </span>
              <ArrowUpRight size={18} />
            </Link>
          </div>
          <div className="lux-about-note">
            <span>Based in Dubai</span>
            <p>
              Explore the possibilities online.
              <br />
              Talk through the details with our team.
            </p>
          </div>
        </div>
        <div className="lux-about-visual" data-lux-parallax>
          <Image
            src={siteImagery.arrival.src}
            alt={siteImagery.arrival.alt}
            fill
            sizes="(max-width:700px) 95vw, 48vw"
            quality={85}
          />
          <div className="lux-about-top">
            <ContactPill light />
          </div>
          <div className="lux-consult-card">
            <span className="lux-logo-dp">
              <Image src="/brand/aliyas-gold-logo-hd.webp" alt="" width={100} height={38} />
            </span>
            <div>
              <span>A conversation, built around you.</span>
              <EnquiryTrigger className="lux-consult-trigger">
                Let’s find your next home
                <ArrowUpRight size={19} />
              </EnquiryTrigger>
            </div>
          </div>
          <span className="lux-concept-label">Architectural concept</span>
        </div>
      </section>
      <section className="lux-services" aria-labelledby="lux-services-title">
        <div className="lux-services-upper">
          <div data-lux-reveal>
            <p className="lux-kicker">
              <span /> A considered process
            </p>
            <h2 id="lux-services-title">
              Your next move,
              <br />
              made clearer.
            </h2>
            <Link href="/contact" className="lux-text-link">
              Speak with Aliyas
              <ArrowUpRight size={18} />
            </Link>
          </div>
          <div className="lux-service-list">
            {services.map((service, index) => (
              <details className="lux-service" key={service.title} data-lux-service>
                <summary>
                  <span className="lux-service-thumb">
                    <Image
                      src={service.image}
                      alt=""
                      fill
                      quality={85}
                      sizes="(max-width:700px) 56px, 110px"
                    />
                  </span>
                  <span>
                    {service.title}
                    <sup>0{index + 1}</sup>
                  </span>
                  <ArrowDown size={21} />
                </summary>
                <div>
                  <p>{service.text}</p>
                  <Link href={service.href}>
                    {service.action}
                    <ArrowUpRight size={16} />
                  </Link>
                </div>
              </details>
            ))}
          </div>
        </div>
        <div className="lux-service-ribbon" aria-hidden="true">
          <div className="lux-service-ribbon-track">
            {[0, 1].map((copy) => (
              <div className="lux-service-ribbon-group" key={copy}>
                <span>Considered places</span>
                <span>Meaningful connections</span>
                <span>Your next chapter</span>
              </div>
            ))}
          </div>
        </div>
        <div className="lux-journey" data-lux-journey>
          <p className="lux-kicker">From discovery to conversation</p>
          <h2>A clearer path to your next home.</h2>
          <div className="lux-circle-stage" aria-hidden="true">
            <div className="lux-journey-circle lux-circle-one">
              <span>
                Discover
                <br />
                your possibilities
              </span>
            </div>
            <div className="lux-journey-circle lux-circle-two">
              <span>
                Shortlist
                <br />
                what feels right
              </span>
            </div>
            <div className="lux-journey-circle lux-circle-three">
              <span>
                Connect
                <br />
                with Aliyas
              </span>
            </div>
            <div className="lux-journey-result">
              Your next
              <br />
              chapter.
            </div>
          </div>
          <ol className="lux-sr-only">
            <li>Discover your possibilities.</li>
            <li>Shortlist what feels right.</li>
            <li>Connect with Aliyas about your next chapter.</li>
          </ol>
          <a className="lux-pill lux-pill-light" href="#find-a-home">
            Make your next move
            <ArrowUpRight size={17} />
          </a>
        </div>
      </section>
      <section className="lux-values lux-container" aria-labelledby="lux-values-title">
        <div className="lux-section-head" data-lux-reveal>
          <div>
            <p className="lux-kicker">
              <span /> Built around your search
            </p>
            <h2 id="lux-values-title">
              More clarity.
              <br />
              Room to decide.
            </h2>
          </div>
          <ContactPill />
        </div>
        <div className="lux-value-grid">
          {[
            {
              icon: MapPin,
              title: 'Start with your kind of place',
              copy: 'Compare four UAE destinations and find the setting that suits the way you want to live.',
            },
            {
              icon: Layers,
              title: 'See your options clearly',
              copy: 'Compare up to three projects together, with the details that matter in one view.',
            },
            {
              icon: Bookmark,
              title: 'Keep a shortlist that stays',
              copy: 'Save the homes you like in this browser. Come back to them whenever you are ready.',
            },
            {
              icon: MessageCircle,
              title: 'Go beyond the preview',
              copy: 'Ask Aliyas for current brochures, availability and project information before your next step.',
            },
          ].map(({ icon: Icon, title, copy }) => (
            <div key={title} data-lux-reveal>
              <Icon size={22} strokeWidth={1.4} />
              <h3>{title}</h3>
              <p>{copy}</p>
            </div>
          ))}
        </div>
      </section>
      <section className="lux-settings" aria-labelledby="lux-settings-title">
        <div className="lux-centred-heading" data-lux-reveal>
          <p className="lux-kicker">
            <span /> Places and possibilities
          </p>
          <h2 id="lux-settings-title">
            Different places.
            <br />
            One feeling. Home.
          </h2>
          <p>Start with the life you imagine. Illustrative lifestyle scenes.</p>
        </div>
        <div className="lux-settings-grid">
          {settingColumns.map((indices, column) => (
            <div
              className={`lux-setting-column lux-setting-column-${column}`}
              key={column}
              data-lux-setting-column
            >
              {indices.map((index) => {
                const item = settings[index];
                return (
                  <Link
                    className={`lux-setting lux-setting-${index}`}
                    href={item.href}
                    key={item.title}
                    data-lux-setting
                  >
                    <Image
                      src={item.image}
                      alt=""
                      fill
                      quality={85}
                      sizes="(max-width:700px) 400px, (max-width:1100px) 520px, 800px"
                    />
                    <span className="lux-circle-arrow">
                      <ArrowUpRight size={19} />
                    </span>
                    <div>
                      <span>{String(index + 1).padStart(2, '0')}</span>
                      <h3>{item.title}</h3>
                    </div>
                  </Link>
                );
              })}
              {column === 2 && (
                <div className="lux-setting-invitation">
                  <span className="lux-logo-dp">
                    <Image
                      src="/brand/aliyas-gold-logo-hd.webp"
                      alt="Aliyas Real Estate"
                      width={100}
                      height={38}
                    />
                  </span>
                  <p>
                    Explore a world of
                    <br />
                    possibilities. Find the
                    <br />
                    place that feels like you.
                  </p>
                  <Link className="lux-pill" href="/projects">
                    Explore projects
                    <ArrowUpRight size={18} />
                  </Link>
                </div>
              )}
            </div>
          ))}
        </div>
        <div className="lux-settings-foot">
          <p>Inspiration imagery · Preview collections</p>
          <Link className="lux-pill" href="/projects">
            Explore every possibility
            <ArrowUpRight size={18} />
          </Link>
        </div>
      </section>
      <section className="lux-journal lux-container" aria-labelledby="lux-journal-title">
        <div className="lux-section-head" data-lux-reveal>
          <div>
            <p className="lux-kicker">
              <span /> The Journal
            </p>
            <h2 id="lux-journal-title">A little foresight.</h2>
          </div>
          <Link href="/journal" className="lux-text-link">
            All stories
            <ArrowUpRight size={18} />
          </Link>
        </div>
        <div className="lux-journal-grid">
          {articles.map((article, index) => (
            <Link href={`/journal/${article.slug}`} key={article.slug} data-lux-reveal>
              <div className="lux-journal-image">
                <Image
                  src={journalCovers[index]}
                  alt=""
                  fill
                  sizes="(max-width:700px) 92vw, 32vw"
                />
                <span className="lux-circle-arrow">
                  <ArrowUpRight size={20} />
                </span>
              </div>
              <p>
                {article.category}
                <span>{article.readTime}</span>
              </p>
              <h3>{article.title}</h3>
            </Link>
          ))}
        </div>
      </section>
      <section className="lux-faq lux-container">
        <div data-lux-reveal>
          <p className="lux-kicker">
            <span /> A little clarity
          </p>
          <h2>
            Answers for
            <br />
            your next move.
          </h2>
          <p>
            A few things to know as you explore.
            <br />
            For anything else, we’re a conversation away.
          </p>
          <ContactPill />
        </div>
        <FAQ />
      </section>
      <section
        className="lux-final lux-container"
        aria-labelledby="lux-final-title"
        data-lux-reveal
      >
        <div>
          <p className="lux-kicker">
            <span /> Your next chapter
          </p>
          <h2 id="lux-final-title">
            A shortlist today.
            <br />A clearer picture tomorrow.
          </h2>
          <p>Explore the collection at your own pace. No account needed.</p>
        </div>
        <Link className="lux-pill lux-pill-light" href="/projects">
          Explore projects <ArrowUpRight size={24} />
        </Link>
      </section>
    </div>
  );
}
