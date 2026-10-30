const fs=require('node:fs');
process.chdir(__dirname);
const html=fs.readFileSync('data/avtogermes-source.html','utf8');
const brands=JSON.parse(fs.readFileSync('data/brands.json','utf8'));
const existing=fs.readdirSync('img/logo');
const manifest={};
for(const brand of brands){
 if(existing.some(f=>f.startsWith(brand.slug+'-')&&f.endsWith('.webp')))continue;
 const tag=html.match(new RegExp('<a href="/servis/'+brand.slug+'/"[^>]*>[\\s\\S]*?<img[^>]*src="([^"]+_h60\\.png)"[^>]*>'));
 if(!tag)throw Error('Missing source logo: '+brand.slug);
 manifest[brand.slug]={path:`img/logo/${brand.slug}-avtogermes.png`,source:new URL(tag[1],'https://www.avtogermes.ru').href,sourcePage:'https://www.avtogermes.ru/servis/'};
}
fs.writeFileSync('data/brand-logos.json',JSON.stringify(manifest,null,2));
console.log('New logos:',Object.keys(manifest).length);
