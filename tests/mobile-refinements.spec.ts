import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test('mobile card metadata, prices and save controls have clear separate rows and comfortable targets', async ({ page }) => {
  for (const width of [320, 390, 768, 1024, 1440]) {
    await page.setViewportSize({ width, height: 950 });
    await page.goto('/projects');
    const card = page.locator('.project-card').first();
    await expect(card).toBeVisible();
    if (width <= 700) {
      const save = card.getByRole('button', { name: 'Save Creek Waters', exact: true });
      const target = (await save.boundingBox())!;
      expect(target.width).toBeGreaterThanOrEqual(44);
      expect(target.height).toBeGreaterThanOrEqual(44);
      const geometry = await card.evaluate((element) => {
        const specs = [...element.querySelectorAll('.project-meta > span')].map((item) => item.getBoundingClientRect().toJSON());
        return { specs, price: element.querySelector('.project-card-bottom > span:first-child')!.getBoundingClientRect().toJSON(), plan: element.querySelector('.project-plan')!.getBoundingClientRect().toJSON(), badge: element.querySelector('.project-card-badge')!.getBoundingClientRect().toJSON(), developer: element.querySelector('.project-card-developer')!.getBoundingClientRect().toJSON() };
      });
      expect(geometry.specs[1].left).toBeGreaterThan(geometry.specs[0].right);
      expect(geometry.specs[2].top).toBeGreaterThanOrEqual(geometry.specs[0].bottom);
      expect(geometry.plan.left >= geometry.price.right || geometry.plan.top >= geometry.price.bottom).toBe(true);
      expect(target.y).toBeGreaterThan(geometry.badge.bottom);
      expect(target.y).toBeGreaterThanOrEqual(geometry.developer.bottom);
      await save.click();
      await expect(card.getByRole('button', { name: 'Unsave Creek Waters', exact: true })).toHaveAttribute('aria-pressed', 'true');
      await card.getByRole('button', { name: 'Unsave Creek Waters', exact: true }).click();
    }
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  }
});

test('mobile developer plates leave most of the preview visible and tagline/footer spacing is deliberate', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/developers');
  const card = page.locator('.catalogue-developer-card').first();
  const plate = (await card.locator('.developer-mark').boundingBox())!, image = (await card.locator('.developer-brand-visual').boundingBox())!;
  expect(plate.width).toBeLessThan(image.width * .4);
  expect(plate.height).toBeLessThan(image.height * .35);
  const tagline = (await card.locator(':scope > p').boundingBox())!, footer = (await card.locator(':scope > div').last().boundingBox())!;
  expect(footer.y - (tagline.y + tagline.height)).toBeLessThanOrEqual(16);
  await card.click();
  await expect(page).toHaveURL(/\/developers\/emaar$/);
});

test('mobile listing and developer refinements remain accessible in both themes and contain 15 owned project cards', async ({ page }) => {
  for (const theme of ['light', 'dark']) for (const width of [320, 390]) {
    await page.setViewportSize({ width, height: 950 });
    await page.goto('/');
    await page.evaluate((value) => { localStorage.setItem('aliyas-theme', value); document.documentElement.dataset.theme = value; }, theme);
    for (const route of ['/projects', '/developers', '/developers/emaar']) {
      await page.goto(route);
      if (route === '/developers/emaar') {
        await expect(page.locator('.developer-project-placeholder')).toHaveCount(15);
        expect(await page.locator('.developer-project-placeholder').evaluateAll((cards) => cards.every((card) => card.getAttribute('data-developer') === 'emaar'))).toBe(true);
      }
      const result = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze();
      expect(result.violations.map(({ id, nodes }) => ({ id, targets: nodes.map((node) => node.target) }))).toEqual([]);
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    }
  }
});
