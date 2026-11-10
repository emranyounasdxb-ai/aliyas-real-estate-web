import Image from 'next/image';
import { ArrowUpRight } from 'lucide-react';
import type { ProjectLocationData } from '@/lib/project-enhancement-types';
import { projectMediaNote } from '@/lib/project-media-copy';
import './project-location.css';

export function ProjectLocation({
  data,
  projectName,
}: {
  data: ProjectLocationData;
  projectName: string;
}) {
  const { pin, map, travel } = data;
  const road = projectMediaNote(data.road);
  const coordinates = pin ? `${pin.latitude},${pin.longitude}` : null;
  const directions = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(coordinates || `${projectName}, ${data.community}`)}`;
  const embed = pin
    ? `https://www.openstreetmap.org/export/embed.html?bbox=${pin.longitude - 0.07}%2C${pin.latitude - 0.045}%2C${pin.longitude + 0.07}%2C${pin.latitude + 0.045}&layer=mapnik&marker=${coordinates}`
    : null;
  return (
    <div className="pd-project-location">
      <div className="pl-intro">
        <div>
          <h3>{data.community}</h3>
          {road && <p>{road}</p>}
        </div>
        <a className="pl-link" href={directions} target="_blank" rel="noopener noreferrer">
          Get directions <ArrowUpRight size={16} aria-hidden="true" />
        </a>
      </div>
      {map && (
        <figure className="pl-map">
          <a
            href={map.src}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`View the full regional connectivity map for ${projectName}`}
          >
            <Image
              src={map.src}
              alt={map.alt || `Developer regional map locating ${data.community}`}
              width={map.width}
              height={map.height}
              sizes="(max-width: 900px) 90vw, 60vw"
              quality={85}
            />
          </a>
          <figcaption>
            {projectMediaNote(map.caption) || `${data.community} location map`}
          </figcaption>
        </figure>
      )}
      {embed && (
        <details className="pl-interactive">
          <summary>Explore interactive map</summary>
          <iframe
            title={`${projectName} location on OpenStreetMap`}
            src={embed}
            loading="lazy"
            referrerPolicy="no-referrer"
          />
          <p>{projectMediaNote(pin?.scope) || `${data.community} location`}</p>
        </details>
      )}
      {travel.destinations.length > 0 && (
        <>
          <div className="pl-travel-heading">
            <h3>Nearby destinations</h3>
            <p>{data.travelHeading || `Approximate travel times from ${data.community}`}</p>
          </div>
          <ul className="pl-destinations">
            {travel.destinations.map((destination) => (
              <li key={destination.name}>
                <span className="pl-time">
                  {destination.timeQualifier && <small>{destination.timeQualifier}</small>}
                  {destination.maxMinutes === undefined
                    ? destination.minutes
                    : `${destination.minutes}–${destination.maxMinutes}`}
                  <small>min</small>
                </span>
                <span>
                  {destination.name}
                  {destination.distanceKm !== undefined && (
                    <small className="pl-distance">{destination.distanceKm} km</small>
                  )}
                </span>
              </li>
            ))}
          </ul>
        </>
      )}
      <p className="pl-note">
        {projectMediaNote(data.travelNote) || 'Travel times vary with traffic and route.'}
      </p>
      <p className="pl-sources">
        {travel.sourceUrl && (
          <a
            href={`${travel.sourceUrl}${travel.page ? `#page=${travel.page}` : ''}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            {travel.page ? `Location source · page ${travel.page}` : 'Location source'}{' '}
            <ArrowUpRight size={14} aria-hidden="true" />
          </a>
        )}
        {pin && (
          <a href={pin.sourceUrl} target="_blank" rel="noopener noreferrer">
            Map source <ArrowUpRight size={14} aria-hidden="true" />
          </a>
        )}
      </p>
    </div>
  );
}
