import { expect, test, type Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { developers } from '../src/lib/content';
import { getDeveloperProjects } from '../src/lib/developer-projects';
import { DEVELOPER_HERO_LIMIT } from '../src/lib/developer-project-pagination';

const note = (page: Page) => page.locator('.developer-hero-note>span').first();
const rangeLabel = (start: number, visible: number, count: number) =>
  `${String(start + 1).padStart(2, '0')}—${String(start + visible).padStart(2, '0')} / ${count}`;
test('reference composition has seven tightly spaced cards with small central and tall outer silhouettes', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto('/developers/emaar');
  await expect(page.getByRole('button', { name: 'Next projects', exact: true })).toBeEnabled();
  const shapes = await page.locator('.developer-hero-card').evaluateAll((nodes) =>
    nodes.slice(0, 7).map((node) => {
      const photo = node.querySelector('.developer-hero-photo')!;
      const box = photo.getBoundingClientRect();
      return {
        x: box.x,
        right: box.right,
        width: box.width,
        height: box.height,
        clip: getComputedStyle(photo).clipPath,
      };
    }),
  );
  expect(shapes[0].width / shapes[3].width).toBeCloseTo(2, 1);
  expect(shapes[0].height / shapes[3].height).toBeCloseTo(2.32, 1);
  for (let index = 0; index < 7; index++) {
    expect(shapes[index].width).toBeCloseTo(shapes[6 - index].width, 0);
    expect(shapes[index].clip).toMatch(/^path\(/);
    if (index > 0) {
      expect(shapes[index].x - shapes[index - 1].right).toBeGreaterThan(5);
      expect(shapes[index].x - shapes[index - 1].right).toBeLessThan(28);
    }
  }
});

test('each developer has fifteen showcase slides with seven initially shown', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  for (const developer of developers) {
    const count = DEVELOPER_HERO_LIMIT;
    await page.goto(`/developers/${developer.slug}`);
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(
      `Discover projectsby ${developer.name}.`,
    );
    await expect(page.locator('.developer-hero-card')).toHaveCount(count);
    await expect(page.locator('.developer-hero-card[aria-hidden="false"]')).toHaveCount(
      Math.min(7, count),
    );
    expect(
      await page
        .locator('.developer-hero-card')
        .evaluateAll((nodes) => [...new Set(nodes.map((n) => n.getAttribute('data-developer')))]),
    ).toEqual([developer.slug]);
    await expect(note(page)).toHaveText(
      `01—${String(Math.min(7, count)).padStart(2, '0')} / ${count}`,
    );
    await expect(page.locator('.developer-hero-website')).toHaveAttribute(
      'href',
      developer.website,
    );
  }
});

test('mouse scrolling releases after fifteen showcased projects even in the largest collection', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto('/developers/emaar');
  const hero = page.locator('.developer-hero');
  await expect(hero).toHaveClass(/is-scroll-pinned/);
  const card = page.locator('.developer-hero-card').first();
  const position = () =>
    card.evaluate((el) => Number((el as HTMLElement).style.getPropertyValue('--position')));
  const initial = await position();
  await page.waitForTimeout(700);
  expect(await position()).toBeCloseTo(initial, 2);
  await page.mouse.move(700, 450);
  await page.mouse.wheel(0, 600);
  await expect.poll(position).toBeLessThan(initial - 0.5);
  const header = (await page.locator('.site-header').boundingBox())!.height;
  await expect
    .poll(async () => Math.abs((await hero.boundingBox())!.y - header - 12))
    .toBeLessThan(2);
  await expect(page.locator('html')).not.toHaveClass(/lenis-scrolling/);
  const range = await hero.evaluate((el) => ({
    start:
      el.parentElement!.getBoundingClientRect().top +
      scrollY -
      document.querySelector('.site-header')!.getBoundingClientRect().height -
      12,
    distance: el.parentElement!.getBoundingClientRect().height - el.getBoundingClientRect().height,
  }));
  await page.evaluate(
    (top) => window.scrollTo({ top, behavior: 'instant' }),
    range.start + range.distance,
  );
  const records = getDeveloperProjects('emaar').slice(0, DEVELOPER_HERO_LIMIT);
  expect(range.distance).toBeLessThan(5000);
  await expect(note(page)).toHaveText(rangeLabel(records.length - 7, 7, records.length));
  await expect.poll(position).toBeCloseTo(4 - records.length, 1);
  const visible = await page
    .locator('.developer-hero-card[aria-hidden="false"]')
    .evaluateAll((nodes) => nodes.map((n) => n.getAttribute('data-project-id')));
  expect(visible.length).toBe(7);
  expect(visible[0]).toBe(records.at(-7)!.id);
  expect(visible[6]).toBe(records.at(-1)!.id);
  await page.mouse.wheel(0, 600);
  await expect.poll(async () => (await hero.boundingBox())!.y).toBeLessThan(0);
  await expect(page).toHaveURL(/\/developers\/emaar$/);
  await page
    .getByRole('navigation', { name: 'Project pagination' })
    .getByRole('link', { name: 'Next', exact: true })
    .click();
  await expect(page.locator('.developer-listings-grid .project-card').first()).toHaveAttribute(
    'data-project-id',
    getDeveloperProjects('emaar')[15].id,
  );
  await expect(note(page)).toHaveText(rangeLabel(records.length - 7, 7, records.length));
  await expect
    .poll(async () => (await page.locator('#developer-projects').boundingBox())!.y)
    .toBeGreaterThan(75);
  await expect
    .poll(async () => (await page.locator('#developer-projects').boundingBox())!.y)
    .toBeLessThan(150);
});

