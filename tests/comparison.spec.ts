import { selectValue } from './select-control';
import { expect, test } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test('comparison limits selection to three and persists independently from saved favourites', async ({
  page,
}) => {
  const pageErrors: string[] = [];
  page.on('pageerror', (error) => pageErrors.push(error.message));
  await page.goto('/projects');
  await page.getByRole('button', { name: 'Save Creek Waters', exact: true }).click();
  for (const name of ['Creek Waters', 'The Acres', 'Sobha Solis']) {
    await page.getByRole('button', { name: `Compare project: ${name}`, exact: true }).click();
    await expect(
      page.getByRole('button', { name: `Compare project: ${name}`, exact: true }),
    ).toHaveAttribute('aria-pressed', 'true');
  }
  await page.getByRole('button', { name: 'Compare project: Gardenia Bay', exact: true }).click();
  await expect(
    page.getByText('You can compare up to 3 projects. Remove one before adding another.'),
  ).toBeVisible();
  await expect(page.getByRole('link', { name: 'Compare (3)', exact: true })).toBeVisible();
  await page.reload();
  await expect(page.getByRole('link', { name: 'Compare (3)', exact: true })).toBeVisible();
  await expect(
    page.getByRole('button', { name: 'Unsave Creek Waters', exact: true }),
  ).toHaveAttribute('aria-pressed', 'true');
  await page.getByRole('link', { name: 'Compare (3)', exact: true }).click();
  await expect(page).toHaveURL(/\/projects\/compare$/);
  await expect(page.getByRole('table')).toBeVisible();
  await expect(page.getByRole('columnheader')).toHaveCount(4);
  await expect(
    page.getByRole('rowheader', { name: 'Sample payment plan', exact: true }),
  ).toBeVisible();
  await expect(page.getByRole('cell', { name: 'AED 1.7M', exact: true })).toBeVisible();
  await selectValue(
    page.getByRole('combobox', { name: 'Choose project 2', exact: true }),
    'gardenia-bay',
  );
  await expect(page.getByRole('columnheader').filter({ hasText: 'Gardenia Bay' })).toBeVisible();
  await page
    .getByRole('button', { name: 'Remove Sobha Solis from comparison', exact: true })
    .click();
  await expect(page.getByRole('columnheader')).toHaveCount(3);
  await page.getByRole('button', { name: 'Clear comparison', exact: true }).click();
  await expect(page.getByRole('table')).toHaveCount(0);
  await expect(
    page.getByRole('heading', { name: 'Good decisions start with a little perspective.' }),
  ).toBeVisible();
  await page.reload();
  await expect(page.getByRole('table')).toHaveCount(0);
  await expect(page.getByRole('combobox', { name: 'Choose project 1', exact: true })).toContainText(
    'Choose a project',
  );
  expect(pageErrors).toEqual([]);
});

test('comparison recovers malformed storage and can be built from its empty state', async ({
  page,
}) => {
  await page.addInitScript(() => localStorage.setItem('aliyas-compare-projects', '{invalid-json'));
  await page.goto('/projects/compare');
  await expect(page.getByRole('heading', { level: 1 })).toContainText('side by side');
  await expect(page.getByRole('table')).toHaveCount(0);
  await selectValue(
    page.getByRole('combobox', { name: 'Choose project 1', exact: true }),
    'cala-del-mar',
  );
  await expect(
    page.getByRole('heading', { name: 'One more possibility to consider.' }),
  ).toBeVisible();
  await selectValue(
    page.getByRole('combobox', { name: 'Choose project 2', exact: true }),
    'gardenia-bay',
  );
  await expect(page.getByRole('table')).toBeVisible();
  await expect(page.getByRole('columnheader')).toHaveCount(3);
  await expect(page.getByRole('cell', { name: 'Ras Al Khaimah', exact: true })).toBeVisible();
  await expect(
    page.getByRole('link', { name: 'Enquire about Cala del Mar', exact: true }),
  ).toHaveAttribute('href', '/contact?project=cala-del-mar');
  await expect(page.locator('main')).toHaveCount(1);
  const accessibility = await new AxeBuilder({ page }).include('.comparison-page').analyze();
  expect(accessibility.violations).toEqual([]);
});

test('comparison selections sync between tabs without reload', async ({ page, context }) => {
  await page.goto('/projects');
  await page.getByRole('button', { name: 'Compare project: Creek Waters', exact: true }).click();
  const second = await context.newPage();
  await second.goto('/projects/compare');
  await expect(
    second.getByRole('combobox', { name: 'Choose project 1', exact: true }),
  ).toContainText('Creek Waters');
  await selectValue(
    second.getByRole('combobox', { name: 'Choose project 2', exact: true }),
    'the-acres',
  );
  await expect(page.getByRole('link', { name: 'Compare (2)', exact: true })).toBeVisible();
  await expect(
    page.getByRole('button', { name: 'Compare project: The Acres', exact: true }),
  ).toHaveAttribute('aria-pressed', 'true');
  await second.getByRole('button', { name: 'Clear comparison', exact: true }).click();
  await expect(page.getByRole('link', { name: 'Compare (0)', exact: true })).toBeVisible();
});

test('comparison remains usable on mobile without overflowing the page', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.addInitScript(() =>
    localStorage.setItem(
      'aliyas-compare-projects',
      JSON.stringify(['creek-waters', 'the-acres', 'sobha-solis']),
    ),
  );
  await page.goto('/projects/compare');
  await expect(page.getByRole('table')).toBeVisible();
  const widths = await page.evaluate(() => ({
    page: document.documentElement.scrollWidth,
    viewport: innerWidth,
    scroller: document.querySelector('.comparison-table-scroll')!.scrollWidth,
  }));
  expect(widths.page).toBeLessThanOrEqual(widths.viewport);
  expect(widths.scroller).toBeGreaterThan(widths.viewport);
  await expect(page.getByRole('region', { name: 'Project comparison table' })).toHaveAttribute(
    'tabindex',
    '0',
  );
});
