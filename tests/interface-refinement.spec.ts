import { test, expect, type Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

async function choose(page: Page, label: string, option: string) {
  await page.getByRole('combobox', { name: label, exact: true }).click();
  await page.getByRole('option', { name: option, exact: true }).click();
}

test('home branded filters support keyboard, typeahead and query navigation', async ({ page }) => {
  await page.goto('/');
  const location = page.getByRole('combobox', { name: 'Choose emirate', exact: true });
  await location.focus();
  await page.keyboard.press('ArrowDown');
  await expect(page.getByRole('listbox')).toBeVisible();
  await page.keyboard.press('End');
  await page.keyboard.press('Enter');
  await expect(location).toContainText('Umm Al Quwain');
  await location.press('d');
  await page.keyboard.press('Enter');
  await expect(location).toContainText('Dubai');
  await location.click();
  await page.keyboard.press('Escape');
  await expect(location).toBeFocused();
  await expect(page.getByRole('listbox')).toHaveCount(0);
  await choose(page, 'Choose property type', 'Apartment');
  await choose(page, 'Choose budget', 'Up to AED 2M');
  await page.locator('.home-search button[type=submit]').click();
  await expect(page).toHaveURL(/emirate=Dubai&type=Apartment&budget=2000000/);
});

test('mobile native touch filters render above the modal and keep Escape scoped', async ({
  browser,
  baseURL,
}) => {
  const context = await browser.newContext({
    baseURL,
    viewport: { width: 320, height: 760 },
    isMobile: true,
    hasTouch: true,
    reducedMotion: 'reduce',
  });
  const page = await context.newPage();
  await page.goto('/projects');
  await page.getByRole('button', { name: 'Filters', exact: true }).tap();
  const dialog = page.getByRole('dialog');
  await dialog.getByRole('combobox', { name: 'Location', exact: true }).tap();
  const popup = page.getByRole('listbox');
  const box = (await popup.boundingBox())!;
  expect(box.x).toBeGreaterThanOrEqual(0);
  expect(box.x + box.width).toBeLessThanOrEqual(320);
  expect(box.y + box.height).toBeLessThanOrEqual(760);
  await page.getByRole('option', { name: 'Ajman', exact: true }).tap();
  await expect(dialog.getByRole('combobox', { name: 'Location', exact: true })).toContainText(
    'Ajman',
  );
  await expect(page).toHaveURL(/emirate=Ajman/);
  await dialog.getByRole('combobox', { name: 'Budget', exact: true }).tap();
  await page.keyboard.press('Escape');
  await expect(dialog).toBeVisible();
  await expect(popup).toHaveCount(0);
  await page.keyboard.press('Escape');
  await expect(dialog).not.toBeVisible();
  await context.close();
});

test('enquiry dropdown preserves form value without submitting and dismisses independently', async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/projects/creek-waters');
  await page.locator('.pd-mobile-enquiry button').click();
  const dialog = page.getByRole('dialog');
  const trigger = dialog.getByRole('combobox', { name: 'I am looking for', exact: true });
  await trigger.click();
  const option = page.getByRole('option').nth(1);
  const chosen = await option.textContent();
  await option.click();
  await expect(trigger).toContainText(chosen!);
  expect(
    await dialog
      .locator('form')
      .evaluate((form) => new FormData(form as HTMLFormElement).get('interest')),
  ).toBe(chosen);
  await trigger.click();
  await page.keyboard.press('Escape');
  await expect(dialog).toBeVisible();
  await expect(trigger).toBeFocused();
  await page.keyboard.press('Tab');
  await expect(trigger).not.toBeFocused();
  await page.keyboard.press('Escape');
  await expect(dialog).not.toBeVisible();
});

test('directory sorting and project comparison use the shared control', async ({ page }) => {
  await page.goto('/developers');
  await choose(page, 'Sort developers', 'Name: A to Z');
  await expect(page.locator('.catalogue-developer-wordmark').first()).toHaveText('Al Hamra');
  await page.getByRole('searchbox', { name: 'Search developers' }).fill('Emaar');
  await expect(page.locator('.catalogue-developer-card')).toHaveCount(1);
  await page.goto('/projects/compare');
  await choose(page, 'Choose project 1', 'Creek Waters · Emaar');
  await choose(page, 'Choose project 2', 'The Acres · Meraas');
  await expect(page.getByRole('table')).toBeVisible();
  await expect(page.getByRole('table')).toContainText('Creek Waters');
  await expect(page.getByRole('table')).toContainText('The Acres');
});

