import { notFound, permanentRedirect } from 'next/navigation';
import { legacyProjectRoutes } from '@/lib/legacy-projects';

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return Object.keys(legacyProjectRoutes).map((slug) => ({ slug }));
}

export default async function ProjectPage({ params }: Props) {
  const { slug } = await params;
  if (!Object.hasOwn(legacyProjectRoutes, slug)) notFound();
  permanentRedirect(legacyProjectRoutes[slug as keyof typeof legacyProjectRoutes]);
}
