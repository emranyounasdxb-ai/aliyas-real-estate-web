'use client';
import { BrandedSelect } from './branded-select';
import { areaLabel, areasForEmirate, emirates, getArea } from '@/lib/locations';

export function LocationFields({
  emirate,
  area,
  onChange,
  home = false,
}: {
  emirate: string;
  area: string;
  onChange: (field: 'emirate' | 'area', value: string) => void;
  home?: boolean;
}) {
  const choices = areasForEmirate(emirate);
  const knownArea = getArea(area);
  return (
    <>
      <label className="location-emirate-field">
        <span>{home ? 'Your emirate' : 'Emirate'}</span>
        <BrandedSelect
          aria-label={home ? 'Choose emirate' : 'Location'}
          value={emirate}
          onValueChange={(value) => onChange('emirate', value)}
          options={[
            { value: '', label: 'All emirates' },
            ...emirates.map((name) => ({ value: name, label: name })),
            ...(emirate && !(emirates as readonly string[]).includes(emirate)
              ? [{ value: emirate, label: 'Unknown emirate' }]
              : []),
          ]}
        />
      </label>
      <label className="location-area-field">
        <span>Area / community</span>
        <BrandedSelect
          aria-label={home ? 'Choose area or community' : 'Area or community'}
          value={area}
          onValueChange={(value) => onChange('area', value)}
          options={[
            { value: '', label: choices.length ? 'All areas' : 'Areas coming soon' },
            ...choices.map((item) => ({
              value: item.id,
              searchTerms: item.aliases,
              label: `${areaLabel(item)}${emirate ? '' : ` · ${item.emirate}`}`,
            })),
            ...(area && !choices.some((item) => item.id === area)
              ? [{ value: area, label: knownArea ? 'Area outside this emirate' : 'Unknown area' }]
              : []),
          ]}
        />
      </label>
    </>
  );
}
