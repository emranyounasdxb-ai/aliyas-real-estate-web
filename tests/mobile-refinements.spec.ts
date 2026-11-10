import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test('mobile card metadata, prices and save controls have clear separate rows and comfortable targets', async ({
  page,
}) => {
  for (const width of [320, 390, 768, 1024, 1440]) {
    await page.setViewportSize({ width, height: 950 });
    await page.goto('/projects?q=Sobha%20Solis');
    const card = page.locator('.project-card').first();
    await expect(card).toBeVisible();
    if (width <= 700) {
      const save = card.getByRole('button', { name: 'Save Sobha Solis', exact: true });
      const target = (await save.boundingBox())!;
      expect(target.width).toBeGreaterThanOrEqual(44);
      expect(target.height).toBeGreaterThanOrEqual(44);
      const compare = (await card
        .getByRole('button', { name: 'Compare project: Sobha Solis', exact: true })
        .boundingBox())!;
      expect(compare.height).toBeGreaterThanOrEqual(44);
      expect(Math.abs(compare.y - target.y)).toBeLessThanOrEqual(1);
      const geometry = await card.evaluate((element) => {
        const specs = [...element.querySelectorAll('.project-meta > span')].map((item) =>
          item.getBoundingClientRect().toJSON(),
        );
        return {
          specs,
          price: element
            .querySelector('.project-card-bottom > span:first-child')!
            .getBoundingClientRect()
            .toJSON(),
          plan: element.querySelector('.project-plan')!.getBoundingClientRect().toJSON(),
          developer: element
            .querySelector('.project-card-developer')!
            .getBoundingClientRect()
            .toJSON(),
        };
      });
      expect(geometry.specs[1].left).toBeGreaterThan(geometry.specs[0].right);
      for (let i = 0; i < geometry.specs.length; i++)
        for (let j = i + 1; j < geometry.specs.length; j++) {
          const a = geometry.specs[i],
            b = geometry.specs[j];
          expect(
            a.right <= b.left + 1 ||
              b.right <= a.left + 1 ||
              a.bottom <= b.top + 1 ||
              b.bottom <= a.top + 1,
          ).toBe(true);
        }
      expect(
        geometry.plan.left >= geometry.price.right || geometry.plan.top >= geometry.price.bottom,
      ).toBe(true);

      expect(target.y).toBeGreaterThanOrEqual(geometry.developer.bottom);
      await save.click();
      await expect(
        card.getByRole('button', { name: 'Unsave Sobha Solis', exact: true }),
      ).toHaveAttribute('aria-pressed', 'true');
      await card.getByRole('button', { name: 'Unsave Sobha Solis', exact: true }).click();
    }
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
      true,
    );
  }
});

test('mobile developer logos stay centered and metadata stays clear of project links', async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/developers');
  const card = page.locator('.catalogue-developer-card').first();
  const plate = (await card.locator('.developer-mark').boundingBox())!,
    stage = (await card.locator('.developer-logo-stage').boundingBox())!;
  expect(plate.width).toBeGreaterThanOrEqual(44);
  expect(plate.height).toBeGreaterThanOrEqual(44);
  expect(plate.width).toBeLessThanOrEqual(stage.width - 32);
  expect(plate.height).toBeLessThanOrEqual(stage.height - 32);
  expect(Math.abs(plate.x + plate.width / 2 - stage.x - stage.width / 2)).toBeLessThan(1);
  expect(Math.abs(plate.y + plate.height / 2 - stage.y - stage.height / 2)).toBeLessThan(1);
  await card.locator('.developer-mark img').evaluate((image: HTMLImageElement) => image.decode());
  const tagline = (await card.locator(':scope > p').boundingBox())!,
    registration = (await card.locator('.developer-registration').boundingBox())!,
    footer = (await card.locator('.developer-card-action').boundingBox())!;
  expect(registration.y).toBeGreaterThanOrEqual(tagline.y + tagline.height);
  expect(footer.y).toBeGreaterThanOrEqual(registration.y + registration.height);
  expect(footer.y - (registration.y + registration.height)).toBeLessThanOrEqual(16);
  await card.click();
  await expect(page).toHaveURL(/\/developers\/emaar$/);
});

for (const theme of ['light', 'dark'])
  for (const width of [320, 390]) {
    test(`mobile listing and developer accessibility at ${width}px in ${theme} theme preserves all 15 owned cards`, async ({
      page,
    }) => {
      await page.setViewportSize({ width, height: 950 });
      await page.goto('/');
      await page.evaluate((value) => {
        localStorage.setItem('aliyas-theme', value);
        document.documentElement.dataset.theme = value;
      }, theme);
      for (const route of ['/projects', '/developers', '/developers/emaar']) {
        await page.goto(route);
        if (route === '/developers/emaar') {
          await expect(page.locator('.developer-project-placeholder')).toHaveCount(15);
          expect(
            await page
              .locator('.developer-project-placeholder')
              .evaluateAll((cards) =>
                cards.every((card) => card.getAttribute('data-developer') === 'emaar'),
              ),
          ).toBe(true);
        }
        const result = await new AxeBuilder({ page })
          .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
          .analyze();
        expect(
          result.violations.map(({ id, nodes }) => ({
            id,
            targets: nodes.map((node) => node.target),
          })),
        ).toEqual([]);
        expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
          true,
        );
      }
    });
  }
