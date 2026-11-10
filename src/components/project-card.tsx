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
          href={project.href}
          aria-label={`Explore ${project.name}`}
          className="project-card-image-link"
        >
          <Image
            src={project.image}
            alt={project.imageAlt}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1000px) 50vw, 33vw"
          />
        </Link>
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
            <Link href={project.href}>{project.name}</Link>
          </h3>
          <Link className="project-arrow" href={project.href} aria-label={`View ${project.name}`}>
            <ArrowUpRight size={20} />
          </Link>
        </div>
        <div className="project-meta">
          <span>
            <BedDouble size={15} />
            {project.bedrooms} beds
          </span>
          <span>{project.type}</span>
          {project.handover && <span>Handover {project.handover}</span>}
        </div>
        <div className="project-card-bottom">
          <span>
            {project.priceLabel} <strong>{formatPrice(project.price)}</strong>
          </span>
          <span className="project-plan">
            {project.paymentPlan}
            <small>Payment plan</small>
          </span>
        </div>
        <CompareButton slug={project.slug} name={project.name} />
      </div>
    </article>
  );
}
