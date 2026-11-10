import test from 'node:test';
import assert from 'node:assert/strict';
import { stat } from 'node:fs/promises';

const articleSource = '../src/lib/journal-articles.ts';
const paginationSource = '../src/lib/journal-pagination.ts';
const { journalArticles, journalArticlePlans } = (await import(
  articleSource
)) as typeof import('../src/lib/journal-articles');
const { selectJournalArticles } = (await import(
  paginationSource
)) as typeof import('../src/lib/journal-pagination');

test('the owner collection contains 200 stable, separately owned article records', () => {
  assert.equal(journalArticles.length, 200);
  for (const field of ['id', 'slug', 'title'] as const)
    assert.equal(new Set(journalArticles.map((article) => article[field])).size, 200);
  journalArticles.forEach((article, index) => {
    assert.equal(article.sequence, index + 1);
    assert.equal(article.id, `aliyas-journal-${String(index + 1).padStart(3, '0')}`);
    assert.equal(article.title, journalArticlePlans[index].title);
    assert.match(article.slug, /^[a-z0-9]+(?:-[a-z0-9]+)*$/);
  });
  assert.equal(
    journalArticles[0].title,
    'UAE Real Estate Outlook 2026: Finding Opportunities in a Changing Market',
  );
  assert.equal(
    journalArticles[49].title,
    'Your Next Move in UAE Real Estate: Finding the Right Opportunity with Aliyas',
  );
  assert.equal(
    journalArticles[7].title,
    'Why Location and Quality Matter More in the UAE’s Changing Property Market',
  );
  assert.equal(journalArticles[50].title, 'How to Prepare Your UAE Property for a Successful Sale');
  assert.equal(
    journalArticles[99].title,
    'Storage Rooms, Laundry Areas and Service Spaces: The Overlooked Parts of a Great Home',
  );
});
test('owned covers remain separate and only researched articles gain bodies and dates', () => {
  const sections = journalArticles.flatMap((article) => article.sections);
  assert.equal(new Set(sections).size, sections.length);
  for (const article of journalArticles) {
    assert.ok(article.image.startsWith(`/images/journal/${article.id}-`));
    assert.ok(article.imageAlt?.trim());
    assert.equal(article.imageWidth, 1672);
    assert.ok(article.imageHeight === 940 || article.imageHeight === 941);
    if (article.status === 'planned') {
      assert.equal(article.date, undefined);
      assert.equal(article.readTime, undefined);
      assert.equal(article.sections.length, 3);
      assert.ok(article.sections.every((section) => section.heading && section.body === ''));
    } else {
      assert.match(article.researchedAt!, /^\d{4}-\d{2}-\d{2}$/);
      assert.match(article.readTime!, /^\d+ min read$/);
      assert.ok(article.sections.length >= 5);
      assert.ok(article.sections.every((section) => section.heading && section.body.length > 100));
      assert.ok(article.references && article.references.length >= 2);
      assert.ok(article.sections.some((section) => section.table));
    }
  }
});
test('the 200 articles paginate newest first and topics/search select the correct entries', () => {
  const pages = Array.from({ length: 23 }, (_, index) =>
    selectJournalArticles(journalArticles, { page: String(index + 1) }),
  );
  assert.deepEqual(
    pages.map((page) => page.items.length),
    [...Array(22).fill(9), 2],
  );
  assert.deepEqual(
    pages.flatMap((page) => page.items.map((article) => article.id)),
    journalArticles.map((article) => article.id).reverse(),
  );
  assert.equal(pages[0].items[0].date, '2026-07-19');
  assert.equal(pages[22].items.at(-1)?.date, '2026-01-01');
  assert.deepEqual(
    pages[0].topics.map((topic) => topic.count),
    [10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 30, 25, 15, 10, 10, 10],
  );
  assert.equal(selectJournalArticles(journalArticles, { q: 'Ajman' }).total, 35);
  assert.equal(
    selectJournalArticles(journalArticles, { topic: 'places-communities', page: '2' }).items[0].id,
    'aliyas-journal-021',
  );
  assert.equal(
    selectJournalArticles(journalArticles, { topic: 'seller-guides', page: '2' }).items[0].id,
    'aliyas-journal-051',
  );
  assert.equal(
    selectJournalArticles(journalArticles, { q: 'District Cooling' }).items[0].id,
    'aliyas-journal-097',
  );
  assert.ok(journalArticles.slice(0, 50).every((article) => article.status === 'published'));
  assert.ok(
    journalArticles
      .slice(50)
      .every(
        (article) =>
          article.status === 'published' ||
          (article.status === 'planned' && !article.researchedAt && !article.references),
      ),
  );
});

test('all 200 covers have separate, existing responsive assets for every advertised size', async () => {
  const paths = new Set<string>();
  for (const article of journalArticles) {
    const candidates = article.imageSrcSet?.split(', ').map((entry) => entry.split(' '));
    assert.ok(candidates);
    assert.deepEqual(
      candidates.map(([, width]) => width),
      ['480w', '768w', '1080w', '1672w'],
    );
    assert.equal(candidates.at(-1)?.[0], article.image);
    for (const [url] of candidates) {
      assert.ok(url.startsWith(`/images/journal/${article.id}-`));
      assert.equal(paths.has(url), false, `Asset shared by different articles: ${url}`);
      assert.ok((await stat(new URL(`../public${url}`, import.meta.url))).size > 0);
      paths.add(url);
    }
  }
  assert.equal(paths.size, 800);
});
