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
import { getProjectMedia } from '@/lib/project-media';
import { isPublicProject } from '@/lib/public-listings';
import { projectPublicText } from '@/lib/project-public-copy';
import { ProjectMediaScenes } from '@/components/project-media-scenes';
import { ProjectLocation } from '@/components/project-location';
import { ProjectFloorPlans } from '@/components/project-floor-plans';
import { getProjectFloorPlans, getProjectLocation } from '@/lib/project-enhancements';
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
import '@/components/project-media-pilot.css';

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
  const hostname = new URL(process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000').hostname;
  const isPublicSite = !/^(localhost|127\.0\.0\.1|\[::1\])$/.test(hostname);
  return {
    title: `${project.name} — ${developer.name}`,
    description:
      projectPublicText(project.description) ||
      `Explore ${project.name} by ${developer.name}. Browse residences, amenities and project images with Aliyas.`,
    alternates: { canonical: developerProjectHref(project) },
    robots: { index: isPublicSite && isPublicProject(project), follow: true },
    openGraph: { images: [getProjectMedia(project)?.cardImage || project.image] },
  };
}

export default async function DeveloperProjectPage({ params }: Props) {
  const { slug, projectSlug } = await params;
  const developer = developers.find((item) => item.slug === slug);
  const project = getDeveloperProject(slug, projectSlug);
  if (!developer || !project) notFound();
  if (projectSlug !== project.slug) permanentRedirect(developerProjectHref(project));
  const research = project.research;
  const media = getProjectMedia(project);
  const cover = media?.images.find((image) => image.src === media.cardImage) || media?.images[0];
  // Keep the opening scene consistent with the card while retaining every source image.
  const gallery =
    media && cover
      ? [cover, ...media.images.filter((image) => image.src !== cover.src)]
      : project.gallery;
  const plans = getProjectFloorPlans(project);
  const location = getProjectLocation(project);
  const scenes = media?.images.filter((image) => media.editorialImages?.includes(image.src)) || [];
  const priceLabel =
    project.price === null
      ? 'Enquire for pricing'
      : projectPublicText(research?.priceLabel) || 'Published price guide';
  const handover = projectPublicText(project.handover);
  const paymentPlan = projectPublicText(project.paymentPlan);
  const bedrooms = projectPublicText(project.bedrooms?.split(';')[0]);
  const locationLabel =
    location?.community ||
    [research?.community || project.location, project.emirate].filter(Boolean).join(', ');
  const resources = [
    { name: 'Project brochure', url: project.brochureUrl },
    { name: 'Floor plans', url: project.floorPlanUrl },
  ].filter((resource): resource is { name: string; url: string } => Boolean(resource.url));
  const collection = getDeveloperProjects(slug);
  const related = collection.filter((item) => item.id !== project.id).slice(0, 3);
  const collectionPage =
    Math.floor(
      collection.findIndex((item) => item.id === project.id) / DEVELOPER_PROJECT_PAGE_SIZE,
    ) + 1;
  const collectionHref = `/developers/${developer.slug}${collectionPage > 1 ? `?page=${collectionPage}` : ''}#developer-projects`;
  const message = `I would like to know more about ${project.name} by ${developer.name}. Please share available residences, pricing and purchase options.`;
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
      className={`catalogue-page project-detail developer-project-detail${media ? ' project-media-pilot' : ''}`}
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
            Project information
          </p>
          <h1>{project.name}</h1>
          {locationLabel && (
            <p className="pd-location">
              <MapPin size={17} aria-hidden="true" />
              {locationLabel}
            </p>
          )}
        </div>
        <EnquiryTrigger
          className="pd-button pd-heading-action"
          initialMessage={message}
          projectSlug={project.slug}
          projectName={project.name}
        >
          Enquire about this project
          <ArrowUpRight size={18} aria-hidden="true" />
        </EnquiryTrigger>
      </header>
      <ProjectGallery
        key={project.id}
        image={cover?.src || project.image}
        gallery={gallery}
        projectName={project.name}
        illustrative={media ? false : project.placeholder}
        source={media?.source}
        reviewedMedia={Boolean(media)}
      />
      <SectionNavigation
        items={[
          ...(media ? [{ id: 'project-gallery', label: 'Gallery' }] : []),
          { id: 'overview', label: 'Overview' },
          { id: 'project-details', label: 'Project details' },
          ...(plans ? [{ id: 'floor-plans', label: 'Floor plans' }] : []),
          { id: 'payment-plan', label: 'Payment plan' },
          ...(locationLabel ? [{ id: 'location', label: 'Location' }] : []),
          ...(resources.length ? [{ id: 'downloads', label: 'Downloads' }] : []),
          ...(research ? [{ id: 'sources', label: 'Sources' }] : []),
        ]}
      />
      <div className="pd-content-layout">
        <div className="pd-main-column">
          <section className="pd-section" id="overview">
            <p className="pd-eyebrow">01 / The project</p>
            <h2>A closer look.</h2>
            <p className="pd-description">
              {projectPublicText(project.description) ||
                `Discover ${project.name} by ${developer.name}. Explore the residences and speak with our team about your preferred home.`}
            </p>
            {research?.overview
              .map(projectPublicText)
              .filter(Boolean)
              .map((paragraph) => (
                <p className="pd-description" key={paragraph}>
                  {paragraph}
                </p>
              ))}
            {scenes.length > 0 && (
              <ProjectMediaScenes
                images={scenes}
                projectName={project.name}
                sourceName={media!.source.name}
              />
            )}
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
                Visit {developer.name} <ArrowUpRight size={15} aria-hidden="true" />
              </a>
            )}
          </section>
          <section className="pd-section" id="project-details">
            <p className="pd-eyebrow">02 / At a glance</p>
            <h2>The details.</h2>
            <dl className="pd-specs">
              {project.type && (
                <div>
                  <Building2 size={21} aria-hidden="true" />
                  <dt>Residence type</dt>
                  <dd>{project.type}</dd>
                </div>
              )}
              {bedrooms && (
                <div>
                  <BedDouble size={21} aria-hidden="true" />
                  <dt>Bedrooms</dt>
                  <dd>{bedrooms}</dd>
                </div>
              )}
              {handover && (
                <div>
                  <CalendarDays size={21} aria-hidden="true" />
                  <dt>Handover</dt>
                  <dd>{handover}</dd>
                </div>
              )}
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
            {project.amenities.length > 0 && (
              <>
                <h3 className="pd-subheading">Amenities & lifestyle</h3>
                <ul className="pd-amenities">
                  {project.amenities.map((amenity) => (
                    <li key={amenity}>{amenity}</li>
                  ))}
                </ul>
                {research && <ResearchSources research={research} fields={['amenities']} />}
              </>
            )}
          </section>
          {plans && (
            <ProjectFloorPlans
              data={plans}
              eyebrow={project.type === 'Office' ? 'Inside the workplace' : undefined}
            />
          )}
          <section className="pd-section" id="payment-plan">
            <p className="pd-eyebrow">03 / Planning your purchase</p>
            <h2>Price & payment plan.</h2>
            <div className="developer-project-figures">
              <div>
                <span>{priceLabel}</span>
                <strong>
                  {project.price === null ? 'Price on request' : formatPrice(project.price)}
                </strong>
              </div>
              {paymentPlan && (
                <div>
                  <span>Payment plan</span>
                  <strong>{paymentPlan}</strong>
                </div>
              )}
            </div>
            {research && <ResearchPayments research={research} />}
          </section>
          {locationLabel && (
            <section className="pd-section" id="location">
              <p className="pd-eyebrow">04 / The neighbourhood</p>
              <h2>{location ? 'Location & connectivity.' : 'Find your place.'}</h2>
              {location ? (
                <ProjectLocation data={location} projectName={project.name} />
              ) : (
                <>
                  <p className="pd-description">
                    {project.location
                      ? [project.location, project.emirate, 'United Arab Emirates']
                          .filter(Boolean)
                          .join(', ')
                      : locationLabel}
                  </p>
                  {research && (
                    <p className="pd-description">{projectPublicText(research.locationNote)}</p>
                  )}
                  {research && <ResearchSources research={research} fields={['location']} />}
                </>
              )}
            </section>
          )}
          {resources.length > 0 && (
            <section className="pd-section" id="downloads">
              <p className="pd-eyebrow">05 / Look closer</p>
              <h2>Project resources.</h2>
              <div className="developer-project-downloads">
                {resources.map((resource) => (
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
                ))}
              </div>
            </section>
          )}
          {research && <ResearchReview research={research} />}
        </div>
        <aside className="pd-enquiry-panel" aria-label="Project enquiry">
          <p className="pd-eyebrow">{developer.name}</p>
          <p className="pd-price">
            <small>{priceLabel}</small>
            {project.price === null ? 'Price on request' : formatPrice(project.price)}
          </p>
          <p className="pd-panel-note">
            Contact Aliyas for available homes and a personalised quotation.
          </p>
          <div className="pd-panel-rule" />
          <h2>
            Let’s take a<br />
            closer look.
          </h2>
          <p>Speak with Aliyas about this project and your preferred home.</p>
          <EnquiryTrigger
            className="pd-button"
            initialMessage={message}
            projectSlug={project.slug}
            projectName={project.name}
          >
            Enquire now
            <ArrowUpRight size={18} aria-hidden="true" />
          </EnquiryTrigger>
          <Link className="pd-developer-link" href={collectionHref}>
            Explore {developer.name}
            <ArrowUpRight size={15} aria-hidden="true" />
          </Link>
        </aside>
      </div>
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
          <strong>
            {project.price === null ? 'Price on request' : formatPrice(project.price)}
          </strong>
        </span>
        <EnquiryTrigger
          className="pd-button"
          initialMessage={message}
          projectSlug={project.slug}
          projectName={project.name}
        >
          Enquire<span className="future-sr-only"> about this project</span>
          <ArrowUpRight size={17} aria-hidden="true" />
        </EnquiryTrigger>
      </aside>
    </div>
  );
}
