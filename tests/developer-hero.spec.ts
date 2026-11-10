import { expect, test, type Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { developers } from '../src/lib/content';
import { getDeveloperProjects } from '../src/lib/developer-projects';
import { DEVELOPER_HERO_LIMIT } from '../src/lib/developer-project-pagination';

const note = (page: Page) => page.locator('.developer-hero-note>span').first();
const desktopVisible = 7;
const mobileVisible = 3;
const rangeLabel = (start: number, visible: number, count: number) =>
  `${String(start + 1).padStart(2, '0')}—${String(start + visible).padStart(2, '0')} / ${count}`;
const visiblePhotoSizes = (page: Page) =>
  page.locator('.developer-hero-card[aria-hidden="false"]').evaluateAll((nodes) =>
    nodes.map((node) => {
      const box = node.querySelector('.developer-hero-photo')!.getBoundingClientRect();
      return {
        projectId: node.getAttribute('data-project-id'),
        position: Number((node as HTMLElement).style.getPropertyValue('--position')),
        width: box.width,
        height: box.height,
      };
    }),
  );
const expectCompactMobileFlow = async (page: Page) => {
  await expect(page.locator('.developer-hero')).not.toHaveClass(/is-scroll-pinned/);
  await expect(page.locator('.pin-spacer')).toHaveCount(0);
  await expect(page.locator('.developer-hero-card[aria-hidden="false"]')).toHaveCount(
    mobileVisible,
  );
  const gap = await page
    .locator('.developer-bio')
    .evaluate(
      (element) =>
        element.getBoundingClientRect().top -
        document.querySelector('.developer-hero')!.getBoundingClientRect().bottom,
    );
  expect(gap).toBeGreaterThanOrEqual(0);
  expect(gap).toBeLessThanOrEqual(80);
};

test('reference composition has seven curved landscape cards with a larger center and attached angled captions', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto('/developers/emaar');
  await expect(page.getByRole('button', { name: 'Next projects', exact: true })).toBeEnabled();
  await expect(page.locator('.developer-hero-card[aria-hidden="false"]')).toHaveCount(
    desktopVisible,
  );
  await page
    .locator('.developer-hero-card[aria-hidden="false"] img')
    .evaluateAll((images) =>
      Promise.all(images.map((image) => (image as HTMLImageElement).decode())),
    );
  const shapes = await page
    .locator('.developer-hero-card[aria-hidden="false"]')
    .evaluateAll((nodes) =>
      nodes.map((node) => {
        const photo = node.querySelector('.developer-hero-photo')!;
        const box = photo.getBoundingClientRect();
        const caption = node.querySelector('.developer-hero-card-caption')!;
        const captionBox = caption.getBoundingClientRect();
        const captionMatrix = new DOMMatrix(getComputedStyle(caption).transform);
        const corners = [
          ...getComputedStyle(photo).clipPath.matchAll(/Q\s*([\d.e+-]+)[,\s]+([\d.e+-]+)/gi),
        ].map((match) => ({ x: Number(match[1]), y: Number(match[2]) }));
        const lowerRight = corners[2];
        const lowerLeft = corners[3];
        const edgeSlope = (lowerRight.y - lowerLeft.y) / (lowerRight.x - lowerLeft.x);
        const captionSlope = captionMatrix.b / captionMatrix.a;
        const captionMidpoint = captionBox.top + (Math.abs(captionSlope) * captionBox.width) / 2;
        const image = photo.querySelector('img')!;
        const imageStyle = getComputedStyle(image);
        const imageWidth = parseFloat(imageStyle.width);
        const imageHeight = parseFloat(imageStyle.height);
        const projection = new DOMMatrix(imageStyle.transform);
        const projectedCorners = [
          [0, 0],
          [imageWidth, 0],
          [imageWidth, imageHeight],
          [0, imageHeight],
        ].map(([x, y]) => {
          const projected = projection.transformPoint(new DOMPoint(x, y));
          return { x: projected.x / projected.w, y: projected.y / projected.w };
        });
        // Cover may crop the source photo, but its projected element must fill every frame corner.
        const frameCornerError = Math.max(
          ...projectedCorners.map((point, index) =>
            Math.hypot(point.x - corners[index].x, point.y - corners[index].y),
          ),
        );
        return {
          x: box.x,
          right: box.right,
          width: box.width,
          height: box.height,
          centerY: box.top + box.height / 2,
          clip: getComputedStyle(photo).clipPath,
          captionSlope,
          edgeSlope,
          captionMidpoint,
          gap: captionMidpoint - box.top - (lowerLeft.y + lowerRight.y) / 2,
          fit: imageStyle.objectFit,
          frameCornerError,
        };
      }),
    );
  const center = Math.floor(desktopVisible / 2);
  for (let index = 0; index < center; index++) {
    expect(shapes[index + 1].width / shapes[index].width).toBeGreaterThan(1.1);
    expect(shapes[index + 1].height / shapes[index].height).toBeGreaterThan(1.1);
    expect(shapes[index + 1].centerY - shapes[index].centerY).toBeGreaterThan(5);
  }
  for (let index = 0; index < desktopVisible; index++) {
    expect(shapes[index].width).toBeCloseTo(shapes[desktopVisible - 1 - index].width, 0);
    expect(shapes[index].height).toBeCloseTo(shapes[desktopVisible - 1 - index].height, 0);
    expect(shapes[index].centerY).toBeCloseTo(shapes[desktopVisible - 1 - index].centerY, 0);
    expect(shapes[index].width / shapes[index].height).toBeGreaterThan(1.2);
    expect(shapes[index].height).toBeLessThan(260);
    expect(shapes[index].clip).toMatch(/^path\(/);
    expect(shapes[index].fit).toBe('cover');
    expect(shapes[index].frameCornerError).toBeLessThan(1);
    expect(shapes[index].captionSlope).toBeCloseTo(shapes[index].edgeSlope, 3);
    expect(shapes[index].gap).toBeGreaterThanOrEqual(7);
    expect(shapes[index].gap).toBeLessThanOrEqual(25);
    if (index > 0) {
      expect(shapes[index].x - shapes[index - 1].right).toBeGreaterThan(5);
      expect(shapes[index].x - shapes[index - 1].right).toBeLessThan(48);
    }
  }
  const headerHeight = (await page.locator('.site-header').boundingBox())!.height;
  expect((await page.locator('.developer-hero').boundingBox())!.height).toBeLessThan(
    1000 - headerHeight - 24,
  );
  const initialCenter = (await visiblePhotoSizes(page))[center].projectId;
  await page.getByRole('button', { name: 'Next projects', exact: true }).click();
  await expect(note(page)).toHaveText(rangeLabel(1, desktopVisible, DEVELOPER_HERO_LIMIT));
  const nextPhotos = await visiblePhotoSizes(page);
  const nextCenter = nextPhotos[center];
  expect(nextCenter.projectId).not.toBe(initialCenter);
  expect(nextCenter.width).toBeCloseTo(shapes[center].width, 0);
  expect(nextCenter.height).toBeCloseTo(shapes[center].height, 0);
  const previousCenter = nextPhotos.find((photo) => photo.projectId === initialCenter)!;
  expect(previousCenter.width).toBeLessThan(nextCenter.width * 0.9);
  expect(previousCenter.height).toBeLessThan(nextCenter.height * 0.9);
});

test('each developer shows up to fifteen owned projects with up to seven initially visible', async ({
  page,
}) => {
  test.setTimeout(180_000);
  await page.setViewportSize({ width: 1440, height: 1000 });
  for (const developer of developers) {
    const count = Math.min(DEVELOPER_HERO_LIMIT, getDeveloperProjects(developer.slug).length);
    await page.goto(`/developers/${developer.slug}`);
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(
      `Discover projectsby ${developer.name}.`,
    );
    await expect(page.locator('.developer-hero-card')).toHaveCount(count);
    const records = getDeveloperProjects(developer.slug).slice(0, DEVELOPER_HERO_LIMIT);
    const projectSlides = page.locator('.developer-hero-card[data-slide-kind="project"]');
    await expect(projectSlides.locator('.developer-hero-card-caption')).toHaveCount(records.length);
    await expect(projectSlides.locator('.developer-hero-card-badge')).toHaveCount(
      records.filter((project) => project.nameSource).length,
    );
    await expect(page.locator('.developer-hero-card[data-slide-kind="inspiration"]')).toHaveCount(
      0,
    );
    expect(
      await projectSlides
        .locator('.developer-hero-card-badge')
        .evaluateAll((badges) =>
          badges.every((badge) => badge.getAttribute('aria-hidden') === 'true'),
        ),
    ).toBe(true);
    await expect(page.locator('.developer-hero-card[aria-hidden="false"]')).toHaveCount(
      Math.min(desktopVisible, count),
    );
    expect(
      await page
        .locator('.developer-hero-card img')
        .evaluateAll((images) =>
          images.every((image) => getComputedStyle(image).objectFit === 'cover'),
        ),
    ).toBe(true);
    expect(
      await page
        .locator('.developer-hero-card')
        .evaluateAll((nodes) => [...new Set(nodes.map((n) => n.getAttribute('data-developer')))]),
    ).toEqual([developer.slug]);
    await expect(note(page)).toHaveText(
      `01—${String(Math.min(desktopVisible, count)).padStart(2, '0')} / ${count}`,
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
  const crossingCaption = page
    .locator('.developer-hero-card')
    .nth(Math.ceil(desktopVisible / 2))
    .locator('.developer-hero-card-caption');
  const captionSlope = () =>
    crossingCaption.evaluate((el) => new DOMMatrix(getComputedStyle(el).transform).b);
  expect(await captionSlope()).toBeGreaterThan(0);
  await page.waitForTimeout(700);
  expect(await position()).toBeCloseTo(initial, 2);
  await page.mouse.move(700, 450);
  await page.mouse.wheel(0, 600);
  await expect.poll(position).toBeLessThan(initial - 0.5);
  await expect.poll(captionSlope).toBeLessThan(0);
  const movingPhotos = (await visiblePhotoSizes(page)).sort(
    (left, right) => Math.abs(left.position) - Math.abs(right.position),
  );
  expect(movingPhotos[0].projectId).not.toBe(
    getDeveloperProjects('emaar')[Math.floor(desktopVisible / 2)].id,
  );
  for (const sidePhoto of movingPhotos.slice(1)) {
    expect(movingPhotos[0].width).toBeGreaterThanOrEqual(sidePhoto.width);
    expect(movingPhotos[0].height).toBeGreaterThanOrEqual(sidePhoto.height);
  }
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
  await expect(note(page)).toHaveText(
    rangeLabel(records.length - desktopVisible, desktopVisible, records.length),
  );
  await expect.poll(position).toBeCloseTo(initial - (records.length - desktopVisible), 1);
  const visible = await page
    .locator('.developer-hero-card[aria-hidden="false"]')
    .evaluateAll((nodes) => nodes.map((n) => n.getAttribute('data-project-id')));
  expect(visible.length).toBe(desktopVisible);
  expect(visible[0]).toBe(records.at(-desktopVisible)!.id);
  expect(visible.at(-1)).toBe(records.at(-1)!.id);
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
  await expect(note(page)).toHaveText(
    rangeLabel(records.length - desktopVisible, desktopVisible, records.length),
  );
  await expect
    .poll(async () => (await page.locator('#developer-projects').boundingBox())!.y)
    .toBeGreaterThan(75);
  await expect
    .poll(async () => (await page.locator('#developer-projects').boundingBox())!.y)
    .toBeLessThan(150);
});

test('incoming and outgoing cards remain unrotated while scrolling the curved desktop gallery', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  for (const width of [820, 1440]) {
    await page.setViewportSize({ width, height: 1000 });
    await page.goto('/developers/emaar');
    const hero = page.locator('.developer-hero');
    await expect(hero).toHaveClass(/is-scroll-pinned/);
    await page.evaluate(() => document.fonts.ready);
    const half = (desktopVisible - 1) / 2;
    const cards = page.locator('.developer-hero-card');
    await expect(cards.first()).toBeVisible();
    await expect(page.locator('.developer-hero-card[aria-hidden="false"]')).toHaveCount(
      desktopVisible,
    );
    const range = await hero.evaluate((element) => ({
      start:
        element.parentElement!.getBoundingClientRect().top +
        scrollY -
        document.querySelector('.site-header')!.getBoundingClientRect().height -
        12,
      distance:
        element.parentElement!.getBoundingClientRect().height -
        element.getBoundingClientRect().height,
    }));
    // Sample partial entry, a settled slot, and the same path in reverse.
    for (const phase of [0.25, 0.5, 0.75, 1.05, 0.5]) {
      await page.evaluate(
        (top) => window.scrollTo({ top, behavior: 'instant' }),
        range.start + (range.distance * phase) / (DEVELOPER_HERO_LIMIT - desktopVisible),
      );
      await expect
        .poll(() =>
          cards
            .first()
            .evaluate(
              (element, target) =>
                Math.abs(
                  Number((element as HTMLElement).style.getPropertyValue('--position')) - target,
                ),
              -half - phase,
            ),
        )
        .toBeLessThan(0.006);
      expect(
        await cards.evaluateAll((elements) =>
          elements.every((element) => {
            const matrix = new DOMMatrix(getComputedStyle(element).transform);
            return (
              matrix.is2D && matrix.a === 1 && matrix.b === 0 && matrix.c === 0 && matrix.d === 1
            );
          }),
        ),
      ).toBe(true);
    }
  }
});

test('manual controls clamp at the last set and mobile swipe stays within the same developer', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto('/developers/aldar');
  await expect(page.getByRole('button', { name: 'Previous projects', exact: true })).toBeDisabled();
  const count = Math.min(DEVELOPER_HERO_LIMIT, getDeveloperProjects('aldar').length);
  for (let n = 0; n < count - desktopVisible; n++)
    await page.getByRole('button', { name: 'Next projects', exact: true }).click();
  await expect(note(page)).toHaveText(rangeLabel(count - desktopVisible, desktopVisible, count));
  await expect(page.getByRole('button', { name: 'Next projects', exact: true })).toBeDisabled();
  await page.setViewportSize({ width: 390, height: 844 });
  await expect(note(page)).toHaveText(rangeLabel(0, mobileVisible, count));
  const mobilePhotos = await visiblePhotoSizes(page);
  expect(mobilePhotos).toHaveLength(mobileVisible);
  expect(mobilePhotos[1].width).toBeGreaterThan(mobilePhotos[0].width * 1.1);
  expect(mobilePhotos[1].height).toBeGreaterThan(mobilePhotos[0].height * 1.1);
  expect(mobilePhotos[0].width).toBeCloseTo(mobilePhotos[2].width, 0);
  expect(mobilePhotos[0].height).toBeCloseTo(mobilePhotos[2].height, 0);
  const gallery = page.locator('.developer-hero-gallery');
  await gallery.focus();
  await page.keyboard.press('ArrowRight');
  await expect(note(page)).toHaveText(rangeLabel(1, mobileVisible, count));
  await gallery.dispatchEvent('pointerdown', { pointerType: 'touch', clientX: 260, clientY: 450 });
  await gallery.dispatchEvent('pointerup', { pointerType: 'touch', clientX: 100, clientY: 455 });
  await expect(note(page)).toHaveText(rangeLabel(2, mobileVisible, count));
  await expect(page).toHaveURL(/\/developers\/aldar$/);
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(390);
});

test('pinning clears on phone and landscape resize and returns only for wide screens with motion', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto('/developers/emaar');
  await expect(page.locator('.developer-hero')).toHaveClass(/is-scroll-pinned/);
  await page.setViewportSize({ width: 390, height: 844 });
  await expectCompactMobileFlow(page);
  await page.setViewportSize({ width: 844, height: 390 });
  await expectCompactMobileFlow(page);
  await page.setViewportSize({ width: 1440, height: 1000 });
  await expect(page.locator('.developer-hero')).toHaveClass(/is-scroll-pinned/);
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await expect(page.locator('.pin-spacer')).toHaveCount(0);
  await expect(page.locator('.developer-hero')).not.toHaveClass(/is-scroll-pinned/);
  await page.locator('.developer-hero-back').click();
  await expect(page).toHaveURL(/\/developers$/);
  await expect(page.locator('.pin-spacer')).toHaveCount(0);
});