test('manual controls clamp at the last set and mobile swipe stays within the same developer', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto('/developers/aldar');
  await expect(page.getByRole('button', { name: 'Previous projects', exact: true })).toBeDisabled();
  const count = Math.min(DEVELOPER_HERO_LIMIT, getDeveloperProjects('aldar').length);
  for (let n = 0; n < count - 7; n++)
    await page.getByRole('button', { name: 'Next projects', exact: true }).click();
  await expect(note(page)).toHaveText(rangeLabel(count - 7, 7, count));
  await expect(page.getByRole('button', { name: 'Next projects', exact: true })).toBeDisabled();
  await page.setViewportSize({ width: 390, height: 844 });
  await expect(note(page)).toHaveText(rangeLabel(0, 3, count));
  const gallery = page.locator('.developer-hero-gallery');
  await gallery.focus();
  await page.keyboard.press('ArrowRight');
  await expect(note(page)).toHaveText(rangeLabel(1, 3, count));
  await gallery.dispatchEvent('pointerdown', { pointerType: 'touch', clientX: 260, clientY: 450 });
  await gallery.dispatchEvent('pointerup', { pointerType: 'touch', clientX: 100, clientY: 455 });
  await expect(note(page)).toHaveText(rangeLabel(2, 3, count));
  await expect(page).toHaveURL(/\/developers\/aldar$/);
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(390);
});

test('pinning remains active through mobile and landscape resize and cleans up for reduced motion and navigation', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto('/developers/emaar');
  await expect(page.locator('.developer-hero')).toHaveClass(/is-scroll-pinned/);
  await page.setViewportSize({ width: 390, height: 844 });
  await expect(page.locator('.developer-hero-card[aria-hidden="false"]')).toHaveCount(3);
  await expect(page.locator('.developer-hero')).toHaveClass(/is-scroll-pinned/);
  await expect(page.locator('.pin-spacer')).toHaveCount(1);
  await page.setViewportSize({ width: 844, height: 390 });
  await expect(page.locator('.developer-hero-card[aria-hidden="false"]')).toHaveCount(7);
  await expect
    .poll(async () => (await page.locator('.developer-hero').boundingBox())!.height)
    .toBeLessThanOrEqual(307);
  await page.setViewportSize({ width: 1440, height: 1000 });
  await expect(page.locator('.developer-hero')).toHaveClass(/is-scroll-pinned/);
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await expect(page.locator('.pin-spacer')).toHaveCount(0);
  await expect(page.locator('.developer-hero')).not.toHaveClass(/is-scroll-pinned/);
  await page.locator('.developer-hero-back').click();
  await expect(page).toHaveURL(/\/developers$/);
  await expect(page.locator('.pin-spacer')).toHaveCount(0);
});

