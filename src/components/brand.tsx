import Link from 'next/link';
import Image from 'next/image';

export function Brand({ light = false }: { light?: boolean }) {
  return (
    <Link
      href="/"
      aria-label="Aliyas Real Estate home"
      className={`brand ${light ? 'brand-light' : ''}`}
    >
      <Image
        className="brand-logo"
        src="/brand/aliyas-gold-logo-hd.webp"
        alt="Aliyas Real Estate"
        width={768}
        height={292}
        style={{ height: 'auto' }}
        sizes={light ? '(max-width: 650px) 220px, 245px' : '(max-width: 1099px) 116px, 156px'}
        loading={light ? 'lazy' : 'eager'}
        unoptimized
      />
    </Link>
  );
}
