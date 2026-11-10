'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { DeveloperMark } from './developer-mark';
import { ArrowUpRight } from './brand-icons';
import './developer-marquee.css';

type Brand = { slug: string; name: string };
export function DeveloperMarquee({ developers }: { developers: Brand[] }) {
  const stage = useRef<HTMLDivElement>(null);
  const [paused, setPaused] = useState(false);
  useEffect(() => {
    const element = stage.current;
    if (!element) return;
    const observer = new IntersectionObserver(([entry]) => {
      element.dataset.visible = String(entry.isIntersecting);
    });
    observer.observe(element);
    const visibility = () => {
      element.dataset.documentVisible = String(!document.hidden);
    };
    visibility();
    document.addEventListener('visibilitychange', visibility);
    return () => {
      observer.disconnect();
      document.removeEventListener('visibilitychange', visibility);
    };
  }, []);
  return (
    <section className="developer-marquee" aria-label="Explore our developer network">
      <div className="developer-marquee-intro">
        <p>Our developer network</p>
        <Link href="/developers">
          View all {developers.length} <ArrowUpRight size={16} />
        </Link>
        <button
          className="developer-marquee-pause"
          type="button"
          aria-label={paused ? 'Resume developer logos' : 'Pause developer logos'}
          aria-pressed={paused}
          onClick={() => setPaused((value) => !value)}
        >
          {paused ? 'Resume' : 'Pause'}
        </button>
      </div>
      <div
        className="developer-marquee-window"
        ref={stage}
        data-paused={paused}
        onBlurCapture={(event) => {
          if (!event.currentTarget.contains(event.relatedTarget))
            event.currentTarget.scrollLeft = 0;
        }}
      >
        <div className="developer-marquee-track">
          {[0, 1].map((copy) => (
            <div
              className="developer-marquee-group"
              key={copy}
              aria-hidden={copy === 1 || undefined}
            >
              {developers.map((developer) => (
                <Link
                  key={developer.slug}
                  href={`/developers/${developer.slug}`}
                  prefetch={false}
                  tabIndex={copy ? -1 : 0}
                  aria-label={`Explore ${developer.name}`}
                  data-developer={developer.slug}
                >
                  <DeveloperMark slug={developer.slug} name={developer.name} variant="directory" />
                </Link>
              ))}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
