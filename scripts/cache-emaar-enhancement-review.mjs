import fs from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {spawnSync} from 'node:child_process';
import sharp from 'sharp';

// Read-only source collection for manual visual review. Never marks a project complete.
const [slug, brochurePageArg, ...options] = process.argv.slice(2);
const officialPlanUrl = options.find(value => value.startsWith('https://'));
const planCacheOption = options.find(value => value.startsWith('--plan-cache='));
const planCacheStem = planCacheOption?.slice('--plan-cache='.length) || `${slug}-floorplans-1`;
const brochureCacheOption = options.find(value => value.startsWith('--brochure-cache='));
const brochureCacheStem = brochureCacheOption?.slice('--brochure-cache='.length) || `${slug}-brochure-0`;
const brochureUrlOption = options.find(value => value.startsWith('--brochure-url='));
const officialBrochureUrl = brochureUrlOption?.slice('--brochure-url='.length);
const mirrorUrlOption = options.find(value => value.startsWith('--broker-brochure-url='));
const brokerBrochureUrl = mirrorUrlOption?.slice('--broker-brochure-url='.length);
if (options.some(value => value !== officialPlanUrl && value !== planCacheOption && value !== brochureCacheOption && value !== brochureUrlOption && value !== mirrorUrlOption)) throw Error('Unknown review option');
if (!planCacheStem.startsWith(`${slug}-`) || !/^[a-z0-9-]+$/.test(planCacheStem)) throw Error('Plan cache must be a project-owned artifact basename');
if (!brochureCacheStem.startsWith(`${slug}-`) || !/^[a-z0-9-]+$/.test(brochureCacheStem)) throw Error('Brochure cache must be a project-owned artifact basename');
if (!slug || !/^\d+$/.test(brochurePageArg || '')) throw Error('Supply project slug and physical brochure connectivity page');
if (officialPlanUrl && !officialPlanUrl.startsWith('https://www.emaar.com/cms-media/')) throw Error('An override must be an independently reviewed official Emaar document URL');
if (officialBrochureUrl && !officialBrochureUrl.startsWith('https://www.emaar.com/cms-media/')) throw Error('A brochure override must be an independently reviewed official Emaar URL');
if (mirrorUrlOption && (officialBrochureUrl || !brochureCacheOption || !brokerBrochureUrl.startsWith('https://'))) throw Error('Supply one HTTPS broker mirror and a separate project-owned cache');
const p = JSON.parse(await fs.readFile('src/data/developer-projects/emaar.json', 'utf8')).projects.find(p => p.slug === slug);
if (!p) throw Error('Unknown protected Emaar project');
const dir = `artifacts/project-page-enhancement/${slug}`;
const d = JSON.parse(await fs.readFile(`${dir}/discovery.json`, 'utf8'));
if (d.projectId !== p.id) throw Error('Discovery ownership mismatch');
const digest = b => createHash('sha256').update(b).digest('hex');
const tiles = [];
for (let i=0; i<d.gallery.length; i++) {
  const g=d.gallery[i], response=await fetch('https://www.emaar.com/cms-media'+g.url);
  if (!response.ok) throw Error(`Image HTTP ${response.status}`);
  const bytes=Buffer.from(await response.arrayBuffer());
  await fs.writeFile(`${dir}/${g.url.split('/').at(-1)}`,bytes);
  tiles.push({input:await sharp(bytes).resize(640,480,{fit:'contain',background:'white'}).png().toBuffer(),left:(i%2)*640,top:Math.floor(i/2)*480});
}
await sharp({create:{width:1280,height:Math.ceil(tiles.length/2)*480,channels:3,background:'white'}}).composite(tiles).png().toFile(`${dir}/gallery-qa.png`);
if(d.map?.fallback) {
  const r=await fetch('https://www.emaar.com/cms-media'+d.map.fallback.url);
  if(!r.ok)throw Error(`Map HTTP ${r.status}`);
  await fs.writeFile(`${dir}/${d.map.fallback.url.split('/').at(-1)}`,Buffer.from(await r.arrayBuffer()));
}
for (const [kind,url,stem] of [['brochure',officialBrochureUrl || brokerBrochureUrl || p.brochureUrl,brochureCacheStem],['plans',officialPlanUrl || p.floorPlanUrl,planCacheStem]]) {
  const r=await fetch(url);if(!r.ok)throw Error(`PDF HTTP ${r.status}`);
  const bytes=Buffer.from(await r.arrayBuffer()),cached=await fs.readFile(`artifacts/project-details/emaar/${stem}.pdf`);
  if(bytes.subarray(0,5).toString()!=='%PDF-' || digest(bytes)!==digest(cached))throw Error(`Changed or invalid source ${kind}; independently review before using old extraction`);
  const sourceHost = new URL(r.url).hostname;
  const hostRole = sourceHost === 'emaar.com' || sourceHost.endsWith('.emaar.com')
    ? 'developer'
    : kind === 'brochure' && brokerBrochureUrl ? 'broker mirror' : 'third-party host';
  await fs.writeFile(`${dir}/source-${kind}-check.json`,JSON.stringify({url,hostRole,status:r.status,checkedOn:new Date().toISOString().slice(0,10),sha256:digest(bytes),cachedOriginalMatches:true},null,2)+'\n','utf8');
}
const textPath = `artifacts/project-details/emaar/${planCacheStem}`;
const extractedText = await fs.readFile(`${textPath}.pages.json`, 'utf8').catch(error => {
  if (error.code !== 'ENOENT') throw error;
  return fs.readFile(`${textPath}.pdfium.json`, 'utf8');
});
const extractedPages = JSON.parse(extractedText);
if (!Array.isArray(extractedPages) || !extractedPages.length || extractedPages.some((page, index) =>
  typeof page !== 'string' && (page?.page !== index + 1 || typeof page.text !== 'string'),
)) {
  throw Error('Expected text for every physical page of the matched plan document');
}
const pages = extractedPages.map(page => typeof page === 'string' ? page : page.text);
const candidatePages=pages.flatMap((text,i)=>/total\s*area/i.test(text.replace(/\s/g,''))?[i+1]:[]);
if(!candidatePages.length)console.warn('No area-heading text candidates detected. Rendering every physical page for manual review; do not infer image-only content or absence of plans.');
const tool=process.env.CODEX_PDFTOPPM || 'pdftoppm';
function render(args){const r=spawnSync(tool,args,{encoding:'utf8'});if(r.status!==0)throw Error(r.stderr || r.error?.message || 'PDF render failed');}
render(['-f',brochurePageArg,'-l',brochurePageArg,'-scale-to','2400','-png','-singlefile',`artifacts/project-details/emaar/${brochureCacheStem}.pdf`,`${dir}/connectivity`]);
// Text extraction can omit a complete image-only residence sheet (Golf Edge p18).
// Render the whole original, including covers/dividers, so review cannot silently omit it.
render(['-f','1','-l',String(pages.length),'-scale-to','2400','-png',`artifacts/project-details/emaar/${planCacheStem}.pdf`,`${dir}/plan`]);
const additionalReviewPages=pages.flatMap((text,i)=>!candidatePages.includes(i+1)?[{page:i+1,textEmpty:!text.trim(),preview:text.slice(0,120)}]:[]);
await fs.writeFile(`${dir}/review-candidates.json`,JSON.stringify({projectId:p.id,brochurePage:Number(brochurePageArg),sourcePageCount:pages.length,candidatePages,additionalReviewPages,warning:'Text candidates are incomplete and are not reviewed or integrated. Inspect every original page, including image-only sheets, plus ownership, all title/area panels and gallery selections manually.'},null,2)+'\n','utf8');
console.log(`${p.name}: ${tiles.length} source images; complete${pages.length}pagePDF rendered, ${candidatePages.length} text candidates. Manual full-document review required.`);
