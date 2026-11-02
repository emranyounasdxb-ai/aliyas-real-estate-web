import fs from 'node:fs';
import assert from 'node:assert/strict';
import { chromium } from 'playwright';

const [batch, ...slugs] = process.argv.slice(2);
const developer = process.env.PROJECT_RESEARCH_DEVELOPER || 'emaar';
if (!batch || !slugs.length) throw new Error('Usage: check-project-detail-batch.mjs batch slug ...');
const root = 'artifacts/project-details';
const browser = await chromium.launch({ channel: 'msedge' });
const context = await browser.newContext({ reducedMotion: 'reduce' });
const page = await context.newPage();
const errors = [];
page.on('pageerror', error => errors.push(error.message));
const cases = [];
try {
  for (const slug of slugs) {
    await page.goto(`http://127.0.0.1:3000/developers/${developer}/projects/${slug}`);
    await page.locator('.pd-research-table').waitFor();
    for (const theme of ['light', 'dark']) {
      await page.evaluate(value => { document.documentElement.dataset.theme = value; }, theme);
      for (const width of [320, 390, 768, 1024, 1440]) {
        await page.setViewportSize({ width, height: 1000 });
        await page.locator('.pd-research-table').scrollIntoViewIfNeeded();
        const actual = await page.evaluate(() => document.documentElement.scrollWidth);
        cases.push({ slug, theme, width, actual });
        assert.ok(actual <= width, `${slug} ${theme} ${width}: ${actual}`);
        if ([390, 1440].includes(width)) await page.screenshot({ path: `${root}/batch-${batch}-${slug}-${theme}-${width}.png` });
      }
    }
  }
  const summary = page.locator('.pd-research-pending summary');
  await summary.focus();
  await page.keyboard.press('Enter');
  assert.equal(await page.locator('.pd-research-pending').getAttribute('open'), '');
  const name = await page.locator('h1').textContent();
  await page.locator('.pd-enquiry-panel').getByRole('button', { name: 'Enquire now' }).click();
  await page.getByRole('dialog').waitFor();
  assert.ok((await page.getByRole('dialog').locator('textarea').inputValue()).includes(name));
  await page.keyboard.press('Escape');
  await page.getByRole('dialog').waitFor({ state: 'hidden' });
  assert.deepEqual(errors, []);
  fs.writeFileSync(`${root}/layout-batch-${batch}.json`, JSON.stringify({ cases, errors, keyboardDisclosure: true, enquiryOwnership: true, escapeDismissal: true, reducedMotion: 'reduce', submitted: false }, null, 2));
  console.log(`${cases.length} layouts passed; keyboard disclosure, enquiry ownership and Escape passed. No submission.`);
} finally { await browser.close(); }
