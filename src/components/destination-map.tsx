'use client';

import { useEffect, useId, useRef, type CSSProperties } from 'react';
import { MapPin } from './brand-icons';
import { uaeCityPoints, uaeOutline } from '@/lib/uae-map-data';
import './destination-map.css';

const names = ['Dubai', 'Abu Dhabi', 'Ras Al Khaimah', 'Ajman'];
const labels = [
  [310, 145],
  [240, 258],
  [390, 26],
  [520, 175],
];

export function DestinationMap({
  selected,
  onSelect,
}: {
  selected: number;
  onSelect: (index: number) => void;
}) {
  const id = useId().replace(/:/g, '');
  const panel = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const element = panel.current;
    if (!element) return;
    const observer = new IntersectionObserver(([entry]) => {
      element.dataset.visible = String(entry.isIntersecting);
    });
    observer.observe(element);
    const visibility = () => {
      element.dataset.documentVisible = String(!document.hidden);
    };
    visibility();
    document.addEventListener('visibilitychange', visibility);
    return () => {
      observer.disconnect();
      document.removeEventListener('visibilitychange', visibility);
    };
  }, []);

  return (
    <div className="destination-map-panel destination-atlas" ref={panel}>
      <div className="destination-map-heading">
        <span>YOUR UAE, IN VIEW</span>
        <span>04 DESTINATIONS</span>
      </div>
      <div
        className="destination-map atlas-stage"
        role="group"
        aria-label="Choose a UAE destination on the map"
      >
        <div className="atlas-canvas">
          <svg viewBox="0 0 600 420" aria-hidden="true" className="atlas-geography">
            <defs>
              <pattern id={`${id}-grid`} width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M40 0H0V40" fill="none" stroke="#d7bd80" strokeOpacity=".07" />
              </pattern>
              <pattern id={`${id}-terrain`} width="12" height="12" patternUnits="userSpaceOnUse">
                <circle cx="1" cy="1" r=".65" fill="#d7bd80" fillOpacity=".18" />
              </pattern>
            </defs>
            <rect width="600" height="420" fill={`url(#${id}-grid)`} />
            <path d={uaeOutline} className="atlas-land-shadow" transform="translate(0 14)" />
            <path d={uaeOutline} className="atlas-land-edge" transform="translate(0 7)" />
            <path d={uaeOutline} className="atlas-land" />
            <path d={uaeOutline} fill={`url(#${id}-terrain)`} />
            <g className="atlas-compass" transform="translate(55 65)">
              <circle r="19" />
              <path d="M0-13 4 6 0 3-4 6Z" />
              <text y="-29">N</text>
            </g>
            <text x="245" y="318" className="atlas-country" textAnchor="middle">
              UNITED ARAB EMIRATES
            </text>
            <text x="140" y="157" className="atlas-sea" textAnchor="middle">
              ARABIAN GULF
            </text>
            {uaeCityPoints.map(([x, y], index) => (
              <g
                key={names[index]}
                className={`atlas-city${selected === index ? ' is-selected' : ''}`}
              >
                <path
                  d={`M${x},${y} L${labels[index][0]},${labels[index][1]}`}
                  className="atlas-connector"
                />
                <g transform={`translate(${x} ${y})`}>
                  <ellipse className="atlas-pin-shadow" cy="3" rx="12" ry="4" />
                  <circle
                    className="atlas-pulse"
                    r="10"
                    style={{ animationDelay: `${index * -0.7}s` }}
                  />
                  <circle
                    className="atlas-pulse atlas-pulse-echo"
                    r="10"
                    style={{ animationDelay: `${index * -0.7 - 1.6}s` }}
                  />
                  <g className="atlas-pin">
                    <path d="M0 0C-3-4-11-12-11-19a11 11 0 0 1 22 0C11-12 3-4 0 0Z" />
                    <circle cy="-19" r="3.5" />
                  </g>
                </g>
                <text
                  className="atlas-mobile-label"
                  x={labels[index][0]}
                  y={labels[index][1]}
                  textAnchor="middle"
                >
                  {names[index]}
                </text>
              </g>
            ))}
          </svg>
        </div>
        <div className="atlas-destinations">
          {names.map((name, index) => (
            <button
              key={name}
              type="button"
              style={
                {
                  '--city-x': `${labels[index][0] / 6}%`,
                  '--city-y': `${labels[index][1] / 4.2}%`,
                } as CSSProperties
              }
              aria-label={`Show ${name} on map`}
              aria-pressed={selected === index}
              onClick={() => onSelect(index)}
            >
              <MapPin size={16} aria-hidden="true" />
              {name}
            </button>
          ))}
        </div>
      </div>
      <p>Destination guide · Approximate city locations</p>
    </div>
  );
}
