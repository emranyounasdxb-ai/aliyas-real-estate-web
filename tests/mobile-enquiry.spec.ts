import { expect, test } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test('enquiry remains readable and can close from the bottom on phones and landscape', async ({
  page,
}) => {
  for (const [width, height] of [
    [320, 568],
    [390, 844],
    [667, 375],
    [844, 390],
    [768, 1024],
  ]) {
    await page.setViewportSize({ width, height });
    await page.goto('/projects/creek-waters');
    const trigger = page.locator('.pd-mobile-enquiry > button');
    await trigger.click();
    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible();
    const name = dialog.getByRole('textbox', { name: 'Full name' });
    await name.fill('Mobile preview');
    const fields = await dialog
      .locator('input:not([type=checkbox]),textarea,select')
      .evaluateAll((elements) =>
        elements
          .filter((element) => element.getAttribute('name') !== 'website')
          .map((element) => parseFloat(getComputedStyle(element).fontSize)),
      );
    expect(fields.every((size) => size >= 16)).toBe(true);
    const panel = dialog.locator('.enquiry-drawer-panel');
    await panel.evaluate((element) => {
      element.scrollTop = element.scrollHeight;
    });
    const close = dialog.getByRole('button', { name: 'Close enquiry', exact: true });
    const box = (await close.boundingBox())!;
    const panelBox = (await panel.boundingBox())!,
      headerBox = (await dialog.locator('.enquiry-drawer-top').boundingBox())!;
    expect(headerBox.y).toBeLessThanOrEqual(panelBox.y + 1.5);
    expect(box.y).toBeGreaterThanOrEqual(0);
    expect(box.y + box.height).toBeLessThanOrEqual(height);
    expect(box.width).toBeGreaterThanOrEqual(44);
    expect(box.height).toBeGreaterThanOrEqual(44);
    await close.focus();
    await name.focus();
    await expect
      .poll(async () => {
        const field = (await name.boundingBox())!,
          header = (await dialog.locator('.enquiry-drawer-top').boundingBox())!;
        return field.y - (header.y + header.height);
      })
      .toBeGreaterThanOrEqual(0);
    await panel.evaluate((element) => {
      element.scrollTop = element.scrollHeight;
    });
    await expect(page.locator('html')).toHaveAttribute('data-lenis-prevent', '');
    await close.click();
    await expect(dialog).not.toBeVisible();
    await expect(trigger).toBeFocused();
    await expect(page.locator('html')).not.toHaveAttribute('data-lenis-prevent');
    await trigger.click();
    await expect(name).toHaveValue('Mobile preview');
    await page.keyboard.press('Escape');
  }
});

test('sticky enquiry header and form retain light/dark accessibility at both scroll positions', async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  for (const theme of ['light', 'dark']) {
    await page.goto('/projects/creek-waters');
    if ((await page.locator('html').getAttribute('data-theme')) !== theme)
      await page.locator('.theme-toggle').click();
    await page.locator('.pd-mobile-enquiry button').click();
    const dialog = page.getByRole('dialog');
    for (const bottom of [false, true]) {
      await dialog.locator('.enquiry-drawer-panel').evaluate((element, end) => {
        element.scrollTop = end ? element.scrollHeight : 0;
      }, bottom);
      const scan = await new AxeBuilder({ page })
        .include('.enquiry-drawer')
        .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
        .analyze();
      expect(
        scan.violations.map(({ id, nodes }) => ({ id, targets: nodes.map((node) => node.target) })),
      ).toEqual([]);
    }
    await page.keyboard.press('Escape');
  }
});
