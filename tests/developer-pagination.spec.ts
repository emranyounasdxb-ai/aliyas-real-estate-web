import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { developers } from '../src/lib/content';
import { getDeveloperProjects, developerProjectHref } from '../src/lib/developer-projects';
import { selectDeveloperProjectPage } from '../src/lib/developer-project-pagination';
import { selectValue } from './select-control';

test('fifteen-item pages cover every owned record exactly once and clamp invalid pages', () => {
  for (const owner of developers) {
    const records = getDeveloperProjects(owner.slug);
    const count = Math.ceil(records.length / 15);
    const ids: string[] = [];
    for (let page = 1; page <= count; page++) {
      const view = selectDeveloperProjectPage(records, new URLSearchParams({ page: String(page) }));
      expect(view.items.length).toBeGreaterThan(0);
      expect(view.items.length).toBeLessThanOrEqual(15);
      ids.push(...view.items.map((p) => p.id));
    }
    expect(ids).toEqual(records.map((p) => p.id));
    expect(new Set(ids).size).toBe(records.length);
  }
  const records = getDeveloperProjects('emaar');
  for (const value of ['0', '-1', '2.5', 'abc', 'Infinity', '99999999999999999999'])
    expect(selectDeveloperProjectPage(records, new URLSearchParams({ page: value })).page).toBe(1);
  expect(selectDeveloperProjectPage(records, new URLSearchParams('page=999')).page).toBe(8);
  const empty = selectDeveloperProjectPage(records, new URLSearchParams('page=8&area=dubai-jbr'));
  expect(empty.page).toBe(1);
  expect(empty.items).toEqual([]);
  // Location filtering occurs before slicing, including records beyond the first page.
  const located = records
    .slice(0, 32)
    .map((record, index) => ({ ...record, emirate: index % 2 ? 'Dubai' : 'Ajman', areaId: null }));
  const filtered = selectDeveloperProjectPage(located, new URLSearchParams('emirate=Dubai&page=2'));
  expect(filtered.total).toBe(16);
  expect(filtered.items.map((p) => p.id)).toEqual([located[31].id]);
});

test('page links, reload, browser history, filters and the last detail link preserve ownership', async ({
  page,
}) => {
  await page.goto('/developers/emaar#developer-projects');
  const cards = page.locator('.developer-listings-grid .project-card');
  const nav = page.getByRole('navigation', { name: 'Project pagination' });
  const records = getDeveloperProjects('emaar');
  await expect(cards).toHaveCount(15);
  await expect(page.locator('.developer-hero-card')).toHaveCount(15);
  await nav.getByRole('link', { name: 'Next', exact: true }).click();
  await expect(page).toHaveURL(/\/developers\/emaar\?page=2#developer-projects$/);
  await expect(cards.first()).toHaveAttribute('data-project-id', records[15].id);
  await expect(page.locator('#developer-projects-title')).toBeFocused();
  await expect
    .poll(async () => (await page.locator('#developer-projects').boundingBox())!.y)
    .toBeGreaterThan(75);
  await page.reload();
  await expect(cards.first()).toHaveAttribute('data-project-id', records[15].id);
  await nav.getByRole('link', { name: 'Page 8', exact: true }).click();
  await expect(cards).toHaveCount(3);
  await expect(nav.locator('[aria-disabled="true"]').last()).toHaveText('Next');
  await page.goBack();
  await expect(cards.first()).toHaveAttribute('data-project-id', records[15].id);
  await page.goForward();
  await expect(cards).toHaveCount(3);
  const last = cards.last().locator('.project-card-image-link');
  await expect(last).toHaveAttribute('href', developerProjectHref(records.at(-1)!));
  await last.click();
  await expect(page.locator('h1')).toHaveText(records.at(-1)!.name);
  await expect(page.locator('.pd-back').first()).toHaveAttribute(
    'href',
    '/developers/emaar?page=8#developer-projects',
  );
  await page.locator('.pd-back').first().click();
  await expect(cards).toHaveCount(3);
  await selectValue(
    page.getByRole('combobox', { name: 'Area or community', exact: true }),
    'dubai-jbr',
  );
  expect(new URL(page.url()).searchParams.has('page')).toBe(false);
  await expect(cards).toHaveCount(0);
  await expect(nav).toHaveCount(0);
  await page.getByRole('button', { name: 'View all 108 projects', exact: true }).click();
  await expect(cards).toHaveCount(15);
  await expect(cards.first()).toHaveAttribute('data-project-id', records[0].id);
});

test('direct pagination URLs render the correct slice without JavaScript', async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  await page.goto('http://127.0.0.1:3000/developers/emaar?page=2#developer-projects');
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
    'href',
    /\/developers\/emaar\?page=2$/,
  );
  const cards = page.locator('.developer-listings-grid .project-card');
  await expect(cards).toHaveCount(15);
  await expect(cards.first()).toHaveAttribute(
    'data-project-id',
    getDeveloperProjects('emaar')[15].id,
  );
  await page
    .getByRole('navigation', { name: 'Project pagination' })
    .getByRole('link', { name: 'Next', exact: true })
    .click();
  await expect(cards.first()).toHaveAttribute(
    'data-project-id',
    getDeveloperProjects('emaar')[30].id,
  );
  await context.close();
});

