'use client';

import Image from 'next/image';
import Link from 'next/link';
import { ArrowUpRight, BedDouble, Heart, MapPin } from 'lucide-react';
import { formatPrice, type Project } from '@/lib/content';
import { CompareButton } from './comparison-controls';
import { useSavedProjects } from './saved-projects-store';
export { useSavedProjects } from './saved-projects-store';
import './catalogue.css';

export function ProjectCard({ project }: { project: Project }) {
  const { saved, toggle } = useSavedProjects();
  const isSaved = saved.includes(project.slug);
  return (
    <article className="project-card">
      <div className="project-card-visual">
        <Link
          href={`/projects/${project.slug}`}
          aria-label={`Explore ${project.name}`}
          className="project-card-image-link"
        >
          <Image
            src={project.image}
            alt={`Illustrative architecture for the ${project.name} sample profile`}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1000px) 50vw, 33vw"
          />
        </Link>
        <span className="project-card-badge">Off-plan</span>
        <button
          className={`project-save ${isSaved ? 'is-saved' : ''}`}
          type="button"
          onClick={() => toggle(project.slug)}
          aria-label={`${isSaved ? 'Unsave' : 'Save'} ${project.name}`}
          aria-pressed={isSaved}
        >
          <Heart size={17} fill={isSaved ? 'currentColor' : 'none'} />
        </button>
        <span className="project-card-developer">BY {project.developer.toUpperCase()}</span>
      </div>
      <div className="project-card-body">
        <p className="project-location">
          <MapPin size={12} />
          {project.location}, {project.emirate}
        </p>
        <div className="project-title-row">
          <h3>
            <Link href={`/projects/${project.slug}`}>{project.name}</Link>
          </h3>
          <Link
            className="project-arrow"
            href={`/projects/${project.slug}`}
            aria-label={`View ${project.name}`}
          >
            <ArrowUpRight size={20} />
          </Link>
        </div>
        <div className="project-meta">
          <span>
            <BedDouble size={15} />
            {project.bedrooms} beds
          </span>
          <span>{project.type}</span>
          <span title="Illustrative handover year">Handover {project.handover}*</span>
        </div>
        <div className="project-card-bottom">
          <span>
            Indicative from <strong>{formatPrice(project.price)}</strong>
          </span>
          <span className="project-plan">
            {project.paymentPlan}
            <small>Sample payment plan</small>
          </span>
        </div>
        <CompareButton slug={project.slug} name={project.name} />
      </div>
    </article>
  );
}
