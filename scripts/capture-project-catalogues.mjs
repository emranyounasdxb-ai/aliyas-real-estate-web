import { chromium } from 'playwright';
import { mkdir, writeFile, readFile } from 'node:fs/promises';
const jobs = JSON.parse(await readFile(process.argv[2], 'utf8'));
const out = 'artifacts/project-expansion';
await mkdir(out, { recursive: true });
const browser = await chromium.launch({ headless: true });
const context = await browser.newContext();
await context.route('**/*', route => ['image', 'media', 'font'].includes(route.request().resourceType()) ? route.abort() : route.continue());
let cursor = 0;
await Promise.all(Array.from({length: 4}, async () => {
  while (cursor < jobs.length) {
    const job = jobs[cursor++];
    const page = await context.newPage();
    try {
      const response = await page.goto(job.url, {waitUntil:'domcontentloaded',timeout:45000});
      await page.waitForTimeout(1500);
      if (job.more) for (let n=0;n<30;n++) {
        const b=page.getByText(job.more,{exact:true}).first();
        if (!await b.isVisible().catch(()=>false)) break;
        await b.click({timeout:4000}).catch(()=>{});
        await page.waitForTimeout(700);
      }
      const data = await page.evaluate(() => ({
        url: location.href, title: document.title, text: document.body.innerText,
        links: [...document.querySelectorAll('a[href]')].map(a=>({text:(a.innerText||a.textContent||'').trim(),url:a.href})),
        headings: [...document.querySelectorAll('h1,h2,h3,h4')].map(h=>({tag:h.tagName,text:h.innerText.trim(),html:h.parentElement.outerHTML.slice(0,3500)})),
      }));
      await writeFile(`${out}/${job.id}.json`, JSON.stringify({...data,status:response?.status(),checkedOn:'2026-10-31'},null,2));
      await writeFile(`${out}/${job.id}.html`,await page.content());
      console.log(`${job.id}: ${response?.status()} ${data.text.length} characters, ${data.links.length} links`);
    } catch(e) { console.log(`${job.id}: ${e.message}`); }
    finally {await page.close();}
  }
}));
await browser.close();
