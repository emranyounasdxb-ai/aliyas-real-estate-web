import { expect, test } from '@playwright/test';

test('destination tabs support keyboard selection and link to the selected emirate', async ({
  page,
}) => {
  await page.goto('/');
  const dubai = page.getByRole('tab', { name: '01 Dubai' });
  await dubai.focus();
  await page.keyboard.press('ArrowDown');
  const abuDhabi = page.getByRole('tab', { name: '02 Abu Dhabi' });
  await expect(abuDhabi).toBeFocused();
  await expect(abuDhabi).toHaveAttribute('aria-selected', 'true');
  await expect(page.getByRole('tabpanel')).toHaveCount(1);
  await page.getByRole('tabpanel').getByRole('link', { name: 'Explore Abu Dhabi' }).click();
  await expect(page).toHaveURL(/\/projects\?emirate=Abu%20Dhabi/);
  await expect(page.getByRole('combobox', { name: 'Location' })).toHaveValue('Abu Dhabi');
  await expect(page.locator('.project-card')).toHaveCount(1);
});

test('home and inner pages stay within mobile and desktop viewports', async ({ page }) => {
  for (const viewport of [
    { width: 390, height: 844 },
    { width: 1440, height: 1000 },
  ]) {
    await page.setViewportSize(viewport);
    for (const route of [
      '/',
      '/projects',
      '/projects/creek-waters',
      '/developers',
      '/journal',
      '/contact',
    ]) {
      await page.goto(route);
      await expect(page.getByRole('heading', { level: 1 })).toHaveCount(1);
      const measure = await page.evaluate(() => ({
        width: innerWidth,
        document: document.documentElement.scrollWidth,
        body: document.body.scrollWidth,
      }));
      expect(measure.document, `${route} at ${viewport.width}px`).toBeLessThanOrEqual(
        measure.width + 1,
      );
      expect(measure.body, `${route} at ${viewport.width}px`).toBeLessThanOrEqual(
        measure.width + 1,
      );
    }
  }
});
