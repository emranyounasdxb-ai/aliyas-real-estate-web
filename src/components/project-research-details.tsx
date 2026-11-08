import { ArrowUpRight } from 'lucide-react';
import type { ProjectResearch } from '@/lib/project-research';
import { getDisplayedResearchUnresolved } from '@/lib/project-research-display';
import './project-research-details.css';

export function ResearchSources({
  research,
  fields,
  ids,
}: {
  research: ProjectResearch;
  fields?: string[];
  ids?: readonly string[];
}) {
  const wanted = new Set(
    ids ?? fields?.flatMap((field) => research.fieldSources[field] ?? []) ?? [],
  );
  const sources = research.sources.filter((source) => wanted.has(source.id));
  if (!sources.length) return null;
  return (
    <span className="pd-research-citations">
      {sources.map((source) => (
        <a key={source.id} href={source.url} target="_blank" rel="noopener noreferrer">
          {source.label}
          <ArrowUpRight size={12} aria-hidden="true" />
        </a>
      ))}
    </span>
  );
}

export function ResearchUnits({ research }: { research: ProjectResearch }) {
  if (!research.units.length) return null;
  return (
    <div className="pd-research-block">
      <h3 className="pd-subheading">Unit sizes & layouts</h3>
      <div
        className="pd-research-table-wrap"
        role="region"
        aria-label="Unit sizes"
        tabIndex={0}
      >
        <table className="pd-research-table">
          <caption>
            Published layout information. Areas and configurations vary by unit; refer to the linked
            plans.
          </caption>
          <thead>
            <tr>
              <th scope="col">Layout</th>
              <th scope="col">Published area</th>
            </tr>
          </thead>
          <tbody>
            {research.units.map((unit) => (
              <tr key={unit.label}>
                <th scope="row">{unit.label}</th>
                <td>
                  {unit.area}
                  <ResearchSources research={research} ids={unit.sourceIds} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function ResearchPayments({ research }: { research: ProjectResearch }) {
  return (
    <div className="pd-research-block">
      <p className="pd-description">{research.priceNote}</p>
      <ResearchSources research={research} fields={['price']} />
      <p className="pd-description">{research.paymentNote}</p>
      {research.paymentStages.length > 0 && (
        <ol className="pd-research-payments">
          {research.paymentStages.map((stage) => (
            <li key={stage.stage}>
              <strong>{stage.percent}%</strong>
              <span>
                {stage.stage}
                <ResearchSources research={research} ids={stage.sourceIds} />
              </span>
            </li>
          ))}
        </ol>
      )}
      <ResearchSources research={research} fields={['paymentPlan']} />
      <p className="pd-description">{research.handoverNote}</p>
      <ResearchSources research={research} fields={['handover']} />
    </div>
  );
}

export function ResearchFacts({ research }: { research: ProjectResearch }) {
  if (!research.facts.length) return null;
  return (
    <dl className="pd-research-facts">
      {research.facts.map((fact) => (
        <div key={fact.label}>
          <dt>{fact.label}</dt>
          <dd>
            {fact.value}
            <ResearchSources research={research} ids={fact.sourceIds} />
          </dd>
        </div>
      ))}
    </dl>
  );
}

export function ResearchReview({
  research,
  hasProjectMedia = false,
  researchNoteReplacements,
}: {
  research: ProjectResearch;
  hasProjectMedia?: boolean;
  researchNoteReplacements?: Record<string, string>;
}) {
  const unresolved = getDisplayedResearchUnresolved(research, hasProjectMedia, researchNoteReplacements);
  const labels: Record<string, string> = {
    developer: 'Developer',
    'official-document': 'Official document',
    portal: 'Property portal',
    broker: 'Broker',
    regulator: 'Regulator',
  };
  return (
    <section className="pd-section pd-research-review" id="sources">
      <p className="pd-eyebrow">06 / Sources & updates</p>
      <h2>Information you can trace.</h2>
      <p className="pd-description">
        Research checked{' '}
        <time dateTime={research.reviewedOn}>
          {new Date(`${research.reviewedOn}T12:00:00Z`).toLocaleDateString('en-GB', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
            timeZone: 'UTC',
          })}
        </time>
        . Published prices, terms and completion targets can change. Ask Aliyas to confirm the offer
        for your selected unit.
      </p>
      <ul className="pd-research-source-list">
        {research.sources.map((source) => (
          <li key={source.id}>
            <a href={source.url} target="_blank" rel="noopener noreferrer">
              <span>
                <small>{labels[source.kind] || 'Source'}</small>
                {source.label}
              </span>
              <ArrowUpRight size={18} aria-hidden="true" />
            </a>
          </li>
        ))}
      </ul>
      {unresolved.length > 0 && (
        <details className="pd-research-pending">
          <summary>Information still to confirm</summary>
          <ul>
            {unresolved.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </details>
      )}
    </section>
  );
}
