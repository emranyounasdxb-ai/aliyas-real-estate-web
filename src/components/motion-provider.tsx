'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';

gsap.registerPlugin(ScrollTrigger);

export function MotionProvider() {
  const pathname = usePathname();

  useEffect(() => {
    const section = document.querySelector<HTMLElement>('[data-collection-section]');
    const track = section?.querySelector<HTMLElement>('[data-collection-track]');
    const viewport = track?.parentElement;
    const cards = track
      ? Array.from(track.querySelectorAll<HTMLElement>('[data-collection-card]'))
      : [];
    const current = section?.querySelector<HTMLElement>('[data-collection-current]');
    const progress = section?.querySelector<HTMLElement>('[data-collection-progress]');
    const travel = () =>
      track && viewport ? Math.max(0, track.scrollWidth - viewport.clientWidth) : 0;
    let lastCard = -1;

    const showProgress = (value: number) => {
      const fraction = Math.max(0, Math.min(1, value));
      const index = Math.round(fraction * Math.max(0, cards.length - 1));
      if (current && index !== lastCard) current.textContent = String(index + 1).padStart(2, '0');
      lastCard = index;
      if (progress)
        progress.style.transform = `scaleX(${(1 + fraction * Math.max(0, cards.length - 1)) / Math.max(1, cards.length)})`;
    };
    // The native rail keeps its position indicator, including with reduced motion.
    const onRailScroll = () => {
      if (!section?.classList.contains('is-pinned'))
        showProgress(travel() ? (viewport?.scrollLeft || 0) / travel() : 0);
    };
    viewport?.addEventListener('scroll', onRailScroll, { passive: true });
    onRailScroll();

    const media = gsap.matchMedia();
    media.add('(prefers-reduced-motion: no-preference)', () => {
      let active = true;
      const initialStyles = new Map<Element, string | null>();
      document
        .querySelectorAll(
          '.future-hero [data-future-visual], .future-hero [data-hero-sequence], .future-hero [data-future-visual] img, .future-hero [data-future-line], .future-hero [data-future-entrance], .future-scroll-line, [data-reveal], [data-image-reveal] img',
        )
        .forEach((element) => initialStyles.set(element, element.getAttribute('style')));
      const lenis = new Lenis({
        duration: 1.15,
        smoothWheel: true,
        wheelMultiplier: 0.9,
        syncTouch: false,
        // Lenis reads the root scroll-padding; adding the header offset again doubles the gap.
        anchors: true,
        stopInertiaOnNavigate: true,
      });
      lenis.on('scroll', ScrollTrigger.update);
      let enquiryOpen = document.documentElement.hasAttribute('data-lenis-prevent');
      let navigationOpen = document.documentElement.hasAttribute('data-navigation-open');
      let filtersOpen = false;
      const syncScrollLock = () => {
        if (enquiryOpen || navigationOpen || filtersOpen) lenis.stop();
        else lenis.start();
      };
      const onEnquiryVisibility = (event: Event) => {
        enquiryOpen = Boolean((event as CustomEvent<{ open: boolean }>).detail?.open);
        syncScrollLock();
      };
      const onNavigationVisibility = (event: Event) => {
        navigationOpen = Boolean((event as CustomEvent<{ open: boolean }>).detail?.open);
        syncScrollLock();
      };
      const onFiltersVisibility = (event: Event) => {
        filtersOpen = Boolean((event as CustomEvent<{ open: boolean }>).detail?.open);
        syncScrollLock();
      };
      syncScrollLock();
      window.addEventListener('aliyas:enquiry-visibility', onEnquiryVisibility);
      window.addEventListener('aliyas:navigation-visibility', onNavigationVisibility);
      window.addEventListener('aliyas:filters-visibility', onFiltersVisibility);
      const onRequestedScroll = (event: Event) => {
        const detail = (event as CustomEvent<{ top: number; immediate?: boolean }>).detail;
        if (Number.isFinite(detail?.top)) {
          event.preventDefault();
          lenis.scrollTo(detail.top, { immediate: detail.immediate !== false, force: true });
        }
      };
      window.addEventListener('aliyas:scroll-to', onRequestedScroll);
      const tick = (time: number) => lenis.raf(time * 1000);
      gsap.ticker.add(tick);
      gsap.ticker.lagSmoothing(0);

      const hero = document.querySelector<HTMLElement>('.future-hero');
      const visual = hero?.querySelector<HTMLElement>('[data-future-visual]');
      const heroImage =
        visual?.querySelector<HTMLElement>('[data-hero-sequence]') || visual?.querySelector('img');
      if (hero) {
        // Keep the first mobile photo painted while the heading and subtle zoom enter.
        // Desktop retains its approved full-height architectural reveal.
        const compactHero = matchMedia(
          '(max-width:700px), (max-width:1000px) and (max-height:500px)',
        ).matches;
        const entrance = gsap.timeline({ defaults: { ease: 'power3.out' } });
        if (visual && !compactHero)
          entrance.from(
            visual,
            { clipPath: 'inset(0 0 100% 0)', duration: 1.5, clearProps: 'clipPath' },
            0,
          );
        if (heroImage) {
          entrance.fromTo(
            heroImage,
            { scale: compactHero ? 1.16 : 1.23 },
            { scale: 1.12, duration: compactHero ? 0.75 : 1.8, ease: 'power2.out' },
            0,
          );
          // The 12% overscale covers the image throughout this 8% parallax range.
          gsap.fromTo(
            heroImage,
            { yPercent: -4 },
            {
              yPercent: 4,
              ease: 'none',
              scrollTrigger: { trigger: hero, start: 'top top', end: 'bottom top', scrub: 0.8 },
            },
          );
        }
        const lines = hero.querySelectorAll('[data-future-line]');
        const supporting = hero.querySelectorAll('[data-future-entrance]');
        if (lines.length)
          entrance.from(
            lines,
            {
              yPercent: 112,
              duration: compactHero ? 0.65 : 1.1,
              stagger: compactHero ? 0.08 : 0.12,
              clearProps: 'transform',
            },
            compactHero ? 0.08 : 0.2,
          );
        if (supporting.length)
          entrance.from(
            supporting,
            {
              y: compactHero ? 12 : 24,
              opacity: 0,
              duration: compactHero ? 0.45 : 0.9,
              stagger: compactHero ? 0.045 : 0.08,
              clearProps: 'transform,opacity',
            },
            compactHero ? 0.18 : 0.65,
          );
        const cue = hero.querySelector('.future-scroll-line');
        if (cue)
          gsap.fromTo(
            cue,
            { scaleY: 0, transformOrigin: 'top' },
            {
              scaleY: 1,
              duration: 1.6,
              repeat: -1,
              repeatDelay: 0.45,
              ease: 'power2.inOut',
              scrollTrigger: {
                trigger: hero,
                start: 'top bottom',
                end: 'bottom top',
                toggleActions: 'play pause resume pause',
              },
            },
          );
      }

      // Native visibility observation avoids measuring every off-screen reveal
      // through ScrollTrigger at startup. GSAP keeps the approved reveal motion.
      const revealTweens = new Map<Element, gsap.core.Tween>();
      const revealObserver = new IntersectionObserver(
        (entries) => {
          if (!active) return;
          for (const entry of entries) {
            if (!entry.isIntersecting) continue;
            revealObserver.unobserve(entry.target);
            const tween = gsap.to(entry.target, {
              y: 0,
              opacity: 1,
              duration: entry.target.closest('.hp-home') ? 0.7 : 0.55,
              delay: Math.min(
                0.32,
                Math.max(0, Number((entry.target as HTMLElement).dataset.revealDelay) || 0),
              ),
              ease: 'power3.out',
              clearProps: 'transform,opacity',
              onComplete: () => {
                revealTweens.delete(entry.target);
              },
            });
            revealTweens.set(entry.target, tween);
          }
        },
        { rootMargin: `0px 0px -${Math.round(innerHeight * 0.08)}px 0px` },
      );
      const revealNodes = gsap.utils.toArray<HTMLElement>('[data-reveal]');
      // Hydration can finish after a visitor has already scrolled or clicked.
      // Never hide or move content that is already on screen at initialization.
      const pendingReveals = revealNodes.filter((element) => {
        const bounds = element.getBoundingClientRect();
        return bounds.top >= innerHeight || bounds.bottom <= 0;
      });
      gsap.set(pendingReveals, {
        y: (_index, target: HTMLElement) => (target.closest('.hp-home') ? 32 : 20),
        opacity: 0,
      });
      pendingReveals.forEach((element) => revealObserver.observe(element));
      // Keyboard navigation must never land on an invisible link or control.
      const revealFocusedContent = (event: FocusEvent) => {
        // Pointer focus occurs between mousedown and mouseup. Moving the link at
        // that point can put mouseup outside it and cancel the native click.
        if (!(event.target instanceof HTMLElement) || !event.target.matches(':focus-visible'))
          return;
        let element = event.target.closest<HTMLElement>('[data-reveal]');
        while (element) {
          revealObserver.unobserve(element);
          revealTweens.get(element)?.kill();
          revealTweens.delete(element);
          gsap.set(element, { clearProps: 'transform,opacity' });
          element = element.parentElement?.closest<HTMLElement>('[data-reveal]') ?? null;
        }
      };
      document.addEventListener('focusin', revealFocusedContent);
      gsap.utils.toArray<HTMLElement>('[data-image-reveal]').forEach((element) => {
        const image = element.querySelector('img');
        if (image)
          gsap.fromTo(
            image,
            { scale: 1.16, yPercent: -3 },
            {
              scale: 1.08,
              yPercent: 3,
              ease: 'none',
              scrollTrigger: {
                trigger: element,
                start: 'top bottom',
                end: 'bottom top',
                scrub: 0.7,
              },
            },
          );
      });

      const collectionMedia = gsap.matchMedia();
      collectionMedia.add('(min-width: 1000px) and (min-height: 700px)', () => {
        if (!section || !track || !viewport || cards.length < 2 || travel() <= 0) return;
        const originalTrackStyle = track.getAttribute('style');
        section.classList.add('is-pinned');
        track.classList.add('is-enhanced');
        viewport.scrollLeft = 0;
        let focusFrame = 0;

        const movement = gsap.fromTo(
          track,
          { x: 0 },
          {
            x: () => -travel(),
            ease: 'none',
            onUpdate: function (this: gsap.core.Tween) {
              showProgress(this.progress());
            },
            scrollTrigger: {
              id: 'future-collection',
              trigger: section,
              start: () =>
                `top ${getComputedStyle(document.documentElement).getPropertyValue('--header-height').trim()}`,
              end: () => `+=${Math.max(travel(), window.innerHeight)}`,
              pin: true,
              pinSpacing: true,
              scrub: 0.8,
              anticipatePin: 1,
              invalidateOnRefresh: true,
              refreshPriority: 1,
            },
          },
        );

        // Keep every project in the tab order. Keyboard focus moves the scene to
        // that card, rather than letting a hidden native scroll offset fight GSAP.
        const onFocus = (event: FocusEvent) => {
          const target = event.target;
          if (!(target instanceof HTMLElement)) return;
          const card = target.closest<HTMLElement>('[data-collection-card]');
          if (!card || !track.contains(card)) return;
          cancelAnimationFrame(focusFrame);
          focusFrame = requestAnimationFrame(() => {
            const trigger = movement.scrollTrigger;
            if (!trigger || !active) return;
            viewport.scrollLeft = 0;
            const cardBox = card.getBoundingClientRect();
            const viewportBox = viewport.getBoundingClientRect();
            if (
              trigger.isActive &&
              cardBox.left >= viewportBox.left - 1 &&
              cardBox.right <= viewportBox.right + 1
            )
              return;
            const offset = cardBox.left - track.getBoundingClientRect().left;
            const destination = Math.max(
              0,
              Math.min(travel(), offset + (cardBox.width - viewport.clientWidth) / 2),
            );
            const fraction = travel() ? destination / travel() : 0;
            lenis.scrollTo(trigger.start + (trigger.end - trigger.start) * fraction, {
              immediate: true,
              force: true,
            });
            ScrollTrigger.update();
            trigger.getTween()?.progress(1);
          });
        };
        track.addEventListener('focusin', onFocus);

        return () => {
          cancelAnimationFrame(focusFrame);
          track.removeEventListener('focusin', onFocus);
          section.classList.remove('is-pinned');
          track.classList.remove('is-enhanced');
          if (originalTrackStyle === null) track.removeAttribute('style');
          else track.setAttribute('style', originalTrackStyle);
          viewport.scrollLeft = 0;
          showProgress(0);
        };
      });

      const refresh = () => {
        if (active) {
          lenis.resize();
          ScrollTrigger.refresh();
        }
      };
      // Hydration, font readiness and load can settle together. Batch their geometry
      // refreshes into one frame instead of synchronously remeasuring the same scenes.
      let refreshFrame = 0;
      const scheduleRefresh = () => {
        if (!active) return;
        cancelAnimationFrame(refreshFrame);
        refreshFrame = requestAnimationFrame(() => {
          refreshFrame = 0;
          refresh();
        });
      };
      window.addEventListener('load', scheduleRefresh);
      document.fonts.ready.then(scheduleRefresh);
      scheduleRefresh();
      return () => {
        active = false;
        revealObserver.disconnect();
        document.removeEventListener('focusin', revealFocusedContent);
        revealTweens.forEach((tween) => tween.kill());
        revealTweens.clear();
        cancelAnimationFrame(refreshFrame);
        collectionMedia.revert();
        window.removeEventListener('load', scheduleRefresh);
        window.removeEventListener('aliyas:enquiry-visibility', onEnquiryVisibility);
        window.removeEventListener('aliyas:navigation-visibility', onNavigationVisibility);
        window.removeEventListener('aliyas:filters-visibility', onFiltersVisibility);
        window.removeEventListener('aliyas:scroll-to', onRequestedScroll);
        gsap.ticker.remove(tick);
        lenis.destroy();
        // Separate entrance/parallax tweens can snapshot each other's transforms.
        // Restore the pre-animation styles when motion preferences or routes change.
        initialStyles.forEach((style, element) => {
          if (style === null) element.removeAttribute('style');
          else element.setAttribute('style', style);
        });
      };
    });

    return () => {
      media.revert();
      viewport?.removeEventListener('scroll', onRailScroll);
      if (current) current.textContent = '01';
      progress?.style.removeProperty('transform');
    };
  }, [pathname]);

  return null;
}
