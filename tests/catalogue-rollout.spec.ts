import { expect, test } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { getAllDeveloperProjects } from '../src/lib/developer-projects';
import { getProjectMedia } from '../src/lib/project-media';
import { projects } from '../src/lib/content';
import { originalImagePath } from './image-source';

test('featured project facts and images match their researched catalogue records', () => {
  expect(projects.map((project) => project.slug)).toEqual([
    'sobha-solis',
    'gardenia-bay',
    'cala-del-mar',
    'damac-islands',
  ]);
  const records = getAllDeveloperProjects();
  for (const featured of projects) {
    const record = records.find((project) => project.id === featured.id)!;
    expect(record).toBeDefined();
    expect(featured).toMatchObject({
      name: record.name,
      price: record.price,
      bedrooms: record.bedrooms,
      type: record.type,
      areaId: record.areaId,
      image: getProjectMedia(record)!.cardImage,
      href: `/developers/${record.developerSlug}/projects/${record.slug}`,
    });
    expect(featured.image).toMatch(/^\/images\/projects\//);
  }
});

test('the off-plan entry point exposes all575 owned records with15-card pages and persistent navigation', async ({
  page,
}) => {
  test.setTimeout(150_000);
  const records = getAllDeveloperProjects();
  expect(records).toHaveLength(575);
  await page.goto('/projects');
  const cards = page.locator('.catalogue-project-grid .project-card');
  const nav = page.getByRole('navigation', { name: 'Project pagination' });
  await expect(page.locator('.catalogue-count strong')).toHaveText('575');
  await expect(cards).toHaveCount(15);
  await expect(page.locator('.project-card-badge')).toHaveCount(0);
  await nav.getByRole('link', { name: 'Next', exact: true }).focus();
  await page.keyboard.press('Enter');
  await expect(page).toHaveURL(/\/projects\?page=2#catalogue-results$/);
  await expect(page.locator('#catalogue-results')).toBeFocused();
  await expect(cards.first()).toHaveAttribute('data-project-id', records[15].id);
  await page.reload();
  await expect(cards.first()).toHaveAttribute('data-project-id', records[15].id);
  await nav.getByRole('link', { name: 'Page 39', exact: true }).click();
  await expect(cards).toHaveCount(5);
  await expect(nav.locator('[aria-disabled="true"]').last()).toHaveText('Next');
  await page.goBack();
  await expect(cards.first()).toHaveAttribute('data-project-id', records[15].id);
  await page.goForward();
  await expect(cards).toHaveCount(5);
  await page.getByRole('textbox', { name: 'Search projects' }).fill('Sealine Residence');
  await expect(page).not.toHaveURL(/[?&]page=/);
  await expect(cards).toHaveCount(1);
  await expect(cards.first()).toHaveAttribute('data-project-id', 'al-zorah-project-02');
  const project = records.find((project) => project.id === 'al-zorah-project-02')!;
  const media = getProjectMedia(project)!;
  const image = cards.first().locator('img');
  await image.evaluate((image) => (image as HTMLImageElement).decode());
  expect(originalImagePath((await image.getAttribute('src'))!, page.url())).toBe(media.cardImage);
  await expect(cards.first().locator('.project-card-image-link')).toHaveAttribute(
    'href',
    '/developers/al-zorah/projects/sealine-residence',
  );
  await page.goto('/projects?page=999999');
  await expect(cards).toHaveCount(5);
  await expect(nav.locator('[aria-current="page"]')).toHaveText('39');
  await page.goto('/projects?collection=waterfront');
  await expect(cards).toHaveCount(2);
  await expect(cards.filter({ hasText: 'Gardenia Bay' })).toHaveAttribute(
    'data-project-id',
    'aldar-project-21',
  );
  await page.goto('/projects?emirate=Ajman&q=unmatched-project-000');
  await expect(cards).toHaveCount(0);
  await expect(page.locator('.catalogue-empty')).toContainText('Try another location');
  await expect(page.locator('.catalogue-empty')).not.toContainText('There are no Ajman projects');
});

test('saved legacy slugs resolve to sourced owned cards and omit retired sample entries', async ({
  page,
}) => {
  await page.addInitScript(() =>
    localStorage.setItem('aliyas-saved-projects', JSON.stringify(['gardenia-bay', 'creek-waters'])),
  );
  await page.goto('/projects?saved=1');
  const cards = page.locator('.catalogue-project-grid .project-card');
  await expect(cards).toHaveCount(1);
  await expect(cards.filter({ hasText: 'Gardenia Bay' })).toHaveAttribute(
    'data-project-id',
    'aldar-project-21',
  );
  await expect(cards.locator('.project-card-image-link')).toHaveAttribute(
    'href',
    '/developers/aldar/projects/gardenia-bay',
  );
  await expect(cards.filter({ hasText: 'Creek Waters' })).toHaveCount(0);
});

test('curated collections contain sourced owned projects', async ({ page }) => {
  for (const [collection, ids] of [
    ['waterfront', ['aldar-project-21', 'ellington-project-19']],
    ['villas', ['emaar-project-07', 'emaar-project-49', 'meraas-project-09']],
    ['city', ['sobha-project-19']],
  ] as const) {
    await page.goto(`/projects?collection=${collection}`);
    const cards = page.locator('.catalogue-project-grid .project-card');
    await expect(cards).toHaveCount(ids.length);
    expect(
      await cards.evaluateAll((elements) =>
        elements.map((element) => element.getAttribute('data-project-id')).sort(),
      ),
    ).toEqual([...ids].sort());
    await expect(cards.locator('.project-card-image-link').first()).toHaveAttribute(
      'href',
      /^\/developers\/[^/]+\/projects\/[^/]+$/,
    );
  }
});

test('previously shared project URLs redirect to canonical pages or the catalogue', async ({
  page,
}) => {
  test.setTimeout(90_000);
  for (const [slug, target] of [
    ['sobha-solis', '/developers/sobha/projects/sobha-solis'],
    ['gardenia-bay', '/developers/aldar/projects/gardenia-bay'],
    ['cala-del-mar', '/developers/ellington/projects/cala-del-mar'],
    ['damac-islands', '/developers/damac/projects/damac-islands'],
    ['creek-waters', '/projects'],
    ['the-acres', '/projects'],
  ]) {
    await page.goto(`/projects/${slug}`);
    await expect(page).toHaveURL(new RegExp(`${target}$`));
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  }
});

test('catalogue cards and shared pagination fit both themes and all target widths', async ({
  page,
}) => {
  test.setTimeout(150_000);
  await page.goto('/projects');
  for (const theme of ['light', 'dark']) {
    await page.evaluate((theme) => {
      document.documentElement.dataset.theme = theme;
    }, theme);
    for (const width of [320, 390, 768, 1024, 1440]) {
      await page.setViewportSize({ width, height: 1000 });
      await expect(page.locator('.catalogue-project-grid .project-card')).toHaveCount(15);
      expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(
        width,
      );
      const nav = page.getByRole('navigation', { name: 'Project pagination' });
      await nav.scrollIntoViewIfNeeded();
      await expect(nav.getByRole('link', { name: 'Next', exact: true })).toBeVisible();
      if (width === 390 || width === 1440) {
        await nav.screenshot({
          path: `artifacts/project-page-enhancement/final-575/catalogue-pagination-${theme}-${width}.png`,
        });
        await page
          .locator('.catalogue-project-grid .project-card')
          .first()
          .scrollIntoViewIfNeeded();
        await page
          .locator('.catalogue-project-grid .project-card')
          .first()
          .locator('img')
          .evaluate((image) => (image as HTMLImageElement).decode());
        await page
          .locator('.catalogue-project-grid .project-card')
          .first()
          .screenshot({
            path: `artifacts/project-page-enhancement/final-575/catalogue-card-${theme}-${width}.png`,
          });
        expect(
          (
            await new AxeBuilder({ page })
              .include('.catalogue-page')
              .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
              .analyze()
          ).violations,
        ).toEqual([]);
      }
    }
  }
});
