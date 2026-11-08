import type { Metadata } from 'next';
import { ProjectBrowser } from '@/components/project-browser';
import { catalogueNotice } from '@/lib/content';
import { getAllDeveloperProjects } from '@/lib/developer-projects';
import { developers } from '@/lib/developers';
import { getProjectMedia } from '@/lib/project-media';
import { findCuratedCollection } from '@/lib/curated-collections';
import '@/components/catalogue.css';
export const metadata: Metadata = {
  title: 'Off-plan projects in the UAE',
  description:
    'Discover the Aliyas collection of off-plan project profiles across Dubai, Abu Dhabi and Ras Al Khaimah. Filter by location, home type and budget.',
  alternates: { canonical: '/projects' },
};
export default async function ProjectsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const query = await searchParams;
  const string = (key: string) => (typeof query[key] === 'string' ? query[key] : '');
  return (
    <div className="catalogue-page">
      <div className="catalogue-heading" data-reveal>
        <p className="catalogue-eyebrow">THE OFF-PLAN COLLECTION</p>
        <h1>
          A new chapter.
          <br />
          <em>A place of your own.</em>
        </h1>
        <p>
          Thoughtfully selected places to begin your next story.
          <br />
          Explore the possibilities across the Emirates.
        </p>
      </div>
      <ProjectBrowser
        approved={getAllDeveloperProjects()
          .filter(
            (project) =>
              (!project.placeholder ||
                (project.research?.status === 'reviewed' && getProjectMedia(project))) &&
              developers.some((developer) => developer.slug === project.developerSlug),
          )
          .map((project) => ({
            ...project,
            developerName: developers.find((developer) => developer.slug === project.developerSlug)!
              .name,
          }))}
        initial={{
          collection: string('collection'),
          emirate: string('emirate'),
          area: string('area'),
          type: string('type'),
          developer: string('developer'),
          q: string('q'),
          budget: string('budget'),
          page: string('page'),
        }}
      />
      <p className="catalogue-disclaimer">
        {findCuratedCollection(string('collection'))
          ? catalogueNotice
          : 'Project details reflect dated sources. Developer renders and available project photographs are identified on each project page. Confirm current availability, commercial terms and the contracted specification.'}
      </p>
    </div>
  );
}
