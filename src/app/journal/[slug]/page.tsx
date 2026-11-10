import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { ArrowLeft, ArrowUpRight } from 'lucide-react';
import {
  allArticles,
  legacyArticles,
  articleSchema,
  breadcrumbSchema,
  serializeSchema,
} from '@/lib/content';
import { allJournalArticles } from '@/lib/journal-articles';
import { ResearchedArticle } from '../researched-article';
import { SectionNavigation } from '@/components/section-navigation';
import '@/components/catalogue.css';
type Props = { params: Promise<{ slug: string }> };
export function generateStaticParams() {
  return allArticles.map(({ slug }) => ({ slug }));
}
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  if (allJournalArticles.some((article) => article.slug === slug && article.status !== 'published'))
    redirect('/journal');
  const article = allArticles.find((a) => a.slug === slug);
  return article
    ? {
        title: article.title,
        description: article.excerpt,
        alternates: { canonical: `/journal/${slug}` },
        openGraph: {
          type: 'article',
          title: article.title,
          description: article.excerpt,
          ...(article.date ? { publishedTime: article.date } : {}),
          ...(article.researchedAt ? { modifiedTime: article.researchedAt } : {}),
          images: [
            !article.image
              ? '/brand/aliyas-gold-logo-hd.webp'
              : article.image.endsWith('.svg')
                ? '/images/journal-2.jpg'
                : article.image,
          ],
        },
      }
    : { title: 'Story not found' };
}
export default async function ArticlePage({ params }: Props) {
  const { slug } = await params;
  if (allJournalArticles.some((article) => article.slug === slug && article.status !== 'published'))
    redirect('/journal');
  const article = allArticles.find((a) => a.slug === slug);
  if (!article) notFound();
  if (article.researchedAt) return <ResearchedArticle article={article} />;
  return (
    <article className="catalogue-page catalogue-article">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: serializeSchema([
            articleSchema(article),
            breadcrumbSchema('journal', article.slug, article.title),
          ]),
        }}
      />
      <Link className="catalogue-back" href="/journal">
        <ArrowLeft size={16} />
        Back to the journal
      </Link>
      <header className="catalogue-article-heading">
        <div className="catalogue-journal-meta">
          <span>{article.category}</span>
          <span>{article.readTime}</span>
        </div>
        <h1>{article.title}</h1>
        <p>{article.excerpt}</p>
        {article.date && (
          <time dateTime={article.date}>
            {new Intl.DateTimeFormat('en-GB', {
              day: 'numeric',
              month: 'long',
              year: 'numeric',
              timeZone: 'UTC',
            }).format(new Date(article.date))}{' '}
            · Aliyas editorial
          </time>
        )}
      </header>
      <div className="catalogue-hero-image">
        <Image
          src={article.image ?? '/brand/aliyas-gold-logo-hd.webp'}
          alt={article.imageAlt ?? article.title}
          fill
          sizes="100vw"
          loading="eager"
          fetchPriority="high"
        />
      </div>
      <div className="article-reading-layout">
        <details className="article-contents" open>
          <summary>In this story</summary>
          <SectionNavigation
            vertical
            label="Article contents"
            className="article-toc"
            items={article.sections.map((section, index) => ({
              id: `story-section-${index + 1}`,
              label: section.heading,
            }))}
          />
        </details>
        <div className="catalogue-article-body">
          {article.sections.map((section, index) => (
            <section key={section.heading} id={`story-section-${index + 1}`}>
              <h2>{section.heading}</h2>
              <p>{section.body}</p>
            </section>
          ))}
        </div>
      </div>
      <section className="article-related" aria-labelledby="related-stories-title">
        <p className="catalogue-eyebrow">KEEP READING</p>
        <h2 id="related-stories-title">Another perspective.</h2>
        <div className="catalogue-journal-grid">
          {legacyArticles
            .filter((item) => item.slug !== article.slug)
            .slice(0, 2)
            .map((item) => (
              <Link
                key={item.slug}
                href={`/journal/${item.slug}`}
                className="catalogue-journal-card"
              >
                <div className="catalogue-journal-image">
                  <Image
                    src={item.image ?? '/brand/aliyas-gold-logo-hd.webp'}
                    alt={item.imageAlt ?? item.title}
                    fill
                    sizes="(max-width:700px) 90vw, 45vw"
                  />
                </div>
                <div className="catalogue-journal-meta">
                  <span>{item.category}</span>
                  <span>{item.readTime}</span>
                </div>
                <h3>{item.title}</h3>
                <span className="catalogue-read">
                  Read the story
                  <ArrowUpRight size={16} aria-hidden="true" />
                </span>
              </Link>
            ))}
        </div>
      </section>
    </article>
  );
}
