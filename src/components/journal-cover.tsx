import Image from 'next/image';
import type { Article } from '@/lib/content';
import styles from './journal-cover.module.css';

export function JournalCover({
  article,
  sizes,
  priority = false,
}: {
  article: Article;
  sizes: string;
  priority?: boolean;
}) {
  // Owner-supplied covers have pre-optimised responsive WebP files. Native
  // srcSet serves those assets without a second image-optimisation pass.
  if (article.image && article.imageSrcSet)
    return (
      <img
        className={styles.image}
        src={article.image}
        srcSet={article.imageSrcSet}
        sizes={sizes}
        width={article.imageWidth}
        height={article.imageHeight}
        alt={article.imageAlt ?? article.title}
        loading={priority ? 'eager' : 'lazy'}
        fetchPriority={priority ? 'high' : 'auto'}
        decoding="async"
      />
    );
  if (article.image)
    return (
      <Image
        className={styles.image}
        src={article.image}
        alt={article.imageAlt ?? article.title}
        fill
        sizes={sizes}
        loading={priority ? 'eager' : 'lazy'}
        fetchPriority={priority ? 'high' : 'auto'}
      />
    );
  return (
    <div
      className={styles.placeholder}
      role="img"
      aria-label={`${article.title} — The Aliyas Journal`}
    >
      <div className={styles.top}>
        <span>The Aliyas Journal</span>
        <span>{String(article.sequence ?? '').padStart(2, '0')}</span>
      </div>
      <div className={styles.frame} aria-hidden="true" />
      <Image
        className={styles.logo}
        src="/brand/aliyas-gold-logo-hd.webp"
        alt=""
        width={160}
        height={61}
      />
      <span className={styles.caption}>{article.category}</span>
    </div>
  );
}
