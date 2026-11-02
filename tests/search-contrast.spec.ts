import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

test('search placeholder is readable in both themes on phone and desktop', async ({ page }) => {
  const luminance = (rgb: number[]) =>
    rgb
      .map((channel) => {
        const value = channel / 255;
        return value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
      })
      .reduce((sum, value, index) => sum + value * [0.2126, 0.7152, 0.0722][index], 0);
  for (const theme of ['light', 'dark'])
    for (const width of [320, 390, 1440]) {
      await page.setViewportSize({ width, height: 844 });
      await page.goto('/');
      if ((await page.locator('html').getAttribute('data-theme')) !== theme)
        await page.locator('.theme-toggle').click();
      await page
        .locator('header')
        .getByRole('button', { name: 'Search projects', exact: true })
        .click();
      const colors = await page
        .locator('.signature-search-form input')
        .evaluate((input) => ({
          foreground: getComputedStyle(input, '::placeholder').color,
          background: getComputedStyle(input).backgroundColor,
        }));
      const fg = luminance(
          colors.foreground
            .match(/[\d.]+/g)!
            .slice(0, 3)
            .map(Number),
        ),
        bg = luminance(
          colors.background
            .match(/[\d.]+/g)!
            .slice(0, 3)
            .map(Number),
        );
      expect(
        (Math.max(fg, bg) + 0.05) / (Math.min(fg, bg) + 0.05),
        `${theme} ${width} placeholder contrast`,
      ).toBeGreaterThanOrEqual(4.5);
      if (width === 320) {
        const results = await new AxeBuilder({ page })
          .include('.signature-panel')
          .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
          .analyze();
        expect(
          results.violations.map((v) => ({ id: v.id, nodes: v.nodes.map((n) => n.target) })),
        ).toEqual([]);
      }
    }
});
