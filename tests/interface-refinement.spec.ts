import { selectValue } from './select-control';
import { openCities, emirates, assertNoOverflow } from './current-ui';
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
  await page.locator('.hp-advanced summary').click();
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
  await page.goto('/developers/sobha/projects/sobha-solis');
  await page.locator('.pd-mobile-enquiry button').click();
  const dialog = page.getByRole('dialog');
  const trigger = dialog.getByRole('combobox', { name: 'I am looking for', exact: true });
  await trigger.click();
  const option = page
    .getByRole('listbox', { name: 'I am looking for', exact: true })
    .getByRole('option', { name: 'An investment', exact: true });
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
  await selectValue(
    page.getByRole('combobox', { name: 'Choose project 1', exact: true }),
    'sobha-project-19',
  );
  await selectValue(
    page.getByRole('combobox', { name: 'Choose project 2', exact: true }),
    'aldar-project-21',
  );
  await expect(page.getByRole('table')).toBeVisible();
  await expect(page.getByRole('table')).toContainText('Sobha Solis');
  await expect(page.getByRole('table')).toContainText('Gardenia Bay');
});

test('light and dark dropdowns and destination navigation pass accessibility checks', async ({
  page,
}) => {
  for (const theme of ['light', 'dark']) {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/');
    await page.evaluate((t) => {
      localStorage.setItem('aliyas-theme', t);
      document.documentElement.dataset.theme = t;
    }, theme);
    await page.getByRole('combobox', { name: 'Choose emirate', exact: true }).click();
    expect(
      (
        await new AxeBuilder({ page })
          .include('.home-search')
          .include('.brand-select-menu')
          .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
          .analyze()
      ).violations,
    ).toEqual([]);
    await page.keyboard.press('Escape');
    await openCities(page);
    expect(
      (
        await new AxeBuilder({ page })
          .include('#signature-navigation-panel')
          .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
          .analyze()
      ).violations,
    ).toEqual([]);
  }
});

test('all destinations and developer logo assets retain correct targets and responsive containment', async ({
  page,
}) => {
  test.setTimeout(90000);
  for (const width of [320, 390, 768, 1024, 1440]) {
    await page.setViewportSize({ width, height: 950 });
    await page.goto('/');
    const panel = await openCities(page);
    for (const city of emirates) {
      const card = panel
        .locator('.signature-city-card')
        .filter({ has: page.getByRole('heading', { name: city, exact: true }) });
      expect(
        new URL((await card.getAttribute('href'))!, page.url()).searchParams.get('emirate'),
      ).toBe(city);
      expect((await card.boundingBox())!.height).toBeGreaterThanOrEqual(44);
    }
    await assertNoOverflow(page);
  }
  await page.goto('/');
  const group = page.locator('.developer-marquee-group').first();
  await expect(group.locator('a')).toHaveCount(30);
  for (const logo of await group.locator('img').all()) {
    await logo.scrollIntoViewIfNeeded();
    await logo.evaluate((e: HTMLImageElement) => e.decode());
    await expect(logo).toHaveCSS('object-fit', 'contain');
    expect(
      await logo.evaluate((e) => {
        const b = e.getBoundingClientRect(),
          p = e.parentElement!.getBoundingClientRect();
        return (
          b.left >= p.left - 1 &&
          b.right <= p.right + 1 &&
          b.top >= p.top - 1 &&
          b.bottom <= p.bottom + 1
        );
      }),
    ).toBe(true);
  }
});

test('marquee moves automatically supports pause hover and keyboard and honours reduced motion', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.goto('/');
  const rail = page.locator('.developer-marquee');
  await rail.scrollIntoViewIfNeeded();
  await page.mouse.move(0, 0);
  const track = page.locator('.developer-marquee-track'),
    initial = await track.evaluate((e) => getComputedStyle(e).transform);
  await expect.poll(() => track.evaluate((e) => getComputedStyle(e).transform)).not.toBe(initial);
  const pause = page.getByRole('button', { name: 'Pause developer logos' });
  await pause.click();
  await expect(track).toHaveCSS('animation-play-state', 'paused');
  await page.getByRole('button', { name: 'Resume developer logos' }).click();
  await page.mouse.move(0, 0);
  await page.locator('.hp-hero-actions a').focus();
  await rail.scrollIntoViewIfNeeded();
  await expect(track).toHaveCSS('animation-play-state', 'running');
  await page.locator('.developer-marquee-window').hover();
  await expect(track).toHaveCSS('animation-play-state', 'paused');
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await expect(track).toHaveCSS('animation-name', 'none');
  await page.keyboard.press('Tab');
  const last = page.locator('.developer-marquee-group').first().locator('a').last();
  await last.focus();
  await expect(last).toBeInViewport();
});
