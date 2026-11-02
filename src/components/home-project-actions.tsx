'use client';

import { Heart } from '@/components/brand-icons';
import { CompareButton } from './comparison-controls';
import { useSavedProjects } from './saved-projects-store';

export function HomeProjectActions({ slug, name }: { slug: string; name: string }) {
  const { saved, toggle } = useSavedProjects();
  const selected = saved.includes(slug);
  return (
    <div className="home-project-actions">
      <button
        className="home-project-save"
        type="button"
        aria-label={`${selected ? 'Unsave' : 'Save'} ${name}`}
        aria-pressed={selected}
        onClick={() => toggle(slug)}
      >
        <Heart size={16} fill={selected ? 'currentColor' : 'none'} aria-hidden="true" />
        {selected ? 'Saved' : 'Save'}
      </button>
      <CompareButton slug={slug} name={name} />
    </div>
  );
}
