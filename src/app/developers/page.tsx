import type { Metadata } from 'next';
import { DeveloperDirectory } from '@/components/developer-directory';
import { developers } from '@/lib/content';
import { getDeveloperProjects } from '@/lib/developer-projects';
import '@/components/catalogue.css';
export const metadata: Metadata = {
  title: 'UAE property developers',
  description:
    'Explore the UAE developers Aliyas is registered with, including Emaar, DAMAC, Danube, Binghatti, Sobha and more. Find developer profiles and project previews.',
  alternates: { canonical: '/developers' },
};
export default function DevelopersPage() {
  return (
    <div className="catalogue-page">
      <div className="catalogue-heading" data-reveal>
        <p className="catalogue-eyebrow">THE PEOPLE BEHIND THE PLACES</p>
        <h1>
          Distinctive visions.
          <br />
          <em>Extraordinary addresses.</em>
        </h1>
        <p>
          Get to know the developers shaping the Emirates,
          <br />
          and discover the places they bring to life.
        </p>
      </div>
      <p className="developer-network-note">
        Registered with {developers.filter((developer) => developer.registeredWithAliyas).length}{' '}
        developers across our network.
      </p>
      <DeveloperDirectory
        developers={developers.map((developer) => ({
          ...developer,
          projectCount: getDeveloperProjects(developer.slug).length,
        }))}
      />
      <p className="catalogue-disclaimer">
        Project collections inside each developer profile are design previews. Project details,
        prices and availability will be added when confirmed. Contact Aliyas for current
        information.
      </p>
    </div>
  );
}
