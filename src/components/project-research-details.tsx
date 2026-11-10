import { ArrowUpRight } from 'lucide-react';
import type { ProjectResearch, ProjectResearchSource } from '@/lib/project-research';
import { projectPublicText, hasPublishedUnitArea } from '@/lib/project-public-copy';
import './project-research-details.css';

function publicSourceLabel(source: ProjectResearchSource) {
  return projectPublicText(source.label) || new URL(source.url).hostname.replace(/^www\./, '');
}

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
          {publicSourceLabel(source)}
          <ArrowUpRight size={12} aria-hidden="true" />
        </a>
      ))}
    </span>
  );
}

export function ResearchUnits({ research }: { research: ProjectResearch }) {
  const units = research.units.filter(
    (unit) => projectPublicText(unit.label) === unit.label && hasPublishedUnitArea(unit.area),
  );
  if (!units.length) return null;
  return (
    <div className="pd-research-block">
      <h3 className="pd-subheading">Unit sizes & layouts</h3>
      <div className="pd-research-table-wrap" role="region" aria-label="Unit sizes" tabIndex={0}>
        <table className="pd-research-table">
          <caption>
            Residence layouts and floor areas. See the linked plans for each configuration.
          </caption>
          <thead>
            <tr>
              <th scope="col">Layout</th>
              <th scope="col">Published area</th>
            </tr>
          </thead>
          <tbody>
            {units.map((unit) => (
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
  const priceNote = projectPublicText(research.priceNote);
  const paymentNote = projectPublicText(research.paymentNote);
  const handoverNote = projectPublicText(research.handoverNote);
  // A partial calendar would misrepresent the full payment schedule.
  const stages = research.paymentStages.every(
    (stage) => projectPublicText(stage.stage) === stage.stage,
  )
    ? research.paymentStages
    : [];
  return (
    <div className="pd-research-block">
      {priceNote && (
        <>
          <p className="pd-description">{priceNote}</p>
          <ResearchSources research={research} fields={['price']} />
        </>
      )}
      {paymentNote && <p className="pd-description">{paymentNote}</p>}
      {stages.length > 0 && (
        <ol className="pd-research-payments">
          {stages.map((stage) => (
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
      {handoverNote && (
        <>
          <p className="pd-description">{handoverNote}</p>
          <ResearchSources research={research} fields={['handover']} />
        </>
      )}
    </div>
  );
}

export function ResearchFacts({ research }: { research: ProjectResearch }) {
  const facts = research.facts
    .filter((fact) => projectPublicText(fact.label) === fact.label)
    .map((fact) => ({ ...fact, value: projectPublicText(fact.value) }))
    .filter((fact) => fact.value);
  if (!facts.length) return null;
  return (
    <dl className="pd-research-facts">
      {facts.map((fact) => (
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

export function ResearchReview({ research }: { research: ProjectResearch }) {
  const labels: Record<string, string> = {
    developer: 'Developer',
    'official-document': 'Official document',
    portal: 'Property portal',
    broker: 'Broker',
    regulator: 'Regulator',
  };
  return (
    <section className="pd-section pd-research-review" id="sources">
      <p className="pd-eyebrow">06 / Further reading</p>
      <h2>Project sources.</h2>
      <ul className="pd-research-source-list">
        {research.sources.map((source) => (
          <li key={source.id}>
            <a href={source.url} target="_blank" rel="noopener noreferrer">
              <span>
                <small>{labels[source.kind] || 'Source'}</small>
                {publicSourceLabel(source)}
              </span>
              <ArrowUpRight size={18} aria-hidden="true" />
            </a>
          </li>
        ))}
      </ul>
    </section>
  );
}