test('wheel scrolling moves and pins the gallery on short laptops, tablets and small phones', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  for (const [width, height] of [
    [1366, 640],
    [1024, 600],
    [820, 1180],
    [390, 640],
    [320, 480],
  ]) {
    await page.setViewportSize({ width, height });
    await page.goto('/developers/emaar');
    const hero = page.locator('.developer-hero');
    await expect(hero).toHaveClass(/is-scroll-pinned/);
    await page.evaluate(() => document.fonts.ready);
    const headerHeight = (await page.locator('.site-header').boundingBox())!.height;
    await expect
      .poll(async () => (await hero.boundingBox())!.height)
      .toBeLessThanOrEqual(height - headerHeight - 23);
    const first = page.locator('.developer-hero-card').first();
    const phase = () =>
      first.evaluate((el) => Number((el as HTMLElement).style.getPropertyValue('--position')));
    const initial = await phase();
    await page.mouse.move(width / 2, height / 2);
    await page.mouse.wheel(0, 300);
    await expect.poll(phase).toBeLessThan(initial - 0.5);
    await expect
      .poll(async () => Math.abs((await hero.boundingBox())!.y - headerHeight - 12))
      .toBeLessThan(2);
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(
      width,
    );
  }
});

test.describe('native touch scrolling', () => {
  test.use({ hasTouch: true, isMobile: true });
  test('vertical finger gestures move the gallery and release into the page on phone, tablet and landscape', async ({
    page,
  }) => {
    test.setTimeout(60_000);
    await page.emulateMedia({ reducedMotion: 'no-preference' });
    const session = await page.context().newCDPSession(page);
    const swipe = async (width: number, height: number, down = false) => {
      const from = height * (down ? 0.35 : 0.77);
      const to = height * (down ? 0.77 : 0.35);
      await session.send('Input.dispatchTouchEvent', {
        type: 'touchStart',
        touchPoints: [{ x: width / 2, y: from }],
      });
      for (let step = 1; step <= 10; step++) {
        await session.send('Input.dispatchTouchEvent', {
          type: 'touchMove',
          touchPoints: [{ x: width / 2, y: from + ((to - from) * step) / 10 }],
        });
        await page.waitForTimeout(25);
      }
      await session.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
    };
    for (const [width, height] of [
      [390, 844],
      [820, 1180],
      [844, 390],
    ]) {
      await page.setViewportSize({ width, height });
      await page.goto('/developers/sobha');
      await page.evaluate(() => document.fonts.ready);
      const hero = page.locator('.developer-hero');
      await expect(hero).toHaveClass(/is-scroll-pinned/);
      const first = page.locator('.developer-hero-card').first();
      const phase = () =>
        first.evaluate((el) => Number((el as HTMLElement).style.getPropertyValue('--position')));
      const initial = await phase();
      await swipe(width, height);
      await expect.poll(phase).toBeLessThan(initial - 0.4);
      const forward = await phase();
      await swipe(width, height, true);
      await expect.poll(phase).toBeGreaterThan(forward + 0.2);
      const count = Math.min(DEVELOPER_HERO_LIMIT, getDeveloperProjects('sobha').length);
      const shown = width < 768 ? 3 : 7;
      const lastSet = rangeLabel(count - shown, shown, count);
      // Test the final native gesture without replaying dozens of identical swipes.
      await hero.evaluate((el) => {
        const header = document.querySelector('.site-header')!.getBoundingClientRect().height;
        const spacer = el.parentElement!.getBoundingClientRect();
        const end =
          spacer.top + scrollY - header - 12 + spacer.height - el.getBoundingClientRect().height;
        window.scrollTo({ top: end - 250, behavior: 'instant' });
      });
      for (let attempt = 0; attempt < 10 && (await note(page).textContent()) !== lastSet; attempt++)
        await swipe(width, height);
      await expect(note(page)).toHaveText(lastSet);
      await swipe(width, height);
      await expect.poll(async () => (await hero.boundingBox())!.y).toBeLessThan(0);
      await expect(page).toHaveURL(/\/developers\/sobha$/);
    }
    await session.detach();
  });
});

test('the curved gallery is accessible in light and dark and has no mobile overflow', async ({
  page,
}) => {
  await page.goto('/developers/emaar');
  for (const theme of ['light', 'dark']) {
    if ((await page.locator('html').getAttribute('data-theme')) !== theme)
      await page.locator('.theme-toggle').click();
    for (const width of [1440, 768, 390, 320]) {
      await page.setViewportSize({ width, height: 1000 });
      await page.evaluate(() => document.fonts.ready);
      expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(
        width,
      );
      const result = await new AxeBuilder({ page })
        .include('.developer-hero')
        .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
        .analyze();
      expect(
        result.violations.map((v) => ({ rule: v.id, targets: v.nodes.map((n) => n.target) })),
      ).toEqual([]);
    }
  }
});
