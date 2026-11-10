import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Locator, type Page } from '@playwright/test';

const header = (page: Page) => page.locator('.signature-header');
const panel = (page: Page) => page.locator('.signature-panel');
const projectsTrigger = (page: Page) =>
  page.locator('.signature-nav-left').getByRole('button', {
    name: 'Off plan projects',
    exact: true,
  });

async function visit(page: Page, path = '/', width = 1440, height = 1000) {
  await page.setViewportSize({ width, height });
  await page.goto(path);
  await page.evaluate(() => document.fonts.ready);
  await expect(header(page)).toBeVisible();
}

async function expectEmirate(page: Page, emirate: string, count: number) {
  await expect(page).toHaveURL(
    (url) => url.pathname === '/projects' && url.searchParams.get('emirate') === emirate,
  );
  await expect(page.getByRole('combobox', { name: 'Location', exact: true })).toContainText(
    emirate,
  );
  await expect(page.locator('.project-card')).toHaveCount(Math.min(15, count));
  await expect(panel(page)).not.toBeVisible();
}

async function expectDisclosure(trigger: Locator, page: Page) {
  await expect(trigger).toHaveAttribute('aria-expanded', 'true');
  const id = await trigger.getAttribute('aria-controls');
  expect(id).toBeTruthy();
  await expect(panel(page)).toHaveAttribute('id', id!);
  await expect(panel(page)).toHaveRole('region');
  await expect(panel(page)).toHaveAttribute('aria-labelledby', /.+/);
  await expect(panel(page)).not.toHaveAttribute('aria-modal', 'true');
  const headerBounds = (await header(page).boundingBox())!;
  const panelBounds = (await panel(page).boundingBox())!;
  expect(panelBounds.y).toBeGreaterThanOrEqual(headerBounds.y + headerBounds.height - 1);
}

test('the original logo stays centered and clear of controls across the responsive breakpoint', async ({
  page,
}) => {
  for (const width of [1440, 1100, 1099, 390, 320]) {
    await visit(page, '/', width);
    const logo = header(page).locator('.signature-brand .brand img');
    await expect(logo).toBeVisible();
    const source = new URL((await logo.getAttribute('src'))!, page.url());
    expect(source.searchParams.get('url') || source.pathname).toBe(
      '/brand/aliyas-gold-logo-hd.webp',
    );
    await expect
      .poll(() =>
        logo.evaluate((element: HTMLImageElement) => element.complete && element.naturalWidth > 0),
      )
      .toBe(true);
    const box = (await logo.boundingBox())!;
    const headerBounds = (await header(page).boundingBox())!;
    expect(
      Math.abs(box.x + box.width / 2 - (headerBounds.x + headerBounds.width / 2)),
      `logo center at ${width}px`,
    ).toBeLessThanOrEqual(2);
    const collisions = await header(page).evaluate((element) => {
      const brand = element.querySelector('.signature-brand .brand')!;
      const logoBox = brand.getBoundingClientRect();
      return Array.from(element.querySelectorAll<HTMLElement>('a, button'))
        .filter((control) => control !== brand && !brand.contains(control))
        .filter((control) => control.getClientRects().length > 0)
        .filter((control) => {
          const bounds = control.getBoundingClientRect();
          return (
            bounds.left < logoBox.right &&
            bounds.right > logoBox.left &&
            bounds.top < logoBox.bottom &&
            bounds.bottom > logoBox.top
          );
        })
        .map((control) => control.getAttribute('aria-label') || control.textContent?.trim());
    });
    expect(collisions, `logo/control overlap at ${width}px`).toEqual([]);
    const desktop = width >= 1100;
    expect(headerBounds.height).toBe(desktop ? 76 : 60);
    await expect(projectsTrigger(page)).toBeVisible({ visible: desktop });
    await expect(header(page).getByRole('button', { name: 'Open menu' })).toBeVisible({
      visible: !desktop,
    });
    await expect(header(page).getByRole('button', { name: 'Enquire', exact: true })).toBeVisible({
      visible: desktop,
    });
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(
      width + 1,
    );
  }
});

