'use client';

import { useState, useRef, useId } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import { DestinationMap } from './destination-map';

const places = [
  {
    name: 'Dubai',
    image: '/images/dubai.jpg',
    imageAspectRatio: 1200 / 1800,
    caption: 'The energy of a city that moves you.',
    detail: 'Waterfront neighbourhoods, new communities and a skyline that keeps looking forward.',
  },
  {
    name: 'Abu Dhabi',
    image: '/images/abu-dhabi.jpg',
    imageAspectRatio: 1200 / 810,
    caption: 'A little more space. A different pace.',
    detail: 'Island living, cultural destinations and room to build your own everyday rhythm.',
  },
  {
    name: 'Ras Al Khaimah',
    image: '/images/ras-al-khaimah.jpg',
    imageAspectRatio: 1200 / 1800,
    caption: 'Your horizon, a little wider.',
    detail: 'Coastal settings and dramatic landscapes, with nature always close to home.',
  },
  {
    name: 'Ajman',
    image: '/images/ajman.jpg',
    imageAspectRatio: 4000 / 3000,
    caption: 'A coastal outlook. A place of your own.',
    detail:
      'Explore the possibilities in Ajman and speak with Aliyas about your preferred setting.',
  },
];

function destinationImageSizes(aspectRatio: number) {
  // Match the existing stage heights as well as its width when a photo covers the frame.
  return `(max-width:360px) max(90vw, ${Math.ceil(320 * aspectRatio)}px), (max-width:800px) max(90vw, ${Math.ceil(540 * aspectRatio)}px), max(45vw, ${Math.ceil(620 * aspectRatio)}px)`;
}

export function LocationExplorer() {
  const [selected, setSelected] = useState(0);
  const buttons = useRef<(HTMLButtonElement | null)[]>([]);
  const id = useId();
  return (
    <div className="future-locations">
      <div className="future-locations-copy">
        <p className="future-label">02 — FIND YOUR SETTING</p>
        <h2>
          ONE VISION.
          <br />
          <span>MANY HORIZONS.</span>
        </h2>
        <div
          className="future-city-tabs"
          role="tablist"
          aria-label="Explore UAE destinations"
          aria-orientation="vertical"
        >
          {places.map((place, index) => (
            <button
              key={place.name}
              ref={(node) => {
                buttons.current[index] = node;
              }}
              id={`${id}-tab-${index}`}
              type="button"
              role="tab"
              aria-selected={selected === index}
              aria-controls={`${id}-panel-${index}`}
              tabIndex={selected === index ? 0 : -1}
              onClick={() => setSelected(index)}
              onKeyDown={(event) => {
                let next = selected;
                if (event.key === 'ArrowDown') next = (selected + 1) % places.length;
                else if (event.key === 'ArrowUp')
                  next = (selected + places.length - 1) % places.length;
                else if (event.key === 'Home') next = 0;
                else if (event.key === 'End') next = places.length - 1;
                else return;
                event.preventDefault();
                setSelected(next);
                buttons.current[next]?.focus();
              }}
            >
              <span>0{index + 1}</span>
              <strong>{place.name}</strong>
              <ArrowUpRight size={25} strokeWidth={1.25} />
            </button>
          ))}
        </div>
        {places.map((place, index) => (
          <div
            key={place.name}
            id={`${id}-panel-${index}`}
            role="tabpanel"
            aria-labelledby={`${id}-tab-${index}`}
            hidden={selected !== index}
            className="future-city-panel"
          >
            <p>{place.detail}</p>
            <Link
              href={`/projects?emirate=${encodeURIComponent(place.name)}`}
              className="future-text-link"
            >
              Explore {place.name}
              <ArrowUpRight size={18} />
            </Link>
            {place.name === 'Ajman' && (
              <p className="location-photo-credit">
                Photo:{' '}
                <a
                  href="https://commons.wikimedia.org/wiki/File:Ajman_corniche.jpg"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Narimich
                </a>{' '}
                ·{' '}
                <a
                  href="https://creativecommons.org/licenses/by-sa/4.0/"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  CC BY-SA 4.0
                </a>{' '}
                · Cropped for display.
              </p>
            )}
          </div>
        ))}
      </div>
      <div className="destination-stage">
        <div className="future-city-visual" aria-hidden="true">
          {places.map((place, index) => (
            <div
              key={place.name}
              className={`future-city-layer ${selected === index ? 'is-selected' : ''}`}
            >
              <Image
                src={place.image}
                alt=""
                fill
                sizes={destinationImageSizes(place.imageAspectRatio)}
              />
              <span className="future-city-caption">
                <span>0{index + 1} / UAE</span>
                <strong>{place.caption}</strong>
              </span>
            </div>
          ))}
        </div>
        <DestinationMap selected={selected} onSelect={setSelected} />
      </div>
    </div>
  );
}
