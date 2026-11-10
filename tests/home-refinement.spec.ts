import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { assertNoOverflow, touchGesture } from './current-ui';
test('home discovery order, copy and sections work at all priority widths', async ({ page }) => {
  for (const width of [320, 390, 768, 1024, 1440]) {
    await page.setViewportSize({ width, height: 844 });
    await page.goto('/');
    await expect(page.locator('.hp-hero .hp-eyebrow')).toContainText('UAE PROPERTY');
    await expect(page.getByRole('link', { name: 'Find my property', exact: true })).toHaveAttribute(
      'href',
      '#find-a-home',
    );
    const order = await page
      .locator('main section')
      .evaluateAll((es) => es.map((e) => e.classList[0]));
    expect(order.indexOf('hp-projects')).toBeGreaterThan(order.indexOf('developer-marquee'));
    expect(order.indexOf('hp-journey')).toBeGreaterThan(order.indexOf('hp-projects'));
    await expect(page.locator('.hp-journey-panel h3')).toHaveText([
      'Discover',
      'Shortlist',
      'Compare',
      'Plan',
      'Move forward',
    ]);
    await assertNoOverflow(page);
  }
});
test('featured project save and comparison persist across catalogue and canonical project navigation', async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  const card = page.locator('[data-home-project]').first();
  await expect(page.locator('[data-home-project]')).toHaveCount(2);
  await expect(card.locator('.hp-project-image')).toHaveAttribute(
    'href',
    '/developers/select-group/projects/artistry-two-residences',
  );
  await card.getByRole('button', { name: 'Save Artistry Two Residences', exact: true }).click();
  await card
    .getByRole('button', { name: 'Compare project: Artistry Two Residences', exact: true })
    .click();
  await card.getByRole('link', { name: 'View comparison', exact: true }).click();
  await expect(page.getByRole('combobox', { name: 'Choose project 1', exact: true })).toContainText(
    'Artistry Two Residences',
  );
  await page.goto('/projects?saved=1');
  await expect(page.locator('.project-card')).toHaveCount(1);
  await expect(page.locator('.project-card')).toHaveAttribute(
    'data-project-id',
    'select-group-project-01',
  );
  await page.locator('.project-card-image-link').click();
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Artistry Two Residences');
  await page.goto('/');
  await expect(
    card.getByRole('button', { name: 'Unsave Artistry Two Residences', exact: true }),
  ).toHaveAttribute('aria-pressed', 'true');
  await page
    .getByRole('button', { name: 'Compare project: Yas Riva Reserve', exact: true })
    .click();
  await page.reload();
  await expect(page.locator('.comparison-select[aria-pressed="true"]')).toHaveCount(2);
  await card
    .getByRole('button', { name: 'Compare project: Artistry Two Residences', exact: true })
    .click();
  await card.getByRole('button', { name: 'Unsave Artistry Two Residences', exact: true }).click();
  await page.goto('/projects?saved=1');
  await expect(page.locator('.project-card')).toHaveCount(0);
  await expect(page.getByRole('link', { name: 'Compare (1)', exact: true })).toBeVisible();
});
test.describe('mobile buying journey', () => {
  test.use({ hasTouch: true, isMobile: true });
  test('swipes, arrow buttons and keyboard clicks reach every step in both motion modes', async ({
    page,
  }) => {
    test.setTimeout(90000);
    for (const reducedMotion of ['reduce', 'no-preference'] as const)
      for (const width of [320, 390]) {
        await page.emulateMedia({ reducedMotion });
        await page.setViewportSize({ width, height: 844 });
        await page.goto('/');
        const rail = page.locator('.hp-journey-viewport');
        await rail.scrollIntoViewIfNeeded();
        const r = (await rail.boundingBox())!,
          y = Math.max(140, Math.min(650, r.y + r.height / 2));
        await touchGesture(page, width - 42, y, 45, y);
        await expect.poll(() => rail.evaluate((e) => e.scrollLeft)).toBeGreaterThan(100);
        const next = page.getByRole('button', { name: 'Next buying step' }),
          previous = page.getByRole('button', { name: 'Previous buying step' });
        for (let i = 0; i < 4 && (await next.getAttribute('aria-disabled')) !== 'true'; i++) {
          const before = await page.locator('.hp-journey-controls [role=status]').innerText();
          await next.click();
          await expect(page.locator('.hp-journey-controls [role=status]')).not.toHaveText(before);
        }
        await expect(next).toHaveAttribute('aria-disabled', 'true');
        await expect(page.locator('.hp-journey-controls [role=status]')).toContainText('05');
        await previous.focus();
        await page.keyboard.press('Enter');
        await expect(page.locator('.hp-journey-controls [role=status]')).toContainText('04');
        await assertNoOverflow(page);
      }
  });
});
test('both themes keep featured actions touch sized and all three current journal covers loaded', async ({
  page,
}) => {
  test.setTimeout(90000);
  for (const width of [320, 390, 768, 1024, 1440])
    for (const theme of ['light', 'dark']) {
      await page.setViewportSize({ width, height: 1000 });
      await page.goto('/');
      await page.evaluate((t) => {
        localStorage.setItem('aliyas-theme', t);
        document.documentElement.dataset.theme = t;
      }, theme);
      const first = page.locator('[data-home-project]').first();
      for (const control of await first.locator('.home-project-actions button').all())
        expect((await control.boundingBox())!.height).toBeGreaterThanOrEqual(44);
      await page.locator('.hp-journal').scrollIntoViewIfNeeded();
      const images = page.locator('.hp-journal-grid img');
      await expect(images).toHaveCount(3);
      for (const image of await images.all()) {
        await image.scrollIntoViewIfNeeded();
        await image.evaluate((e: HTMLImageElement) => e.decode());
        await expect(image).toHaveAttribute('src', /\/images\/journal\//);
      }
      await assertNoOverflow(page);
      if (width === 390) {
        const result = await new AxeBuilder({ page })
          .include('.hp-project-actions-row')
          .include('.hp-journey-controls')
          .include('.hp-journal')
          .analyze();
        expect(result.violations).toEqual([]);
      }
    }
});
