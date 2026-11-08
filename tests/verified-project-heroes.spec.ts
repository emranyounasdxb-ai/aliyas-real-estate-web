import { test, expect } from '@playwright/test';
import { getDeveloperProjects } from '../src/lib/developer-projects';
import { developers } from '../src/lib/content';
import { getDeveloperProjectPreviews } from '../src/lib/developer-project-previews';
import { readFileSync, existsSync } from 'node:fs';
import AxeBuilder from '@axe-core/playwright';

test('stock hero slides use supplied imagery and never become owned project records', () => {
  const manifest = JSON.parse(readFileSync('docs/site-imagery-manifest.json', 'utf8'));
  const sources = new Set(manifest.images.map((image: { src: string }) => image.src));
  for (const developer of developers) {
    const records = getDeveloperProjects(developer.slug);
    const slides = getDeveloperProjectPreviews(developer);
    expect(slides).toHaveLength(15);
    expect(slides.filter((s) => s.kind === 'project').map((s) => s.id)).toEqual(
      records.slice(0, 15).map((p) => p.id),
    );
    const images = slides.filter((s) => s.kind === 'inspiration');
    expect(images).toHaveLength(Math.max(0, 15 - records.length));
    expect(new Set(images.map((s) => s.image)).size).toBe(images.length);
    for (const image of images) {
      expect(sources.has(image.image)).toBe(true);
      expect(existsSync(`public${image.image}`)).toBe(true);
      expect(image).not.toHaveProperty('href');
      expect(image).not.toHaveProperty('title');
      expect(records.some((p) => p.id === image.id)).toBe(false);
    }
  }
});

test('short collections fill the fifteen-slide hero with images only and release at its end', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  for (const owner of ['al-zorah', 'eagle-hills', 'select-group', 'alef']) {
    await page.setViewportSize({ width: 1440, height: 1000 });
    await page.goto(`/developers/${owner}`);
    await page.evaluate(() => document.fonts.ready);
    const count = getDeveloperProjects(owner).length;
    await expect(page.locator('.developer-hero-card')).toHaveCount(15);
    await expect(page.locator('.developer-hero-card[aria-hidden="false"]')).toHaveCount(7);
    const stock = page.locator('.developer-hero-card[data-slide-kind="inspiration"]');
    await expect(stock).toHaveCount(15 - count);
    await expect(stock.locator('a, button, .developer-hero-card-caption')).toHaveCount(0);
    await expect(page.locator('[data-slide-kind="inspiration"][data-project-id]')).toHaveCount(0);
    await expect(page.locator('.developer-listings .project-card')).toHaveCount(count);
    await expect(page.locator('.developer-hero-card-caption > span')).toHaveCount(0);
    expect(await page.locator('.developer-hero-card-caption').allTextContents()).toEqual(
      getDeveloperProjects(owner).map((p) => p.name),
    );
    await expect(page.locator('.developer-hero')).toHaveClass(/is-scroll-pinned/);
    await expect(page.locator('.developer-hero-note')).toContainText(
      'Stock images for inspiration',
    );
    const boxes = await page.locator('.developer-hero-photo').evaluateAll((nodes) =>
      nodes.map((n) => {
        const b = n.getBoundingClientRect();
        return { left: b.left, right: b.right, width: b.width };
      }),
    );
    const visible = boxes.slice(0, 7);
    expect(visible[0].left).toBeGreaterThan(0);
    expect(visible.at(-1)!.right).toBeLessThanOrEqual(1440);
    expect(Math.abs(visible[0].left - (1440 - visible.at(-1)!.right))).toBeLessThan(3);
    await page
      .locator('.developer-hero-card[aria-hidden="false"] img')
      .evaluateAll((images) =>
        Promise.all(images.map((image) => (image as HTMLImageElement).decode())),
      );
    await page.screenshot({ path: `artifacts/hero-stock-images/${owner}-desktop.png` });
    await page.locator('.developer-hero').evaluate((el) => {
      const parent = el.parentElement!.getBoundingClientRect();
      const header = document.querySelector('.site-header')!.getBoundingClientRect().height;
      scrollTo({
        top: parent.top + scrollY - header - 12 + parent.height - el.getBoundingClientRect().height,
        behavior: 'instant',
      });
    });
    await expect(page.locator('.developer-hero-note > span').first()).toHaveText('09—15 / 15');
    await expect(
      page.locator('.developer-hero-card[aria-hidden="false"][data-slide-kind="inspiration"]'),
    ).toHaveCount(7);
    await page.mouse.wheel(0, 600);
    await expect
      .poll(async () => (await page.locator('.developer-hero').boundingBox())!.y)
      .toBeLessThan(0);
  }
});

