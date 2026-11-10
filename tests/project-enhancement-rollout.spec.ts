import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import fs from 'node:fs';
import { createHash } from 'node:crypto';
import { getAllDeveloperProjects, getDeveloperProjects } from '../src/lib/developer-projects';
import { DEVELOPER_PROJECT_PAGE_SIZE } from '../src/lib/developer-project-pagination';
import { getProjectMedia } from '../src/lib/project-media';
import { getProjectFloorPlans, getProjectLocation } from '../src/lib/project-enhancements';
import { projectMediaNote, projectPlanArea, projectPlanLabel } from '../src/lib/project-media-copy';
import { originalImagePath } from './image-source';

const projects = getAllDeveloperProjects();
const queue = JSON.parse(fs.readFileSync('docs/project-page-enhancement-queue.json', 'utf8'));
const reviewing = projects.filter((p) =>
  queue.projects.some(
    (entry: { id: string; status: string }) =>
      entry.id === p.id && entry.status === 'integrated-awaiting-verification',
  ),
);

for (const project of reviewing) {
  test(`${project.name}: own assets, floor-plan navigation and location fit the approved pattern`, async ({
    page,
    request,
  }) => {
    const media = getProjectMedia(project)!;
    const plans = getProjectFloorPlans(project);
    test.setTimeout(Math.max(150_000, 90_000 + (plans?.plans.length ?? 0) * 2_000));
    const location = getProjectLocation(project)!;
    expect([media.projectSlug, location.projectSlug]).toEqual([project.slug, project.slug]);
    if (plans) expect(plans.projectSlug).toBe(project.slug);
    const checkedHashes = new Map<string, string>();
    for (const asset of [
      ...media.images,
      ...(plans?.plans ?? []),
      ...(location.map ? [location.map] : []),
      ...(plans ? [{ src: plans.source.pdf, sha256: plans.source.sha256 }] : []),
      ...(plans?.plans.flatMap((plan) =>
        plan.source ? [{ src: plan.source.pdf, sha256: plan.source.sha256 }] : [],
      ) ?? []),
    ]) {
      let hash = checkedHashes.get(asset.src);
      if (hash === undefined) {
        hash = createHash('sha256')
          .update(fs.readFileSync(`public${asset.src}`))
          .digest('hex');
        checkedHashes.set(asset.src, hash);
      }
      expect(hash).toBe(asset.sha256);
    }
    for (const pdf of new Set(
      plans
        ? [
            plans.source.pdf,
            ...plans.plans.flatMap((plan) => (plan.source ? [plan.source.pdf] : [])),
          ]
        : [],
    )) {
      const response = await request.get(pdf);
      expect(response.status()).toBe(200);
      expect(response.headers()['content-type']).toContain('application/pdf');
    }
    const errors: string[] = [];
    page.on('pageerror', (error) => errors.push(error.message));
    await page.goto(`/developers/${project.developerSlug}/projects/${project.slug}`);
    await expect(page.locator('.pd-heading .pd-location')).toHaveText(location.community);
    await expect(page.locator('.pd-research-pending')).toHaveCount(0);
    await expect(page.locator('.pd-gallery-thumbnails button')).toHaveCount(media.images.length);
    const firstPhoto = media.images.find((image) => image.photograph);
    const firstRender = media.images.find((image) => !image.photograph);
    if (firstPhoto && firstRender) {
      const gallery = page.locator('#project-gallery');
      const thumbnails = gallery.locator('.pd-gallery-thumbnails button');
      const openGallery = gallery.locator('.pd-gallery-open');
      const lightbox = page.locator('.pd-lightbox');
      await expect(gallery.getByRole('link', { name: 'Image source' })).toHaveAttribute(
        'href',
        media.source.url,
      );
      await thumbnails
        .filter({ has: page.locator(`img[src*="${encodeURIComponent(firstPhoto.src)}"]`) })
        .click();
      await openGallery.press('Enter');
      await expect(lightbox).toBeVisible();
      await expect(lightbox.locator('img')).toHaveAttribute(
        'alt',
        firstPhoto.alt || `${project.name} — ${firstPhoto.label}, project photograph`,
      );
      await page.keyboard.press('Escape');
      await expect(openGallery).toBeFocused();
      await thumbnails
        .filter({ has: page.locator(`img[src*="${encodeURIComponent(firstRender.src)}"]`) })
        .click();
      await openGallery.press('Enter');
      await expect(lightbox).toBeVisible();
      await expect(lightbox.locator('img')).toHaveAttribute(
        'alt',
        firstRender.alt || `${project.name} — ${firstRender.label}, project render`,
      );
      await page.keyboard.press('Escape');
      await thumbnails.first().click();
    }
    const interiorCount = media.editorialImages?.length ?? 0;
    await expect(page.locator('.pm-scenes-grid figure')).toHaveCount(interiorCount);
    if (interiorCount > 0) {
      await expect(page.locator('.pm-scenes-heading h3')).toHaveText(
        `A look inside ${project.name}.`,
      );
    } else {
      await expect(page.locator('.pm-scenes')).toHaveCount(0);
    }
    if (plans) {
      const select = page.locator('#floor-plans select');
      await expect(page.locator('#floor-plans > .pd-eyebrow')).toHaveText(
        plans.eyebrow ?? (project.type === 'Office' ? 'Inside the workplace' : 'Inside the home'),
      );
      await expect(select.locator('option')).toHaveCount(plans.plans.length);
      for (let i = 0; i < plans.plans.length; i++) {
        await select.selectOption(String(i));
        await page.locator('.fp-preview').scrollIntoViewIfNeeded();
        await page.locator('.fp-preview img').evaluate((img) => (img as HTMLImageElement).decode());
        const area = projectPlanArea(plans.plans[i].area);
        if (area) await expect(page.locator('.fp-area')).toHaveText(area);
        else await expect(page.locator('.fp-area')).toHaveCount(0);
        const plan = plans.plans[i];
        if (plan.imageSource?.background === 'dark') {
          await expect(page.locator('.fp-preview')).toHaveCSS(
            'background-color',
            'rgb(21, 21, 21)',
          );
        }
        await expect(page.locator('.fp-source')).toHaveAttribute(
          'href',
          plan.imageSource?.url ?? `${(plan.source || plans.source).url}#page=${plan.sourcePage}`,
        );
        await expect(page.locator('.fp-toolbar a')).toHaveAttribute(
          'href',
          plan.imageSource ? plan.src : (plan.source || plans.source).pdf,
        );
      }
    } else {
      const unavailable = media.unavailableFloorPlans;
      expect(unavailable).toBeDefined();
      expect(unavailable!.reviewedOn).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(unavailable!.sources.length).toBeGreaterThan(0);
      await expect(page.locator('#floor-plans, .pd-floor-plans-unavailable')).toHaveCount(0);
      await expect(page.locator('.pd-nav a[href="#floor-plans"]')).toHaveCount(0);
      for (const source of unavailable!.sources) {
        expect(new URL(source.url).protocol).toBe('https:');
      }
    }
    await expect(page.locator('#location .pl-destinations li')).toHaveCount(
      location.travel.destinations.length,
    );
    await expect(page.locator('#location .pl-time')).toHaveText(
      location.travel.destinations.map(
        ({ minutes, maxMinutes, timeQualifier }) =>
          `${timeQualifier ?? ''}${maxMinutes === undefined ? minutes : `${minutes}–${maxMinutes}`}min`,
      ),
    );
    await expect(page.locator('#location .pl-distance')).toHaveText(
      location.travel.destinations.flatMap(({ distanceKm }) =>
        distanceKm === undefined ? [] : [`${distanceKm} km`],
      ),
    );
    if (location.pin) {
      await page.locator('#location summary').click();
      await expect(page.locator('#location .pl-interactive p')).toHaveText(
        projectMediaNote(location.pin.scope) || `${location.community} location`,
      );
      await page.locator('#location summary').click();
    } else {
      // Unreliable source coordinates must not become an interactive project pin.
      await expect(page.locator('#location iframe')).toHaveCount(0);
      const directions = await page.locator('#location .pl-intro a').getAttribute('href');
      expect(new URL(directions!).searchParams.get('destination')).toBe(
        `${project.name}, ${location.community}`,
      );
    }
    for (const theme of ['light', 'dark']) {
      await page.evaluate((theme) => (document.documentElement.dataset.theme = theme), theme);
      for (const width of [320, 390, 768, 1024, 1440]) {
        await page.setViewportSize({ width, height: 1000 });
        expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(
          width,
        );
        if (plans) {
          const sheetBottom = await page
            .locator('.fp-preview img')
            .evaluate((image) => image.getBoundingClientRect().bottom);
          const controlTop = await page
            .locator('.fp-preview > span')
            .evaluate((control) => control.getBoundingClientRect().top);
          expect(controlTop).toBeGreaterThanOrEqual(sheetBottom);
        }
        if ([390, 1440].includes(width)) {
          for (const id of ['project-gallery', 'floor-plans', 'location']) {
            if (id === 'floor-plans' && !plans) continue;
            const section = page.locator(`#${id}`);
            await section.scrollIntoViewIfNeeded();
            for (const img of await section.locator('img').all()) {
              if (!(await img.isVisible())) continue;
              await img.scrollIntoViewIfNeeded();
              await img.evaluate((img) => (img as HTMLImageElement).decode());
            }
            if (id === 'project-gallery')
              await section.locator('.pd-gallery-thumbnails').evaluate((el) => (el.scrollLeft = 0));
            await section.scrollIntoViewIfNeeded();
            await page.screenshot({
              path: `artifacts/project-page-enhancement/${project.slug}/${id}-${theme}-${width}.png`,
            });
          }
          const audit = await new AxeBuilder({ page })
            .include('.project-detail')
            .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
            .analyze();
          expect(audit.violations).toEqual([]);
        }
      }
    }
    if (plans) {
      await page.locator('.fp-preview').focus();
      await page.keyboard.press('Enter');
      const dialog = page.getByRole('dialog', {
        name: projectPlanLabel(plans.plans.at(-1)!.label),
      });
      await expect(dialog).toBeVisible();
      if (plans.plans.at(-1)!.imageSource?.background === 'dark') {
        await expect(dialog.locator('.fp-viewport')).toHaveCSS(
          'background-color',
          'rgb(21, 21, 21)',
        );
      }
      await dialog.getByRole('button', { name: 'Zoom to original size' }).click();
      const zoomed = await dialog.locator('.fp-viewport').evaluate(async (viewport) => {
        const image = viewport.querySelector('img')!;
        await image.decode();
        return {
          renderedWidth: Math.round(image.getBoundingClientRect().width),
          naturalWidth: image.naturalWidth,
          horizontalScroll: viewport.scrollWidth > viewport.clientWidth,
          needsHorizontalScroll: image.naturalWidth > viewport.clientWidth,
        };
      });
      expect(zoomed.renderedWidth).toBe(zoomed.naturalWidth);
      expect(zoomed.horizontalScroll).toBe(zoomed.needsHorizontalScroll);
      await page.keyboard.press('Escape');
      await expect(dialog).not.toBeVisible();
      await expect(page.locator('.fp-preview')).toBeFocused();
    } else {
      const trigger = page.locator('.pd-gallery-open');
      await trigger.focus();
      await page.keyboard.press('Enter');
      await expect(page.locator('.pd-lightbox')).toBeVisible();
      await page.keyboard.press('Escape');
      await expect(page.locator('.pd-lightbox')).not.toBeVisible();
      await expect(trigger).toBeFocused();
      await page.getByRole('link', { name: 'Image source' }).focus();
      await expect(page.getByRole('link', { name: 'Image source' })).toBeFocused();
    }
    const cardIndex = getDeveloperProjects(project.developerSlug).findIndex(
      (entry) => entry.id === project.id,
    );
    expect(cardIndex).toBeGreaterThanOrEqual(0);
    const cardPage = Math.floor(cardIndex / DEVELOPER_PROJECT_PAGE_SIZE) + 1;
    await page.goto(`/developers/${project.developerSlug}?page=${cardPage}#developer-projects`);
    const card = page.locator(`article.project-card[data-project-id="${project.id}"]`);
    expect(originalImagePath((await card.locator('img').getAttribute('src'))!, page.url())).toBe(media.cardImage);
    await expect(card.locator('.project-location')).not.toHaveText(
      /\b(Dubai|Sharjah|Abu Dhabi|Ras Al Khaimah|Ajman|Fujairah|Umm Al Quwain),\s*\1$/i,
    );
    await expect(page.locator('.project-card-badge')).toHaveCount(0);
    expect(errors).toEqual([]);
  });
}
