import Image from 'next/image';
import { developerBrandAssets } from '@/lib/developer-brand-assets';

export function DeveloperMark({
  slug,
  name,
  variant,
  sizes,
}: {
  slug: string;
  name: string;
  variant?: 'directory';
  sizes?: string;
}) {
  const asset = developerBrandAssets[slug];
  if (!asset) return <span>{name}</span>;
  return (
    <span
      className={`developer-mark developer-mark-${variant === 'directory' && asset.directorySrc ? 'light' : asset.plate} developer-mark-${asset.fit}`}
    >
      <Image
        src={variant === 'directory' ? (asset.directorySrc ?? asset.src) : asset.src}
        alt={`${name} logo`}
        width={200}
        height={90}
        sizes={sizes}
      />
    </span>
  );
}