test('desktop disclosures support keyboard activation, Escape focus return, and Tab exit', async ({
  page,
}) => {
  await visit(page);
  const triggers = [
    projectsTrigger(page),
    page.locator('.signature-nav-left').getByRole('button', { name: 'Developers', exact: true }),
    header(page).getByRole('button', { name: 'Search projects', exact: true }),
  ];
  for (const trigger of triggers) {
    await trigger.focus();
    await page.keyboard.press('Enter');
    await expectDisclosure(trigger, page);
    await page.keyboard.press('Escape');
    await expect(panel(page)).not.toBeVisible();
    await expect(trigger).toHaveAttribute('aria-expanded', 'false');
    await expect(trigger).toBeFocused();
  }
  await projectsTrigger(page).click();
  await expect(panel(page).getByRole('heading', { name: 'Find your next address.' })).toBeVisible();
  await panel(page).locator('a[href]:visible, button:visible, input:visible').last().focus();
  await page.keyboard.press('Tab');
  await expect(panel(page)).not.toBeVisible();
  expect(await header(page).evaluate((element) => element.contains(document.activeElement))).toBe(
    false,
  );
});

test('outside clicks dismiss navigation and developer links reset it after navigation', async ({
  page,
}) => {
  await visit(page);
  await projectsTrigger(page).click();
  await expect(panel(page)).toBeVisible();
  const bounds = (await panel(page).boundingBox())!;
  expect(bounds.y + bounds.height).toBeLessThan(980);
  await page.mouse.click(10, 990);
  await expect(panel(page)).not.toBeVisible();
  const developers = page.locator('.signature-nav-left').getByRole('button', {
    name: 'Developers',
    exact: true,
  });
  await developers.click();
  await panel(page).locator('a[href="/developers/emaar"]').click();
  await expect(page).toHaveURL(/\/developers\/emaar$/);
  await expect(page.getByRole('heading', { level: 1 })).toContainText('Emaar Properties');
  await expect(panel(page)).not.toBeVisible();
  await expect(developers).toHaveAttribute('aria-expanded', 'false');
});

test('destination links update the current catalogue route and browser history restores filters', async ({
  page,
}) => {
  await visit(page, '/projects?emirate=Dubai');
  await expectEmirate(page, 'Dubai', 426);
  await projectsTrigger(page).click();
  for (const emirate of ['Dubai', 'Abu Dhabi', 'Ras Al Khaimah']) {
    const card = panel(page).locator('.signature-city-card').filter({ hasText: emirate });
    const destination = new URL((await card.getAttribute('href'))!, page.url());
    expect(destination.pathname).toBe('/projects');
    expect(destination.searchParams.get('emirate')).toBe(emirate);
  }
  await panel(page).locator('.signature-city-card').filter({ hasText: 'Abu Dhabi' }).click();
  await expectEmirate(page, 'Abu Dhabi', 79);
  await expect(page.locator('.catalogue-count')).toContainText('79');
  await projectsTrigger(page).click();
  await panel(page).locator('.signature-city-card').filter({ hasText: 'Ras Al Khaimah' }).click();
  await expectEmirate(page, 'Ras Al Khaimah', 25);
  await expect(page.locator('.catalogue-count')).toContainText('25');
  await page.goBack();
  await expectEmirate(page, 'Abu Dhabi', 79);
  await page.goBack();
  await expectEmirate(page, 'Dubai', 426);
});

test('header search and saved links apply catalogue filters on the same route', async ({
  page,
}) => {
  await visit(page, '/projects?q=Sobha%20Solis');
  await page.getByRole('button', { name: 'Save Sobha Solis', exact: true }).click();
  await header(page).getByRole('button', { name: 'Search projects', exact: true }).click();
  await panel(page)
    .getByRole('searchbox', { name: 'Search projects', exact: true })
    .fill('Sobha Solis');
  await panel(page).getByRole('button', { name: 'Search', exact: true }).click();
  await expect(page).toHaveURL(
    (url) => url.pathname === '/projects' && url.searchParams.get('q') === 'Sobha Solis',
  );
  await expect(panel(page)).not.toBeVisible();
  await expect(page.getByRole('textbox', { name: 'Search projects', exact: true })).toHaveValue(
    'Sobha Solis',
  );
  await expect(page.locator('.project-card')).toHaveCount(1);
  const saved = header(page).getByRole('link', { name: 'Saved projects', exact: true });
  await expect(saved).toHaveAttribute('href', '/projects?saved=1');
  await saved.click();
  await expect(page).toHaveURL(
    (url) => url.pathname === '/projects' && url.searchParams.get('saved') === '1',
  );
  await expect(page.getByRole('textbox', { name: 'Search projects', exact: true })).toHaveValue('');
  await expect(page.getByRole('button', { name: 'Saved (1)', exact: true })).toHaveAttribute(
    'aria-pressed',
    'true',
  );
  await expect(page.locator('.project-card')).toHaveCount(1);
  await expect(page.getByRole('heading', { name: 'Sobha Solis', exact: true })).toBeVisible();
  await page.goBack();
  await expect(page.getByRole('textbox', { name: 'Search projects', exact: true })).toHaveValue(
    'Sobha Solis',
  );
  await expect(page.getByRole('button', { name: 'Saved (1)', exact: true })).toHaveAttribute(
    'aria-pressed',
    'false',
  );
});