test('wheel scrolling pins wide galleries and scrolls the mobile page without an empty spacer', async ({
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
    await page.evaluate(() => document.fonts.ready);
    const first = page.locator('.developer-hero-card').first();
    const phase = () =>
      first.evaluate((el) => Number((el as HTMLElement).style.getPropertyValue('--position')));
    const initial = await phase();
    const initialY = (await hero.boundingBox())!.y;
    if (width < 768) await expectCompactMobileFlow(page);
    else await expect(hero).toHaveClass(/is-scroll-pinned/);
    await page.mouse.move(width / 2, height / 2);
    await page.mouse.wheel(0, 300);
    if (width < 768) {
      await expect.poll(async () => (await hero.boundingBox())!.y).toBeLessThan(initialY - 100);
      expect(await phase()).toBeCloseTo(initial, 2);
    } else {
      const headerHeight = (await page.locator('.site-header').boundingBox())!.height;
      await expect
        .poll(async () => (await hero.boundingBox())!.height)
        .toBeLessThanOrEqual(height - headerHeight - 23);
      await expect.poll(phase).toBeLessThan(initial - 0.5);
      await expect
        .poll(async () => Math.abs((await hero.boundingBox())!.y - headerHeight - 12))
        .toBeLessThan(2);
    }
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(
      width,
    );
  }
});

