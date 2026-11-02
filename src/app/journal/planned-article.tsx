import Link from 'next/link';
import { ArrowDown, ArrowUpRight, BookOpen } from '@/components/brand-icons';
import { JournalCover } from '@/components/journal-cover';
import { articles, type Article } from '@/lib/content';
import { journalHref } from '@/lib/journal-pagination';
import styles from './journal.module.css';

export function PlannedArticle({ article }: { article: Article }) {
  const related = articles
    .filter((item) => item.slug !== article.slug && item.category === article.category)
    .slice(0, 2);
  const back = journalHref({ page: Math.ceil((article.sequence ?? 1) / 9) });
  return (
    <article className={`${styles.page} ${styles.draftPage}`}>
      <Link className={styles.textLink} href={back}>
        <ArrowDown className={styles.backArrow} size={18} />
        Back to the journal
      </Link>
      <header className={styles.draftHeader}>
        <p className={styles.eyebrow}>
          {article.category}
          <span className={styles.draftBadge}>Coming soon</span>
        </p>
        <h1>{article.title}</h1>
        <p className={styles.draftDescription}>
          An upcoming story from the Aliyas Journal. The full article is being prepared.
        </p>
      </header>
      <div className={styles.draftCover}>
        <JournalCover
          article={article}
          sizes="(max-width:399px) calc((100vw - 32px) * 4 / 3), (max-width:767px) calc((100vw - 48px) * 4 / 3), (max-width:1199px) calc(100vw - 64px), (max-width:1535px) calc(100vw - 128px), 1408px"
          priority
        />
        {article.image && <span className={styles.photoCredit}>Illustrative image</span>}
      </div>
      <div className={styles.draftNotice}>
        <BookOpen size={24} />
        <div>
          <strong>Article preview</strong>
          <p>
            This page shows the planned structure. The complete story will appear here once it is
            ready.
          </p>
        </div>
      </div>
      <div className={styles.draftLayout}>
        <nav className={styles.draftContents} aria-label="Article contents">
          <p className={styles.eyebrow}>Planned in this story</p>
          {article.sections.map((section, index) => (
            <Link key={section.heading} href={`#story-section-${index + 1}`}>
              <span>0{index + 1}</span>
              {section.heading}
            </Link>
          ))}
        </nav>
        <div className={styles.draftSections}>
          {article.sections.map((section, index) => (
            <section id={`story-section-${index + 1}`} key={section.heading}>
              <span className={styles.eyebrow}>Section 0{index + 1}</span>
              <h2>{section.heading}</h2>
              <p>
                {section.body ||
                  'This section is being prepared. Check back for the complete article.'}
              </p>
            </section>
          ))}
        </div>
      </div>
      <section className={styles.draftRelated} aria-labelledby="related-stories-title">
        <p className={styles.eyebrow}>From the same collection</p>
        <h2 id="related-stories-title">More to explore.</h2>
        <div>
          {related.map((item) => (
            <Link key={item.slug} href={`/journal/${item.slug}`}>
              <span>Coming soon</span>
              <h3>{item.title}</h3>
              <span className={styles.readLink}>
                Preview article <ArrowUpRight size={18} />
              </span>
            </Link>
          ))}
        </div>
      </section>
    </article>
  );
}
