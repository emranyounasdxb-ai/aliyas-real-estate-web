import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import {
  ArrowLeft,
  ArrowUpRight,
  BedDouble,
  Building2,
  CalendarDays,
  Check,
  FileText,
  Images,
  Layers3,
  MapPin,
  Milestone,
} from 'lucide-react';
import {
  projects,
  formatPrice,
  catalogueNotice,
  breadcrumbSchema,
  serializeSchema,
} from '@/lib/content';
import { ProjectCard } from '@/components/project-card';
import { ProjectGallery } from '@/components/project-gallery';
import { EnquiryTrigger } from '@/components/enquiry-trigger';
import { SectionNavigation } from '@/components/section-navigation';
import '@/components/catalogue.css';
import '@/components/project-detail.css';

type Props = { params: Promise<{ slug: string }> };
export function generateStaticParams() {
  return projects.map(({ slug }) => ({ slug }));
}
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const project = projects.find((item) => item.slug === slug);
  return project
    ? {
        title: `${project.name} by ${project.developer}`,
        description: project.description,
        alternates: { canonical: `/projects/${slug}` },
        openGraph: { images: [project.image] },
      }
    : { title: 'Project not found' };
}

export default async function ProjectPage({ params }: Props) {
  const { slug } = await params;
  const project = projects.find((item) => item.slug === slug);
  if (!project) notFound();
  const enquiry = { projectSlug: project.slug, projectName: project.name };
  const split = project.paymentPlan.split('/').map((value) => Number(value.trim()));
  const hasSplit =
    split.length === 2 && split.every((value) => value > 0) && split[0] + split[1] === 100;
  const mapUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${project.location}, ${project.emirate}, United Arab Emirates`)}`;
  const resources = [
    {
      title: 'Floor plans',
      copy: 'Find the layout that fits your life.',
      icon: Layers3,
      message: `I’m interested in ${project.name}. Please share the latest developer-issued floor plans, available layouts and unit sizes.`,
    },
    {
      title: 'Project brochure',
      copy: 'Look closer at the complete vision.',
      icon: FileText,
      message: `I’m interested in ${project.name}. Please share the latest official project brochure and confirmed specifications.`,
    },
    {
      title: 'Construction update',
      copy: 'Ask for the latest progress information.',
      icon: Images,
      message: `I’m interested in ${project.name}. Please share the latest developer-issued construction update and confirmed completion timeline.`,
    },
  ];
  return (
    <div className="catalogue-page project-detail">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: serializeSchema([breadcrumbSchema('projects', project.slug, project.name)]),
        }}
      />
      <Link className="pd-back" href="/projects">
        <ArrowLeft size={16} />
        All off-plan projects
      </Link>
      <header className="pd-heading">
        <div>
          <p className="pd-eyebrow">
            Off-plan collection <span>/</span> {project.developer}
          </p>
          <h1>{project.name}</h1>
          <p className="pd-location">
            <MapPin size={17} />
            {project.location}, {project.emirate}
          </p>
        </div>
        <EnquiryTrigger {...enquiry} className="pd-button pd-heading-action">
          Enquire about this project
          <ArrowUpRight size={18} />
        </EnquiryTrigger>
      </header>
      <ProjectGallery image={project.image} projectName={project.name} gallery={project.gallery} />
      <SectionNavigation
        items={[
          { id: 'overview', label: 'Overview' },
          { id: 'payment-plan', label: 'Payment plan' },
          { id: 'neighbourhood', label: 'Neighbourhood' },
          { id: 'project-resources', label: 'Project resources' },
        ]}
      />
      <div className="pd-content-layout">
        <div className="pd-main-column">
          <section className="pd-section" id="overview">
            <p className="pd-eyebrow">01 / A closer look</p>
            <h2>
              A place to see
              <br />
              <em>yourself in.</em>
            </h2>
            <p className="pd-description">{project.description}</p>
            <dl className="pd-specs">
              <div>
                <Building2 size={21} />
                <dt>Residence type</dt>
                <dd>{project.type}</dd>
              </div>
              <div>
                <BedDouble size={21} />
                <dt>Bedrooms</dt>
                <dd>{project.bedrooms}</dd>
              </div>
              <div>
                <CalendarDays size={21} />
                <dt>Illustrative completion</dt>
                <dd>{project.handover}</dd>
              </div>
              <div>
                <Milestone size={21} />
                <dt>Developer</dt>
                <dd>
                  <Link href={`/developers/${project.developerSlug}`}>
                    {project.developer}
                    <ArrowUpRight size={14} />
                  </Link>
                </dd>
              </div>
            </dl>
            <h3 className="pd-subheading">What shapes the experience</h3>
            <ul className="pd-amenities">
              {project.amenities.map((amenity) => (
                <li key={amenity}>
                  <Check size={16} />
                  {amenity}
                </li>
              ))}
            </ul>
            <p className="pd-note">
              Project overview sourced from the{' '}
              <a href={project.source} target="_blank" rel="noopener noreferrer">
                developer website <ArrowUpRight size={12} />
              </a>
              . Specifications require confirmation.
            </p>
          </section>
          <section className="pd-section" id="payment-plan">
            <p className="pd-eyebrow">02 / Planning your purchase</p>
            <h2>
              A clearer view
              <br />
              <em>of the numbers.</em>
            </h2>
            <div className="pd-payment">
              <div className="pd-payment-heading">
                <span>Illustrative payment split</span>
                <strong>{project.paymentPlan}</strong>
              </div>
              {hasSplit && (
                <>
                  <div
                    className="pd-payment-bar"
                    role="img"
                    aria-label={`Illustrative payment split: ${split[0]} percent and ${split[1]} percent. Payment milestones are not confirmed.`}
                  >
                    <span style={{ flex: split[0] }} />
                    <span style={{ flex: split[1] }} />
                  </div>
                  <div className="pd-payment-key" aria-hidden="true">
                    <span>
                      <i />
                      {split[0]}%
                    </span>
                    <span>
                      <i />
                      {split[1]}%
                    </span>
                  </div>
                </>
              )}
              <p>
                This sample ratio is for comparison only. Booking amounts, payment milestones and
                due dates must be confirmed with the developer.
              </p>
              <EnquiryTrigger
                {...enquiry}
                className="pd-text-link"
                initialMessage={`Please share the current availability, verified prices and full developer payment schedule for ${project.name}.`}
              >
                Request the current payment schedule
                <ArrowUpRight size={17} />
              </EnquiryTrigger>
            </div>
          </section>
          <section className="pd-section" id="neighbourhood">
            <p className="pd-eyebrow">03 / Beyond your front door</p>
            <h2>
              The setting
              <br />
              <em>makes a difference.</em>
            </h2>
            <a className="pd-neighbourhood" href={mapUrl} target="_blank" rel="noopener noreferrer">
              <span className="pd-map-mark" aria-hidden="true">
                <MapPin size={46} strokeWidth={1} />
              </span>
              <span>
                <small>{project.emirate}, United Arab Emirates</small>
                <strong>{project.location}</strong>
                <span>
                  Explore the area on Google Maps <ArrowUpRight size={17} />
                </span>
              </span>
            </a>
            <p className="pd-note">
              Opens a neighbourhood search. The exact project plot, access routes and nearby
              facilities should be checked with the developer.
            </p>
          </section>
          <section className="pd-section" id="project-resources">
            <p className="pd-eyebrow">04 / The details that matter</p>
            <h2>
              Make room for
              <br />
              <em>an informed decision.</em>
            </h2>
            <p className="pd-resource-intro">
              Request the developer’s latest documents for this project.
            </p>
            <div className="pd-resources">
              {resources.map(({ title, copy, icon: Icon, message }) => (
                <EnquiryTrigger
                  key={title}
                  {...enquiry}
                  initialMessage={message}
                  className="pd-resource"
                >
                  <span className="pd-resource-icon">
                    <Icon size={24} strokeWidth={1.4} />
                  </span>
                  <span>
                    <strong>Request {title.toLowerCase()}</strong>
                    <small>{copy}</small>
                  </span>
                  <ArrowUpRight size={19} />
                </EnquiryTrigger>
              ))}
            </div>
          </section>
        </div>
        <aside className="pd-enquiry-panel" aria-label="Project enquiry">
          <p className="pd-eyebrow">Your next address</p>
          <p className="pd-price">
            <small>Indicative from</small>
            {formatPrice(project.price)}
          </p>
          <p className="pd-panel-note">Preview pricing, subject to verification.</p>
          <div className="pd-panel-rule" />
          <h2>
            Let’s take a<br />
            <em>closer look.</em>
          </h2>
          <p>
            Ask for current availability, the latest project documents and a conversation about what
            matters to you.
          </p>
          <EnquiryTrigger {...enquiry} className="pd-button">
            Enquire about {project.name}
            <ArrowUpRight size={18} />
          </EnquiryTrigger>
          <span className="pd-panel-caption">A conversation, at your pace.</span>
          <Link href={`/developers/${project.developerSlug}`} className="pd-developer-link">
            Meet {project.developer}
            <ArrowUpRight size={15} />
          </Link>
        </aside>
      </div>
      <p className="catalogue-disclaimer pd-disclaimer">{catalogueNotice}</p>
      <section className="catalogue-related pd-related">
        <p className="pd-eyebrow">Keep exploring</p>
        <h2>
          Another address.
          <br />
          <em>Another possibility.</em>
        </h2>
        <div className="catalogue-project-grid">
          {projects
            .filter((item) => item.slug !== slug)
            .slice(0, 3)
            .map((item) => (
              <ProjectCard key={item.slug} project={item} />
            ))}
        </div>
      </section>
      <aside className="pd-mobile-enquiry" aria-label="Quick project enquiry">
        <span>
          <small>Indicative from</small>
          <strong>{formatPrice(project.price)}</strong>
        </span>
        <EnquiryTrigger {...enquiry} className="pd-button">
          Enquire
          <ArrowUpRight size={18} />
        </EnquiryTrigger>
      </aside>
    </div>
  );
}