test('light and dark dropdowns and map pass relevant accessibility checks', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  for (const theme of ['light', 'dark']) {
    await page.locator('html').evaluate((el, value) => el.setAttribute('data-theme', value), theme);
    await page.getByRole('combobox', { name: 'Choose emirate', exact: true }).click();
    const results = await new AxeBuilder({ page })
      .include('.home-search')
      .include('.brand-select-menu')
      .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
      .analyze();
    expect(
      results.violations.map(({ id, nodes }) => ({ id, targets: nodes.map((n) => n.target) })),
    ).toEqual([]);
    await page.keyboard.press('Escape');
    await page.locator('#home-destinations').scrollIntoViewIfNeeded();
    const mapResults = await new AxeBuilder({ page })
      .include('#home-destinations')
      .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
      .analyze();
    expect(
      mapResults.violations.map(({ id, nodes }) => ({ id, targets: nodes.map((n) => n.target) })),
    ).toEqual([]);
  }
});

test('map destinations, logo assets and responsive containment remain intact', async ({ page }) => {
  await page.goto('/');
  for (const width of [320, 390, 768, 1024, 1440]) {
    await page.setViewportSize({ width, height: 950 });
    await page.locator('#home-destinations').scrollIntoViewIfNeeded();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
      true,
    );
    for (const city of ['Dubai', 'Abu Dhabi', 'Ras Al Khaimah', 'Ajman']) {
      const button = page.getByRole('button', { name: `Show ${city} on map`, exact: true });
      await button.click();
      await expect(button).toHaveAttribute('aria-pressed', 'true');
      await expect(
        page.getByRole('link', { name: `Explore projects in ${city}`, exact: true }).last(),
      ).toHaveAttribute('href', `/projects?emirate=${encodeURIComponent(city)}`);
      const box = (await button.boundingBox())!;
      expect(box.height).toBeGreaterThanOrEqual(44);
    }
  }
  await page.locator('.developer-marquee').scrollIntoViewIfNeeded();
  await expect(page.locator('.developer-marquee-group').first().locator('a')).toHaveCount(30);
  for (const logo of await page.locator('.developer-marquee-group').first().locator('img').all()) {
    await logo.scrollIntoViewIfNeeded();
    await expect
      .poll(() =>
        logo.evaluate(
          (image) =>
            (image as HTMLImageElement).complete && (image as HTMLImageElement).naturalWidth > 0,
        ),
      )
      .toBe(true);
    expect(
      await logo.evaluate((image) => {
        const box = image.getBoundingClientRect(),
          parent = image.parentElement!.getBoundingClientRect();
        return (
          box.left >= parent.left &&
          box.right <= parent.right + 1 &&
          box.top >= parent.top &&
          box.bottom <= parent.bottom + 1
        );
      }),
    ).toBe(true);
  }
  const logos = await page
    .locator('.developer-marquee-group')
    .first()
    .locator('img')
    .evaluateAll((images) =>
      images.map((image) => {
        const img = image as HTMLImageElement;
        return {
          complete: img.complete,
          width: img.naturalWidth,
          fit: getComputedStyle(img).objectFit,
        };
      }),
    );
  expect(logos.every((img) => img.complete && img.width > 0 && img.fit === 'contain')).toBe(true);
});

test('marquee moves without playback controls and honours reduced motion', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.goto('/');
  await page.locator('.developer-marquee').scrollIntoViewIfNeeded();
  await page.mouse.move(0, 0);
  const track = page.locator('.developer-marquee-track');
  const initial = await track.evaluate((el) => getComputedStyle(el).transform);
  await expect.poll(() => track.evaluate((el) => getComputedStyle(el).transform)).not.toBe(initial);
  await expect(page.getByRole('button', { name: /\b(pause|play|resume)\b/i })).toHaveCount(0);
  await page.locator('.developer-marquee-window').hover();
  await expect(track).toHaveCSS('animation-play-state', 'paused');
  await page.locator('#home-destinations').scrollIntoViewIfNeeded();
  const pulse = page.locator('.atlas-pulse').first();
  await expect(pulse).toHaveCSS('animation-play-state', 'running');
  const opacity = await pulse.evaluate((el) => getComputedStyle(el).opacity);
  await expect.poll(() => pulse.evaluate((el) => getComputedStyle(el).opacity)).not.toBe(opacity);
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await expect(track).toHaveCSS('animation-name', 'none');
  await expect(pulse).toHaveCSS('animation-name', 'none');
});
