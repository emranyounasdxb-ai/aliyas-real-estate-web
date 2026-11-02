'use client';

import { getArea, locationHref } from '@/lib/locations';

import { useCallback, useEffect, useRef, useState, type FormEvent } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowUpRight, Bookmark, ChevronDown, Menu, Search, X } from '@/components/brand-icons';
import gsap from 'gsap';
import { brandEase } from '@/lib/motion-curve';
import { useGSAP } from '@gsap/react';
import { Brand } from './brand';
import { EnquiryTrigger } from './enquiry-trigger';
import { ThemeToggle } from './theme-toggle';
import { DeveloperMark } from './developer-mark';
import { developers as allDevelopers } from '@/lib/developers';

gsap.registerPlugin(useGSAP);
type Panel = 'projects' | 'developers' | 'search' | 'mobile';
const destinations = [
  { name: 'Dubai', image: '/images/dubai.jpg', description: 'Waterfront. Urban. Iconic.' },
  { name: 'Abu Dhabi', image: '/images/abu-dhabi.jpg', description: 'Culture. Coast. Community.' },
  {
    name: 'Ras Al Khaimah',
    image: '/images/ras-al-khaimah.jpg',
    description: 'Nature. Space. Possibility.',
  },
  { name: 'Ajman', image: '/images/ajman.jpg', description: 'Coastal. Connected. Welcoming.' },
];
const navigationDevelopers = [...allDevelopers].sort((a, b) =>
  a.name.localeCompare(b.name, 'en', { sensitivity: 'base' }),
);
const titles: Record<Panel, string> = {
  projects: 'Find your next address.',
  developers: 'Explore every developer.',
  search: 'What are you looking for?',
  mobile: 'Explore Aliyas.',
};

