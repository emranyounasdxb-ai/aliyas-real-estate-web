import { expect, test } from '@playwright/test';

test('the buying journey can reach every step on mobile and resets to five visible desktop panels', async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  const journey = page.locator('.hp-journey');
  await journey.scrollIntoViewIfNeeded();
  const next = journey.getByRole('button', { name: 'Next buying step' });
  const previous = journey.getByRole('button', { name: 'Previous buying step' });
  const status = journey.getByRole('status');
  await expect(previous).toHaveAttribute('aria-disabled', 'true');
  for (let index = 2; index <= 5; index += 1) {
    await next.click();
    await expect(status).toContainText(`0${index}`);
  }
  await expect(next).toHaveAttribute('aria-disabled', 'true');
  await expect(journey.getByRole('button', { name: 'Move forward', exact: true })).toBeInViewport();
  await previous.focus();
  await page.keyboard.press('Enter');
  await expect(status).toContainText('04');
  await expect(journey.locator('.hp-journey-panel').nth(3).locator('img')).toHaveCSS(
    'transform',
    'none',
  );
  await page.setViewportSize({ width: 1440, height: 1000 });
  await expect(next).not.toBeVisible();
  await expect
    .poll(() => page.locator('#hp-journey-viewport').evaluate((el) => el.scrollLeft))
    .toBe(0);
  const panels = journey.locator('.hp-journey-panel');
  await expect(panels).toHaveCount(5);
  for (const panel of await panels.all()) {
    const box = await panel.boundingBox();
    expect(box!.x).toBeGreaterThanOrEqual(0);
    expect(box!.x + box!.width).toBeLessThanOrEqual(1440);
    const image = panel.locator('img');
    await expect
      .poll(() => image.evaluate((el: HTMLImageElement) => el.complete && el.naturalWidth > 0))
      .toBe(true);
  }
});

test('journey links and plan enquiries preserve the visitor intent and restore keyboard focus', async ({
  page,
  request,
}) => {
  await page.goto('/');
  const journey = page.locator('.hp-journey');
  for (const [name, href] of [
    ['Discover', '/projects'],
    ['Shortlist', '/projects?saved=1'],
    ['Compare', '/projects/compare'],
  ]) {
    const link = journey.getByRole('link', { name, exact: true });
    await expect(link).toHaveAttribute('href', href);
    expect((await request.get(href)).status()).toBe(200);
  }
  for (const [name, message] of [
    ['Plan', 'budget, buying costs'],
    ['Move forward', 'availability and the next steps'],
    ['Plan my property search', 'planning my next home purchase'],
  ]) {
    const trigger = page.getByRole('button', { name, exact: true });
    await trigger.click();
    const dialog = page.getByRole('dialog');
    await expect(dialog.getByRole('textbox', { name: 'Your message' })).toHaveValue(
      new RegExp(message),
    );
    await expect(dialog.getByRole('textbox', { name: 'Full name' })).toBeFocused();
    await page.keyboard.press('Escape');
    await expect(dialog).not.toBeVisible();
    await expect(trigger).toBeFocused();
    await expect(trigger).toHaveCSS('outline-style', 'solid');
  }
});
