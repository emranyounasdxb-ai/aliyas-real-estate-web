'use client';

import { BrandedSelect } from './branded-select';

import { useEffect, useId, useRef, useState, type FormEvent } from 'react';
import Link from 'next/link';
import { ArrowUpRight, Check } from '@/components/brand-icons';
import { businessContact } from '@/lib/contact';

export function EnquiryForm({
  project = '',
  projectName = '',
  initialMessage = '',
  initialInterest,
}: {
  project?: string;
  projectName?: string;
  initialMessage?: string;
  initialInterest?: 'A new home' | 'An investment' | 'A specific project' | 'Just exploring';
}) {
  const [state, setState] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [error, setError] = useState('');
  const [reference, setReference] = useState('');
  const [delivery, setDelivery] = useState<'accepted' | 'not_configured' | 'failed'>(
    'not_configured',
  );
  const errorId = useId();
  const receiptRef = useRef<HTMLDivElement>(null);
  const receiptHeadingRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    const receipt = receiptRef.current;
    if (state !== 'success' || !receipt) return;
    const panel = receipt.closest<HTMLElement>('.enquiry-drawer-panel');
    if (panel) {
      const header = panel.querySelector<HTMLElement>('.enquiry-drawer-top');
      const boundary = header?.getBoundingClientRect().bottom ?? panel.getBoundingClientRect().top;
      panel.scrollTo({
        top: Math.max(0, panel.scrollTop + receipt.getBoundingClientRect().top - boundary - 20),
        behavior: 'instant',
      });
    } else {
      const header = document.querySelector('.site-header')?.getBoundingClientRect().height || 76;
      const top = Math.max(0, receipt.getBoundingClientRect().top + scrollY - header - 24);
      const request = new CustomEvent('aliyas:scroll-to', {
        cancelable: true,
        detail: { top, immediate: true },
      });
      if (window.dispatchEvent(request)) window.scrollTo({ top, behavior: 'instant' });
    }
    receiptHeadingRef.current?.focus({ preventScroll: true });
  }, [state]);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (state === 'submitting') return;
    const form = new FormData(event.currentTarget);
    setState('submitting');
    setError('');
    try {
      const result = await fetch('/api/enquiries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.get('name'),
          email: form.get('email'),
          phone: form.get('phone'),
          interest: form.get('interest'),
          project,
          message: form.get('message'),
          consent: form.get('consent') === 'on',
          website: form.get('website'),
        }),
      });
      const data = await result.json();
      if (!result.ok || typeof data.reference !== 'string')
        throw new Error(data.error || 'We could not save your enquiry. Please try again.');
      setReference(data.reference);
      setDelivery(
        data.delivery === 'accepted'
          ? 'accepted'
          : data.delivery === 'failed'
            ? 'failed'
            : 'not_configured',
      );
      setState('success');
    } catch (reason) {
      setError(
        reason instanceof Error ? reason.message : 'Please check your connection and try again.',
      );
      setState('error');
    }
  }

  if (state === 'success')
    return (
      <div ref={receiptRef} className="enquiry-success" role="status" aria-live="polite">
        <span className="enquiry-success-icon">
          <Check size={28} aria-hidden="true" />
        </span>
        <p className="info-eyebrow">YOUR ENQUIRY</p>
        <h2 ref={receiptHeadingRef} tabIndex={-1}>
          Thank you for
          <br />
          getting in touch.
        </h2>
        <p>
          {delivery === 'accepted'
            ? 'Your enquiry has been saved and submitted for email delivery. Keep your reference below for your records.'
            : 'Your enquiry has been saved. Keep your reference below for your records.'}
        </p>
        <span className="enquiry-reference">{reference}</span>
        {delivery !== 'accepted' && (
          <p className="enquiry-delivery-note">
            {delivery === 'failed'
              ? 'Your enquiry is saved, but email delivery could not be completed.'
              : 'No email has been sent.'}{' '}
            For a direct response, please call or WhatsApp Aliyas.
          </p>
        )}
        <div className="enquiry-direct-contact">
          <a href={`tel:${businessContact.phone}`}>{businessContact.phoneLabel}</a>
          <a href={businessContact.whatsappUrl} target="_blank" rel="noopener noreferrer">
            WhatsApp Aliyas
          </a>
        </div>
        <Link className="info-button" href="/projects">
          Explore the collection <ArrowUpRight size={17} />
        </Link>
      </div>
    );

  return (
    <form className="enquiry-form" onSubmit={submit}>
      <div className="enquiry-form-header">
        <span className="info-eyebrow">YOUR PROPERTY SEARCH</span>
        <h2>Tell us what you have in mind.</h2>
      </div>
      {(projectName || project) && (
        <p className="enquiry-project">
          Project of interest: <strong>{projectName || project.replaceAll('-', ' ')}</strong>
        </p>
      )}
      <div className="enquiry-row">
        <label>
          Full name <span aria-hidden="true">*</span>
          <input
            autoComplete="name"
            name="name"
            placeholder="Your name"
            minLength={2}
            maxLength={100}
            required
          />
        </label>
        <label>
          Email address <span aria-hidden="true">*</span>
          <input
            autoComplete="email"
            type="email"
            name="email"
            placeholder="you@example.com"
            maxLength={254}
            required
          />
        </label>
      </div>
      <div className="enquiry-row">
        <label>
          Phone <span className="enquiry-optional">(optional)</span>
          <input autoComplete="tel" type="tel" name="phone" placeholder="+971" maxLength={30} />
        </label>
        <label>
          I am looking for <span aria-hidden="true">*</span>
          <BrandedSelect
            name="interest"
            defaultValue={initialInterest ?? (project ? 'A specific project' : 'A new home')}
            required
            aria-label="I am looking for"
            options={[
              { value: 'A new home', label: 'A new home' },
              { value: 'An investment', label: 'An investment' },
              { value: 'A specific project', label: 'A specific project' },
              { value: 'Just exploring', label: 'Just exploring' },
            ]}
          />
        </label>
      </div>
      <label>
        Your message <span aria-hidden="true">*</span>
        <textarea
          name="message"
          placeholder="A favourite neighbourhood, an ideal home, or a question. We’re listening."
          rows={4}
          minLength={10}
          maxLength={2000}
          defaultValue={initialMessage}
          required
        />
      </label>
      <div className="enquiry-trap" aria-hidden="true">
        <label>
          Leave this field empty
          <input name="website" tabIndex={-1} autoComplete="off" />
        </label>
      </div>
      <label className="enquiry-consent">
        <input name="consent" type="checkbox" required />
        <span>
          I agree to the <Link href="/privacy">privacy notice</Link> and consent to my details being
          stored with this enquiry.
        </span>
      </label>
      {error && (
        <p id={errorId} className="enquiry-error" role="alert">
          {error}
        </p>
      )}
      <button
        className="info-button enquiry-submit"
        type="submit"
        disabled={state === 'submitting'}
        aria-describedby={error ? errorId : undefined}
      >
        {state === 'submitting' ? (
          <>
            Saving your enquiry <span className="enquiry-loading-bar" aria-hidden="true" />
          </>
        ) : (
          <>
            Send your enquiry <ArrowUpRight size={18} />
          </>
        )}
      </button>
      <p className="enquiry-preview">
        Prefer a direct conversation? Call{' '}
        <a
          href={`tel:${businessContact.phone}`}
          style={{ textDecoration: 'underline', textUnderlineOffset: '3px' }}
        >
          {businessContact.phoneLabel}
        </a>{' '}
        or{' '}
        <a
          href={businessContact.whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          style={{ textDecoration: 'underline', textUnderlineOffset: '3px' }}
        >
          WhatsApp Aliyas
        </a>
        .
      </p>
    </form>
  );
}
