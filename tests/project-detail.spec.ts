import { expect, test } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { originalImagePath } from './image-source';

const projectPath = '/developers/sobha/projects/sobha-solis';
const projectSource = 'https://sobharealty.com/properties-in-dubai/sobha-solis';
const brochureSource =
  'https://sobharealty.com/sites/default/files/2024-09/Sobha%20Solis%20Brochure_Final.pdf';

test('normal-motion gallery stops background wheel inertia and resumes scrolling after close', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto(projectPath);
  await expect(page.locator('html')).toHaveClass(/lenis/);
  const before = await page.evaluate(() => ({
    root: document.documentElement.style.overflow,
    body: document.body.style.overflow,
    prevent: document.documentElement.getAttribute('data-lenis-prevent'),
  }));
  const trigger = page.getByRole('button', {
    name: /Sobha Solis image gallery: View image/,
  });
  await trigger.focus();
  await page.mouse.wheel(0, 550);
  await page.keyboard.press('Enter');
  const gallery = page.getByRole('dialog', { name: 'Sobha Solis image gallery' });
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
  await page.goto(projectPath);
  const trigger = page.getByRole('button', {
    name: /Sobha Solis image gallery: View image/,
  });
  await trigger.focus();
  await page.keyboard.press('Enter');
  const gallery = page.getByRole('dialog', { name: 'Sobha Solis image gallery' });
  await expect(gallery).toBeVisible();
  await expect(gallery.getByRole('button', { name: 'Close image gallery' })).toBeFocused();
  await expect(gallery.getByRole('img')).toHaveCount(1);
  await expect(gallery.getByRole('img')).toHaveAttribute('alt', /Sobha Solis/);
  const firstImage = (await gallery.getByRole('img').getAttribute('src'))!;
  expect(originalImagePath(firstImage, page.url())).toBe(
    '/images/projects/sobha/sobha-solis/solis-towers-5e5be3412632.jpg',
  );
  await page.keyboard.press('ArrowRight');
  await expect(gallery.getByRole('img')).not.toHaveAttribute('src', firstImage);
  await page.keyboard.press('ArrowLeft');
  await expect(gallery.getByRole('img')).toHaveAttribute('src', firstImage);
  await expect(gallery).not.toContainText(/illustrative|does not depict|sample/i);
  const accessibility = await new AxeBuilder({ page })
    .include('.pd-lightbox')
    .withTags(['wcag2a', 'wcag2aa'])
    .analyze();
  expect(accessibility.violations).toEqual([]);
  await page.keyboard.press('Escape');
  await expect(gallery).not.toBeVisible();
  await expect(trigger).toBeFocused();
  await expect(
    page.locator('#project-gallery').getByRole('link', { name: 'Image source' }),
  ).toHaveAttribute('href', projectSource);
});

test('desktop enquiry remains reachable beside sourced prices and real project resources', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto(projectPath);
  await page.evaluate(() => document.fonts.ready);
  await page.locator('#payment-plan').scrollIntoViewIfNeeded();
  const panel = page.getByRole('complementary', { name: 'Project enquiry', exact: true });
  const position = await panel.boundingBox();
  expect(position!.y).toBeGreaterThanOrEqual(100);
  expect(position!.y + position!.height).toBeLessThan(1000);
  await expect(page.locator('#payment-plan .developer-project-figures')).toContainText('AED 2.0M');
  await expect(page.locator('#payment-plan .developer-project-figures')).toContainText(
    /60\s*\/\s*40/,
  );
  for (const name of ['Project brochure', 'Floor plans']) {
    const resource = page.locator('#downloads').getByRole('link', { name: new RegExp(name) });
    await expect(resource).toHaveAttribute('href', brochureSource);
    await expect(resource).toHaveAttribute('target', '_blank');
    await expect(resource).toHaveAttribute('rel', /noopener/);
  }
  await expect(
    page.locator('#sources a').filter({ hasText: 'Sobha Solis official project page' }),
  ).toHaveAttribute('href', projectSource);
  const enquire = panel.getByRole('button', { name: 'Enquire now', exact: true });
  await enquire.click();
  const drawer = page.getByRole('dialog', { name: /Enquire about Sobha Solis/ });
  await expect(drawer).toBeVisible();
  await expect(drawer.locator('textarea[name="message"]')).toHaveValue(
    /I would like to know more about Sobha Solis/,
  );
  await drawer.getByRole('button', { name: 'Close enquiry' }).click();
  await expect(enquire).toBeFocused();
  const map = page.locator('#location').getByRole('link', { name: 'Get directions', exact: true });
  const mapUrl = new URL((await map.getAttribute('href'))!);
  expect(mapUrl.hostname).toBe('www.google.com');
  expect(mapUrl.searchParams.get('destination')).toBe('25.0491382,55.2418335');
});

test('mobile price and enquiry stay visible while the detail page scrolls', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(projectPath);
  const bar = page.getByRole('complementary', { name: 'Quick project enquiry' });
  await expect(bar).toContainText('AED 2.0M');
  for (const section of ['#overview', '#downloads']) {
    await page.locator(section).scrollIntoViewIfNeeded();
    const bounds = await bar.boundingBox();
    expect(bounds!.y).toBeGreaterThan(700);
    expect(bounds!.y + bounds!.height).toBeLessThanOrEqual(845);
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(390);
  }
  const enquire = bar.getByRole('button', { name: 'Enquire about this project', exact: true });
  await enquire.click();
  const drawer = page.getByRole('dialog', { name: /Enquire about Sobha Solis/ });
  await expect(drawer).toBeVisible();
  await expect(drawer.locator('input[name="name"]')).toBeFocused();
  await page.keyboard.press('Escape');
  await expect(drawer).not.toBeVisible();
  await expect(enquire).toBeFocused();
});
