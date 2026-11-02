import fs from 'node:fs';
const root = 'artifacts/project-expansion/';
const jobs = [];
for (const file of fs.readdirSync(root).filter(f => /^eagle-maryam-\d+\.json$/.test(f))) {
  const page = JSON.parse(fs.readFileSync(root + file));
  for (const link of page.links.filter(l => /fact.?sheet.*\.pdf/i.test(l.url))) {
    if (!jobs.some(j => j.url === link.url)) jobs.push({id: file.replace('.json', ''), url: link.url, page: page.url});
  }
}
fs.mkdirSync(root + 'pdfs', {recursive: true});
let cursor = 0;
await Promise.all(Array.from({length: 3}, async () => {
  while (cursor < jobs.length) {
    const job = jobs[cursor++];
    try {
      const response = await fetch(job.url, {signal: AbortSignal.timeout(45000)});
      if (!response.ok || !response.headers.get('content-type')?.includes('pdf')) throw new Error(response.status);
      const bytes = Buffer.from(await response.arrayBuffer());
      fs.writeFileSync(`${root}pdfs/${job.id}.pdf`, bytes);
      job.saved = true;
      console.log(job.id, bytes.length);
    } catch (error) {job.error = String(error);}
  }
}));
fs.writeFileSync(root + 'pdfs/index.json', JSON.stringify(jobs, null, 2));