test.describe('native touch scrolling', () => {
  test.use({ hasTouch: true, isMobile: true });
  test('native gestures scroll the phone page freely and keep wide galleries pinned until their end', async ({
    page,
  }) => {
    test.setTimeout(60_000);
    await page.emulateMedia({ reducedMotion: 'no-preference' });
    const session = await page.context().newCDPSession(page);
    const swipe = async (width: number, height: number, down = false, horizontalY?: number) => {
      const horizontal = horizontalY !== undefined;
      const dimension = horizontal ? width : height;
      const from = dimension * (down ? 0.35 : 0.77);
      const to = dimension * (down ? 0.77 : 0.35);
      const point = (value: number) =>
        horizontal ? { x: value, y: horizontalY! } : { x: width / 2, y: value };
      await session.send('Input.dispatchTouchEvent', {
        type: 'touchStart',
        touchPoints: [point(from)],
      });
      for (let step = 1; step <= 10; step++) {
        await session.send('Input.dispatchTouchEvent', {
          type: 'touchMove',
          touchPoints: [point(from + ((to - from) * step) / 10)],
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
      const first = page.locator('.developer-hero-card').first();
      const phase = () =>
        first.evaluate((el) => Number((el as HTMLElement).style.getPropertyValue('--position')));
      const initial = await phase();
      const count = Math.min(DEVELOPER_HERO_LIMIT, getDeveloperProjects('sobha').length);
      if (width < 768 || (width <= 1000 && height <= 500)) {
        await expectCompactMobileFlow(page);
        const initialScroll = await page.evaluate(() => scrollY);
        await swipe(width, height);
        await expect.poll(() => page.evaluate(() => scrollY)).toBeGreaterThan(initialScroll + 80);
        expect(await phase()).toBeCloseTo(initial, 2);
        await expect(note(page)).toHaveText(rangeLabel(0, mobileVisible, count));
        const forwardScroll = await page.evaluate(() => scrollY);
        await swipe(width, height, true);
        await expect.poll(() => page.evaluate(() => scrollY)).toBeLessThan(forwardScroll - 50);
        const gallery = page.locator('.developer-hero-gallery');
        await gallery.scrollIntoViewIfNeeded();
        const box = (await gallery.boundingBox())!;
        const headerHeight = (await page.locator('.site-header').boundingBox())!.height;
        const y =
          (Math.max(box.y, headerHeight + 10) + Math.min(box.y + box.height, height - 10)) / 2;
        await swipe(width, height, false, y);
        await expect(note(page)).toHaveText(rangeLabel(1, mobileVisible, count));
        await expect(page.locator('.pin-spacer')).toHaveCount(0);
        await expect(page).toHaveURL(/\/developers\/sobha$/);
        continue;
      }
      await expect(hero).toHaveClass(/is-scroll-pinned/);
      await swipe(width, height);
      await expect.poll(phase).toBeLessThan(initial - 0.4);
      const forward = await phase();
      await swipe(width, height, true);
      await expect.poll(phase).toBeGreaterThan(forward + 0.2);
      const shown = desktopVisible;
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
