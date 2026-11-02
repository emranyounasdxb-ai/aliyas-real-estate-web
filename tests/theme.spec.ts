import { expect, test } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test('theme selection survives navigation, reload and synchronizes between tabs', async ({
  page,
  context,
}) => {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.goto('/');
  await page.getByRole('button', { name: 'Switch to dark mode' }).click();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  await page.reload();
  await expect(page.getByRole('button', { name: 'Switch to light mode' })).toBeVisible();
  await page.locator('.signature-nav-right a[href="/about"]').click();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  const other = await context.newPage();
  await other.goto('/projects');
  await expect(other.getByRole('button', { name: 'Switch to light mode' })).toBeVisible();
  await other.getByRole('button', { name: 'Switch to light mode' }).click();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
  await other.close();
  expect(errors).toEqual([]);
});

test('theme toggle remains reachable without logo collisions at mobile and desktop widths', async ({
  page,
}) => {
  await page.goto('/');
  for (const width of [320, 390, 768, 1099, 1100, 1280, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    const toggle = page.locator('.theme-toggle');
    await expect(toggle).toBeVisible();
    const logo = (await page.locator('.signature-brand .brand').boundingBox())!;
    const controls = await page.locator('.signature-utilities').boundingBox();
    expect(controls!.x + controls!.width).toBeLessThanOrEqual(logo.x);
    await toggle.click();
    await toggle.click();
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(
      width,
    );
  }
});

test('theme toggle works when local storage is blocked', async ({ page }) => {
  await page.addInitScript(() => {
    Storage.prototype.getItem = () => {
      throw new Error('Storage blocked');
    };
    Storage.prototype.setItem = () => {
      throw new Error('Storage blocked');
    };
  });
  await page.goto('/');
  await page.getByRole('button', { name: 'Switch to dark mode' }).click();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  await page.getByRole('button', { name: 'Switch to light mode' }).click();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
});

for (const route of ['/', '/projects', '/projects/creek-waters', '/contact']) {
  test(`dark mode contrast and accessibility: ${route}`, async ({ page }) => {
    await page.addInitScript(() => localStorage.setItem('aliyas-theme', 'dark'));
    await page.goto(route);
    await expect(page.getByRole('button', { name: 'Switch to light mode' })).toBeVisible();
    await page.evaluate(() => document.fonts.ready);
    const result = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze();
    expect(
      result.violations.map((v) => ({ rule: v.id, targets: v.nodes.map((n) => n.target) })),
    ).toEqual([]);
  });
}

test('dark header panels and enquiry fields remain accessible', async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem('aliyas-theme', 'dark'));
  await page.goto('/');
  await page
    .locator('.signature-nav-left')
    .getByRole('button', { name: 'Off-plan projects', exact: true })
    .click();
  let result = await new AxeBuilder({ page })
    .include('.signature-header')
    .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
    .analyze();
  expect(
    result.violations.map((v) => ({ rule: v.id, targets: v.nodes.map((n) => n.target) })),
  ).toEqual([]);
  await page.keyboard.press('Escape');
  await page.locator('.signature-enquire').click();
  await expect(page.getByRole('dialog')).toBeVisible();
  result = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
    .analyze();
  expect(
    result.violations.map((v) => ({ rule: v.id, targets: v.nodes.map((n) => n.target) })),
  ).toEqual([]);
});
