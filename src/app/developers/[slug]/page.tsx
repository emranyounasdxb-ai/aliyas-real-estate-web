import { allDeveloperProfiles as developers } from '@/lib/developers';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { connection } from 'next/server';
import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import { catalogueNotice, breadcrumbSchema, serializeSchema } from '@/lib/content';
import { DeveloperHero } from '@/components/developer-hero';
import { getDeveloperProjectPreviews } from '@/lib/developer-project-previews';
import { DeveloperListings } from '@/components/developer-listings';
import { getDeveloperProjects } from '@/lib/developer-projects';
import { projectCardListing } from '@/lib/public-listings';
import { selectDeveloperProjectPage } from '@/lib/developer-project-pagination';
import '@/components/catalogue.css';
import '@/components/developer-profile.css';
type Props = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ page?: string | string[] }>;
};
export function generateStaticParams() {
  return developers.map(({ slug }) => ({ slug }));
}
export async function generateMetadata({ params, searchParams }: Props): Promise<Metadata> {
  const { slug } = await params;
  const item = developers.find((d) => d.slug === slug);
  const rawPage = (await searchParams).page;
  const query = new URLSearchParams({
    page: (Array.isArray(rawPage) ? rawPage[0] : rawPage) ?? '',
  });
  const { page } = selectDeveloperProjectPage(getDeveloperProjects(slug), query);
  return item
    ? {
        title: `${item.name} — Developer profile${page > 1 ? ` — Page ${page}` : ''}`,
        description: item.description,
        alternates: { canonical: `/developers/${slug}${page > 1 ? `?page=${page}` : ''}` },
      }
    : { title: 'Developer not found' };
}
export default async function DeveloperPage({ params }: Props) {
  const { slug } = await params;
  const developer = developers.find((d) => d.slug === slug);
  if (!developer) notFound();
  // Render the requested listing page on a direct visit, including before hydration.
  await connection();
  const previews = getDeveloperProjectPreviews(developer);
  const listings = getDeveloperProjects(slug);
  return (
    <div className="catalogue-page catalogue-detail developer-profile-page">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: serializeSchema([breadcrumbSchema('developers', developer.slug, developer.name)]),
        }}
      />
      {previews.length ? (
        <DeveloperHero developer={developer} projects={previews} />
      ) : (
        <header className="developer-hero">
          <Link className="developer-hero-back" href="/developers">
            All developers
          </Link>
          <div className="developer-hero-intro">
            <p className="developer-hero-eyebrow">THE DEVELOPER</p>
            <h1>{developer.name}</h1>
            <p className="developer-hero-tagline">{developer.tagline}</p>
          </div>
        </header>
      )}
      <section className="developer-bio" aria-labelledby="developer-bio-title">
        <div>
          <p className="catalogue-eyebrow">THE DEVELOPER</p>
          <h2 id="developer-bio-title">About {developer.name}.</h2>
          {developer.registeredWithAliyas && (
            <p className="developer-registration">Registered with Aliyas</p>
          )}
        </div>
        <div className="developer-bio-copy">
          <p>{developer.description}</p>
          <a href={developer.website} target="_blank" rel="noopener noreferrer">
            Visit developer website <ArrowUpRight size={15} aria-hidden="true" />
          </a>
        </div>
      </section>
      <section
        className="developer-listings"
        id="developer-projects"
        aria-labelledby="developer-projects-title"
      >
        <div className="developer-listings-heading">
          <div>
            <p className="catalogue-eyebrow">THE PROJECT COLLECTION</p>
            <h2 id="developer-projects-title" tabIndex={-1}>
              Projects by {developer.name}.
            </h2>
          </div>
          <span className="developer-listings-count">{listings.length} projects</span>
        </div>
        <p className="developer-listings-notice">
          {listings.length
            ? 'Project names are checked against developer sources. Image sources and available details appear on each project page. Confirm current availability.'
            : 'Verified project names will appear here as they are confirmed.'}
        </p>
        <DeveloperListings
          projects={listings.map((project) => projectCardListing(project, developer.name))}
          developerName={developer.name}
        />
      </section>
      <p className="catalogue-disclaimer">{catalogueNotice}</p>
    </div>
  );
}
