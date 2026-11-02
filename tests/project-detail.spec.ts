import { expect, test } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test('normal-motion gallery stops background wheel inertia and resumes scrolling after close', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto('/projects/creek-waters');
  await expect(page.locator('html')).toHaveClass(/lenis/);
  const before = await page.evaluate(() => ({
    root: document.documentElement.style.overflow,
    body: document.body.style.overflow,
    prevent: document.documentElement.getAttribute('data-lenis-prevent'),
  }));
  const trigger = page.getByRole('button', {
    name: /Creek Waters image gallery: View image/,
  });
  await trigger.focus();
  await page.mouse.wheel(0, 550);
  await page.keyboard.press('Enter');
  const gallery = page.getByRole('dialog', { name: 'Creek Waters image gallery' });
  await expect(gallery).toBeVisible();
  const lockedPosition = await page.evaluate(() => scrollY);
  await page.mouse.move(8, 500);
  await page.mouse.wheel(0, 900);
  // Wait beyond the smooth-scroll duration to catch continuing background inertia.
  await page.waitForTimeout(1500);
  expect(Math.abs((await page.evaluate(() => scrollY)) - lockedPosition)).toBeLessThan(2);
  await page.keyboard.press('Escape');
  await expect(gallery).not.toBeVisible();
  await expect(trigger).toBeFocused();
  expect(
    await page.evaluate(() => ({
      root: document.documentElement.style.overflow,
      body: document.body.style.overflow,
      prevent: document.documentElement.getAttribute('data-lenis-prevent'),
    })),
  ).toEqual(before);
  await page.mouse.move(700, 600);
  await page.mouse.wheel(0, 500);
  await expect.poll(() => page.evaluate(() => scrollY)).toBeGreaterThan(lockedPosition + 50);
});

test('project gallery opens with the keyboard and restores focus after Escape', async ({
  page,
}) => {
  await page.goto('/projects/creek-waters');
  const trigger = page.getByRole('button', {
    name: /Creek Waters image gallery: View image/,
  });
  await trigger.focus();
  await page.keyboard.press('Enter');
  const gallery = page.getByRole('dialog', { name: 'Creek Waters image gallery' });
  await expect(gallery).toBeVisible();
  await expect(gallery.getByRole('button', { name: 'Close image gallery' })).toBeFocused();
  await expect(gallery.getByRole('img')).toHaveCount(1);
  await expect(gallery).toContainText('This image does not depict Creek Waters');
  const accessibility = await new AxeBuilder({ page })
    .include('.pd-lightbox')
    .withTags(['wcag2a', 'wcag2aa'])
    .analyze();
  expect(accessibility.violations).toEqual([]);
  await page.keyboard.press('Escape');
  await expect(gallery).not.toBeVisible();
  await expect(trigger).toBeFocused();
});

test('desktop enquiry remains reachable beside the payment section and resources open contextual requests', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto('/projects/creek-waters');
  await page.evaluate(() => document.fonts.ready);
  await page.locator('#payment-plan').scrollIntoViewIfNeeded();
  const panel = page.getByRole('complementary', { name: 'Project enquiry', exact: true });
  const position = await panel.boundingBox();
  expect(position!.y).toBeGreaterThanOrEqual(100);
  expect(position!.y + position!.height).toBeLessThan(1000);
  await expect(
    page.getByRole('img', { name: /Illustrative payment split: 90 percent and 10 percent/ }),
  ).toBeVisible();
  const resource = page.getByRole('button', { name: /Request floor plans/ });
  await resource.click();
  const drawer = page.getByRole('dialog', { name: /Enquire about Creek Waters/ });
  await expect(drawer).toBeVisible();
  await expect(drawer.locator('textarea[name="message"]')).toHaveValue(
    /latest developer-issued floor plans/,
  );
  await drawer.getByRole('button', { name: 'Close enquiry' }).click();
  await expect(resource).toBeFocused();
  const map = page.getByRole('link', { name: /Explore the area on Google Maps/ });
  const mapUrl = new URL((await map.getAttribute('href'))!);
  expect(mapUrl.searchParams.get('query')).toBe('Dubai Creek Harbour, Dubai, United Arab Emirates');
});

test('mobile price and enquiry stay visible while the detail page scrolls', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/projects/the-acres');
  const bar = page.getByRole('complementary', { name: 'Quick project enquiry' });
  await expect(bar).toContainText('AED 5.5M');
  for (const section of ['#overview', '#project-resources']) {
    await page.locator(section).scrollIntoViewIfNeeded();
    const bounds = await bar.boundingBox();
    expect(bounds!.y).toBeGreaterThan(700);
    expect(bounds!.y + bounds!.height).toBeLessThanOrEqual(845);
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(390);
  }
  await bar.getByRole('button', { name: 'Enquire', exact: true }).click();
  const drawer = page.getByRole('dialog', { name: /Enquire about The Acres/ });
  await expect(drawer).toBeVisible();
  await expect(drawer.locator('input[name="name"]')).toBeFocused();
  await page.keyboard.press('Escape');
  await expect(drawer).not.toBeVisible();
  await expect(bar.getByRole('button', { name: 'Enquire', exact: true })).toBeFocused();
});
