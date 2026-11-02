import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowDown, ArrowUpRight, MapPin, Plus, Phone, Mail } from '@/components/brand-icons';
import { DeveloperMark } from '@/components/developer-mark';
import { EnquiryTrigger } from '@/components/enquiry-trigger';
import { businessContact } from '@/lib/contact';
import { developers } from '@/lib/developers';
import siteImagery from '@/lib/site-imagery.json';
import { AboutMotion } from './about-motion';
import { AboutBrandCard } from './about-brand-card';
import styles from './about.module.css';

const description =
  'Meet Aliyas Real Estate, a Dubai based company and a project of Aliyas Group. Discover our approach, leadership and network of 30 UAE developers.';

export const metadata: Metadata = {
  title: 'About Aliyas | People, purpose and property',
  description,
  alternates: { canonical: '/about' },
  openGraph: {
    title: 'About Aliyas Real Estate',
    description,
    url: '/about',
    images: [{ url: '/brand/aliyas-gold-logo-hd.webp', alt: 'Aliyas Real Estate' }],
  },
};

// Names and roles from the owner's legacy About page. See docs/about-content.md.
const leadership = [
  { name: 'Sameer Khan', role: 'Managing Director' },
  { name: 'Afshan Fatima', role: 'Business Head' },
  { name: 'Umar Baig', role: 'Sales Manager' },
  { name: 'Yasmina Khalikova', role: 'Sales Manager' },
];
const principles = [
  {
    title: 'Your priorities first.',
    text: 'A home to live in or a property investment. We begin with your plans, preferred location and budget.',
  },
  {
    title: 'Clear information, considered choices.',
    text: 'Understand the developer, community and project details before deciding what belongs on your shortlist.',
  },
  {
    title: 'A relationship beyond the search.',
    text: 'Speak with a team that values trust, transparency and attention to your individual needs.',
  },
];
const questions = [
  {
    question: 'What does Aliyas specialise in?',
    answer:
      'This website focuses on UAE off plan projects. Explore developers and communities, build a shortlist and speak with Aliyas about the options that suit your plans.',
  },
  {
    question: 'Which parts of the UAE do you cover?',
    answer:
      'Our registered developer network spans Dubai, Abu Dhabi, Sharjah, Ras Al Khaimah and Ajman. Individual project locations and availability are confirmed when you enquire.',
  },
  {
    question: 'Can I visit your team in Dubai?',
    answer:
      'Yes. Our office is at Office 218, Business Village, Dubai. Call or message us to arrange a visit and discuss your property requirements.',
  },
  {
    question: 'Are the projects on this website available now?',
    answer:
      'The current collection includes clearly labelled design previews. Contact our team for confirmed project details, pricing, payment plans and availability before making a decision.',
  },
];
const network = developers.slice(0, 6);
const belief = 'A clearer perspective. A more personal property journey.';
const livingDetails = [
  {
    image: siteImagery.coastalBedroom,
    title: 'Light. Space. A sense of calm.',
    text: 'Begin with how you want to feel at home, from the first light of the day to a quiet evening.',
  },
  {
    image: siteImagery.community,
    title: 'Life beyond your front door.',
    text: 'Think about the daily walk, the places nearby and the surroundings you will return to.',
  },
  {
    image: siteImagery.courtyard,
    title: 'Details with character.',
    text: 'Notice the shade, materials and spaces that make an address feel personal.',
  },
];

function LogoDP({ large = false }: { large?: boolean }) {
  return (
    <span className={large ? styles.logoLarge : styles.logoDP}>
      <Image
        src="/brand/aliyas-gold-logo-hd.webp"
        alt="Aliyas Real Estate"
        width={300}
        height={114}
        sizes={large ? '240px' : '64px'}
      />
    </span>
  );
}

