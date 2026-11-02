import { allDeveloperProfiles as developers } from '@/lib/developers';
import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound, permanentRedirect } from 'next/navigation';
import {
  ArrowLeft,
  ArrowUpRight,
  BedDouble,
  Building2,
  CalendarDays,
  FileText,
  MapPin,
  Milestone,
} from 'lucide-react';
import { formatPrice, breadcrumbSchema, serializeSchema } from '@/lib/content';
import {
  developerProjectHref,
  getAllDeveloperProjects,
  getDeveloperProject,
  getDeveloperProjects,
} from '@/lib/developer-projects';
import { DeveloperProjectPlaceholder } from '@/components/developer-project-placeholder';
import { DEVELOPER_PROJECT_PAGE_SIZE } from '@/lib/developer-project-pagination';
import { EnquiryTrigger } from '@/components/enquiry-trigger';
import { ProjectGallery } from '@/components/project-gallery';
import { SectionNavigation } from '@/components/section-navigation';
import {
  ResearchSources,
  ResearchUnits,
  ResearchPayments,
  ResearchFacts,
  ResearchReview,
} from '@/components/project-research-details';
import '@/components/catalogue.css';
import '@/components/project-detail.css';
import '@/components/developer-profile.css';

type Props = { params: Promise<{ slug: string; projectSlug: string }> };
export function generateStaticParams() {
  return getAllDeveloperProjects().flatMap((project) =>
    [project.slug, ...(project.previousSlugs ?? [])].map((projectSlug) => ({
      slug: project.developerSlug,
      projectSlug,
    })),
  );
}
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug, projectSlug } = await params;
  const project = getDeveloperProject(slug, projectSlug);
  const developer = developers.find((item) => item.slug === slug);
  if (!project || !developer) return { title: 'Project not found', robots: { index: false } };
  return {
    title: `${project.name} — ${developer.name}`,
    description:
      project.description ||
      `Explore ${project.name} by ${developer.name}. Project information will be added once confirmed.`,
    alternates: { canonical: developerProjectHref(project) },
    robots: { index: !project.placeholder, follow: true },
    openGraph: { images: [project.image] },
  };
}

