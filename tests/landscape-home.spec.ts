import { expect, test } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test('landscape phone home keeps architecture and the primary action in the first viewport', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  for (const [width, height] of [
    [568, 320],
    [667, 375],
    [740, 360],
    [844, 390],
    [932, 430],
  ]) {
    await page.setViewportSize({ width, height });
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await expect(page.locator('html')).toHaveClass(/lenis/);
    const header = (await page.locator('.site-header').boundingBox())!;
    const action = (await page.locator('.future-hero-action').boundingBox())!;
    const art = (await page.locator('.future-hero-art').boundingBox())!;
    expect(action.y).toBeGreaterThanOrEqual(header.height);
    expect(action.y + action.height).toBeLessThanOrEqual(height);
    expect(action.height).toBeGreaterThanOrEqual(44);
    expect(art.y).toBeGreaterThanOrEqual(header.height);
    expect(art.y + art.height).toBeLessThanOrEqual(height);
    await expect(page.locator('.hero-view-controls button').first()).toHaveAttribute(
      'aria-pressed',
      'true',
    );
    await expect(page.locator('[data-architecture-layer]').nth(1)).toHaveCSS('opacity', '0');
    const caption = (await page.locator('.future-hero-caption').boundingBox())!;
    for (const button of await page.locator('.hero-view-controls button').all()) {
      const box = (await button.boundingBox())!;
      expect(box.width).toBeGreaterThanOrEqual(44);
      expect(box.height).toBeGreaterThanOrEqual(44);
      expect(box.y + box.height).toBeLessThanOrEqual(caption.y);
      expect(box.x).toBeGreaterThanOrEqual(art.x);
      expect(box.x + box.width).toBeLessThanOrEqual(art.x + art.width);
    }
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
      true,
    );
  }
});

test('landscape composition stays accessible in both themes and its action reaches search', async ({
  page,
}) => {
  for (const theme of ['light', 'dark'])
    for (const [width, height] of [
      [667, 375],
      [844, 390],
    ]) {
      await page.setViewportSize({ width, height });
      await page.goto('/');
      await page.evaluate((value) => {
        localStorage.setItem('aliyas-theme', value);
        document.documentElement.dataset.theme = value;
      }, theme);
      const scan = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
        .analyze();
      expect(
        scan.violations.map(({ id, nodes }) => ({ id, targets: nodes.map((node) => node.target) })),
      ).toEqual([]);
      await page.getByRole('link', { name: 'Explore off-plan projects', exact: true }).click();
      await expect(page).toHaveURL(/#find-a-home$/);
      await expect(page.locator('#find-a-home')).toBeInViewport();
    }
});
