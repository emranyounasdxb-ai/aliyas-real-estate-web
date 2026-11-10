export const JOURNAL_PAGE_SIZE = 9;

export type JournalQuery = {
  page?: string | string[];
  topic?: string | string[];
  q?: string | string[];
};
type SearchableStory = { title: string; category: string; excerpt: string; date?: string };
const first = (value: string | string[] | undefined) =>
  (Array.isArray(value) ? value[0] : value) ?? '';
export const journalTopicId = (category: string) =>
  category
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');

export function selectJournalArticles<T extends SearchableStory>(
  stories: readonly T[],
  query: JournalQuery,
) {
  const q = first(query.q).trim().slice(0, 120);
  const topics = [...new Set(stories.map((story) => story.category))].map((label) => ({
    label,
    id: journalTopicId(label),
    count: stories.filter((story) => story.category === label).length,
  }));
  const topic = topics.find((item) => item.id === first(query.topic))?.id ?? '';
  const terms = q.toLocaleLowerCase().split(/\s+/).filter(Boolean);
  const filtered = stories
    .filter((story) => {
      const text = `${story.title} ${story.category} ${story.excerpt}`.toLocaleLowerCase();
      return (
        (!topic || journalTopicId(story.category) === topic) &&
        terms.every((term) => text.includes(term))
      );
    })
    .sort((a, b) => (b.date ?? '').localeCompare(a.date ?? ''));
  const pageCount = Math.max(1, Math.ceil(filtered.length / JOURNAL_PAGE_SIZE));
  const rawPage = first(query.page);
  const parsed = /^\d+$/.test(rawPage) ? Number(rawPage) : 1;
  const page = Math.min(pageCount, Math.max(1, Number.isSafeInteger(parsed) ? parsed : 1));
  const start = (page - 1) * JOURNAL_PAGE_SIZE;
  return {
    q,
    topic,
    topics,
    page,
    pageCount,
    total: filtered.length,
    start,
    items: filtered.slice(start, start + JOURNAL_PAGE_SIZE),
  };
}

export function journalHref(
  { page = 1, topic = '', q = '' }: { page?: number; topic?: string; q?: string } = {},
  anchor = true,
) {
  const params = new URLSearchParams();
  if (topic) params.set('topic', topic);
  if (q) params.set('q', q);
  if (page > 1) params.set('page', String(page));
  const search = params.toString();
  return `/journal${search ? `?${search}` : ''}${anchor ? '#journal-stories' : ''}`;
}

export function journalPageNumbers(page: number, count: number): (number | string)[] {
  if (count <= 7) return Array.from({ length: count }, (_, index) => index + 1);
  const visible = new Set(
    [1, count, page - 1, page, page + 1].filter((value) => value >= 1 && value <= count),
  );
  const sorted = [...visible].sort((a, b) => a - b);
  return sorted.flatMap((value, index) =>
    index && value - sorted[index - 1] > 1 ? [`gap-${value}`, value] : [value],
  );
}
