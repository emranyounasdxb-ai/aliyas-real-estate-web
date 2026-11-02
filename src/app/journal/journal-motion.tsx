'use client';

import { useEffect, useRef, type ReactNode } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { brandEase } from '@/lib/motion-curve';

gsap.registerPlugin(ScrollTrigger);

export function JournalMotion({
  children,
  className,
  viewKey,
}: {
  children: ReactNode;
  className: string;
  viewKey: string;
}) {
  const root = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!root.current) return;
    // Keep the selected category visible in the mobile topic rail without moving the page.
    const topics = root.current.querySelector<HTMLElement>('[data-journal-topics]');
    const selectedTopic = topics?.querySelector<HTMLElement>('[aria-current]');
    const revealTopic = (item: HTMLElement | null | undefined) => {
      if (!topics || !item || topics.scrollWidth <= topics.clientWidth) return;
      topics.scrollLeft +=
        item.getBoundingClientRect().left -
        topics.getBoundingClientRect().left -
        (topics.clientWidth - item.offsetWidth) / 2;
    };
    revealTopic(selectedTopic);
    const onTopicFocus = (event: FocusEvent) => {
      if (event.target instanceof HTMLElement) revealTopic(event.target.closest('a'));
    };
    topics?.addEventListener('focusin', onTopicFocus);
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
        { rootMargin: '0px 0px -24px 0px' },
      );
      const context = gsap.context(() => {
        // Keep the main image and headline present immediately. Only secondary details enter.
        gsap.from('[data-journal-enter]', {
          y: 24,
          opacity: 0,
          duration: 0.8,
          stagger: 0.06,
          ease: brandEase,
          clearProps: 'transform,opacity',
        });
        const sections = scope.querySelectorAll<HTMLElement>('[data-journal-reveal]');
        // Avoid hiding an already visible reading room on a search or pagination transition.
        sections.forEach((section) => {
          if (section.getBoundingClientRect().top < window.innerHeight) return;
          gsap.set(section, { y: 32, opacity: 0 });
          observer.observe(section);
        });
        const cover = scope.querySelector('[data-journal-cover]');
        if (cover)
          gsap.fromTo(
            cover,
            { yPercent: -3, scale: 1.08 },
            {
              yPercent: 3,
              scale: 1.03,
              ease: brandEase,
              scrollTrigger: {
                trigger: cover.parentElement,
                start: 'top bottom',
                end: 'bottom top',
                scrub: 0.8,
              },
            },
          );
        const words = scope.querySelectorAll('[data-journal-word]');
        if (words.length)
          gsap.fromTo(
            words,
            { opacity: 0.3 },
            {
              opacity: 1,
              stagger: 0.12,
              duration: 0.45,
              ease: brandEase,
              scrollTrigger: {
                trigger: scope.querySelector('[data-journal-guide]'),
                start: 'top 85%',
                end: 'center 45%',
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
    return () => {
      topics?.removeEventListener('focusin', onTopicFocus);
      media.revert();
    };
  }, [viewKey]);
  return (
    <div ref={root} className={className}>
      {children}
    </div>
  );
}
