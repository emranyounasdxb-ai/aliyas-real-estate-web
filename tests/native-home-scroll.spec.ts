import { expect, test } from '@playwright/test';
import { touchGesture, assertNoOverflow } from './current-ui';
test.describe('native home journey scrolling', () => {
  test.use({ hasTouch: true, isMobile: true });
  test('vertical touch exits the journey while horizontal gestures browse its smaller-screen panels', async ({
    page,
  }) => {
    test.setTimeout(120000);
    for (const reducedMotion of ['no-preference', 'reduce'] as const)
      for (const [width, height] of [
        [320, 844],
        [390, 844],
        [568, 320],
        [768, 1024],
        [1024, 768],
        [1440, 900],
      ]) {
        await page.emulateMedia({ reducedMotion });
        await page.setViewportSize({ width, height });
        await page.goto('/');
        if (reducedMotion === 'no-preference')
          await expect(page.locator('html')).toHaveClass(/lenis/);
        const rail = page.locator('.hp-journey-viewport');
        await rail.scrollIntoViewIfNeeded();
        const b = await rail.evaluate((e) => {
          const r = e.getBoundingClientRect(),
            h = document.querySelector('.site-header')!.getBoundingClientRect();
          return {
            x: r.left + r.width / 2,
            top: Math.max(r.top, h.bottom + 12),
            bottom: Math.min(r.bottom, innerHeight - 16),
          };
        });
        const y = b.bottom - 8,
          end = Math.max(b.top + 8, y - 180),
          before = await page.evaluate(() => scrollY);
        expect(
          await page.evaluate(
            (p) => Boolean(document.elementFromPoint(p.x, p.y)?.closest('.hp-journey-viewport')),
            { x: b.x, y },
          ),
        ).toBe(true);
        await touchGesture(page, b.x, y, b.x, end);
        await expect.poll(() => page.evaluate(() => scrollY)).toBeGreaterThan(before + 70);
        if (width <= 1100) {
          await rail.scrollIntoViewIfNeeded();
          const r = (await rail.boundingBox())!;
          const ty = Math.max(100, Math.min(height * 0.5, r.y + r.height * 0.5));
          const left = await rail.evaluate((e) => e.scrollLeft);
          await touchGesture(page, r.x + r.width - 24, ty, r.x + 24, ty);
          await expect.poll(() => rail.evaluate((e) => e.scrollLeft)).toBeGreaterThan(left + 50);
          await expect(page.locator('.hp-journey-controls [role=status]')).not.toContainText('01');
        }
        await assertNoOverflow(page);
      }
  });
});
