'use client';
import { useLayoutEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { brandEase } from '@/lib/motion-curve';
gsap.registerPlugin(ScrollTrigger);

export function LuxuryHomeMotion() {
  useLayoutEffect(() => {
    const root = document.querySelector<HTMLElement>('[data-luxury-home]');
    if (!root) return;
    const media = gsap.matchMedia();
    media.add(
      {
        desktop: '(min-width: 701px)',
        mobile: '(max-width: 700px)',
        wide: '(min-width: 1101px)',
        tall: '(min-height: 600px)',
        reduce: '(prefers-reduced-motion: reduce)',
      },
      (context) => {
        if (context.conditions?.reduce) return;
        const mobile = Boolean(context.conditions?.mobile);
        const header = () =>
          parseFloat(
            getComputedStyle(document.documentElement).getPropertyValue('--header-height'),
          ) || 76;
        // The reference hands one whole panel over to the next: the outgoing
        // sheet narrows while the following section is revealed from underneath.
        // Keep content opaque; this is a spatial transition, not a section fade.
        const handoffs = [
          ['.lux-collection', '.lux-about'],
          ['.lux-about', '.lux-services'],
          ['.lux-services', '.lux-values'],
          ['.lux-settings', '.lux-journal'],
          ['.lux-journal', '.lux-faq'],
        ];
        for (const [outgoingSelector, incomingSelector] of handoffs) {
          const outgoing = root.querySelector<HTMLElement>(outgoingSelector);
          const incoming = root.querySelector<HTMLElement>(incomingSelector);
          if (!outgoing || !incoming) continue;
          gsap.fromTo(
            incoming,
            { y: mobile ? -45 : -140 },
            {
              y: 0,
              ease: brandEase,
              scrollTrigger: {
                trigger: incoming,
                start: 'top bottom',
                end: () => `top ${header() + 32}`,
                scrub: 0.65,
                invalidateOnRefresh: true,
              },
            },
          );
          gsap.to(outgoing, {
            scale: mobile ? 0.98 : 0.94,
            transformOrigin: '50% 100%',
            ease: brandEase,
            scrollTrigger: {
              trigger: outgoing,
              start: 'bottom bottom',
              end: () => `bottom ${header()}`,
              scrub: 0.65,
              invalidateOnRefresh: true,
            },
          });
        }
        const entrance = gsap.timeline({ defaults: { ease: brandEase } });
        entrance
          .from(
            '[data-lux-line]',
            { y: 35, opacity: 0, duration: 0.85, stagger: 0.1, clearProps: 'transform,opacity' },
            0.05,
          )
          .from(
            '[data-lux-enter]',
            { y: 12, opacity: 0, duration: 0.65, stagger: 0.1, clearProps: 'transform,opacity' },
            0.15,
          );
        gsap.fromTo(
          '.lux-hero-image > img',
          { scale: 1.03, yPercent: -2 },
          {
            scale: 1.08,
            yPercent: 2,
            ease: brandEase,
            scrollTrigger: {
              trigger: '.lux-hero',
              start: 'top top',
              end: 'bottom top',
              scrub: 0.8,
            },
          },
        );
        const panorama = root.querySelector<HTMLElement>('[data-lux-panorama]');
        if (panorama) {
          gsap
            .timeline({
              scrollTrigger: {
                id: 'lux-panorama',
                refreshPriority: 2,
                trigger: panorama,
                start: () => `top ${header()}`,
                end: () => `+=${innerHeight * (mobile ? 0.25 : 0.4)}`,
                pin: Boolean(context.conditions?.tall),
                scrub: 0.65,
                invalidateOnRefresh: true,
              },
            })
            .fromTo(
              '.lux-panorama-image',
              { scale: mobile ? 0.9 : 0.78 },
              { scale: 1, duration: 0.65, ease: brandEase },
              0,
            )
            .fromTo(
              '.lux-panorama-image > img',
              { scale: 1.15 },
              { scale: 1, duration: 1, ease: brandEase },
              0,
            )
            .fromTo(
              '.lux-panorama-marquee',
              { xPercent: 5 },
              { xPercent: -35, duration: 1, ease: brandEase },
              0,
            )
            .to('.lux-panorama-icons, .lux-scroll-cue', { opacity: 0, duration: 0.15 }, 0.4);
        }
        const reveals = Array.from(root.querySelectorAll<HTMLElement>('[data-lux-reveal]'));
        const revealTweens = new Set<gsap.core.Tween>();
        const observer = new IntersectionObserver(
          (entries) => {
            for (const entry of entries) {
              if (!entry.isIntersecting) continue;
              observer.unobserve(entry.target);
              const tween = gsap.to(entry.target, {
                y: 0,
                opacity: 1,
                duration: 0.7,
                ease: brandEase,
                clearProps: 'transform,opacity',
                onComplete: () => revealTweens.delete(tween),
              });
              revealTweens.add(tween);
            }
          },
          { rootMargin: '0px 0px -32px 0px' },
        );
        reveals.forEach((element) => {
          gsap.set(element, { y: 32, opacity: 0 });
          observer.observe(element);
        });
        gsap.utils.toArray<HTMLElement>('[data-lux-card]').forEach((element, index) => {
          gsap.from(element, {
            y: mobile ? 35 : index % 2 ? 90 : 45,
            opacity: 0.35,
            ease: brandEase,
            scrollTrigger: { trigger: element, start: 'top bottom', end: 'top 65%', scrub: 0.5 },
          });
        });
        const serviceFocusCleanups: (() => void)[] = [];
        root.querySelectorAll<HTMLElement>('[data-lux-service]').forEach((element, index) => {
          const sheet = element.closest<HTMLElement>('.lux-services');
          // The whole sheet also translates on entry. Measure its resting
          // position so a refresh cannot finish the bars before they are seen.
          const restingTop = () =>
            element.getBoundingClientRect().top +
            window.scrollY -
            (sheet ? Number(gsap.getProperty(sheet, 'y')) : 0);
          const slide = gsap.fromTo(
            element,
            { x: () => element.clientWidth * (mobile ? 0.65 : 0.85) + index * (mobile ? 16 : 24) },
            {
              x: 0,
              ease: brandEase,
              scrollTrigger: {
                id: `lux-service-${index + 1}`,
                trigger: element,
                start: () => restingTop() - innerHeight * 0.9,
                end: () => restingTop() - innerHeight * (mobile ? 0.4 : 0.24),
                scrub: 0.65,
                invalidateOnRefresh: true,
              },
            },
          );
          // Keep focused disclosure controls fully visible and stationary.
          // Mouse/touch focus receives the same protection as keyboard focus.
          const settleForInteraction = () => {
            slide.scrollTrigger?.kill(false, true);
            slide.progress(1).kill();
            gsap.set(element, { x: 0 });
          };
          element.addEventListener('focusin', settleForInteraction, { once: true });
          serviceFocusCleanups.push(() =>
            element.removeEventListener('focusin', settleForInteraction),
          );
        });
        gsap.utils.toArray<HTMLElement>('[data-lux-parallax]').forEach((element) => {
          gsap.fromTo(
            element.querySelector('img'),
            { yPercent: -3, scale: 1.12 },
            {
              yPercent: 3,
              ease: brandEase,
              scrollTrigger: {
                trigger: element,
                start: 'top bottom',
                end: 'bottom top',
                scrub: 0.8,
              },
            },
          );
        });
        const journey = root.querySelector<HTMLElement>('[data-lux-journey]');
        const stage = root.querySelector<HTMLElement>('.lux-circle-stage');
        const first = root.querySelector<HTMLElement>('.lux-circle-one');
        const services = root.querySelector<HTMLElement>('.lux-services');
        if (journey && stage && first && services) {
          const distance = () => (stage.clientWidth - first.clientWidth) / 2;
          const triangleOffset = () => first.clientWidth * 0.22;
          gsap.set('.lux-journey-result', { opacity: 0 });
          gsap.set('.lux-journey > .lux-pill', { autoAlpha: 0, y: 12 });
          gsap
            .timeline({
              scrollTrigger: {
                id: 'lux-journey',
                refreshPriority: 1,
                trigger: journey,
                // Remove the parent's entrance translation when calculating the
                // natural start; otherwise the pinned scene sits 100px too low.
                start: () =>
                  journey.getBoundingClientRect().top +
                  window.scrollY -
                  Number(gsap.getProperty(services, 'y')) -
                  header(),
                end: () => `+=${innerHeight * (mobile ? 0.65 : 0.9)}`,
                pin: Boolean(context.conditions?.tall),
                // Its entire parent sheet moves during the section handoff.
                // Transform pinning keeps it in that sheet's coordinate system.
                pinType: 'transform',
                scrub: 0.6,
                invalidateOnRefresh: true,
              },
            })
            .to('.lux-journey-circle > span', { opacity: 0, duration: 0.18 }, 0.08)
            // Match the reference's intermediate three-way intersection before
            // all three circles settle into a single shared outline.
            .to(
              '.lux-circle-one',
              {
                x: () => distance() - triangleOffset(),
                y: () => first.clientWidth * 0.12,
                duration: 0.4,
                ease: brandEase,
              },
              0.12,
            )
            .to(
              '.lux-circle-three',
              {
                x: () => -distance() + triangleOffset(),
                y: () => first.clientWidth * 0.12,
                duration: 0.4,
                ease: brandEase,
              },
              0.12,
            )
            .to(
              '.lux-circle-two',
              { y: () => -first.clientWidth * 0.18, duration: 0.4, ease: brandEase },
              0.12,
            )
            .to('.lux-journey-circle', { scale: 0.72, duration: 0.4, ease: brandEase }, 0.12)
            .to('.lux-journey-result', { opacity: 1, duration: 0.2 }, 0.48)
            .to('.lux-circle-one', { x: distance, duration: 0.4, ease: brandEase }, 0.68)
            .to('.lux-circle-three', { x: () => -distance(), duration: 0.4, ease: brandEase }, 0.68)
            .to('.lux-journey-circle', { y: 0, scale: 0.7, duration: 0.4, ease: brandEase }, 0.68)
            .to('.lux-journey > .lux-pill', { autoAlpha: 1, y: 0, duration: 0.2 }, 0.88);
        }
        const ribbon = root.querySelector<HTMLElement>('.lux-service-ribbon');
        const ribbonTrack = root.querySelector<HTMLElement>('.lux-service-ribbon-track');
        if (ribbon && ribbonTrack) {
          let ribbonTravel = 0;
          const restingTop = () =>
            ribbon.getBoundingClientRect().top +
            window.scrollY -
            (services ? Number(gsap.getProperty(services, 'y')) : 0);
          // Follow the ribbon's entire visible passage, not the bars above it.
          // Reuse one weighted tween so motion stays responsive throughout the
          // scroll range instead of easing almost to a stop before it is seen.
          const moveRibbon = gsap.quickTo(ribbonTrack, 'x', { duration: 0.5, ease: brandEase });
          ScrollTrigger.create({
            id: 'lux-service-ribbon',
            trigger: ribbon,
            start: () => {
              ribbonTravel = Math.min(
                ribbonTrack.scrollWidth - ribbon.clientWidth,
                Math.max(ribbon.clientWidth, innerHeight) * 0.9,
              );
              return restingTop() - innerHeight;
            },
            end: () => restingTop() + ribbon.offsetHeight,
            onUpdate: ({ progress }) => moveRibbon(-ribbonTravel * progress),
            onRefresh: ({ progress }) => {
              moveRibbon(-ribbonTravel * progress);
              moveRibbon.tween.progress(1);
            },
          });
        }
        if (context.conditions?.wide)
          gsap.utils.toArray<HTMLElement>('[data-lux-setting-column]').forEach((element, index) => {
            gsap.fromTo(
              element,
              { y: [70, 30, -30, 30, 70][index] },
              {
                y: [-45, 10, 60, 10, -45][index],
                ease: brandEase,
                scrollTrigger: {
                  trigger: '.lux-settings-grid',
                  start: 'top bottom',
                  end: 'bottom top',
                  scrub: 0.8,
                },
              },
            );
          });
        let active = true;
        let initialHashAligned = false;
        const refreshScene = () => {
          ScrollTrigger.refresh();
          if (initialHashAligned) return;
          initialHashAligned = true;
          const id = window.location.hash.slice(1);
          if (!['home-projects', 'home-destinations', 'find-a-home'].includes(id)) return;
          const target = document.getElementById(id);
          if (!target) return;
          // Cards may still have their entrance offset at the first refresh.
          // Anchor against their resting position, not the animated offset.
          const entranceY = Number(gsap.getProperty(target, 'y')) || 0;
          const top =
            target.getBoundingClientRect().top + window.scrollY - entranceY - header() - 24;
          const request = new CustomEvent('aliyas:scroll-to', {
            detail: { top, immediate: true },
            cancelable: true,
          });
          if (window.dispatchEvent(request)) window.scrollTo({ top, behavior: 'instant' });
        };
        let frame = requestAnimationFrame(refreshScene);
        document.fonts.ready.then(() => {
          if (active) {
            cancelAnimationFrame(frame);
            frame = requestAnimationFrame(refreshScene);
          }
        });
        const refreshDetails = () => {
          cancelAnimationFrame(frame);
          frame = requestAnimationFrame(() => ScrollTrigger.refresh());
        };
        root.addEventListener('toggle', refreshDetails, true);
        return () => {
          active = false;
          observer.disconnect();
          serviceFocusCleanups.forEach((cleanup) => cleanup());
          revealTweens.forEach((tween) => tween.kill());
          gsap.set(reveals, { clearProps: 'transform,opacity' });
          cancelAnimationFrame(frame);
          root.removeEventListener('toggle', refreshDetails, true);
        };
      },
      root,
    );
    // Read only while this benefit statement is visible; coalesce all scroll work.
    const tagline = root.querySelector<HTMLElement>('.lux-tagline');
    const words = Array.from(root.querySelectorAll<HTMLElement>('[data-tagline-word]'));
    const reduced = matchMedia('(prefers-reduced-motion: reduce)');
    let wordFrame = 0;
    let revealed = 0;
    const updateWords = () => {
      wordFrame = 0;
      if (!tagline) return;
      if (reduced.matches) {
        words.forEach((word) => word.classList.add('is-active'));
        return;
      }
      const top = tagline.getBoundingClientRect().top;
      const progress = Math.max(0, Math.min(1, (innerHeight * 0.85 - top) / (innerHeight * 0.5)));
      revealed = Math.max(revealed, Math.floor(progress * words.length));
      words.forEach((word, index) => word.classList.toggle('is-active', index < revealed));
    };
    const requestWords = () => {
      if (!wordFrame) wordFrame = requestAnimationFrame(updateWords);
    };
    const wordObserver = new IntersectionObserver((entries) => {
      if (entries.some((entry) => entry.isIntersecting)) {
        window.addEventListener('scroll', requestWords, { passive: true });
        requestWords();
      } else window.removeEventListener('scroll', requestWords);
    });
    if (tagline) {
      tagline.classList.add('is-ready');
      wordObserver.observe(tagline);
    }
    reduced.addEventListener('change', requestWords);
    requestWords();
    return () => {
      wordObserver.disconnect();
      window.removeEventListener('scroll', requestWords);
      reduced.removeEventListener('change', requestWords);
      cancelAnimationFrame(wordFrame);
      tagline?.classList.remove('is-ready');
      words.forEach((word) => word.classList.remove('is-active'));
      media.revert();
    };
  }, []);
  return null;
}
