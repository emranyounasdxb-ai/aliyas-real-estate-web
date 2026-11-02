import type { DeveloperProjectRecord } from './developer-projects';
import { matchesLocation, readLocationFilter } from './locations';

export const DEVELOPER_HERO_LIMIT = 15;
export const DEVELOPER_PROJECT_PAGE_SIZE = 15;

export function selectDeveloperProjectPage(
  projects: readonly DeveloperProjectRecord[],
  query: Pick<URLSearchParams, 'get'>,
) {
  const selection = readLocationFilter(query.get('emirate') ?? '', query.get('area') ?? '');
  const filtered = projects.filter((project) => matchesLocation(project, selection));
  const pageCount = Math.max(1, Math.ceil(filtered.length / DEVELOPER_PROJECT_PAGE_SIZE));
  const raw = query.get('page') ?? '';
  const parsed = /^\d+$/.test(raw) ? Number(raw) : 1;
  const page = Math.min(pageCount, Math.max(1, Number.isSafeInteger(parsed) ? parsed : 1));
  const start = (page - 1) * DEVELOPER_PROJECT_PAGE_SIZE;
  return {
    selection,
    page,
    pageCount,
    start,
    total: filtered.length,
    items: filtered.slice(start, start + DEVELOPER_PROJECT_PAGE_SIZE),
  };
}

export function developerProjectPageNumbers(page: number, count: number): (number | string)[] {
  if (count <= 5) return Array.from({ length: count }, (_, index) => index + 1);
  const pages = [...new Set([1, count, page - 1, page, page + 1])]
    .filter((value) => value >= 1 && value <= count)
    .sort((a, b) => a - b);
  return pages.flatMap((value, index) =>
    index && value - pages[index - 1] > 1 ? [`gap-${value}`, value] : [value],
  );
}
