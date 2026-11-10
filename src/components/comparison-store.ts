'use client';

import { useMemo, useSyncExternalStore } from 'react';

export const COMPARISON_STORAGE_KEY = 'aliyas-compare-projects';
export const MAX_COMPARISON_PROJECTS = 3;
const changeEvent = 'aliyas-comparison-change';
const empty = '[]';
const subscribeReady = () => () => {};
const legacyKeys: Record<string, string> = {
  'sobha-solis': 'sobha-project-19',
  'gardenia-bay': 'aldar-project-21',
  'cala-del-mar': 'ellington-project-19',
  'damac-islands': 'damac-project-07',
};
export const comparisonKey = (value: string) => legacyKeys[value] ?? value;
const validKey = (value: string) => /^[a-z0-9-]+-project-[0-9]+$/.test(value);
let memorySnapshot = empty;
let storageUnavailable = false;

function parseSelection(raw: string): string[] {
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return [
      ...new Set(
        parsed
          .filter((slug): slug is string => typeof slug === 'string')
          .map(comparisonKey)
          .filter(validKey),
      ),
    ].slice(0, MAX_COMPARISON_PROJECTS);
  } catch {
    return [];
  }
}

function getSnapshot() {
  try {
    if (!storageUnavailable) return localStorage.getItem(COMPARISON_STORAGE_KEY) || empty;
  } catch {
    storageUnavailable = true;
  }
  return memorySnapshot;
}

function subscribe(listener: () => void) {
  const onStorage = (event: StorageEvent) => {
    if (event.key === COMPARISON_STORAGE_KEY || event.key === null) listener();
  };
  window.addEventListener('storage', onStorage);
  window.addEventListener(changeEvent, listener);
  return () => {
    window.removeEventListener('storage', onStorage);
    window.removeEventListener(changeEvent, listener);
  };
}

type SelectionResult = { ok: boolean; message: string };
function persist(slugs: string[], message: string): SelectionResult {
  memorySnapshot = JSON.stringify(slugs);
  try {
    localStorage.setItem(COMPARISON_STORAGE_KEY, memorySnapshot);
    storageUnavailable = false;
  } catch {
    storageUnavailable = true;
  }
  window.dispatchEvent(new Event(changeEvent));
  return {
    ok: true,
    message: storageUnavailable
      ? `${message} Saved for this visit only; browser storage is unavailable.`
      : message,
  };
}

function selectProject(projectKey: string, name = 'Project'): SelectionResult {
  const slug = comparisonKey(projectKey);
  if (!validKey(slug))
    return { ok: false, message: 'Please select a project from the collection.' };
  const selection = parseSelection(getSnapshot());
  if (selection.includes(slug))
    return persist(
      selection.filter((item) => item !== slug),
      `${name} removed from comparison.`,
    );
  if (selection.length >= MAX_COMPARISON_PROJECTS)
    return {
      ok: false,
      message: 'You can compare up to 3 projects. Remove one before adding another.',
    };
  return persist([...selection, slug], `${name} added to comparison.`);
}

function replaceProject(previous: string | undefined, next: string): SelectionResult {
  const selection = parseSelection(getSnapshot());
  if (next && !validKey(next))
    return { ok: false, message: 'Please select a project from the collection.' };
  if (next && next !== previous && selection.includes(next))
    return { ok: false, message: 'This project is already in your comparison.' };
  const index = previous ? selection.indexOf(previous) : -1;
  if (index >= 0) {
    if (next) selection[index] = next;
    else selection.splice(index, 1);
  } else if (next) {
    if (selection.length >= MAX_COMPARISON_PROJECTS)
      return {
        ok: false,
        message: 'You can compare up to 3 projects. Remove one before adding another.',
      };
    selection.push(next);
  }
  return persist(selection, next ? 'Comparison updated.' : 'Project removed from comparison.');
}

export function useProjectComparison() {
  const isReady = useSyncExternalStore(
    subscribeReady,
    () => true,
    () => false,
  );
  const raw = useSyncExternalStore(subscribe, getSnapshot, () => empty);
  const slugs = useMemo(() => parseSelection(raw), [raw]);
  return {
    isReady,
    slugs,
    toggle: selectProject,
    replace: replaceProject,
    remove: (slug: string) =>
      persist(
        parseSelection(getSnapshot()).filter((item) => item !== slug),
        'Project removed from comparison.',
      ),
    clear: () => persist([], 'Comparison cleared.'),
  };
}
