import { expect, test } from '@playwright/test';

test('home anchors share the native header gap across sizes and motion modes and Back to top restores its focus target', async ({
  page,
}) => {
  test.setTimeout(90_000);
  for (const reducedMotion of ['no-preference', 'reduce'] as const) {
    await page.emulateMedia({ reducedMotion });
    for (const width of [320, 390, 768, 1024, 1440]) {
      await page.setViewportSize({ width, height: 844 });
      await page.goto('/');
      await page.locator('.future-hero-action').click();
      await expect(page).toHaveURL(/#find-a-home$/);
      await expect
        .poll(() =>
          page.locator('#find-a-home').evaluate((element) => {
            const header = document.querySelector('.site-header')!.getBoundingClientRect();
            return Math.abs(element.getBoundingClientRect().top - header.bottom - 24);
          }),
        )
        .toBeLessThan(3);
      if (width === 390 && reducedMotion === 'no-preference')
        await page.screenshot({ path: 'artifacts/overnight/cycle7-home-search-normal-after.png' });
      await page.locator('.footer-back-top').click();
      await expect.poll(() => page.evaluate(() => scrollY)).toBeLessThan(2);
      await expect(page.locator('#site-top')).toBeFocused();
      expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(
        width,
      );
    }
  }
});

test('keyboard skip bypasses header controls and the next tab reaches main content in both motion modes', async ({
  page,
}) => {
  for (const reducedMotion of ['no-preference', 'reduce'] as const) {
    await page.emulateMedia({ reducedMotion });
    for (const width of [320, 390, 768, 1024, 1440]) {
      await page.setViewportSize({ width, height: 844 });
      await page.goto('/journal');
      await page.keyboard.press('Tab');
      await expect(page.locator('.skip-link')).toBeFocused();
      await page.keyboard.press('Enter');
      await expect(page).toHaveURL(/#main-content$/);
      await page.keyboard.press('Tab');
      expect(await page.evaluate(() => document.activeElement?.closest('main') !== null)).toBe(
        true,
      );
    }
  }
});
