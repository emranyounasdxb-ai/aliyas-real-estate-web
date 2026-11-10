'use client';

import Image from 'next/image';
import { useEffect, useRef, type CSSProperties } from 'react';

type Props = {
  src: string;
  alt: string;
  responsiveWidth?: number;
  fill?: boolean;
  width?: number;
  height?: number;
  sizes?: string;
  quality?: number;
  loading?: 'eager' | 'lazy';
  fetchPriority?: 'high' | 'low' | 'auto';
  draggable?: boolean;
  className?: string;
  style?: CSSProperties;
};

/** Serve verified project-specific variants, with the original as a safe fallback. */
export function ResponsiveProjectImage({ responsiveWidth, ...props }: Props) {
  const match = /^\/images\/projects\/.+-([a-f0-9]{12})\.(?:jpg|jpeg|png|webp|avif)$/i.exec(
    props.src,
  );
  if (!match || !responsiveWidth) return <Image {...props} placeholder="empty" />;

  const hash = match[1].toLowerCase();
  const widths = [...new Set([Math.min(640, responsiveWidth), Math.min(1600, responsiveWidth)])];
  const srcSet = widths
    .map((width) => `/images/project-responsive/v1/${hash}-${width}.webp ${width}w`)
    .join(', ');
  return <ResponsiveStaticImage {...props} srcSet={srcSet} />;
}

/** Serve prepared copies while retaining the original as a safe fallback. */
export function ResponsiveStaticImage({ srcSet, ...props }: Props & { srcSet: string }) {
  const imageRef = useRef<HTMLImageElement>(null);
  useEffect(() => {
    const image = imageRef.current;
    // A fast 404 can happen before React attaches onError during hydration.
    if (image?.complete && !image.naturalWidth) fallbackToOriginal(image, props.src);
  }, [props.src]);

  const style: CSSProperties | undefined = props.fill
    ? { position: 'absolute', inset: 0, width: '100%', height: '100%', ...props.style }
    : props.style;

  return (
    <img
      key={props.src}
      ref={imageRef}
      src={props.src}
      srcSet={srcSet}
      sizes={props.sizes}
      alt={props.alt}
      width={props.fill ? undefined : props.width}
      height={props.fill ? undefined : props.height}
      loading={props.loading ?? 'lazy'}
      fetchPriority={props.fetchPriority}
      decoding="async"
      draggable={props.draggable}
      className={props.className}
      style={style}
      onError={(event) => fallbackToOriginal(event.currentTarget, props.src)}
    />
  );
}

function fallbackToOriginal(image: HTMLImageElement, source: string) {
  if (image.dataset.originalFallback || !image.hasAttribute('srcset')) return;
  image.dataset.originalFallback = 'true';
  image.removeAttribute('srcset');
  image.src = source;
}
