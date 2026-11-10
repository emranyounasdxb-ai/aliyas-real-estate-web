import Link from 'next/link';
import { ArrowUpRight, BedDouble, MapPin } from 'lucide-react';
import type { DeveloperProjectRecord } from '@/lib/developer-projects';
import { developerProjectHref } from '@/lib/developer-project-url';
import { formatPrice } from '@/lib/content';
import { getProjectMedia } from '@/lib/project-media';
import { projectImageLabel } from '@/lib/project-media-copy';
import { projectPublicText } from '@/lib/project-public-copy';
import { ResponsiveProjectImage } from './responsive-project-image';
import './developer-project-card.css';

/** A project card shared by the developer catalogue and related collections. */
export function DeveloperProjectPlaceholder({
  project,
  developerName,
}: {
  project: DeveloperProjectRecord;
  developerName: string;
}) {
  const href = developerProjectHref(project);
  const media = getProjectMedia(project);
  const cover = media?.images.find((image) => image.src === media.cardImage) || media?.images[0];
  const bedrooms = project.bedrooms?.split(';')[0].trim();
  const handover = projectPublicText(project.handover);
  const paymentPlan = projectPublicText(project.paymentPlan);
  const priceLabel = projectPublicText(project.research?.priceLabel) || 'Published price guide';
  const locationParts = (project.research?.community || project.location || '')
    .split(',')
    .map((part) => part.trim())
    .filter(Boolean);
  const emirate = project.emirate?.trim();
  if (emirate && locationParts.at(-1)?.toLowerCase() !== emirate.toLowerCase()) {
    locationParts.push(emirate);
  }
  return (
    <article
      className="project-card developer-project-placeholder"
      data-developer={project.developerSlug}
      data-project-id={project.id}
      data-official-renders={Boolean(media) || undefined}
    >
      <div className="project-card-visual">
        <Link
          href={href}
          className="project-card-image-link"
          aria-label={`Explore ${project.name}`}
        >
          <ResponsiveProjectImage
            src={cover?.src || project.image}
            responsiveWidth={cover?.responsiveWidth}
            alt={
              cover
                ? `${project.name} — ${projectImageLabel(cover.label)}, ${cover.photograph ? 'project photograph' : 'project render'}`
                : 'Architecture'
            }
            fill
            sizes="(max-width:700px) 90vw, (max-width:1050px) 44vw, 29vw"
            quality={media ? 85 : undefined}
            style={cover ? { objectPosition: cover.position } : undefined}
          />
        </Link>
        <span className="project-card-developer">BY {developerName.toUpperCase()}</span>
      </div>
      <div className="project-card-body">
        {locationParts.length > 0 && (
          <p className="project-location">
            <MapPin size={12} aria-hidden="true" />
            {locationParts.join(', ')}
          </p>
        )}
        <div className="project-title-row">
          <h3>
            <Link href={href}>{project.name}</Link>
          </h3>
          <Link className="project-arrow" href={href} aria-label={`View ${project.name}`}>
            <ArrowUpRight size={20} aria-hidden="true" />
          </Link>
        </div>
        <div className="project-meta">
          {bedrooms && (
            <span>
              <BedDouble size={15} aria-hidden="true" />
              {bedrooms} beds
            </span>
          )}
          {project.type && <span>{project.type}</span>}
          {handover && <span>Handover {handover}</span>}
        </div>
        <div className="project-card-bottom">
          <span>
            {project.price === null ? 'Price' : priceLabel}
            <strong className={project.price === null ? 'project-price-pending' : undefined}>
              {project.price === null ? 'Price on request' : formatPrice(project.price)}
            </strong>
          </span>
          {paymentPlan && (
            <span className="project-plan">
              <small>Payment plan</small>
              <strong>{paymentPlan}</strong>
            </span>
          )}
        </div>
        <Link href={href} className="developer-project-pending developer-project-details">
          View project details <ArrowUpRight size={14} aria-hidden="true" />
        </Link>
      </div>
    </article>
  );
}
