'use client';

import { useEffect, useId, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export function SectionNavigation({
  items,
  label = 'Project sections',
  className = 'pd-section-nav',
  vertical = false,
}: {
  items: { id: string; label: string }[];
  label?: string;
  className?: string;
  vertical?: boolean;
}) {
  const [active, setActive] = useState(items[0]?.id || '');
  const root = useRef<HTMLElement>(null);
  const id = useId();
  const [edges, setEdges] = useState({ left: false, right: false });
  useEffect(() => {
    const nav = root.current;
    if (!nav || vertical) return;
    let mounted = true;
    const measure = () => {
      if (mounted)
        setEdges({
          left: nav.scrollLeft > 2,
          right: nav.scrollLeft + nav.clientWidth < nav.scrollWidth - 2,
        });
    };
    const observer = new ResizeObserver(measure);
    observer.observe(nav);
    nav.querySelectorAll('a').forEach((link) => observer.observe(link));
    nav.addEventListener('scroll', measure, { passive: true });
    document.fonts.ready.then(measure);
    measure();
    return () => {
      mounted = false;
      observer.disconnect();
      nav.removeEventListener('scroll', measure);
    };
  }, [vertical]);
  useEffect(() => {
    const nav = root.current;
    if (!nav || vertical) return;
    const link = Array.from(nav.querySelectorAll('a')).find((item) => item.hash === `#${active}`);
    if (!link) return;
    const box = link.getBoundingClientRect(),
      bounds = nav.getBoundingClientRect();
    if (box.left < bounds.left + 36)
      nav.scrollBy({ left: box.left - bounds.left - 40, behavior: 'instant' });
    else if (box.right > bounds.right - 40)
      nav.scrollBy({ left: box.right - bounds.right + 44, behavior: 'instant' });
  }, [active, vertical]);
  const shift = (direction: number) => {
    const nav = root.current;
    if (nav)
      nav.scrollBy({
        left: direction * nav.clientWidth * 0.65,
        behavior: matchMedia('(prefers-reduced-motion:reduce)').matches ? 'instant' : 'smooth',
      });
  };
  useEffect(() => {
    let frame = 0;
    const update = () => {
      frame = 0;
      const header =
        document.querySelector('header.site-header')?.getBoundingClientRect().height || 76;
      const boundary = header + (vertical ? 0 : root.current?.offsetHeight || 64) + 36;
      let current = items[0]?.id || '';
      for (const item of items) {
        const section = document.getElementById(item.id);
        if (section && section.getBoundingClientRect().top <= boundary) current = item.id;
      }
      setActive(current);
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', schedule);
    };
  }, [items, vertical]);
  const navigation = (
    <nav
      ref={root}
      id={id}
      className={className}
      aria-label={label}
      onFocusCapture={(event) => {
        if (
          vertical ||
          !(event.target instanceof HTMLAnchorElement) ||
          !event.target.matches(':focus-visible') ||
          !root.current
        )
          return;
        const nav = root.current,
          box = event.target.getBoundingClientRect(),
          bounds = nav.getBoundingClientRect();
        if (box.left < bounds.left + 36)
          nav.scrollBy({ left: box.left - bounds.left - 40, behavior: 'instant' });
        else if (box.right > bounds.right - 40)
          nav.scrollBy({ left: box.right - bounds.right + 44, behavior: 'instant' });
      }}
    >
      {items.map((item) => (
        <a
          key={item.id}
          href={`#${item.id}`}
          aria-current={active === item.id ? 'location' : undefined}
          onClick={(event) => {
            const target = document.getElementById(item.id);
            if (!target) return;
            event.preventDefault();
            // This navigation owns the measured offset; avoid a second automatic anchor scroll.
            event.stopPropagation();
            const header =
              document.querySelector('header.site-header')?.getBoundingClientRect().height || 76;
            const top = Math.max(
              0,
              target.getBoundingClientRect().top +
                scrollY -
                header -
                (vertical ? 0 : root.current?.offsetHeight || 64) -
                24,
            );
            history.pushState(null, '', `#${item.id}`);
            setActive(item.id);
            const request = new CustomEvent('aliyas:scroll-to', {
              cancelable: true,
              detail: { top, immediate: false },
            });
            if (window.dispatchEvent(request))
              window.scrollTo({
                top,
                behavior: matchMedia('(prefers-reduced-motion:reduce)').matches
                  ? 'instant'
                  : 'smooth',
              });
          }}
        >
          {item.label}
        </a>
      ))}
    </nav>
  );
  if (vertical) return navigation;
  return (
    <div
      className={`pd-nav-shell ${edges.left ? 'has-previous' : ''} ${edges.right ? 'has-next' : ''}`}
    >
      {navigation}
      {edges.left && (
        <button
          className="pd-nav-previous"
          type="button"
          aria-label="Previous project sections"
          aria-controls={id}
          onClick={() => shift(-1)}
        >
          <ChevronLeft size={19} />
        </button>
      )}
      {edges.right && (
        <button
          className="pd-nav-next"
          type="button"
          aria-label="Next project sections"
          aria-controls={id}
          onClick={() => shift(1)}
        >
          <ChevronRight size={19} />
        </button>
      )}
    </div>
  );
}
