import { expect, test, type Page } from '@playwright/test';

async function openHome(page: Page, width = 1440, height = 1000) {
  await page.setViewportSize({ width, height });
  await page.goto('/');
  await page.evaluate(() => document.fonts.ready);
  await expect(page.locator('[data-collection-card]')).toHaveCount(4);
}

async function collectionRange(page: Page) {
  return page.locator('[data-collection-section]').evaluate((section) => {
    const track = section.querySelector<HTMLElement>('[data-collection-track]')!;
    const viewport = track.parentElement!;
    const spacer = section.parentElement!;
    return {
      start:
        spacer.getBoundingClientRect().top +
        scrollY -
        document.querySelector('.site-header')!.getBoundingClientRect().height,
      headerHeight: document.querySelector('.site-header')!.getBoundingClientRect().height,
      distance: spacer.getBoundingClientRect().height - section.getBoundingClientRect().height,
      travel: track.scrollWidth - viewport.clientWidth,
    };
  });
}

test('desktop scrolling reveals the complete collection and exits the pinned section cleanly', async ({
  page,
}) => {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await openHome(page);
  await expect(page.locator('[data-collection-section]')).toHaveClass(/is-pinned/);
  const range = await collectionRange(page);
  expect(range.travel).toBeGreaterThan(500);
  expect(range.distance).toBeGreaterThanOrEqual(range.travel - 2);

  const positions: number[] = [];
  for (let index = 0; index < 4; index += 1) {
    await page.evaluate(
      (target) => scrollTo({ top: target, behavior: 'instant' }),
      range.start + (range.distance * index) / 3 + (index === 0 ? 2 : 0),
    );
    await expect(page.locator('[data-collection-current]')).toHaveText(
      String(index + 1).padStart(2, '0'),
    );
    await expect
      .poll(async () => {
        const x = await page
          .locator('[data-collection-track]')
          .evaluate((track) => new DOMMatrixReadOnly(getComputedStyle(track).transform).m41);
        return Math.abs(x + (range.travel * index) / 3);
      })
      .toBeLessThan(5);
    positions.push(
      await page
        .locator('[data-collection-track]')
        .evaluate((track) => track.getBoundingClientRect().left),
    );
    const box = await page.locator('[data-collection-section]').boundingBox();
    expect(box!.y).toBeGreaterThanOrEqual(range.headerHeight - 3);
    expect(box!.y).toBeLessThanOrEqual(range.headerHeight + 2);
    expect(box!.y + box!.height).toBeLessThanOrEqual(1001);
  }
  expect(positions[0] - positions[3]).toBeGreaterThan(500);
  const finalCard = await page.locator('[data-collection-card]').last().boundingBox();
  expect(finalCard!.x).toBeGreaterThanOrEqual(-1);
  expect(finalCard!.x + finalCard!.width).toBeLessThanOrEqual(1441);
  await page.evaluate(
    (target) => scrollTo({ top: target, behavior: 'instant' }),
    range.start + range.distance + 450,
  );
  await expect
    .poll(async () => (await page.locator('[data-collection-section]').boundingBox())!.y)
    .toBeLessThan(0);
  expect(errors).toEqual([]);
});

test('keyboard focus brings every project into view without removing cards from the tab order', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await openHome(page);
  await expect(page.locator('[data-collection-section]')).toHaveClass(/is-pinned/);
  const cards = page.locator('[data-collection-card]');
  expect(
    await cards.evaluateAll((elements) =>
      elements.some((element) => (element as HTMLElement).inert),
    ),
  ).toBe(false);
  const links = page.locator(
    '[data-collection-track] a, [data-collection-track] button:not(:disabled)',
  );
  for (let index = 0; index < (await links.count()); index += 1) {
    const link = links.nth(index);
    if (index === 0) await link.focus();
    else await page.keyboard.press('Tab');
    await expect(link).toBeFocused();
    await expect
      .poll(() =>
        link.evaluate((element) => {
          const box = element.getBoundingClientRect();
          return (
            box.left >= -1 &&
            box.right <= innerWidth + 1 &&
            box.top >= document.querySelector('.site-header')!.getBoundingClientRect().bottom - 1 &&
            box.bottom <= innerHeight + 1
          );
        }),
      )
      .toBe(true);
    expect(
      await page
        .locator('[data-collection-track]')
        .evaluate((track) => track.parentElement!.scrollLeft),
    ).toBe(0);
  }
});