test('native touch pagination moves to the new cards without restarting the hero', async ({
  browser,
}) => {
  for (const width of [320, 768]) {
    const context = await browser.newContext({
      viewport: { width, height: 950 },
      isMobile: true,
      hasTouch: true,
      reducedMotion: 'no-preference',
    });
    const page = await context.newPage();
    await page.goto('http://127.0.0.1:3000/developers/emaar#developer-projects');
    await page
      .getByRole('navigation', { name: 'Project pagination' })
      .getByRole('link', { name: 'Next', exact: true })
      .tap();
    await expect(page.locator('.developer-listings-grid .project-card').first()).toHaveAttribute(
      'data-project-id',
      getDeveloperProjects('emaar')[15].id,
    );
    await expect(page.locator('.developer-hero-card')).toHaveCount(15);
    await expect
      .poll(async () => (await page.locator('#developer-projects').boundingBox())!.y)
      .toBeGreaterThan(70);
    await expect
      .poll(async () => (await page.locator('#developer-projects').boundingBox())!.y)
      .toBeLessThan(150);
    await context.close();
  }
});

test('pagination fits mobile, tablet and desktop in both themes with keyboard access', async ({
  page,
}) => {
  test.setTimeout(90_000);
  await page.goto('/developers/emaar?page=4#developer-projects');
  const nav = page.getByRole('navigation', { name: 'Project pagination' });
  for (const width of [320, 390, 768, 1024, 1440]) {
    await page.setViewportSize({ width, height: 950 });
    for (const theme of ['light', 'dark']) {
      await page.evaluate((theme) => (document.documentElement.dataset.theme = theme), theme);
      await nav.scrollIntoViewIfNeeded();
      expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(
        width,
      );
      const sizes = await nav.locator('a').evaluateAll((links) =>
        links.map((link) => {
          const r = link.getBoundingClientRect();
          return { width: r.width, height: r.height, left: r.left, right: r.right };
        }),
      );
      for (const size of sizes) {
        expect(size.width).toBeGreaterThanOrEqual(40);
        expect(size.height).toBeGreaterThanOrEqual(48);
        expect(size.left).toBeGreaterThanOrEqual(0);
        expect(size.right).toBeLessThanOrEqual(width);
      }
      if (width === 320 || width === 1440) {
        expect(
          (
            await new AxeBuilder({ page })
              .include('.developer-pagination')
              .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
              .analyze()
          ).violations,
        ).toEqual([]);
        await nav.screenshot({
          path: `artifacts/developer-pagination/pagination-${width}-${theme}.png`,
        });
      }
    }
  }
  await nav.getByRole('link', { name: 'Page 5', exact: true }).focus();
  await page.keyboard.press('Enter');
  await expect(page.locator('.developer-listings-grid .project-card').first()).toHaveAttribute(
    'data-project-id',
    getDeveloperProjects('emaar')[60].id,
  );
  await expect(page.locator('#developer-projects-title')).toBeFocused();
});
