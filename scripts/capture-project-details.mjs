import fs from 'node:fs';
import { chromium } from 'playwright';

// Read-only source capture; never imports extracted marketing text into site records.
const owner = process.argv[2];
const slugs = process.argv.slice(3);
if (!owner || !slugs.length) throw new Error('Usage: capture-project-details.mjs owner slug [slug ...]');
const records = JSON.parse(fs.readFileSync(`src/data/developer-projects/${owner}.json`, 'utf8')).projects;
const root = `artifacts/project-details/${owner}`;
fs.mkdirSync(root, { recursive: true });
const browser = await chromium.launch({ channel: 'msedge' });
const context = await browser.newContext();
await context.route('**/*', route => ['image', 'media', 'font'].includes(route.request().resourceType()) ? route.abort() : route.continue());
try {
  for (const slug of slugs) {
    const project = records.find(p => p.slug === slug);
    if (!project?.nameSource) throw new Error(`Missing source: ${slug}`);
    const page = await context.newPage();
    try {
      const response = await page.goto(project.nameSource.url, { waitUntil: 'domcontentloaded', timeout: 45000 });
      await page.locator('h1').first().waitFor();
      const capture = await page.evaluate(() => ({
        url: location.href, title: document.title, text: document.body.innerText,
        links: [...document.querySelectorAll('a[href]')].map(a => ({ text: (a.textContent || '').trim(), url: a.href })),
      }));
      capture.status = response?.status();
      capture.checkedOn = new Date().toISOString();
      fs.writeFileSync(`${root}/${slug}.json`, JSON.stringify(capture, null, 2));
      const docs = [...new Map(capture.links.filter(l => /\.pdf(?:$|\?)/i.test(l.url) && /brochure|floor/i.test(l.text)).map(l => [l.url, l])).values()];
      for (const [index, doc] of docs.entries()) {
        const file = `${root}/${slug}-${/floor/i.test(doc.text) ? 'floorplans' : 'brochure'}-${index}.pdf`;
        const result = await fetch(doc.url, { signal: AbortSignal.timeout(60000) });
        const buffer = Buffer.from(await result.arrayBuffer());
        if (!result.ok || buffer.subarray(0, 5).toString() !== '%PDF-') throw new Error(`Document unavailable: ${doc.url}`);
        fs.writeFileSync(file, buffer);
        console.log(`${slug}: ${doc.text}, ${buffer.length} bytes`);
      }
      console.log(`${slug}: ${response?.status()}, ${capture.text.length} characters`);
    } catch (error) { console.error(`${slug}: ${error.message}`); process.exitCode = 1; }
    finally { await page.close(); }
  }
} finally { await browser.close(); }