export function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const previousPathname = useRef(pathname);
  const [panel, setPanel] = useState<Panel | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const headerRef = useRef<HTMLElement>(null);
  const panelRef = useRef<HTMLElement>(null);
  const mobileToggleRef = useRef<HTMLButtonElement>(null);
  const returnFocusRef = useRef<HTMLElement | null>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const focusPanelRef = useRef(false);
  const close = useCallback((restoreFocus = false) => {
    setIsOpen(false);
    if (restoreFocus) returnFocusRef.current?.focus({ preventScroll: true });
  }, []);
  const open = (next: Panel, trigger: HTMLElement) => {
    if (panel === next && isOpen) {
      close();
      return;
    }
    // Nested disclosures return to the persistent mobile toggle on Escape.
    focusPanelRef.current = !trigger.closest('.signature-bar');
    returnFocusRef.current = trigger.closest('.signature-bar') ? trigger : mobileToggleRef.current;
    setPanel(next);
    setIsOpen(true);
  };

  useGSAP(
    () => {
      if (!panel || !panelRef.current) return;
      const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      if (isOpen) {
        gsap.fromTo('.signature-scrim', { opacity: 0 }, { opacity: 1, duration: reduce ? 0 : 0.3 });
        gsap.fromTo(
          panelRef.current,
          { opacity: 0, y: reduce ? 0 : -24 },
          {
            opacity: 1,
            y: 0,
            duration: reduce ? 0.3 : 0.5,
            ease: brandEase,
            clearProps: 'transform,opacity',
          },
        );
        gsap.fromTo(
          '[data-menu-reveal]',
          { opacity: 0, y: reduce ? 0 : 24 },
          {
            opacity: 1,
            y: 0,
            duration: reduce ? 0.3 : 0.5,
            stagger: reduce ? 0 : { each: 0.06, amount: 0.36 },
            delay: reduce ? 0 : 0.1,
            ease: brandEase,
            clearProps: 'transform,opacity',
          },
        );
        if (panel === 'search') searchRef.current?.focus({ preventScroll: true });
        else if (focusPanelRef.current) {
          panelRef.current.querySelector<HTMLElement>('a, button')?.focus({ preventScroll: true });
          focusPanelRef.current = false;
        }
      } else {
        gsap.to('.signature-scrim', { opacity: 0, duration: 0.3, ease: brandEase });
        gsap.to(panelRef.current, {
          opacity: 0,
          y: reduce ? 0 : -8,
          duration: 0.3,
          ease: brandEase,
          onComplete: () => setPanel(null),
        });
      }
    },
    { scope: headerRef, dependencies: [panel, isOpen], revertOnUpdate: true },
  );

  useEffect(() => {
    if (previousPathname.current !== pathname) close();
    previousPathname.current = pathname;
  }, [pathname, close]);
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !document.querySelector('dialog[open]')) {
        event.preventDefault();
        close(true);
      }
    };
    const onHistory = () => close();
    const onEnquiry = (event: Event) => {
      if ((event as CustomEvent<{ open: boolean }>).detail?.open) close();
    };
    const breakpoint = window.matchMedia('(max-width: 1099px)');
    const onBreakpoint = () => close(true);
    const startY = window.scrollY;
    const onScroll = () => {
      if (!breakpoint.matches && Math.abs(window.scrollY - startY) > 16) close();
    };
    window.addEventListener('keydown', onKey);
    window.addEventListener('popstate', onHistory);
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('aliyas:enquiry-visibility', onEnquiry);
    breakpoint.addEventListener('change', onBreakpoint);
    return () => {
      window.removeEventListener('keydown', onKey);
      window.removeEventListener('popstate', onHistory);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('aliyas:enquiry-visibility', onEnquiry);
      breakpoint.removeEventListener('change', onBreakpoint);
    };
  }, [isOpen, close]);
  useEffect(() => {
    if (!isOpen || !window.matchMedia('(max-width: 1099px)').matches) return;
    const root = document.documentElement;
    const previousRoot = root.style.overflow;
    const previousBody = document.body.style.overflow;
    const previousGutter = root.style.scrollbarGutter;
    root.style.scrollbarGutter = 'stable';
    root.style.overflow = 'hidden';
    document.body.style.overflow = 'hidden';
    root.setAttribute('data-navigation-open', '');
    window.dispatchEvent(
      new CustomEvent('aliyas:navigation-visibility', { detail: { open: true } }),
    );
    return () => {
      root.style.overflow = previousRoot;
      document.body.style.overflow = previousBody;
      root.style.scrollbarGutter = previousGutter;
      root.removeAttribute('data-navigation-open');
      window.dispatchEvent(
        new CustomEvent('aliyas:navigation-visibility', { detail: { open: false } }),
      );
    };
  }, [isOpen]);

  const submitSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const query = String(new FormData(event.currentTarget).get('q') || '').trim();
    close();
    router.push(query ? `/projects?${new URLSearchParams({ q: query })}` : '/projects');
  };
  const disclosure = (kind: 'projects' | 'developers') => (
    <button
      type="button"
      className={`signature-nav-trigger ${pathname.startsWith(`/${kind}`) ? 'is-current' : ''}`}
      aria-expanded={isOpen && panel === kind}
      aria-controls="signature-navigation-panel"
      onClick={(event) => open(kind, event.currentTarget)}
      onKeyDown={(event) => {
        if (event.key === 'ArrowDown') {
          event.preventDefault();
          if (panel !== kind || !isOpen) open(kind, event.currentTarget);
          requestAnimationFrame(() =>
            panelRef.current?.querySelector<HTMLElement>('a, button')?.focus(),
          );
        }
      }}
    >
      {kind === 'projects' ? 'Off plan projects' : 'Developers'}{' '}
      <ChevronDown size={13} strokeWidth={1.5} aria-hidden="true" />
    </button>
  );

  return (
    <header
      ref={headerRef}
      className={`site-header signature-header ${pathname === '/' ? 'on-home' : ''}`}
      onClickCapture={(event) => {
        if ((event.target as HTMLElement).closest('a[href]')) close();
      }}
      onBlurCapture={(event) => {
        if (event.relatedTarget && !event.currentTarget.contains(event.relatedTarget as Node))
          close();
      }}
    >
      <div className="signature-bar">
        <div className="signature-utilities">
          <button
            type="button"
            className="signature-icon-button"
            aria-label="Search projects"
            aria-expanded={isOpen && panel === 'search'}
            aria-controls="signature-navigation-panel"
            onClick={(event) => open('search', event.currentTarget)}
          >
            <Search size={23} strokeWidth={1.4} aria-hidden="true" />
          </button>
          <Link
            href="/projects?saved=1"
            className="signature-icon-button signature-saved"
            aria-label="Saved projects"
          >
            <Bookmark size={22} strokeWidth={1.4} aria-hidden="true" />
          </Link>
          <ThemeToggle />
        </div>
        <nav
          className="signature-nav signature-nav-left desktop-nav"
          aria-label="Explore navigation"
        >
          {disclosure('projects')}
          {disclosure('developers')}
        </nav>
        <div className="signature-brand">
          <Brand />
        </div>
        <nav
          className="signature-nav signature-nav-right desktop-nav"
          aria-label="Company navigation"
        >
          <Link href="/journal" aria-current={pathname.startsWith('/journal') ? 'page' : undefined}>
            The Journal
          </Link>
          <Link href="/about" aria-current={pathname.startsWith('/about') ? 'page' : undefined}>
            About Aliyas
          </Link>
        </nav>
        <div className="signature-actions">
          <EnquiryTrigger className="signature-enquire nav-contact">
            Enquire <ArrowUpRight size={18} strokeWidth={1.4} aria-hidden="true" />
          </EnquiryTrigger>
          <button
            ref={mobileToggleRef}
            className="signature-mobile-toggle signature-icon-button"
            type="button"
            aria-label={isOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={isOpen}
            aria-controls="signature-navigation-panel"
            onClick={(event) => (isOpen ? close(true) : open('mobile', event.currentTarget))}
          >
            <span className="signature-menu-lines" aria-hidden="true">
              <span />
              <span />
            </span>
          </button>
        </div>
      </div>
      {panel && (
        <div className="signature-panel-layer" inert={!isOpen} aria-hidden={!isOpen}>
          <button
            className="signature-scrim"
            type="button"
            aria-label="Dismiss navigation"
            tabIndex={-1}
            onClick={() => close(true)}
          />
          <section
            ref={panelRef}
            id="signature-navigation-panel"
            className={`signature-panel ${panel === 'search' ? 'signature-search-panel' : ''}`}
            aria-labelledby="signature-panel-title"
            data-panel={panel}
            data-lenis-prevent
          >
            <div className="signature-panel-inner">
              <div className="signature-panel-heading" data-menu-reveal>
                <div>
                  <p className="signature-eyebrow">
                    {panel === 'projects'
                      ? 'EXPLORE THE UAE'
                      : panel === 'developers'
                        ? `${allDevelopers.length} DEVELOPERS · A–Z`
                        : 'ALIYAS REAL ESTATE'}
                  </p>
                  <h2 id="signature-panel-title">{titles[panel]}</h2>
                </div>
                <div className="signature-panel-actions">
                  {panel === 'projects' && (
                    <Link className="signature-text-link" href="/projects">
                      View all projects <ArrowUpRight size={17} aria-hidden="true" />
                    </Link>
                  )}
                  {panel === 'developers' && (
                    <Link className="signature-text-link" href="/developers">
                      View directory <ArrowUpRight size={17} aria-hidden="true" />
                    </Link>
                  )}
                  <button
                    className="signature-icon-button signature-panel-close"
                    type="button"
                    aria-label="Close navigation"
                    onClick={() => close(true)}
                  >
                    <X size={22} strokeWidth={1.4} aria-hidden="true" />
                  </button>
                </div>
              </div>
              {panel === 'projects' && (
                <div className="signature-city-grid">
                  {destinations.map((destination, index) => (
                    <Link
                      key={destination.name}
                      href={`/projects?${new URLSearchParams({ emirate: destination.name })}`}
                      className="signature-city-card"
                      data-menu-reveal
                    >
                      <div className="signature-city-image">
                        <Image
                          src={destination.image}
                          alt=""
                          fill
                          sizes="(max-width: 600px) 90vw, (max-width: 1099px) 45vw, 31vw"
                        />
                      </div>
                      <div className="signature-city-caption">
                        <span className="signature-index">0{index + 1}</span>
                        <div>
                          <h3>{destination.name}</h3>
                          <p>{destination.description}</p>
                        </div>
                        <ArrowUpRight size={22} strokeWidth={1.3} aria-hidden="true" />
                      </div>
                    </Link>
                  ))}
                </div>
              )}
              {panel === 'developers' && (
                <nav className="signature-developer-grid" aria-label="All developers, A to Z">
                  {navigationDevelopers.map((developer) => (
                    <Link
                      href={`/developers/${developer.slug}`}
                      prefetch={false}
                      aria-label={developer.name}
                      title={developer.name}
                      aria-current={
                        pathname === `/developers/${developer.slug}` ||
                        pathname.startsWith(`/developers/${developer.slug}/`)
                          ? 'page'
                          : undefined
                      }
                      className="signature-developer-card"
                      key={developer.slug}
                      data-menu-reveal
                    >
                      <strong>{developer.name}</strong>
                      <span className="signature-developer-logo" aria-hidden="true">
                        <DeveloperMark
                          slug={developer.slug}
                          name={developer.name}
                          variant="directory"
                          sizes="(min-width: 900px) 80px, 104px"
                        />
                      </span>
                    </Link>
                  ))}
                </nav>
              )}
              {panel === 'search' && (
                <div data-menu-reveal>
                  <form
                    className="signature-search-form"
                    action="/projects"
                    onSubmit={submitSearch}
                    role="search"
                  >
                    <label htmlFor="signature-query">Search projects</label>
                    <div>
                      <Search size={23} strokeWidth={1.4} aria-hidden="true" />
                      <input
                        ref={searchRef}
                        id="signature-query"
                        type="search"
                        name="q"
                        placeholder="Project, developer or location"
                        maxLength={120}
                        autoComplete="off"
                      />
                      <button className="signature-search-submit" type="submit">
                        Search <ArrowUpRight size={18} aria-hidden="true" />
                      </button>
                    </div>
                  </form>
                  <div className="signature-search-hints">
                    <span>Explore by emirate</span>
                    {destinations.map(({ name }) => (
                      <Link key={name} href={`/projects?${new URLSearchParams({ emirate: name })}`}>
                        {name} <ArrowUpRight size={14} aria-hidden="true" />
                      </Link>
                    ))}
                  </div>
                  <div className="signature-search-hints">
                    <span>Explore by area</span>
                    {['dubai-jbr', 'dubai-jlt', 'dubai-marina', 'dubai-south'].map((id) => {
                      const area = getArea(id)!;
                      return (
                        <Link key={id} href={locationHref(area)}>
                          {area.shortName ?? area.name}{' '}
                          <ArrowUpRight size={14} aria-hidden="true" />
                        </Link>
                      );
                    })}
                  </div>
                </div>
              )}
              {panel === 'mobile' && (
                <nav className="signature-mobile-nav" aria-label="Mobile navigation">
                  {disclosure('projects')}
                  {disclosure('developers')}
                  <Link href="/journal">
                    The Journal <ArrowUpRight size={22} aria-hidden="true" />
                  </Link>
                  <Link href="/about">
                    About Aliyas <ArrowUpRight size={22} aria-hidden="true" />
                  </Link>
                  <Link href="/projects?saved=1">
                    Saved projects <Bookmark size={21} aria-hidden="true" />
                  </Link>
                  <Link href="/contact">
                    Talk to an advisor <ArrowUpRight size={22} aria-hidden="true" />
                  </Link>
                </nav>
              )}
              {panel !== 'mobile' && (
                <div className="signature-panel-footer" data-menu-reveal>
                  {panel === 'projects' && (
                    <Link href="/privacy#image-credits" className="signature-photo-credit">
                      Ajman photo: Narimich · CC BY-SA 4.0
                    </Link>
                  )}
                  <Link
                    className="signature-text-link"
                    href={panel === 'developers' ? '/projects' : '/developers'}
                  >
                    {panel === 'developers' ? 'Browse all projects' : 'Browse developers'}{' '}
                    <ArrowUpRight size={16} aria-hidden="true" />
                  </Link>
                  <Link className="signature-text-link" href="/contact">
                    Speak to an advisor <ArrowUpRight size={16} aria-hidden="true" />
                  </Link>
                </div>
              )}
            </div>
          </section>
        </div>
      )}
    </header>
  );
}
