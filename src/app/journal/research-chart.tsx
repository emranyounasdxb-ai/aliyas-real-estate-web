'use client';

import { useEffect, useId, useRef, useState, type ReactNode } from 'react';
import type { ArticleSection } from '@/lib/content';
import styles from './research-chart.module.css';

type Chart = NonNullable<ArticleSection['chart']>;
const number = new Intl.NumberFormat('en-GB', { maximumFractionDigits: 2 });
const compact = new Intl.NumberFormat('en-GB', { notation: 'compact', maximumFractionDigits: 2 });

// Equal intervals and a true zero baseline; never magnify a small difference.
function chartScale(values: Chart['values']) {
  const maximum = Math.max(1, ...values.map((item) => item.value));
  const roughStep = maximum / 4;
  const power = 10 ** Math.floor(Math.log10(roughStep));
  const factor = [1, 1.25, 2, 2.5, 5, 10].find((value) => value * power >= roughStep) ?? 10;
  return factor * power * 4;
}

export function ResearchChart({ chart, children }: { chart: Chart; children: ReactNode }) {
  const id = useId();
  const root = useRef<HTMLElement>(null);
  const [view, setView] = useState<'chart' | 'table'>('chart');
  const [active, setActive] = useState<number | null>(null);
  const maximum = chartScale(chart.values);
  useEffect(() => {
    const element = root.current;
    if (!element || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          element.dataset.reveal = 'true';
          observer.disconnect();
        }
      },
      { threshold: 0.2 },
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, []);
  const selected = active === null ? null : chart.values[active];
  return (
    <figure ref={root} className={styles.figure} aria-labelledby={`${id}-title`}>
      <div className={styles.topline}>
        <span className={styles.kind}>
          <i aria-hidden="true" />
          {chart.kind}
        </span>
        <span className={styles.count}>{String(chart.values.length).padStart(2, '0')} values</span>
      </div>
      <h3 id={`${id}-title`}>{chart.title}</h3>
      <div className={styles.toolbar}>
        <p className={styles.unit}>{chart.unit}</p>
        <div className={styles.switch} role="group" aria-label="Chart display">
          <button
            type="button"
            aria-pressed={view === 'chart'}
            aria-controls={`${id}-plot`}
            onClick={() => setView('chart')}
          >
            Chart
          </button>
          <button
            type="button"
            aria-pressed={view === 'table'}
            aria-controls={`${id}-data`}
            onClick={() => setView('table')}
          >
            Data
          </button>
        </div>
      </div>
      <div id={`${id}-plot`} hidden={view !== 'chart'}>
        <div className={styles.plot}>
          <div className={styles.grid} aria-hidden="true">
            {[0, 1, 2, 3, 4].map((tick) => (
              <span key={tick} style={{ left: `${tick * 25}%` }} />
            ))}
          </div>
          <div className={styles.rows}>
            {chart.values.map((item, index) => (
              <button
                type="button"
                className={styles.row}
                key={item.label}
                data-active={active === index}
                aria-label={`${item.label}: ${number.format(item.value)}; ${chart.unit}`}
                aria-pressed={active === index}
                onPointerEnter={() => setActive(index)}
                onPointerLeave={() => setActive(null)}
                onFocus={() => setActive(index)}
                onBlur={() => setActive(null)}
                onClick={() => setActive(index)}
              >
                <span className={styles.rowLabel}>
                  <span>
                    <small>{String(index + 1).padStart(2, '0')}</small>
                    {item.label}
                  </span>
                  <strong>{number.format(item.value)}</strong>
                </span>
                <span className={styles.barTrack}>
                  <span
                    className={styles.bar}
                    style={{
                      width: `${(item.value / maximum) * 100}%`,
                      animationDelay: `${index * 100}ms`,
                    }}
                  >
                    <span className={styles.barEnd} />
                  </span>
                </span>
              </button>
            ))}
          </div>
        </div>
        <div className={styles.axis} aria-label={`Scale from zero to ${number.format(maximum)}`}>
          {[0, 1, 2, 3, 4].map((tick) => (
            <span key={tick} style={{ left: `${tick * 25}%` }}>
              {compact.format((maximum * tick) / 4)}
            </span>
          ))}
        </div>
        <div className={styles.detail} aria-live="off">
          <span className={styles.detailMarker} aria-hidden="true" />
          {selected ? (
            <span>
              <strong>{selected.label}</strong> · {number.format(selected.value)} {chart.unit}
            </span>
          ) : (
            <span>Hover, tap or focus a bar to inspect the value.</span>
          )}
        </div>
      </div>
      <div id={`${id}-data`} hidden={view !== 'table'} className={styles.data}>
        <table>
          <caption className={styles.srOnly}>{chart.title} — underlying data</caption>
          <thead>
            <tr>
              <th scope="col">Item</th>
              <th scope="col">Value</th>
            </tr>
          </thead>
          <tbody>
            {chart.values.map((item) => (
              <tr key={item.label}>
                <th scope="row">{item.label}</th>
                <td>{number.format(item.value)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <p className={styles.dataUnit}>Unit: {chart.unit}</p>
      </div>
      <figcaption className={styles.caption}>
        <span className={styles.method}>ZERO BASELINE · SOURCE & METHOD</span>
        {children}
      </figcaption>
    </figure>
  );
}
