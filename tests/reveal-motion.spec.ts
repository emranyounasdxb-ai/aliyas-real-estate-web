import { expect, test } from '@playwright/test';
test('one-time reveals appear on scroll, survive client navigation and respect reduced motion', async ({
  page,
}) => {
  for (const width of [390, 1440]) {
    await page.emulateMedia({ reducedMotion: 'no-preference' });
    await page.setViewportSize({ width, height: 1000 });
    await page.goto('/');
    await expect(page.locator('html')).toHaveClass(/lenis/);
    const target = page.locator('.hp-service-intro');
    await expect(target).toHaveCSS('opacity', '0');
    await target.evaluate((e) =>
      window.dispatchEvent(
        new CustomEvent('aliyas:scroll-to', {
          cancelable: true,
          detail: { top: e.getBoundingClientRect().top + scrollY - 220, immediate: true },
        }),
      ),
    );
    await expect(target).toHaveCSS('opacity', '1');
    await expect(target).toHaveCSS('transform', 'none');
    await page.locator('.site-footer a[href="/about"]').click();
    await expect(page).toHaveURL(/\/about$/);
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await expect(page.locator('html')).not.toHaveClass(/lenis/);
    await expect
      .poll(() =>
        page
          .locator('[data-reveal]')
          .evaluateAll((es) => es.every((e) => getComputedStyle(e).opacity === '1')),
      )
      .toBe(true);
    await page.emulateMedia({ reducedMotion: 'no-preference' });
    await expect(page.locator('html')).toHaveClass(/lenis/);
  }
});
