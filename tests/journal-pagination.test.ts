import test from 'node:test';
import assert from 'node:assert/strict';
const sourcePath = '../src/lib/journal-pagination.ts';
const { selectJournalArticles, journalHref, journalPageNumbers } = (await import(
  sourcePath
)) as typeof import('../src/lib/journal-pagination');

// Test-only fixtures. These never enter the website's published article collection.
const stories = Array.from({ length: 50 }, (_, index) => ({
  slug: `test-${index + 1}`,
  title: `Story ${index + 1}`,
  excerpt: index % 2 ? 'Light and space' : 'Waterfront places',
  category: index < 25 ? 'Design & living' : 'Neighbourhood notes',
}));

test('50 articles yield six pages of 9,9,9,9,9,5 without duplicates or omissions', () => {
  const pages = Array.from({ length: 6 }, (_, index) =>
    selectJournalArticles(stories, { page: String(index + 1) }),
  );
  assert.deepEqual(
    pages.map((page) => page.items.length),
    [9, 9, 9, 9, 9, 5],
  );
  assert.ok(pages.every((page) => page.pageCount === 6 && page.total === 50));
  assert.deepEqual(
    pages.flatMap((page) => page.items.map((story) => story.slug)),
    stories.map((story) => story.slug),
  );
});
test('pagination boundaries, small libraries and invalid inputs are safe', () => {
  for (const [size, count, last] of [
    [0, 1, 0],
    [3, 1, 3],
    [9, 1, 9],
    [10, 2, 1],
  ] as const) {
    const result = selectJournalArticles(stories.slice(0, size), { page: '99' });
    assert.equal(result.pageCount, count);
    assert.equal(result.items.length, last);
  }
  for (const value of ['-1', 'NaN', 'Infinity', '2.5', '9007199254740992', '']) {
    assert.equal(selectJournalArticles(stories, { page: value }).page, 1);
  }
  assert.equal(selectJournalArticles(stories, { page: '999' }).page, 6);
  assert.equal(selectJournalArticles(stories, { page: ['2', '6'] }).page, 2);
});
test('search and topic filtering paginate the filtered set, with empty results handled', () => {
  const result = selectJournalArticles(stories, {
    q: '  LIGHT space  ',
    topic: 'design-living',
    page: '2',
  });
  assert.equal(result.total, 12);
  assert.equal(result.items.length, 3);
  assert.equal(result.pageCount, 2);
  assert.ok(
    result.items.every(
      (story) => story.category === 'Design & living' && story.excerpt === 'Light and space',
    ),
  );
  const empty = selectJournalArticles(stories, { q: 'not-a-match', page: '6' });
  assert.equal(empty.items.length, 0);
  assert.equal(empty.page, 1);
  assert.equal(selectJournalArticles(stories, { topic: 'unknown' }).total, 50);
});
test('dated search results are newest first and undated stories appear last', () => {
  const dated = [
    { ...stories[0], slug: 'old', date: '2026-01-01' },
    { ...stories[1], slug: 'undated' },
    { ...stories[2], slug: 'new', date: '2026-07-19' },
    { ...stories[3], slug: 'middle', date: '2026-04-11' },
  ];
  const result = selectJournalArticles(dated, { topic: 'design-living', q: 'story' });
  assert.deepEqual(
    result.items.map((story) => story.slug),
    ['new', 'middle', 'old', 'undated'],
  );
  assert.deepEqual(
    dated.map((story) => story.slug),
    ['old', 'undated', 'new', 'middle'],
  );
});
test('links preserve filters, reset page by default and encode special text safely', () => {
  const href = journalHref({ page: 6, topic: 'design-living', q: 'light & space' });
  const url = new URL(href, 'http://localhost');
  assert.equal(url.searchParams.get('q'), 'light & space');
  assert.equal(url.searchParams.get('page'), '6');
  assert.equal(url.hash, '#journal-stories');
  assert.equal(
    journalHref({ topic: 'design-living' }),
    '/journal?topic=design-living#journal-stories',
  );
  assert.equal(journalHref({}, false), '/journal');
  assert.deepEqual(journalPageNumbers(1, 6), [1, 2, 3, 4, 5, 6]);
  assert.deepEqual(journalPageNumbers(6, 12), [1, 'gap-5', 5, 6, 7, 'gap-12', 12]);
});
