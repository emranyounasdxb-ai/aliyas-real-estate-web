'use client';

import { useLayoutEffect, useRef, useState } from 'react';
import { brandEase } from '@/lib/motion-curve';
import gsap from 'gsap';
import { Plus } from '@/components/brand-icons';

const faqs = [
  [
    'What can I explore with Aliyas?',
    'Our collection focuses exclusively on off plan projects across the UAE. Explore homes by location, developer and property type, save your favourites, compare your options and enquire about a project.',
  ],
  [
    'Can I compare homes in different emirates?',
    'Yes. Select Compare on up to three project cards, then open Compare projects to view prices, locations, bedrooms, developers, indicative handovers and sample payment plans side by side. Your selection stays in this browser for your next visit.',
  ],
  [
    'How do I find out more about a project?',
    'Open a project and select “Enquire about this project”, or request a specific brochure, floor plan or construction update. You can also call or WhatsApp Aliyas directly. In this local preview, form enquiries are saved on the computer hosting the website; email delivery is not configured.',
  ],
  [
    'Are the displayed prices and images final?',
    'This is a preview collection. Prices, handover dates and payment plans are illustrative, and photographs show architectural inspiration. Confirm current availability, official project material and all terms directly before making a decision.',
  ],
  [
    'Which UAE destinations can I explore?',
    'Browse Dubai, Abu Dhabi, Ras Al Khaimah and Ajman. Use the destination map or location filter to explore each collection. Preview cards do not confirm live availability.',
  ],
  [
    'Will my saved homes stay in my shortlist?',
    'Your saved projects stay in this browser. Select Save on a project card to add a home, then open Saved projects in the navigation to return to your shortlist.',
  ],
  [
    'Can I speak directly with the Aliyas team?',
    'Yes. Use the enquiry button, call +971 4 611 3100, or WhatsApp +971 56 915 7576. You can also email info@aliyasrealestate.ae to discuss your requirements.',
  ],
];
function Item({ question, answer }: { question: string; answer: string }) {
  const [open, setOpen] = useState(false);
  const content = useRef<HTMLDivElement>(null);
  const id = question.toLowerCase().replace(/[^a-z]+/g, '-');
  useLayoutEffect(() => {
    if (!content.current) return;
    const tween = open
      ? gsap.fromTo(
          content.current,
          { opacity: 0 },
          { opacity: 1, duration: 0.3, ease: brandEase, clearProps: 'opacity' },
        )
      : null;
    content.current.dispatchEvent(new Event('toggle', { bubbles: true }));
    return () => {
      tween?.kill();
    };
  }, [open]);
  return (
    <div className={`faq-item ${open ? 'is-open' : ''}`}>
      <h3>
        <button onClick={() => setOpen((value) => !value)} aria-expanded={open} aria-controls={id}>
          {question}
          <Plus size={20} />
        </button>
      </h3>
      <div ref={content} id={id} className="faq-answer" hidden={!open}>
        <p>{answer}</p>
      </div>
    </div>
  );
}
export function FAQ() {
  return (
    <div className="faq-list">
      {faqs.map(([question, answer]) => (
        <Item key={question} question={question} answer={answer} />
      ))}
    </div>
  );
}
