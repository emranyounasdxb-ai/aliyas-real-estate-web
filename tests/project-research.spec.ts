import { expect, test } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { readFileSync } from 'node:fs';
import { getAllDeveloperProjects, developerProjectHref } from '../src/lib/developer-projects';
import { getProjectMedia } from '../src/lib/project-media';

const researched = getAllDeveloperProjects().filter((p) => p.research?.status === 'reviewed');
const renderProjects = process.env.PROJECT_RESEARCH_DEVELOPER
  ? researched.filter((p) => p.developerSlug === process.env.PROJECT_RESEARCH_DEVELOPER)
  : researched;

test('researched details retain all 575 identities and images, trace fields and balance payments', () => {
  const all = getAllDeveloperProjects();
  const baseline = JSON.parse(readFileSync('docs/project-detail-baseline.json', 'utf8'));
  expect(all).toHaveLength(575);
  for (const old of baseline) {
    const current = all.find((p) => p.id === old.id)!;
    for (const key of Object.keys(old))
      expect(current[key as keyof typeof current], `${old.id}: ${key}`).toEqual(old[key]);
  }
  expect(researched.length).toBeGreaterThanOrEqual(5);
  const allocations = new Map<string, number>();
  const areas = JSON.parse(readFileSync('src/data/locations.json', 'utf8')) as { id: string; emirate: string }[];
  for (const project of researched) {
    if (project.areaId) {
      expect(areas.find(area => area.id === project.areaId)?.emirate, `${project.name}: location filter`).toBe(project.emirate);
    } else {
      // An unconfirmed neighbourhood must not acquire an invented filter mapping.
      expect(project.research!.locationNote.trim().length, `${project.name}: unmapped location explanation`).toBeGreaterThan(20);
    }
    const r = project.research!;
    expect(Object.keys(r.reviewCoverage)).toHaveLength(9);
    const sources = new Set(r.sources.map((s) => s.id));
    expect(sources.size).toBe(r.sources.length);
    for (const list of Object.values(r.fieldSources)) {
      if (!list) throw new Error(`${project.id}: missing field source list`);
      for (const id of list) expect(sources.has(id)).toBe(true);
    }
    for (const item of [...r.units, ...r.paymentStages, ...r.facts])
      for (const id of item.sourceIds) expect(sources.has(id)).toBe(true);
    for (const s of r.sources) {
      expect(s.url).toMatch(/^https:\/\//);
      expect(s.checkedOn).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(s.derivedWords).toBeLessThanOrEqual(200);
      allocations.set(s.url, (allocations.get(s.url) ?? 0) + s.derivedWords);
    }
    if (r.paymentStages.length)
      expect(r.paymentStages.reduce((n, s) => n + s.percent, 0)).toBe(100);
    expect(r.unresolved.length).toBeGreaterThan(0);
  }
  for (const [url, words] of allocations) expect(words, url).toBeLessThanOrEqual(200);
  expect(all.find((p) => p.slug === 'valia')!.handover).toBeNull();
  expect(all.find((p) => p.slug === 'fior-1')!.areaId).toBe('dubai-rashid-yachts-marina');
});

test('researched pages render their own units, sources, disclaimers and documents', async ({
  page,
}) => {
  test.setTimeout(Math.max(120_000, renderProjects.length * 2000));
  expect(renderProjects.length).toBeGreaterThan(0);
  for (const project of renderProjects) {
    await page.goto(developerProjectHref(project));
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(project.name);
    await expect(page.locator('.pd-research-table tbody tr')).toHaveCount(
      project.research!.units.length,
    );
    await expect(page.locator('#sources a')).toHaveCount(project.research!.sources.length);
    const media = getProjectMedia(project);
    await expect(page.locator('.pd-disclaimer')).toContainText(
      media ? `${media.source.name} project renders` : 'Photography is illustrative',
    );
    const brochure = page.getByRole('link', { name: /Project brochure View document/ });
    if (project.brochureUrl) await expect(brochure).toHaveAttribute('href', project.brochureUrl);
    else await expect(brochure).toHaveCount(0);
    if (project.floorPlanUrl)
      await expect(page.locator(`a[href="${project.floorPlanUrl}"]`).first()).toBeVisible();
    expect(
      await page
        .locator('#sources a')
        .evaluateAll((nodes) => nodes.map((n) => n.getAttribute('href'))),
    ).toEqual(project.research!.sources.map((s) => s.url));
  }
});

test('research details fit mobile and desktop themes and support keyboard enquiry', async ({
  page,
}) => {
  test.setTimeout(120_000);
  await page.goto('/developers/emaar/projects/golf-fields');
  for (const theme of ['light', 'dark']) {
    await page.evaluate((theme) => (document.documentElement.dataset.theme = theme), theme);
    for (const width of [320, 390, 768, 1440]) {
      await page.setViewportSize({ width, height: 1000 });
      expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(
        width,
      );
      await page.locator('#project-details').scrollIntoViewIfNeeded();
      await page.screenshot({ path: `artifacts/project-details/details-${theme}-${width}.png` });
      if (width === 390 || width === 1440)
        expect(
          (
            await new AxeBuilder({ page })
              .include('.project-detail')
              .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
              .analyze()
          ).violations,
        ).toEqual([]);
    }
  }
  const summary = page.locator('.pd-research-pending summary');
  await summary.focus();
  await page.keyboard.press('Enter');
  await expect(page.locator('.pd-research-pending')).toHaveAttribute('open', '');
  await page.locator('.pd-enquiry-panel').getByRole('button', { name: 'Enquire now' }).click();
  await expect(page.getByRole('dialog')).toBeVisible();
  await expect(page.getByRole('dialog').locator('textarea')).toHaveValue(/Golf Fields/);
  await page.keyboard.press('Escape');
  await expect(page.getByRole('dialog')).not.toBeVisible();
});

test('phase-specific schedules and new community filters retain the right projects', async ({ page }) => {
  test.setTimeout(60_000);
  for (const [area, names] of [
    ['dubai-the-heights', ['Serro 2', 'Serro', 'Salva']],
    ['dubai-expo-living', ['Terra Woods', 'Terra Gardens', 'Terra Heights']],
    ['dubai-rashid-yachts-marina', [
      'Fior 1', 'Sera 1', 'Sera 2', 'Baystar by Vida', 'Aurea', 'Ocean Point', 'Ocean Star',
      'Marina Views', 'Ocean Cove', 'Pier Point', 'Porto View', 'Marina Place 1', 'Marina Place 2',
    ]],
  ] as const) {
    await page.goto(`/developers/emaar?emirate=Dubai&area=${area}#developer-projects`);
    await expect(page.locator('.developer-listings .project-card')).toHaveCount(names.length);
    expect(await page.locator('.developer-listings .project-card h3').allTextContents()).toEqual(names);
  }
  await page.goto('/developers/emaar/projects/serro-2');
  await expect(page.locator('.pd-research-payments li')).toHaveCount(9);
  await expect(page.locator('.pd-research-payments li').last()).toContainText('May 2030');
  for (const theme of ['light', 'dark']) {
    await page.evaluate(theme => document.documentElement.dataset.theme = theme, theme);
    for (const width of [320, 390, 768, 1440]) {
      await page.setViewportSize({ width, height: 1000 });
      expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(width);
      await page.locator('.pd-research-payments').scrollIntoViewIfNeeded();
      if (width === 390 || width === 1440) await page.screenshot({ path: `artifacts/project-details/payments-${theme}-${width}.png` });
    }
  }
});

test('Valley variants retain distinct plans and Golf Edge separates townhouse areas', async ({ page }) => {
  await page.goto('/developers/emaar?emirate=Dubai&area=dubai-the-valley#developer-projects');
  // Exact fixtures cover the completed 108-record Emaar chapter, including later batches.
  expect(await page.locator('.developer-listings .project-card h3').allTextContents()).toEqual([
    'Elea', 'Kaia', 'Elva', 'Rivera', 'Vindera', 'Ovelle', 'Avelia', 'Farm Gardens 2',
    'Lillia', 'Venera', 'Velora', 'Avena', 'Avena 2', 'Farm Grove', 'Velora 2',
  ]);
  const kaia = researched.find(p => p.slug === 'kaia')!;
  expect(kaia.floorPlanUrl).toContain('KAIA_TV_FLOORPLAN.pdf');
  expect(kaia.research!.units.map(u => u.label).join(' ')).not.toMatch(/Slate|Oakley/);
  const edge = researched.find(p => p.slug === 'golf-edge')!;
  const avelia = researched.find(p => p.slug === 'avelia')!;
  const ovelle = researched.find(p => p.slug === 'ovelle')!;
  expect(avelia.floorPlanUrl).toContain('AVELIA_TV_FLOORPLAN.pdf');
  expect(avelia.research!.paymentStages.find(s => s.stage.includes('90%'))!.stage).toContain('February 2029');
  expect(ovelle.research!.paymentStages.find(s => s.stage.includes('90%'))!.stage).toContain('January 2029');
  expect(edge.research!.units.find(u => u.label === '3 bedroom apartment')!.area).toContain('2,167.96');
  expect(edge.research!.units.find(u => u.label === '3 bedroom townhouse')!.area).toContain('2,987.42');
  await page.goto('/developers/emaar/projects/kaia');
  await expect(page.locator('.pd-research-table')).toContainText('Vina');
  await expect(page.locator('.pd-research-table')).toContainText('Luna');
});
