import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import fs from 'node:fs';
import crypto from 'node:crypto';
import data from '../src/data/project-floor-plans/avelia.json' with { type: 'json' };
import catalogue from '../src/data/developer-projects/emaar.json' with { type: 'json' };
import { getAllDeveloperProjects } from '../src/lib/developer-projects';
import { getProjectFloorPlans } from '../src/lib/project-enhancements';

test('native mobile pan can be followed immediately by closing the plan without scroll lock', async ({
  browser,
  baseURL,
}) => {
  const context = await browser.newContext({
    baseURL,
    viewport: { width: 390, height: 844 },
    isMobile: true,
    hasTouch: true,
    reducedMotion: 'reduce',
  });
  try {
    const page = await context.newPage();
    await page.goto('/developers/emaar/projects/avelia#floor-plans');
    await page.locator('.fp-preview').tap();
    await page.getByRole('button', { name: 'Zoom to original size' }).tap();
    const viewport = page.locator('.fp-viewport');
    await viewport.locator('img').evaluate((img) => (img as HTMLImageElement).decode());
    const box = (await viewport.boundingBox())!;
    const session = await context.newCDPSession(page);
    const x = box.x + box.width - 40,
      y = box.y + Math.min(280, box.height - 40);
    await session.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x, y }] });
    for (let i = 1; i <= 8; i++)
      await session.send('Input.dispatchTouchEvent', {
        type: 'touchMove',
        touchPoints: [{ x: x - i * 20, y: y - i * 15 }],
      });
    await session.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
    await expect
      .poll(() => viewport.evaluate((e) => e.scrollLeft + e.scrollTop))
      .toBeGreaterThan(0);
    await page.getByRole('button', { name: 'Close floor plan' }).tap();
    await expect(page.locator('.fp-dialog')).not.toBeVisible();
    expect(await page.evaluate(() => document.documentElement.style.overflow)).not.toBe('hidden');
    await expect(page.locator('.fp-preview')).toBeFocused();
    await expect(page.locator('dialog[open]')).toHaveCount(0);
  } finally {
    await context.close();
  }
});

test('Avelia floor plans retain all six correct sheets and support responsive keyboard zoom and PDF access', async ({
  page,
  request,
}) => {
  test.setTimeout(120_000);
  const project = catalogue.projects.find((item) => item.id === data.projectId)!;
  expect(data.plans.map((plan) => ({ label: plan.label, area: plan.area }))).toEqual(
    project.research!.units.map((unit) => ({ label: unit.label, area: unit.area })),
  );
  for (const asset of [...data.plans, { src: data.source.pdf, sha256: data.source.sha256 }]) {
    expect(
      crypto
        .createHash('sha256')
        .update(fs.readFileSync(`public${asset.src}`))
        .digest('hex'),
    ).toBe(asset.sha256);
  }
  const pdf = await request.get(data.source.pdf);
  expect(pdf.status()).toBe(200);
  expect(pdf.headers()['content-type']).toContain('application/pdf');
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.goto('/developers/emaar/projects/avelia#floor-plans');
  const section = page.locator('#floor-plans');
  const selector = section.getByLabel('Choose a layout');
  await expect(selector.locator('option')).toHaveCount(6);
  for (let index = 0; index < 6; index++) {
    await selector.selectOption(String(index));
    await expect(section.locator('.fp-area')).toHaveText(data.plans[index].area);
    await expect(section.locator('.fp-preview img')).toHaveAttribute('src', data.plans[index].src);
    await section
      .locator('.fp-preview img')
      .evaluate((image) => (image as HTMLImageElement).decode());
    await expect(section.locator('.fp-source')).toHaveAttribute(
      'href',
      `${data.source.url}#page=${index + 2}`,
    );
  }
  for (const theme of ['light', 'dark']) {
    await page.evaluate((theme) => {
      document.documentElement.dataset.theme = theme;
    }, theme);
    for (const width of [320, 390, 768, 1024, 1440]) {
      await page.setViewportSize({ width, height: 1000 });
      await section.scrollIntoViewIfNeeded();
      expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(
        width,
      );
      const sheetBottom = await section
        .locator('.fp-preview img')
        .evaluate((image) => image.getBoundingClientRect().bottom);
      const controlTop = await section
        .locator('.fp-preview > span')
        .evaluate((control) => control.getBoundingClientRect().top);
      expect(controlTop).toBeGreaterThanOrEqual(sheetBottom);
      if ([390, 1440].includes(width)) {
        await page.screenshot({
          path: `artifacts/project-media-pilot/plans-${theme}-${width}.png`,
        });
        const audit = await new AxeBuilder({ page })
          .include('#floor-plans')
          .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
          .analyze();
        expect(audit.violations).toEqual([]);
      }
    }
  }
  const trigger = section.locator('.fp-preview');
  await trigger.focus();
  await page.keyboard.press('Enter');
  const dialog = page.getByRole('dialog', { name: data.plans[5].label });
  await expect(dialog).toBeVisible();
  await dialog.locator('img').evaluate((img) => (img as HTMLImageElement).decode());
  expect((await dialog.locator('img').boundingBox())!.height).toBeLessThanOrEqual(
    (await dialog.locator('.fp-viewport').boundingBox())!.height + 1,
  );
  expect(await dialog.locator('h2').evaluate((e) => parseFloat(getComputedStyle(e).fontSize))).toBe(
    24,
  );
  await dialog.getByRole('button', { name: 'Zoom to original size' }).click();
  const viewport = dialog.getByRole('region', { name: 'Scrollable floor plan' });
  expect(await viewport.evaluate((e) => e.scrollWidth > e.clientWidth)).toBe(true);
  await viewport.focus();
  await page.keyboard.press('ArrowRight');
  await expect.poll(() => viewport.evaluate((e) => e.scrollLeft)).toBeGreaterThan(0);
  await expect(dialog.getByRole('link', { name: 'Open PDF' })).toHaveAttribute(
    'href',
    `${data.source.pdf}#page=7`,
  );
  await dialog.getByRole('button', { name: 'Fit to screen' }).click();
  expect(await viewport.evaluate((e) => e.scrollWidth <= e.clientWidth + 1)).toBe(true);
  const audit = await new AxeBuilder({ page })
    .include('.fp-dialog')
    .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
    .analyze();
  expect(audit.violations).toEqual([]);
  await page.keyboard.press('Escape');
  await expect(dialog).not.toBeVisible();
  await expect(trigger).toBeFocused();
  expect(await page.evaluate(() => document.documentElement.style.overflow)).not.toBe('hidden');
  await page.setViewportSize({ width: 390, height: 844 });
  await trigger.click();
  await expect(dialog).toBeVisible();
  await dialog.getByRole('button', { name: 'Zoom to original size' }).click();
  expect(await viewport.evaluate((e) => e.scrollWidth)).toBe(2400);
  await page.screenshot({ path: 'artifacts/project-media-pilot/plans-mobile-zoom.png' });
  await dialog.getByRole('button', { name: 'Close floor plan' }).click();
  await expect(dialog).not.toBeVisible();
  expect(errors).toEqual([]);
  const pending = getAllDeveloperProjects().find((project) => !getProjectFloorPlans(project));
  if (pending) {
    await page.goto(`/developers/${pending.developerSlug}/projects/${pending.slug}`);
    await expect(page.locator('#floor-plans')).toHaveCount(0);
    await expect(
      page.getByRole('navigation', { name: 'Project sections' }).getByRole('link', {
        name: 'Floor plans',
        exact: true,
      }),
    ).toHaveCount(0);
  }
});
