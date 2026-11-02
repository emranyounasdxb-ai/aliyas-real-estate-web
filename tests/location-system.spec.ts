import { test, expect } from '@playwright/test';
import { readFileSync } from 'node:fs';
import AxeBuilder from '@axe-core/playwright';
import { selectValue } from './select-control';
import {
  areas,
  getArea,
  resolveArea,
  readLocationFilter,
  updateLocationQuery,
  projectLocation,
  matchesLocation,
} from '../src/lib/locations';
import {
  catalogueEntries,
  filterCatalogue,
  type ApprovedListing,
} from '../src/lib/catalogue-locations';
import { projects } from '../src/lib/content';
import { developers } from '../src/lib/developers';
import {
  getAllDeveloperProjects,
  getDeveloperProjects,
  developerProjectHref,
} from '../src/lib/developer-projects';

test('canonical geography resolves aliases, rejects conflicts and preserves owned placeholders', () => {
  expect(new Set(areas.map((area) => area.id)).size).toBe(areas.length);
  expect(resolveArea('JBR')?.id).toBe('dubai-jbr');
  expect(resolveArea('jlt')?.id).toBe('dubai-jlt');
  expect(resolveArea('Marina')?.id).toBe('dubai-marina');
  expect(readLocationFilter('', 'JLT')).toEqual({
    emirate: 'Dubai',
    area: 'dubai-jlt',
    invalid: false,
  });
  expect(readLocationFilter('Abu Dhabi', 'dubai-jbr').invalid).toBe(true);
  expect(readLocationFilter('Dubai', 'missing-area').invalid).toBe(true);
  expect(() => projectLocation({ areaId: 'dubai-jlt', emirate: 'Ajman' })).toThrow('mismatch');
  expect(() => projectLocation({ areaId: 'missing-area', emirate: null })).toThrow('Unknown');
  expect(projectLocation({ areaId: 'dubai-jlt', emirate: null })).toEqual({
    areaId: 'dubai-jlt',
    emirate: 'Dubai',
    location: 'Jumeirah Lakes Towers',
  });
  const next = updateLocationQuery(
    new URLSearchParams('area=dubai-jbr&emirate=Dubai&type=Apartment&developer=emaar&sort=name'),
    'emirate',
    'Abu Dhabi',
  );
  expect(next.has('area')).toBe(false);
  expect(next.get('developer')).toBe('emaar');
  expect(next.get('type')).toBe('Apartment');
  expect(updateLocationQuery(next, 'area', 'dubai-marina').get('emirate')).toBe('Dubai');
  const researchQueue = JSON.parse(
    readFileSync('docs/project-detail-research-queue.json', 'utf8'),
  ) as { id: string; developerSlug: string }[];
  for (const developer of developers) {
    const records = getDeveloperProjects(developer.slug);
    expect(records.map((record) => record.id)).toEqual(
      researchQueue.filter((record) => record.developerSlug === developer.slug).map((record) => record.id),
    );
    for (const record of records) {
      expect(record.developerSlug).toBe(developer.slug);
      if (record.areaId) {
        expect(getArea(record.areaId)?.emirate).toBe(record.emirate);
        expect(resolveArea(record.location ?? '', record.emirate ?? '')?.id).toBe(record.areaId);
      }
    }
  }
  expect(getAllDeveloperProjects().every((project) => Object.isFrozen(project))).toBe(true);
  expect(
    matchesLocation({ areaId: null, emirate: null }, readLocationFilter('Dubai', 'dubai-jbr')),
  ).toBe(false);
});

test('area filters intersect other facets and approved records retain their scoped routes', () => {
  const sample = catalogueEntries(projects, []);
  expect(
    filterCatalogue(sample, {
      ...readLocationFilter('Dubai', 'dubai-dubailand'),
      type: 'Villa',
    }).map((p) => p.key),
  ).toEqual(['the-acres']);
  expect(
    filterCatalogue(sample, {
      ...readLocationFilter('', 'abu-dhabi-yas-island'),
      budget: '2000000',
    }).map((p) => p.key),
  ).toEqual(['gardenia-bay']);
  expect(filterCatalogue(sample, readLocationFilter('Abu Dhabi', 'dubai-dubailand'))).toEqual([]);
  const fixture: ApprovedListing = {
    ...getDeveloperProjects('emaar')[0],
    placeholder: false,
    areaId: 'dubai-jlt',
    location: 'Jumeirah Lakes Towers',
    emirate: 'Dubai',
    developerName: 'Emaar Properties',
    price: null,
  };
  const entries = catalogueEntries([], [fixture]);
  expect(
    filterCatalogue(entries, { ...readLocationFilter('', ''), query: 'JLT' }).map((p) => p.key),
  ).toEqual([fixture.id]);
  expect(
    filterCatalogue(entries, { ...readLocationFilter('Dubai', 'dubai-jlt'), budget: '2000000' }),
  ).toEqual([]);
  expect(
    filterCatalogue(entries, { ...readLocationFilter('Dubai', 'dubai-jlt'), developer: 'aldar' }),
  ).toEqual([]);
  expect(developerProjectHref(fixture)).toBe('/developers/emaar/projects/valia');
});

