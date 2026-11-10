import { expect, test } from '@playwright/test';

test.describe('article reading navigation', () => {
  test.use({ hasTouch: true, isMobile: true });

  test('project section links also keep a single measured offset with smooth motion', async ({
    page,
  }) => {
    await page.emulateMedia({ reducedMotion: 'no-preference' });
    for (const width of [390, 1024]) {
      await page.setViewportSize({ width, height: 844 });
      for (const route of [
        '/developers/sobha/projects/sobha-solis',
        '/developers/emaar/projects/avelia',
      ]) {
        await page.goto(route);
        const nav = page.getByRole('navigation', { name: 'Project sections' });
        await nav.getByRole('link', { name: 'Payment plan', exact: true }).tap();
        await expect(page).toHaveURL(/#payment-plan$/);
        await expect
          .poll(async () => {
            const section = await page.locator('#payment-plan').boundingBox();
            const bounds = await nav.boundingBox();
            return Math.abs(section!.y - bounds!.y - bounds!.height - 24);
          })
          .toBeLessThan(3);
      }
    }
  });

  test('touch contents links use one header offset in both motion modes and native reading scroll remains free', async ({
    page,
  }) => {
    test.setTimeout(60_000);
    const touch = await page.context().newCDPSession(page);
    for (const reducedMotion of ['no-preference', 'reduce'] as const) {
      await page.emulateMedia({ reducedMotion });
      for (const width of [320, 390, 768]) {
        await page.setViewportSize({ width, height: 844 });
        await page.goto('/journal/a-home-that-feels-like-you');
        const summary = page.locator('.article-contents summary');
        await summary.tap();
        await expect(page.locator('.article-contents')).not.toHaveAttribute('open');
        await summary.focus();
        await page.keyboard.press('Enter');
        await expect(page.locator('.article-contents')).toHaveAttribute('open');
        await page
          .getByRole('navigation', { name: 'Article contents' })
          .getByRole('link', {
            name: 'Think in light, texture and proportion',
            exact: true,
          })
          .tap();
        await expect(page).toHaveURL(/#story-section-3$/);
        await expect
          .poll(async () =>
            page.locator('#story-section-3').evaluate((element) => {
              const header = document.querySelector('header.site-header')!.getBoundingClientRect();
              return Math.abs(element.getBoundingClientRect().top - header.bottom - 24);
            }),
          )
          .toBeLessThan(3);
        const before = await page.evaluate(() => scrollY);
        await touch.send('Input.dispatchTouchEvent', {
          type: 'touchStart',
          touchPoints: [{ x: width / 2, y: 650 }],
        });
        for (let step = 1; step <= 10; step++) {
          await touch.send('Input.dispatchTouchEvent', {
            type: 'touchMove',
            touchPoints: [{ x: width / 2, y: 650 - step * 28 }],
          });
          await page.waitForTimeout(25);
        }
        await touch.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
        await expect.poll(() => page.evaluate(() => scrollY)).toBeGreaterThan(before + 100);
        await page.locator('.catalogue-back').tap();
        await expect(page).toHaveURL(/\/journal$/);
      }
    }
    await touch.detach();
  });
});
