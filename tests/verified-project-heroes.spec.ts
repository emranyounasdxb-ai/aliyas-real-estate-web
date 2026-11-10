import { test, expect } from '@playwright/test';
import { getDeveloperProjects } from '../src/lib/developer-projects';
import { developers } from '../src/lib/content';
import { getDeveloperProjectPreviews } from '../src/lib/developer-project-previews';
import { existsSync } from 'node:fs';
import { getProjectMedia } from '../src/lib/project-media';
import AxeBuilder from '@axe-core/playwright';

const desktopVisible = 7;
const mobileVisible = 3;

test('hero slides contain only the developer’s owned projects and their project covers', () => {
  for (const developer of developers) {
    const records = getDeveloperProjects(developer.slug);
    const slides = getDeveloperProjectPreviews(developer);
    expect(slides).toHaveLength(Math.min(15, records.length));
    expect(slides.filter((s) => s.kind === 'project').map((s) => s.id)).toEqual(
      records.slice(0, 15).map((p) => p.id),
    );
    expect(slides.filter((s) => s.kind === 'inspiration')).toHaveLength(0);
    for (const [index, slide] of slides.entries()) {
      expect(slide.kind).toBe('project');
      expect(slide.image).toBe(getProjectMedia(records[index])?.cardImage || records[index].image);
      expect(existsSync(`public${slide.image}`)).toBe(true);
    }
  }
});

test('short collections show their owned cards without stock filler or an unnecessary scroll pin', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  for (const owner of ['al-zorah', 'eagle-hills', 'select-group', 'alef']) {
    await page.setViewportSize({ width: 1440, height: 1000 });
    await page.goto(`/developers/${owner}`);
    await page.evaluate(() => document.fonts.ready);
    const count = getDeveloperProjects(owner).length;
    await expect(page.locator('.developer-hero-card')).toHaveCount(count);
    await expect(page.locator('.developer-hero-card[aria-hidden="false"]')).toHaveCount(
      Math.min(count, desktopVisible),
    );
    const stock = page.locator('.developer-hero-card[data-slide-kind="inspiration"]');
    await expect(stock).toHaveCount(0);
    await expect(
      stock.locator('a, button, .developer-hero-card-caption, .developer-hero-card-badge'),
    ).toHaveCount(0);
    await expect(page.locator('[data-slide-kind="inspiration"][data-project-id]')).toHaveCount(0);
    await expect(page.locator('.developer-listings .project-card')).toHaveCount(count);
    await expect(page.locator('.developer-hero-card-caption > span')).toHaveCount(0);
    expect(await page.locator('.developer-hero-card-caption').allTextContents()).toEqual(
      getDeveloperProjects(owner).map((p) => p.name),
    );
    await expect(page.locator('.developer-hero')).not.toHaveClass(/is-scroll-pinned/);
    await expect(page.locator('.developer-hero-note > span')).toHaveCount(1);
    await expect(page.locator('.developer-hero-note')).not.toContainText(/stock|preview|pending/i);
    await expect(page.locator('.developer-hero-arrows')).toHaveCount(0);
    const boxes = await page.locator('.developer-hero-photo').evaluateAll((nodes) =>
      nodes.map((n) => {
        const b = n.getBoundingClientRect();
        return { left: b.left, right: b.right, width: b.width };
      }),
    );
    const visible = boxes.slice(0, desktopVisible);
    expect(visible[0].left).toBeGreaterThan(0);
    expect(visible.at(-1)!.right).toBeLessThanOrEqual(1440);
    expect(Math.abs(visible[0].left - (1440 - visible.at(-1)!.right))).toBeLessThan(3);
    await page
      .locator('.developer-hero-card[aria-hidden="false"] img')
      .evaluateAll((images) =>
        Promise.all(images.map((image) => (image as HTMLImageElement).decode())),
      );
    await page.screenshot({ path: `artifacts/hero-stock-images/${owner}-desktop.png` });
    await expect(page.locator('.developer-hero-note > span').first()).toHaveText(
      `01—${String(count).padStart(2, '0')} / ${count}`,
    );
    await page.mouse.wheel(0, 600);
    await expect
      .poll(async () => (await page.locator('.developer-hero').boundingBox())!.y)
      .toBeLessThan(0);
  }
});

