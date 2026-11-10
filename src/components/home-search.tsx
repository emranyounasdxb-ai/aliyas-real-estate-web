'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { BrandedSelect } from './branded-select';
import { LocationFields } from './location-fields';
import { ArrowUpRight, ChevronDown, SlidersHorizontal } from '@/components/brand-icons';
import { getArea } from '@/lib/locations';

export function HomeSearch({
  propertyTypes = ['Apartment', 'Villa', 'Townhouse'],
}: {
  propertyTypes?: readonly string[];
}) {
  const router = useRouter();
  const [emirate, setEmirate] = useState('');
  const [area, setArea] = useState('');
  const [type, setType] = useState('');
  const [budget, setBudget] = useState('');
  const [search, setSearch] = useState('');
  const extraCount = Number(Boolean(area)) + Number(Boolean(type));
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
    <form
      className="home-search hp-search-form"
      role="search"
      aria-label="Find a property"
      onSubmit={(event) => {
        event.preventDefault();
        const query = new URLSearchParams();
        if (search.trim()) query.set('q', search.trim());
        if (emirate) query.set('emirate', emirate);
        if (area) query.set('area', area);
        if (type) query.set('type', type);
        if (budget) query.set('budget', budget);
        router.push(`/projects${query.size ? `?${query}` : ''}`);
      }}
    >
      <div className="hp-search-primary">
        <label className="hp-query">
          <span>Project or developer</span>
          <input
            type="search"
            aria-label="Search by project or developer"
            placeholder="Name or developer"
            value={search}
            maxLength={120}
            onChange={(event) => setSearch(event.target.value)}
          />
        </label>
        <LocationFields
          emirate={emirate}
          area={area}
          home
          fields={['emirate']}
          onChange={changeLocation}
        />
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
        <button className="hp-button hp-button-dark" type="submit">
          Explore projects <ArrowUpRight size={18} aria-hidden="true" />
        </button>
      </div>
      <div className="hp-search-options">
        <details className="hp-advanced">
          <summary>
            <SlidersHorizontal size={16} aria-hidden="true" />
            More filters
            {extraCount > 0 && <span className="hp-filter-count">{extraCount} selected</span>}
            <ChevronDown size={14} aria-hidden="true" />
          </summary>
          <div className="hp-search-extra">
            <LocationFields
              emirate={emirate}
              area={area}
              home
              fields={['area']}
              onChange={changeLocation}
            />
            <label>
              <span>Property type</span>
              <BrandedSelect
                aria-label="Choose property type"
                value={type}
                onValueChange={setType}
                options={[
                  { value: '', label: 'Any property' },
                  ...propertyTypes.map((value) => ({ value, label: value })),
                ]}
              />
            </label>
          </div>
        </details>
        {Boolean(search || emirate || area || type || budget) && (
          <button
            className="hp-clear"
            type="button"
            onClick={() => {
              setSearch('');
              setEmirate('');
              setArea('');
              setType('');
              setBudget('');
            }}
          >
            Clear filters
          </button>
        )}
      </div>
    </form>
  );
}
