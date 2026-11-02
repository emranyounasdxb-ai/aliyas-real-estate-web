'use client';
import { useEffect, useRef, type MouseEvent } from 'react';
import { useSearchParams, usePathname } from 'next/navigation';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { LocationFields } from './location-fields';
import { DeveloperProjectPlaceholder } from './developer-project-placeholder';
import { getArea, updateLocationQuery } from '@/lib/locations';
import {
  developerProjectPageNumbers,
  selectDeveloperProjectPage,
} from '@/lib/developer-project-pagination';
import type { DeveloperProjectRecord } from '@/lib/developer-projects';
import './location-filters.css';

export function DeveloperListings({
  projects,
  developerName,
}: {
  projects: readonly DeveloperProjectRecord[];
  developerName: string;
}) {
  const query = useSearchParams();
  const pathname = usePathname();
  const view = selectDeveloperProjectPage(projects, query);
  const { selection } = view;
  const jumpToResults = useRef(false);
  const queryKey = query.toString();
  useEffect(() => {
    if (!jumpToResults.current) return;
    jumpToResults.current = false;
    const frame = requestAnimationFrame(() => {
      const section = document.getElementById('developer-projects');
      if (!section) return;
      const top =
        section.getBoundingClientRect().top +
        scrollY -
        parseFloat(getComputedStyle(section).scrollMarginTop);
      const event = new CustomEvent('aliyas:scroll-to', { cancelable: true, detail: { top } });
      if (window.dispatchEvent(event)) window.scrollTo({ top, behavior: 'instant' });
      document.getElementById('developer-projects-title')?.focus({ preventScroll: true });
    });
    return () => cancelAnimationFrame(frame);
  }, [queryKey]);
  function href(next: URLSearchParams) {
    return `${pathname}${next.size ? `?${next}` : ''}#developer-projects`;
  }
  function pageHref(page: number) {
    const next = new URLSearchParams(queryKey);
    if (page > 1) next.set('page', String(page));
    else next.delete('page');
    return href(next);
  }
  function navigate(event: MouseEvent<HTMLAnchorElement>) {
    if (event.button !== 0 || event.metaKey || event.ctrlKey || event.altKey || event.shiftKey)
      return;
    event.preventDefault();
    if (event.currentTarget.getAttribute('aria-current')) return;
    jumpToResults.current = true;
    window.history.pushState(null, '', event.currentTarget.href);
  }
  function change(field: 'emirate' | 'area', value: string) {
    const next = updateLocationQuery(new URLSearchParams(query.toString()), field, value);
    next.delete('page');
    window.history.pushState(null, '', href(next));
  }
  function clearLocation(jump = false) {
    const next = new URLSearchParams(queryKey);
    next.delete('emirate');
    next.delete('area');
    next.delete('page');
    jumpToResults.current = jump;
    window.history.pushState(null, '', href(next));
  }
  return (
    <>
      <div
        className="developer-location-filters"
        role="group"
        aria-label={`Filter ${developerName} projects by location`}
      >
        <LocationFields emirate={selection.emirate} area={selection.area} onChange={change} />
        <button type="button" className="location-reset" onClick={() => clearLocation()}>
          Clear location
        </button>
      </div>
      <p className="developer-location-count" role="status">
        {view.total
          ? `Showing ${view.start + 1}–${view.start + view.items.length} of ${view.total} projects`
          : `0 of ${projects.length} projects`}
        {selection.area && getArea(selection.area) ? ` · ${getArea(selection.area)!.name}` : ''}
      </p>
      {view.total ? (
        <div className="catalogue-project-grid developer-listings-grid">
          {view.items.map((project) => (
            <DeveloperProjectPlaceholder
              key={project.id}
              project={project}
              developerName={developerName}
            />
          ))}
        </div>
      ) : (
        <div className="developer-location-empty">
          <h3>No matching projects in this location.</h3>
          <p>
            {selection.invalid
              ? 'Choose a location from the filters above.'
              : 'Project locations will appear here as their details are confirmed. You can browse the developer collection instead.'}
          </p>
          <button type="button" onClick={() => clearLocation(true)}>
            View all {projects.length} projects
          </button>
        </div>
      )}
      {view.pageCount > 1 && (
        <nav className="developer-pagination" aria-label="Project pagination">
          <p className="developer-pagination-summary">
            Page {view.page} of {view.pageCount}
          </p>
          <div className="developer-pagination-controls">
            {view.page > 1 ? (
              <a
                className="developer-pagination-previous"
                href={pageHref(view.page - 1)}
                onClick={navigate}
                rel="prev"
              >
                <ArrowLeft size={16} aria-hidden="true" />
                Previous
              </a>
            ) : (
              <span className="developer-pagination-previous" aria-disabled="true">
                <ArrowLeft size={16} aria-hidden="true" />
                Previous
              </span>
            )}
            <div className="developer-pagination-numbers">
              {developerProjectPageNumbers(view.page, view.pageCount).map((page) =>
                typeof page === 'string' ? (
                  <span className="developer-pagination-gap" aria-hidden="true" key={page}>
                    …
                  </span>
                ) : (
                  <a
                    key={page}
                    href={pageHref(page)}
                    onClick={navigate}
                    aria-label={`Page ${page}`}
                    aria-current={page === view.page ? 'page' : undefined}
                  >
                    {page}
                  </a>
                ),
              )}
            </div>
            {view.page < view.pageCount ? (
              <a
                className="developer-pagination-next"
                href={pageHref(view.page + 1)}
                onClick={navigate}
                rel="next"
              >
                Next
                <ArrowRight size={16} aria-hidden="true" />
              </a>
            ) : (
              <span className="developer-pagination-next" aria-disabled="true">
                Next
                <ArrowRight size={16} aria-hidden="true" />
              </span>
            )}
          </div>
        </nav>
      )}
    </>
  );
}
