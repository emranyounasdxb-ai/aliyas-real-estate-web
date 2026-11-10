'use client';

import { useRef, useState, type CSSProperties } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, ArrowRight, ArrowUpRight, MoveRight } from 'lucide-react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import type { Developer } from '@/lib/content';
import type { DeveloperHeroSlide } from '@/lib/developer-project-previews';
import { HeartSolid, SealCheck } from '@/components/brand-icons';
import { ResponsiveProjectImage } from '@/components/responsive-project-image';
import { createDeveloperHeartBurst } from '@/lib/developer-heart-burst';
import './developer-hero.css';

gsap.registerPlugin(useGSAP, ScrollTrigger);

const galleryImageSizes =
  '(max-width:767px) 38vw, (max-width:1000px) and (max-height:500px) 38vw, 22vw';

// Emphasize the card at the center, easing down to smaller side cards as it moves away.
const cardScale = (position: number) => 1 / (1 + 0.6 * Math.abs(position));
const desktopCardOffset = (position: number) =>
  Math.sign(position) *
  1.025 *
  ((0.22 / 0.6) * Math.log1p(0.6 * Math.abs(position)) + 0.018 * Math.abs(position));

// Project the filled photo into the frame so its angled edges leave no empty borders.
// The left and right edges share a midpoint, so one homography preserves all four corners.
function photoPerspective(width: number, height: number, position: number, inset: number) {
  const left = position < 0 ? 0 : inset;
  const right = position < 0 ? inset : 0;
  const leftHeight = height - 2 * left;
  const ratio = leftHeight / (height - 2 * right);
  return `matrix3d(${ratio},${(ratio * right - left) / width},0,${(ratio - 1) / width},0,${leftHeight / height},0,0,0,0,1,0,0,${left},0,1)`;
}

// Rounded trapezoids retain the angled side cards around the larger central photo.
function cardShape(width: number, height: number, position: number, inset: number) {
  const points =
    position < 0
      ? [
          [0, 0],
          [width, inset],
          [width, height - inset],
          [0, height],
        ]
      : [
          [0, inset],
          [width, 0],
          [width, height],
          [0, height - inset],
        ];
  const radius = Math.min(11, width * 0.07);
  const corners = points.map((point, index) => {
    const previous = points[(index + 3) % 4];
    const next = points[(index + 1) % 4];
    const toward = (target: number[]) => {
      const length = Math.hypot(target[0] - point[0], target[1] - point[1]);
      return point.map((value, axis) => value + ((target[axis] - value) * radius) / length);
    };
    return { point, before: toward(previous), after: toward(next) };
  });
  return `path("M${corners[0].before.join(',')} ${corners.map(({ point, before, after }, index) => `${index ? `L${before.join(',')}` : ''}Q${point.join(',')} ${after.join(',')}`).join(' ')}Z")`;
}

