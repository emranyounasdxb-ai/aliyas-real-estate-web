'use client';

import { useEffect, useRef } from 'react';

/** Reveal the statement once, without hiding it when scripts or motion are disabled. */
export function HomeTagline() {
  const heading = useRef<HTMLHeadingElement>(null);
  useEffect(() => {
    const node = heading.current;
    if (!node || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    node.dataset.motion = 'ready';
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        node.dataset.motion = 'visible';
        observer.disconnect();
      },
      { threshold: 0.35 },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);
  return (
    <h2
      ref={heading}
      className="hp-tagline"
      aria-label="A clear shortlist. A personal conversation."
    >
      {['A clear shortlist.', 'A personal conversation.'].map((line, lineIndex) => (
        <span className="hp-tagline-line" aria-hidden="true" key={line}>
          {line.split(' ').map((word, index) => (
            <span key={word} style={{ transitionDelay: `${(lineIndex * 3 + index) * 70}ms` }}>
              {word}{' '}
            </span>
          ))}
        </span>
      ))}
    </h2>
  );
}