export default async function DeveloperProjectPage({ params }: Props) {
  const { slug, projectSlug } = await params;
  const developer = developers.find((item) => item.slug === slug);
  const project = getDeveloperProject(slug, projectSlug);
  if (!developer || !project) notFound();
  if (projectSlug !== project.slug) permanentRedirect(developerProjectHref(project));
  const research = project.research;
  const priceLabel = research?.priceLabel || 'Starting price';
  const collection = getDeveloperProjects(slug);
  const related = collection.filter((item) => item.id !== project.id).slice(0, 3);
  const collectionPage =
    Math.floor(
      collection.findIndex((item) => item.id === project.id) / DEVELOPER_PROJECT_PAGE_SIZE,
    ) + 1;
  const collectionHref = `/developers/${developer.slug}${collectionPage > 1 ? `?page=${collectionPage}` : ''}#developer-projects`;
  const message = `I would like to know more about ${project.name} by ${developer.name}. Please share the confirmed project information when available.`;
  const breadcrumb = breadcrumbSchema('developers', developer.slug, developer.name);
  breadcrumb.itemListElement.push({
    '@type': 'ListItem',
    position: 4,
    name: project.name,
    item: new URL(
      developerProjectHref(project),
      process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',
    ).href,
  });
  return (
    <div
      className="catalogue-page project-detail developer-project-detail"
      data-project-id={project.id}
      data-developer={project.developerSlug}
    >
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeSchema([breadcrumb]) }}
      />
      <Link className="pd-back" href={collectionHref}>
        <ArrowLeft size={16} aria-hidden="true" />
        All {developer.name} projects
      </Link>
      <header className="pd-heading">
        <div>
          <p className="pd-eyebrow">
            {developer.name}
            <span>/</span>
            {research
              ? 'Project information'
              : project.nameSource
                ? 'Project details to follow'
                : project.placeholder
                  ? 'Design preview'
                  : 'Off-plan collection'}
          </p>
          <h1>{project.name}</h1>
          <p className="pd-location">
            <MapPin size={17} aria-hidden="true" />
            {[research?.community || project.location, project.emirate]
              .filter(Boolean)
              .join(', ') || 'Location details coming soon'}
          </p>
        </div>
        <EnquiryTrigger className="pd-button pd-heading-action" initialMessage={message}>
          Enquire about this project
          <ArrowUpRight size={18} aria-hidden="true" />
        </EnquiryTrigger>
      </header>
      <ProjectGallery
        image={project.image}
        gallery={project.gallery}
        projectName={project.name}
        illustrative={project.placeholder}
      />
      <SectionNavigation
        items={[
          { id: 'overview', label: 'Overview' },
          { id: 'project-details', label: 'Project details' },
          { id: 'payment-plan', label: 'Payment plan' },
          { id: 'location', label: 'Location' },
          { id: 'downloads', label: 'Downloads' },
          ...(research ? [{ id: 'sources', label: 'Sources' }] : []),
        ]}
      />
      <div className="pd-content-layout">
        <div className="pd-main-column">
          <section className="pd-section" id="overview">
            <p className="pd-eyebrow">01 / The project</p>
            <h2>A closer look.</h2>
            <p className="pd-description">
              {project.description ||
                `Discover ${project.name} by ${developer.name}. The project overview, residence information and official imagery will be added here once the details are confirmed.`}
            </p>
            {research?.overview.map((paragraph) => (
              <p className="pd-description" key={paragraph}>
                {paragraph}
              </p>
            ))}
            {research && (
              <ResearchSources research={research} fields={['description', 'overview']} />
            )}
            {research && <ResearchFacts research={research} />}
            {!research && project.nameSource && (
              <a
                className="pd-back"
                href={project.nameSource.url}
                target="_blank"
                rel="noopener noreferrer"
              >
                Project name source: {developer.name} <ArrowUpRight size={15} aria-hidden="true" />
              </a>
            )}
          </section>
          <section className="pd-section" id="project-details">
            <p className="pd-eyebrow">02 / At a glance</p>
            <h2>The details.</h2>
            <dl className="pd-specs">
              <div>
                <Building2 size={21} aria-hidden="true" />
                <dt>Residence type</dt>
                <dd>{project.type || 'To be confirmed'}</dd>
              </div>
              <div>
                <BedDouble size={21} aria-hidden="true" />
                <dt>Bedrooms</dt>
                <dd>{project.bedrooms || 'To be confirmed'}</dd>
              </div>
              <div>
                <CalendarDays size={21} aria-hidden="true" />
                <dt>Handover</dt>
                <dd>{project.handover || 'To be confirmed'}</dd>
              </div>
              <div>
                <Milestone size={21} aria-hidden="true" />
                <dt>Developer</dt>
                <dd>
                  <Link href={`/developers/${developer.slug}`}>
                    {developer.name}
                    <ArrowUpRight size={14} aria-hidden="true" />
                  </Link>
                </dd>
              </div>
            </dl>
            {research && <ResearchSources research={research} fields={['type', 'bedrooms']} />}
            {research && <ResearchUnits research={research} />}
            <h3 className="pd-subheading">Amenities & lifestyle</h3>
            {project.amenities.length ? (
              <ul className="pd-amenities">
                {project.amenities.map((amenity) => (
                  <li key={amenity}>{amenity}</li>
                ))}
              </ul>
            ) : (
              <p className="pd-description">
                The confirmed amenities and community features will appear here.
              </p>
            )}
            {research && <ResearchSources research={research} fields={['amenities']} />}
          </section>
          <section className="pd-section" id="payment-plan">
            <p className="pd-eyebrow">03 / Planning your purchase</p>
            <h2>Price & payment plan.</h2>
            <div className="developer-project-figures">
              <div>
                <span>{priceLabel}</span>
                <strong>
                  {project.price === null ? 'Details to follow' : formatPrice(project.price)}
                </strong>
              </div>
              <div>
                <span>Payment plan</span>
                <strong>{project.paymentPlan || 'To be confirmed'}</strong>
              </div>
            </div>
            {research && <ResearchPayments research={research} />}
          </section>
          <section className="pd-section" id="location">
            <p className="pd-eyebrow">04 / The neighbourhood</p>
            <h2>Find your place.</h2>
            <p className="pd-description">
              {project.location
                ? [project.location, project.emirate, 'United Arab Emirates']
                    .filter(Boolean)
                    .join(', ')
                : 'Location, nearby destinations and community information will be added with the approved project details.'}
            </p>
            {research && <p className="pd-description">{research.locationNote}</p>}
            {research && <ResearchSources research={research} fields={['location']} />}
          </section>
          <section className="pd-section" id="downloads">
            <p className="pd-eyebrow">05 / Look closer</p>
            <h2>Project resources.</h2>
            <div className="developer-project-downloads">
              {[
                { name: 'Project brochure', url: project.brochureUrl },
                { name: 'Floor plans', url: project.floorPlanUrl },
              ].map((resource) =>
                resource.url ? (
                  <a
                    key={resource.name}
                    href={resource.url}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <FileText size={22} aria-hidden="true" />
                    <span>
                      {resource.name}
                      <small>View document</small>
                    </span>
                    <ArrowUpRight size={18} aria-hidden="true" />
                  </a>
                ) : (
                  <div key={resource.name}>
                    <FileText size={22} aria-hidden="true" />
                    <span>
                      {resource.name}
                      <small>Coming soon</small>
                    </span>
                  </div>
                ),
              )}
            </div>
          </section>
          {research && <ResearchReview research={research} />}
        </div>
        <aside className="pd-enquiry-panel" aria-label="Project enquiry">
          <p className="pd-eyebrow">{developer.name}</p>
          <p className="pd-price">
            <small>{priceLabel}</small>
            {project.price === null ? 'Details to follow' : formatPrice(project.price)}
          </p>
          <p className="pd-panel-note">
            {research
              ? 'Published pricing. Confirm current availability and terms with Aliyas.'
              : project.placeholder
                ? 'Design preview · project details pending.'
                : 'Contact us for confirmed availability.'}
          </p>
          <div className="pd-panel-rule" />
          <h2>
            Let’s take a<br />
            closer look.
          </h2>
          <p>Speak with Aliyas about this project and your preferred home.</p>
          <EnquiryTrigger className="pd-button" initialMessage={message}>
            Enquire now
            <ArrowUpRight size={18} aria-hidden="true" />
          </EnquiryTrigger>
          <Link className="pd-developer-link" href={collectionHref}>
            Explore {developer.name}
            <ArrowUpRight size={15} aria-hidden="true" />
          </Link>
        </aside>
      </div>
      {project.placeholder && (
        <p className="catalogue-disclaimer pd-disclaimer">
          {research
            ? 'Photography is illustrative. Project information is sourced from the references above; current unit availability and final terms require confirmation.'
            : project.nameSource
              ? 'Project name verified from the developer source. Photography is illustrative; detailed specifications, pricing and availability are pending.'
              : 'Design preview. Names and photography are placeholders; specifications, prices and availability have not been confirmed.'}
        </p>
      )}
      <section className="catalogue-related pd-related" aria-labelledby="related-projects-title">
        <p className="pd-eyebrow">Keep exploring</p>
        <h2 id="related-projects-title">More from {developer.name}.</h2>
        <div className="catalogue-project-grid developer-listings-grid">
          {related.map((item) => (
            <DeveloperProjectPlaceholder
              key={item.id}
              project={item}
              developerName={developer.name}
            />
          ))}
        </div>
      </section>
      <aside className="pd-mobile-enquiry" aria-label="Quick project enquiry">
        <span>
          <small>{priceLabel}</small>
          <strong>{project.price === null ? 'Details pending' : formatPrice(project.price)}</strong>
        </span>
        <EnquiryTrigger className="pd-button" initialMessage={message}>
          Enquire<span className="future-sr-only"> about this project</span>
          <ArrowUpRight size={17} aria-hidden="true" />
        </EnquiryTrigger>
      </aside>
    </div>
  );
}