export function DeveloperHero({
  developer,
  projects,
}: {
  developer: Pick<Developer, 'slug' | 'name' | 'tagline' | 'website'>;
  projects: DeveloperHeroSlide[];
}) {
  const root = useRef<HTMLElement>(null);
  const gallery = useRef<HTMLDivElement>(null);
  const hearts = useRef<HTMLDivElement>(null);
  const progressBar = useRef<HTMLSpanElement>(null);
  const move = useRef<((direction: number) => void) | null>(null);
  const gesture = useRef<{ x: number; y: number } | null>(null);
  const blockPointerClickUntil = useRef(0);
  const [windowStart, setWindowStart] = useState(0);
  const [visibleCount, setVisibleCount] = useState(7);
  const [pinned, setPinned] = useState(false);
  const [ready, setReady] = useState(false);
  const count = projects.length;
  const hasInspiration = projects.some((project) => project.kind === 'inspiration');

  useGSAP(
    () => {
      const element = root.current!;
      const viewport = gallery.current!;
      const cards = Array.from(element.querySelectorAll<HTMLElement>('.developer-hero-card'));
      const media = gsap.matchMedia();
      media.add(
        {
          all: '(min-width:0px)',
          wide: '(min-width:768px) and (min-height:501px), (min-width:1001px)',
          reduce: '(prefers-reduced-motion:reduce)',
        },
        (context) => {
          const { wide, reduce } = context.conditions!;
          const visible = Math.min(count, wide ? 7 : 3);
          const half = (visible - 1) / 2;
          const maximum = Math.max(0, count - visible);
          const shouldPin = !!wide && !reduce && maximum > 0;
          const frameScale = 1.25;
          viewport.style.setProperty('--gallery-photo-scale', String(frameScale));
          const phase = { value: 0 };
          const heartBurst = createDeveloperHeartBurst(element, hearts.current!, !!reduce);
          const projectCards = cards.filter((card) =>
            card.classList.contains('developer-hero-card'),
          );
          let selected = 0;
          let lastStart = -1;
          let seek: gsap.core.Tween | null = null;
          let movement: gsap.core.Tween | null = null;
          let viewportWidth = 0;
          let photoHeight = 0;
          setVisibleCount(visible);
          setPinned(shouldPin);
          element.classList.toggle('is-scroll-pinned', shouldPin);
          const measure = () => {
            viewportWidth = viewport.clientWidth;
            const headerHeight = parseFloat(
              getComputedStyle(document.documentElement).getPropertyValue('--header-height'),
            );
            const idealHeight = viewportWidth * (wide ? 0.22 : 0.38) * (3 / 4);
            const outerHeight = (node: HTMLElement) => {
              const style = getComputedStyle(node);
              return (
                node.getBoundingClientRect().height +
                parseFloat(style.marginTop) +
                parseFloat(style.marginBottom)
              );
            };
            const rootStyle = getComputedStyle(element);
            const galleryStyle = getComputedStyle(viewport);
            const fixedHeight =
              outerHeight(element.querySelector<HTMLElement>('.developer-hero-intro')!) +
              outerHeight(element.querySelector<HTMLElement>('.developer-hero-controls')!) +
              parseFloat(rootStyle.paddingTop) +
              parseFloat(rootStyle.paddingBottom) +
              parseFloat(galleryStyle.marginTop) +
              parseFloat(galleryStyle.getPropertyValue('--gallery-extra'));
            const available = innerHeight - headerHeight - 24;
            // Fit the whole pinned scene, including its heading, on short laptops and phones.
            photoHeight = !shouldPin
              ? Math.min(idealHeight, !wide && innerHeight <= 500 ? 100 : Infinity)
              : Math.max(16, Math.min(idealHeight, (available - fixedHeight) / frameScale));
            viewport.style.setProperty('--photo-height', `${photoHeight}px`);
          };
          const draw = () => {
            const requestedSpread = wide ? Math.min(1.5, 7 / visible) : visible < 3 ? 1.25 : 1;
            const outerEdge =
              (wide ? desktopCardOffset(half) : 0.34 * half) +
              ((wide ? 0.22 : 0.38) * cardScale(half)) / 2;
            // A short collection may grow, but its outer photos and caption focus rings
            // must still fit inside the gallery. Full seven/three-card windows stay unchanged.
            const spread =
              visible > 0 && visible < (wide ? 7 : 3)
                ? Math.min(requestedSpread, (0.5 - 12 / viewportWidth) / outerEdge)
                : requestedSpread;
            cards.forEach((card) => {
              const index = Number(card.dataset.galleryIndex);
              const position = index - half - phase.value;
              const distance = Math.abs(position);
              card.style.setProperty('--position', String(position));
              // Large catalogues only reshape cards close enough to enter the strip.
              // Hidden records remain in the DOM with their owned name and URL.
              if (distance >= half + 1 && card.style.visibility === 'hidden') return;
              const depth = Math.min(1.33, distance / Math.max(1, half));
              const scale = cardScale(position);
              const width = (wide ? 0.22 : 0.38) * scale * spread;
              const x = wide ? desktopCardOffset(position) * spread : 0.34 * position * spread;
              const y = -photoHeight * (wide ? 0.5 : 0.28) * Math.min(1, depth) ** 2;
              const height = photoHeight * scale;
              const shapePosition = (position / Math.max(1, half)) * 3;
              const inset = height * Math.min(0.17, Math.abs(shapePosition) * 0.055);
              // The caption shares the photo's lower edge, including its live slope.
              // Keeping both in this draw pass prevents the name/badge lagging behind the card.
              card.style.setProperty('--card-caption-offset', `${(height - inset) / 2}px`);
              card.style.setProperty(
                '--card-caption-angle',
                `${Math.atan2(Math.sign(shapePosition) * inset, width * viewportWidth)}rad`,
              );
              card.style.setProperty('--depth', String(depth));
              card.style.setProperty('--card-width', `${width * 100}%`);
              card.style.setProperty('--card-x', `${x * viewportWidth}px`);
              card.style.setProperty('--card-y', `${y}px`);
              card.style.setProperty('--card-height', `${height}px`);
              card.style.setProperty(
                '--card-photo-transform',
                photoPerspective(width * viewportWidth, height, shapePosition, inset),
              );
              card.style.setProperty(
                '--card-clip',
                cardShape(width * viewportWidth, height, shapePosition, inset),
              );
              card.style.zIndex = String(Math.round(20 - distance));
              // Keep entering/leaving photos until their frame has cleared the viewport.
              // Only the current seven (three on mobile) belong to the keyboard window.
              card.style.visibility = distance < half + 1 ? 'visible' : 'hidden';
              card.setAttribute('aria-hidden', distance >= visible / 2 ? 'true' : 'false');
              const projectLink = card.querySelector<HTMLAnchorElement>(
                '.developer-hero-card-link',
              );
              if (projectLink) projectLink.tabIndex = distance >= visible / 2 ? -1 : 0;
            });
            const start = Math.max(0, Math.min(maximum, Math.round(phase.value)));
            if (start !== lastStart) {
              lastStart = start;
              setWindowStart(start);
            }
            if (progressBar.current)
              progressBar.current.style.transform = `scaleX(${maximum ? phase.value / maximum : 1})`;
            const frontIndex = Math.max(0, Math.min(count - 1, Math.round(phase.value + half)));
            heartBurst.update(phase.value, projectCards[frontIndex], frontIndex, !!wide);
          };
          measure();
          draw();
          const select = (value: number) => {
            const next = Math.max(0, Math.min(maximum, value));
            selected = next;
            const trigger = movement?.scrollTrigger;
            if (trigger) {
              const top =
                trigger.start + (trigger.end - trigger.start) * (maximum ? next / maximum : 0);
              window.scrollTo({ top, behavior: 'instant' });
              window.dispatchEvent(new CustomEvent('aliyas:scroll-to', { detail: { top } }));
              ScrollTrigger.update();
              trigger.getTween()?.progress(1);
            } else {
              seek?.kill();
              seek = gsap.to(phase, {
                value: next,
                duration: reduce ? 0 : 0.5,
                ease: 'power3.inOut',
                onUpdate: draw,
              });
            }
          };
          move.current = (direction) =>
            select((seek?.isActive() ? selected : Math.round(phase.value)) + direction);
          setReady(true);
          if (shouldPin) {
            movement = gsap.to(phase, {
              value: maximum,
              ease: 'none',
              onUpdate: draw,
              scrollTrigger: {
                id: 'developer-projects',
                trigger: element,
                start: () =>
                  `top ${parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--header-height')) + 12}px`,
                end: () =>
                  `+=${Math.max(960, maximum * Math.max(120, Math.min(220, viewport.clientWidth / visible)))}`,
                pin: true,
                pinSpacing: true,
                scrub: ScrollTrigger.isTouch ? true : 0.65,
                anticipatePin: 1,
                invalidateOnRefresh: true,
                onRefreshInit: () => {
                  measure();
                  draw();
                },
                onRefresh: draw,
              },
            });
          }
          const resize = () => {
            measure();
            draw();
          };
          window.addEventListener('resize', resize);
          let active = true;
          document.fonts.ready.then(() => {
            if (active) ScrollTrigger.refresh();
          });
          return () => {
            active = false;
            seek?.kill();
            heartBurst.destroy();
            window.removeEventListener('resize', resize);
            element.classList.remove('is-scroll-pinned');
            move.current = null;
          };
        },
      );
      return () => media.revert();
    },
    { scope: root, dependencies: [developer.slug, projects], revertOnUpdate: true },
  );

  return (
    <section
      className={`developer-hero${hasInspiration ? ' has-inspiration' : ''}`}
      ref={root}
      aria-labelledby="developer-hero-title"
    >
      <Link className="developer-hero-back" href="/developers">
        <ArrowLeft size={15} aria-hidden="true" />
        All developers
      </Link>
      <div className="developer-hero-intro">
        <p className="developer-hero-eyebrow">BEHIND THE ADDRESSES</p>
        <h1 id="developer-hero-title">
          Discover projects
          <br />
          by {developer.name}.
        </h1>
        <p className="developer-hero-tagline">{developer.tagline}</p>
        <Link
          className="developer-hero-projects"
          href={`/developers/${developer.slug}#developer-projects`}
        >
          See more projects{' '}
          <span>
            <ArrowRight size={14} aria-hidden="true" />
          </span>
        </Link>
      </div>
      <div
        className="developer-hero-gallery"
        ref={gallery}
        role="region"
        aria-roledescription="carousel"
        aria-label={`${developer.name} projects${hasInspiration ? ' and architectural inspiration' : ''}`}
        tabIndex={0}
        onKeyDown={(event) => {
          if (event.target !== event.currentTarget) return;
          if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
            event.preventDefault();
            move.current?.(event.key === 'ArrowLeft' ? -1 : 1);
          }
        }}
        onPointerDown={(event) => {
          blockPointerClickUntil.current = 0;
          if (event.pointerType === 'touch')
            gesture.current = { x: event.clientX, y: event.clientY };
        }}
        onPointerCancel={() => {
          gesture.current = null;
        }}
        onPointerUp={(event) => {
          const start = gesture.current;
          gesture.current = null;
          if (!start) return;
          const dx = event.clientX - start.x;
          const dy = event.clientY - start.y;
          if (Math.abs(dx) > 45 && Math.abs(dx) > Math.abs(dy) * 1.3) {
            blockPointerClickUntil.current = Date.now() + 500;
            event.preventDefault();
            move.current?.(dx > 0 ? -1 : 1);
          }
        }}
        onClickCapture={(event) => {
          if (event.detail > 0 && Date.now() < blockPointerClickUntil.current) {
            event.preventDefault();
            event.stopPropagation();
          }
        }}
      >
        {projects.map((project, index) => (
          <div
            key={project.id}
            className="developer-hero-card"
            role="group"
            aria-roledescription="slide"
            aria-label={`${project.kind === 'project' ? project.title : 'Architectural inspiration'}, slide ${index + 1} of ${count}`}
            data-project-id={project.kind === 'project' ? project.id : undefined}
            data-slide-id={project.id}
            data-slide-kind={project.kind}
            data-gallery-index={index}
            data-developer={project.developerSlug}
            aria-hidden={index >= 7}
            style={
              {
                '--position': index - 3,
                '--depth': Math.min(1, Math.abs(index - 3) / 3),
                '--card-width': `${0.22 * cardScale(index - 3) * 100}%`,
                '--card-x': `${(desktopCardOffset(index - 3) * 100).toFixed(5)}cqw`,
                '--card-y': `calc(var(--photo-height) * ${-0.5 * Math.min(1, Math.abs(index - 3) / 3) ** 2})`,
                '--card-height': `calc(var(--photo-height) * ${cardScale(index - 3)})`,
                visibility: index < 7 ? 'visible' : 'hidden',
              } as CSSProperties
            }
          >
            {project.kind === 'project' ? (
              <Link
                href={project.href}
                className="developer-hero-card-link"
                aria-label={`Explore ${project.title}`}
                tabIndex={index < 7 ? 0 : -1}
                prefetch={false}
              >
                <div className="developer-hero-photo">
                  <ResponsiveProjectImage
                    src={project.image}
                    responsiveWidth={project.imageResponsiveWidth}
                    alt=""
                    fill
                    sizes={galleryImageSizes}
                    quality={85}
                    loading={index < 7 ? 'eager' : 'lazy'}
                    draggable={false}
                  />
                </div>
                <div className="developer-hero-card-caption">
                  <strong>{project.title}</strong>
                  {project.nameVerified && (
                    <SealCheck className="developer-hero-card-badge" aria-hidden="true" />
                  )}
                </div>
              </Link>
            ) : (
              <div className="developer-hero-photo">
                <Image
                  src={project.image}
                  alt={project.alt}
                  fill
                  sizes={galleryImageSizes}
                  quality={85}
                  loading={index < 7 ? 'eager' : 'lazy'}
                  draggable={false}
                />
              </div>
            )}
          </div>
        ))}
      </div>
      <div className="developer-hero-hearts" ref={hearts} aria-hidden="true">
        {Array.from({ length: 18 }, (_, index) => (
          <span className="developer-hero-heart" data-heart-particle key={index}>
            <HeartSolid size={24} />
          </span>
        ))}
      </div>
      <div className="developer-hero-controls">
        <div className="developer-hero-note">
          <span>
            {String(windowStart + 1).padStart(2, '0')}—
            {String(Math.min(count, windowStart + visibleCount)).padStart(2, '0')} / {count}
          </span>
        </div>
        {count > visibleCount && (
          <div className="developer-hero-arrows">
            <button
              type="button"
              aria-label={hasInspiration ? 'Previous slides' : 'Previous projects'}
              disabled={!ready || windowStart === 0}
              onClick={() => move.current?.(-1)}
            >
              <ArrowLeft size={18} aria-hidden="true" />
            </button>
            <button
              type="button"
              aria-label={hasInspiration ? 'Next slides' : 'Next projects'}
              disabled={!ready || windowStart >= count - visibleCount}
              onClick={() => move.current?.(1)}
            >
              <ArrowRight size={18} aria-hidden="true" />
            </button>
          </div>
        )}
        <p className="developer-hero-instruction">
          {count <= visibleCount
            ? 'EXPLORE A PROJECT'
            : pinned
              ? 'SCROLL TO EXPLORE'
              : 'SWIPE OR USE ARROWS'}{' '}
          <MoveRight size={18} aria-hidden="true" />
        </p>
      </div>
      <div className="developer-hero-progress">
        <span ref={progressBar} />
      </div>
      <a
        className="developer-hero-website"
        href={developer.website}
        target="_blank"
        rel="noopener noreferrer"
      >
        Visit developer website <ArrowUpRight size={14} aria-hidden="true" />
      </a>
    </section>
  );
}
