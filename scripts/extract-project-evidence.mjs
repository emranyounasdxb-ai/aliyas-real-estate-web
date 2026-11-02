import fs from 'node:fs';
import {chromium} from 'playwright';
const browser=await chromium.launch();const page=await browser.newPage();await page.route('**/*',r=>r.abort());
const findings=[];
for(const file of fs.readdirSync('artifacts/project-expansion').filter(f=>f.endsWith('.html'))){
 const html=fs.readFileSync(`artifacts/project-expansion/${file}`,'utf8').replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi,'').replace(/<iframe\b[^>]*>[\s\S]*?<\/iframe>/gi,'');
 await page.setContent(html,{waitUntil:'domcontentloaded',timeout:10000});
 const evidence=await page.evaluate(()=>{
   document.querySelectorAll('script,style,noscript,header,footer,nav').forEach(n=>n.remove());
   const text=document.body.textContent.replace(/\s+/g,' ').trim();
   return {text,dates:[...text.matchAll(/.{0,70}(?:handover|completion|construction|completed|202[7-9]|203[0-9]).{0,140}/gi)].map(m=>m[0])};
 });
 findings.push({file,...evidence});
 if(findings.length%50===0)console.log('Extracted',findings.length);
}
fs.writeFileSync('artifacts/project-expansion/evidence-extracts.json',JSON.stringify(findings,null,2));
await browser.close();console.log('Extracted',findings.length);
