'use client';

import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);
const views = [
  { src: '/images/aliyas-future-architecture.png', label: 'The silhouette' },
  { src: '/images/aliyas-architecture-arrival.png', label: 'The arrival' },
  { src: '/images/aliyas-architecture-detail.png', label: 'The detail' },
];

export function HeroArchitecture() {
  const root = useRef<HTMLDivElement>(null);
  const [selected, setSelected] = useState(0);
  const [mobile, setMobile] = useState(true);
  useEffect(() => {
    const query = matchMedia('(max-width: 700px)');
    const sync = () => {
      setMobile(query.matches);
      setSelected(0);
    };
    sync();
    query.addEventListener('change', sync);
    return () => query.removeEventListener('change', sync);
  }, []);
  useEffect(() => {
    const media = gsap.matchMedia();
    media.add('(prefers-reduced-motion: no-preference)', () => {
      const element = root.current;
      const hero = element?.closest('.future-hero');
      if (!element || !hero) return;
      const layers = element.querySelectorAll<HTMLElement>('[data-architecture-layer]');
      const timeline = gsap.timeline({
        scrollTrigger: {
          id: 'home-architecture-views',
          trigger: hero,
          start: 'clamp(top top)',
          end: 'bottom 55%',
          scrub: 0.65,
          invalidateOnRefresh: true,
          onUpdate: (self) => {
            setSelected(Math.round(self.progress * (layers.length - 1)));
          },
        },
      });
      layers.forEach((layer, index) => {
        if (index === 0) return;
        timeline.fromTo(
          layer,
          { opacity: 0 },
          { opacity: 1, duration: 0.45, ease: 'none' },
          index - 0.65,
        );
      });
      return () => {
        timeline.scrollTrigger?.kill();
        timeline.kill();
        layers.forEach((layer) => layer.style.removeProperty('opacity'));
      };
    });
    return () => media.revert();
  }, [mobile]);
  const visible = mobile ? views.filter((_, index) => index !== 1) : views;
  return (
    <>
      <div className="hero-architecture" data-hero-sequence ref={root}>
        {visible.map((view, index) => (
          <div
            key={view.src}
            data-architecture-layer
            className={`hero-architecture-layer ${selected >= index ? 'is-current' : ''}`}
          >
            <Image
              src={view.src}
              alt={
                index === 0
                  ? 'Illustrative white sculptural residential tower with curved terraces, silver glazing and palms'
                  : ''
              }
              fill
              sizes="(max-width:800px) 100vw, 55vw"
              quality={85}
              loading={index === 0 ? 'eager' : 'lazy'}
              fetchPriority={index === 0 ? 'high' : 'auto'}
            />
          </div>
        ))}
      </div>
      <div className="hero-view-controls" role="group" aria-label="Architectural concept views">
        <span>{visible[selected]?.label || visible[0].label}</span>
        {visible.map((view, index) => (
          <button
            type="button"
            key={view.src}
            aria-label={`View ${view.label.toLowerCase()} — ${String(index + 1).padStart(2, '0')}`}
            aria-pressed={selected === index}
            onClick={() => {
              // A deliberate selection overrides the current scrub frame until scrolling resumes.
              root.current
                ?.querySelectorAll<HTMLElement>('[data-architecture-layer]')
                .forEach((layer) => layer.style.removeProperty('opacity'));
              setSelected(index);
            }}
          >
            {String(index + 1).padStart(2, '0')}
          </button>
        ))}
      </div>
    </>
  );
}
