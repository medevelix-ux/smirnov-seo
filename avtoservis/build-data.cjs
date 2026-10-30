const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');
process.chdir(__dirname);
function csv(file) {
  const text = fs.readFileSync(file,'utf8').replace(/^\uFEFF/,'');
  const rows=[]; let row=[], cell='', quoted=false;
  for(let i=0;i<text.length;i++) { const c=text[i];
    if(c==='"') { if(quoted && text[i+1]==='"'){cell+='"';i++;}else quoted=!quoted; }
    else if(c===','&&!quoted){row.push(cell);cell='';}
    else if(c==='\n'&&!quoted){row.push(cell.replace(/\r$/,''));rows.push(row);row=[];cell='';}
    else cell+=c;
  }
  if(cell||row.length){row.push(cell.replace(/\r$/,''));rows.push(row);}
  const head=rows.shift(); return rows.filter(r=>r.some(Boolean)).map(r=>Object.fromEntries(head.map((h,i)=>[h,r[i]||''])));
}
const models=csv('Марки_и_модели_LFG_черновой_справочник.csv').map(r=>({...r,brand:r.Код_марки,label:r.Модель,slug:r.Код_модели,url:r.URL_модели,powertrain:'unknown',transmission:'unknown',drive:'unknown'}));
const brands=[...new Set(models.map(m=>m.brand))].map(slug=>({slug,label:models.find(m=>m.brand===slug).Марка,url:`/servis/${slug}/`}));
const html=fs.readFileSync('index.html','utf8');
const prices=vm.runInNewContext('('+html.match(/const PRICES = (\{[\s\S]*?\n\});/)[1]+')');
const exact=new Map(Object.values(prices).flat().map(([label,duration,price])=>[label,{duration,price}]));
const rows=csv('Копия Структура каталога услуг - Автосервис - Дерево сайта.csv');
rows.push({ID:'R16','Parent ID':'ROOT','Раздел или страница':'Дополнительные услуги и оборудование',URL:'',Тип:'Раздел'});
const byId=new Map(rows.map(r=>[r.ID,r]));
const services=rows.map((r,order)=>{let parent=r,seen=new Set();while(parent['Parent ID']&&parent['Parent ID']!=='ROOT'){if(seen.has(parent.ID))throw Error('Cycle');seen.add(parent.ID);parent=byId.get(parent['Parent ID']);if(!parent)throw Error('Missing parent');}const label=r['Раздел или страница'].trim();return {...r,service_id:r.ID,label,slug:r.URL.split('/').filter(Boolean).at(-1)||null,source_url:r.URL,category_id:parent.ID,parent_id:r['Parent ID'],order,price:exact.get(label)?.price??null,duration:exact.get(label)?.duration??null,availability:'unknown',aliases:[]};});
function unique(a){if(new Set(a).size!==a.length)throw Error('Duplicate URL');}
const usedSlugs=new Set(models.map(m=>m.slug));
for(const s of services.filter(s=>s.source_url)){
  s.route_slug=usedSlugs.has(s.slug)?`${s.slug}-${s.service_id.toLowerCase()}`:s.slug;
  usedSlugs.add(s.route_slug);
}
unique(models.map(m=>m.url));unique(services.filter(s=>s.source_url).map(s=>s.source_url));
fs.mkdirSync('data',{recursive:true});
// Services present in the original price list but absent by exact label in CSV.
const translit={'а':'a','б':'b','в':'v','г':'g','д':'d','е':'e','ё':'e','ж':'zh','з':'z','и':'i','й':'y','к':'k','л':'l','м':'m','н':'n','о':'o','п':'p','р':'r','с':'s','т':'t','у':'u','ф':'f','х':'h','ц':'ts','ч':'ch','ш':'sh','щ':'sch','ъ':'','ы':'y','ь':'','э':'e','ю':'yu','я':'ya'};
const homeServices=Object.entries(prices).flatMap(([category,items])=>items.filter(([label])=>!services.some(s=>s.label===label&&s.source_url)).map(([label,duration,price])=>{
  const slug=label==='Плановое ТО автомобиля'?'planovoe-to':Array.from(label.toLowerCase()).map(c=>translit[c]??c).join('').replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
  const categoryLabel={'Техническое обслуживание':'Техническое обслуживание','Диагностика':'Диагностика автомобиля'}[category];
  const category_id=services.find(s=>s.parent_id==='ROOT'&&s.label===categoryLabel)?.service_id||'R16';
  const route_slug=usedSlugs.has(slug)?slug+'-lfg':slug;usedSlugs.add(route_slug);
  return {service_id:'LFG-'+slug,label,slug,route_slug,source_url:`/uslugi/lfg/${route_slug}/`,category_id,parent_id:category_id,price,duration,availability:'unknown',aliases:[],source:'Прайс исходной главной LFG'};
}));
fs.writeFileSync('data/home-services.json',JSON.stringify(homeServices,null,2));
for(const [name,value] of Object.entries({brands,models,services,prices}))fs.writeFileSync(path.join('data',name+'.json'),JSON.stringify(value,null,2));
console.log({brands:brands.length,models:models.length,urls:services.filter(s=>s.source_url).length,r16:services.filter(s=>s.parent_id==='R16').length});
