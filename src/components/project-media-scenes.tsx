import Image from 'next/image';
import type { GalleryImage } from './project-gallery';

/** A quiet editorial break in the researched details, scoped to the approval sample. */
export function ProjectMediaScenes({
  images,
  projectName,
  sourceName,
}: {
  images: readonly GalleryImage[];
  projectName: string;
  sourceName: string;
}) {
  return (
    <div className="pm-scenes">
      <div className="pm-scenes-heading">
        <h3>A look inside {projectName}.</h3>
        <span>{sourceName} interior renders</span>
      </div>
      <div className="pm-scenes-grid">
        {images.map((image) => (
          <figure key={image.src}>
            <div>
              <Image
                src={image.src}
                alt={image.alt || image.label}
                fill
                sizes={
                  images.length === 1
                    ? '(max-width: 1100px) 90vw, 800px'
                    : '(max-width: 700px) 90vw, (max-width: 1100px) 44vw, 400px'
                }
                quality={85}
                placeholder={image.blurDataURL ? 'blur' : 'empty'}
                blurDataURL={image.blurDataURL}
              />
            </div>
            <figcaption>{image.label}</figcaption>
          </figure>
        ))}
      </div>
    </div>
  );
}
