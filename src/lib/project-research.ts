export type ProjectResearchSource = {
  id: string;
  label: string;
  url: string;
  kind: 'developer' | 'official-document' | 'portal' | 'broker' | 'regulator';
  checkedOn: string;
  derivedWords: number;
};

export type ProjectResearch = {
  status: 'in-progress' | 'reviewed';
  reviewedOn: string;
  sources: readonly ProjectResearchSource[];
  fieldSources: Readonly<Partial<Record<string, readonly string[]>>>;
  reviewCoverage: Readonly<Record<string, string>>;
  overview: readonly string[];
  community: string;
  locationNote: string;
  priceLabel: string;
  priceNote: string;
  paymentNote: string;
  handoverNote: string;
  units: readonly { label: string; area: string; sourceIds: readonly string[] }[];
  paymentStages: readonly { stage: string; percent: number; sourceIds: readonly string[] }[];
  facts: readonly { label: string; value: string; sourceIds: readonly string[] }[];
  unresolved: readonly string[];
};
