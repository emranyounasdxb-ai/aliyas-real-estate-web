import {chromium} from 'playwright';
import {writeFile} from 'node:fs/promises';
const browser=await chromium.launch();
const context=await browser.newContext();
await context.route('**/*',r=>['image','media','font'].includes(r.request().resourceType())?r.abort():r.continue());
await Promise.all(['emaar','aldar'].map(async owner=>{
 const page=await context.newPage();
 const url=owner==='emaar'?'https://www.emaar.com/en/latest-launches':'https://www.aldar.com/properties/en/communities';
 try {
 await page.goto(url,{waitUntil:'domcontentloaded',timeout:60000});
 await page.waitForTimeout(2000);
 if(owner==='emaar'){
   await page.getByTestId('latest-launches-tab').filter({hasText:'Now Available'}).click({force:true});
   for(let n=0;n<10;n++){
     const more=page.getByTestId('latest-launches-show-more');
     if(!await more.isVisible())break;
     await more.click({force:true});await page.waitForTimeout(500);
   }
   const entries=await page.locator('[data-testid="latest-launches-project-card-title-link"]').evaluateAll(nodes=>nodes.map(a=>({name:a.textContent.trim(),url:a.href.split('?')[0],evidence:'Present in official latest-launches catalogue.'})));
   await writeFile('artifacts/project-expansion/emaar-all.json',JSON.stringify(entries,null,2));
   console.log('emaar',entries.length);
 } else {
   const entries=[];
   for(let n=0;n<20;n++){
     entries.push(...await page.locator('a[href*="/properties/en/"]').evaluateAll(nodes=>nodes.filter(a=>/Under Construction|Completed|Ready|Completion Date/.test(a.innerText)).map(a=>({name:a.innerText.split('\n')[0],url:a.href,evidence:a.innerText}))));
     const next=page.getByRole('button',{name:'Go to next page'});
     if(!await next.isEnabled())break;
     const firstUrl=await page.locator('a[href*="/properties/en/"]').evaluateAll(nodes=>nodes.find(a=>/Completion Date/.test(a.innerText))?.href);
     await next.click({force:true});
     await page.waitForFunction(previous=>[...document.querySelectorAll('a[href*="/properties/en/"]')].find(a=>/Completion Date/.test(a.innerText))?.href!==previous,firstUrl,{timeout:30000});
     await page.waitForTimeout(500);
   }
   await writeFile('artifacts/project-expansion/aldar-all.json',JSON.stringify(entries,null,2));
   console.log('aldar',entries.length);
 }
 }catch(e){console.log(owner,e.message);}finally{await page.close();}
}));
await browser.close();
