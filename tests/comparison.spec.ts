import { selectValue } from './select-control';
import { expect, test } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test('comparison limits selection to three and persists independently from saved favourites', async ({
  page,
}) => {
  test.setTimeout(90_000);
  const pageErrors: string[] = [];
  page.on('pageerror', (error) => pageErrors.push(error.message));
  await page.goto('/projects?q=Sobha%20Solis');
  const cards = page.locator('.project-card');
  await cards.getByRole('button', { name: 'Save Sobha Solis', exact: true }).click();
  for (const name of ['Sobha Solis', 'Gardenia Bay']) {
    await page.goto('/projects?q=' + encodeURIComponent(name));
    await cards.getByRole('button', { name: `Compare project: ${name}`, exact: true }).click();
    await expect(
      cards.getByRole('button', { name: `Compare project: ${name}`, exact: true }),
    ).toHaveAttribute('aria-pressed', 'true');
  }
  await cards.first().getByRole('link', { name: 'View comparison', exact: true }).click();
  await selectValue(
    page.getByRole('combobox', { name: 'Choose project 3', exact: true }),
    'damac-project-07',
  );
  await expect(page.getByRole('columnheader')).toHaveCount(4);
  await page.goto('/projects?q=Sobha%20Solis');
  await page.goto('/projects?q=Cala%20Del%20Mar');
  await cards.getByRole('button', { name: 'Compare project: Cala Del Mar', exact: true }).click();
  await expect(
    page.getByText('You can compare up to 3 projects. Remove one before adding another.'),
  ).toBeVisible();
  await expect(
    cards.getByRole('button', { name: 'Compare project: Cala Del Mar', exact: true }),
  ).toHaveAttribute('aria-pressed', 'false');
  await page.goto('/projects?q=Sobha%20Solis');
  await page.reload();
  await expect(
    cards.getByRole('button', { name: 'Unsave Sobha Solis', exact: true }),
  ).toHaveAttribute('aria-pressed', 'true');
  await cards.first().getByRole('link', { name: 'View comparison', exact: true }).click();
  await expect(page).toHaveURL(/\/projects\/compare$/);
  await expect(page.getByRole('table')).toBeVisible();
  await expect(page.getByRole('columnheader')).toHaveCount(4);
  await expect(page.getByRole('rowheader', { name: 'Payment plan', exact: true })).toBeVisible();
  await expect(
    page.getByRole('cell', {
      name: 'AED 2.0M · Developer advertised starting price · reconfirm',
      exact: true,
    }),
  ).toBeVisible();
  await expect(
    page.getByRole('cell', { name: 'AED 805K · Original developer launch price', exact: true }),
  ).toBeVisible();
  await expect(page.getByRole('rowheader', { name: 'Handover target', exact: true })).toHaveCount(
    0,
  );
  await expect(page.getByRole('table')).not.toContainText(/illustrative|sample|details to follow/i);
  await selectValue(
    page.getByRole('combobox', { name: 'Choose project 2', exact: true }),
    'ellington-project-19',
  );
  await expect(page.getByRole('columnheader').filter({ hasText: 'Cala Del Mar' })).toBeVisible();
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
  expect(
    await page.evaluate(() => JSON.parse(localStorage.getItem('aliyas-saved-projects') || '[]')),
  ).toEqual(['sobha-project-19']);
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
    'ellington-project-19',
  );
  await expect(
    page.getByRole('heading', { name: 'One more possibility to consider.' }),
  ).toBeVisible();
  await selectValue(
    page.getByRole('combobox', { name: 'Choose project 2', exact: true }),
    'aldar-project-21',
  );
  await expect(page.getByRole('table')).toBeVisible();
  await expect(page.getByRole('columnheader')).toHaveCount(3);
  await expect(page.getByRole('cell', { name: 'Ras Al Khaimah', exact: true })).toBeVisible();
  await expect(
    page.getByRole('link', { name: 'Enquire about Cala Del Mar', exact: true }),
  ).toHaveAttribute('href', '/contact?project=cala-del-mar');
  await expect(
    page.getByRole('link', { name: 'View project Cala Del Mar', exact: true }),
  ).toHaveAttribute('href', '/developers/ellington/projects/cala-del-mar');
  await expect(page.getByRole('rowheader', { name: 'Handover target', exact: true })).toBeVisible();
  await expect(page.locator('main')).toHaveCount(1);
  const accessibility = await new AxeBuilder({ page }).include('.comparison-page').analyze();
  expect(accessibility.violations).toEqual([]);
});

test('comparison selections sync between tabs without reload', async ({ page, context }) => {
  await page.goto('/');
  await page
    .getByRole('button', { name: 'Compare project: Artistry Two Residences', exact: true })
    .click();
  const second = await context.newPage();
  await second.goto('/projects/compare');
  await expect(
    second.getByRole('combobox', { name: 'Choose project 1', exact: true }),
  ).toContainText('Artistry Two Residences');
  await selectValue(
    second.getByRole('combobox', { name: 'Choose project 2', exact: true }),
    'aldar-project-01',
  );
  await expect(
    page.getByRole('button', { name: 'Compare project: Yas Riva Reserve', exact: true }),
  ).toHaveAttribute('aria-pressed', 'true');
  await expect(page.locator('.comparison-select[aria-pressed="true"]')).toHaveCount(2);
  await second.getByRole('button', { name: 'Clear comparison', exact: true }).click();
  await expect(page.locator('.comparison-select[aria-pressed="true"]')).toHaveCount(0);
});

test('comparison ignores retired sample selections and retains valid saved choices', async ({
  page,
}) => {
  await page.addInitScript(() =>
    localStorage.setItem(
      'aliyas-compare-projects',
      JSON.stringify(['creek-waters', 'gardenia-bay', 'the-acres', 'sobha-solis']),
    ),
  );
  await page.goto('/projects/compare');
  await expect(page.getByRole('columnheader')).toHaveCount(3);
  await expect(page.getByRole('table')).toContainText('Gardenia Bay');
  await expect(page.getByRole('table')).toContainText('Sobha Solis');
  await expect(page.getByRole('table')).not.toContainText(/Creek Waters|The Acres/);
  await expect(
    page.locator('.comparison-selectors select option[value="creek-waters"]'),
  ).toHaveCount(0);
  await expect(page.locator('.comparison-selectors select option[value="the-acres"]')).toHaveCount(
    0,
  );
});

test('comparison remains usable on mobile without overflowing the page', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.addInitScript(() =>
    localStorage.setItem(
      'aliyas-compare-projects',
      JSON.stringify(['sobha-solis', 'gardenia-bay', 'cala-del-mar']),
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
