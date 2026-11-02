'use client';

import { BrandedSelect } from './branded-select';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowUpRight, Search, X } from '@/components/brand-icons';
import { DeveloperMark } from '@/components/developer-mark';
import type { Developer } from '@/lib/developers';

export function DeveloperDirectory({
  developers,
}: {
  developers: (Developer & { projectCount: number })[];
}) {
  const [query, setQuery] = useState('');
  const [sort, setSort] = useState('featured');
  const search = query.trim().toLocaleLowerCase();
  const matches = developers.filter((developer) =>
    `${developer.name} ${developer.market ?? ''}`.toLocaleLowerCase().includes(search),
  );
  const visible =
    sort === 'name' ? [...matches].sort((a, b) => a.name.localeCompare(b.name)) : matches;

  return (
    <section className="developer-directory" aria-label="Developer directory">
      <div className="developer-directory-toolbar">
        <div className="developer-directory-search">
          <Search size={20} aria-hidden="true" />
          <label htmlFor="developer-search" className="sr-only">
            Search developers
          </label>
          <input
            id="developer-search"
            type="search"
            placeholder="Search by name or emirate"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            autoComplete="off"
            aria-controls="developer-results"
          />
          {query && (
            <button type="button" aria-label="Clear developer search" onClick={() => setQuery('')}>
              <X size={18} aria-hidden="true" />
            </button>
          )}
        </div>
        <label className="developer-directory-sort">
          Sort by
          <BrandedSelect
            value={sort}
            onValueChange={setSort}
            aria-label="Sort developers"
            options={[
              { value: 'featured', label: 'Our network' },
              { value: 'name', label: 'Name: A to Z' },
            ]}
          />
        </label>
      </div>
      <p className="developer-directory-count" role="status" aria-live="polite">
        {visible.length} of {developers.length} developers
      </p>
      <div id="developer-results" className="catalogue-developer-grid">
        {visible.map((developer) => (
          <Link
            href={`/developers/${developer.slug}`}
            className="catalogue-developer-card"
            key={developer.slug}
            aria-label={`Explore ${developer.name}`}
          >
            <div className="developer-logo-stage" data-developer={developer.slug}>
              <DeveloperMark slug={developer.slug} name={developer.name} variant="directory" />
            </div>
            <h2 className="catalogue-developer-wordmark">{developer.name}</h2>
            <p>{developer.market}</p>
            <span className="developer-registration">
              {developer.registeredWithAliyas ? 'Registered with Aliyas' : 'Developer profile'}
            </span>
            <div className="developer-card-action">
              <span>
                Explore projects <small>{developer.projectCount} previews</small>
              </span>
              <ArrowUpRight size={20} aria-hidden="true" />
            </div>
          </Link>
        ))}
      </div>
      {visible.length === 0 && (
        <div className="developer-directory-empty">
          <h2>No matching developers.</h2>
          <p>Try a different name or return to the full directory.</p>
          <button type="button" className="catalogue-button" onClick={() => setQuery('')}>
            Show all developers
          </button>
        </div>
      )}
    </section>
  );
}
