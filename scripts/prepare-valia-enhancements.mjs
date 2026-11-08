import fs from 'node:fs/promises';
import {createHash} from 'node:crypto';
import sharp from 'sharp';
const project=JSON.parse(await fs.readFile('src/data/developer-projects/emaar.json','utf8')).projects[0];
const root='artifacts/project-page-enhancement/valia';
const output='public/images/projects/emaar/valia';
await fs.mkdir(output,{recursive:true});
const digest=b=>createHash('sha256').update(b).digest('hex');
async function save(name,bytes,ext){const sha256=digest(bytes);const src=`/images/projects/emaar/valia/${name}-${sha256.slice(0,12)}.${ext}`;await fs.writeFile('public'+src,bytes);return {src,sha256,originalBytes:bytes.length};}
const selections=[
['skyline','valia-desk.webp','Creek skyline','Emaar render of Valia above Dubai Creek with the city skyline at sunset','72% 50%'],
['park','PRO_EXT_4_6ebb14a497_prod.jpg','Park and podium','Emaar render of Valia’s landscaped podium and play area','50% 50%'],
['tower','PRO_EXT_3_3aba547efe_prod.jpg','Tower at dusk','Emaar render of Valia’s tower and balconies at dusk','60% 50%'],
['daylight','PRO_EXT_1_d64719e9a4_prod.jpg','Daylight exterior','Emaar render of Valia’s tower overlooking Dubai Creek by day','65% 55%'],
['living','PRO_INT_3_4d6a06b0c5_prod.jpg','Living and dining','Emaar render of Valia’s living and dining space','50% 50%'],
['lobby','PRO_INT_2_ddc1cdfcaf_prod.jpg','Arrival lobby','Emaar render of Valia’s double height arrival lobby','50% 50%'],
['bedroom','PRO_INT_1_4311bf0219_prod.jpg','Bedroom','Emaar render of a Valia bedroom with balcony glazing','50% 50%'],
['family','PRO_INT_4_6862c72fbf_prod.jpg','Family living','Emaar render of Valia’s family living area and open kitchen','50% 50%']];
const images=[];
for(const [name,file,label,alt,position] of selections){const bytes=await fs.readFile(`${root}/${file}`);const m=await sharp(bytes).metadata();const blur=await sharp(bytes).resize({width:20,withoutEnlargement:true}).webp({quality:45}).toBuffer();images.push({...await save(name,bytes,file.endsWith('webp')?'webp':'jpg'),label,alt,position,width:m.width,height:m.height,sourceUrl:`https://www.emaar.com/cms-media/uploads/${file}`,blurDataURL:`data:image/webp;base64,${blur.toString('base64')}`});}
[images[0],images[2]]=[images[2],images[0]];
const owner={projectId:project.id,developerSlug:project.developerSlug,projectSlug:project.slug};
const sourceUrl=project.research.sources.find(s=>s.id==='official').url;
const media={...owner,status:'reviewed',kind:'developer-render',source:{name:'Emaar',url:sourceUrl,checkedOn:'2026-11-04'},use:'Approved local rollout. Original Emaar project renders; no completed-building photography claim.',cardImage:images[0].src,editorialImages:[images[4].src,images[6].src],images};
const mb=await fs.readFile(`${root}/04.-MAP---2400x1600px.jpg`);const mm=await sharp(mb).metadata();
const location={...owner,checkedOn:'2026-11-04',community:'Dubai Creek Harbour',road:'',pin:{latitude:25.1942778,longitude:55.352,sourceUrl,scope:'Developer published project map pin; exact entrance may differ.'},map:{...await save('location',mb,'jpg'),width:mm.width,height:mm.height,sourceUrl:'https://www.emaar.com/cms-media/uploads/04.-MAP---2400x1600px.jpg',scope:'Regional diagram, not to scale; future transport is not operating service.',alt:'Emaar regional diagram locating Dubai Creek Harbour among Dubai’s main districts'},travel:{sourceUrl:project.brochureUrl,page:4,scope:'Community estimates from the Valia brochure connectivity panel, visually checked.',destinations:[{name:'Dubai International Airport',minutes:10},{name:'Burj Khalifa / Downtown Dubai',minutes:15},{name:'Dubai Marina',minutes:25},{name:'Al Maktoum International Airport',minutes:40}]}};
const pages=JSON.parse(await fs.readFile('artifacts/project-details/emaar/valia-floorplans-1.pages.json','utf8'));
const areas=JSON.parse(await fs.readFile('artifacts/project-details/emaar/valia-area-table.json','utf8'));
const pdf=await fs.readFile('artifacts/project-details/emaar/valia-floorplans-1.pdf');const pdfAsset=await save('floor-plans',pdf,'pdf');const plans=[];
for(const a of areas){const title=pages[a.page-1].match(/\d\s*BEDROOM\s*TYPE[\s-]*[A-Z]\d?/)[0];const area=a.lines[0].match(/TOTAL AREA ([\d.]+) SQ.FT/)[1];const original=await fs.readFile(`${root}/plan-${String(a.page).padStart(2,'0')}.png`);const bytes=await sharp(original).webp({lossless:true}).toBuffer();const m=await sharp(bytes).metadata();plans.push({label:`${title.toLowerCase().replace('type-','Type ')} · sheet ${a.page}`,area:`${Number(area).toLocaleString('en-US',{minimumFractionDigits:2,maximumFractionDigits:2})} sq ft total area`,sourceIds:['plans'],sourcePage:a.page,...await save(`plan-page-${a.page}`,bytes,'webp'),width:m.width,height:m.height});}
const floor={...owner,source:{url:project.floorPlanUrl,label:'Emaar: Valia floor plans',reviewedOn:'2026-11-04',pdf:pdfAsset.src,sha256:pdfAsset.sha256},render:{tool:'Poppler pdftoppm, lossless WebP delivery',maxDimension:2400,format:'lossless WebP',scope:'Complete unedited residence sheets; original PDF preserved.'},introduction:'Compare the published apartment layouts. Select a sheet and open the full plan to inspect room dimensions, floor levels and unit references.',selectorLabel:'Choose an apartment layout',note:'Plans and dimensions are approximate and subject to developer revisions. Drawings are not to scale; furniture and finishes shown do not confirm the inclusions of a particular sale.',plans};
for(const [folder,data] of [['project-media/emaar',media],['project-locations',location],['project-floor-plans',floor]]){await fs.mkdir('src/data/'+folder,{recursive:true});await fs.writeFile(`src/data/${folder}/valia.json`,JSON.stringify(data,null,2)+'\n','utf8');}
const queueFile='docs/project-page-enhancement-queue.json';const q=JSON.parse(await fs.readFile(queueFile,'utf8'));Object.assign(q.projects[0],{status:'integrated-awaiting-verification',checkedOn:'2026-11-04',imageCount:images.length,floorPlanSheets:plans.length,sources:[sourceUrl,project.brochureUrl,project.floorPlanUrl],unavailable:[],evidence:`${root}/`});await fs.writeFile(queueFile,JSON.stringify(q,null,2)+'\n','utf8');console.log('Prepared Valia:',images.length,'own renders,',plans.length,'complete plan sheets, sourced pin and 4 travel estimates');
