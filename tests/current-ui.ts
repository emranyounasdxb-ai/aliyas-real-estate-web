import { expect, type Page } from '@playwright/test';
export const projectPath = '/developers/sobha/projects/sobha-solis';
export const emirates = [
  'Dubai',
  'Abu Dhabi',
  'Sharjah',
  'Ras Al Khaimah',
  'Ajman',
  'Fujairah',
  'Umm Al Quwain',
];
// The approved redesign moved destinations into navigation and replaced the pinned home rail.
export async function openCities(page: Page) {
  const mobile = page.getByRole('button', { name: 'Open menu', exact: true });
  if (await mobile.isVisible()) {
    await mobile.click();
    await page
      .getByRole('navigation', { name: 'Mobile navigation' })
      .getByRole('button', { name: 'Off plan projects', exact: true })
      .click();
  } else
    await page
      .getByRole('navigation', { name: 'Explore navigation' })
      .getByRole('button', { name: 'Off plan projects', exact: true })
      .click();
  const panel = page.locator('#signature-navigation-panel');
  await expect(panel.locator('.signature-city-card')).toHaveCount(7);
  return panel;
}
export async function assertNoOverflow(page: Page) {
  expect(
    await page.evaluate(
      () =>
        Math.max(document.documentElement.scrollWidth, document.body.scrollWidth) <= innerWidth + 1,
    ),
  ).toBe(true);
}
export async function touchGesture(page: Page, x1: number, y1: number, x2: number, y2: number) {
  const cdp = await page.context().newCDPSession(page);
  await cdp.send('Input.dispatchTouchEvent', {
    type: 'touchStart',
    touchPoints: [{ x: x1, y: y1 }],
  });
  for (let i = 1; i <= 10; i++) {
    await cdp.send('Input.dispatchTouchEvent', {
      type: 'touchMove',
      touchPoints: [{ x: x1 + ((x2 - x1) * i) / 10, y: y1 + ((y2 - y1) * i) / 10 }],
    });
    await page.waitForTimeout(25);
  }
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
  await cdp.detach();
}
