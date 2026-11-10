import { expect, test, type Locator } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

async function completeForm(scope: Locator) {
  await scope.getByRole('textbox', { name: 'Full name' }).fill('Receipt Audit');
  await scope.getByRole('textbox', { name: 'Email address' }).fill('receipt@example.test');
  await scope
    .getByRole('textbox', { name: 'Your message' })
    .fill('Mocked local receipt verification.');
  await scope.getByRole('checkbox').check();
  await scope.getByRole('button', { name: 'Send your enquiry' }).click();
}

test('contact receipt enters the viewport with a logical focus target and readable honest delivery note', async ({
  page,
}) => {
  test.setTimeout(90_000);
  await page.route('**/api/enquiries', (route) =>
    route.fulfill({
      status: 201,
      json: { reference: 'ALIYAS-MOCK-RECEIPT-0000000001', delivery: 'not_configured' },
    }),
  );
  for (const theme of ['light', 'dark'])
    for (const width of [320, 390, 768, 1024, 1440]) {
      await page.emulateMedia({ reducedMotion: theme === 'light' ? 'no-preference' : 'reduce' });
      await page.setViewportSize({ width, height: 844 });
      await page.goto('/contact');
      if ((await page.locator('html').getAttribute('data-theme')) !== theme)
        await page.locator('.theme-toggle').click();
      await completeForm(page.locator('main .enquiry-form'));
      const receipt = page.locator('main .enquiry-success');
      await expect(receipt.getByRole('heading')).toBeFocused();
      const header = (await page.locator('.site-header').boundingBox())!;
      await expect
        .poll(async () => (await receipt.boundingBox())!.y)
        .toBeGreaterThanOrEqual(header.height + 20);
      const heading = (await receipt.getByRole('heading').boundingBox())!;
      expect(heading.y + heading.height).toBeLessThan(844);
      await expect(receipt).toContainText('No email has been sent.');
      for (const link of await receipt.locator('.enquiry-direct-contact a').all())
        expect((await link.boundingBox())!.height).toBeGreaterThanOrEqual(44);
      expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(
        width,
      );
      if (width === 320) {
        const scan = await new AxeBuilder({ page })
          .include('.enquiry-success')
          .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
          .analyze();
        expect(
          scan.violations.map((v) => ({ id: v.id, targets: v.nodes.map((n) => n.target) })),
        ).toEqual([]);
      }
    }
});

test('drawer receipt scrolls inside its own panel and keeps the background locked in both motion modes', async ({
  page,
}) => {
  test.setTimeout(90_000);
  await page.route('**/api/enquiries', (route) =>
    route.fulfill({
      status: 201,
      json: { reference: 'ALIYAS-MOCK-DRAWER-RECEIPT', delivery: 'not_configured' },
    }),
  );
  for (const reducedMotion of ['no-preference', 'reduce'] as const) {
    await page.emulateMedia({ reducedMotion });
    for (const [width, height] of [
      [320, 640],
      [390, 844],
      [768, 1024],
    ]) {
      await page.setViewportSize({ width, height });
      await page.goto('/developers/sobha/projects/sobha-solis');
      if ((await page.locator('html').getAttribute('data-theme')) !== 'dark')
        await page.locator('.theme-toggle').click();
      const trigger = page.locator('.pd-mobile-enquiry > button');
      await trigger.click();
      const background = await page.evaluate(() => scrollY);
      const dialog = page.getByRole('dialog');
      await expect(dialog).toBeVisible();
      await completeForm(dialog.locator('.enquiry-form'));
      const receipt = dialog.locator('.enquiry-success');
      await expect(receipt.getByRole('heading')).toBeFocused();
      const heading = (await receipt.getByRole('heading').boundingBox())!,
        sticky = (await dialog.locator('.enquiry-drawer-top').boundingBox())!;
      expect(heading.y).toBeGreaterThanOrEqual(sticky.y + sticky.height);
      expect(heading.y + heading.height).toBeLessThan(height);
      expect(Math.abs((await page.evaluate(() => scrollY)) - background)).toBeLessThan(2);
      await expect(page.locator('html')).toHaveAttribute('data-lenis-prevent', '');
      if (width === 320) {
        const scan = await new AxeBuilder({ page })
          .include('.enquiry-success')
          .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
          .analyze();
        expect(
          scan.violations.map((v) => ({ id: v.id, targets: v.nodes.map((n) => n.target) })),
        ).toEqual([]);
      }
      await page.keyboard.press('Escape');
      await expect(dialog).not.toBeVisible();
      await expect(trigger).toBeFocused();
      await expect(page.locator('html')).not.toHaveAttribute('data-lenis-prevent');
    }
  }
});
