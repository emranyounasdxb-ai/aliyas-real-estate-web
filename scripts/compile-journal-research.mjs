import { readFile, readdir, writeFile, mkdir } from 'node:fs/promises';
import assert from 'node:assert/strict';
import { journalArticlePlans } from '../src/lib/journal-articles.ts';

// Source records deliberately cannot override the owner's identity or media fields.
const allowed = new Set([
  'status',
  'date',
  'researchedAt',
  'excerpt',
  'introduction',
  'takeaways',
  'sections',
  'references',
]);
const plain = (value) => value.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1').replace(/\*\*/g, '');
const strings = (value) =>
  typeof value === 'string'
    ? [value]
    : Array.isArray(value)
      ? value.flatMap(strings)
      : value && typeof value === 'object'
        ? Object.values(value).flatMap(strings)
        : [];
const output = {};
const report = [];
const internal = new Set(journalArticlePlans.map((a) => `/journal/${a.slug}`));
const files = (await readdir(new URL('../src/content/journal/', import.meta.url)))
  .filter((f) => /^\d{3}\.json$/.test(f))
  .sort();
const publishedJournalPaths = new Set(
  files.map((file) => {
    const plan = journalArticlePlans[Number(file.slice(0, 3)) - 1];
    assert.ok(plan, `Unknown article ${file}`);
    return `/journal/${plan.slug}`;
  }),
);
for (const file of files) {
  const number = Number(file.slice(0, 3));
  const plan = journalArticlePlans[number - 1];
  assert.ok(plan, `Unknown article ${file}`);
  const article = JSON.parse(
    await readFile(new URL(`../src/content/journal/${file}`, import.meta.url), 'utf8'),
  );
  // Authored English must not carry hidden markers, bidi overrides or invisible separators.
  // Normal spaces/newlines and visible punctuation remain valid.
  const invisible =
    /[\p{Cf}\p{Default_Ignorable_Code_Point}\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F\u00A0\u202F]/u;
  for (const value of strings(article)) {
    assert.ok(!invisible.test(value), `${file}: invisible/control character in authored text`);
    assert.ok(!/<\/?[a-z][^>]*>/i.test(value), `${file}: raw HTML is not allowed in article text`);
  }
  assert.ok(
    Object.keys(article).every((key) => allowed.has(key)),
    `Identity/media override in ${file}`,
  );
  assert.equal(article.status, 'published');
  assert.match(article.researchedAt, /^\d{4}-\d{2}-\d{2}$/);
  assert.ok(article.sections.length >= 5 && article.takeaways.length >= 2);
  assert.ok(article.references.length >= 2);
  const narrative = [article.introduction, ...article.sections.map((s) => s.body)].join(' ');
  const words = plain(narrative).split(/\s+/).filter(Boolean).length;
  assert.ok(words >= 800, `${file}: only ${words} narrative words`);
  const refs = new Set(article.references.map((r) => r.url));
  const text = strings({
    introduction: article.introduction,
    takeaways: article.takeaways,
    sections: article.sections,
  }).join('\n');
  const links = [...text.matchAll(/\[([^\]]+)\]\(([^)]+)\)/g)];
  for (const [, label, url] of links) {
    assert.ok(label.length > 3);
    if (url.startsWith('/') && !url.startsWith('//')) {
      const { pathname } = new URL(url, 'https://aliyasrealestate.ae');
      assert.ok(
        internal.has(pathname) || ['/projects', '/contact'].includes(pathname),
        `Unresolved internal link ${url}`,
      );
      if (number > 100 && pathname.startsWith('/journal/'))
        assert.ok(
          publishedJournalPaths.has(pathname),
          `Link to unpublished journal article ${url} in ${file}`,
        );
    } else {
      assert.equal(new URL(url).protocol, 'https:');
      assert.ok(refs.has(url), `Missing reference ${url} in ${file}`);
    }
  }
  assert.ok(links.filter((x) => x[2].startsWith('/')).length >= 2);
  assert.ok(article.sections.some((s) => s.table));
  if (number > 100) {
    assert.ok(
      links.some((x) => x[2].startsWith('/projects')),
      `${file}: missing relevant listings link`,
    );
    assert.ok(
      links.some((x) => x[2].startsWith('/journal/')),
      `${file}: missing area guide link`,
    );
    assert.ok(
      links.some((x) => x[2].startsWith('/contact')),
      `${file}: missing enquiry link`,
    );
  }
  for (const section of article.sections) {
    assert.ok(section.heading && section.body);
    if (section.table)
      assert.ok(section.table.rows.every((row) => row.length === section.table.columns.length));
    if (section.chart) {
      assert.ok(section.chart.unit && section.chart.note && section.chart.kind);
      assert.ok(section.chart.values.every((v) => Number.isFinite(v.value) && v.value >= 0));
    }
  }
  const visibleWords = plain(
    strings({
      introduction: article.introduction,
      takeaways: article.takeaways,
      sections: article.sections,
    }).join(' '),
  ).split(/\s+/).length;
  output[plan.id] = { ...article, readTime: `${Math.ceil(visibleWords / 220)} min read` };
  report.push({
    id: plan.id,
    title: plan.title,
    slug: plan.slug,
    narrativeWords: words,
    estimatedMinutes: Math.ceil(visibleWords / 220),
    references: refs.size,
    internalLinks: links.filter((x) => x[2].startsWith('/')).length,
    tables: article.sections.filter((s) => s.table).length,
    charts: article.sections.filter((s) => s.chart).length,
  });
}
await writeFile(
  new URL('../src/lib/journal-research.json', import.meta.url),
  JSON.stringify(output, null, 2) + '\n',
);
await mkdir(new URL('../artifacts/journal-research/', import.meta.url), { recursive: true });
await writeFile(
  new URL('../artifacts/journal-research/content-validation.json', import.meta.url),
  JSON.stringify(
    { checkedAt: new Date().toISOString(), completed: report.length, articles: report },
    null,
    2,
  ) + '\n',
);
console.log(
  JSON.stringify(
    {
      compiled: report.length,
      articles: report.map(({ id, narrativeWords, tables, charts }) => ({
        id,
        narrativeWords,
        tables,
        charts,
      })),
    },
    null,
    2,
  ),
);
