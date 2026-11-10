import { expect, test } from '@playwright/test';

test('all thirty developer logos scroll, pause and resume without losing their project links', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.goto('/');
  await page.locator('.developer-marquee').scrollIntoViewIfNeeded();
  await page.mouse.move(0, 0);
  const track = page.locator('.developer-marquee-track');
  await expect
    .poll(() => track.evaluate((el) => getComputedStyle(el).animationPlayState))
    .toBe('running');
  const position = await track.evaluate((el) => getComputedStyle(el).transform);
  await expect
    .poll(() => track.evaluate((el) => getComputedStyle(el).transform))
    .not.toBe(position);
  const links = page.locator('.developer-marquee-group:not([aria-hidden]) a');
  await expect(links).toHaveCount(30);
  for (const link of await links.all())
    await expect(link).toHaveAttribute('href', /^\/developers\/[a-z0-9-]+$/);
  await page.getByRole('button', { name: 'Pause developer logos' }).click();
  await expect
    .poll(() => track.evaluate((el) => getComputedStyle(el).animationPlayState))
    .toBe('paused');
  await page.getByRole('button', { name: 'Resume developer logos' }).click();
  await expect
    .poll(() => track.evaluate((el) => getComputedStyle(el).animationPlayState))
    .toBe('running');
  await page.keyboard.press('Tab');
  await expect(links.first()).toBeFocused();
  await expect.poll(() => track.evaluate((el) => getComputedStyle(el).animationName)).toBe('none');
});

test('reduced motion keeps every developer accessible without automatic movement', async ({
  page,
}) => {
  await page.goto('/');
  const track = page.locator('.developer-marquee-track');
  await expect.poll(() => track.evaluate((el) => getComputedStyle(el).animationName)).toBe('none');
  await expect(page.locator('.developer-marquee-group[aria-hidden]')).not.toBeVisible();
  await expect(page.getByRole('button', { name: 'Pause developer logos' })).not.toBeVisible();
  await expect(page.locator('.hp-team')).toHaveCount(0);
  await expect(page.getByText('Sameer Khan', { exact: true })).toHaveCount(0);
  await page.locator('.hp-faq summary').first().focus();
  await page.keyboard.press('Enter');
  await expect(page.locator('.hp-faq details').first()).toHaveAttribute('open', '');
  await expect(page.locator('.hp-faq details').first().locator('p')).toBeVisible();
});
