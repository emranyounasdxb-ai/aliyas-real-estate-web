import { selectValue } from './select-control';
import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test('home search preserves emirate, property type and budget', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { level: 1 })).toContainText('BEYOND.');
  await selectValue(page.getByRole('combobox', { name: 'Choose emirate' }), 'Dubai');
  await selectValue(page.getByRole('combobox', { name: 'Choose property type' }), 'Apartment');
  await selectValue(page.getByRole('combobox', { name: 'Choose budget' }), '2000000');
  await page.getByRole('button', { name: 'Explore projects', exact: true }).click();
  await expect(page).toHaveURL(/\/projects\?emirate=Dubai&type=Apartment&budget=2000000/);
  await expect(page.getByRole('combobox', { name: 'Location' })).toContainText('Dubai');
  await expect(page.locator('.project-card')).toHaveCount(2);
  await expect(page.locator('.catalogue-count')).toContainText('2 projects to explore');
});

test('project filters show an empty state and reset to the whole collection', async ({ page }) => {
  await page.goto('/projects');
  await expect(page.locator('.project-card')).toHaveCount(6);
  await selectValue(page.getByRole('combobox', { name: 'Location' }), 'Abu Dhabi');
  await expect(page.locator('.project-card')).toHaveCount(1);
  await expect(page.getByRole('heading', { name: 'Gardenia Bay', exact: true })).toBeVisible();
  await page.getByRole('textbox', { name: 'Search projects' }).fill('no matching project xyz');
  await expect(
    page.getByRole('heading', { name: 'A little change opens new possibilities.' }),
  ).toBeVisible();
  await expect(page.locator('.project-card')).toHaveCount(0);
  await page.getByRole('button', { name: 'Explore all projects', exact: true }).click();
  await expect(page.locator('.project-card')).toHaveCount(6);
  await expect(page.getByRole('textbox', { name: 'Search projects' })).toHaveValue('');
  await expect(page.getByRole('combobox', { name: 'Location' })).toContainText('All emirates');
});

test('shortlisted projects persist across reloads and can be removed', async ({ page }) => {
  await page.goto('/projects');
  await page.getByRole('button', { name: 'Save Creek Waters', exact: true }).click();
  await expect(
    page.getByRole('button', { name: 'Unsave Creek Waters', exact: true }),
  ).toHaveAttribute('aria-pressed', 'true');
  await page.reload();
  await expect(
    page.getByRole('button', { name: 'Unsave Creek Waters', exact: true }),
  ).toHaveAttribute('aria-pressed', 'true');
  await page.getByRole('button', { name: 'Saved (1)', exact: true }).click();
  await expect(page.locator('.project-card')).toHaveCount(1);
  await page.getByRole('button', { name: 'Unsave Creek Waters', exact: true }).click();
  await expect(page.locator('.project-card')).toHaveCount(0);
  await expect(page.getByText('Save a project with the heart icon to find it here.')).toBeVisible();
});

test('project detail leads to a prefilled enquiry and validates required fields', async ({
  page,
}) => {
  await page.goto('/projects');
  await page.getByRole('link', { name: 'Explore Creek Waters', exact: true }).click();
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Creek Waters');
  await page
    .getByRole('button', { name: 'Enquire about this project', exact: true })
    .first()
    .click();
  const enquiry = page.getByRole('dialog');
  await expect(enquiry).toBeVisible();
  await expect(enquiry.locator('.enquiry-project')).toContainText('Creek Waters');
  await expect(enquiry.getByRole('combobox', { name: 'I am looking for' })).toContainText(
    'A specific project',
  );
  let submitted = false;
  page.on('request', (request) => {
    if (request.method() === 'POST' && request.url().includes('/api/enquiries')) submitted = true;
  });
  await page.getByRole('button', { name: 'Send your enquiry' }).click();
  await expect(enquiry.locator('input[name="name"]')).toBeFocused();
  expect(submitted).toBe(false);
});

