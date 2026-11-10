import { expect, test, type Locator, type Page } from '@playwright/test';
import { selectValue } from './select-control';

test.setTimeout(90_000);

async function openCityMenu(page: Page) {
  await page
    .getByRole('navigation', { name: 'Explore navigation' })
    .getByRole('button', { name: 'Off plan projects' })
    .click();
  return page.locator('#signature-navigation-panel');
}

async function choose(control: Locator, value: string) {
  await selectValue(control, value);
}

test('homepage uses the project catalogue, property types and newest journal stories', async ({
  page,
}) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { level: 1 })).toContainText('A new address.');
  await expect(page.locator('[data-home-project]')).toHaveCount(2);
  await expect(page.locator('.hp-destination')).toHaveCount(0);
  await expect(page.locator('.hp-type-links a')).toHaveCount(3);
  await expect(page.locator('.hp-hero-details')).toContainText('575');
  await expect(page.locator('.hp-journal-grid time').first()).toHaveAttribute(
    'datetime',
    '2026-07-19',
  );
  for (const [label, type] of [
    ['Apartments', 'Apartment'],
    ['Villas', 'Villa'],
    ['Townhouses', 'Townhouse'],
  ]) {
    const link = page.locator('.hp-type-links').getByRole('link', { name: label });
    const href = await link.getAttribute('href');
    expect(new URL(href!, page.url()).searchParams.get('type')).toBe(type);
  }
});

test('homepage search sends the correct location, area, property and budget', async ({ page }) => {
  await page.goto('/');
  await choose(page.getByRole('combobox', { name: 'Choose emirate' }), 'Dubai');
  await page.locator('.hp-advanced summary').click();
  await choose(page.getByRole('combobox', { name: 'Choose area or community' }), 'dubai-jvc');
  await choose(page.getByRole('combobox', { name: 'Choose property type' }), 'Apartment');
  await choose(page.getByRole('combobox', { name: 'Choose budget' }), '2000000');
  await page.locator('.home-search').getByRole('button', { name: 'Explore projects' }).click();
  await expect(page).toHaveURL(
    (url) =>
      url.pathname === '/projects' &&
      url.searchParams.get('emirate') === 'Dubai' &&
      url.searchParams.get('area') === 'dubai-jvc' &&
      url.searchParams.get('type') === 'Apartment' &&
      url.searchParams.get('budget') === '2000000',
  );
  await expect(page.getByRole('combobox', { name: 'Location', exact: true })).toContainText(
    'Dubai',
  );
  await expect(page.locator('.catalogue-count')).not.toContainText('0 projects');
});

test('switching emirates updates the existing catalogue without an RSC navigation', async ({
  page,
}) => {
  await page.goto('/projects?emirate=Dubai');
  await expect(page.locator('.catalogue-count')).toContainText('426 projects');
  const panel = await openCityMenu(page);
  let navigations = 0;
  page.on('request', (request) => {
    const url = new URL(request.url());
    if (
      url.pathname === '/projects' &&
      url.searchParams.has('_rsc') &&
      url.searchParams.get('emirate') === 'Abu Dhabi'
    )
      navigations += 1;
  });
  await panel
    .locator('.signature-city-card')
    .filter({ has: page.getByRole('heading', { name: 'Abu Dhabi', exact: true }) })
    .click();
  await expect(page).toHaveURL((url) => url.searchParams.get('emirate') === 'Abu Dhabi');
  await expect(page.locator('.catalogue-count')).toContainText('79 projects');
  await expect(page.getByRole('combobox', { name: 'Location', exact: true })).toContainText(
    'Abu Dhabi',
  );
  expect(navigations).toBe(0);
  await page.goBack();
  await expect(page.locator('.catalogue-count')).toContainText('426 projects');
});

test('mixed property types appear under both relevant filters', async ({ page }) => {
  for (const type of ['Apartment', 'Townhouse']) {
    await page.goto(`/projects?type=${type}&q=Vista%20Ridge`);
    await expect(page.locator('.catalogue-owned-card')).toHaveCount(1);
    await expect(page.locator('.catalogue-owned-card')).toContainText('Vista Ridge');
    await expect(page.locator('.catalogue-owned-card')).toContainText('Apartment / Townhouse');
  }
});

