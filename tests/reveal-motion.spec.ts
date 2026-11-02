import { test, expect } from '@playwright/test';

test('one-time reveals appear on scroll, clean up on client navigation and remain visible with reduced motion', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  for (const width of [390, 1440]) {
    await page.setViewportSize({ width, height: 1000 });
    await page.goto('/');
    await expect(page.locator('html')).toHaveClass(/lenis/);
    const perspective = page.locator('.rich-perspective');
    await expect(perspective).toHaveCSS('opacity', '0');
    await page.evaluate(() => {
      const target = document.querySelector('.rich-perspective')!;
      window.dispatchEvent(
        new CustomEvent('aliyas:scroll-to', {
          cancelable: true,
          detail: { top: target.getBoundingClientRect().top + scrollY - 140, immediate: true },
        }),
      );
    });
    await expect(perspective).toHaveCSS('opacity', '1');
    await expect(perspective).toHaveCSS('transform', 'none');
    await page.getByRole('link', { name: 'Discover Aliyas', exact: true }).click();
    await expect(page).toHaveURL(/\/about$/);
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await expect(page.locator('html')).not.toHaveClass(/lenis/);
    expect(
      await page
        .locator('[data-reveal]')
        .evaluateAll((elements) =>
          elements.every((element) => getComputedStyle(element).opacity === '1'),
        ),
    ).toBe(true);
    await page.emulateMedia({ reducedMotion: 'no-preference' });
    await expect(page.locator('html')).toHaveClass(/lenis/);
  }
});
