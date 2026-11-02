'use client';

import { useEffect, useId, useRef, useState, type ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import { ArrowUpRight, Mail, Phone, X } from '@/components/brand-icons';
import { EnquiryForm } from '@/components/enquiry-form';
import { businessContact } from '@/lib/contact';
import './info-pages.css';
import './enquiry-drawer.css';

export type EnquiryTriggerProps = {
  projectSlug?: string;
  projectName?: string;
  initialMessage?: string;
  children?: ReactNode;
  className?: string;
};

export function EnquiryTrigger({
  projectSlug,
  projectName,
  initialMessage,
  children,
  className,
}: EnquiryTriggerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [hasOpened, setHasOpened] = useState(false);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const pointerStartedOutside = useRef(false);
  const titleId = useId();
  const dialogId = useId();
  const pathname = usePathname();
  const previousPathname = useRef(pathname);

  useEffect(() => {
    if (previousPathname.current !== pathname) setIsOpen(false);
    previousPathname.current = pathname;
  }, [pathname]);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!isOpen || !dialog) return;
    const root = document.documentElement;
    const body = document.body;
    const previousRootOverflow = root.style.overflow;
    const previousBodyOverflow = body.style.overflow;
    const previousScrollGutter = root.style.scrollbarGutter;
    const previousLenisPrevent = root.getAttribute('data-lenis-prevent');
    root.style.scrollbarGutter = 'stable';
    root.style.overflow = 'hidden';
    body.style.overflow = 'hidden';
    root.setAttribute('data-lenis-prevent', '');
    window.dispatchEvent(new CustomEvent('aliyas:enquiry-visibility', { detail: { open: true } }));
    dialog.showModal();
    dialog.querySelector<HTMLInputElement>('input[name="name"]')?.focus({ preventScroll: true });
    return () => {
      if (dialog.open) dialog.close();
      root.style.overflow = previousRootOverflow;
      body.style.overflow = previousBodyOverflow;
      root.style.scrollbarGutter = previousScrollGutter;
      if (previousLenisPrevent === null) root.removeAttribute('data-lenis-prevent');
      else root.setAttribute('data-lenis-prevent', previousLenisPrevent);
      window.dispatchEvent(
        new CustomEvent('aliyas:enquiry-visibility', { detail: { open: false } }),
      );
      triggerRef.current?.focus({ preventScroll: true });
    };
  }, [isOpen]);

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        className={className || 'enquiry-trigger-button'}
        aria-haspopup="dialog"
        aria-controls={dialogId}
        aria-expanded={isOpen}
        onClick={() => {
          setHasOpened(true);
          setIsOpen(true);
        }}
      >
        {children || (
          <>
            Enquire now <ArrowUpRight size={17} aria-hidden="true" />
          </>
        )}
      </button>
      <dialog
        ref={dialogRef}
        id={dialogId}
        className="enquiry-drawer"
        aria-labelledby={titleId}
        data-lenis-prevent
        onCancel={(event) => {
          event.preventDefault();
          setIsOpen(false);
        }}
        onKeyDown={(event) => {
          if (event.key !== 'Tab') return;
          const focusable = Array.from(
            event.currentTarget.querySelectorAll<HTMLElement>(
              'button:not([disabled]), a[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]',
            ),
          ).filter(
            (element) =>
              element.tabIndex >= 0 &&
              element.getClientRects().length > 0 &&
              !element.closest('[aria-hidden="true"], [hidden]'),
          );
          const first = focusable[0];
          const last = focusable[focusable.length - 1];
          if (event.shiftKey && document.activeElement === first) {
            event.preventDefault();
            last?.focus();
          } else if (!event.shiftKey && document.activeElement === last) {
            event.preventDefault();
            first?.focus();
          }
        }}
        onPointerDown={(event) => {
          pointerStartedOutside.current = event.target === event.currentTarget;
        }}
        onClick={(event) => {
          if (event.target === event.currentTarget && pointerStartedOutside.current)
            setIsOpen(false);
        }}
      >
        {hasOpened && (
          <div
            className="enquiry-drawer-panel"
            data-lenis-prevent
            onClickCapture={(event) => {
              if ((event.target as HTMLElement).closest('a[href]')) setIsOpen(false);
            }}
          >
            <div className="enquiry-drawer-top">
              <span>ALIYAS REAL ESTATE</span>
              <button
                type="button"
                className="enquiry-drawer-close"
                aria-label="Close enquiry"
                onClick={() => setIsOpen(false)}
              >
                <X size={21} strokeWidth={1.5} aria-hidden="true" />
              </button>
            </div>
            <div className="enquiry-drawer-intro">
              <p>YOUR NEXT CHAPTER</p>
              <h2 id={titleId}>
                {projectName ? (
                  <>
                    Enquire about
                    <br />
                    <span>{projectName}</span>
                  </>
                ) : (
                  <>
                    Start a<br />
                    <span>conversation.</span>
                  </>
                )}
              </h2>
              <p>Tell us what matters to you. We’ll help you explore the possibilities.</p>
            </div>
            <EnquiryForm
              project={projectSlug}
              projectName={projectName}
              initialMessage={initialMessage}
            />
            <div className="enquiry-drawer-contact">
              <p>A more personal conversation?</p>
              <a href={`tel:${businessContact.phone}`}>
                <Phone size={15} aria-hidden="true" />
                {businessContact.phoneLabel}
              </a>
              <a href={`mailto:${businessContact.email}`}>
                <Mail size={15} aria-hidden="true" />
                {businessContact.email}
              </a>
            </div>
          </div>
        )}
      </dialog>
    </>
  );
}
