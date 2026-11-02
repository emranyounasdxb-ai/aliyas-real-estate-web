import { selectValue } from './select-control';
import { expect, test } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

function contrast(foreground: string, background: string) {
  const rgb = (value: string) => (value.match(/[\d.]+/g) || []).slice(0, 3).map(Number);
  const luminance = (value: string) =>
    rgb(value)
      .map((n) => {
        const s = n / 255;
        return s <= 0.04045 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
      })
      .reduce((sum, n, i) => sum + n * [0.2126, 0.7152, 0.0722][i], 0);
  const a = luminance(foreground),
    b = luminance(background);
  return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
}

test('mobile home action stays in the first viewport and contact form precedes the long contact story', async ({
  page,
}) => {
  for (const [width, height] of [
    [390, 844],
    [390, 640],
    [320, 568],
  ]) {
    await page.setViewportSize({ width, height });
    await page.goto('/');
    await page.evaluate(() => document.fonts.ready);
    const action = await page.locator('.future-hero-action').boundingBox();
    expect(action!.y + action!.height).toBeLessThanOrEqual(height);
    expect(
      await page
        .locator('.future-hero-eyebrow')
        .evaluate((el) => parseFloat(getComputedStyle(el).fontSize)),
    ).toBeGreaterThanOrEqual(12);
    await page.goto('/contact');
    const form = await page.locator('.enquiry-form').boundingBox();
    const story = await page.locator('.contact-story').boundingBox();
    expect(form!.y).toBeLessThan(530);
    expect(form!.y).toBeLessThan(story!.y);
    await expect(page.locator('.contact-quick-actions a')).toHaveCount(2);
  }
});

test('dark home actions have readable contrast and the gallery control keeps its white foreground', async ({
  page,
}) => {
  await page.goto('/');
  await page.locator('.theme-toggle').click();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  const colors = await page
    .locator('.future-round-arrow,.home-search .button-dark')
    .evaluateAll((nodes) =>
      nodes.map((el) => ({
        color: getComputedStyle(el).color,
        bg: getComputedStyle(el).backgroundColor,
      })),
    );
  for (const color of colors) expect(contrast(color.color, color.bg)).toBeGreaterThanOrEqual(4.5);
  await page.goto('/developers/emaar/projects/emaar-project-15');
  expect(
    await page.locator('.pd-gallery-expand').evaluate((el) => getComputedStyle(el).color),
  ).toBe('rgb(255, 255, 255)');
});

test('mobile filter drawer filters, closes with Escape, restores focus and releases smooth scrolling', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/projects');
  const trigger = page.getByRole('button', { name: /^Filters/ });
  await trigger.click();
  const dialog = page.getByRole('dialog');
  await expect(dialog).toBeVisible();
  const before = await page.evaluate(() => scrollY);
  await page.mouse.wheel(0, 400);
  await page.waitForTimeout(150);
  expect(await page.evaluate(() => scrollY)).toBeCloseTo(before, 0);
  await selectValue(dialog.getByRole('combobox', { name: 'Location', exact: true }), 'Ajman');
  await expect(dialog.getByRole('button', { name: 'Show 0 projects', exact: true })).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(dialog).not.toBeVisible();
  await expect(trigger).toBeFocused();
  await expect(page).toHaveURL(/emirate=Ajman/);
  await expect(page.locator('.catalogue-empty')).toBeVisible();
  await page.getByRole('button', { name: 'Filters (1)', exact: true }).click();
  await page.getByRole('button', { name: 'Reset filters', exact: true }).click();
  await page.getByRole('button', { name: 'Show 6 projects', exact: true }).click();
  await expect(page.locator('.project-card')).toHaveCount(6);
  await expect.poll(() => page.evaluate(() => document.documentElement.style.overflow)).toBe('');
  await page.mouse.move(200, 600);
  await page.mouse.wheel(0, 350);
  await expect.poll(() => page.evaluate(() => scrollY)).toBeGreaterThan(before + 50);
});

