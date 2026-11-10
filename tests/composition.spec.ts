import { openCities, emirates, assertNoOverflow } from './current-ui';
import { test, expect } from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';

test('destination navigation remains contained and every city card has a distinct reachable target', async ({
  page,
}) => {
  for (const width of [320, 390, 768, 1024, 1440]) {
    await page.setViewportSize({ width, height: 1000 });
    await page.goto('/');
    const panel = await openCities(page);
    const cards = panel.locator('.signature-city-card');
    await expect(cards).toHaveCount(7);
    const boxes = await cards.evaluateAll((es) =>
      es.map((e) => e.getBoundingClientRect().toJSON()),
    );
    for (const b of boxes) {
      expect(b.x).toBeGreaterThanOrEqual(0);
      expect(b.right).toBeLessThanOrEqual(width + 1);
      expect(b.height).toBeGreaterThanOrEqual(44);
    }
    for (let i = 0; i < boxes.length; i++)
      for (let j = i + 1; j < boxes.length; j++) {
        const a = boxes[i],
          b = boxes[j];
        expect(
          a.right <= b.left + 1 ||
            b.right <= a.left + 1 ||
            a.bottom <= b.top + 1 ||
            b.bottom <= a.top + 1,
        ).toBe(true);
      }
    for (const city of emirates) {
      const card = cards.filter({ has: page.getByRole('heading', { name: city, exact: true }) });
      expect(
        new URL((await card.getAttribute('href'))!, page.url()).searchParams.get('emirate'),
      ).toBe(city);
    }
    await assertNoOverflow(page);
  }
});

test('home Journal shows three newest covers with working article links in date order', async ({
  page,
}) => {
  for (const width of [390, 820, 1440]) {
    await page.setViewportSize({ width, height: 1000 });
    await page.goto('/');
    const cards = page.locator('.hp-journal-grid article');
    await expect(cards).toHaveCount(3);

    const dates = await cards
      .locator('time')
      .evaluateAll((es) => es.map((e) => e.getAttribute('datetime')));
    expect(dates).toEqual(['2026-07-19', '2026-07-18', '2026-07-17']);
    for (let i = 0; i < 3; i++) {
      await page.goto('/');
      const card = page.locator('.hp-journal-grid article').nth(i),
        title = (await card.locator('h3').innerText()).trim();
      await card.locator('a').first().click();
      await expect(page.getByRole('heading', { level: 1 })).toHaveText(title);
      await expect(page.locator('main table').first()).toBeAttached();
    }
  }
});

test('all 575 reviewed galleries retain their owner and existing project-specific image files', () => {
  const directory = path.resolve('src/data/project-media'),
    ids = new Set<string>();
  const files = fs
    .readdirSync(directory, { recursive: true })
    .map(String)
    .filter((f) => f.endsWith('.json'));
  expect(files).toHaveLength(575);
  for (const file of files) {
    const media = JSON.parse(fs.readFileSync(path.join(directory, file), 'utf8'));
    expect(ids.has(media.projectId)).toBe(false);
    ids.add(media.projectId);
    expect(media.images.length).toBeGreaterThan(0);
    expect(media.images.some((i: { src: string }) => i.src === media.cardImage)).toBe(true);
    for (const image of media.images) {
      expect(image.src).toContain(
        '/images/projects/' + media.developerSlug + '/' + media.projectSlug + '/',
      );
      expect(fs.existsSync(path.resolve('public', image.src.slice(1)))).toBe(true);
    }
  }
  expect(ids.size).toBe(575);
});

test('project card title rows and price baselines stay aligned with a long project name', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto('/projects');
  await page.waitForLoadState('networkidle');
  const cards = page.locator('.catalogue-project-grid .project-card');
  const name = 'The Residences at a Very Long Waterfront Community Address';
  await cards
    .first()
    .locator('h3 a')
    .evaluate((link, text) => {
      link.textContent = text;
    }, name);
  await expect(cards.first().locator('h3 a')).toHaveAccessibleName(name);
  const rows = await cards.evaluateAll((elements) =>
    elements.slice(0, 3).map((element) => ({
      top: element.getBoundingClientRect().top,
      title: element.querySelector('h3')!.getBoundingClientRect().height,
      price: element.querySelector('.project-card-bottom')!.getBoundingClientRect().top,
      height: element.getBoundingClientRect().height,
    })),
  );
  expect(
    Math.max(...rows.map((row) => row.title)) - Math.min(...rows.map((row) => row.title)),
  ).toBeLessThan(2);
  expect(
    Math.max(...rows.map((row) => row.price)) - Math.min(...rows.map((row) => row.price)),
  ).toBeLessThan(2);
  expect(
    Math.max(...rows.map((row) => row.height)) - Math.min(...rows.map((row) => row.height)),
  ).toBeLessThan(2);
});

test('mobile section arrows reveal Downloads and keep active navigation visible without covering headings', async ({
  page,
}) => {
  for (const [route, lastSection, sectionId] of [
    ['/developers/sobha/projects/sobha-solis', 'Downloads', 'downloads'],
    ['/developers/emaar/projects/avelia', 'Downloads', 'downloads'],
  ]) {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(route);
    const nav = page.getByRole('navigation', { name: 'Project sections' });
    await page.getByRole('button', { name: 'Next project sections', exact: true }).click();
    await expect.poll(() => nav.evaluate((element) => element.scrollLeft)).toBeGreaterThan(80);
    await nav.getByRole('link', { name: lastSection, exact: true }).click();
    await expect(nav.getByRole('link', { name: lastSection, exact: true })).toHaveAttribute(
      'aria-current',
      'location',
    );
    const tab = (await nav.getByRole('link', { name: lastSection, exact: true }).boundingBox())!,
      box = (await nav.boundingBox())!;
    expect(tab.x).toBeGreaterThanOrEqual(box.x + 35);
    expect(tab.x + tab.width).toBeLessThanOrEqual(box.x + box.width + 1);
    const resources = (await page.locator(`#${sectionId}`).boundingBox())!;
    expect(resources.y).toBeGreaterThanOrEqual(box.y + box.height - 1);
    const before = await nav.evaluate((element) => element.scrollLeft);
    await page.getByRole('button', { name: 'Previous project sections', exact: true }).click();
    await expect
      .poll(() => nav.evaluate((element) => element.scrollLeft))
      .toBeLessThan(before - 30);
    await nav.getByRole('link', { name: 'Overview', exact: true }).focus();
    await expect.poll(() => nav.evaluate((element) => element.scrollLeft)).toBeLessThan(5);
    expect(
      await page
        .locator('.pd-gallery-thumbnails span')
        .first()
        .evaluate((element) => parseFloat(getComputedStyle(element).fontSize)),
    ).toBeGreaterThanOrEqual(12);
  }
});