test('real long names remain readable in the hero at every target size and theme', async ({
  page,
}) => {
  test.setTimeout(180_000);
  for (const owner of ['samana', 'al-hamra', 'eagle-hills']) {
    await page.goto(`/developers/${owner}`);
    for (const theme of ['light', 'dark']) {
      await page.evaluate((theme) => (document.documentElement.dataset.theme = theme), theme);
      for (const [width, height, reducedMotion] of [
        [320, 1000, 'reduce'],
        [390, 1000, 'reduce'],
        [768, 1000, 'reduce'],
        [1024, 1000, 'reduce'],
        [1440, 1000, 'reduce'],
        [844, 390, 'no-preference'],
      ] as const) {
        await page.emulateMedia({ reducedMotion });
        await page.setViewportSize({ width, height });
        await page.evaluate(() => document.fonts.ready);
        await expect(page.locator('.developer-hero-card[aria-hidden="false"]')).toHaveCount(
          Math.min(
            getDeveloperProjects(owner).length,
            width < 768 || (width <= 1000 && height <= 500) ? mobileVisible : desktopVisible,
          ),
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
                const photoElement = n.parentElement!.querySelector('.developer-hero-photo')!;
                const photo = photoElement.getBoundingClientRect();
                // The visible photo ends on a sloping edge, not at the bottom of its rectangle.
                const corners = [
                  ...getComputedStyle(photoElement).clipPath.matchAll(
                    /Q\s*([\d.e+-]+)[,\s]+([\d.e+-]+)/gi,
                  ),
                ].map((match) => ({ x: Number(match[1]), y: Number(match[2]) }));
                const lowerRight = corners[2];
                const lowerLeft = corners[3];
                const edgeSlope = (lowerRight.y - lowerLeft.y) / (lowerRight.x - lowerLeft.x);
                const transform = new DOMMatrix(getComputedStyle(n).transform);
                const captionSlope = transform.b / transform.a;
                const captionTop = b.top + (Math.abs(captionSlope) * b.width) / 2;
                const photoEdge =
                  photo.top +
                  lowerLeft.y +
                  (b.left + b.width / 2 - photo.left - lowerLeft.x) * edgeSlope;
                const title = n.querySelector('strong')!;
                return {
                  text: n.textContent,
                  clipped: b.bottom > g.bottom + 1,
                  overflow:
                    n.scrollWidth > n.clientWidth + 1 || title.scrollWidth > title.clientWidth + 1,
                  overlap: captionTop < photoEdge + 7,
                  detached: captionTop > photoEdge + 25,
                  wrongAngle: Math.abs(captionSlope - edgeSlope) > 0.001,
                };
              })
              .filter((x) => x.clipped || x.overflow || x.overlap || x.detached || x.wrongAngle),
          );
        expect(clips, `${owner} ${theme} ${width}x${height} ${reducedMotion}`).toEqual([]);
        if (
          width === 390 ||
          width === 844 ||
          (owner === 'al-hamra' && (width === 768 || width === 1440))
        ) {
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

test('owned project slides support touch, reduced-motion keyboard navigation and both themes', async ({
  browser,
}) => {
  const context = await browser.newContext({
    baseURL: test.info().project.use.baseURL,
    viewport: { width: 320, height: 844 },
    isMobile: true,
    hasTouch: true,
    reducedMotion: 'reduce',
  });
  const page = await context.newPage();
  await page.goto('/developers/eagle-hills');
  const count = getDeveloperProjects('eagle-hills').length;
  const gallery = page.locator('.developer-hero-gallery');
  await gallery.focus();
  for (let index = 0; index < count - mobileVisible; index++)
    await page.keyboard.press('ArrowRight');
  await expect(page.locator('.developer-hero-note > span').first()).toHaveText(
    `${String(count - mobileVisible + 1).padStart(2, '0')}—${String(count).padStart(2, '0')} / ${count}`,
  );
  await expect(page.locator('.developer-hero-card[aria-hidden="false"] a')).toHaveCount(
    mobileVisible,
  );
  await expect(page.getByRole('button', { name: 'Next projects', exact: true })).toBeDisabled();
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
      path: `artifacts/hero-stock-images/eagle-hills-owned-${theme}-320.png`,
    });
  }
  await page.getByRole('button', { name: 'Previous projects', exact: true }).tap();
  await expect(page.locator('.developer-hero-note > span').first()).toHaveText(
    `01—${String(mobileVisible).padStart(2, '0')} / ${count}`,
  );
  await expect(page.locator('.developer-listings .project-card')).toHaveCount(count);
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
  await expect(
    page.locator('#project-gallery').getByRole('link', { name: 'Image source' }),
  ).toHaveAttribute('href', getProjectMedia(getDeveloperProjects('emaar')[0])!.source.url);
});
