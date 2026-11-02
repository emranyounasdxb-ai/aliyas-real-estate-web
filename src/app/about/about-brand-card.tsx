'use client';

import Image from 'next/image';
import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { brandEase } from '@/lib/motion-curve';
import styles from './about.module.css';

export function AboutBrandCard() {
  const card = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const media = gsap.matchMedia();
    media.add(
      '(prefers-reduced-motion: no-preference)',
      () => {
        const node = card.current;
        if (!node) return;
        let visible = false;
        // All lighting is composited artwork: animate only transforms/opacity.
        const motion = gsap.timeline({ paused: true, defaults: { ease: brandEase } });
        const rings = node.querySelectorAll('[data-brand-ring]');
        const rotations = [
          [-35, 145],
          [35, -145],
          [0, 210],
        ];
        rings.forEach((ring, index) => {
          motion.fromTo(
            ring,
            { rotation: rotations[index][0] },
            {
              rotation: rotations[index][1],
              duration: 12 + index * 3,
              repeat: -1,
              yoyo: true,
            },
            0,
          );
        });
        motion.fromTo(
          node.querySelector('[data-brand-logo]'),
          { y: 4, scale: 1 },
          {
            y: -4,
            scale: 1.018,
            duration: 3.6,
            repeat: -1,
            yoyo: true,
          },
          0,
        );

        motion.fromTo(
          node.querySelector('[data-brand-rim]'),
          { rotation: -40 },
          {
            rotation: 320,
            duration: 14,
            repeat: -1,
          },
          0,
        );
        motion.fromTo(
          node.querySelector('[data-brand-aura]'),
          { xPercent: -9, yPercent: -5, opacity: 0.55, scale: 0.9 },
          {
            xPercent: 9,
            yPercent: 6,
            opacity: 0.9,
            scale: 1.08,
            duration: 7,
            repeat: -1,
            yoyo: true,
          },
          0,
        );
        motion.fromTo(
          node.querySelector('[data-brand-beam]'),
          { rotation: -28, opacity: 0.45 },
          {
            rotation: -12,
            opacity: 0.8,
            duration: 9,
            repeat: -1,
            yoyo: true,
          },
          0,
        );
        motion.fromTo(
          node.querySelector('[data-brand-reflection]'),
          { opacity: 0.2, scaleX: 0.96 },
          {
            opacity: 0.32,
            scaleX: 1.02,
            duration: 3.6,
            repeat: -1,
            yoyo: true,
          },
          0,
        );
        const sheen = gsap.timeline({ repeat: -1, repeatDelay: 1.8 });
        sheen
          .fromTo(
            node.querySelector('[data-brand-sheen]'),
            { xPercent: -150, opacity: 0 },
            {
              xPercent: 240,
              duration: 5.2,
              ease: brandEase,
            },
            0,
          )
          .to(
            node.querySelector('[data-brand-sheen]'),
            { opacity: 0.85, duration: 0.7, ease: brandEase },
            0.1,
          )
          .to(
            node.querySelector('[data-brand-sheen]'),
            { opacity: 0, duration: 1.1, ease: brandEase },
            3.5,
          );
        motion.add(sheen, 0);

        const depth = node.querySelector('[data-brand-depth]');
        const light = node.querySelector('[data-brand-follow-light]');
        const tiltX = gsap.quickTo(depth, 'rotationX', { duration: 0.7, ease: brandEase });
        const tiltY = gsap.quickTo(depth, 'rotationY', { duration: 0.7, ease: brandEase });
        const lightX = gsap.quickTo(light, 'xPercent', { duration: 0.8, ease: brandEase });
        const lightY = gsap.quickTo(light, 'yPercent', { duration: 0.8, ease: brandEase });
        const responses = [tiltX, tiltY, lightX, lightY];
        const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)');
        let pointerFrame = 0;
        let pointerX = 0;
        let pointerY = 0;
        const onPointerMove = (event: PointerEvent) => {
          if (!visible || !finePointer.matches || event.pointerType !== 'mouse') return;
          pointerX = event.clientX;
          pointerY = event.clientY;
          if (pointerFrame) return;
          pointerFrame = requestAnimationFrame(() => {
            pointerFrame = 0;
            const bounds = node.getBoundingClientRect();
            const x = Math.max(-1, Math.min(1, ((pointerX - bounds.left) / bounds.width) * 2 - 1));
            const y = Math.max(-1, Math.min(1, ((pointerY - bounds.top) / bounds.height) * 2 - 1));
            tiltX(-y * 7);
            tiltY(x * 9);
            lightX(x * 24);
            lightY(y * 18);
          });
        };
        const onPointerLeave = () => {
          cancelAnimationFrame(pointerFrame);
          pointerFrame = 0;
          responses.forEach((move) => move(0));
        };
        node.addEventListener('pointermove', onPointerMove);
        node.addEventListener('pointerleave', onPointerLeave);

        const sync = () => {
          const playing = visible && !document.hidden;
          motion.paused(!playing);
          responses.forEach((move) => move.tween.paused(!playing));
          if (!playing) {
            cancelAnimationFrame(pointerFrame);
            pointerFrame = 0;
          }
        };
        const observer = new IntersectionObserver(
          ([entry]) => {
            visible = entry.isIntersecting && entry.intersectionRatio >= 0.15;
            sync();
          },
          { threshold: [0, 0.15] },
        );
        observer.observe(node);
        document.addEventListener('visibilitychange', sync);
        return () => {
          observer.disconnect();
          document.removeEventListener('visibilitychange', sync);
          node.removeEventListener('pointermove', onPointerMove);
          node.removeEventListener('pointerleave', onPointerLeave);
          cancelAnimationFrame(pointerFrame);
          // matchMedia reverts every transform created in this callback.
        };
      },
      card,
    );
    return () => media.revert();
  }, []);

  return (
    <div ref={card} className={styles.brandPanel} data-about-enter data-about-brand>
      <div className={styles.brandTop}>
        <span>The Aliyas perspective</span>
        <span>UAE</span>
      </div>
      <div className={styles.brandArt}>
        <div className={styles.brandAura} data-brand-aura aria-hidden="true" />
        <div className={styles.brandBeam} data-brand-beam aria-hidden="true" />
        <div className={styles.brandPool} aria-hidden="true" />
        <div className={styles.brandStage} data-brand-depth>
          <div className={styles.orbit} aria-hidden="true">
            <i data-brand-ring />
            <i data-brand-ring />
            <i data-brand-ring />
          </div>
          <span className={styles.logoLarge} data-brand-logo>
            <span className={styles.medalFace} aria-hidden="true" />
            <span className={styles.medalRim} data-brand-rim aria-hidden="true" />
            <span className={styles.medalLight} data-brand-follow-light aria-hidden="true" />
            <span className={styles.medalSheen} data-brand-sheen aria-hidden="true" />
            <Image
              src="/brand/aliyas-gold-logo-hd.webp"
              alt="Aliyas Real Estate"
              width={300}
              height={114}
              sizes="240px"
            />
          </span>
        </div>
        <div className={styles.brandReflection} data-brand-reflection aria-hidden="true">
          <Image
            src="/brand/aliyas-gold-logo-hd.webp"
            alt=""
            width={300}
            height={114}
            sizes="200px"
          />
        </div>
      </div>
      <div className={styles.brandBottom}>
        <span>
          People at the centre.
          <br />
          Possibility in every place.
        </span>
      </div>
    </div>
  );
}