test('enquiry keeps details after failed responses and shows only a confirmed receipt', async ({
  page,
}) => {
  const submitted: unknown[] = [];
  const responses = [
    { status: 503, body: { error: 'Enquiry service unavailable. Please try again.' } },
    { status: 200, body: {} },
    { status: 201, body: { reference: 'ALIYAS-E2E-MOCK-RECEIPT' } },
  ];
  await page.route('**/api/enquiries', async (route) => {
    submitted.push(route.request().postDataJSON());
    const response = responses.shift();
    if (!response) throw new Error('Unexpected extra enquiry submission');
    await route.fulfill({
      status: response.status,
      contentType: 'application/json',
      body: JSON.stringify(response.body),
    });
  });
  await page.goto('/contact?project=creek-waters');
  await page.getByRole('textbox', { name: 'Full name' }).fill('Browser Test Person');
  await page.getByRole('textbox', { name: 'Email address' }).fill('browser-test@example.test');
  await page
    .getByRole('textbox', { name: 'Your message' })
    .fill('I would like to learn about this property.');
  await page.getByRole('checkbox').check();
  await page.getByRole('button', { name: 'Send your enquiry' }).click();
  await expect(page.locator('.enquiry-form').getByRole('alert')).toHaveText(
    'Enquiry service unavailable. Please try again.',
  );
  await expect(page.locator('.enquiry-success')).toHaveCount(0);
  await expect(page.getByRole('textbox', { name: 'Full name' })).toHaveValue('Browser Test Person');
  await page.getByRole('button', { name: 'Send your enquiry' }).click();
  await expect(page.locator('.enquiry-form').getByRole('alert')).toHaveText(
    'We could not save your enquiry. Please try again.',
  );
  await expect(page.locator('.enquiry-success')).toHaveCount(0);
  await page.getByRole('button', { name: 'Send your enquiry' }).click();
  await expect(page.locator('.enquiry-success')).toContainText('ALIYAS-E2E-MOCK-RECEIPT');
  await expect(page.locator('main .enquiry-form')).toHaveCount(0);
  await expect(
    page.getByText(/This preview stores enquiries locally. No email has been sent./),
  ).toBeVisible();
  expect(submitted).toHaveLength(3);
  expect(submitted[2]).toMatchObject({
    name: 'Browser Test Person',
    email: 'browser-test@example.test',
    project: 'creek-waters',
    consent: true,
  });
});

test('journal index opens a complete article', async ({ page }) => {
  await page.goto('/journal');
  await page.locator('a[href="/journal/a-home-that-feels-like-you"]').first().click();
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('A home that feels like you.');
  await expect(
    page.getByRole('heading', { name: 'Start with your everyday rituals' }),
  ).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Leave room for life to change' })).toBeVisible();
});

test('developer index opens its profile and associated project', async ({ page }) => {
  await page.goto('/developers');
  await page.locator('.catalogue-developer-card[href="/developers/emaar"]').click();
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Discover projectsby Emaar.');
  await expect(page.getByRole('heading', { name: 'Emaar Project 01', exact: true })).toBeVisible();
  await page.getByRole('link', { name: 'Explore Emaar Project 01', exact: true }).click();
  await expect(page).toHaveURL(/\/developers\/emaar\/projects\/emaar-project-01$/);
});

test('mobile navigation supports Escape, focus return and navigation', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  const toggle = page.getByRole('button', { name: 'Open menu' });
  await toggle.click();
  await expect(page.getByRole('navigation', { name: 'Mobile navigation' })).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.getByRole('navigation', { name: 'Mobile navigation' })).toHaveCount(0);
  await expect(toggle).toBeFocused();
  await toggle.click();
  await page
    .getByRole('navigation', { name: 'Mobile navigation' })
    .getByRole('button', { name: 'Developers', exact: true })
    .click();
  await page.getByRole('link', { name: 'View all developers', exact: true }).click();
  await expect(page).toHaveURL(/\/developers$/);
  await expect(page.getByRole('navigation', { name: 'Mobile navigation' })).toHaveCount(0);
});

test('mobile core pages have no horizontal overflow', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  for (const route of [
    '/',
    '/projects',
    '/projects/creek-waters',
    '/developers',
    '/journal',
    '/contact',
  ]) {
    await page.goto(route);
    const dimensions = await page.evaluate(() => ({
      viewport: window.innerWidth,
      document: document.documentElement.scrollWidth,
      body: document.body.scrollWidth,
    }));
    expect(dimensions.document, `${route} document overflow`).toBeLessThanOrEqual(
      dimensions.viewport + 1,
    );
    expect(dimensions.body, `${route} body overflow`).toBeLessThanOrEqual(dimensions.viewport + 1);
  }
});

for (const route of ['/', '/projects', '/projects/creek-waters', '/contact']) {
  test(`${route} has no automated WCAG A/AA accessibility violations`, async ({ page }) => {
    await page.goto(route);
    await page.evaluate(() => document.fonts.ready);
    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze();
    const failures = results.violations.map((violation) => ({
      rule: violation.id,
      impact: violation.impact,
      affected: violation.nodes.map((node) => node.target.join(' ')),
    }));
    expect(failures).toEqual([]);
  });
}

test('core pages load images without browser runtime errors', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  page.on('console', (message) => {
    if (
      message.type() === 'error' &&
      /content security policy|refused to|\bcsp\b/i.test(message.text())
    ) {
      errors.push(message.text());
    }
  });
  for (const route of [
    '/',
    '/projects',
    '/projects/creek-waters',
    '/developers/emaar',
    '/journal/a-home-that-feels-like-you',
    '/contact',
  ]) {
    const response = await page.goto(route);
    expect(response?.status(), route).toBe(200);
    await page.locator('main').waitFor();
    await expect(page.getByRole('heading', { level: 1 })).toHaveCount(1);
    const visibleImages = page.locator('img:visible');
    for (const image of await visibleImages.all()) {
      await image.scrollIntoViewIfNeeded();
      await expect
        .poll(() =>
          image.evaluate(
            (element: HTMLImageElement) => element.complete && element.naturalWidth > 0,
          ),
        )
        .toBe(true);
    }
  }
  expect(errors).toEqual([]);
});