test('real long names remain readable in the hero at every target size and theme', async ({
  page,
}) => {
  test.setTimeout(120_000);
  for (const owner of ['samana', 'al-hamra', 'eagle-hills']) {
    await page.goto(`/developers/${owner}`);
    for (const theme of ['light', 'dark']) {
      await page.evaluate((theme) => (document.documentElement.dataset.theme = theme), theme);
      for (const width of [320, 390, 768, 1024, 1440]) {
        await page.setViewportSize({ width, height: 1000 });
        await page.evaluate(() => document.fonts.ready);
        await expect(page.locator('.developer-hero-card[aria-hidden="false"]')).toHaveCount(
          width < 768 ? 3 : 7,
        );
        expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(
          width,
        );
        const clips = await page
          .locator('.developer-hero-card[aria-hidden="false"] .developer-hero-card-caption')
          .evaluateAll((nodes) =>
            nodes
              .map((n) => {
                const b = n.getBoundingClientRect();
                const g = n.closest('.developer-hero-gallery')!.getBoundingClientRect();
                const photo = n
                  .parentElement!.querySelector('.developer-hero-photo')!
                  .getBoundingClientRect();
                return {
                  text: n.textContent,
                  clipped: b.bottom > g.bottom + 1,
                  overflow: n.scrollWidth > n.clientWidth + 1,
                  overlap: b.top < photo.bottom + 8,
                };
              })
              .filter((x) => x.clipped || x.overflow || x.overlap),
          );
        expect(clips, `${owner} ${theme} ${width}`).toEqual([]);
        if (width === 390 || (owner === 'al-hamra' && (width === 768 || width === 1440))) {
          await page
            .locator('.developer-hero-card[aria-hidden="false"] img')
            .evaluateAll((images) =>
              Promise.all(images.map((image) => (image as HTMLImageElement).decode())),
            );
          await page.screenshot({
            path: `artifacts/hero-stock-images/${owner}-${theme}-${width}.png`,
          });
        }
      }
    }
  }
});

test('image-only slides support touch, reduced-motion keyboard navigation and both themes', async ({
  browser,
}) => {
  const context = await browser.newContext({
    viewport: { width: 320, height: 844 },
    isMobile: true,
    hasTouch: true,
    reducedMotion: 'reduce',
  });
  const page = await context.newPage();
  await page.goto('http://127.0.0.1:3000/developers/union-properties');
  const gallery = page.locator('.developer-hero-gallery');
  await gallery.focus();
  for (let index = 0; index < 12; index++) await page.keyboard.press('ArrowRight');
  await expect(page.locator('.developer-hero-note > span').first()).toHaveText('13—15 / 15');
  await expect(page.locator('.developer-hero-card[aria-hidden="false"] a')).toHaveCount(0);
  await expect(page.getByRole('button', { name: 'Next slides', exact: true })).toBeDisabled();
  await page
    .locator('.developer-hero-card[aria-hidden="false"] img')
    .evaluateAll((images) =>
      Promise.all(images.map((image) => (image as HTMLImageElement).decode())),
    );
  for (const theme of ['light', 'dark']) {
    await page.evaluate((theme) => (document.documentElement.dataset.theme = theme), theme);
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(
      320,
    );
    expect(
      (
        await new AxeBuilder({ page })
          .include('.developer-hero')
          .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
          .analyze()
      ).violations,
    ).toEqual([]);
    await page.screenshot({
      path: `artifacts/hero-stock-images/union-properties-stock-${theme}-320.png`,
    });
  }
  await page.getByRole('button', { name: 'Previous slides', exact: true }).tap();
  await expect(page.locator('.developer-hero-note > span').first()).toHaveText('12—14 / 15');
  await expect(page.locator('.developer-listings .project-card')).toHaveCount(2);
  await context.close();
});

test('hero link keyboard navigation opens the exact owned project and keeps source attribution', async ({
  page,
}) => {
  await page.goto('/developers/emaar');
  const link = page.locator('.developer-hero-card-link').first();
  await link.focus();
  await page.keyboard.press('Enter');
  await expect(page).toHaveURL(/\/developers\/emaar\/projects\/valia$/);
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Valia');
  await expect(
    page.locator('#sources').getByRole('link', { name: 'Developer Emaar: Valia', exact: true }),
  ).toHaveAttribute('href', getDeveloperProjects('emaar')[0].nameSource!.url);
  await expect(page.locator('figure figcaption').first()).toContainText(/project renders/);
});
