import Image from 'next/image';
import Link from 'next/link';
import { ArrowUpRight, BedDouble, MapPin } from 'lucide-react';
import type { DeveloperProjectRecord } from '@/lib/developer-projects';
import { developerProjectHref } from '@/lib/developer-project-url';
import { formatPrice } from '@/lib/content';
import './developer-project-card.css';

/** Design slots stay separate from the catalogue until approved inventory is supplied. */
export function DeveloperProjectPlaceholder({
  project,
  developerName,
}: {
  project: DeveloperProjectRecord;
  developerName: string;
}) {
  const href = developerProjectHref(project);
  return (
    <article
      className="project-card developer-project-placeholder"
      data-developer={project.developerSlug}
      data-project-id={project.id}
    >
      <div className="project-card-visual">
        <Link
          href={href}
          className="project-card-image-link"
          aria-label={`Explore ${project.name}`}
        >
          <Image
            src={project.image}
            alt="Illustrative architecture for a project design preview"
            fill
            sizes="(max-width:700px) 90vw, (max-width:1050px) 44vw, 29vw"
          />
        </Link>
        <span className="project-card-badge">
          {project.nameSource
            ? 'Illustrative image'
            : project.placeholder
              ? 'Design preview'
              : 'Off-plan'}
        </span>
        <span className="project-card-developer">BY {developerName.toUpperCase()}</span>
      </div>
      <div className="project-card-body">
        <p className="project-location">
          <MapPin size={12} aria-hidden="true" />
          {[project.research?.community || project.location, project.emirate]
            .filter(Boolean)
            .join(', ') || 'Location pending'}
        </p>
        <div className="project-title-row">
          <h3>
            <Link href={href}>{project.name}</Link>
          </h3>
          <Link className="project-arrow" href={href} aria-label={`View ${project.name}`}>
            <ArrowUpRight size={20} aria-hidden="true" />
          </Link>
        </div>
        <div className="project-meta">
          <span>
            <BedDouble size={15} aria-hidden="true" />
            {project.bedrooms ? `${project.bedrooms} beds` : 'Bedrooms —'}
          </span>
          <span>{project.type || 'Type —'}</span>
          <span>Handover {project.handover || '—'}</span>
        </div>
        <div className="project-card-bottom">
          <span>
            {project.research?.priceLabel || 'Starting price'}
            <strong className={project.price === null ? 'project-price-pending' : undefined}>
              {project.price === null ? 'Details to follow' : formatPrice(project.price)}
            </strong>
          </span>
          <span className="project-plan">
            <small>Payment plan</small>
            <strong>{project.paymentPlan || '—'}</strong>
          </span>
        </div>
        <Link href={href} className="developer-project-pending developer-project-details">
          View project details <ArrowUpRight size={14} aria-hidden="true" />
        </Link>
      </div>
    </article>
  );
}
