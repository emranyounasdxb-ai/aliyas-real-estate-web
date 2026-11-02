import fs from 'node:fs';
import { execFileSync } from 'node:child_process';

// Only manually authored, reviewed drafts enter the catalogue through this helper.
// It never extracts claims or updates identity/media fields.
const draftPath = process.argv[2];
if (!draftPath) throw new Error('Supply a manually reviewed draft JSON path.');
const draft = JSON.parse(fs.readFileSync(draftPath, 'utf8'));
const file = `src/data/developer-projects/${draft.developerSlug}.json`;
const collection = JSON.parse(fs.readFileSync(file, 'utf8'));
const project = collection.projects.find(p => p.id === draft.id);
if (!project || project.name !== draft.name) throw new Error('Owned identity mismatch');
if (project.research?.status === 'reviewed') throw new Error('Already reviewed: amend the canonical record explicitly.');
const allowed = new Set(['description','areaId','location','emirate','type','bedrooms','price','handover','paymentPlan','amenities','brochureUrl','floorPlanUrl','research']);
for (const key of Object.keys(draft.fields)) if (!allowed.has(key)) throw new Error(`Protected field: ${key}`);
const r = draft.fields.research;
if (r.status !== 'reviewed' || Object.keys(r.reviewCoverage).length !== 9) throw new Error('Nine research groups must have recorded outcomes.');
const sourceIds = new Set(r.sources.map(s => s.id));
for (const list of Object.values(r.fieldSources)) for (const id of list) if (!sourceIds.has(id)) throw new Error(`Unknown source: ${id}`);
Object.assign(project, draft.fields);
fs.writeFileSync(file, JSON.stringify(collection, null, 2) + '\n');
execFileSync(process.execPath, ['scripts/update-project-detail-progress.mjs'], { stdio:'inherit' });
