import { expect, test } from '@playwright/test';

const projectPath = '/developers/aldar/projects/talay';
const original = '/images/projects/aldar/talay/villa-exterior-cde8a75e5590.webp';
const variant = '/images/project-responsive/v1/cde8a75e5590-';

for (const width of [1440, 390]) {
  test(`project images load a sharp, project-specific responsive copy at ${width}px`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto(projectPath);
    const image = page.locator('#project-gallery .pd-gallery-open img');
    await expect(image).toHaveAttribute('src', original);
    await expect(image).toHaveAttribute(
      'srcset',
      /cde8a75e5590-640\.webp 640w.*cde8a75e5590-1600\.webp 1600w/,
    );
    await image.evaluate((element) => (element as HTMLImageElement).decode());
    const state = await image.evaluate((element) => {
      const photo = element as HTMLImageElement;
      return {
        currentSource: new URL(photo.currentSrc).pathname,
        width: photo.naturalWidth,
        filter: getComputedStyle(photo).filter,
        background: getComputedStyle(photo).backgroundImage,
      };
    });
    expect(state.currentSource).toContain(variant);
    expect(state.width).toBeGreaterThan(0);
    expect(state.filter).not.toContain('blur');
    expect(state.background).not.toContain('data:image');

    await page.locator('#project-gallery .pd-gallery-thumbnails button').nth(1).click();
    await expect(image).toHaveAttribute('src', /villa-living-51d555d91128\.webp/);
    await image.evaluate((element) => (element as HTMLImageElement).decode());
    expect(await image.evaluate((element) => (element as HTMLImageElement).currentSrc)).toContain(
      '51d555d91128-',
    );
  });
}

test('a missing optimized image falls back to the same project original', async ({ page }) => {
  await page.route(
    /\/images\/project-responsive\/v1\/(cde8a75e5590|51d555d91128)-.*\.webp/,
    (route) => route.fulfill({ status: 404, body: 'Missing image' }),
  );
  await page.goto(projectPath);
  const image = page.locator('#project-gallery .pd-gallery-open img');
  await expect(image).toHaveAttribute('data-original-fallback', 'true');
  await expect(image).not.toHaveAttribute('srcset');
  await image.evaluate((element) => (element as HTMLImageElement).decode());
  expect(
    await image.evaluate((element) => new URL((element as HTMLImageElement).currentSrc).pathname),
  ).toBe(original);
  await page.locator('#project-gallery .pd-gallery-thumbnails button').nth(1).click();
  await expect(image).toHaveAttribute('data-original-fallback', 'true');
  await expect(image).not.toHaveAttribute('srcset');
  await image.evaluate((element) => (element as HTMLImageElement).decode());
  expect(
    await image.evaluate((element) => new URL((element as HTMLImageElement).currentSrc).pathname),
  ).toContain('villa-living-51d555d91128.webp');
});

test('homepage hero and journal covers use responsive images on mobile', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  const hero = page.locator('.hp-hero-background');
  await hero.evaluate((element) => (element as HTMLImageElement).decode());
  expect(await hero.evaluate((element) => (element as HTMLImageElement).currentSrc)).toContain(
    '/images/project-responsive/v1/cde8a75e5590-',
  );
  const journal = page.locator('.hp-journal-image img').first();
  await journal.scrollIntoViewIfNeeded();
  await journal.evaluate((element) => (element as HTMLImageElement).decode());
  expect(await journal.getAttribute('srcset')).toBeTruthy();
  expect(
    await journal.evaluate((element) => (element as HTMLImageElement).naturalWidth),
  ).toBeGreaterThan(0);
});

test('catalogue card keeps the same project cover while using a smaller static image', async ({
  page,
}) => {
  await page.goto('/projects?q=Talay');
  const card = page.locator('.catalogue-project-grid [data-project-id="aldar-project-02"]');
  const image = card.locator('img');
  await card.scrollIntoViewIfNeeded();
  await image.evaluate((element) => (element as HTMLImageElement).decode());
  await expect(image).toHaveAttribute('src', original);
  expect(await image.evaluate((element) => (element as HTMLImageElement).currentSrc)).toContain(
    variant,
  );
});
