import Link from 'next/link';
import { Fragment, type ReactNode } from 'react';
import { ArrowLeft, ArrowUpRight } from 'lucide-react';
import { JournalCover } from '@/components/journal-cover';
import { SectionNavigation } from '@/components/section-navigation';
import { ResearchChart } from './research-chart';
import {
  articles,
  articleSchema,
  breadcrumbSchema,
  serializeSchema,
  type Article,
} from '@/lib/content';
import styles from './researched-article.module.css';

// A deliberately small inline format: trusted authored text, emphasis and links.
// React escapes text; raw HTML and executable URL schemes are never accepted.
function Inline({ text }: { text: string }) {
  const parts = text.split(/(\[[^\]]+\]\((?:https:\/\/|\/)[^)\s]+\)|\*\*[^*]+\*\*)/g);
  return parts.map((part, index): ReactNode => {
    const match = part.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
    if (match) {
      const [, label, href] = match;
      if (href.startsWith('/') && !href.startsWith('//'))
        return (
          <Link href={href} key={index}>
            {label}
          </Link>
        );
      if (href.startsWith('https://'))
        return (
          <a href={href} key={index} target="_blank" rel="noopener noreferrer">
            {label}
          </a>
        );
      return <Fragment key={index}>{label}</Fragment>;
    }
    if (part.startsWith('**') && part.endsWith('**'))
      return <strong key={index}>{part.slice(2, -2)}</strong>;
    return <Fragment key={index}>{part}</Fragment>;
  });
}
function Paragraphs({ text }: { text: string }) {
  return text
    .split('\n\n')
    .filter(Boolean)
    .map((paragraph, index) => (
      <p key={index}>
        <Inline text={paragraph} />
      </p>
    ));
}

export function ResearchedArticle({ article }: { article: Article }) {
  const formattedDate = new Intl.DateTimeFormat('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(new Date(article.researchedAt!));
  const related = articles
    .filter(
      (item) =>
        item.id !== article.id && item.category === article.category && item.status === 'published',
    )
    .slice(0, 2);
  return (
    <article className={styles.page}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: serializeSchema([
            articleSchema(article),
            breadcrumbSchema('journal', article.slug, article.title),
          ]),
        }}
      />
      <Link
        className={styles.back}
        href={`/journal?page=${Math.ceil((article.sequence ?? 1) / 9)}#journal-stories`}
      >
        <ArrowLeft size={18} /> Back to the journal
      </Link>
      <header className={styles.header}>
        <p className={styles.eyebrow}>
          {article.category} <span>•</span> {article.readTime}
        </p>
        <h1>{article.title}</h1>
        <p className={styles.dek}>{article.excerpt}</p>
        <p className={styles.byline}>
          Aliyas editorial <span>•</span> Research checked{' '}
          <time dateTime={article.researchedAt}>{formattedDate}</time>
        </p>
      </header>
      <figure className={styles.cover}>
        <JournalCover
          article={article}
          sizes="(max-width:767px) 100vw, (max-width:1439px) 90vw, 1280px"
          priority
        />
        <figcaption>Illustrative image</figcaption>
      </figure>
      <div className={styles.layout}>
        <aside className={styles.sidebar}>
          <details open>
            <summary>In this article</summary>
            <SectionNavigation
              vertical
              label="Article contents"
              className={styles.contents}
              items={article.sections.map((section, index) => ({
                id: `story-section-${index + 1}`,
                label: `${index + 1}. ${section.heading}`,
              }))}
            />
            <a className={styles.sourceJump} href="#article-sources">
              Sources & research notes
            </a>
          </details>
        </aside>
        <div className={styles.body}>
          <div className={styles.introduction}>
            <Paragraphs text={article.introduction ?? ''} />
          </div>
          {article.takeaways?.length ? (
            <aside className={styles.takeaways}>
              <h2>What to take away</h2>
              <ul>
                {article.takeaways.map((item) => (
                  <li key={item}>
                    <Inline text={item} />
                  </li>
                ))}
              </ul>
            </aside>
          ) : null}
          {article.sections.map((section, index) => (
            <section
              id={`story-section-${index + 1}`}
              key={section.heading}
              className={styles.section}
            >
              <h2>
                <span>{String(index + 1).padStart(2, '0')}</span>
                {section.heading}
              </h2>
              <Paragraphs text={section.body} />
              {section.bullets?.length ? (
                <ul className={styles.checklist}>
                  {section.bullets.map((item) => (
                    <li key={item}>
                      <Inline text={item} />
                    </li>
                  ))}
                </ul>
              ) : null}
              {section.table ? (
                <figure className={styles.tableFigure}>
                  <p className={styles.tableTitle} aria-hidden="true">
                    {section.table.caption}
                  </p>
                  <p className={styles.tableHint}>Swipe or use arrow keys to view all columns.</p>
                  <div
                    className={styles.tableScroll}
                    role="region"
                    aria-label={section.table.caption}
                    tabIndex={0}
                  >
                    <table>
                      <caption>{section.table.caption}</caption>
                      <thead>
                        <tr>
                          {section.table.columns.map((col) => (
                            <th scope="col" key={col}>
                              {col}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {section.table.rows.map((row, rowIndex) => (
                          <tr key={rowIndex}>
                            {row.map((cell, cellIndex) =>
                              cellIndex === 0 ? (
                                <th scope="row" key={cellIndex}>
                                  <Inline text={cell} />
                                </th>
                              ) : (
                                <td key={cellIndex}>
                                  <Inline text={cell} />
                                </td>
                              ),
                            )}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  {section.table.note ? (
                    <figcaption>
                      <Inline text={section.table.note} />
                    </figcaption>
                  ) : null}
                </figure>
              ) : null}
              {section.chart ? (
                <ResearchChart chart={section.chart}>
                  <Inline text={section.chart.note} />
                </ResearchChart>
              ) : null}
            </section>
          ))}
          <section id="article-sources" className={styles.sources}>
            <h2>Sources & research notes</h2>
            <p>
              Checked {formattedDate}. Dates and measurement periods are stated beside the
              references. Examples labelled illustrative are our calculations, not observed market
              results.
            </p>
            <ol>
              {article.references?.map((ref) => (
                <li key={ref.url}>
                  <a href={ref.url} target="_blank" rel="noopener noreferrer">
                    {ref.label}
                    <ArrowUpRight size={16} />
                  </a>
                  <span>{ref.period}</span>
                </li>
              ))}
            </ol>
            <p className={styles.note}>
              General property information, not personalised financial or legal advice. Confirm
              current costs, eligibility and contract terms for the specific property before
              committing.
            </p>
          </section>
          <aside className={styles.cta}>
            <p className={styles.eyebrow}>Your next step</p>
            <h2>Turn your questions into a considered shortlist.</h2>
            <p>
              Tell Aliyas what you need from your next home. We can help organise the questions to
              put to the developer and the details to verify.
            </p>
            <Link href="/contact">
              Speak with Aliyas <ArrowUpRight size={18} />
            </Link>
          </aside>
        </div>
      </div>
      {related.length ? (
        <section className={styles.related}>
          <h2>Continue reading</h2>
          <div>
            {related.map((item) => (
              <Link key={item.slug} href={`/journal/${item.slug}`}>
                <span>{item.category}</span>
                <h3>{item.title}</h3>
                <span>
                  Read the article <ArrowUpRight size={18} />
                </span>
              </Link>
            ))}
          </div>
        </section>
      ) : null}
    </article>
  );
}
