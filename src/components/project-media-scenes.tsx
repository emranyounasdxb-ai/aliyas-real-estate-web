import type { GalleryImage } from './project-gallery';
import { projectImageLabel } from '@/lib/project-media-copy';
import { ResponsiveProjectImage } from './responsive-project-image';

/** Interior views from the project's image collection. */
export function ProjectMediaScenes({
  images,
  projectName,
}: {
  images: readonly GalleryImage[];
  projectName: string;
  sourceName: string;
}) {
  return (
    <div className="pm-scenes">
      <div className="pm-scenes-heading">
        <h3>A look inside {projectName}.</h3>
      </div>
      <div className="pm-scenes-grid">
        {images.map((image) => (
          <figure key={image.src}>
            <div>
              <ResponsiveProjectImage
                src={image.src}
                responsiveWidth={image.responsiveWidth}
                alt={image.alt || image.label}
                fill
                sizes={
                  images.length === 1
                    ? '(max-width: 1100px) 90vw, 800px'
                    : '(max-width: 700px) 90vw, (max-width: 1100px) 44vw, 400px'
                }
                quality={85}
              />
            </div>
            <figcaption>{projectImageLabel(image.label)}</figcaption>
          </figure>
        ))}
      </div>
    </div>
  );
}
