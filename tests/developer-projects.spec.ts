import { expect, test } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { readFileSync } from 'node:fs';
import { developers } from '../src/lib/content';
import {
  DEVELOPER_HERO_LIMIT,
  DEVELOPER_PROJECT_PAGE_SIZE,
} from '../src/lib/developer-project-pagination';
import {
  developerProjectHref,
  getAllDeveloperProjects,
  getDeveloperProject,
  getDeveloperProjects,
} from '../src/lib/developer-projects';

test('verified collections match their evidence records and keep stable owned identities', () => {
  const all = getAllDeveloperProjects();
  const baseline = JSON.parse(readFileSync('docs/project-expansion-baseline.json', 'utf8'));
  expect(all.length).toBeGreaterThan(306);
  expect(Math.max(...developers.map((d) => getDeveloperProjects(d.slug).length))).toBeGreaterThan(
    100,
  );
  expect(new Set(all.map((project) => project.id)).size).toBe(all.length);
  expect(new Set(all).size).toBe(all.length);
  for (const developer of developers) {
    const records = getDeveloperProjects(developer.slug);
    const research = JSON.parse(
      readFileSync(`docs/project-name-research/${developer.slug}.json`, 'utf8'),
    );
    expect(records.map((p) => p.name)).toEqual(
      research.projects.map((p: { name: string }) => p.name),
    );
    expect(records.length).toBeGreaterThan(0);
    const previous = baseline.find(
      (d: { developerSlug: string }) => d.developerSlug === developer.slug,
    );
    for (const old of previous.projects.filter((p: { nameSource?: unknown }) => p.nameSource)) {
      const current = records.find((p) => p.id === old.id);
      expect(current?.name).toBe(old.name);
      expect(current?.slug).toBe(old.slug);
      expect(current?.previousSlugs).toEqual(old.previousSlugs);
    }
    for (const project of records) {
      expect(project.developerSlug).toBe(developer.slug);
      expect(Object.isFrozen(project)).toBe(true);
      expect(getDeveloperProject(developer.slug, project.slug)).toBe(project);
      expect(project.nameSource?.url).toMatch(/^https:\/\//);
      expect(project.placeholder).toBe(true);
      for (const field of [
        'price',
        'bedrooms',
        'handover',
        'paymentPlan',
        'areaId',
        'type',
      ] as const)
        if (!project.research) expect(project[field]).toBeNull();
      for (const alias of project.previousSlugs ?? [])
        expect(getDeveloperProject(developer.slug, alias)).toBe(project);
      for (const other of developers.filter((item) => item.slug !== developer.slug)) {
        const otherProject = getDeveloperProject(other.slug, project.slug);
        // A joint development may legitimately have the same name under two owners.
        if (otherProject) {
          expect(otherProject.developerSlug).toBe(other.slug);
          expect(otherProject.id).not.toBe(project.id);
          expect(otherProject).not.toBe(project);
        }
      }
    }
  }
});

test('all thirty developers show only verified cards, hero links and correctly scoped detail pages', async ({
  page,
  request,
}) => {
  test.setTimeout(600_000);
  for (const developer of developers) {
    await page.goto(`/developers/${developer.slug}`);
    const cards = page.locator('.developer-listings .project-card');
    const records = getDeveloperProjects(developer.slug);
    await expect(cards).toHaveCount(Math.min(DEVELOPER_PROJECT_PAGE_SIZE, records.length));
    await expect(page.locator('.developer-hero-card')).toHaveCount(
      Math.min(DEVELOPER_HERO_LIMIT, records.length),
    );
    expect(
      await page
        .locator('.developer-hero-card-link')
        .evaluateAll((nodes) => nodes.map((n) => n.getAttribute('href'))),
    ).toEqual(records.slice(0, DEVELOPER_HERO_LIMIT).map(developerProjectHref));
    expect(
      await cards.evaluateAll((nodes) => [
        ...new Set(nodes.map((node) => node.getAttribute('data-developer'))),
      ]),
    ).toEqual([developer.slug]);
    expect(
      await cards
        .locator('.project-card-image-link')
        .evaluateAll((nodes) => nodes.map((node) => node.getAttribute('href'))),
    ).toEqual(records.slice(0, DEVELOPER_PROJECT_PAGE_SIZE).map(developerProjectHref));
  }
  const records = getAllDeveloperProjects();
  for (let index = 0; index < records.length; index += 6) {
    const responses = await Promise.all(
      records.slice(index, index + 6).map(async (project) => {
        const response = await request.get(developerProjectHref(project));
        return { project, status: response.status(), html: await response.text() };
      }),
    );
    for (const { project, status, html } of responses) {
      expect(status, project.id).toBe(200);
      expect(html).toContain(`data-project-id="${project.id}"`);
      const escapedName = project.name.replace(/&/g, '&amp;').replace(/'/g, '&#x27;');
      expect(html).toContain(`<h1>${escapedName}</h1>`);
      expect(html).toContain('noindex');
    }
  }
});

test('card, related cards and back navigation retain ownership and cross-owner detail URLs return 404', async ({
  page,
  request,
}) => {
  await page.goto('/developers/sobha');
  const selected = getDeveloperProjects('sobha')[14];
  await page
    .locator('.developer-listings')
    .getByRole('link', { name: `Explore ${selected.name}`, exact: true })
    .click();
  await expect(page).toHaveURL(new RegExp(developerProjectHref(selected) + '$'));
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(selected.name);
  const related = page.locator('.pd-related .project-card');
  await expect(related).toHaveCount(3);
  expect(
    await related.evaluateAll((nodes) => [
      ...new Set(nodes.map((node) => node.getAttribute('data-developer'))),
    ]),
  ).toEqual(['sobha']);
  await page.locator('.pd-back').first().click();
  await expect(page).toHaveURL(/\/developers\/sobha#developer-projects$/);
  for (const path of [
    '/developers/sobha/projects/emaar-project-01',
    '/developers/emaar/projects/emaar-project-99',
    '/developers/unknown/projects/emaar-project-01',
  ])
    expect((await request.get(path)).status()).toBe(404);
  expect(await (await request.get('/sitemap.xml')).text()).toContain('/developers/emaar/projects/');
  for (const developer of developers) {
    const project = getDeveloperProjects(developer.slug)[0];
    const old = `/developers/${developer.slug}/projects/${project.previousSlugs![0]}`;
    const response = await request.get(old, { maxRedirects: 0 });
    expect(response.status()).toBe(308);
    expect(response.headers().location).toBe(developerProjectHref(project));
  }
  expect((await request.get('/developers/al-zorah/projects/al-zorah-project-15')).status()).toBe(
    404,
  );
});

test('reviewed project details support light/dark, mobile layout, gallery and contextual enquiry', async ({
  page,
}) => {
  await page.goto('/developers/aldar/projects/aldar-project-07');
  for (const theme of ['light', 'dark']) {
    if ((await page.locator('html').getAttribute('data-theme')) !== theme)
      await page.locator('.theme-toggle').click();
    for (const width of [1440, 820, 390, 320]) {
      await page.setViewportSize({ width, height: 1000 });
      expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(
        width,
      );
      if (width === 1440 || width === 390)
        expect(
          (
            await new AxeBuilder({ page })
              .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
              .analyze()
          ).violations,
        ).toEqual([]);
    }
  }
  await page.getByRole('button', { name: 'Enquire about this project', exact: true }).click();
  await expect(page.getByRole('dialog')).toBeVisible();
  await expect(page.getByRole('dialog').locator('textarea')).toHaveValue(
    new RegExp(getDeveloperProjects('aldar')[6].name),
  );
  await page.keyboard.press('Escape');
  await page.locator('.pd-gallery-open').click();
  await expect(page.locator('.pd-lightbox')).toBeVisible();
  await page.keyboard.press('Escape');
});
