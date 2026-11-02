'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';
import { ArrowLeft, ArrowRight } from 'lucide-react';

export function LifestyleRail({ children, count }: { children: ReactNode; count: number }) {
  const viewport = useRef<HTMLDivElement>(null);
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const element = viewport.current!;
    const sync = () => {
      const cards = Array.from(element.children) as HTMLElement[];
      const nearest = cards.reduce(
        (best, card, index) =>
          Math.abs(card.offsetLeft - element.scrollLeft) <
          Math.abs(cards[best].offsetLeft - element.scrollLeft)
            ? index
            : best,
        0,
      );
      // The final card can stop at the rail's end without reaching its left edge.
      setCurrent(
        element.scrollLeft > 0 &&
          element.scrollLeft >= element.scrollWidth - element.clientWidth - 2
          ? count - 1
          : nearest,
      );
    };
    element.addEventListener('scroll', sync, { passive: true });
    const observer = new ResizeObserver(sync);
    observer.observe(element);
    sync();
    return () => {
      element.removeEventListener('scroll', sync);
      observer.disconnect();
    };
  }, [count]);

  const go = (index: number) => {
    const element = viewport.current!;
    const card = element.children[Math.max(0, Math.min(count - 1, index))] as HTMLElement;
    element.scrollTo({
      left: card.offsetLeft,
      behavior: matchMedia('(prefers-reduced-motion:reduce)').matches ? 'instant' : 'smooth',
    });
  };

  return (
    <>
      <div
        className="curated-grid"
        ref={viewport}
        role="region"
        aria-label="Ways of living"
        tabIndex={0}
        data-lenis-prevent-horizontal
        onKeyDown={(event) => {
          if (event.target !== event.currentTarget) return;
          if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
          event.preventDefault();
          go(
            event.key === 'Home'
              ? 0
              : event.key === 'End'
                ? count - 1
                : current + (event.key === 'ArrowRight' ? 1 : -1),
          );
        }}
      >
        {children}
      </div>
      <div className="lifestyle-controls">
        <output aria-live="polite" aria-label="Visible lifestyle collection">
          {String(current + 1).padStart(2, '0')} <span>/ {String(count).padStart(2, '0')}</span>
        </output>
        <span className="lifestyle-progress" aria-hidden="true">
          <span style={{ transform: `scaleX(${(current + 1) / count})` }} />
        </span>
        <span className="lifestyle-swipe-hint">Swipe to explore</span>
        <div>
          <button
            type="button"
            aria-label="Previous lifestyle collection"
            disabled={current === 0}
            onClick={() => go(current - 1)}
          >
            <ArrowLeft size={17} />
          </button>
          <button
            type="button"
            aria-label="Next lifestyle collection"
            disabled={current === count - 1}
            onClick={() => go(current + 1)}
          >
            <ArrowRight size={17} />
          </button>
        </div>
      </div>
    </>
  );
}
