import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowDown, ArrowUpRight, BookOpen, ChevronDown } from '@/components/brand-icons';
import { articles, allArticles, serializeSchema } from '@/lib/content';
import { JournalCover } from '@/components/journal-cover';
import siteImagery from '@/lib/site-imagery.json';
import {
  journalHref,
  journalPageNumbers,
  selectJournalArticles,
  type JournalQuery,
} from '@/lib/journal-pagination';
import { JournalMotion } from './journal-motion';
import { JournalSearch } from './journal-search';
import styles from './journal.module.css';

type Props = { searchParams: Promise<JournalQuery> };
export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const { page, q, topic } = selectJournalArticles(articles, await searchParams);
  const title = `The Aliyas Journal — Places, spaces and perspectives${page > 1 ? ` · Page ${page}` : ''}`;
  return {
    title,
    description:
      'Explore considered homes, UAE neighbourhoods and the details that make a place your own. Read stories and practical guides from Aliyas.',
    alternates: { canonical: journalHref({ page }, false) },
    ...(q || topic ? { robots: { index: false, follow: true } } : {}),
    openGraph: {
      title,
      type: 'website',
      images: [{ url: '/brand/aliyas-gold-logo-hd.webp', alt: 'The Aliyas Journal' }],
    },
  };
}

const readingPaths = [
  {
    question: 'What makes a home feel like me?',
    slug: 'a-home-that-feels-like-you',
    section: 1,
    note: 'Start with the way you live.',
    image: siteImagery.gardenBath,
  },
  {
    question: 'Where would I feel at home?',
    slug: 'finding-your-kind-of-neighbourhood',
    section: 1,
    note: 'Get to know a neighbourhood.',
    image: siteImagery.marina,
  },
  {
    question: 'What can a floor plan tell me?',
    slug: 'reading-a-floor-plan',
    section: 2,
    note: 'Look beyond the headline area.',
    image: siteImagery.studio,
  },
];
const storyDateFormatter = new Intl.DateTimeFormat('en-GB', {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
  timeZone: 'UTC',
});

