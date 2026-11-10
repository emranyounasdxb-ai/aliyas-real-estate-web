'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';
import { ArrowUpRight } from '@/components/brand-icons';

function stepOffset(element: HTMLDivElement, index: number) {
  const panels = element.querySelectorAll<HTMLElement>('.hp-journey-panel');
  if (!panels[index] || !panels[0]) return 0;
  return Math.min(
    element.scrollWidth - element.clientWidth,
    panels[index].offsetLeft - panels[0].offsetLeft,
  );
}

function scrollToStep(element: HTMLDivElement, index: number) {
  element.scrollTo({
    left: stepOffset(element, index),
    behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth',
  });
}

/** Native horizontal scrolling on smaller screens, with equivalent button controls. */
export function HomeJourneyStrip({ children }: { children: ReactNode }) {
  const viewport = useRef<HTMLDivElement>(null);
  const requestedStep = useRef<number | null>(null);
  const [current, setCurrent] = useState(0);
  useEffect(() => {
    const element = viewport.current;
    if (!element) return;
    let frame = 0;
    let retryFrame = 0;
    let settleTimer = 0;
    const update = () => {
      cancelAnimationFrame(frame);
      // Lenis intercepts native scrollend events on the page. Use the strip's
      // own idle interval so a completed swipe still releases a queued button move.
      clearTimeout(settleTimer);
      settleTimer = window.setTimeout(finishRequest, 120);
      frame = requestAnimationFrame(() => {
        const first = element.querySelector<HTMLElement>('.hp-journey-panel');
        if (!first) return;
        const max = element.scrollWidth - element.clientWidth;
        setCurrent(
          max < 2
            ? 0
            : element.scrollLeft >= max - 2
              ? 4
              : Math.min(4, Math.round(element.scrollLeft / (first.offsetWidth + 1))),
        );
      });
    };
    const cancelRequest = () => {
      requestedStep.current = null;
      cancelAnimationFrame(retryFrame);
      clearTimeout(settleTimer);
    };
    const finishRequest = () => {
      const index = requestedStep.current;
      if (index === null) return;
      if (Math.abs(element.scrollLeft - stepOffset(element, index)) < 2) {
        cancelRequest();
      } else {
        // Native swipe inertia can finish after a button's scrollTo call. Honour
        // the requested step once that gesture settles, unless a new gesture starts.
        cancelAnimationFrame(retryFrame);
        retryFrame = requestAnimationFrame(() => {
          if (requestedStep.current === index) scrollToStep(element, index);
        });
      }
    };
    const observer = new ResizeObserver(() => {
      cancelRequest();
      update();
    });
    observer.observe(element);
    element.addEventListener('scroll', update, { passive: true });
    element.addEventListener('pointerdown', cancelRequest, { passive: true });
    element.addEventListener('wheel', cancelRequest, { passive: true });
    update();
    return () => {
      observer.disconnect();
      element.removeEventListener('scroll', update);
      element.removeEventListener('pointerdown', cancelRequest);
      element.removeEventListener('wheel', cancelRequest);
      cancelAnimationFrame(frame);
      cancelRequest();
    };
  }, []);

  function move(direction: number) {
    const element = viewport.current;
    if (!element) return;
    const index = Math.max(0, Math.min(4, (requestedStep.current ?? current) + direction));
    requestedStep.current = index;
    scrollToStep(element, index);
  }

  return (
    <div className="hp-journey-slider">
      <div
        ref={viewport}
        id="hp-journey-viewport"
        className="hp-journey-viewport"
        role="region"
        aria-label="Five steps to your next address"
        tabIndex={0}
        data-lenis-prevent-horizontal
      >
        {children}
      </div>
      <div className="hp-journey-controls hp-shell">
        <p>Swipe to explore</p>
        <span role="status" aria-live="polite" aria-atomic="true">
          <span className="hp-visually-hidden">Step </span>0{current + 1}{' '}
          <span aria-hidden="true">/</span>
          <span className="hp-visually-hidden"> of </span> 05
        </span>
        <button
          type="button"
          aria-label="Previous buying step"
          aria-controls="hp-journey-viewport"
          aria-disabled={current === 0}
          onClick={() => current > 0 && move(-1)}
        >
          <ArrowUpRight size={20} className="hp-journey-previous" />
        </button>
        <button
          type="button"
          aria-label="Next buying step"
          aria-controls="hp-journey-viewport"
          aria-disabled={current === 4}
          onClick={() => current < 4 && move(1)}
        >
          <ArrowUpRight size={20} className="hp-journey-next" />
        </button>
      </div>
    </div>
  );
}
