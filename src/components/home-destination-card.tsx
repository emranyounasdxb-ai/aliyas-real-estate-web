'use client';
import { useState } from 'react';
import Link from 'next/link';
import { ArrowUpRight } from '@/components/brand-icons';
import { DestinationMap } from './destination-map';
const places = ['Dubai', 'Abu Dhabi', 'Ras Al Khaimah', 'Ajman'];
export function HomeDestinationCard() {
  const [selected, setSelected] = useState(0);
  return (
    <article
      className="lux-map-card"
      id="home-destinations"
      data-lux-card
      aria-label="Find your UAE destination"
    >
      <div className="lux-map-title">
        <h3>Find your place.</h3>
        <span>04 DESTINATIONS</span>
      </div>
      <DestinationMap selected={selected} onSelect={setSelected} />
      <div className="lux-map-bottom">
        <p>
          Your next chapter in
          <br />
          <strong>{places[selected]}</strong>
        </p>
        <Link
          href={`/projects?emirate=${encodeURIComponent(places[selected])}`}
          aria-label={`Explore projects in ${places[selected]}`}
        >
          <ArrowUpRight size={24} />
        </Link>
      </div>
    </article>
  );
}