export default async function JournalPage({ searchParams }: Props) {
  const view = selectJournalArticles(articles, await searchParams);
  const featured = view.items[0];
  const isCover = view.page === 1 && !view.q && !view.topic;
  const range = view.total
    ? `${view.start + 1}–${view.start + view.items.length} of ${view.total} ${view.total === 1 ? 'story' : 'stories'}`
    : 'No stories found';
  const pageLink = (page: number) => journalHref({ page, q: view.q, topic: view.topic });
  return (
    <JournalMotion className={styles.page} viewKey={`${view.page}:${view.topic}:${view.q}`}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: serializeSchema([
            {
              '@context': 'https://schema.org',
              '@type': 'CollectionPage',
              name: 'The Aliyas Journal',
              url: `https://aliyasrealestate.ae${journalHref({ page: view.page }, false)}`,
              mainEntity: {
                '@type': 'ItemList',
                itemListElement: view.items.map((story, index) => ({
                  '@type': 'ListItem',
                  position: view.start + index + 1,
                  url: `https://aliyasrealestate.ae/journal/${story.slug}`,
                  name: story.title,
                })),
              },
            },
          ]),
        }}
      />
      <header className={`${styles.masthead} ${!isCover ? styles.compactMasthead : ''}`}>
        <div>
          <p className={styles.eyebrow}>The Aliyas Journal</p>
          <h1>
            Places. Spaces.
            <br />
            <span>A fresh perspective.</span>
          </h1>
        </div>
        <div className={styles.intro} data-journal-enter>
          <p>
            Thoughtful homes. Neighbourhood stories. A closer look at the details that shape the way
            we live.
          </p>
          <Link href="#journal-stories" className={styles.textLink}>
            Explore the journal <ArrowDown size={18} />
          </Link>
        </div>
      </header>

      {isCover && featured && (
        <section className={styles.featured} aria-labelledby="featured-story-title">
          <Link
            href={`/journal/${featured.slug}`}
            className={styles.featuredImage}
            aria-label={`${featured.image ? 'Inside the story — ' : ''}Read ${featured.title}`}
          >
            <div
              className={styles.coverMotion}
              data-journal-cover={featured.image ? '' : undefined}
            >
              <JournalCover
                article={featured}
                sizes="(max-width:399px) calc((100vw - 32px) * 1.44), (max-width:767px) calc((100vw - 48px) * 1.44), (max-width:1023px) 860px, (max-width:1535px) max(940px, 65vw), 940px"
                priority
              />
            </div>
            {featured.image && <span className={styles.imageTag}>Inside the story</span>}
          </Link>
          <div className={styles.featuredCopy}>
            <div className={styles.featuredTop}>
              <span className={styles.eyebrow}>Editor’s pick</span>
              <BookOpen size={24} />
            </div>
            <div data-journal-enter>
              <p className={styles.meta}>
                {featured.category}
                <span />
                {featured.readTime}
              </p>
              <h2 id="featured-story-title">
                <Link href={`/journal/${featured.slug}`}>{featured.title}</Link>
              </h2>
              <p className={styles.featuredExcerpt}>{featured.excerpt}</p>
              <Link className={styles.primaryLink} href={`/journal/${featured.slug}`}>
                Read the story <ArrowUpRight size={20} />
              </Link>
            </div>
            <div className={styles.byline}>
              <span className={styles.authorLogo}>
                <Image src="/brand/aliyas-gold-logo-hd.webp" alt="" width={64} height={25} />
              </span>
              <span>
                From the Aliyas editorial desk<small>Ideas for your next chapter.</small>
              </span>
            </div>
          </div>
        </section>
      )}

      <section
        className={styles.library}
        id="journal-stories"
        aria-labelledby="journal-stories-title"
      >
        <div className={styles.libraryHeading}>
          <div>
            <p className={styles.eyebrow}>The reading room</p>
            <h2 id="journal-stories-title">Find your next read.</h2>
          </div>
          <JournalSearch key={`${view.topic}:${view.q}`} query={view.q} topic={view.topic} />
        </div>
        <p id="journal-topic-hint" className={styles.topicHint}>
          Scroll to explore topics
        </p>
        <nav
          className={styles.topics}
          aria-label="Journal topics"
          aria-describedby="journal-topic-hint"
          data-journal-topics
        >
          <Link href={journalHref({ q: view.q })} aria-current={!view.topic ? 'true' : undefined}>
            All stories <span>{articles.length}</span>
          </Link>
          {view.topics.map((topic) => (
            <Link
              key={topic.id}
              href={journalHref({ topic: topic.id, q: view.q })}
              aria-current={view.topic === topic.id ? 'true' : undefined}
            >
              {topic.label}
              <span>{topic.count}</span>
            </Link>
          ))}
        </nav>
        <div className={styles.resultBar}>
          <p role="status">
            {range}
            {view.q && <> for “{view.q}”</>}
          </p>
          {(view.topic || view.q) && (
            <Link href={journalHref()}>
              Clear filters <ArrowUpRight size={16} />
            </Link>
          )}
        </div>
        {view.items.length ? (
          <div className={styles.storyGrid}>
            {view.items.map((article) => (
              <article className={styles.story} key={article.slug} data-journal-reveal>
                <Link
                  href={`/journal/${article.slug}`}
                  className={`${styles.storyLink} ${!article.image ? styles.storyLinkTextOnly : ''}`}
                >
                  {article.image && (
                    <div className={styles.storyImage}>
                      <JournalCover
                        article={article}
                        // The 16:9 source fills a 4:3 frame. Include the cropped
                        // width so the browser selects enough pixels for crisp covers.
                        sizes="(max-width:399px) calc((100vw - 32px) * 4 / 3), (max-width:639px) calc((100vw - 48px) * 4 / 3), (max-width:767px) calc((100vw - 72px) * 2 / 3), (max-width:1023px) calc((100vw - 88px) * 2 / 3), (max-width:1199px) calc((100vw - 112px) * 4 / 9), (max-width:1535px) calc((100vw - 176px) * 4 / 9), 605px"
                      />
                      <span className={styles.storyImageArrow}>
                        <ArrowUpRight size={22} />
                      </span>
                    </div>
                  )}
                  <div className={styles.storyBody}>
                    <p className={styles.meta}>
                      {article.category}
                      <span />
                      {article.readTime}
                      {article.date && article.date !== article.researchedAt && (
                        <>
                          <span />
                          <time dateTime={article.date}>
                            {storyDateFormatter.format(new Date(article.date))}
                          </time>
                        </>
                      )}
                    </p>
                    <h3>{article.title}</h3>
                    <p className={styles.excerpt}>{article.excerpt}</p>
                    <span className={styles.readLink}>
                      Read the story <ArrowUpRight size={18} />
                    </span>
                  </div>
                </Link>
              </article>
            ))}
          </div>
        ) : (
          <div className={styles.empty}>
            <BookOpen size={40} />
            <h3>A different search, a new perspective.</h3>
            <p>Try a shorter phrase or explore all the stories in our journal.</p>
            <Link className={styles.primaryLink} href={journalHref()}>
              Explore all stories <ArrowUpRight size={20} />
            </Link>
          </div>
        )}
        {view.total > 0 && (
          <nav className={styles.pagination} aria-label="Article pagination">
            <span className={styles.pageSummary}>
              Page {view.page} of {view.pageCount}
            </span>
            <div className={styles.pageControls}>
              {view.page > 1 ? (
                <Link className={styles.previous} href={pageLink(view.page - 1)} rel="prev">
                  <ChevronDown size={18} />
                  Previous
                </Link>
              ) : (
                <span className={styles.previous} aria-disabled="true">
                  <ChevronDown size={18} />
                  Previous
                </span>
              )}
              <div className={styles.pageNumbers}>
                {journalPageNumbers(view.page, view.pageCount).map((page) =>
                  typeof page === 'string' ? (
                    <span className={styles.ellipsis} key={page}>
                      …
                    </span>
                  ) : (
                    <Link
                      key={page}
                      href={pageLink(page)}
                      aria-label={`Page ${page}`}
                      aria-current={page === view.page ? 'page' : undefined}
                    >
                      {page}
                    </Link>
                  ),
                )}
              </div>
              {view.page < view.pageCount ? (
                <Link className={styles.next} href={pageLink(view.page + 1)} rel="next">
                  Next
                  <ChevronDown size={18} />
                </Link>
              ) : (
                <span className={styles.next} aria-disabled="true">
                  Next
                  <ChevronDown size={18} />
                </span>
              )}
            </div>
          </nav>
        )}
      </section>

      {isCover && (
        <section
          className={styles.readingGuide}
          aria-labelledby="reading-guide-title"
          data-journal-guide
        >
          <div className={styles.guideIntro}>
            <p className={styles.eyebrow}>Begin with a question</p>
            <h2 id="reading-guide-title">
              {['Read the details.', 'See the possibilities.'].map((line) => (
                <span className={styles.taglineLine} key={line}>
                  {line.split(' ').map((word, index) => (
                    <span data-journal-word key={`${word}-${index}`}>
                      {word}{' '}
                    </span>
                  ))}
                </span>
              ))}
            </h2>
            <p>A few thoughtful questions can change the way you see your next home.</p>
            <figure className={styles.guideFigure}>
              <div className={styles.guideImage}>
                <Image
                  src={siteImagery.dining.src}
                  alt={siteImagery.dining.alt}
                  fill
                  quality={85}
                  sizes="(max-width:767px) calc(100vw - 96px), (max-width:1023px) calc(100vw - 144px), 36vw"
                />
              </div>
            </figure>
          </div>
          <div className={styles.readingPaths}>
            {readingPaths
              .filter((path) => allArticles.some((article) => article.slug === path.slug))
              .map((path, index) => (
                <Link key={path.slug} href={`/journal/${path.slug}#story-section-${path.section}`}>
                  <span className={styles.pathThumbnail}>
                    <Image
                      src={path.image.src}
                      alt=""
                      fill
                      quality={85}
                      sizes="(max-width:767px) 48px, (max-width:1023px) 240px, 64px"
                    />
                  </span>
                  <span>
                    <span className={styles.pathNumber}>0{index + 1}</span>
                    <strong>{path.question}</strong>
                    <small>{path.note}</small>
                  </span>
                  <ArrowUpRight size={24} />
                </Link>
              ))}
          </div>
        </section>
      )}
    </JournalMotion>
  );
}
