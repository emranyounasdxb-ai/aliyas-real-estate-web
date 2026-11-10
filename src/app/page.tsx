import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowUpRight, MapPin, Plus } from '@/components/brand-icons';
import { DeveloperMarquee } from '@/components/developer-marquee';
import { EnquiryTrigger } from '@/components/enquiry-trigger';
import { HomeProjectActions } from '@/components/home-project-actions';
import { HomePropertyBrief } from '@/components/home-property-brief';
import { HomeBuyingJourney, HomePropertyPlan } from '@/components/home-reference-sections';
import { HomeSearch } from '@/components/home-search';
import { HomeTagline } from '@/components/home-tagline';
import { JournalCover } from '@/components/journal-cover';
import { ResponsiveProjectImage } from '@/components/responsive-project-image';
import { businessContact } from '@/lib/contact';
import { cataloguePropertyTypes } from '@/lib/catalogue-locations';
import { articles } from '@/lib/content';
import { developerProjectHref } from '@/lib/developer-project-url';
import { developers } from '@/lib/developers';
import { getHomeCollection, type HomeCollectionProject } from '@/lib/home-collection';
import { getPublicListings } from '@/lib/public-listings';
import { getProjectImageResponsiveWidth } from '@/lib/project-media';
import { socialLinks } from '@/lib/socials';
import './home-property.css';
import './home-editorial.css';
import './home-reference-sections.css';

export const metadata: Metadata = {
  title: { absolute: 'Aliyas Real Estate | UAE homes, with a clearer way to buy' },
  description:
    'Find your next UAE property with Aliyas. Compare off plan homes, prices, payment plans and locations, then speak with our Dubai based team about your shortlist.',
  alternates: { canonical: '/' },
};
const dateFormatter = new Intl.DateTimeFormat('en-GB', {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
  timeZone: 'UTC',
});
const homeTypes = [
  { label: 'Apartments', value: 'Apartment' },
  { label: 'Villas', value: 'Villa' },
  { label: 'Townhouses', value: 'Townhouse' },
] as const;
const questions = [
  [
    'Where should I start?',
    'Start with your budget, preferred location and whether you are buying a home or an investment. Explore the collection or send the team your preferences for a personal conversation.',
  ],
  [
    'Can I compare projects side by side?',
    'Yes. Select Compare on up to three project cards, then open your comparison to review their prices, locations, home types and payment plans together.',
  ],
  [
    'How do I get a quotation for a specific home?',
    'Open the project and send an enquiry. The team can discuss current units, the payment schedule and the costs to include in your buying budget.',
  ],
  [
    'What can I see before speaking to the team?',
    'Project pages bring together the location, images, home types and key details. Browse the available floor plans and save the homes you would like to discuss.',
  ],
  [
    'Can I speak to someone directly?',
    'Call or WhatsApp the Aliyas team using the links below. If you have already found a project, include its name so the conversation starts with the home you have in mind.',
  ],
  [
    'Can I visit Aliyas in Dubai?',
    'Yes. Our office is at Office 218, Business Village, Dubai. Contact the team to arrange a time and bring your questions or saved project shortlist.',
  ],
] as const;

function HomeProjectCard({ project }: { project: HomeCollectionProject }) {
  const { editorial } = project;
  return (
    <article className="hp-project-card" data-home-project={project.id}>
      <Link
        href={developerProjectHref(project)}
        prefetch={false}
        className="hp-project-image"
        aria-label={`${editorial.setting} — explore ${project.name}`}
        data-reveal
      >
        <ResponsiveProjectImage
          src={project.image}
          responsiveWidth={project.imageResponsiveWidth}
          alt={project.imageAlt || project.name}
          fill
          sizes="(max-width:700px) 100vw, (max-width:1440px) 60vw, 880px"
          style={project.imagePosition ? { objectPosition: project.imagePosition } : undefined}
        />
        <span className="hp-setting">{editorial.setting}</span>
        <span className="hp-image-arrow">
          <ArrowUpRight size={20} aria-hidden="true" />
        </span>
      </Link>
      <div className="hp-project-content" data-reveal data-reveal-delay="0.12">
        <p className="hp-project-developer">
          {project.developerName} <span>·</span> {project.emirate}
        </p>
        <h3>
          <Link href={developerProjectHref(project)} prefetch={false}>
            {project.name}
          </Link>
        </h3>
        <p className="hp-project-location">
          <MapPin size={16} aria-hidden="true" />
          {project.location}
        </p>
        <p className="hp-project-description">{editorial.summary}</p>
        <dl className="hp-project-facts">
          <div>
            <dt>{editorial.priceLabel}</dt>
            <dd>AED {(editorial.startingPrice / 1_000_000).toFixed(1)}M</dd>
          </div>
          <div>
            <dt>Payment plan</dt>
            <dd>{editorial.plan}</dd>
          </div>
          <div>
            <dt>{editorial.timingLabel}</dt>
            <dd>{editorial.timing}</dd>
          </div>
        </dl>
        <div className="hp-project-actions-row">
          <Link className="hp-text-link" href={developerProjectHref(project)} prefetch={false}>
            View project <ArrowUpRight size={18} aria-hidden="true" />
          </Link>
          <HomeProjectActions slug={project.id} legacySlug={project.slug} name={project.name} />
        </div>
        <a
          className="hp-project-source"
          href={editorial.source}
          target="_blank"
          rel="noopener noreferrer"
        >
          Developer information <ArrowUpRight size={12} aria-hidden="true" />
        </a>
      </div>
    </article>
  );
}

