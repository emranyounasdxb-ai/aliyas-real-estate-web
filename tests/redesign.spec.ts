import { expect, test } from '@playwright/test';
import { openCities, assertNoOverflow, projectPath } from './current-ui';
test('destination links support keyboard selection and preserve the selected emirate', async ({
  page,
}) => {
  await page.goto('/');
  const panel = await openCities(page);
  const links = panel.locator('.signature-city-card');
  await links.first().focus();
  await page.keyboard.press('Tab');
  await expect(links.nth(1)).toBeFocused();
  await expect(links.nth(1)).toContainText('Abu Dhabi');
  await page.keyboard.press('Enter');
  await expect(page).toHaveURL(
    (url) => url.pathname === '/projects' && url.searchParams.get('emirate') === 'Abu Dhabi',
  );
  await expect(page.getByRole('combobox', { name: 'Location', exact: true })).toContainText(
    'Abu Dhabi',
  );
  await expect(page.locator('.catalogue-count')).toContainText('79');
  await expect(page.locator('.project-card')).toHaveCount(15);
});
test('home and inner pages stay within mobile and desktop viewports', async ({ page }) => {
  for (const size of [
    { width: 390, height: 844 },
    { width: 1440, height: 1000 },
  ]) {
    await page.setViewportSize(size);
    for (const route of ['/', '/projects', projectPath, '/developers', '/journal', '/contact']) {
      await page.goto(route);
      await expect(page.getByRole('heading', { level: 1 })).toHaveCount(1);
      await assertNoOverflow(page);
    }
  }
});
