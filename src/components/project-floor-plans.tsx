'use client';

import Image from 'next/image';
import { useEffect, useId, useRef, useState } from 'react';
import { ArrowUpRight, Expand, X } from 'lucide-react';
import type { ProjectFloorPlanData } from '@/lib/project-enhancement-types';
import { projectMediaNote, projectPlanArea, projectPlanLabel } from '@/lib/project-media-copy';
import './project-floor-plans.css';

export function ProjectFloorPlans({
  data,
  eyebrow = 'Inside the home',
}: {
  data: ProjectFloorPlanData;
  eyebrow?: string;
}) {
  const [selected, setSelected] = useState(0);
  const [open, setOpen] = useState(false);
  const [actualSize, setActualSize] = useState(false);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const id = useId();
  const plan = data.plans[selected];
  const source = plan.source || data.source;
  const documentHref = plan.imageSource ? plan.src : source.pdf;
  const planLabel = projectPlanLabel(plan.label);
  const area = projectPlanArea(plan.area);
  const note = projectMediaNote(data.note);
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog || !open) return;
    const root = document.documentElement;
    const body = document.body;
    const previous = {
      root: root.style.overflow,
      body: body.style.overflow,
      prevent: root.getAttribute('data-lenis-prevent'),
    };
    root.style.overflow = 'hidden';
    body.style.overflow = 'hidden';
    root.setAttribute('data-lenis-prevent', '');
    window.dispatchEvent(new CustomEvent('aliyas:enquiry-visibility', { detail: { open: true } }));
    dialog.showModal();
    return () => {
      if (dialog.open) dialog.close();
      root.style.overflow = previous.root;
      body.style.overflow = previous.body;
      if (previous.prevent === null) root.removeAttribute('data-lenis-prevent');
      else root.setAttribute('data-lenis-prevent', previous.prevent);
      window.dispatchEvent(
        new CustomEvent('aliyas:enquiry-visibility', { detail: { open: false } }),
      );
      triggerRef.current?.focus({ preventScroll: true });
    };
  }, [open]);
  return (
    <section
      className="pd-section pd-floor-plans"
      id="floor-plans"
      aria-labelledby={`${id}-heading`}
    >
      <p className="pd-eyebrow">{data.eyebrow ?? eyebrow}</p>
      <h2 id={`${id}-heading`}>Floor plans.</h2>
      <p className="pd-description">
        Explore the layouts and room dimensions. Open a floor plan for a closer look.
      </p>
      <div className="fp-toolbar">
        <div className="fp-select">
          <label htmlFor={`${id}-layout`}>{data.selectorLabel || 'Choose a layout'}</label>
          <select
            id={`${id}-layout`}
            value={selected}
            onChange={(event) => setSelected(Number(event.target.value))}
          >
            {data.plans.map((item, index) => (
              <option key={item.label} value={index}>
                {projectPlanLabel(item.label)}
              </option>
            ))}
          </select>
        </div>
        <a href={documentHref} target="_blank" rel="noopener noreferrer">
          {plan.imageSource ? 'Open floor plan image' : 'Open floor plan PDF'}{' '}
          <ArrowUpRight size={16} aria-hidden="true" />
        </a>
      </div>
      {area && (
        <p className="fp-area" aria-live="polite">
          {area}
        </p>
      )}
      <button
        ref={triggerRef}
        className="fp-preview"
        data-plan-background={plan.imageSource?.background}
        type="button"
        aria-label={`View full size — ${planLabel} floor plan`}
        onClick={() => {
          setActualSize(false);
          setOpen(true);
        }}
      >
        <Image
          src={plan.src}
          width={plan.width}
          height={plan.height}
          sizes="(max-width: 900px) 90vw, 900px"
          quality={85}
          loading="lazy"
          placeholder="empty"
          alt={`Floor plan for ${planLabel}`}
        />
        <span>
          <Expand size={16} aria-hidden="true" /> View full size
        </span>
      </button>
      {note && <p className="fp-note">{note}</p>}
      <a
        className="fp-source"
        href={plan.imageSource?.url ?? `${source.url}#page=${plan.sourcePage}`}
        target="_blank"
        rel="noopener noreferrer"
      >
        {plan.imageSource ? 'Plan source' : `Plan source · page ${plan.sourcePage}`}{' '}
        <ArrowUpRight size={14} aria-hidden="true" />
      </a>
      <dialog
        className="fp-dialog"
        ref={dialogRef}
        aria-labelledby={`${id}-dialog-title`}
        aria-describedby={`${id}-instructions`}
        data-lenis-prevent
        onCancel={() => setOpen(false)}
        onClose={() => setOpen(false)}
      >
        <div className="fp-dialog-heading">
          <h2 id={`${id}-dialog-title`}>{planLabel}</h2>
          <button
            type="button"
            aria-label="Close floor plan"
            autoFocus
            onClick={() => setOpen(false)}
            onTouchEnd={(event) => {
              event.preventDefault();
              setOpen(false);
            }}
          >
            <X size={22} aria-hidden="true" />
          </button>
        </div>
        <div className="fp-dialog-tools">
          <button
            type="button"
            aria-pressed={actualSize}
            onClick={() => setActualSize((value) => !value)}
          >
            {actualSize ? 'Fit to screen' : 'Zoom to original size'}
          </button>
          <a
            href={plan.imageSource ? documentHref : `${documentHref}#page=${plan.sourcePage}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            {plan.imageSource ? 'Open image' : 'Open PDF'}{' '}
            <ArrowUpRight size={14} aria-hidden="true" />
          </a>
        </div>
        <p id={`${id}-instructions`}>
          Use original size for small labels. Scroll or swipe across the enlarged sheet.
        </p>
        <div
          className="fp-viewport"
          tabIndex={0}
          role="region"
          aria-label="Scrollable floor plan"
          data-original-size={actualSize}
          data-plan-background={plan.imageSource?.background}
        >
          {open && (
            <Image
              src={plan.src}
              width={plan.width}
              height={plan.height}
              unoptimized
              alt={`${planLabel}, floor plan sheet`}
            />
          )}
        </div>
      </dialog>
    </section>
  );
}
