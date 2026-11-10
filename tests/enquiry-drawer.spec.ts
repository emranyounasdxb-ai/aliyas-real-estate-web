import { expect, test } from '@playwright/test';

test('enquiry drawer preserves entered details and restores keyboard focus and scrolling', async ({
  page,
}) => {
  await page.goto('/developers/sobha/projects/sobha-solis');
  const trigger = page.getByRole('button', { name: 'Enquire about this project', exact: true });
  await trigger.click();
  const drawer = page.getByRole('dialog');
  await expect(drawer).toBeVisible();
  await expect(drawer).toHaveAccessibleName(/Enquire about Sobha Solis/);
  const name = drawer.getByRole('textbox', { name: 'Full name' });
  await expect(name).toBeFocused();
  await name.fill('Drawer Preview');
  await drawer.getByRole('textbox', { name: 'Email address' }).fill('drawer-preview@example.test');
  await drawer
    .getByRole('textbox', { name: 'Your message' })
    .fill('Please share details about this waterfront home.');
  await expect(page.locator('html')).toHaveAttribute('data-lenis-prevent', '');
  expect(await page.evaluate(() => document.documentElement.style.overflow)).toBe('hidden');
  await page.keyboard.press('Escape');
  await expect(drawer).not.toBeVisible();
  await expect(trigger).toBeFocused();
  await expect(page.locator('html')).not.toHaveAttribute('data-lenis-prevent');
  expect(await page.evaluate(() => document.documentElement.style.overflow)).not.toBe('hidden');
  await trigger.click();
  await expect(name).toHaveValue('Drawer Preview');
  await expect(drawer.getByRole('textbox', { name: 'Email address' })).toHaveValue(
    'drawer-preview@example.test',
  );
  await page.mouse.click(10, 200);
  await expect(drawer).not.toBeVisible();
  await expect(trigger).toBeFocused();
});

test('failed submission retains form and a saved local receipt never claims email delivery', async ({
  page,
}) => {
  let requests = 0;
  await page.route('**/api/enquiries', async (route) => {
    requests += 1;
    if (requests === 1)
      await route.fulfill({
        status: 503,
        json: { error: 'Your enquiry could not be saved. Please try again.' },
      });
    else
      await route.fulfill({
        status: 201,
        json: { reference: 'ALY-DRAWERTEST01', delivery: 'not_configured' },
      });
  });
  await page.goto('/developers/sobha/projects/sobha-solis');
  const trigger = page.getByRole('button', { name: 'Enquire about this project', exact: true });
  await trigger.click();
  const drawer = page.getByRole('dialog');
  await drawer.getByRole('textbox', { name: 'Full name' }).fill('Drawer Preview');
  await drawer.getByRole('textbox', { name: 'Email address' }).fill('drawer-preview@example.test');
  await drawer
    .getByRole('textbox', { name: 'Your message' })
    .fill('Please share details about this waterfront home.');
  await drawer.getByRole('checkbox').check();
  await drawer.getByRole('button', { name: 'Send your enquiry' }).click();
  await expect(drawer.getByRole('alert')).toHaveText(
    'Your enquiry could not be saved. Please try again.',
  );
  await expect(drawer.getByRole('textbox', { name: 'Full name' })).toHaveValue('Drawer Preview');
  await drawer.getByRole('button', { name: 'Send your enquiry' }).click();
  await expect(drawer.getByText('ALY-DRAWERTEST01', { exact: true })).toBeVisible();
  await expect(drawer.getByText(/No email has been sent/)).toBeVisible();
  await expect(drawer.getByRole('link', { name: 'WhatsApp Aliyas', exact: true })).toHaveAttribute(
    'href',
    'https://wa.me/971569157576',
  );
  await drawer.getByRole('button', { name: 'Close enquiry' }).click();
  await trigger.click();
  await expect(drawer.getByText('ALY-DRAWERTEST01', { exact: true })).toBeVisible();
  expect(requests).toBe(2);
});

test('mobile enquiry sheet keeps controls in the viewport and contains keyboard focus', async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/developers/sobha/projects/sobha-solis');
  await page
    .getByRole('complementary', { name: 'Quick project enquiry' })
    .getByRole('button', { name: /Enquire/ })
    .click();
  const drawer = page.getByRole('dialog');
  await expect(drawer).toBeVisible();
  const panel = drawer.locator('.enquiry-drawer-panel');
  const bounds = await panel.boundingBox();
  expect(bounds).not.toBeNull();
  expect(bounds!.x).toBeGreaterThanOrEqual(0);
  expect(bounds!.width).toBeLessThanOrEqual(390);
  expect(bounds!.y + bounds!.height).toBeLessThanOrEqual(845);
  await drawer.getByRole('button', { name: 'Close enquiry' }).focus();
  await page.keyboard.press('Shift+Tab');
  expect(await drawer.evaluate((element) => element.contains(document.activeElement))).toBe(true);
  await page.keyboard.press('Escape');
  await expect(drawer).not.toBeVisible();
});
