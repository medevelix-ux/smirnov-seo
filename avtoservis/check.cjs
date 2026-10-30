const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
process.chdir(__dirname);
const read=n=>JSON.parse(fs.readFileSync(`data/${n}.json`,'utf8'));
const brands=read('brands'),models=read('models'),services=read('services'),work=services.filter(s=>s.source_url);
const homeServices=read('home-services'),allWork=[...work,...homeServices];
const groups=read('brand-countries').groups,assigned=groups.flatMap(g=>g.brands),newLogos=read('brand-logos');
assert.equal(assigned.length,brands.length);assert.equal(new Set(assigned).size,brands.length);
for(const b of brands)assert(assigned.includes(b.slug),`Country missing: ${b.slug}`);
for(const asset of Object.values(newLogos)){
 const bytes=fs.readFileSync(asset.path);assert.equal(bytes.subarray(0,8).toString('hex'),'89504e470d0a1a0a',asset.path);
}
assert.equal(new Set(allWork.map(s=>s.source_url)).size,allWork.length);
assert.equal(new Set(allWork.map(s=>s.route_slug)).size,allWork.length);
for(const [label] of Object.values(read('prices')).flat())assert(allWork.some(s=>s.label===label),`No price-list destination: ${label}`);
assert.equal(brands.length,52);assert.equal(models.length,475);assert.equal(work.length,284);
assert.equal(new Set(work.map(s=>s.source_url)).size,284);
assert.equal(new Set(work.map(s=>s.route_slug)).size,284);
assert.equal(new Set(models.map(m=>m.url)).size,475);
assert.equal(services.filter(s=>s.parent_id==='R16').length,20);
for(const s of services){if(s.parent_id)assert(services.some(p=>p.service_id===s.parent_id));}
for(const m of models)assert(brands.some(b=>b.slug===m.brand));
for(const s of work)assert(!models.some(m=>m.slug===s.route_slug));
const source=fs.readFileSync('index.html','utf8').replace(/\/\*[\s\S]*?\*\//g,'').replace(/<!--[\s\S]*?-->/g,'');
const assets=[...new Set([...source.matchAll(/(?:src=\"|url\(['"]?|['"])(img\/[^'"\s)<>]+)/g)].map(m=>m[1]))];
for(const asset of assets)assert(fs.existsSync(decodeURIComponent(asset)),`Missing asset: ${asset}`);
(async()=>{
 const paths=['/','/servis/','/servis/kia/','/servis/kia/rio/','/servis/kia/zamena-masla-v-akpp/','/servis/kia/rio/zamena-masla-v-akpp/','/servis/toyota/','/servis/toyota/camry/',...work.map(s=>s.source_url),...models.map(m=>m.url)];
 paths.push(...homeServices.flatMap(s=>[s.source_url,`/servis/kia/${s.route_slug}/`,`/servis/kia/rio/${s.route_slug}/`]));
 for(const p of paths){const r=await fetch('http://127.0.0.1:4173'+p);assert.equal(r.status,200,p);assert(r.headers.get('x-robots-tag').includes('noindex'));}
 console.log(`OK: ${paths.length} HTTP paths; 52 brands, 475 models, 284 URLs; unique route slugs, parents and ${assets.length} assets.`);
})().catch(e=>{console.error(e);process.exitCode=1;});
