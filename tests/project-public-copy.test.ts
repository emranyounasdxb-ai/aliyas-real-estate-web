import assert from 'node:assert/strict';
import { test } from 'node:test';
const sourcePath = '../src/lib/project-public-copy.ts';
const { projectPublicText, hasPublishedUnitArea } = await import(sourcePath);

test('public copy omits whole research sentences and preserves decimal prices', () => {
  assert.equal(
    projectPublicText('Launch price: AED 2.5m. A current developer price was not verified.'),
    'Launch price: AED 2.5m.',
  );
  assert.equal(projectPublicText('Area and layout not verified.'), '');
});

test('qualifications cannot become positive claims through word removal', () => {
  assert.equal(projectPublicText('LEED certification is unconfirmed.'), '');
  assert.equal(
    projectPublicText('The development targets LEED Gold. Certification remains unverified.'),
    'The development targets LEED Gold.',
  );
  assert.equal(projectPublicText('January 2029 · exact day unconfirmed'), '');
});

test('commercial history, source differences and forecast wording survive unchanged', () => {
  for (const text of [
    'Launch prices began at AED 2.5m; the developer later announced the release sold out.',
    'The developer targets Q4 2028; the portal lists Q1 2029.',
    'These are planned totals, not available inventory.',
    'Published terms are a reference, not a selected-unit offer.',
    'Portal headline 5/25/40/30 differs from its FAQ 5/35/60.',
  ])
    assert.equal(projectPublicText(text), text);
});

test('transport and owner-supplied works remain qualified without image boilerplate', () => {
  assert.equal(
    projectPublicText(
      'The brochure map is illustrative; proposed transport links are not operating stations or guaranteed walking routes.',
    ),
    'The brochure map shows proposed transport links; these are not operating stations or guaranteed walking routes.',
  );
  assert.equal(
    projectPublicText(
      'Pool and landscape drawings are illustrative, and the plan disclaimer says these are not provided by the developer.',
    ),
    'The plan disclaimer says pools and landscaping are not provided by the developer.',
  );
});

test('unit tables require an actual published area', () => {
  for (const area of [
    'Total not printed',
    'No area total printed in reviewed drawings',
    'Type-specific registered totals require confirmation',
    'Aggregate area to confirm',
    '3BR · area unavailable',
  ])
    assert.equal(hasPublishedUnitArea(area), false);
  assert.equal(hasPublishedUnitArea('1,200–1,500 sq ft · includes balcony'), true);
});
