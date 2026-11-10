import type { Metadata } from 'next';
import { ProjectComparison } from '@/components/project-comparison';
import { getPublicListings } from '@/lib/public-listings';

export const metadata: Metadata = {
  title: 'Compare off-plan projects',
  description:
    'Compare up to three UAE project profiles side by side by location, residence type, price, handover and payment plan.',
  alternates: { canonical: '/projects/compare' },
  robots: { index: false, follow: true },
};

export default function CompareProjectsPage() {
  return <ProjectComparison projects={getPublicListings()} />;
}
