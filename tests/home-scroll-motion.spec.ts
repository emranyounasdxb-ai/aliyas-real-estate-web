import { expect, test, type Page } from '@playwright/test';

async function pointAtJourney(page: Page) {
  const rail = page.locator('.hp-journey-viewport');
  await rail.scrollIntoViewIfNeeded();
  const point = await rail.evaluate((el) => {
    const rect = el.getBoundingClientRect();
    const header = document.querySelector('.site-header')!.getBoundingClientRect();
    return {
      x: rect.left + rect.width / 2,
      y: (Math.max(rect.top, header.bottom + 16) + Math.min(rect.bottom, innerHeight - 24)) / 2,
    };
  });
  await page.mouse.move(point.x, point.y);
  return { rail, point };
}

for (const reducedMotion of ['no-preference', 'reduce'] as const) {
  for (const width of [390, 1440]) {
    test(`vertical mouse wheel crosses the photo strip in both directions at ${width}px with ${reducedMotion} motion`, async ({
      page,
    }) => {
      await page.emulateMedia({ reducedMotion });
      await page.setViewportSize({ width, height: 900 });
      await page.goto('/');
      if (reducedMotion === 'no-preference')
        await expect(page.locator('html')).toHaveClass(/lenis/);
      const { rail } = await pointAtJourney(page);
      if (width === 390) {
        await page.mouse.wheel(420, 0);
        await expect.poll(() => rail.evaluate((el) => el.scrollLeft)).toBeGreaterThan(100);
      }
      const before = await page.evaluate(() => scrollY);
      await page.mouse.wheel(0, 600);
      await expect.poll(() => page.evaluate(() => scrollY)).toBeGreaterThan(before + 300);
      if (reducedMotion === 'no-preference')
        await expect(page.locator('html')).not.toHaveClass(/lenis-scrolling/);
      await pointAtJourney(page);
      const lower = await page.evaluate(() => scrollY);
      await page.mouse.wheel(0, -500);
      await expect.poll(() => page.evaluate(() => scrollY)).toBeLessThan(lower - 250);
      expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(
        width,
      );
    });
  }
}

test.describe('touch input on the photo strip', () => {
  test.use({ hasTouch: true, isMobile: true, viewport: { width: 390, height: 844 } });
  test('vertical touch moves the page and horizontal touch still browses the photos', async ({
    page,
  }) => {
    const touch = await page.context().newCDPSession(page);
    const swipe = async (from: [number, number], to: [number, number]) => {
      await touch.send('Input.dispatchTouchEvent', {
        type: 'touchStart',
        touchPoints: [{ x: from[0], y: from[1] }],
      });
      for (let step = 1; step <= 10; step++) {
        await touch.send('Input.dispatchTouchEvent', {
          type: 'touchMove',
          touchPoints: [
            {
              x: from[0] + ((to[0] - from[0]) * step) / 10,
              y: from[1] + ((to[1] - from[1]) * step) / 10,
            },
          ],
        });
        await page.waitForTimeout(25);
      }
      await touch.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
    };
    for (const reducedMotion of ['no-preference', 'reduce'] as const) {
      await page.emulateMedia({ reducedMotion });
      await page.goto('/');
      if (reducedMotion === 'no-preference')
        await expect(page.locator('html')).toHaveClass(/lenis/);
      const { rail, point } = await pointAtJourney(page);
      const before = await page.evaluate(() => scrollY);
      await swipe([point.x, point.y + 80], [point.x, point.y - 100]);
      await expect.poll(() => page.evaluate(() => scrollY)).toBeGreaterThan(before + 70);
      const next = await pointAtJourney(page);
      await swipe([340, next.point.y], [40, next.point.y]);
      await expect.poll(() => rail.evaluate((el) => el.scrollLeft)).toBeGreaterThan(100);
    }
    await touch.detach();
  });
});

test('mouse scrolling triggers visible one-time reveals, and motion preferences clean them up', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/');
  await expect(page.locator('html')).toHaveClass(/lenis/);
  const image = page.locator('.hp-project-image').first();
  await expect(image).toHaveCSS('opacity', '0');
  const target = await image.evaluate(
    (el) => el.getBoundingClientRect().top + scrollY - innerHeight * 0.6,
  );
  const animation = image.evaluate(
    (el) =>
      new Promise<boolean>((resolve) => {
        let intermediate = false;
        const observer = new MutationObserver(() => {
          const opacity = Number(getComputedStyle(el).opacity);
          if (opacity > 0 && opacity < 1) intermediate = true;
          if (opacity === 1) {
            observer.disconnect();
            clearTimeout(timer);
            resolve(intermediate);
          }
        });
        const timer = setTimeout(() => {
          observer.disconnect();
          resolve(false);
        }, 8000);
        observer.observe(el, { attributes: true, attributeFilter: ['style'] });
      }),
  );
  await page.mouse.move(720, 500);
  await page.mouse.wheel(0, target / 0.9);
  expect(await animation).toBe(true);
  await expect(image).toHaveCSS('opacity', '1');
  await expect(image).toHaveCSS('transform', 'none');
  await page.mouse.wheel(0, -5000);
  await expect.poll(() => page.evaluate(() => scrollY)).toBe(0);
  await expect(image).toHaveCSS('opacity', '1');

  await page.emulateMedia({ reducedMotion: 'reduce' });
  await expect(page.locator('html')).not.toHaveClass(/lenis/);
  expect(
    await page
      .locator('.hp-home [data-reveal]')
      .evaluateAll((nodes) =>
        nodes.every(
          (node) =>
            getComputedStyle(node).opacity === '1' && getComputedStyle(node).transform === 'none',
        ),
      ),
  ).toBe(true);
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await expect(page.locator('html')).toHaveClass(/lenis/);
  await expect(image).toHaveCSS('opacity', '0');

  const trigger = page.getByRole('button', { name: 'Plan my property search' });
  await page.keyboard.press('Tab');
  await trigger.focus();
  await expect(page.locator('.hp-home-plan-copy')).toHaveCSS('opacity', '1');
  await page.keyboard.press('Enter');
  await expect(page.getByRole('dialog')).toBeVisible();
  await expect(page.locator('html')).toHaveClass(/lenis-stopped/);
  await page.keyboard.press('Escape');
  await expect(trigger).toBeFocused();
  await expect(page.locator('html')).not.toHaveClass(/lenis-stopped/);
  const before = await page.evaluate(() => scrollY);
  await page.mouse.move(720, 600);
  await page.mouse.wheel(0, -500);
  await expect.poll(() => page.evaluate(() => scrollY)).toBeLessThan(before - 250);
});

test('scroll motion survives client navigation back to the homepage', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.goto('/');
  await page.locator('.hp-journey').getByRole('link', { name: 'Discover', exact: true }).click();
  await expect(page).toHaveURL(/\/projects$/);
  await page.goBack();
  await expect(page).toHaveURL(/\/$/);
  await expect(page.locator('html')).toHaveClass(/lenis/);
  await pointAtJourney(page);
  await expect(page.locator('.hp-journey-panel').first()).toHaveCSS('opacity', '1');
  const before = await page.evaluate(() => scrollY);
  await page.mouse.wheel(0, 500);
  await expect.poll(() => page.evaluate(() => scrollY)).toBeGreaterThan(before + 200);
});
