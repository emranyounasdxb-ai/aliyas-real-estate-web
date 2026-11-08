import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import fs from 'node:fs';
import { getAllDeveloperProjects } from '../src/lib/developer-projects';
import { getProjectMedia } from '../src/lib/project-media';
import { mediaEntries } from '../src/data/project-enhancement-registry';

const route = '/developers/emaar/projects/avelia';
const media = getProjectMedia(getAllDeveloperProjects().find((p) => p.id === 'emaar-project-49')!)!;

test('registered project media retains owner isolation and protected records survive', () => {
  const projects = getAllDeveloperProjects();
  const baseline = JSON.parse(fs.readFileSync('docs/project-detail-baseline.json', 'utf8'));
  const records = new Map(projects.map((p) => [p.id, p]));
  assert.equal(projects.length, 575);
  assert.deepEqual(
    projects.filter((p) => getProjectMedia(p)).map((p) => p.id),
    projects.filter((p) => mediaEntries.some((entry) => entry.projectId === p.id)).map((p) => p.id),
  );
  assert.deepEqual(
    baseline.map((old: Record<string, unknown>) =>
      Object.fromEntries(
        Object.keys(old).map((key) => [
          key,
          records.get(old.id as string)![key as keyof (typeof projects)[number]],
        ]),
      ),
    ),
    baseline,
  );
  assert.equal(media.images.length, 6);
  for (const image of media.images) {
    const bytes = fs.readFileSync(`public${image.src}`);
    assert.equal(createHash('sha256').update(bytes).digest('hex'), image.sha256);
    assert.equal(bytes.length, image.originalBytes);
    assert.equal(new URL(image.sourceUrl).hostname, 'www.emaar.com');
  }
  assert.ok(media.images.some((image) => image.src === media.cardImage));
});

test('official gallery fits both themes, shows full images and keeps project enquiries contextual', async ({
  page,
}) => {
  test.setTimeout(120_000);
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.goto(route);
  await page.evaluate(() => document.fonts.ready);
  await expect(page.locator('.pd-gallery-thumbnails button')).toHaveCount(6);
  await expect(page.locator('.pd-gallery figcaption')).toContainText('Emaar project renders');
  await expect(page.locator('.pd-disclaimer')).toContainText('proposed design');
  for (const theme of ['light', 'dark']) {
    await page.evaluate((theme) => {
      document.documentElement.dataset.theme = theme;
    }, theme);
    for (const width of [320, 390, 768, 1024, 1440]) {
      await page.setViewportSize({ width, height: 1000 });
      await page.evaluate(() => scrollTo(0, 0));
      await page
        .locator('.pd-gallery-open img')
        .evaluate((img) => (img as HTMLImageElement).decode());
      expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(
        width,
      );
      if ([390, 1440].includes(width)) {
        await page.screenshot({
          path: `artifacts/project-media-pilot/verified-${theme}-${width}.png`,
        });
        for (const figure of await page.locator('.pm-scenes figure').all()) {
          await figure.scrollIntoViewIfNeeded();
          await figure.locator('img').evaluate((img) => (img as HTMLImageElement).decode());
        }
        await page.locator('.pm-scenes').scrollIntoViewIfNeeded();
        await page.screenshot({
          path: `artifacts/project-media-pilot/interiors-${theme}-${width}.png`,
        });
        const audit = await new AxeBuilder({ page })
          .include('.project-detail')
          .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
          .analyze();
        expect(audit.violations).toEqual([]);
      }
    }
  }
  const hero = page.locator('.pd-gallery-open');
  await hero.focus();
  await page.keyboard.press('Enter');
  const dialog = page.getByRole('dialog', { name: 'Avelia image gallery' });
  await expect(dialog).toBeVisible();
  for (let index = 0; index < 6; index++) {
    await expect(dialog.locator('.pd-lightbox-controls p')).toContainText(
      `${String(index + 1).padStart(2, '0')} / 06`,
    );
    await dialog.locator('img').evaluate((img) => (img as HTMLImageElement).decode());
    expect(await dialog.locator('img').evaluate((img) => getComputedStyle(img).objectFit)).toBe(
      'contain',
    );
    await page.keyboard.press('ArrowRight');
  }
  await page.keyboard.press('Escape');
  await expect(dialog).not.toBeVisible();
  await expect(hero).toBeFocused();
  await page.locator('.pd-enquiry-panel').getByRole('button', { name: 'Enquire now' }).click();
  await expect(page.getByRole('dialog').locator('textarea')).toHaveValue(/Avelia/);
  await page.keyboard.press('Escape');
  assert.deepEqual(errors, []);
  const pending = getAllDeveloperProjects().find((project) => !getProjectMedia(project));
  if (pending) {
    await page.goto(`/developers/${pending.developerSlug}/projects/${pending.slug}`);
    await expect(page.locator('.project-media-pilot')).toHaveCount(0);
    await expect(page.locator('.pd-gallery figcaption')).toContainText(
      'Illustrative concept gallery',
    );
  }
});