test('mobile navigation exposes company links, destinations, search, and advisor access without overflow', async ({
  page,
}) => {
  for (const width of [320, 390]) {
    await visit(page, '/', width, 844);
    const toggle = header(page).getByRole('button', { name: 'Open menu', exact: true });
    await toggle.click();
    const mobile = page.getByRole('navigation', { name: 'Mobile navigation', exact: true });
    await expect(mobile).toBeVisible();
    await expect(mobile.locator('a[href="/journal"]')).toBeVisible();
    await expect(mobile.locator('a[href="/about"]')).toBeVisible();
    await expect(mobile.getByRole('link', { name: 'Talk to an advisor' })).toHaveAttribute(
      'href',
      '/contact',
    );
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(
      width + 1,
    );
    await mobile.getByRole('button', { name: 'Off plan projects', exact: true }).click();
    await expect(panel(page).locator('.signature-city-card')).toHaveCount(7);
    expect(await panel(page).evaluate((element) => element.scrollWidth)).toBeLessThanOrEqual(width);
    await page.keyboard.press('Escape');
    await expect(panel(page)).not.toBeVisible();
    await expect(toggle).toBeFocused();
    const search = header(page).getByRole('button', { name: 'Search projects', exact: true });
    await search.click();
    await expect(panel(page).getByRole('searchbox', { name: 'Search projects' })).toBeFocused();
    await header(page).getByRole('button', { name: 'Close menu', exact: true }).click();
    await expect(panel(page)).not.toBeVisible();
    await expect(search).toBeFocused();
    await toggle.click();
    await page
      .getByRole('navigation', { name: 'Mobile navigation' })
      .getByRole('link', { name: 'Talk to an advisor' })
      .click();
    await expect(page).toHaveURL(/\/contact$/);
    await expect(panel(page)).not.toBeVisible();
    await expect(header(page).getByRole('button', { name: 'Open menu' })).toBeVisible();
  }
});

test('expanded projects, search, and mobile navigation pass focused accessibility checks', async ({
  page,
}) => {
  for (const state of ['projects', 'search', 'mobile'] as const) {
    await visit(page, '/', state === 'mobile' ? 390 : 1440, 1000);
    await (
      state === 'projects'
        ? projectsTrigger(page)
        : header(page).getByRole('button', {
            name: state === 'search' ? 'Search projects' : 'Open menu',
            exact: true,
          })
    ).click();
    await expect(panel(page)).toBeVisible();
    const result = await new AxeBuilder({ page })
      .include('.signature-header')
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze();
    expect(
      result.violations.map((violation) => ({
        rule: violation.id,
        targets: violation.nodes.map((node) => node.target),
      })),
      `${state} navigation accessibility`,
    ).toEqual([]);
  }
});

test('normal-motion navigation remains usable and mobile closing restores page scrolling', async ({
  page,
}) => {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await visit(page);
  await projectsTrigger(page).click();
  await panel(page).locator('.signature-city-card').filter({ hasText: 'Abu Dhabi' }).click();
  await expectEmirate(page, 'Abu Dhabi', 79);
  await visit(page, '/', 390, 844);
  await header(page).getByRole('button', { name: 'Open menu' }).click();
  await expect(page.getByRole('navigation', { name: 'Mobile navigation' })).toBeVisible();
  const initialScroll = await page.evaluate(() => scrollY);
  await page.mouse.move(5, 500);
  await page.mouse.wheel(0, 600);
  // Give wheel inertia time to run before checking that the page stayed locked.
  await page.waitForTimeout(350);
  expect(Math.abs((await page.evaluate(() => scrollY)) - initialScroll)).toBeLessThan(2);
  await header(page).getByRole('button', { name: 'Close menu' }).click();
  await expect(panel(page)).not.toBeVisible();
  await page.mouse.move(195, 500);
  await page.mouse.wheel(0, 600);
  await expect.poll(() => page.evaluate(() => scrollY)).toBeGreaterThan(initialScroll + 100);
  expect(errors).toEqual([]);
});
