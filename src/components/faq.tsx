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
    'Yes. Select Compare on up to three project cards, then open Compare projects to view locations, developers and available property details side by side. Your selection stays in this browser for your next visit.',
  ],
  [
    'How do I find out more about a project?',
    'Open a project and select “Enquire about this project”, or request a brochure, floor plan or construction update. For a direct conversation about your requirements, call or WhatsApp Aliyas.',
  ],
  [
    'How can I check availability and pricing?',
    'Contact Aliyas with the project and property type you are interested in. Ask for current availability, unit pricing, payment terms and the relevant developer documents before making a reservation.',
  ],
  [
    'Which UAE destinations can I explore?',
    'Browse Dubai, Abu Dhabi, Sharjah, Ras Al Khaimah, Ajman, Fujairah and Umm Al Quwain. Use the location filter to explore projects in each emirate.',
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
