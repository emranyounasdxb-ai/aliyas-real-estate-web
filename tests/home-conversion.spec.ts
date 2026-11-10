import { expect, test } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { selectValue } from './select-control';

test('shortlist preferences arrive in the enquiry and stay current when changed', async ({
  page,
}) => {
  await page.goto('/');
  await page.getByRole('radio', { name: 'An investment', exact: true }).check();
  await selectValue(page.getByRole('combobox', { name: 'Shortlist emirate' }), 'Dubai');
  await selectValue(page.getByRole('combobox', { name: 'Shortlist budget' }), 'AED 2M–5M');
  const trigger = page.getByRole('button', { name: 'Request my shortlist' });
  await trigger.click();
  const dialog = page.getByRole('dialog');
  await expect(dialog.getByRole('combobox', { name: 'I am looking for' })).toContainText(
    'An investment',
  );
  const message = dialog.getByRole('textbox', { name: 'Your message' });
  await expect(message).toHaveValue(/Preferred emirate: Dubai\./);
  await expect(message).toHaveValue(/Budget: AED 2M–5M\./);
  await expect(dialog.getByRole('textbox', { name: 'Full name' })).toBeFocused();
  await page.keyboard.press('Escape');
  await expect(dialog).not.toBeVisible();
  await expect(trigger).toBeFocused();
  await selectValue(page.getByRole('combobox', { name: 'Shortlist emirate' }), 'Abu Dhabi');
  await trigger.click();
  await expect(message).toHaveValue(/Preferred emirate: Abu Dhabi\./);
  await expect(message).not.toHaveValue(/Preferred emirate: Dubai\./);
  let submitted: Record<string, unknown> = {};
  await page.route('**/api/enquiries', async (route) => {
    submitted = route.request().postDataJSON();
    await route.fulfill({
      status: 201,
      json: { reference: 'ALY-BRIEFTEST', delivery: 'accepted' },
    });
  });
  await dialog.getByRole('textbox', { name: 'Full name' }).fill('Homepage Test');
  await dialog.getByRole('textbox', { name: 'Email address' }).fill('home@example.test');
  await dialog.getByRole('checkbox').check();
  await dialog.getByRole('button', { name: 'Send your enquiry' }).click();
  await expect(dialog.getByText('ALY-BRIEFTEST')).toBeVisible();
  expect(submitted.interest).toBe('An investment');
  expect(submitted.message).toContain('Abu Dhabi');
});

test('advanced search can collapse without losing selections and clears incompatible areas', async ({
  page,
}) => {
  await page.goto('/');
  const more = page.locator('.hp-advanced summary');
  await more.focus();
  await page.keyboard.press('Enter');
  await expect(page.getByRole('combobox', { name: 'Choose property type' })).toBeVisible();
  await selectValue(page.getByRole('combobox', { name: 'Choose emirate' }), 'Dubai');
  await selectValue(page.getByRole('combobox', { name: 'Choose area or community' }), 'dubai-jvc');
  await selectValue(page.getByRole('combobox', { name: 'Choose property type' }), 'Apartment');
  await more.click();
  await expect(more).toContainText('2 selected');
  await selectValue(page.getByRole('combobox', { name: 'Choose emirate' }), 'Abu Dhabi');
  await expect(more).toContainText('1 selected');
  await more.click();
  await expect(page.getByRole('combobox', { name: 'Choose area or community' })).toContainText(
    'All areas',
  );
  await expect(page.getByRole('combobox', { name: 'Choose property type' })).toContainText(
    'Apartment',
  );
  await page.getByRole('button', { name: 'Clear filters' }).click();
  await expect(page.getByRole('combobox', { name: 'Choose emirate' })).toContainText(
    'All emirates',
  );
  await expect(page.getByRole('combobox', { name: 'Choose property type' })).toContainText(
    'Any property',
  );
});

test('enquiry keeps the brief when the server rejects submission', async ({ page }) => {
  await page.route('**/api/enquiries', (route) =>
    route.fulfill({ status: 429, json: { error: 'Please wait before sending another enquiry.' } }),
  );
  await page.goto('/');
  await page.getByRole('button', { name: 'Request my shortlist' }).click();
  const dialog = page.getByRole('dialog');
  await dialog.getByRole('textbox', { name: 'Full name' }).fill('Homepage Test');
  await dialog.getByRole('textbox', { name: 'Email address' }).fill('home@example.test');
  await dialog.getByRole('checkbox').check();
  await dialog.getByRole('button', { name: 'Send your enquiry' }).click();
  await expect(dialog.getByRole('alert')).toContainText('Please wait');
  await expect(dialog.getByRole('textbox', { name: 'Your message' })).toHaveValue(
    /property shortlist/,
  );
  await expect(dialog.getByRole('button', { name: 'Send your enquiry' })).toBeEnabled();
});

for (const width of [320, 390, 768, 1440, 1920]) {
  test(`homepage controls stay readable and inside the viewport at ${width}px`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto('/');
    await expect(page.getByRole('button', { name: 'Request my shortlist' })).toBeEnabled();
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(
      width,
    );
    const header = await page.locator('.site-header').boundingBox();
    const title = await page.locator('#hp-title').boundingBox();
    expect(title!.y).toBeGreaterThan(header!.y + header!.height);
    const controls = page.locator('.hp-search-primary').locator('input[type=search],button');
    for (const control of await controls.all()) {
      const box = await control.boundingBox();
      if (!box) continue;
      expect(box.width).toBeGreaterThan(80);
      expect(box.height).toBeGreaterThanOrEqual(44);
      expect(box.x).toBeGreaterThanOrEqual(0);
      expect(box.x + box.width).toBeLessThanOrEqual(width);
    }
    await page.locator('.hp-service').scrollIntoViewIfNeeded();
    await expect(page.locator('.hp-tagline')).toBeVisible();
  });
}

for (const theme of ['light', 'dark']) {
  test(`homepage and shortlist dialog meet WCAG AA checks in ${theme} mode`, async ({ page }) => {
    await page.goto('/');
    await page.evaluate((value) => (document.documentElement.dataset.theme = value), theme);
    const home = await new AxeBuilder({ page })
      .include('.hp-home')
      .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
      .analyze();
    expect(home.violations).toEqual([]);
    await page.getByRole('button', { name: 'Request my shortlist' }).click();
    const drawer = await new AxeBuilder({ page })
      .include('dialog[open]')
      .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
      .analyze();
    expect(drawer.violations).toEqual([]);
  });
}

test('featured projects have their own images, official facts and working destination links', async ({
  page,
  request,
}) => {
  await page.goto('/');
  const cards = page.locator('[data-home-project]');
  await expect(cards).toHaveCount(2);
  await expect(cards.first()).toContainText('AED 2.3M');
  await expect(cards.last()).toContainText('Inland villas from');
  await expect(cards.last()).toContainText('AED 7.9M');
  expect(
    new Set(
      await cards
        .locator('img')
        .evaluateAll((images) => images.map((image) => image.getAttribute('src'))),
    ).size,
  ).toBe(2);
  for (const card of await cards.all()) {
    const href = await card
      .getByRole('link', { name: 'View project', exact: true })
      .getAttribute('href');
    expect((await request.get(href!)).status()).toBe(200);
    await expect(card.getByRole('link', { name: 'Developer information' })).toHaveAttribute(
      'href',
      /^https:\/\/www\.(select-group\.ae|aldar\.com)\//,
    );
  }
  await expect(page.locator('.developer-marquee-group:not([aria-hidden]) a')).toHaveCount(30);
  await expect(page.locator('.hp-team')).toHaveCount(0);
});
