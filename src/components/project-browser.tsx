'use client';

import { BrandedSelect } from './branded-select';
import { LocationFields } from './location-fields';
import { DeveloperProjectPlaceholder } from './developer-project-placeholder';
import { getArea, readLocationFilter, updateLocationQuery } from '@/lib/locations';
import { catalogueEntries, filterCatalogue, type ApprovedListing } from '@/lib/catalogue-locations';
import './location-filters.css';

import { useEffect, useId, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Heart, RotateCcw, Search, SlidersHorizontal, X } from 'lucide-react';
import { projects } from '@/lib/content';
import { ProjectCard, useSavedProjects } from './project-card';
import { ComparisonLink } from './comparison-controls';
import { findCuratedCollection } from '@/lib/curated-collections';

type Filters = {
  collection?: string;
  emirate?: string;
  area?: string;
  type?: string;
  developer?: string;
  q?: string;
  budget?: string;
  sort?: string;
  saved?: string;
};
const noApprovedListings: readonly ApprovedListing[] = [];
export function ProjectBrowser({
  initial = {},
  approved = noApprovedListings,
}: {
  initial?: Filters;
  approved?: readonly ApprovedListing[];
}) {
  const [filtersOpen, setFiltersOpen] = useState(false);
  const dialog = useRef<HTMLDialogElement>(null);
  const filterButton = useRef<HTMLButtonElement>(null);
  const dialogId = useId();
  useEffect(() => {
    const query = matchMedia('(max-width:700px)');
    const sync = () => {
      if (!query.matches) setFiltersOpen(false);
    };
    sync();
    query.addEventListener('change', sync);
    return () => query.removeEventListener('change', sync);
  }, []);
  useEffect(() => {
    if (!filtersOpen || !dialog.current) return;
    const element = dialog.current;
    const root = document.documentElement;
    const previousOverflow = root.style.overflow;
    root.style.overflow = 'hidden';
    window.dispatchEvent(new CustomEvent('aliyas:filters-visibility', { detail: { open: true } }));
    element.showModal();
    return () => {
      if (element.open) element.close();
      root.style.overflow = previousOverflow;
      window.dispatchEvent(
        new CustomEvent('aliyas:filters-visibility', { detail: { open: false } }),
      );
      filterButton.current?.focus({ preventScroll: true });
    };
  }, [filtersOpen]);
  const searchParams = useSearchParams();
  // The URL is the source of truth, including same-route links and browser history.
  const value = (key: keyof Filters) =>
    searchParams ? searchParams.get(key) || '' : initial[key] || '';
  const location = readLocationFilter(value('emirate'), value('area'));
  const { emirate, area } = location;
  const areaName = getArea(area)?.name;
  const type = value('type');
  const developer = value('developer');
  const query = value('q');
  const budget = value('budget');
  const sort = value('sort') || 'featured';
  const savedOnly = value('saved') === '1';
  const collection = findCuratedCollection(value('collection'));
  function updateFilter(key: keyof Filters, nextValue: string, replace = false) {
    let next = new URLSearchParams(searchParams?.toString());
    if (key === 'area' || key === 'emirate') next = updateLocationQuery(next, key, nextValue);
    else if (nextValue && !(key === 'sort' && nextValue === 'featured')) next.set(key, nextValue);
    else next.delete(key);
    const path = next.size ? `/projects?${next.toString()}` : '/projects';
    if (replace) window.history.replaceState(null, '', path);
    else window.history.pushState(null, '', path);
  }
  const { saved } = useSavedProjects();
  const savedFilteredEmpty = savedOnly && saved.length > 0;
  const inventory = useMemo(() => catalogueEntries(projects, approved), [approved]);
  const filtered = useMemo(
    () =>
      filterCatalogue(inventory, {
        emirate,
        area,
        invalid: location.invalid,
        type,
        developer,
        query,
        budget,
        sort,
        savedOnly,
        saved,
        collectionSlugs: collection?.projects,
      }),
    [
      inventory,
      emirate,
      area,
      location.invalid,
      type,
      developer,
      query,
      budget,
      sort,
      savedOnly,
      saved,
      collection,
    ],
  );
  function reset() {
    window.history.pushState(null, '', '/projects');
  }
  const facets = () => (
    <>
      <LocationFields
        emirate={emirate}
        area={area}
        onChange={(field, nextValue) => updateFilter(field, nextValue)}
      />
      <label>
        <span>Property type</span>
        <BrandedSelect
          value={type}
          onValueChange={(nextValue) => updateFilter('type', nextValue)}
          aria-label="Property type"
          options={[
            { value: '', label: 'All types' },
            { value: 'Apartment', label: 'Apartment' },
            { value: 'Villa', label: 'Villa' },
            { value: 'Townhouse', label: 'Townhouse' },
          ]}
        />
      </label>
      <label>
        <span>Budget</span>
        <BrandedSelect
          value={budget}
          onValueChange={(nextValue) => updateFilter('budget', nextValue)}
          aria-label="Budget"
          options={[
            { value: '', label: 'Any budget' },
            { value: '2000000', label: 'Up to AED 2M' },
            { value: '5000000', label: 'Up to AED 5M' },
            { value: '10000000', label: 'Up to AED 10M' },
          ]}
        />
      </label>
    </>
  );
  const sortOptions = [
    { value: 'featured', label: 'Featured first' },
    { value: 'price-low', label: 'Price: low to high' },
    { value: 'price-high', label: 'Price: high to low' },
    { value: 'name', label: 'Name: A–Z' },
  ];
  return (
    <div className="catalogue-browser catalogue-browser-locations">
      {collection && (
        <div className="curated-filter-note">
          <span>
            CURATED COLLECTION <strong>{collection.title}</strong>
          </span>
          <button type="button" onClick={() => updateFilter('collection', '')}>
            Clear collection <X size={15} aria-hidden="true" />
          </button>
        </div>
      )}
      <div className="catalogue-filters">
        <label className="catalogue-search">
          <Search size={18} />
          <input
            aria-label="Search projects"
            value={query}
            onChange={(e) => updateFilter('q', e.target.value, true)}
            placeholder="Project, community or developer"
          />
        </label>
        {facets()}
      </div>
      <div className="catalogue-mobile-controls">
        <button
          ref={filterButton}
          type="button"
          aria-haspopup="dialog"
          aria-controls={dialogId}
          onClick={() => setFiltersOpen(true)}
        >
          <SlidersHorizontal size={17} aria-hidden="true" />
          Filters
          {[emirate, area, type, budget].filter(Boolean).length
            ? ` (${[emirate, area, type, budget].filter(Boolean).length})`
            : ''}
        </button>
        <label>
          <span className="catalogue-sr-only">Sort projects</span>
          <BrandedSelect
            value={sort}
            onValueChange={(nextValue) => updateFilter('sort', nextValue)}
            aria-label="Sort projects"
            options={sortOptions}
          />
        </label>
      </div>
      <dialog
        ref={dialog}
        id={dialogId}
        className="catalogue-filter-dialog"
        aria-labelledby={`${dialogId}-title`}
        data-lenis-prevent
        onCancel={(event) => {
          event.preventDefault();
          setFiltersOpen(false);
        }}
        onClick={(event) => {
          if (event.target !== event.currentTarget) return;
          const box = event.currentTarget.getBoundingClientRect();
          if (
            event.clientX < box.left ||
            event.clientX > box.right ||
            event.clientY < box.top ||
            event.clientY > box.bottom
          )
            setFiltersOpen(false);
        }}
      >
        {filtersOpen && (
          <>
            <div className="catalogue-filter-heading">
              <h2 id={`${dialogId}-title`}>Find your next address.</h2>
              <button
                type="button"
                aria-label="Close filters"
                onClick={() => setFiltersOpen(false)}
              >
                <X size={22} aria-hidden="true" />
              </button>
            </div>
            <div className="catalogue-filter-fields">{facets()}</div>
            <div className="catalogue-filter-actions">
              <button type="button" onClick={reset}>
                Reset filters
              </button>
              <button type="button" onClick={() => setFiltersOpen(false)}>
                Show {filtered.length} {filtered.length === 1 ? 'project' : 'projects'}
              </button>
            </div>
          </>
        )}
      </dialog>
      <div className="catalogue-toolbar">
        <div className="catalogue-count" aria-live="polite">
          <SlidersHorizontal size={16} />
          <strong>{filtered.length}</strong> {filtered.length === 1 ? 'project' : 'projects'} to
          explore
        </div>
        <div className="catalogue-toolbar-actions">
          <ComparisonLink />
          <button
            type="button"
            onClick={() => updateFilter('saved', savedOnly ? '' : '1')}
            className={`catalogue-saved ${savedOnly ? 'active' : ''}`}
            aria-pressed={savedOnly}
          >
            <Heart size={15} />
            <span>Saved ({saved.length})</span>
          </button>
          <label className="catalogue-sort">
            <span className="catalogue-sr-only">Sort projects</span>
            <BrandedSelect
              value={sort}
              onValueChange={(nextValue) => updateFilter('sort', nextValue)}
              aria-label="Sort projects"
              options={sortOptions}
            />
          </label>
          <button type="button" className="catalogue-reset" onClick={reset}>
            <RotateCcw size={14} />
            Reset
          </button>
        </div>
      </div>
      {(area || location.invalid) && (
        <p className="catalogue-active-filter location-active-filter" role="status">
          {location.invalid ? (
            'This location is not recognised. Choose an emirate and area from the filters.'
          ) : (
            <>
              Area: <strong>{areaName}</strong>
            </>
          )}
          <button
            type="button"
            onClick={() => {
              const next = new URLSearchParams(searchParams?.toString());
              next.delete('area');
              if (location.invalid) next.delete('emirate');
              window.history.pushState(null, '', next.size ? `/projects?${next}` : '/projects');
            }}
          >
            {location.invalid ? 'Clear location' : 'Clear area'}
          </button>
        </p>
      )}
      {developer && (
        <p className="catalogue-active-filter">
          Developer: {projects.find((p) => p.developerSlug === developer)?.developer || developer}{' '}
          <button onClick={() => updateFilter('developer', '')}>Clear</button>
        </p>
      )}
      {filtered.length ? (
        <div className="catalogue-project-grid">
          {filtered.map((project) =>
            project.sample ? (
              <ProjectCard key={project.key} project={project.sample} />
            ) : project.approved ? (
              <DeveloperProjectPlaceholder
                key={project.key}
                project={project.approved}
                developerName={project.developer}
              />
            ) : null,
          )}
        </div>
      ) : (
        <div className="catalogue-empty">
          <span className="catalogue-empty-icon" aria-hidden="true">
            {savedOnly ? <Heart size={23} /> : <Search size={23} />}
          </span>
          <h2>
            {savedOnly
              ? savedFilteredEmpty
                ? 'Your saved homes are still here.'
                : 'Your shortlist starts here.'
              : area
                ? `Explore ${areaName ?? 'another area'}.`
                : emirate === 'Ajman'
                  ? 'Looking for Ajman?'
                  : 'A little change opens new possibilities.'}
          </h2>
          <p>
            {savedOnly
              ? savedFilteredEmpty
                ? 'No saved projects match these filters. Clear the filters to see your shortlist.'
                : 'Save a project with the heart icon to find it here.'
              : area
                ? 'No listed projects match this area and your current filters. Try another area or contact Aliyas to discuss your requirements.'
                : emirate === 'Ajman'
                  ? 'There are no Ajman projects in this preview collection. Contact Aliyas to discuss your requirements.'
                  : 'Try another location, a different budget or a broader search.'}
          </p>
          <button
            className="catalogue-button"
            onClick={() => {
              if (savedFilteredEmpty) window.history.pushState(null, '', '/projects?saved=1');
              else reset();
            }}
          >
            {savedFilteredEmpty ? 'Show saved projects' : 'Explore all projects'}
          </button>
        </div>
      )}
    </div>
  );
}
