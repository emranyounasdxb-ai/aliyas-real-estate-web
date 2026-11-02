'use client';

import Link from 'next/link';
import { Check, GitCompareArrows, ArrowUpRight } from '@/components/brand-icons';
import { useState } from 'react';
import { useProjectComparison } from './comparison-store';
import './comparison.css';

export function CompareButton({ slug, name }: { slug: string; name: string }) {
  const { slugs, toggle, isReady } = useProjectComparison();
  const [feedback, setFeedback] = useState({ ok: true, message: '' });
  const selected = slugs.includes(slug);
  return (
    <div className="comparison-card-control">
      <button
        type="button"
        disabled={!isReady}
        className={`comparison-select ${selected ? 'is-selected' : ''}`}
        aria-pressed={selected}
        aria-label={`Compare project: ${name}`}
        onClick={() => setFeedback(toggle(slug))}
      >
        {selected ? (
          <Check size={15} aria-hidden="true" />
        ) : (
          <GitCompareArrows size={15} aria-hidden="true" />
        )}
        <span>
          Compare<span className="comparison-action-extra"> project</span>
        </span>
      </button>
      {selected && (
        <Link className="comparison-card-link" href="/projects/compare">
          <span>View comparison</span>
          <ArrowUpRight className="comparison-short-arrow" size={20} aria-hidden="true" />
        </Link>
      )}
      <p
        role="status"
        className={
          feedback.ok && !feedback.message.includes('this visit')
            ? 'comparison-sr-only'
            : 'comparison-card-feedback'
        }
      >
        {feedback.message}
      </p>
    </div>
  );
}

export function ComparisonLink() {
  const { slugs } = useProjectComparison();
  return (
    <Link className="comparison-toolbar-link" href="/projects/compare">
      <GitCompareArrows size={16} aria-hidden="true" />
      <span>Compare ({slugs.length})</span>
    </Link>
  );
}
