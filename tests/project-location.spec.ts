import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import fs from 'node:fs';
import crypto from 'node:crypto';
import location from '../src/data/project-locations/avelia.json' with { type: 'json' };
import { getAllDeveloperProjects } from '../src/lib/developer-projects';
import { getProjectLocation } from '../src/lib/project-enhancements';

test('Avelia location preserves sourced map, travel estimates and usable navigation in both themes', async ({
  page,
}) => {
  test.setTimeout(120_000);
  const mapBytes = fs.readFileSync(`public${location.map.src}`);
  expect(crypto.createHash('sha256').update(mapBytes).digest('hex')).toBe(location.map.sha256);
  expect(location.pin).toMatchObject({
    latitude: 25.005951,
    longitude: 55.462341,
    sourceUrl: 'https://www.emaar.com/en/properties/avelia-at-the-valley',
  });
  expect(location.travel.destinations.map((item) => [item.name, item.minutes])).toEqual([
    ['Rugby Sevens', 5],
    ['Dubai Outlet Mall', 8],
    ['Dubai International Airport', 20],
    ['Downtown Dubai', 25],
  ]);
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  const response = await page.goto('/developers/emaar/projects/avelia#location');
  expect(response?.headers()['content-security-policy']).toContain(
    "frame-src 'self' https://www.openstreetmap.org;",
  );
  const section = page.locator('#location');
  await expect(section.getByRole('heading', { name: 'Location & connectivity.' })).toBeVisible();
  await expect(section.locator('.pl-destinations li')).toHaveCount(4);
  await expect(section.locator('.pl-note')).toHaveText('Travel times vary with traffic and route.');
  const link = section.getByRole('link', { name: 'Get directions', exact: true }).first();
  expect(new URL((await link.getAttribute('href'))!).searchParams.get('destination')).toBe(
    '25.005951,55.462341',
  );
  for (const theme of ['light', 'dark']) {
    await page.evaluate((theme) => {
      document.documentElement.dataset.theme = theme;
    }, theme);
    for (const width of [320, 390, 768, 1024, 1440]) {
      await page.setViewportSize({ width, height: 1000 });
      await section.scrollIntoViewIfNeeded();
      await section.locator('.pl-map img').evaluate((img) => (img as HTMLImageElement).decode());
      expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(
        width,
      );
      const image = section.locator('.pl-map img');
      const box = (await image.boundingBox())!;
      expect(box.width / box.height).toBeCloseTo(location.map.width / location.map.height, 1);
      if ([390, 1440].includes(width)) {
        await section.screenshot({
          path: `artifacts/project-media-pilot/location-${theme}-${width}.png`,
        });
        const audit = await new AxeBuilder({ page })
          .include('#location')
          .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
          .analyze();
        expect(audit.violations).toEqual([]);
      }
    }
  }
  const summary = section.locator('summary');
  const loadedTile = page.waitForResponse(
    (response) =>
      response.url().startsWith('https://tile.openstreetmap.org/') && response.status() === 200,
  );
  await summary.focus();
  await page.keyboard.press('Enter');
  await expect(section.locator('details')).toHaveAttribute('open', '');
  await expect(section.locator('iframe')).toBeVisible();
  const frame = page.frameLocator('iframe[title="Avelia location on OpenStreetMap"]');
  await expect(frame.locator('.maplibregl-map')).toBeVisible({ timeout: 25_000 });
  await expect(frame.getByLabel('Map marker')).toBeVisible();
  await loadedTile;
  await page.screenshot({ path: 'artifacts/project-media-pilot/location-interactive.png' });
  await summary.focus();
  await page.keyboard.press('Enter');
  await expect(section.locator('iframe')).not.toBeVisible();
  expect(errors).toEqual([]);
  const pending = getAllDeveloperProjects().find((project) => !getProjectLocation(project));
  if (pending) {
    await page.goto(`/developers/${pending.developerSlug}/projects/${pending.slug}`);
    await expect(page.locator('.pd-project-location')).toHaveCount(0);
  }
});
