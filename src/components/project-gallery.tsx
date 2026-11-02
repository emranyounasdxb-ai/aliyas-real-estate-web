'use client';
import Image from 'next/image';
import { useEffect, useId, useRef, useState } from 'react';
import { ArrowLeft, ArrowRight, Expand, X } from 'lucide-react';

export type GalleryImage = { src: string; label: string };

export function ProjectGallery({
  image,
  projectName,
  illustrative = true,
  gallery,
}: {
  image: string;
  projectName: string;
  illustrative?: boolean;
  gallery?: readonly GalleryImage[];
}) {
  const images = gallery?.length ? gallery : [{ src: image, label: 'Exterior' }];
  const [selected, setSelected] = useState(0);
  const [open, setOpen] = useState(false);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const id = useId();
  const current = images[selected] || images[0];
  const count = (n: number) => String(n).padStart(2, '0');
  const alt = illustrative
    ? `${current.label}: illustrative architecture, not a photograph of ${projectName}`
    : `${projectName} — ${current.label}`;
  const move = (delta: number) =>
    setSelected((value) => (value + delta + images.length) % images.length);
  function show(index: number, button: HTMLButtonElement) {
    triggerRef.current = button;
    setSelected(index);
    setOpen(true);
  }
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog || !open) return;
    const root = document.documentElement;
    const body = document.body;
    const previous = {
      root: root.style.overflow,
      body: body.style.overflow,
      gutter: root.style.scrollbarGutter,
      prevent: root.getAttribute('data-lenis-prevent'),
    };
    root.style.scrollbarGutter = 'stable';
    root.style.overflow = 'hidden';
    body.style.overflow = 'hidden';
    root.setAttribute('data-lenis-prevent', '');
    window.dispatchEvent(new CustomEvent('aliyas:enquiry-visibility', { detail: { open: true } }));
    dialog.showModal();
    return () => {
      if (dialog.open) dialog.close();
      root.style.overflow = previous.root;
      body.style.overflow = previous.body;
      root.style.scrollbarGutter = previous.gutter;
      if (previous.prevent === null) root.removeAttribute('data-lenis-prevent');
      else root.setAttribute('data-lenis-prevent', previous.prevent);
      window.dispatchEvent(
        new CustomEvent('aliyas:enquiry-visibility', { detail: { open: false } }),
      );
      triggerRef.current?.focus({ preventScroll: true });
    };
  }, [open]);

  return (
    <>
      <figure className={`pd-gallery ${images.length > 1 ? 'pd-gallery-multiple' : ''}`}>
        <div className="pd-gallery-mosaic">
          <button
            type="button"
            className="pd-gallery-open"
            onClick={(event) => show(selected, event.currentTarget)}
          >
            <Image
              src={current.src}
              alt=""
              fill
              sizes="(max-width: 700px) 94vw, 62vw"
              loading="eager"
              fetchPriority="high"
            />
            <span className="pd-gallery-expand">
              <Expand size={17} />
              <span className="future-sr-only">{projectName} image gallery: </span>View image{' '}
              <span>
                {count(selected + 1)} / {count(images.length)}
              </span>
            </span>
          </button>
          {images.length > 1 && (
            <div className="pd-gallery-support">
              {images
                .slice(1)
                .slice(0, 2)
                .map((item) => {
                  const index = images.indexOf(item);
                  return (
                    <button
                      className="pd-gallery-tile"
                      type="button"
                      key={`${item.src}-${index}`}
                      aria-label={`Open ${item.label} image of ${projectName}`}
                      onClick={(event) => show(index, event.currentTarget)}
                    >
                      <Image src={item.src} alt="" fill sizes="30vw" />
                      <span>{item.label}</span>
                    </button>
                  );
                })}
            </div>
          )}
        </div>
        {images.length > 1 && (
          <div
            className="pd-gallery-thumbnails"
            role="group"
            aria-label={`Choose ${projectName} gallery image`}
          >
            {images.map((item, index) => (
              <button
                key={`${item.src}-${index}`}
                type="button"
                aria-label={`Show ${count(index + 1)} — ${item.label}`}
                aria-pressed={selected === index}
                onClick={() => setSelected(index)}
              >
                <Image src={item.src} alt="" width={112} height={72} />
                <span>
                  {count(index + 1)} — {item.label}
                </span>
              </button>
            ))}
          </div>
        )}
        <figcaption>
          {illustrative
            ? 'Illustrative concept gallery · Official project imagery to follow'
            : `${projectName} · Project photography`}
        </figcaption>
      </figure>
      <dialog
        ref={dialogRef}
        className="pd-lightbox"
        aria-labelledby={`${id}-title`}
        aria-describedby={`${id}-caption`}
        data-lenis-prevent
        onCancel={() => setOpen(false)}
        onClose={() => setOpen(false)}
        onKeyDown={(event) => {
          if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
            event.preventDefault();
            move(event.key === 'ArrowLeft' ? -1 : 1);
          }
        }}
        onClick={(event) => {
          if (event.target !== event.currentTarget) return;
          const box = event.currentTarget.getBoundingClientRect();
          if (
            event.clientX < box.left ||
            event.clientX > box.right ||
            event.clientY < box.top ||
            event.clientY > box.bottom
          )
            setOpen(false);
        }}
      >
        <div className="pd-lightbox-heading">
          <h2 id={`${id}-title`}>{projectName} image gallery</h2>
          <button
            type="button"
            onClick={() => setOpen(false)}
            aria-label="Close image gallery"
            autoFocus
          >
            <X size={23} />
          </button>
        </div>
        {open && (
          <div className="pd-lightbox-image">
            <Image src={current.src} alt={alt} fill sizes="94vw" />
          </div>
        )}
        <div className="pd-lightbox-controls">
          <button
            type="button"
            onClick={() => move(-1)}
            aria-label="Previous gallery image"
            disabled={images.length < 2}
          >
            <ArrowLeft size={20} />
          </button>
          <p id={`${id}-caption`} aria-live="polite">
            {count(selected + 1)} / {count(images.length)}{' '}
            <span>
              {current.label}
              {illustrative ? ` · This image does not depict ${projectName}.` : ''}
            </span>
          </p>
          <button
            type="button"
            onClick={() => move(1)}
            aria-label="Next gallery image"
            disabled={images.length < 2}
          >
            <ArrowRight size={20} />
          </button>
        </div>
      </dialog>
    </>
  );
}