export default function AboutPage() {
  return (
    <AboutMotion className={styles.page}>
      <nav className={styles.breadcrumb} aria-label="Breadcrumb">
        <Link href="/">Home</Link>
        <span aria-hidden="true">/</span>
        <span aria-current="page">About Aliyas</span>
      </nav>
      <section className={styles.hero} aria-labelledby="about-title">
        <div className={styles.heroCopy}>
          <p className={styles.eyebrow} data-about-enter>
            Meet Aliyas Real Estate
          </p>
          <h1 id="about-title" data-about-enter>
            <span>Property is personal.</span>
            <span>So is our approach.</span>
          </h1>
          <p className={styles.heroText} data-about-enter>
            Rooted in Dubai. Connected across the UAE. We bring people, places and possibilities
            together through a more considered approach to off plan property.
          </p>
          <div data-about-enter>
            <EnquiryTrigger
              className={styles.primary}
              initialMessage="I would like to speak with Aliyas about my property plans."
            >
              Speak with Aliyas <ArrowUpRight size={20} />
            </EnquiryTrigger>
          </div>
          <p className={styles.groupLine} data-about-enter>
            A project of{' '}
            <a href="https://aliyasgroup.com/" target="_blank" rel="noopener noreferrer">
              Aliyas Group <ArrowUpRight size={14} />
            </a>
          </p>
        </div>
        <AboutBrandCard />
      </section>
      <div className={styles.facts} aria-label="Aliyas at a glance" data-about-reveal>
        <div>
          <strong>{developers.length}</strong>
          <span>Registered developer relationships</span>
        </div>
        <div>
          <strong>Dubai</strong>
          <span>Our home. Your point of connection.</span>
        </div>
        <div>
          <strong>Off plan</strong>
          <span>Our focus across the UAE</span>
        </div>
        <a href="#our-story" aria-label="Discover the Aliyas story">
          <ArrowDown size={22} />
        </a>
      </div>
      <section id="our-story" className={styles.story} aria-labelledby="story-title">
        <div data-about-reveal>
          <p className={styles.eyebrow}>01 / Our story</p>
          <h2 id="story-title">
            Good property decisions
            <br />
            start with people.
          </h2>
          <p className={styles.body}>
            Aliyas Real Estate is a Dubai based company and a project of Aliyas Group. At the heart
            of our business is a simple belief: a lasting relationship matters as much as the
            transaction.
          </p>
          <p className={styles.body}>
            Our approach is built on integrity, transparency and personal attention. On this
            website, that takes shape as a focused way to explore UAE off plan homes, the developers
            behind them and the communities they create.
          </p>
        </div>
        <ol className={styles.principles}>
          {principles.map((item, i) => (
            <li key={item.title} data-about-reveal>
              <span className={styles.stepNumber}>0{i + 1}</span>
              <div>
                <h3>{item.title}</h3>
                <p>{item.text}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>
      <section className={styles.living} aria-labelledby="living-title">
        <div className={styles.sectionHeading} data-about-reveal>
          <div>
            <p className={styles.eyebrow}>The way you want to live</p>
            <h2 id="living-title">More than an address.</h2>
          </div>
          <p className={styles.body}>
            The right questions begin with everyday life. These are some of the details we invite
            you to consider.
          </p>
        </div>
        <div className={styles.livingGrid}>
          {livingDetails.map((detail) => (
            <figure key={detail.title} data-about-reveal>
              <div className={styles.livingImage}>
                <Image
                  src={detail.image.src}
                  alt={detail.image.alt}
                  fill
                  quality={85}
                  sizes="(max-width:767px) calc(100vw - 48px), 30vw"
                />
              </div>
              <figcaption>
                <h3>{detail.title}</h3>
                <p>{detail.text}</p>
              </figcaption>
            </figure>
          ))}
        </div>
        <p className={styles.imageNote}>Illustrative lifestyle imagery, for inspiration.</p>
      </section>
      <section className={styles.purpose} aria-labelledby="purpose-title">
        <p className={styles.eyebrow}>02 / What guides us</p>
        <h2 id="purpose-title" className={styles.belief} data-about-belief aria-label={belief}>
          <span aria-hidden="true">
            {belief.split(' ').map((word, i) => (
              <span data-about-word key={i}>
                {word}{' '}
              </span>
            ))}
          </span>
        </h2>
        <div className={styles.purposeGrid}>
          <article data-about-reveal>
            <span className={styles.purposeLabel}>Our mission</span>
            <h3>Confidence at every step.</h3>
            <p>
              To help our clients achieve their property goals through attentive service, clear
              communication and relationships built on trust, transparency and mutual respect.
            </p>
          </article>
          <article data-about-reveal>
            <span className={styles.purposeLabel}>Our vision</span>
            <h3>Value that lasts.</h3>
            <p>
              To become a leading real estate company in the region, recognised for putting clients
              first, acting ethically and creating long term value through expertise and innovation.
            </p>
          </article>
        </div>
      </section>
      <section className={styles.network} aria-labelledby="network-title">
        <div className={styles.sectionHeading} data-about-reveal>
          <div>
            <p className={styles.eyebrow}>03 / Connected across the UAE</p>
            <h2 id="network-title">
              One team.
              <br />A wider perspective.
            </h2>
          </div>
          <div>
            <p className={styles.body}>
              Aliyas is registered with {developers.length} developers across the UAE. Get to know
              the names behind the communities, then explore the projects that interest you.
            </p>
            <Link className={styles.textLink} href="/developers">
              Meet all {developers.length} developers <ArrowUpRight size={20} />
            </Link>
          </div>
        </div>
        <div className={styles.logoGrid}>
          {network.map((developer) => (
            <Link
              key={developer.slug}
              href={'/developers/' + developer.slug}
              className={styles.developer}
              data-about-reveal
              aria-label={'Explore ' + developer.name}
            >
              <DeveloperMark slug={developer.slug} name={developer.name} variant="directory" />
              <span>
                {developer.name}
                <ArrowUpRight size={16} />
              </span>
            </Link>
          ))}
        </div>
        <div className={styles.markets} aria-label="Developer network markets">
          <MapPin size={18} />
          <span>Dubai</span>
          <span>Abu Dhabi</span>
          <span>Sharjah</span>
          <span>Ras Al Khaimah</span>
          <span>Ajman</span>
        </div>
      </section>
      <section className={styles.leadership} aria-labelledby="leadership-title">
        <div className={styles.sectionHeading} data-about-reveal>
          <div>
            <p className={styles.eyebrow}>04 / Our leadership</p>
            <h2 id="leadership-title">
              The people behind
              <br />
              the perspective.
            </h2>
          </div>
          <p className={styles.body}>
            Our leadership brings the company’s commitment to relationships, personal service and
            care into every client conversation.
          </p>
        </div>
        <div className={styles.ceo} data-about-reveal>
          <div className={styles.ceoIdentity}>
            <LogoDP />
            <div>
              <h3>Umed Khan</h3>
              <span>Chief Executive Officer</span>
            </div>
          </div>
          <div>
            <p className={styles.eyebrow}>A message from our CEO</p>
            <blockquote>
              “We’re not just about transactions—we’re about building lasting relationships.”
            </blockquote>
            <p>
              Our commitment starts with integrity and transparency. Understanding your individual
              needs shapes the way we support your property journey.
            </p>
          </div>
        </div>
        <div className={styles.team}>
          {leadership.map((person) => (
            <article key={person.name} data-about-reveal>
              <LogoDP />
              <div>
                <h3>{person.name}</h3>
                <p>{person.role}</p>
              </div>
            </article>
          ))}
        </div>
      </section>
      <section className={styles.visit} aria-labelledby="visit-title">
        <div className={styles.contact} data-about-reveal>
          <p className={styles.eyebrow}>05 / Start a conversation</p>
          <h2 id="visit-title">
            Your next chapter
            <br />
            starts here.
          </h2>
          <p className={styles.body}>
            Tell us what you have in mind. Speak with our team or arrange a visit to our Dubai
            office.
          </p>
          <EnquiryTrigger
            className={styles.primary}
            initialMessage="I would like to discuss my property plans and arrange a conversation with Aliyas."
          >
            Speak with Aliyas <ArrowUpRight size={20} />
          </EnquiryTrigger>
          <address className={styles.contactDetails}>
            <a href={businessContact.mapUrl} target="_blank" rel="noopener noreferrer">
              <MapPin size={20} />
              <span>
                Office 218, Business Village, Dubai
                <small>
                  Get directions <ArrowUpRight size={14} />
                </small>
              </span>
            </a>
            <a href={'tel:' + businessContact.phone}>
              <Phone size={20} />
              <span>{businessContact.phoneLabel}</span>
            </a>
            <a href={'mailto:' + businessContact.email}>
              <Mail size={20} />
              <span>{businessContact.email}</span>
            </a>
          </address>
          <a
            className={styles.textLink}
            href={businessContact.whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
          >
            Connect on WhatsApp <ArrowUpRight size={18} />
          </a>
        </div>
        <div className={styles.faq} data-about-reveal>
          <p className={styles.eyebrow}>A few things to know</p>
          <h3>Before we meet.</h3>
          {questions.map((item) => (
            <details key={item.question}>
              <summary>
                {item.question}
                <Plus size={20} />
              </summary>
              <p>{item.answer}</p>
            </details>
          ))}
        </div>
      </section>
    </AboutMotion>
  );
}
