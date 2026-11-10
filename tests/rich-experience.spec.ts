import { openCities, emirates, assertNoOverflow } from './current-ui';
import { expect, test } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test('curated collection URLs retain their selected records and browser history after clearing', async ({
  page,
}) => {
  for (const [slug, count] of [
    ['waterfront', 2],
    ['villas', 3],
    ['city', 1],
  ] as const) {
    await page.goto('/projects?collection=' + slug);
    await expect(page.locator('.project-card')).toHaveCount(count);
    await expect(page.locator('.curated-filter-note')).toBeVisible();
    await page.getByRole('button', { name: 'Clear collection' }).click();
    await expect(page.locator('.project-card')).toHaveCount(15);
    await expect(page.locator('.catalogue-count')).toContainText('575');
    await expect(page).not.toHaveURL(/collection=/);
    await page.goBack();
    await expect(page.locator('.project-card')).toHaveCount(count);
  }
});

test('destination navigation and catalogue filter stay synchronized at phone tablet and desktop sizes', async ({
  page,
}) => {
  test.setTimeout(90000);
  for (const width of [320, 768, 1440]) {
    await page.setViewportSize({ width, height: 950 });
    for (const name of emirates) {
      await page.goto('/');
      const panel = await openCities(page);
      await panel
        .locator('.signature-city-card')
        .filter({ has: page.getByRole('heading', { name, exact: true }) })
        .click();
      await expect(page).toHaveURL((url) => url.searchParams.get('emirate') === name);
      if (width < 701) await page.getByRole('button', { name: /^Filters/ }).click();
      await expect(
        page.getByRole('combobox', { name: 'Location', exact: true }).filter({ visible: true }),
      ).toContainText(name);
      await assertNoOverflow(page);
    }
  }
});

test('reviewed project galleries support thumbnails wraparound keyboard navigation and focus restoration', async ({
  page,
}) => {
  for (const [route, name] of [
    ['/developers/emaar/projects/avelia', 'Avelia'],
    ['/developers/sobha/projects/sobha-solis', 'Sobha Solis'],
  ]) {
    await page.goto(route);
    const thumbs = page.locator('.pd-gallery-thumbnails button'),
      count = await thumbs.count();
    expect(count).toBeGreaterThan(2);
    await thumbs.last().click();
    await expect(thumbs.last()).toHaveAttribute('aria-pressed', 'true');
    const trigger = page.locator('.pd-gallery-open');
    await trigger.click();
    const dialog = page.getByRole('dialog', { name: name + ' image gallery', exact: true });
    await expect(dialog).toBeVisible();
    const counter = dialog.locator('.pd-lightbox-controls p'),
      n = String(count).padStart(2, '0');
    await expect(counter).toContainText(n + ' / ' + n);
    await page.keyboard.press('ArrowRight');
    await expect(counter).toContainText('01 / ' + n);
    await page.keyboard.press('ArrowLeft');
    await expect(counter).toContainText(n + ' / ' + n);
    await page.keyboard.press('Escape');
    await expect(trigger).toBeFocused();
    await expect(dialog).not.toBeVisible();
    const tile = page.locator('.pd-gallery-tile').first();
    await tile.click();
    await expect(counter).toContainText('02 / ' + n);
    await page.keyboard.press('Escape');
    await expect(tile).toBeFocused();
  }
});

test('hero wheel input reaches search at every breakpoint and reduced motion keeps the primary link usable', async ({
  page,
}) => {
  for (const width of [390, 768, 1440]) {
    await page.emulateMedia({ reducedMotion: 'no-preference' });
    await page.setViewportSize({ width, height: 1000 });
    await page.goto('/');
    await expect(page.locator('html')).toHaveClass(/lenis/);
    const image = page.locator('.hp-hero-background');
    await image.evaluate((e: HTMLImageElement) => e.decode());
    await page.mouse.move(width / 2, 400);
    await page.mouse.wheel(0, 600);
    await expect.poll(() => page.evaluate(() => scrollY)).toBeGreaterThan(300);
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await expect(page.locator('html')).not.toHaveClass(/lenis/);
    await page.getByRole('link', { name: 'Find my property', exact: true }).click();
    await expect(page.locator('#find-a-home')).toBeInViewport();
    await expect(page).toHaveURL(/#find-a-home$/);
  }
});

test('new home and gallery surfaces pass accessibility checks in both themes and sizes', async ({
  page,
}) => {
  for (const width of [390, 1440])
    for (const theme of ['light', 'dark']) {
      await page.setViewportSize({ width, height: 950 });
      await page.goto('/');
      await page.evaluate((value) => {
        localStorage.setItem('aliyas-theme', value);
        document.documentElement.dataset.theme = value;
      }, theme);
      for (const route of ['/', '/developers/emaar/projects/avelia']) {
        await page.goto(route);
        const result = await new AxeBuilder({ page })
          .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
          .analyze();
        expect(
          result.violations,
          JSON.stringify(
            result.violations.map(({ id, nodes }) => ({ id, targets: nodes.map((n) => n.target) })),
          ),
        ).toEqual([]);
        expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
          true,
        );
      }
    }
});