test('sticky project navigation tracks its active section without hiding the section heading', async ({
  page,
}) => {
  for (const width of [1440, 390])
    for (const path of ['/projects/creek-waters', '/developers/emaar/projects/emaar-project-15']) {
      await page.setViewportSize({ width, height: 1000 });
      await page.goto(path);
      const nav = page.getByRole('navigation', { name: 'Project sections' });
      await nav.getByRole('link', { name: 'Payment plan', exact: true }).click();
      await expect(page).toHaveURL(/#payment-plan$/);
      await expect(nav.getByRole('link', { name: 'Payment plan', exact: true })).toHaveAttribute(
        'aria-current',
        'location',
      );
      const header = (await page.locator('.site-header').boundingBox())!.height;
      await expect
        .poll(async () => Math.abs((await nav.boundingBox())!.y - header))
        .toBeLessThan(2);
      const section = await page.locator('#payment-plan').boundingBox(),
        box = await nav.boundingBox();
      expect(section!.y).toBeGreaterThanOrEqual(box!.y + box!.height - 1);
    }
});

test('editorial hierarchy, contents navigation, company avatar and developer marks remain distinct', async ({
  page,
}) => {
  await page.goto('/journal');
  await expect(page.locator('.journal-featured')).toHaveCount(1);
  await page
    .getByRole('link')
    .filter({
      has: page.getByRole('heading', { name: 'A home that feels like you.', exact: true }),
    })
    .click();
  const toc = page.getByRole('navigation', { name: 'Article contents' });
  await expect(toc.getByRole('link')).toHaveCount(4);
  await toc
    .getByRole('link', { name: 'Think in light, texture and proportion', exact: true })
    .click();
  await expect(page).toHaveURL(/#story-section-3$/);
  await expect(page.locator('.article-related .catalogue-journal-card')).toHaveCount(2);
  await expect(page.locator('.catalogue-article-cta')).toHaveCount(0);
  await page.goto('/about');
  await expect(page.locator('.company-avatar img')).toHaveAttribute('src', /aliyas-gold-logo/);
  await expect(page.locator('main img')).toHaveCount(1);
  await expect(page.locator('.info-invitation')).toHaveCount(0);
  await page.goto('/developers');
  await expect(page.locator('.developer-mark img')).toHaveCount(6);
  await expect(page.locator('.catalogue-developer-card')).toHaveCount(6);
});

test('Ajman is available in locations and navigation and mobile comparison uses compact fixed labels', async ({
  page,
}) => {
  await page.goto('/');
  await page.getByRole('tab', { name: '04 Ajman', exact: true }).click();
  await expect(page.getByRole('link', { name: 'Explore Ajman', exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Off-plan projects', exact: true }).click();
  await expect(page.locator('.signature-city-card')).toHaveCount(4);
  await page.keyboard.press('Escape');
  await page.setViewportSize({ width: 390, height: 844 });
  await page.getByRole('button', { name: 'Open menu', exact: true }).click();
  await expect(page.getByRole('button', { name: /Close (menu|navigation)/i })).toHaveCount(1);
  await page.keyboard.press('Escape');
  await page.goto('/projects/compare');
  await selectValue(page.locator('#comparison-project-0'), 'creek-waters');
  await selectValue(page.locator('#comparison-project-1'), 'the-acres');
  await expect(page.locator('.comparison-table')).toBeVisible();
  expect((await page.locator('.comparison-row-label').boundingBox())!.width).toBeLessThanOrEqual(
    105,
  );
  expect(
    (await page.locator('.comparison-project-image').first().boundingBox())!.height,
  ).toBeLessThanOrEqual(100);
  await page.locator('.comparison-table-scroll').evaluate((el) => {
    el.scrollLeft = 200;
  });
  const cell = await page.locator('.comparison-table tbody th').first().boundingBox(),
    viewport = await page.locator('.comparison-table-scroll').boundingBox();
  expect(Math.abs(cell!.x - viewport!.x)).toBeLessThan(3);
});

test('new layouts and filter dialog remain accessible in both themes with no narrow-screen overflow', async ({
  page,
}) => {
  test.setTimeout(120_000);
  for (const theme of ['light', 'dark']) {
    await page.goto('/');
    if ((await page.locator('html').getAttribute('data-theme')) !== theme)
      await page.locator('.theme-toggle').click();
    for (const width of [1440, 390])
      for (const path of [
        '/',
        '/projects',
        '/about',
        '/journal',
        '/journal/a-home-that-feels-like-you',
        '/developers',
        '/developers/emaar/projects/emaar-project-15',
        '/contact',
      ]) {
        await page.setViewportSize({ width, height: 1000 });
        await page.goto(path);
        await page.evaluate(() => document.fonts.ready);
        expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(
          width,
        );
        const result = await new AxeBuilder({ page })
          .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
          .analyze();
        expect(
          result.violations.map((v) => ({ rule: v.id, targets: v.nodes.map((n) => n.target) })),
          `${theme} ${width} ${path}`,
        ).toEqual([]);
        if (path === '/projects' && width === 390) {
          await page.getByRole('button', { name: 'Filters', exact: true }).click();
          expect(
            (await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa']).analyze()).violations,
          ).toEqual([]);
          await page.keyboard.press('Escape');
        }
      }
  }
});
