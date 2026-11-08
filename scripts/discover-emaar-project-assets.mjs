import fs from 'node:fs/promises';
const [slug, reviewedOfficialUrl]=process.argv.slice(2);
const projects=JSON.parse(await fs.readFile('src/data/developer-projects/emaar.json','utf8')).projects;
const p=projects.find(p=>p.slug===slug);if(!p)throw Error('Unknown Emaar project');
const source=p.research.sources.find(s=>s.id==='official');if(!source?.url.startsWith('https://www.emaar.com/'))throw Error('No official Emaar URL');
const sourceUrl=reviewedOfficialUrl || source.url;
if(!/^https:\/\/www\.emaar\.com\/en\/properties\/[a-z0-9-]+\/?$/.test(sourceUrl))throw Error('Expected an official Emaar property page');
const r=await fetch(sourceUrl);if(!r.ok)throw Error(r.status);const h=await r.text();
if(new URL(r.url).origin!=='https://www.emaar.com')throw Error('Unexpected source redirect');
const heading=h.match(/<h1\b[^>]*>([\s\S]*?)<\/h1>/i)?.[1].replace(/<[^>]+>/g,'').trim();
if(reviewedOfficialUrl && !heading?.toLowerCase().startsWith(p.name.toLowerCase()))throw Error('Updated official page title does not match the project');
const root=`artifacts/project-page-enhancement/${slug}`;await fs.mkdir(root,{recursive:true});await fs.writeFile(`${root}/official.html`,h,'utf8');
const s=[...h.matchAll(/self\.__next_f\.push\(\[1,("(?:[^"\\]|\\.)*")\]\)/g)].map(m=>JSON.parse(m[1])).join('');await fs.writeFile(`${root}/rsc.txt`,s,'utf8');
const found={projectId:p.id,projectName:p.name,sourceUrl,finalUrl:r.url,checkedOn:new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Dubai'}).format(new Date()),gallery:[],map:null};
const seen=new Set();
const target=p.name.toLowerCase();
const withoutAt=name=>name.replace(/\s+at\s+/g,' ');
const matches=name=>typeof name==='string' &&
  (withoutAt(name.toLowerCase())===withoutAt(target) || name.toLowerCase().startsWith(target+' at '));
function visit(v){if(!v||typeof v!=='object')return;if(Array.isArray(v)){for(const x of v)visit(x);return;}if(Array.isArray(v.galleries)&&v.galleries.some(g=>g.key==='ext'))for(const g of v.galleries)for(const image of g.images||[]){if(!seen.has(image.url)){found.gallery.push({group:g.key,...image});seen.add(image.url)}}if((matches(v.name)||matches(v.label))&&v.at&&v.fallback)found.map={publishedName:matches(v.name)?v.name:v.label,pin:v.at,nearby:v.nearby,fallback:v.fallback};for(const x of Object.values(v))visit(x);}
for(const line of s.split('\n')){const idx=line.indexOf(':');try{visit(JSON.parse(line.slice(idx+1)))}catch{}}
await fs.writeFile(`${root}/discovery.json`,JSON.stringify(found,null,2)+'\n','utf8');console.log(JSON.stringify({project:p.name,gallery:found.gallery,map:found.map&&{pin:found.map.pin,fallback:found.map.fallback.url}},null,2));
