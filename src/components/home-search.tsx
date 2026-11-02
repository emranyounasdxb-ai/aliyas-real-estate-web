'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { BrandedSelect } from './branded-select';
import { LocationFields } from './location-fields';
import { ArrowUpRight, Building2, Wallet } from '@/components/brand-icons';
import { getArea, locationHref } from '@/lib/locations';
import './location-filters.css';

export function HomeSearch() {
  const router = useRouter();
  const [emirate, setEmirate] = useState('');
  const [area, setArea] = useState('');
  const [type, setType] = useState('');
  const [budget, setBudget] = useState('');
  function changeLocation(field: 'emirate' | 'area', value: string) {
    if (field === 'emirate') {
      setEmirate(value);
      if (!value || getArea(area)?.emirate !== value) setArea('');
    } else {
      setArea(value);
      if (value) setEmirate(getArea(value)?.emirate ?? '');
    }
  }
  return (
    <div className="home-location-search">
      <form
        className="home-search home-search-locations"
        onSubmit={(event) => {
          event.preventDefault();
          const query = new URLSearchParams();
          if (emirate) query.set('emirate', emirate);
          if (area) query.set('area', area);
          if (type) query.set('type', type);
          if (budget) query.set('budget', budget);
          router.push(`/projects${query.size ? `?${query}` : ''}`);
        }}
      >
        <LocationFields emirate={emirate} area={area} home onChange={changeLocation} />
        <div className="search-field">
          <Building2 size={19} />
          <label>
            <span>Property type</span>
            <BrandedSelect
              aria-label="Choose property type"
              value={type}
              onValueChange={setType}
              options={[
                { value: '', label: 'Any property' },
                { value: 'Apartment', label: 'Apartment' },
                { value: 'Villa', label: 'Villa' },
                { value: 'Townhouse', label: 'Townhouse' },
              ]}
            />
          </label>
        </div>
        <div className="search-field">
          <Wallet size={19} />
          <label>
            <span>Your budget</span>
            <BrandedSelect
              aria-label="Choose budget"
              value={budget}
              onValueChange={setBudget}
              options={[
                { value: '', label: 'Any price' },
                { value: '2000000', label: 'Up to AED 2M' },
                { value: '5000000', label: 'Up to AED 5M' },
                { value: '10000000', label: 'Up to AED 10M' },
              ]}
            />
          </label>
        </div>
        <button className="button button-dark" type="submit">
          Explore projects <ArrowUpRight size={18} />
        </button>
      </form>
      <nav className="home-area-links" aria-label="Explore projects by area">
        <span>Explore by area</span>
        {['dubai-jbr', 'dubai-jlt', 'dubai-marina', 'dubai-south'].map((id) => {
          const place = getArea(id)!;
          return (
            <Link key={id} href={locationHref(place)}>
              {place.shortName ?? place.name}
              <ArrowUpRight size={14} aria-hidden="true" />
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