test('narrow screens retain native horizontal browsing and smooth vertical wheel input', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  for (const width of [390, 700]) {
    await openHome(page, width, 900);
    await expect(page.locator('html')).toHaveClass(/lenis/);
    await expect(page.locator('[data-collection-section]')).not.toHaveClass(/is-pinned/);
    await expect(page.locator('.pin-spacer')).toHaveCount(0);
    await page.mouse.move(width / 2, 300);
    const samples: number[] = [];
    await page.mouse.wheel(0, 600);
    for (let sample = 0; sample < 9; sample += 1) {
      await page.waitForTimeout(100);
      samples.push(await page.evaluate(() => scrollY));
    }
    expect(samples[0]).toBeGreaterThan(0);
    expect(samples[0]).toBeLessThan(samples[8] - 80);
    expect(samples[8]).toBeGreaterThan(500);
    expect(samples[8]).toBeLessThanOrEqual(542);
    await expect(page.locator('html')).not.toHaveClass(/lenis-scrolling/);

    const track = page.locator('[data-collection-track]');
    await track.scrollIntoViewIfNeeded();
    const rail = await track.evaluate((element) => {
      const viewport = element.parentElement!;
      const rect = viewport.getBoundingClientRect();
      return {
        x: rect.left + Math.min(100, rect.width / 2),
        y: Math.max(110, rect.top + 100),
        overflow: getComputedStyle(viewport).overflowX,
      };
    });
    expect(['auto', 'scroll']).toContain(rail.overflow);
    await page.mouse.move(rail.x, rail.y);
    await page.mouse.wheel(460, 0);
    await expect
      .poll(() => track.evaluate((element) => element.parentElement!.scrollLeft))
      .toBeGreaterThan(100);
    await page.mouse.wheel(3000, 0);
    await expect(page.locator('[data-collection-current]')).toHaveText('04');
    // Native scroll snapping can finish after the counter enters its final range.
    await expect
      .poll(() =>
        track.evaluate((element) =>
          Math.abs(
            element.scrollWidth -
              element.parentElement!.clientWidth -
              element.parentElement!.scrollLeft,
          ),
        ),
      )
      .toBeLessThan(2);
    const last = await page.locator('[data-collection-card]').last().boundingBox();
    expect(last!.x).toBeGreaterThanOrEqual(-1);
    expect(last!.x + last!.width).toBeLessThanOrEqual(width + 1);
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(
      width + 1,
    );
  }
});

test('reduced motion and short viewports preserve the native rail; preference changes clean up pinning', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await openHome(page);
  await expect(page.locator('html')).not.toHaveClass(/lenis/);
  await expect(page.locator('.pin-spacer')).toHaveCount(0);
  expect(
    await page
      .locator('[data-future-line]')
      .first()
      .evaluate((element) => getComputedStyle(element).transform),
  ).toBe('none');
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await expect(page.locator('[data-collection-section]')).toHaveClass(/is-pinned/);
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await expect(page.locator('.pin-spacer')).toHaveCount(0);
  await expect(page.locator('[data-collection-track]')).not.toHaveClass(/is-enhanced/);
  expect(
    await page
      .locator('[data-collection-track]')
      .evaluate((element) => getComputedStyle(element).transform),
  ).toBe('none');
  expect(
    await page
      .locator('[data-future-visual] img, [data-hero-sequence]')
      .evaluateAll((elements) =>
        elements.every((element) => getComputedStyle(element).transform === 'none'),
      ),
  ).toBe(true);
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.setViewportSize({ width: 1440, height: 650 });
  await expect(page.locator('.pin-spacer')).toHaveCount(0);
  await page.setViewportSize({ width: 1440, height: 1000 });
  await expect(page.locator('.pin-spacer')).toHaveCount(1);
});

test('enquiry pauses wheel inertia and client navigation removes the collection pin', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await openHome(page);
  await expect(page.locator('[data-collection-section]')).toHaveClass(/is-pinned/);
  const trigger = page.locator('.nav-contact');
  await trigger.focus();
  await page.mouse.wheel(0, 500);
  await page.keyboard.press('Enter');
  await expect(page.getByRole('dialog')).toBeVisible();
  const locked = await page.evaluate(() => scrollY);
  await page.mouse.move(8, 450);
  await page.mouse.wheel(0, 800);
  await page.waitForTimeout(1300);
  expect(Math.abs((await page.evaluate(() => scrollY)) - locked)).toBeLessThan(2);
  await page.keyboard.press('Escape');
  await expect(page.getByRole('dialog')).not.toBeVisible();
  await page.mouse.move(500, 350);
  await page.mouse.wheel(0, 400);
  await expect.poll(() => page.evaluate(() => scrollY)).toBeGreaterThan(locked + 80);
  await page.locator('.desktop-nav a[href="/about"]').click();
  await page.waitForURL('**/about');
  await expect(page.locator('.pin-spacer')).toHaveCount(0);
  await page.locator('.site-header a[href="/"]').first().click();
  await page.waitForURL(/\/\/?$/);
  await expect(page.locator('.pin-spacer')).toHaveCount(1);
});
