import { expect, test } from '@playwright/test';
import { assertNoOverflow } from './current-ui';

test('desktop wheel scrolling traverses the complete buying journey without a pin or scroll trap', async ({
  page,
}) => {
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(e.message));
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto('/');
  const rail = page.locator('.hp-journey-viewport');
  await rail.scrollIntoViewIfNeeded();
  await expect(page.locator('.pin-spacer')).toHaveCount(0);
  await expect(rail.locator('.hp-journey-panel')).toHaveCount(5);
  for (const panel of await rail.locator('.hp-journey-panel').all()) {
    const b = (await panel.boundingBox())!;
    expect(b.x).toBeGreaterThanOrEqual(0);
    expect(b.x + b.width).toBeLessThanOrEqual(1440);
    await expect(panel).toHaveCSS('opacity', '1');
  }
  const b = (await rail.boundingBox())!;
  await page.mouse.move(720, Math.max(110, Math.min(800, b.y + b.height / 2)));
  const before = await page.evaluate(() => scrollY);
  await page.mouse.wheel(0, 800);
  await expect.poll(() => page.evaluate(() => scrollY)).toBeGreaterThan(before + 500);
  expect(errors).toEqual([]);
});
test('keyboard focus reaches every featured project action and keeps it visible', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.goto('/');
  const cards = page.locator('[data-home-project]');
  await expect(cards).toHaveCount(2);
  expect(await cards.evaluateAll((es) => es.some((e) => (e as HTMLElement).inert))).toBe(false);
  await page.keyboard.press('Tab');
  for (const link of await page
    .locator('[data-home-project] a,[data-home-project] button:not(:disabled)')
    .all()) {
    await link.focus();
    await expect(link).toBeFocused();
    await expect(link).toBeInViewport();
    expect(
      await link.evaluate((e) => {
        const b = e.getBoundingClientRect();
        return b.left >= -1 && b.right <= innerWidth + 1;
      }),
    ).toBe(true);
  }
});
test('narrow screens retain horizontal browsing and vertical wheel input', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  for (const width of [390, 700]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto('/');
    await expect(page.locator('html')).toHaveClass(/lenis/);
    const rail = page.locator('.hp-journey-viewport');
    await rail.scrollIntoViewIfNeeded();
    const b = (await rail.boundingBox())!;
    await page.mouse.move(width / 2, Math.max(110, Math.min(750, b.y + b.height / 2)));
    await page.mouse.wheel(460, 0);
    await expect.poll(() => rail.evaluate((e) => e.scrollLeft)).toBeGreaterThan(100);
    await page.mouse.wheel(5000, 0);
    await expect(page.locator('.hp-journey-controls [role=status]')).toContainText('05');
    const before = await page.evaluate(() => scrollY);
    await page.mouse.wheel(0, 600);
    await expect.poll(() => page.evaluate(() => scrollY)).toBeGreaterThan(before + 300);
    await assertNoOverflow(page);
  }
});
test('motion preference and viewport changes preserve content and clean up animation', async ({
  page,
}) => {
  await page.goto('/');
  for (const reducedMotion of ['no-preference', 'reduce', 'no-preference', 'reduce'] as const) {
    await page.emulateMedia({ reducedMotion });
    if (reducedMotion === 'reduce') {
      await expect(page.locator('html')).not.toHaveClass(/lenis/);
      await expect
        .poll(() =>
          page
            .locator('[data-reveal]')
            .evaluateAll((es) => es.every((e) => getComputedStyle(e).opacity === '1')),
        )
        .toBe(true);
    } else await expect(page.locator('html')).toHaveClass(/lenis/);
    await expect(page.locator('.pin-spacer')).toHaveCount(0);
  }
  for (const size of [
    { width: 390, height: 650 },
    { width: 1440, height: 650 },
    { width: 1440, height: 1000 },
  ]) {
    await page.setViewportSize(size);
    await expect(page.locator('.hp-journey-panel')).toHaveCount(5);
    await assertNoOverflow(page);
  }
});
test('enquiry pauses inertia and client navigation restores scrolling and reveals', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.goto('/');
  await page.locator('.nav-contact').focus();
  await page.mouse.wheel(0, 500);
  await page.keyboard.press('Enter');
  await expect(page.getByRole('dialog')).toBeVisible();
  const locked = await page.evaluate(() => scrollY);
  await page.mouse.move(8, 450);
  await page.mouse.wheel(0, 800);
  await page.waitForTimeout(1300);
  expect(Math.abs((await page.evaluate(() => scrollY)) - locked)).toBeLessThan(2);
  await page.keyboard.press('Escape');
  await expect(page.getByRole('dialog')).not.toBeVisible();
  await page.mouse.move(500, 350);
  await page.mouse.wheel(0, 400);
  await expect.poll(() => page.evaluate(() => scrollY)).toBeGreaterThan(locked + 80);
  await page.locator('.desktop-nav a[href="/about"]').click();
  await expect(page).toHaveURL(/\/about$/);
  await expect(page.locator('.pin-spacer')).toHaveCount(0);
  await page.locator('.site-header a[href="/"]').first().click();
  await expect(page.locator('.hp-hero-copy')).toHaveCSS('opacity', '1');
  await expect(page.locator('.hp-journey-panel')).toHaveCount(5);
});
