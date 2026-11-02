import { selectValue } from './select-control';
import { expect, test } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test('mobile recovery keeps its responsive geometry before hydration', async ({
  browser,
  baseURL,
}) => {
  const context = await browser.newContext({
    baseURL,
    javaScriptEnabled: false,
    viewport: { width: 390, height: 844 },
  });
  try {
    const page = await context.newPage();
    await page.goto('/projects?saved=1');
    await expect(page.locator('.catalogue-filters select').first()).toBeHidden();
    await expect(page.locator('.catalogue-sort')).toBeHidden();
    await expect(page.locator('.catalogue-mobile-controls')).toBeVisible();
    const action = await page.locator('.catalogue-empty .catalogue-button').boundingBox();
    expect(action!.y + action!.height).toBeLessThanOrEqual(844);
  } finally {
    await context.close();
  }
});

test('empty shortlist has a visible recovery action and returns to the catalogue', async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/projects?saved=1');
  await expect(page.getByRole('heading', { name: 'Your shortlist starts here.' })).toBeVisible();
  const action = page
    .locator('.catalogue-empty')
    .getByRole('button', { name: 'Explore all projects' });
  const box = (await action.boundingBox())!;
  expect(box.y + box.height).toBeLessThanOrEqual(844);
  expect(box.height).toBeGreaterThanOrEqual(48);
  await action.click();
  await expect(page.locator('.project-card')).toHaveCount(6);
  await page.goBack();
  await expect(page).toHaveURL(/saved=1/);
  await expect(page.getByRole('heading', { name: 'Your shortlist starts here.' })).toBeVisible();
});

test('saved recovery clears restrictive filters without losing favourites or comparison selection', async ({
  page,
}) => {
  await page.goto('/projects');
  await page.getByRole('button', { name: 'Save Creek Waters', exact: true }).click();
  await page.getByRole('button', { name: 'Compare project: Creek Waters', exact: true }).click();
  await page.goto('/projects?saved=1&q=zzznomatch');
  await expect(
    page.getByRole('heading', { name: 'Your saved homes are still here.' }),
  ).toBeVisible();
  await page.getByRole('button', { name: 'Show saved projects', exact: true }).click();
  await expect(page).toHaveURL(/\/projects\?saved=1$/);
  await expect(page.locator('.project-card')).toHaveCount(1);
  await expect(
    page.getByRole('button', { name: 'Unsave Creek Waters', exact: true }),
  ).toHaveAttribute('aria-pressed', 'true');
  await expect(page.getByRole('link', { name: 'Compare (1)', exact: true })).toBeVisible();
  await page.goBack();
  await expect(page).toHaveURL(/q=zzznomatch/);
  await expect(
    page.getByRole('button', { name: 'Show saved projects', exact: true }),
  ).toBeVisible();
  await page.reload();
  await expect(page.locator('.catalogue-saved')).toContainText('Saved (1)');
});

test('unmatched search and Ajman preview states keep honest context and a visible mobile action', async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  for (const route of ['/projects?q=zzznomatch', '/projects?emirate=Ajman']) {
    await page.goto(route);
    const empty = page.locator('.catalogue-empty');
    if (route.includes('Ajman'))
      await expect(empty).toContainText('There are no Ajman projects in this preview collection.');
    else await expect(empty).toContainText('Try another location');
    const action = empty.getByRole('button', { name: 'Explore all projects' });
    const box = (await action.boundingBox())!;
    expect(box.y + box.height).toBeLessThanOrEqual(844);
    await action.click();
    await expect(page.locator('.project-card')).toHaveCount(6);
  }
});

test('comparison uses comfortable mobile controls and brings results into view without narrowing table labels', async ({
  page,
}) => {
  for (const width of [320, 390, 768, 1024, 1440]) {
    await page.setViewportSize({ width, height: 950 });
    await page.goto('/projects/compare');
    await selectValue(page.locator('#comparison-project-0'), 'creek-waters');
    await selectValue(page.locator('#comparison-project-1'), 'the-acres');
    await expect(page.getByRole('table')).toBeVisible();
    if (width <= 700) {
      for (const select of await page.locator('.comparison-selector [role=combobox]').all()) {
        expect((await select.boundingBox())!.height).toBeGreaterThanOrEqual(44);
        expect(
          await select.evaluate((element) => parseFloat(getComputedStyle(element).fontSize)),
        ).toBeGreaterThanOrEqual(16);
      }
      for (const remove of await page.locator('.comparison-remove').all()) {
        const box = (await remove.boundingBox())!;
        expect(box.height).toBeGreaterThanOrEqual(44);
        expect(box.width).toBeGreaterThanOrEqual(44);
      }
      expect(
        (await page.locator('.comparison-row-label').boundingBox())!.width,
      ).toBeLessThanOrEqual(105);
    }
    if (width === 390)
      expect((await page.locator('.comparison-table-scroll').boundingBox())!.y).toBeLessThan(760);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
      true,
    );
    await page.getByRole('button', { name: 'Clear comparison', exact: true }).click();
  }
});

test('empty recovery and comparison controls remain accessible in light and dark themes', async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  for (const theme of ['light', 'dark'])
    for (const route of ['/projects?saved=1', '/projects?q=zzznomatch', '/projects/compare']) {
      await page.goto(route);
      if ((await page.locator('html').getAttribute('data-theme')) !== theme)
        await page.locator('.theme-toggle').click();
      if (route.includes('compare')) {
        await selectValue(page.locator('#comparison-project-0'), 'creek-waters');
        await selectValue(page.locator('#comparison-project-1'), 'the-acres');
      }
      const scan = await new AxeBuilder({ page })
        .include(route.includes('compare') ? '.comparison-page' : '.catalogue-empty')
        .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
        .analyze();
      expect(
        scan.violations.map(({ id, nodes }) => ({ id, targets: nodes.map((node) => node.target) })),
      ).toEqual([]);
    }
});