export default function Home() {
  const listings = getPublicListings();
  const heroProject = listings.find((project) => project.id === 'aldar-project-02')!;
  const featured = getHomeCollection();
  const availableTypes = cataloguePropertyTypes(listings);
  const latestStories = [...articles]
    .sort((a, b) => (b.date || '').localeCompare(a.date || ''))
    .slice(0, 3);
  const serviceImage =
    '/images/projects/select-group/artistry-two-residences/artistry-two-residences-living-a847d4ff296f.jpg';
  return (
    <div className="hp-home hp-editorial">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'RealEstateAgent',
            name: 'Aliyas Real Estate',
            url: process.env.NEXT_PUBLIC_SITE_URL || businessContact.website,
            telephone: businessContact.phone,
            email: businessContact.email,
            logo: `${process.env.NEXT_PUBLIC_SITE_URL || businessContact.website.replace(/\/$/, '')}/brand/aliyas-gold-logo-hd.webp`,
            address: {
              '@type': 'PostalAddress',
              streetAddress: 'Office 218, Business Village',
              addressLocality: 'Dubai',
              addressCountry: 'AE',
            },
            sameAs: socialLinks.map((social) => social.url),
          }).replace(/</g, '\u003c'),
        }}
      />
      <section className="hp-hero" aria-labelledby="hp-title">
        <ResponsiveProjectImage
          className="hp-hero-background"
          src={heroProject.image}
          responsiveWidth={heroProject.imageResponsiveWidth}
          alt="Talay villa exterior, developer render"
          fill
          sizes="100vw"
          loading="eager"
          fetchPriority="high"
        />
        <div className="hp-shell hp-hero-inner">
          <div className="hp-hero-copy" data-reveal>
            <p className="hp-eyebrow">UAE PROPERTY · ALIYAS REAL ESTATE</p>
            <h1 id="hp-title">
              A new address.
              <br />
              <span>A new way to live.</span>
            </h1>
            <p className="hp-hero-intro">
              Discover off plan homes across the UAE. Find the setting, the space and the investment
              that feels right for you.
            </p>
            <div className="hp-hero-actions">
              <Link className="hp-button hp-button-gold" href="#find-a-home">
                Find my property <ArrowUpRight size={20} aria-hidden="true" />
              </Link>
            </div>
            <div className="hp-hero-proof" aria-label="The Aliyas collection">
              <div>
                <strong>{listings.length}</strong>
                <span>project profiles</span>
              </div>
              <div>
                <strong>{developers.length}</strong>
                <span>developers</span>
              </div>
              <div>
                <strong>7</strong>
                <span>emirates</span>
              </div>
            </div>
          </div>
          <div className="hp-hero-bottom">
            <p>
              UAE homes. <span>A personal point of contact.</span>
            </p>
            <Link
              className="hp-hero-project"
              href={developerProjectHref(heroProject)}
              prefetch={false}
            >
              <span>IN THE PICTURE · ABU DHABI</span>
              <strong>
                Talay, Saadiyat Island <ArrowUpRight size={18} aria-hidden="true" />
              </strong>
            </Link>
          </div>
        </div>
      </section>
      <section className="hp-search hp-shell" id="find-a-home" aria-labelledby="hp-search-title">
        <div className="hp-search-content">
          <div className="hp-search-heading">
            <h2 id="hp-search-title">What does your next home look like?</h2>
            <p className="hp-hero-details">
              Explore <strong>{listings.length} project profiles</strong> across the UAE
            </p>
          </div>
          <HomeSearch propertyTypes={availableTypes} />
          <nav className="hp-type-links" aria-label="Browse homes by property type">
            <span>Start with a home type</span>
            {homeTypes
              .filter((item) => availableTypes.includes(item.value))
              .map((item) => (
                <Link
                  key={item.value}
                  href={`/projects?${new URLSearchParams({ type: item.value })}`}
                >
                  {item.label}
                  <ArrowUpRight size={14} aria-hidden="true" />
                </Link>
              ))}
          </nav>
        </div>
      </section>
      <div className="hp-network hp-shell">
        <DeveloperMarquee developers={developers.map(({ slug, name }) => ({ slug, name }))} />
      </div>
      <section className="hp-projects" id="home-projects" aria-labelledby="hp-projects-title">
        <div className="hp-shell">
          <div className="hp-section-head" data-reveal>
            <div>
              <p className="hp-eyebrow">SELECTED FROM THE COLLECTION</p>
              <h2 id="hp-projects-title">
                Remarkable homes.
                <br />A place for your plans.
              </h2>
            </div>
            <div>
              <p>
                A city apartment or space for family life.
                <br />
                Begin with a home that fits your priorities.
              </p>
              <Link className="hp-text-link" href="/projects">
                Explore all projects <ArrowUpRight size={18} aria-hidden="true" />
              </Link>
            </div>
          </div>
          <div className="hp-project-grid">
            {featured.map((project) => (
              <HomeProjectCard key={project.id} project={project} />
            ))}
          </div>
          <div className="hp-collection-note">
            <p>
              Developer starting prices. Ask Aliyas for current units and a personalised quotation.
            </p>
            <Link href="/projects/compare">
              Open your comparison <ArrowUpRight size={16} aria-hidden="true" />
            </Link>
          </div>
        </div>
      </section>
      <HomeBuyingJourney />
      <section className="hp-service" aria-label="Your property search with Aliyas">
        <ResponsiveProjectImage
          className="hp-service-background"
          src={serviceImage}
          responsiveWidth={getProjectImageResponsiveWidth(serviceImage)}
          alt="Artistry Two Residences living and dining room, developer render"
          fill
          sizes="100vw"
        />
        <div className="hp-shell hp-service-layout">
          <div className="hp-service-copy">
            <p className="hp-eyebrow">YOUR PLANS, OUR STARTING POINT</p>
            <HomeTagline />
            <p className="hp-service-intro" data-reveal>
              A property search should leave you with clear choices. Tell us what matters, and let’s
              work through the details together.
            </p>
            <ol className="hp-service-steps">
              <li data-reveal>
                <span>01</span>
                <div>
                  <h3>Start with your priorities.</h3>
                  <p>Your budget, location and the way you want to live or invest.</p>
                </div>
              </li>
              <li data-reveal data-reveal-delay="0.08">
                <span>02</span>
                <div>
                  <h3>Look at the whole picture.</h3>
                  <p>Compare the price, payment schedule, floor plan and neighbourhood.</p>
                </div>
              </li>
              <li data-reveal data-reveal-delay="0.16">
                <span>03</span>
                <div>
                  <h3>Make your next move personal.</h3>
                  <p>Speak with the team about the homes on your shortlist.</p>
                </div>
              </li>
            </ol>
            <Link className="hp-service-caption" href={developerProjectHref(featured[0])}>
              Inside Artistry Two Residences <ArrowUpRight size={14} aria-hidden="true" />
            </Link>
          </div>
          <HomePropertyBrief />
        </div>
      </section>
      <section className="hp-faq" aria-labelledby="hp-faq-title">
        <div className="hp-shell">
          <div className="hp-section-head" data-reveal>
            <div>
              <p className="hp-eyebrow">BEFORE YOUR NEXT STEP</p>
              <h2 id="hp-faq-title">Before you make your move.</h2>
            </div>
            <EnquiryTrigger className="hp-text-link">
              Ask us a question <ArrowUpRight size={18} aria-hidden="true" />
            </EnquiryTrigger>
          </div>
          <div className="hp-faq-grid">
            {questions.map(([question, answer], index) => (
              <details
                key={question}
                name="homepage-questions"
                data-reveal
                data-reveal-delay={Math.min(index * 0.08, 0.32)}
              >
                <summary>
                  {question}
                  <Plus size={18} aria-hidden="true" />
                </summary>
                <p>{answer}</p>
              </details>
            ))}
          </div>
        </div>
      </section>
      <section className="hp-journal hp-shell" aria-labelledby="hp-journal-title">
        <div className="hp-section-head" data-reveal>
          <div>
            <p className="hp-eyebrow">THE ALIYAS JOURNAL</p>
            <h2 id="hp-journal-title">Read before you decide.</h2>
          </div>
          <Link className="hp-text-link" href="/journal">
            Explore the journal <ArrowUpRight size={18} aria-hidden="true" />
          </Link>
        </div>
        <div className="hp-journal-grid">
          {latestStories.map((article, index) => (
            <article key={article.slug} data-reveal data-reveal-delay={index * 0.08}>
              <Link href={`/journal/${article.slug}`} prefetch={false}>
                <div className="hp-journal-image">
                  <JournalCover
                    article={article}
                    sizes="(max-width:700px) 100vw, (max-width:1440px) 30vw, 420px"
                  />
                </div>
                <p>
                  {article.category}
                  {article.date && (
                    <>
                      {' '}
                      <span>·</span>{' '}
                      <time dateTime={article.date}>
                        {dateFormatter.format(new Date(article.date))}
                      </time>
                    </>
                  )}
                </p>
                <h3>{article.title}</h3>
                <span className="hp-story-link">
                  Read the story <ArrowUpRight size={16} aria-hidden="true" />
                </span>
              </Link>
            </article>
          ))}
        </div>
      </section>
      <HomePropertyPlan />
    </div>
  );
}
