import { test, expect, type Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import approved from '../src/data/approved-developer-network.json' with { type: 'json' };

const alphabetical = [...approved].sort((a, b) =>
  a.name.localeCompare(b.name, 'en', { sensitivity: 'base' }),
);

async function openDevelopers(page: Page, width: number) {
  if (width < 1100) {
    await page.getByRole('button', { name: 'Open menu', exact: true }).click();
    await page
      .getByRole('navigation', { name: 'Mobile navigation', exact: true })
      .getByRole('button', { name: 'Developers', exact: true })
      .click();
  } else {
    await page.locator('.signature-nav-left').getByRole('button', { name: 'Developers' }).click();
  }
  await expect(page.locator('.signature-developer-card')).toHaveCount(approved.length);
  await expect(page.locator('.signature-developer-card').last()).toHaveCSS('opacity', '1');
}

test('every approved developer has equal alphabetical navigation at every breakpoint and theme', async ({
  page,
}) => {
  for (const [width, height] of [
    [320, 568],
    [390, 844],
    [768, 1024],
    [1024, 768],
    [1280, 720],
    [1440, 900],
  ]) {
    await page.setViewportSize({ width, height });
    for (const theme of ['light', 'dark']) {
      await page.goto('/');
      await page.evaluate(
        (value) => document.documentElement.setAttribute('data-theme', value),
        theme,
      );
      await openDevelopers(page, width);
      const cards = page.locator('.signature-developer-card');
      await expect(cards.locator('strong')).toHaveText(
        alphabetical.map((developer) => developer.name),
      );
      expect(
        await cards.evaluateAll((links) => links.map((link) => link.getAttribute('href'))),
      ).toEqual(alphabetical.map((developer) => `/developers/${developer.slug}`));
      expect(
        await cards.evaluateAll((links) => links.map((link) => link.getAttribute('aria-label'))),
      ).toEqual(alphabetical.map((developer) => developer.name));
      const bounds = await cards.evaluateAll((links) =>
        links.map((link) => {
          const name = link.querySelector('strong')!;
          const card = link.getBoundingClientRect();
          const text = name.getBoundingClientRect();
          const logo = link.querySelector('.signature-developer-logo')!.getBoundingClientRect();
          const showsName = getComputedStyle(name).display !== 'none';
          return {
            height: card.height,
            correctMode: showsName === innerWidth >= 900,
            logoInside:
              logo.left >= card.left &&
              logo.right <= card.right &&
              logo.top >= card.top &&
              logo.bottom <= card.bottom,
            correctOrder: !showsName || text.right <= logo.left,
            clipped:
              showsName &&
              (name.scrollWidth > name.clientWidth ||
                text.top < card.top ||
                text.bottom > card.bottom),
            horizontalOverflow: card.right > innerWidth || card.left < 0,
          };
        }),
      );
      expect(new Set(bounds.map((item) => item.height)).size).toBe(1);
      expect(
        bounds.every(
          (item) =>
            item.height >= 44 &&
            item.correctMode &&
            item.correctOrder &&
            item.logoInside &&
            !item.clipped &&
            !item.horizontalOverflow,
        ),
      ).toBe(true);
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
        true,
      );
      if (width >= 1100) await expect(cards.last()).toBeInViewport();
      await cards.nth(approved.length - 2).focus();
      await page.keyboard.press('Tab');
      await expect(cards.last()).toBeFocused();
      await expect(cards.last()).toBeInViewport();
      await expect(cards.last()).toHaveCSS('outline-style', 'solid');
      await page.keyboard.press('Escape');
      await expect(page.locator('.signature-panel')).not.toBeVisible();
      await expect(
        width < 1100
          ? page.getByRole('button', { name: 'Open menu', exact: true })
          : page.locator('.signature-nav-left').getByRole('button', { name: 'Developers' }),
      ).toBeFocused();
    }
  }
});

test('keyboard and native mobile touch can reach the final developer and current page is identified', async ({
  browser,
  baseURL,
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/');
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await openDevelopers(page, 1440);
  const cards = page.locator('.signature-developer-card');
  await cards.first().focus();
  for (let index = 1; index < approved.length; index++) {
    await page.keyboard.press('Tab');
    await expect(cards.nth(index)).toBeFocused();
  }
  await page.keyboard.press('Enter');
  await expect(page).toHaveURL(/\/developers\/wasl$/);
  await expect(page.locator('.signature-panel')).not.toBeVisible();
  await openDevelopers(page, 1440);
  await expect(page.locator('.signature-developer-card[aria-current="page"]')).toHaveText('Wasl');

  const context = await browser.newContext({
    baseURL,
    viewport: { width: 320, height: 568 },
    isMobile: true,
    hasTouch: true,
    reducedMotion: 'reduce',
  });
  const mobile = await context.newPage();
  await mobile.goto('/');
  await openDevelopers(mobile, 320);
  const mobilePanel = mobile.locator('.signature-panel');
  await mobile.locator('.signature-developer-card').last().scrollIntoViewIfNeeded();
  expect(await mobilePanel.evaluate((element) => element.scrollTop)).toBeGreaterThan(100);
  await mobile.locator('.signature-developer-card').last().tap();
  await expect(mobile).toHaveURL(/\/developers\/wasl$/);
  await expect(mobilePanel).not.toBeVisible();
  expect(await mobile.evaluate(() => document.documentElement.style.overflow)).not.toBe('hidden');
  await context.close();
});

test('developer navigation passes accessibility checks in both themes', async ({ page }) => {
  for (const [width, theme] of [
    [1440, 'light'],
    [390, 'dark'],
  ] as const) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto('/');
    await page.evaluate(
      (value) => document.documentElement.setAttribute('data-theme', value),
      theme,
    );
    await openDevelopers(page, width);
    const result = await new AxeBuilder({ page })
      .include('.signature-header')
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze();
    expect(
      result.violations.map((violation) => ({
        rule: violation.id,
        targets: violation.nodes.map((node) => node.target),
      })),
    ).toEqual([]);
  }
});
