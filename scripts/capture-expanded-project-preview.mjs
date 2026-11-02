import { chromium } from '@playwright/test';
import fs from 'node:fs/promises';

const out = 'artifacts/project-expansion';
const browser = await chromium.launch({ channel: 'msedge', headless: true });
const context = await browser.newContext({ reducedMotion: 'reduce' });
const page = await context.newPage();
const errors = [];
page.on('pageerror', (error) => errors.push(error.message));
const views = [];
for (const width of [320, 390, 768, 1024, 1440]) {
  await page.setViewportSize({ width, height: 1000 });
  await page.goto('http://127.0.0.1:3000/developers/emaar');
  await page.locator('.developer-hero-arrows button').last().waitFor();
  await page.evaluate(() => document.fonts.ready);
  await page.waitForFunction(
    () =>
      document.querySelectorAll('.developer-hero-card[aria-hidden="false"]').length ===
      (innerWidth < 768 ? 3 : 7),
  );
  await page
    .locator('.developer-hero-card[aria-hidden="false"] img')
    .evaluateAll((images) => Promise.all(images.map((image) => image.decode().catch(() => {}))));
  for (const theme of ['light', 'dark']) {
    await page.evaluate((theme) => (document.documentElement.dataset.theme = theme), theme);
    await page.waitForTimeout(200);
    const state = await page.evaluate(() => ({
      viewport: innerWidth,
      document: document.documentElement.scrollWidth,
      cards: document.querySelectorAll('.developer-listings .project-card').length,
      hero: document.querySelectorAll('.developer-hero-card').length,
      visible: [...document.querySelectorAll('.developer-hero-card[aria-hidden="false"]')].map(
        (card) => ({
          name: card.querySelector('strong').textContent,
          href: card.querySelector('a').getAttribute('href'),
          imageDecoded: card.querySelector('img').naturalWidth > 0,
        }),
      ),
    }));
    if (
      state.document > width ||
      state.cards !== 108 ||
      state.hero !== 108 ||
      state.visible.some((card) => !card.imageDecoded)
    )
      throw new Error(JSON.stringify(state));
    views.push({ width, theme, ...state });
    await page.screenshot({ path: `${out}/emaar-${width}-${theme}.png` });
  }
}
await page.emulateMedia({ reducedMotion: 'no-preference' });
await page.goto('http://127.0.0.1:3000/developers/emaar');
await page.locator('.developer-hero.is-scroll-pinned').waitFor();
await page.waitForTimeout(400);
await page.evaluate(() => {
  const hero = document.querySelector('.developer-hero');
  const parent = hero.parentElement;
  const header = document.querySelector('.site-header').getBoundingClientRect().height;
  const end =
    parent.getBoundingClientRect().top +
    scrollY -
    header -
    12 +
    parent.getBoundingClientRect().height -
    hero.getBoundingClientRect().height;
  scrollTo({ top: end, behavior: 'instant' });
});
await page.waitForFunction(
  () => document.querySelector('.developer-hero-note>span').textContent.trim() === '102—108 / 108',
);
await page.waitForTimeout(800);
await page
  .locator('.developer-hero-card[aria-hidden="false"] img')
  .evaluateAll((images) => Promise.all(images.map((image) => image.decode().catch(() => {}))));
await page.screenshot({ path: `${out}/emaar-final-projects-1440.png` });
const last = page.locator('.developer-hero-card-link').last();
const finalProject = {
  name: await last.locator('strong').textContent(),
  href: await last.getAttribute('href'),
};
await last.focus();
await page.keyboard.press('Enter');
await page.waitForURL(`**${finalProject.href}`);
if ((await page.locator('h1').textContent()) !== finalProject.name)
  throw new Error('Last project ownership mismatch');
await page.setViewportSize({ width: 390, height: 844 });
await page.evaluate(() => document.fonts.ready);
await page
  .locator('main img')
  .first()
  .evaluate((image) => image.decode().catch(() => {}));
await page.screenshot({ path: `${out}/last-project-mobile.png` });
await fs.writeFile(
  `${out}/visual-verification.json`,
  JSON.stringify({ views, finalProject, errors }, null, 2),
);
await browser.close();
if (errors.length) throw new Error(errors.join('\n'));
console.log('Ten Emaar theme/viewport views and the last owned project captured successfully.');
