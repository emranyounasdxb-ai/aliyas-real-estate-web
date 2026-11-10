import { expect, test, type Locator } from '@playwright/test';
import { originalImagePath } from './image-source';

const emirates = ['Dubai', 'Abu Dhabi', 'Sharjah', 'Ras Al Khaimah', 'Ajman', 'Fujairah', 'Umm Al Quwain'];

async function openDestinations(page: import('@playwright/test').Page, mobile = false) {
  if (mobile) {
    await page.getByRole('button', { name: 'Open menu' }).click();
    await page.getByRole('navigation', { name: 'Mobile navigation' }).getByRole('button', { name: 'Off plan projects' }).click();
  } else {
    await page.getByRole('navigation', { name: 'Explore navigation' }).getByRole('button', { name: 'Off plan projects' }).click();
  }
  return page.locator('#signature-navigation-panel');
}

async function fieldMetrics(form: Locator) {
  return form.evaluate((el) => {
    const fields = [el.querySelector<HTMLInputElement>('input[name="phone"]')!, el.querySelector<HTMLButtonElement>('.brand-select-trigger')!];
    return fields.map((field) => {
      const rect = field.getBoundingClientRect();
      const css = getComputedStyle(field);
      return { top: rect.top, height: rect.height, width: rect.width, border: css.borderColor, radius: css.borderRadius, background: css.backgroundColor, font: css.fontSize };
    });
  });
}

test('all seven destination cards have distinct images and correct emirate filters', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/');
  const panel = await openDestinations(page);
  const cards = panel.locator('.signature-city-card');
  await expect(cards).toHaveCount(7);
  const images: string[] = [];
  for (const name of emirates) {
    const card = cards.filter({ has: page.getByRole('heading', { name, exact: true }) });
    await expect(card).toHaveCount(1);
    const link = new URL((await card.getAttribute('href'))!, page.url());
    expect(link.pathname).toBe('/projects');
    expect(link.searchParams.get('emirate')).toBe(name);
    const image = card.locator('img');
    await image.evaluate((element) => (element as HTMLImageElement).decode());
    images.push(originalImagePath((await image.getAttribute('src'))!, page.url()));
    expect(await image.evaluate((element) => (element as HTMLImageElement).currentSrc)).toContain('/images/navigation-responsive/v1/');
  }
  expect(new Set(images).size).toBe(7);
  await page.screenshot({ path: 'artifacts/emirate-navigation-desktop.png' });
  await cards.filter({ has: page.getByRole('heading', { name: 'Sharjah', exact: true }) }).click();
  await expect(page).toHaveURL((url) => url.pathname === '/projects' && url.searchParams.get('emirate') === 'Sharjah', { timeout: 30_000 });
});

test('mobile destinations remain accessible and open the requested emirate', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  const panel = await openDestinations(page, true);
  const cards = panel.locator('.signature-city-card');
  await expect(cards).toHaveCount(7);
  expect(await panel.evaluate((el) => el.scrollWidth <= el.clientWidth)).toBe(true);
  const target = cards.filter({ has: page.getByRole('heading', { name: 'Umm Al Quwain', exact: true }) });
  await target.scrollIntoViewIfNeeded();
  await target.locator('img').evaluate((el) => (el as HTMLImageElement).decode());
  await page.screenshot({ path: 'artifacts/emirate-navigation-mobile.png' });
  await target.click();
  await expect(page).toHaveURL((url) => url.pathname === '/projects' && url.searchParams.get('emirate') === 'Umm Al Quwain');
});

test('enquiry inputs and interest dropdown align in drawer and contact forms', async ({ page }) => {
  test.setTimeout(90_000);
  for (const width of [1440, 390]) {
    await page.setViewportSize({ width, height: 900 });
    for (const kind of ['drawer', 'contact'] as const) {
      await page.goto(kind === 'drawer' ? '/developers/sobha/projects/sobha-solis' : '/contact');
      if (kind === 'drawer') {
        if (width <= 430) {
          await page.getByRole('complementary', { name: 'Quick project enquiry' }).getByRole('button', { name: /Enquire/ }).click();
        } else {
          await page.getByRole('button', { name: 'Enquire about this project', exact: true }).click();
        }
      }
      const form = kind === 'drawer' ? page.locator('.enquiry-drawer[open] .enquiry-form') : page.locator('main .enquiry-form');
      await form.locator('input[name="phone"]').focus();
      await form.locator('input[name="phone"]').blur();
      for (const theme of ['light', 'dark']) {
        await page.evaluate((value) => { document.documentElement.dataset.theme = value; }, theme);
        const [phone, select] = await fieldMetrics(form);
        expect(Math.abs(phone.height - select.height), `${kind} ${width} ${theme} height`).toBeLessThan(1);
        expect(Math.abs(phone.width - select.width), `${kind} ${width} ${theme} width`).toBeLessThan(1);
        if (width > 430) expect(Math.abs(phone.top - select.top), `${kind} ${theme} alignment`).toBeLessThan(1);
        for (const key of ['border', 'radius', 'background', 'font'] as const) expect(select[key], `${kind} ${width} ${theme} ${key}`).toBe(phone[key]);
      }
      await form.getByRole('combobox', { name: 'I am looking for' }).click();
      await page.getByRole('option', { name: 'An investment' }).click();
      await expect(form.getByRole('combobox', { name: 'I am looking for' })).toContainText('An investment');
      await expect(form.locator('select[name="interest"]')).toHaveValue('An investment');
      if (kind === 'drawer') {
        await page.screenshot({ path: `artifacts/enquiry-fields-${width}.png` });
        await page.keyboard.press('Escape');
        await expect(page.locator('.enquiry-drawer[open]')).toHaveCount(0);
      }
    }
  }
});
