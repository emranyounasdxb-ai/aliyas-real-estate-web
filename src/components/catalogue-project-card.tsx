'use client';

import Link from 'next/link';
import { ArrowUpRight, BedDouble, MapPin } from 'lucide-react';
import type { ApprovedListing } from '@/lib/catalogue-locations';
import { developerProjectHref } from '@/lib/developer-project-url';
import { formatPrice } from '@/lib/listing-format';
import { HomeProjectActions } from './home-project-actions';
import { ResponsiveProjectImage } from './responsive-project-image';
import './developer-project-card.css';

/** Catalogue cards use the compact projection of each project's own reviewed record. */
export function CatalogueProjectCard({ project }: { project: ApprovedListing }) {
  const href = developerProjectHref(project);
  const locationParts = (project.community || project.location || '')
    .split(',')
    .map((part) => part.trim())
    .filter(Boolean);
  if (project.emirate && locationParts.at(-1)?.toLowerCase() !== project.emirate.toLowerCase())
    locationParts.push(project.emirate);
  const bedrooms = project.bedrooms?.split(';')[0].trim();
  return (
    <article
      className="project-card developer-project-placeholder catalogue-owned-card"
      data-developer={project.developerSlug}
      data-project-id={project.id}
      data-official-renders={project.hasProjectMedia || undefined}
    >
      <div className="project-card-visual">
        <Link
          href={href}
          prefetch={false}
          className="project-card-image-link"
          aria-label={`Explore ${project.name}`}
        >
          <ResponsiveProjectImage
            src={project.image}
            responsiveWidth={project.imageResponsiveWidth}
            alt={project.imageAlt || project.name}
            fill
            sizes="(max-width:700px) 90vw, (max-width:1050px) 44vw, 29vw"
            quality={85}
            style={project.imagePosition ? { objectPosition: project.imagePosition } : undefined}
          />
        </Link>
        <span className="project-card-developer">BY {project.developerName.toUpperCase()}</span>
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
            <Link href={href} prefetch={false}>
              {project.name}
            </Link>
          </h3>
          <Link
            className="project-arrow"
            href={href}
            prefetch={false}
            aria-label={`View ${project.name}`}
          >
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
          {project.handover && <span>Handover {project.handover}</span>}
        </div>
        <div className="project-card-bottom">
          <span>
            {project.price === null ? 'Price' : project.priceLabel || 'Published price guide'}
            <strong className={project.price === null ? 'project-price-pending' : undefined}>
              {project.price === null ? 'Price on request' : formatPrice(project.price)}
            </strong>
          </span>
          {project.paymentPlan && (
            <span className="project-plan">
              <small>Payment plan</small>
              <strong>{project.paymentPlan}</strong>
            </span>
          )}
        </div>
        <Link
          href={href}
          prefetch={false}
          className="developer-project-pending developer-project-details"
        >
          View project details <ArrowUpRight size={14} aria-hidden="true" />
        </Link>
        {project.selectable !== false && (
          <HomeProjectActions slug={project.id} legacySlug={project.slug} name={project.name} />
        )}
      </div>
    </article>
  );
}
