'use client';

import { Heart } from '@/components/brand-icons';
import { CompareButton } from './comparison-controls';
import { useSavedProjects } from './saved-projects-store';

export function HomeProjectActions({
  slug,
  name,
  legacySlug,
}: {
  slug: string;
  name: string;
  legacySlug?: string;
}) {
  const { saved, toggle } = useSavedProjects();
  const selected = saved.includes(slug) || Boolean(legacySlug && saved.includes(legacySlug));
  return (
    <div className="home-project-actions">
      <button
        className="home-project-save"
        type="button"
        aria-label={`${selected ? 'Unsave' : 'Save'} ${name}`}
        aria-pressed={selected}
        onClick={() => toggle(legacySlug && saved.includes(legacySlug) ? legacySlug : slug)}
      >
        <Heart size={16} fill={selected ? 'currentColor' : 'none'} aria-hidden="true" />
        {selected ? 'Saved' : 'Save'}
      </button>
      <CompareButton slug={slug} name={name} />
    </div>
  );
}