test('touch users can browse the image viewer without locking the page after dismissal', async ({
  browser,
}) => {
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    isMobile: true,
    hasTouch: true,
    reducedMotion: 'reduce',
  });
  const page = await context.newPage();
  try {
    await page.goto(route);
    await page.locator('.pd-gallery-open').tap();
    const image = page.locator('.pd-lightbox-image');
    const bounds = (await image.boundingBox())!;
    const cdp = await context.newCDPSession(page);
    const y = bounds.y + bounds.height / 2;
    await cdp.send('Input.dispatchTouchEvent', {
      type: 'touchStart',
      touchPoints: [{ x: 300, y }],
    });
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: 180, y }] });
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: 80, y }] });
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
    await expect(page.locator('.pd-lightbox-controls p')).toContainText('02 / 06');
    await page.getByRole('button', { name: 'Close image gallery' }).tap();
    await expect(page.locator('.pd-lightbox')).not.toBeVisible();
    expect(await page.evaluate(() => document.documentElement.style.overflow)).not.toBe('hidden');
  } finally {
    await context.close();
  }
});

test('Avelia listing card uses its own official exterior and opens the same project page', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto('/developers/emaar?page=4#developer-projects');
  const card = page.locator('article[data-project-id="emaar-project-49"]');
  await expect(card).toHaveAttribute('data-official-renders', 'true');
  await expect(page.locator('.project-card-badge')).toHaveCount(0);
  await expect(card.locator('img')).toHaveAttribute('alt', /Emaar render of Avelia villas/);
  await card.scrollIntoViewIfNeeded();
  await card.locator('img').evaluate((img) => (img as HTMLImageElement).decode());
  expect(await card.locator('img').getAttribute('src')).toContain(
    encodeURIComponent(media.cardImage),
  );
  for (const theme of ['light', 'dark']) {
    await page.evaluate((theme) => {
      document.documentElement.dataset.theme = theme;
    }, theme);
    for (const width of [320, 390, 768, 1024, 1440]) {
      await page.setViewportSize({ width, height: 1000 });
      await card.scrollIntoViewIfNeeded();
      await card.locator('img').evaluate((img) => (img as HTMLImageElement).decode());
      if (width <= 700) {
        const frame = (await card.locator('.project-card-visual').boundingBox())!;
        expect(frame.width / frame.height).toBeGreaterThan(1.2);
      }
      expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(
        width,
      );
      if ([390, 1440].includes(width))
        await page.screenshot({ path: `artifacts/project-media-pilot/card-${theme}-${width}.png` });
    }
  }
  await card.getByRole('link', { name: 'Explore Avelia', exact: true }).click();
  await expect(page).toHaveURL(/\/developers\/emaar\/projects\/avelia$/);
  await expect(page.locator('.pd-gallery-thumbnails button')).toHaveCount(6);
});
