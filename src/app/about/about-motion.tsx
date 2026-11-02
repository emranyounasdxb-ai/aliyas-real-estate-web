'use client';

import { useEffect, useRef, type ReactNode } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { brandEase } from '@/lib/motion-curve';

gsap.registerPlugin(ScrollTrigger);

export function AboutMotion({ children, className }: { children: ReactNode; className: string }) {
  const root = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!root.current) return;
    const media = gsap.matchMedia();
    media.add('(prefers-reduced-motion: no-preference)', () => {
      const scope = root.current!;
      const tweens = new Set<gsap.core.Tween>();
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (!entry.isIntersecting) return;
            observer.unobserve(entry.target);
            const tween = gsap.to(entry.target, {
              y: 0,
              opacity: 1,
              duration: 0.75,
              ease: brandEase,
              clearProps: 'transform,opacity',
              onComplete: () => tweens.delete(tween),
            });
            tweens.add(tween);
          });
        },
        { rootMargin: '0px 0px -32px 0px' },
      );
      const context = gsap.context(() => {
        gsap.from('[data-about-enter]', {
          y: 24,
          opacity: 0,
          duration: 0.8,
          stagger: 0.06,
          ease: brandEase,
          clearProps: 'transform,opacity',
        });
        const reveals = scope.querySelectorAll('[data-about-reveal]');
        gsap.set(reveals, { y: 32, opacity: 0 });
        reveals.forEach((node) => observer.observe(node));
        gsap.fromTo(
          '[data-about-word]',
          { opacity: 0.3 },
          {
            opacity: 1,
            stagger: 0.12,
            duration: 0.45,
            ease: brandEase,
            scrollTrigger: {
              trigger: scope.querySelector('[data-about-belief]'),
              start: 'top 85%',
              end: 'bottom 40%',
              scrub: 0.5,
              once: true,
            },
          },
        );
      }, scope);
      return () => {
        observer.disconnect();
        tweens.forEach((tween) => tween.kill());
        context.revert();
      };
    });
    return () => media.revert();
  }, []);
  return (
    <div ref={root} className={className}>
      {children}
    </div>
  );
}
