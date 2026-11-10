import Link from 'next/link';
import { ArrowUpRight } from '@/components/brand-icons';
import { EnquiryTrigger } from '@/components/enquiry-trigger';
import { HomeJourneyStrip } from '@/components/home-journey-strip';
import { ResponsiveStaticImage } from '@/components/responsive-project-image';
import { businessContact } from '@/lib/contact';
import media from '@/lib/home-reference-media.json';

const steps = [
  {
    title: 'Discover',
    description: 'Explore homes in the places you love.',
    image: media.discover,
    alt: 'Contemporary Cassia villa at The Wilds, developer render',
    href: '/projects',
  },
  {
    title: 'Shortlist',
    description: 'Keep the spaces that fit the way you live.',
    image: media.shortlist,
    alt: 'Open kitchen and dining space at The Wilds, developer render',
    href: '/projects?saved=1',
  },
  {
    title: 'Compare',
    description: 'Review layouts, prices and payment plans.',
    image: media.compare,
    alt: 'A home floor plan being reviewed on a tablet',
    href: '/projects/compare',
  },
  {
    title: 'Plan',
    description: 'Talk through your budget and buying costs.',
    image: media.plan,
    alt: 'Property paperwork and keys beside an apartment window',
    message:
      'I would like to discuss my property budget, buying costs and payment options with Aliyas.',
  },
  {
    title: 'Move forward',
    description: 'Take the next step on a home you love.',
    image: media.move,
    alt: 'A home buyer receiving the keys to an apartment',
    message:
      'I have a property in mind and would like to discuss availability and the next steps with Aliyas.',
  },
] as const;

export function HomeBuyingJourney() {
  return (
    <section className="hp-journey" id="your-property-journey" aria-labelledby="hp-journey-title">
      <div className="hp-shell hp-section-head" data-reveal>
        <div>
          <p className="hp-eyebrow">THE WAY TO YOUR NEXT ADDRESS</p>
          <h2 id="hp-journey-title">
            From the first look.
            <br />
            To the next chapter.
          </h2>
        </div>
        <p className="hp-journey-intro">
          A place to begin, room to explore and a personal conversation when you are ready.
        </p>
      </div>
      <HomeJourneyStrip>
        <ol className="hp-journey-panels">
          {steps.map((step, index) => (
            <li
              className="hp-journey-panel"
              key={step.title}
              data-reveal
              data-reveal-delay={index * 0.08}
            >
              <ResponsiveStaticImage
                {...step.image}
                alt={step.alt}
                sizes="(max-width:700px) 86vw, (max-width:1100px) 42vw, 20vw"
              />
              <div className="hp-journey-caption">
                <span className="hp-journey-number">0{index + 1}</span>
                <div className="hp-journey-heading">
                  <h3>{step.title}</h3>
                  {'href' in step ? (
                    <Link href={step.href} prefetch={false} className="hp-journey-action">
                      <span className="hp-visually-hidden">{step.title}</span>
                      <ArrowUpRight size={20} />
                    </Link>
                  ) : (
                    <EnquiryTrigger initialMessage={step.message} className="hp-journey-action">
                      <span className="hp-visually-hidden">{step.title}</span>
                      <ArrowUpRight size={20} />
                    </EnquiryTrigger>
                  )}
                </div>
                <p>{step.description}</p>
              </div>
            </li>
          ))}
        </ol>
      </HomeJourneyStrip>
    </section>
  );
}

export function HomePropertyPlan() {
  return (
    <section className="hp-home-plan" id="plan-your-home" aria-labelledby="hp-home-plan-title">
      <div className="hp-shell hp-home-plan-layout">
        <div className="hp-home-plan-copy" data-reveal>
          <p className="hp-eyebrow">LET’S MAKE ROOM FOR YOUR PLANS</p>
          <h2 id="hp-home-plan-title">
            Your next home.
            <br />
            <span>It starts with a plan.</span>
          </h2>
          <p>
            More space. A new neighbourhood. A place of your own. Tell us what you have in mind, and
            let’s find the homes that fit.
          </p>
          <EnquiryTrigger
            className="hp-button hp-button-gold"
            initialInterest="A new home"
            initialMessage="I would like help planning my next home purchase. Please contact me to discuss my preferred location, budget and the kind of home I have in mind."
          >
            Plan my property search <ArrowUpRight size={20} />
          </EnquiryTrigger>
          <a
            className="hp-home-plan-contact"
            href={businessContact.whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
          >
            Or talk to us on WhatsApp <ArrowUpRight size={16} />
          </a>
        </div>
        <div className="hp-home-plan-art" data-reveal data-reveal-delay="0.16">
          <ResponsiveStaticImage
            {...media.homePlan}
            sizes="(max-width:700px) 100vw, (max-width:1440px) 65vw, 1000px"
            alt="Architectural concept of a contemporary villa rising from a rolled paper plan"
          />
        </div>
      </div>
    </section>
  );
}
