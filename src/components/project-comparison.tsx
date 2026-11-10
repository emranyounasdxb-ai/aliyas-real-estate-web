'use client';

import { ResponsiveProjectImage } from './responsive-project-image';
import Link from 'next/link';
import { ArrowLeft, ArrowUpRight, GitCompareArrows, RotateCcw, X } from 'lucide-react';
import { useState } from 'react';
import { BrandedSelect } from './branded-select';
import type { ApprovedListing } from '@/lib/catalogue-locations';
import { developerProjectHref } from '@/lib/developer-project-url';
import { catalogueNotice, formatPrice } from '@/lib/listing-format';
import { MAX_COMPARISON_PROJECTS, useProjectComparison } from './comparison-store';
import './comparison.css';

const rows: { label: string; get: (project: ApprovedListing) => string | null }[] = [
  {
    label: 'Price',
    get: (project) =>
      project.price === null
        ? null
        : `${formatPrice(project.price)} · ${project.priceLabel || 'Published price guide'}`,
  },
  { label: 'Developer', get: (project) => project.developerName },
  { label: 'Community', get: (project) => project.location },
  { label: 'Emirate', get: (project) => project.emirate },
  { label: 'Property type', get: (project) => project.type },
  { label: 'Bedrooms', get: (project) => project.bedrooms },
  { label: 'Handover target', get: (project) => project.handover },
  { label: 'Payment plan', get: (project) => project.paymentPlan },
];

export function ProjectComparison({ projects }: { projects: readonly ApprovedListing[] }) {
  const { slugs, replace, remove, clear, isReady } = useProjectComparison();
  const [feedback, setFeedback] = useState('');
  const selected = slugs
    .map((slug) => projects.find((project) => project.id === slug)!)
    .filter(Boolean);
  return (
    <div className="comparison-page">
      <Link className="comparison-back" href="/projects">
        <ArrowLeft size={15} aria-hidden="true" />
        Back to the collection
      </Link>
      <header className="comparison-heading">
        <div>
          <p className="comparison-eyebrow">A CONSIDERED CHOICE</p>
          <h1>
            Your possibilities,
            <br />
            <span>side by side.</span>
          </h1>
          <p>
            Compare the details that matter to you. Choose two or three projects to find the right
            fit.
          </p>
        </div>
        {selected.length > 0 && (
          <button
            type="button"
            className="comparison-clear"
            onClick={() => setFeedback(clear().message)}
          >
            <RotateCcw size={15} aria-hidden="true" />
            Clear comparison
          </button>
        )}
      </header>

      <div className="comparison-selectors" aria-label="Choose projects to compare">
        {Array.from({ length: MAX_COMPARISON_PROJECTS }, (_, index) => {
          const current = selected[index];
          return (
            <div className="comparison-selector" key={index}>
              <label htmlFor={`comparison-project-${index}`}>
                PROJECT {String(index + 1).padStart(2, '0')}
                {index === 2 && <span>Optional</span>}
              </label>
              <div>
                <BrandedSelect
                  aria-label={`Choose project ${index + 1}`}
                  disabled={!isReady}
                  id={`comparison-project-${index}`}
                  value={current?.id || ''}
                  onValueChange={(nextValue) =>
                    setFeedback(replace(current?.id, nextValue).message)
                  }
                  options={[
                    { value: '', label: 'Choose a project' },
                    ...projects
                      .filter(
                        (project) => project.id === current?.id || !slugs.includes(project.id),
                      )
                      .map((project) => ({
                        value: project.id,
                        label: `${project.name} · ${project.developerName}`,
                      })),
                  ]}
                />
                {current && (
                  <button
                    type="button"
                    className="comparison-remove"
                    aria-label={`Remove ${current.name} from comparison`}
                    onClick={() => setFeedback(remove(current.id).message)}
                  >
                    <X size={16} aria-hidden="true" />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
      <p className="comparison-feedback" role="status">
        {feedback}
      </p>

      {selected.length < 2 ? (
        <section className="comparison-empty">
          <span className="comparison-empty-icon">
            <GitCompareArrows size={27} aria-hidden="true" />
          </span>
          <h2>
            {selected.length === 0
              ? 'Good decisions start with a little perspective.'
              : 'One more possibility to consider.'}
          </h2>
          <p>
            {selected.length === 0
              ? 'Choose at least two projects above to compare their locations, homes and purchase terms.'
              : `${selected[0].name} is selected. Add another project above to see their details side by side.`}
          </p>
          <Link className="comparison-primary-link" href="/projects">
            Explore the collection
            <ArrowUpRight size={17} aria-hidden="true" />
          </Link>
        </section>
      ) : (
        <>
          <p className="comparison-scroll-hint">Swipe or scroll across to view every project.</p>
          <div
            className="comparison-table-scroll"
            role="region"
            aria-label="Project comparison table"
            tabIndex={0}
          >
            <table
              className="comparison-table"
              style={
                { '--comparison-project-count': selected.length } as import('react').CSSProperties
              }
            >
              <caption className="comparison-sr-only">
                Comparison of {selected.map((project) => project.name).join(', ')}.
              </caption>
              <thead>
                <tr>
                  <th scope="col" className="comparison-row-label">
                    <span>THE DETAILS</span>
                    <p>At a glance.</p>
                  </th>
                  {selected.map((project) => (
                    <th scope="col" key={project.id}>
                      <div className="comparison-project-image">
                        <ResponsiveProjectImage
                          src={project.image}
                          responsiveWidth={project.imageResponsiveWidth}
                          alt={project.imageAlt || project.name}
                          fill
                          sizes="(max-width: 700px) 230px, 330px"
                        />
                      </div>
                      <p className="comparison-project-developer">{project.developerName}</p>
                      <Link
                        className="comparison-project-title"
                        href={developerProjectHref(project)}
                      >
                        {project.name}
                        <ArrowUpRight size={17} aria-hidden="true" />
                      </Link>
                      <button
                        type="button"
                        className="comparison-table-remove"
                        onClick={() => setFeedback(remove(project.id).message)}
                        aria-label={`Remove ${project.name} from table`}
                      >
                        <X size={12} aria-hidden="true" />
                        Remove
                      </button>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows
                  .filter((row) => selected.every((project) => row.get(project)))
                  .map((row) => (
                    <tr key={row.label}>
                      <th scope="row">{row.label}</th>
                      {selected.map((project) => (
                        <td key={project.id}>{row.get(project)}</td>
                      ))}
                    </tr>
                  ))}
              </tbody>
              <tfoot>
                <tr>
                  <th scope="row">
                    <span className="comparison-sr-only">Next steps</span>
                  </th>
                  {selected.map((project) => (
                    <td key={project.id}>
                      <Link
                        className="comparison-enquire"
                        href={`/contact?project=${project.slug}`}
                      >
                        Enquire
                        <ArrowUpRight size={16} aria-hidden="true" />
                        <span className="comparison-sr-only"> about {project.name}</span>
                      </Link>
                      <Link className="comparison-detail-link" href={developerProjectHref(project)}>
                        View project<span className="comparison-sr-only"> {project.name}</span>
                      </Link>
                    </td>
                  ))}
                </tr>
              </tfoot>
            </table>
          </div>
        </>
      )}
      <p className="comparison-notice">{catalogueNotice}</p>
    </div>
  );
}
