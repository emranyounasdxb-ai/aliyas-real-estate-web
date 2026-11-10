import { expect, test } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { assertNoOverflow } from './current-ui';
test('landscape phone home keeps its primary action reachable and its image correctly framed', async ({
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
    await page.evaluate(() => document.fonts.ready);
    const action = page.getByRole('link', { name: 'Find my property', exact: true });
    await action.scrollIntoViewIfNeeded();
    await expect(action).toBeInViewport();
    const b = (await action.boundingBox())!;
    expect(b.height).toBeGreaterThanOrEqual(44);
    expect(b.y + b.height).toBeLessThanOrEqual(height + 1);
    const image = page.locator('.hp-hero-background');
    await expect
      .poll(() => image.evaluate((e: HTMLImageElement) => e.complete && e.naturalWidth > 0))
      .toBe(true);
    await expect(image).toHaveCSS('object-fit', 'cover');
    await assertNoOverflow(page);
  }
});
test('landscape composition stays accessible in both themes and its action reaches search', async ({
  page,
}) => {
  test.setTimeout(90000);
  for (const theme of ['light', 'dark'])
    for (const [width, height] of [
      [667, 375],
      [844, 390],
    ]) {
      await page.setViewportSize({ width, height });
      await page.goto('/');
      await page.evaluate((t) => {
        localStorage.setItem('aliyas-theme', t);
        document.documentElement.dataset.theme = t;
      }, theme);
      const scan = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
        .analyze();
      expect(
        scan.violations.map((v) => ({ id: v.id, targets: v.nodes.map((n) => n.target) })),
      ).toEqual([]);
      await page.getByRole('link', { name: 'Find my property', exact: true }).click();
      await expect(page).toHaveURL(/#find-a-home$/);
      await expect(page.locator('#find-a-home')).toBeInViewport();
    }
});
