'use client';

import { useSyncExternalStore } from 'react';

const key = 'aliyas-saved-projects';
const empty = '[]';
function subscribe(callback: () => void) {
  window.addEventListener('storage', callback);
  window.addEventListener('aliyas-saved', callback);
  return () => {
    window.removeEventListener('storage', callback);
    window.removeEventListener('aliyas-saved', callback);
  };
}
function snapshot() {
  try {
    return localStorage.getItem(key) || empty;
  } catch {
    return empty;
  }
}

// Shared by catalogue and home controls without importing the catalogue card/CSS.
export function useSavedProjects() {
  const raw = useSyncExternalStore(subscribe, snapshot, () => empty);
  let saved: string[] = [];
  try {
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed))
      saved = parsed.filter((value): value is string => typeof value === 'string');
  } catch {
    /* Ignore malformed browser storage. */
  }
  const toggle = (slug: string) => {
    try {
      const next = saved.includes(slug) ? saved.filter((item) => item !== slug) : [...saved, slug];
      localStorage.setItem(key, JSON.stringify(next));
      window.dispatchEvent(new Event('aliyas-saved'));
    } catch {
      /* Saving is optional when the browser blocks local storage. */
    }
  };
  return { saved, toggle };
}
