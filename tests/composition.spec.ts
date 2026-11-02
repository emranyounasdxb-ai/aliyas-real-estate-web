import { test, expect } from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';

test('destination panel is compact on desktop and map controls remain inside its frame at every width', async ({
  page,
}) => {
  for (const width of [320, 390, 768, 1024, 1440]) {
    await page.setViewportSize({ width, height: 1000 });
    await page.goto('/');
    await page.getByRole('button', { name: 'Show Ajman on map', exact: true }).click();
    await expect(page.getByRole('tab', { name: '04 Ajman', exact: true })).toHaveAttribute(
      'aria-selected',
      'true',
    );
    const section = (await page.locator('.future-destination-section').boundingBox())!;
    if (width === 1440) expect(section.height).toBeLessThan(850);
    const frame = (await page.locator('.destination-map-panel').boundingBox())!;
    const buttons = await page
      .locator('.destination-map button')
      .evaluateAll((elements) =>
        elements.map((element) => element.getBoundingClientRect().toJSON()),
      );
    for (const button of buttons) {
      expect(button.x).toBeGreaterThanOrEqual(frame.x - 1);
      expect(button.right).toBeLessThanOrEqual(frame.x + frame.width + 1);
      expect(button.height).toBeGreaterThanOrEqual(44);
    }
    for (let i = 0; i < buttons.length; i++)
      for (let j = i + 1; j < buttons.length; j++) {
        const a = buttons[i],
          b = buttons[j];
        expect(
          a.right <= b.left || b.right <= a.left || a.bottom <= b.top || b.bottom <= a.top,
        ).toBe(true);
      }
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
      true,
    );
  }
});

test('home Journal has a featured cover and two compact stories with working article links', async ({
  page,
}) => {
  for (const width of [390, 820, 1440]) {
    await page.setViewportSize({ width, height: 1000 });
    await page.goto('/');
    await expect(page.locator('.journal-home-featured')).toHaveCount(1);
    await expect(page.locator('.journal-home-compact')).toHaveCount(2);
    await expect(page.locator('.journal-home-story')).toHaveCount(3);
    for (const card of await page.locator('.journal-home-story').all()) {
      await expect(card.locator('h3')).toBeVisible();
      await expect(card.locator('.journal-home-read')).toBeVisible();
    }
    await page.locator('.journal-home-featured').click();
    await expect(page).toHaveURL(/\/journal\/a-home-that-feels-like-you$/);
    await expect(page.locator('h1')).toContainText('A home that feels like you');
  }
});

test('all ninety placeholder galleries retain ownership and category-compatible concept assets', async () => {
  const directory = path.resolve('src/data/developer-projects');
  let count = 0;
  const ids = new Set<string>();
  for (const file of fs.readdirSync(directory).filter((file) => file.endsWith('.json'))) {
    const collection = JSON.parse(fs.readFileSync(path.join(directory, file), 'utf8'));
    expect(collection.projects).toHaveLength(15);
    for (const project of collection.projects) {
      count++;
      expect(ids.has(project.id)).toBe(false);
      ids.add(project.id);
      expect(project.developerSlug).toBe(collection.developerSlug);
      expect(project.gallery).toHaveLength(3);
      expect(project.gallery[0].src).toBe(project.image);
      const category = /project-(1|3)\.jpg$/.test(project.image) ? 'apartment' : 'villa';
      expect(project.gallery[2].src).toBe(`/images/concept-${category}-detail.png`);
      if (project.image !== '/images/project-4.jpg')
        expect(project.gallery[1].src).toBe(`/images/concept-${category}-interior.png`);
      for (const image of project.gallery)
        expect(fs.existsSync(path.resolve('public', image.src.slice(1)))).toBe(true);
      expect(project.price).toBeNull();
      expect(project.type).toBeNull();
    }
  }
  expect(count).toBe(90);
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
    ['/projects/creek-waters', 'Project resources', 'project-resources'],
    ['/developers/emaar/projects/emaar-project-15', 'Downloads', 'downloads'],
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
