'use client';

import type { MouseEventHandler } from 'react';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { developerProjectPageNumbers } from '@/lib/developer-project-pagination';
import './project-pagination.css';

export function ProjectPagination({
  page,
  pageCount,
  href,
  onNavigate,
}: {
  page: number;
  pageCount: number;
  href: (page: number) => string;
  onNavigate: MouseEventHandler<HTMLAnchorElement>;
}) {
  if (pageCount <= 1) return null;
  return (
    <nav className="developer-pagination" aria-label="Project pagination">
      <p className="developer-pagination-summary">
        Page {page} of {pageCount}
      </p>
      <div className="developer-pagination-controls">
        {page > 1 ? (
          <a
            className="developer-pagination-previous"
            href={href(page - 1)}
            onClick={onNavigate}
            rel="prev"
          >
            <ArrowLeft size={16} aria-hidden="true" /> Previous
          </a>
        ) : (
          <span className="developer-pagination-previous" aria-disabled="true">
            <ArrowLeft size={16} aria-hidden="true" /> Previous
          </span>
        )}
        <div className="developer-pagination-numbers">
          {developerProjectPageNumbers(page, pageCount).map((value) =>
            typeof value === 'string' ? (
              <span className="developer-pagination-gap" aria-hidden="true" key={value}>
                …
              </span>
            ) : (
              <a
                key={value}
                href={href(value)}
                onClick={onNavigate}
                aria-label={`Page ${value}`}
                aria-current={value === page ? 'page' : undefined}
              >
                {value}
              </a>
            ),
          )}
        </div>
        {page < pageCount ? (
          <a
            className="developer-pagination-next"
            href={href(page + 1)}
            onClick={onNavigate}
            rel="next"
          >
            Next <ArrowRight size={16} aria-hidden="true" />
          </a>
        ) : (
          <span className="developer-pagination-next" aria-disabled="true">
            Next <ArrowRight size={16} aria-hidden="true" />
          </span>
        )}
      </div>
    </nav>
  );
}