test('homepage keyword search and catalogue-driven office filter find matching projects', async ({
  page,
}) => {
  await page.goto('/');
  await page
    .getByRole('searchbox', { name: 'Search by project or developer' })
    .fill('Artistry Two');
  await page.locator('.home-search').getByRole('button', { name: 'Explore projects' }).click();
  await expect(page).toHaveURL((url) => url.searchParams.get('q') === 'Artistry Two');
  await expect(page.locator('.catalogue-owned-card')).toHaveCount(1);
  await expect(page.locator('.catalogue-owned-card')).toContainText('Artistry Two Residences');
  await page.goto('/projects?type=Office');
  await expect(page.locator('.catalogue-count')).toContainText('8 projects');
  await expect(page.getByRole('combobox', { name: 'Property type', exact: true })).toContainText(
    'Office',
  );
});

test('saved and compared catalogue projects remain connected to their own records', async ({
  page,
}) => {
  await page.goto('/');
  const cards = page.locator('[data-home-project]');
  const first = cards.nth(0);
  const second = cards.nth(1);
  const firstId = await first.getAttribute('data-home-project');
  const firstName = await first.locator('h3').innerText();
  const secondName = await second.locator('h3').innerText();
  await first.getByRole('button', { name: `Save ${firstName}` }).click();
  await first.getByRole('button', { name: `Compare project: ${firstName}` }).click();
  await second.getByRole('button', { name: `Compare project: ${secondName}` }).click();
  await page.goto('/projects?saved=1');
  await expect(page.locator('.catalogue-owned-card')).toHaveCount(1);
  await expect(page.locator('.catalogue-owned-card')).toHaveAttribute('data-project-id', firstId!);
  await expect(page.locator('.catalogue-owned-card')).toContainText(firstName);
  await page.goto('/projects/compare');
  await expect(page.getByRole('table')).toBeVisible();
  await expect(page.getByRole('table')).toContainText(firstName);
  await expect(page.getByRole('table')).toContainText(secondName);
  await page.reload();
  await expect(page.getByRole('table')).toContainText(firstName);
});

test('enquiry validates and reports the server result without sending a real message', async ({
  page,
}) => {
  let calls = 0;
  await page.route('**/api/enquiries', async (route) => {
    calls += 1;
    await route.fulfill({
      status: 201,
      json: { reference: 'ALY-LOCALTEST01', delivery: 'not_configured' },
    });
  });
  await page.goto('/');
  await page
    .locator('.hp-home-plan')
    .getByRole('button', { name: 'Plan my property search' })
    .click();
  const dialog = page.getByRole('dialog');
  await expect(dialog).toBeVisible();
  await dialog.getByRole('button', { name: 'Send your enquiry' }).click();
  expect(calls).toBe(0);
  await dialog.getByRole('textbox', { name: 'Full name' }).fill('Preview Test');
  await dialog.getByRole('textbox', { name: 'Email address' }).fill('preview@example.test');
  await dialog
    .getByRole('textbox', { name: 'Your message' })
    .fill('Please share project details with me.');
  await dialog.getByRole('checkbox').check();
  await dialog.getByRole('button', { name: 'Send your enquiry' }).click();
  await expect(dialog.getByText('ALY-LOCALTEST01')).toBeVisible();
  expect(calls).toBe(1);
});

test('mobile homepage and search are usable with reduced motion', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 720 });
  await page.goto('/');
  await expect(page.locator('.hp-destination')).toHaveCount(0);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  const cards = page.locator('[data-home-project]');
  for (const card of [cards.nth(0), cards.nth(1)]) {
    const name = await card.locator('h3').innerText();
    await card.getByRole('button', { name: `Compare project: ${name}` }).click();
  }
  for (const control of await page
    .locator('.hp-project-card :is(button, .comparison-card-link)')
    .all()) {
    const box = await control.boundingBox();
    expect(box).not.toBeNull();
    expect(box!.x).toBeGreaterThanOrEqual(0);
    expect(box!.x + box!.width).toBeLessThanOrEqual(320);
  }
  await choose(page.getByRole('combobox', { name: 'Choose emirate' }), 'Ajman');
  await page.locator('.home-search').getByRole('button', { name: 'Explore projects' }).click();
  await expect(page).toHaveURL(
    (url) => url.pathname === '/projects' && url.searchParams.get('emirate') === 'Ajman',
  );
  await expect(page.locator('.catalogue-count')).toContainText('3 projects');
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});
