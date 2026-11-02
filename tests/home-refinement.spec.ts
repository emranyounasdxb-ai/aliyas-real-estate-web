import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test('home discovery order, copy and compact sections work at all priority widths', async ({
  page,
}) => {
  for (const width of [320, 390, 768, 1024, 1440]) {
    await page.setViewportSize({ width, height: 844 });
    await page.goto('/');
    await expect(page.locator('.future-hero-eyebrow')).toContainText('UAE OFF-PLAN HOMES');
    await expect(
      page.getByRole('link', { name: 'Explore off-plan projects', exact: true }),
    ).toHaveAttribute('href', '#find-a-home');
    const order = await page
      .locator('main section')
      .evaluateAll((es) => es.map((e) => e.classList[0]));
    expect(order.indexOf('future-collection')).toBe(order.indexOf('future-developers') + 1);
    expect(order.indexOf('curated-living')).toBe(order.indexOf('future-collection') + 1);
    await expect(page.locator('.perspective-journey h3')).toHaveText([
      'Discover',
      'Shortlist',
      'Connect',
    ]);
    if (width < 701) {
      expect((await page.locator('.curated-living').boundingBox())!.height).toBeLessThan(710);
      expect((await page.locator('.rich-perspective').boundingBox())!.height).toBeLessThan(760);
    }
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(
      width,
    );
  }
});

test('home save and comparison share catalogue persistence, deselection and the three-project limit', async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  const first = page.locator('.future-project').first();
  await first.getByRole('button', { name: 'Save Creek Waters', exact: true }).click();
  await expect(
    first.getByRole('button', { name: 'Unsave Creek Waters', exact: true }),
  ).toHaveAttribute('aria-pressed', 'true');
  await first.getByRole('button', { name: 'Compare project: Creek Waters', exact: true }).click();
  await first.getByRole('link', { name: 'View comparison', exact: true }).click();
  await expect(page).toHaveURL(/\/projects\/compare$/);
  await expect(page.getByRole('combobox', { name: 'PROJECT 01', exact: true })).toHaveValue(
    'creek-waters',
  );
  await page.goto('/projects?saved=1');
  await expect(page.locator('.project-card')).toHaveCount(1);
  await expect(
    page.getByRole('button', { name: 'Unsave Creek Waters', exact: true }),
  ).toBeVisible();
  await page.goto('/');
  for (const card of (await page.locator('.future-project').all()).slice(1, 3))
    await card.locator('.comparison-select').click();
  await page.locator('.future-project').last().locator('.comparison-select').click();
  await expect(page.locator('.future-project').last().getByRole('status')).toContainText(
    'up to 3 projects',
  );
  await expect(page.locator('.comparison-select[aria-pressed="true"]')).toHaveCount(3);
  await page.reload();
  await expect(page.locator('.comparison-select[aria-pressed="true"]')).toHaveCount(3);
  await page.locator('.future-project').first().locator('.comparison-select').click();
  await expect(page.locator('.comparison-select[aria-pressed="true"]')).toHaveCount(2);
});

test.describe('mobile lifestyle rail', () => {
  test.use({ hasTouch: true, isMobile: true });
  test('native swipes, arrows, keyboard and vertical exit work in both motion modes', async ({
    page,
  }) => {
    test.setTimeout(90000);
    const cdp = await page.context().newCDPSession(page);
    const swipe = async (x1: number, y1: number, x2: number, y2: number) => {
      await cdp.send('Input.dispatchTouchEvent', {
        type: 'touchStart',
        touchPoints: [{ x: x1, y: y1 }],
      });
      for (let n = 1; n <= 10; n++) {
        await cdp.send('Input.dispatchTouchEvent', {
          type: 'touchMove',
          touchPoints: [{ x: x1 + ((x2 - x1) * n) / 10, y: y1 + ((y2 - y1) * n) / 10 }],
        });
        await page.waitForTimeout(25);
      }
      await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
    };
    for (const reducedMotion of ['reduce', 'no-preference'] as const)
      for (const width of [320, 390]) {
        await page.emulateMedia({ reducedMotion });
        await page.setViewportSize({ width, height: 844 });
        await page.goto('/');
        const rail = page.getByRole('region', { name: 'Ways of living', exact: true });
        await rail.scrollIntoViewIfNeeded();
        await expect(
          page.getByRole('button', { name: 'Previous lifestyle collection', exact: true }),
        ).toBeDisabled();
        const bounds = (await rail.boundingBox())!;
        await swipe(width - 42, Math.max(150, bounds.y + 100), 45, Math.max(150, bounds.y + 100));
        await expect.poll(() => rail.evaluate((e) => e.scrollLeft)).toBeGreaterThan(100);
        await page.getByRole('button', { name: 'Next lifestyle collection', exact: true }).tap();
        await expect(
          page.getByRole('button', { name: 'Next lifestyle collection', exact: true }),
        ).toBeDisabled();
        await expect(page.getByLabel('Visible lifestyle collection')).toContainText('03');
        await rail.focus();
        await page.keyboard.press('Home');
        await expect.poll(() => rail.evaluate((e) => e.scrollLeft)).toBeLessThan(2);
        await rail.focus();
        await page.keyboard.press('End');
        await expect(page.getByLabel('Visible lifestyle collection')).toContainText('03');
        await rail.scrollIntoViewIfNeeded();
        const nextBox = (await rail.boundingBox())!,
          before = await page.evaluate(() => scrollY),
          y = Math.min(680, nextBox.y + nextBox.height - 20);
        await swipe(width / 2, y, width / 2, y - 140);
        await expect.poll(() => page.evaluate(() => scrollY)).toBeGreaterThan(before + 60);
        expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(
          width,
        );
      }
    await cdp.detach();
  });
});

test('both themes keep home actions touch-sized and the editorial covers loaded', async ({
  page,
}) => {
  for (const width of [320, 390, 768, 1024, 1440])
    for (const theme of ['light', 'dark']) {
      await page.setViewportSize({ width, height: 1000 });
      await page.goto('/');
      await page.evaluate((t) => localStorage.setItem('aliyas-theme', t), theme);
      await page.reload();
      const first = page.locator('.future-project').first();
      await first.locator('.comparison-select').click();
      for (const control of await first
        .locator('.home-project-actions button,.home-project-actions a')
        .all())
        expect((await control.boundingBox())!.height).toBeGreaterThanOrEqual(44);
      await page.locator('.future-journal').scrollIntoViewIfNeeded();
      const images = page.locator('.journal-home-image img');
      await images.evaluateAll((es) =>
        es.forEach((i) => {
          (i as HTMLImageElement).loading = 'eager';
        }),
      );
      await expect
        .poll(() =>
          images.evaluateAll((es) =>
            es.every(
              (i) => (i as HTMLImageElement).complete && (i as HTMLImageElement).naturalWidth > 0,
            ),
          ),
        )
        .toBe(true);
      await expect(images.nth(1)).toHaveAttribute('src', /journal-neighbourhood-study\.svg$/);
      await expect(images.nth(2)).toHaveAttribute('src', /journal-floor-plan-study\.svg$/);
      expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(
        width,
      );
      if (width === 390) {
        const axe = await new AxeBuilder({ page })
          .include('.home-project-actions')
          .include('.lifestyle-controls')
          .include('.perspective-journey')
          .include('.future-journal')
          .analyze();
        expect(axe.violations).toEqual([]);
      }
      await page.evaluate(() => localStorage.removeItem('aliyas-compare-projects'));
    }
});
