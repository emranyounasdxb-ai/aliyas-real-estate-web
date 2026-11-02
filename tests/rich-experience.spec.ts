import { expect, test } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test('curated collections open the correct catalogue subset and can be cleared', async ({
  page,
}) => {
  for (const [slug, count] of [
    ['waterfront', 3],
    ['villas', 1],
    ['city', 2],
  ] as const) {
    await page.goto('/');
    await page.locator(`.curated-card[href="/projects?collection=${slug}"]`).click();
    await expect(page.locator('.project-card')).toHaveCount(count);
    await expect(page.locator('.curated-filter-note')).toBeVisible();
    await page.getByRole('button', { name: 'Clear collection' }).click();
    await expect(page.locator('.project-card')).toHaveCount(6);
    await expect(page).not.toHaveURL(/collection=/);
    await page.goBack();
    await expect(page.locator('.project-card')).toHaveCount(count);
  }
});

test('map buttons and destination tabs stay synchronized at phone, tablet and desktop sizes', async ({
  page,
}) => {
  for (const width of [320, 768, 1440]) {
    await page.setViewportSize({ width, height: 950 });
    await page.goto('/');
    for (const name of ['Ajman', 'Abu Dhabi', 'Ras Al Khaimah', 'Dubai']) {
      await page.getByRole('button', { name: `Show ${name} on map`, exact: true }).click();
      await expect(page.getByRole('tab', { name: new RegExp(name) })).toHaveAttribute(
        'aria-selected',
        'true',
      );
      await expect(page.getByRole('tabpanel')).toHaveCount(1);
      await expect(
        page.getByRole('link', { name: `Explore ${name}`, exact: true }),
      ).toHaveAttribute('href', `/projects?emirate=${encodeURIComponent(name)}`);
    }
    await page.getByRole('tab', { name: '04 Ajman', exact: true }).click();
    await expect(
      page.getByRole('button', { name: 'Show Ajman on map', exact: true }),
    ).toHaveAttribute('aria-pressed', 'true');
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
      true,
    );
    const boxes = await page.locator('.destination-map button').evaluateAll((buttons) =>
      buttons.map((button) => {
        const r = button.getBoundingClientRect();
        return { x: r.x, y: r.y, right: r.right, bottom: r.bottom };
      }),
    );
    for (let i = 0; i < boxes.length; i++)
      for (let j = i + 1; j < boxes.length; j++) {
        const a = boxes[i],
          b = boxes[j];
        expect(a.right <= b.x || b.right <= a.x || a.bottom <= b.y || b.bottom <= a.y).toBe(true);
      }
  }
});

test('developer and legacy galleries support thumbnails, keyboard navigation and focus restoration', async ({
  page,
}) => {
  for (const [route, name] of [
    ['/developers/emaar/projects/emaar-project-15', 'Emaar Project 15'],
    ['/projects/creek-waters', 'Creek Waters'],
  ]) {
    await page.goto(route);
    await expect(page.locator('.pd-gallery-thumbnails button')).toHaveCount(3);
    await page.getByRole('button', { name: 'Show 03 — Material study', exact: true }).click();
    await expect(page.locator('.pd-gallery-open img')).toHaveAttribute(
      'src',
      /concept-(villa|apartment)-detail/,
    );
    const trigger = page.locator('.pd-gallery-open');
    await trigger.click();
    const dialog = page.getByRole('dialog', { name: `${name} image gallery`, exact: true });
    await expect(dialog).toBeVisible();
    await expect(dialog.locator('.pd-lightbox-controls p')).toContainText('03 / 03');
    await page.keyboard.press('ArrowRight');
    await expect(dialog.locator('.pd-lightbox-controls p')).toContainText('01 / 03');
    await page.keyboard.press('ArrowLeft');
    await expect(dialog.locator('.pd-lightbox-controls p')).toContainText('03 / 03');
    await page.keyboard.press('Escape');
    await expect(trigger).toBeFocused();
    await expect(dialog).not.toBeVisible();
    const tile = page.getByRole('button', {
      name: `Open Interior concept image of ${name}`,
      exact: true,
    });
    await tile.click();
    await expect(dialog.locator('.pd-lightbox-controls p')).toContainText('02 / 03');
    await page.keyboard.press('Escape');
    await expect(tile).toBeFocused();
  }
});

test('hero views respond to wheel scrolling at every breakpoint and preserve reduced-motion controls', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  for (const width of [390, 768, 1440]) {
    await page.setViewportSize({ width, height: 1000 });
    await page.goto('/');
    const buttons = page.locator('.hero-view-controls button');
    await expect(buttons).toHaveCount(width < 701 ? 2 : 3);
    await expect(buttons.first()).toHaveAttribute('aria-pressed', 'true');
    await expect(page.locator('html')).toHaveClass(/lenis/);
    await page.mouse.move(width / 2, 400);
    await page.mouse.wheel(0, width < 701 ? 500 : 400);
    await expect(buttons.last()).toHaveAttribute('aria-pressed', 'true');
    await page.evaluate(() =>
      window.dispatchEvent(
        new CustomEvent('aliyas:scroll-to', {
          detail: { top: 0, immediate: true },
          cancelable: true,
        }),
      ),
    );
    await expect(buttons.first()).toHaveAttribute('aria-pressed', 'true');
  }
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.getByRole('button', { name: 'View the detail' }).click();
  await expect(page.getByRole('button', { name: 'View the detail' })).toHaveAttribute(
    'aria-pressed',
    'true',
  );
  expect(
    await page
      .locator('[data-hero-sequence]')
      .evaluate((element) => (element as HTMLElement).style.transform),
  ).toBe('');
});

test('new home and gallery surfaces pass accessibility checks in both themes and sizes', async ({
  page,
}) => {
  for (const width of [390, 1440])
    for (const theme of ['light', 'dark']) {
      await page.setViewportSize({ width, height: 950 });
      await page.goto('/');
      await page.evaluate((value) => {
        localStorage.setItem('aliyas-theme', value);
        document.documentElement.dataset.theme = value;
      }, theme);
      for (const route of ['/', '/developers/emaar/projects/emaar-project-15']) {
        await page.goto(route);
        const result = await new AxeBuilder({ page })
          .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
          .analyze();
        expect(
          result.violations,
          JSON.stringify(
            result.violations.map(({ id, nodes }) => ({ id, targets: nodes.map((n) => n.target) })),
          ),
        ).toEqual([]);
        expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
          true,
        );
      }
    }
});