test('homepage area selection infers emirate and submits all facets', async ({ page }) => {
  await page.goto('/');
  await selectValue(
    page.getByRole('combobox', { name: 'Choose area or community', exact: true }),
    'dubai-dubailand',
  );
  await expect(page.getByRole('combobox', { name: 'Choose emirate', exact: true })).toContainText(
    'Dubai',
  );
  await selectValue(
    page.getByRole('combobox', { name: 'Choose property type', exact: true }),
    'Villa',
  );
  await page.locator('.home-search button[type=submit]').click();
  await expect(page).toHaveURL(/emirate=Dubai&area=dubai-dubailand&type=Villa/);
  await expect(page.locator('.project-card')).toHaveCount(1);
  await expect(page.locator('.project-card')).toContainText('The Acres');
  await page.reload();
  await expect(
    page.getByRole('combobox', { name: 'Area or community', exact: true }),
  ).toContainText('Dubailand');
});

test('changing emirate clears incompatible area and history restores it', async ({ page }) => {
  await page.goto('/projects?emirate=Dubai&area=dubai-dubailand&type=Villa');
  await selectValue(page.getByRole('combobox', { name: 'Location', exact: true }), 'Abu Dhabi');
  await expect(page).toHaveURL(/emirate=Abu\+Dhabi&type=Villa$/);
  await expect(
    page.getByRole('combobox', { name: 'Area or community', exact: true }),
  ).toContainText('All areas');
  await page.goBack();
  await expect(
    page.getByRole('combobox', { name: 'Area or community', exact: true }),
  ).toContainText('Dubailand');
  await expect(page.locator('.project-card')).toHaveCount(1);
  await page.goto('/projects?emirate=Abu%20Dhabi&area=dubai-jbr');
  await expect(page.locator('.project-card')).toHaveCount(0);
  await expect(page.locator('.location-active-filter')).toContainText('not recognised');
  await page.getByRole('button', { name: 'Clear location', exact: true }).click();
  await expect(page.locator('.project-card')).toHaveCount(6);
});

test('empty area links are honest and keyboard aliases select the correct area', async ({
  page,
}) => {
  await page.goto('/');
  const area = page.getByRole('combobox', { name: 'Choose area or community', exact: true });
  await area.focus();
  await page.keyboard.type('jlt');
  await page.keyboard.press('Enter');
  await expect(area).toContainText('Jumeirah Lakes Towers');
  await page
    .getByRole('navigation', { name: 'Explore projects by area' })
    .getByRole('link', { name: 'JBR', exact: true })
    .click();
  await expect(page).toHaveURL(/area=dubai-jbr/);
  await expect(page.locator('.project-card')).toHaveCount(0);
  await expect(page.locator('.catalogue-empty')).toContainText('No listed projects match');
});

test('native mobile touch area filter stays inside modal viewport', async ({
  browser,
  baseURL,
}) => {
  const context = await browser.newContext({
    baseURL,
    viewport: { width: 320, height: 568 },
    isMobile: true,
    hasTouch: true,
    reducedMotion: 'reduce',
  });
  const page = await context.newPage();
  await page.goto('/projects');
  await page.getByRole('button', { name: 'Filters', exact: true }).tap();
  await page
    .getByRole('dialog')
    .getByRole('combobox', { name: 'Area or community', exact: true })
    .tap();
  await page.getByRole('option', { name: 'Dubai Creek Harbour · Dubai', exact: true }).tap();
  await expect(
    page.getByRole('dialog').getByRole('combobox', { name: 'Location', exact: true }),
  ).toContainText('Dubai');
  await page.getByRole('dialog').getByRole('button', { name: 'Show 1 project', exact: true }).tap();
  await expect(page.locator('.project-card')).toHaveCount(1);
  await expect(page.locator('.project-card')).toContainText('Creek Waters');
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await context.close();
});

test('developer location filtering never assigns unknown slots or mixes owners', async ({
  page,
}) => {
  await page.goto('/developers/emaar#developer-projects');
  await expect(page.locator('.developer-listings-grid .project-card')).toHaveCount(15);
  await selectValue(
    page.getByRole('combobox', { name: 'Area or community', exact: true }),
    'dubai-jbr',
  );
  await expect(page.locator('.developer-listings-grid .project-card')).toHaveCount(0);
  await expect(page).toHaveURL(
    /\/developers\/emaar\?area=dubai-jbr&emirate=Dubai#developer-projects/,
  );
  await page.reload();
  await expect(page.locator('.developer-location-empty')).toBeVisible();
  await page
    .getByRole('button', {
      name: `View all ${getDeveloperProjects('emaar').length} projects`,
      exact: true,
    })
    .click();
  await expect(page.locator('.developer-listings-grid .project-card')).toHaveCount(15);
  expect(
    await page
      .locator('.developer-listings-grid .project-card')
      .evaluateAll((cards) => [
        ...new Set(cards.map((card) => card.getAttribute('data-developer'))),
      ]),
  ).toEqual(['emaar']);
});

test('location controls fit five viewport sizes and remain accessible in both themes', async ({
  page,
}) => {
  for (const width of [320, 390, 768, 1024, 1440]) {
    await page.setViewportSize({ width, height: 950 });
    for (const route of ['/', '/projects?area=dubai-motor-city']) {
      await page.goto(route);
      const target = page.locator(route === '/' ? '.home-location-search' : '.catalogue-browser');
      await target.scrollIntoViewIfNeeded();
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
        true,
      );
    }
  }
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  for (const theme of ['light', 'dark']) {
    await page.locator('html').evaluate((el, t) => el.setAttribute('data-theme', t), theme);
    await page.getByRole('combobox', { name: 'Choose area or community', exact: true }).click();
    const scan = await new AxeBuilder({ page })
      .include('.home-location-search')
      .include('.brand-select-menu')
      .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
      .analyze();
    expect(
      scan.violations.map(({ id, nodes }) => ({ id, targets: nodes.map((node) => node.target) })),
    ).toEqual([]);
    await page.keyboard.press('Escape');
  }
});
