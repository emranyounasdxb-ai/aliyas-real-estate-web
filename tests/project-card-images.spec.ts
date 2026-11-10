import { expect, test } from '@playwright/test';
import { getAllDeveloperProjects } from '../src/lib/developer-projects';
import { getProjectMedia } from '../src/lib/project-media';
import { originalImagePath } from './image-source';

test('opening a project retains its card cover and every source gallery image', async ({
  page,
}) => {
  test.setTimeout(150_000);
  const projects = getAllDeveloperProjects();
  for (const width of [1440, 390]) {
    await page.setViewportSize({ width, height: 1000 });
    for (const slug of [
      'bloom-living-malaga',
      'bloom-living-marbella',
      'vista-ridge',
      'grove-ridge',
    ]) {
      const project = projects.find((entry) => entry.slug === slug)!;
      const media = getProjectMedia(project)!;
      await page.goto(`/projects?q=${encodeURIComponent(project.name)}`);
      await page.locator(`[data-project-id="${project.id}"] .project-card-image-link`).click();
      await expect(page).toHaveURL(`/developers/${project.developerSlug}/projects/${slug}`);
      const gallery = page.locator('#project-gallery');
      const mainImage = gallery.locator('.pd-gallery-open img');
      await mainImage.evaluate((image) => (image as HTMLImageElement).decode());
      expect(
        originalImagePath((await mainImage.getAttribute('src'))!, page.url()),
      ).toBe(media.cardImage);
      const thumbnailSources = await gallery
        .locator('.pd-gallery-thumbnails img')
        .evaluateAll((images) =>
          images.map((image) => {
            const url = new URL(image.getAttribute('src')!, location.href);
            return url.searchParams.get('url') || url.pathname;
          }),
        );
      expect(thumbnailSources).toHaveLength(media.images.length);
      expect(thumbnailSources[0]).toBe(media.cardImage);
      expect([...thumbnailSources].sort()).toEqual(media.images.map((image) => image.src).sort());
      // Next may retain the previous route's tags during client navigation;
      // the current route's tag must still identify this project.
      const images = page.locator('meta[property="og:image"]');
      await expect(images.last()).toHaveAttribute('content', new RegExp(media.cardImage));
      expect(new URL((await images.last().getAttribute('content'))!).pathname).toBe(
        media.cardImage,
      );
      const crawlerResponse = await page.request.get(page.url(), {
        headers: { 'user-agent': 'facebookexternalhit/1.1' },
      });
      expect(crawlerResponse.ok()).toBeTruthy();
      const crawlerHtml = await crawlerResponse.text();
      const crawlerImages = [
        ...crawlerHtml.matchAll(/<meta property="og:image" content="([^"]+)"/g),
      ];
      expect(crawlerImages).toHaveLength(1);
      expect(new URL(crawlerImages[0][1]).pathname).toBe(media.cardImage);
      await page.screenshot({
        path: `artifacts/project-card-uniqueness/${slug}-detail-${width}.png`,
      });
      const trigger = gallery.locator('.pd-gallery-open');
      await trigger.focus();
      await page.keyboard.press('Enter');
      const dialog = page.getByRole('dialog', { name: `${project.name} image gallery` });
      await expect(dialog).toBeVisible();
      await expect(dialog.locator('.pd-lightbox-controls p')).toContainText('01 /');
      await page.keyboard.press('ArrowRight');
      expect(
        originalImagePath((await dialog.locator('img').getAttribute('src'))!, page.url()),
      ).toBe(thumbnailSources[1]);
      await page.keyboard.press('Escape');
      await expect(dialog).not.toBeVisible();
      await expect(trigger).toBeFocused();
    }
  }
});

test('every public project selects a distinct image from its own sourced gallery', () => {
  const projects = getAllDeveloperProjects();
  expect(projects).toHaveLength(575);
  const selected = new Map<string, string[]>();
  for (const project of projects) {
    const media = getProjectMedia(project)!;
    expect(media, project.id).toBeTruthy();
    const card = media.images.find((image) => image.src === media.cardImage)!;
    expect(card, project.id).toBeTruthy();
    expect(card.src).toMatch(
      new RegExp(`^/images/projects/${project.developerSlug}/${project.slug}/`),
    );
    expect(card.sourceUrl, project.id).toMatch(/^https?:\/\//);
    selected.set(card.sha256, [...(selected.get(card.sha256) || []), project.id]);
  }
  expect([...selected.values()].filter((owners) => owners.length > 1)).toEqual([]);
});

test('the reported duplicate pairs render their distinct selected covers on desktop and mobile', async ({
  page,
}) => {
  test.setTimeout(120_000);
  const projects = getAllDeveloperProjects();
  for (const width of [1440, 390]) {
    await page.setViewportSize({ width, height: 1000 });
    for (const slug of [
      'bloom-living-malaga',
      'bloom-living-marbella',
      'vista-ridge',
      'grove-ridge',
    ]) {
      const project = projects.find((entry) => entry.slug === slug)!;
      const media = getProjectMedia(project)!;
      const cover = media.images.find((image) => image.src === media.cardImage)!;
      await page.goto(`/projects?q=${encodeURIComponent(project.name)}`);
      const card = page.locator(`.catalogue-project-grid [data-project-id="${project.id}"]`);
      const image = card.locator('img');
      await card.scrollIntoViewIfNeeded();
      await image.evaluate((element) => (element as HTMLImageElement).decode());
      expect(
        await image.evaluate((element) => (element as HTMLImageElement).naturalWidth),
      ).toBeGreaterThan(0);
      expect(originalImagePath((await image.getAttribute('src'))!, page.url())).toBe(media.cardImage);
      await expect(image).toHaveAttribute('alt', new RegExp(project.name));
      await expect(image).toHaveAttribute(
        'alt',
        new RegExp(cover.photograph ? 'project photograph' : 'project render'),
      );
      const link = card.locator('.project-card-image-link');
      await expect(link).toHaveAttribute(
        'href',
        `/developers/${project.developerSlug}/projects/${slug}`,
      );
      await link.focus();
      await expect(link).toBeFocused();
      expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(
        width,
      );
      await card.screenshot({ path: `artifacts/project-card-uniqueness/${slug}-${width}.png` });
    }
  }
});
