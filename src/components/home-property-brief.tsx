'use client';

import { useState } from 'react';
import { ArrowUpRight } from './brand-icons';
import { BrandedSelect } from './branded-select';
import { EnquiryTrigger } from './enquiry-trigger';
import { emirates } from '@/lib/locations';

export function HomePropertyBrief() {
  const [purpose, setPurpose] = useState('A new home');
  const [emirate, setEmirate] = useState('Open to suggestions');
  const [budget, setBudget] = useState('Let’s discuss');
  const message = `I would like a property shortlist from Aliyas.\n\nI am looking for: ${purpose}.\nPreferred emirate: ${emirate}.\nBudget: ${budget}.\n\nPlease contact me to discuss suitable homes and the next steps.`;
  return (
    <div className="hp-brief" aria-labelledby="hp-brief-title">
      <p className="hp-eyebrow">LET’S START WITH YOU</p>
      <h3 id="hp-brief-title">
        A shortlist shaped
        <br />
        around your plans.
      </h3>
      <p>Share a few preferences. The Aliyas team will take it from there.</p>
      <fieldset className="hp-purpose">
        <legend>I’m looking for</legend>
        {[
          { value: 'A new home', label: 'A home to live in' },
          { value: 'An investment', label: 'An investment' },
        ].map((option) => (
          <label key={option.value}>
            <input
              type="radio"
              name="shortlist-purpose"
              value={option.value}
              checked={purpose === option.value}
              onChange={() => setPurpose(option.value)}
            />
            <span>{option.label}</span>
          </label>
        ))}
      </fieldset>
      <label className="hp-brief-field">
        <span>Preferred emirate</span>
        <BrandedSelect
          aria-label="Shortlist emirate"
          value={emirate}
          onValueChange={setEmirate}
          options={['Open to suggestions', ...emirates].map((value) => ({ value, label: value }))}
        />
      </label>
      <label className="hp-brief-field">
        <span>Property budget</span>
        <BrandedSelect
          aria-label="Shortlist budget"
          value={budget}
          onValueChange={setBudget}
          options={[
            'Let’s discuss',
            'Under AED 1M',
            'AED 1M–2M',
            'AED 2M–5M',
            'AED 5M–10M',
            'Above AED 10M',
          ].map((value) => ({ value, label: value }))}
        />
      </label>
      <EnquiryTrigger
        key={message}
        className="hp-button hp-button-dark"
        initialMessage={message}
        initialInterest={purpose === 'An investment' ? 'An investment' : 'A new home'}
      >
        Request my shortlist <ArrowUpRight size={19} aria-hidden="true" />
      </EnquiryTrigger>
      <p className="hp-brief-note">Add your contact details in the next step.</p>
    </div>
  );
}
