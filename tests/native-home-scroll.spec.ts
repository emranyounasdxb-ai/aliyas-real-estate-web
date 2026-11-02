import { expect, test } from '@playwright/test';

test.describe('native home collection scrolling', () => {
  test.use({ hasTouch: true, isMobile: true });
  test('a finger starting inside the project rail can scroll the page while native horizontal browsing remains available', async ({
    page,
  }) => {
    test.setTimeout(90_000);
    const touch = await page.context().newCDPSession(page);
    const gesture = async (x1: number, y1: number, x2: number, y2: number) => {
      await touch.send('Input.dispatchTouchEvent', {
        type: 'touchStart',
        touchPoints: [{ x: x1, y: y1 }],
      });
      for (let step = 1; step <= 10; step++) {
        await touch.send('Input.dispatchTouchEvent', {
          type: 'touchMove',
          touchPoints: [{ x: x1 + ((x2 - x1) * step) / 10, y: y1 + ((y2 - y1) * step) / 10 }],
        });
        await page.waitForTimeout(25);
      }
      await touch.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
    };
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
        await page.evaluate(() => document.fonts.ready);
        if (reducedMotion === 'no-preference')
          await expect(page.locator('html')).toHaveClass(/lenis/);
        const rail = page.locator('.future-rail-viewport');
        await rail.scrollIntoViewIfNeeded();
        const bounds = await rail.evaluate((e) => {
          const box = e.getBoundingClientRect(),
            header = document.querySelector('.site-header')!.getBoundingClientRect();
          return {
            x: box.left + box.width / 2,
            top: Math.max(box.top, header.bottom + 12),
            bottom: Math.min(box.bottom, innerHeight - 16),
          };
        });
        const startY = bounds.bottom - 8,
          endY = Math.max(bounds.top + 8, startY - 180);
        expect(
          await page.evaluate(
            ({ x, y }) =>
              Boolean(document.elementFromPoint(x, y)?.closest('.future-rail-viewport')),
            { x: bounds.x, y: startY },
          ),
        ).toBe(true);
        const before = await page.evaluate(() => scrollY);
        await gesture(bounds.x, startY, bounds.x, endY);
        await expect.poll(() => page.evaluate(() => scrollY)).toBeGreaterThan(before + 70);
        if (
          !(await page
            .locator('[data-collection-section]')
            .evaluate((e) => e.classList.contains('is-pinned')))
        ) {
          await rail.scrollIntoViewIfNeeded();
          const box = (await rail.boundingBox())!;
          const y = Math.max(100, Math.min(height * 0.5, box.y + box.height * 0.5));
          const left = await rail.evaluate((e) => e.scrollLeft);
          await gesture(box.x + box.width - 24, y, box.x + 24, y);
          await expect.poll(() => rail.evaluate((e) => e.scrollLeft)).toBeGreaterThan(left + 50);
          await expect
            .poll(() => page.locator('[data-collection-current]').innerText())
            .not.toBe('01');
        }
        expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(
          width,
        );
      }
    await touch.detach();
  });
});
