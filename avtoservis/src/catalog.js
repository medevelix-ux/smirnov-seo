const [brands,models,services,compat,homeServices,faq,countries,logoAssets]=await Promise.all(['brands','models','services','compatibility','home-services','faq','brand-countries','brand-logos'].map(n=>fetch(`/data/${n}.json`).then(r=>{if(!r.ok)throw Error(n);return r.json()})));
const q=(s,r=document)=>r.querySelector(s), all=(s,r=document)=>[...r.querySelectorAll(s)];
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const norm=s=>s.normalize('NFD').replace(/\p{Diacritic}/gu,'').replace(/[‑–]/g,'-').toLowerCase();
const leaves=[...services.filter(s=>s.source_url),...homeServices], cats=services.filter(s=>s.parent_id==='ROOT');
const brandFor=n=>brands.find(b=>norm(b.label)===norm(n));
const logos=Object.fromEntries(brands.map(b=>[b.slug,Object.entries(BRAND_LOGOS).find(([n])=>norm(n)===norm(b.label))?.[1]]));
Object.entries(logoAssets).forEach(([slug,asset])=>logos[slug]=asset.path);
const countryFor=b=>countries.groups.find(g=>g.brands.includes(b.slug));
const countryChips=()=>`<div class="chips brand-country-tabs" role="group" aria-label="Фильтр по стране марки"><button class="chip" data-f="all" aria-pressed="true">Все марки</button>${countries.groups.map(g=>`<button class="chip" data-f="${g.id}" aria-pressed="false">${esc(g.label)}</button>`).join('')}</div><p class="cat-note country-hint">${esc(countries.basis)}</p>`;
function bindCountryFilter(tabs,grid){tabs.addEventListener('click',e=>{const button=e.target.closest('[data-f]');if(!button)return;all('[data-f]',tabs).forEach(b=>b.setAttribute('aria-pressed',b===button));all('[data-c]',grid).forEach(b=>b.hidden=button.dataset.f!=='all'&&b.dataset.c!==button.dataset.f);});}
const brandLink=(b,service=null)=>`<a class="cat-tile" data-c="${countryFor(b).id}" href="${b.url}${service?service.route_slug+'/':''}">${logos[b.slug]?`<img src="${logos[b.slug]}" alt="Логотип ${esc(b.label)}" loading="lazy">`:''}<strong>${esc(b.label)}</strong><span class="cat-note">${service?esc(service.label)+' →':models.filter(m=>m.brand===b.slug).length+' моделей →'}</span></a>`;
if(location.pathname==='/'){
  const grid=q('#brandsGrid');
  q('#brands h2').textContent='Обслуживаем автомобили разных производителей';
  const homeBrands=[...BRANDS.map(([n])=>brandFor(n)).filter(Boolean),...brands.filter(b=>!BRANDS.some(([n])=>norm(n)===norm(b.label)))];
  grid.innerHTML=homeBrands.map(b=>`<a class="brand" data-c="${countryFor(b).id}" href="${b.url}"><span class="blogo has-img"><img src="${logos[b.slug]}" alt="Логотип ${esc(b.label)}" loading="lazy" width="48" height="48"></span><span class="bn">${esc(b.label)}</span><span class="bs">${esc(countryFor(b).country)} →</span></a>`).join('');
  q('#brands .chips').outerHTML=countryChips();
  bindCountryFilter(q('#brands .brand-country-tabs'),grid);
  grid.insertAdjacentHTML('afterend','<p><a class="btn btn-line" href="/servis/">Все марки и модели</a></p>');
  all('[data-brand]').forEach(a=>{const b=brandFor(a.dataset.brand);if(b){a.href=b.url;delete a.dataset.brand;}});
  all('[data-row]').forEach(a=>{const s=leaves.find(s=>norm(s.label)===norm(a.dataset.row));if(s){a.href=s.source_url;delete a.dataset.row;}});
  // The original renderer is also called by category tabs, search and goPrice().
  const originalRenderPrices=renderPrices;
  renderPrices=function(){originalRenderPrices();linkHomePrices();};
  function linkHomePrices(){all('#ptbody .pn').forEach(cell=>{const s=leaves.find(s=>norm(s.label)===norm(cell.textContent));if(s)cell.innerHTML=`<a class="home-service-link" href="${s.source_url}">${esc(s.label)}</a>`;});}
  linkHomePrices();
  // The search input retains its original function reference from index.html.
  q('#psearch').addEventListener('input',linkHomePrices);
}else{
  clearTimeout(timer);
  const pathname=location.pathname.replace(/\/?$/,'/'), parts=pathname.split('/').filter(Boolean);
  const brand=parts[0]==='servis'?brands.find(b=>b.slug===parts[1]):null;
  const model=brand?models.find(m=>m.brand===brand.slug&&m.slug===parts[2]):null;
  const service=parts[0]==='uslugi'?leaves.find(s=>s.source_url===pathname):brand?leaves.find(s=>s.route_slug===parts[model?3:2]):null;
  const valid=pathname==='/servis/'||parts[0]==='uslugi'&&service||brand&&(parts.length===2||model&&parts.length===3||service&&parts.length===(model?4:3));
  const context=[brand?.label,model?.label].filter(Boolean).join(' ');
  const title=!valid?'Страница не найдена':service?`${service.label}${context?' — '+context:''}`:context?`Ремонт и обслуживание ${context}`:'Каталог марок автомобилей';
  const pageType=!valid?'notFound':service?(model?'modelService':brand?'brandService':'service'):model?'model':brand?'brand':'brands';
  const parent=service&&model?model.url:service&&brand?brand.url:model?brand.url:brand?'/servis/':'/';
  window.LFGPage={title,description:title+' в LFG Service. Стоимость и применимость уточняются перед записью.',h1:title,canonical:pathname,indexable:false,pageType,parent};
  document.title=title+' | LFG Service';q('meta[name=description]').content=window.LFGPage.description;
  const canonical=document.createElement('link');canonical.rel='canonical';canonical.href=location.origin+pathname;document.head.append(canonical);
  const about=q('#about'),reviews=q('#reviews'),map=q('footer .map');
  const faqAside=q('#faq .faq-aside').cloneNode(true);
  const messengers=q('#lead .lead-msg').cloneNode(true);
  const advantages=q('.adv',about), heading=q('h2',about);
  q('.adv-visual',about).remove();
  advantages.before(heading);
  about.classList.add('compact-advantages');
  const form=q('#lead form').cloneNode(true);
  all('.cs',form).forEach(el=>el.classList.remove('cs'));
  all('select',form).forEach(el=>{el.removeAttribute('style');el.removeAttribute('aria-hidden');el.removeAttribute('tabindex');});
  all('dialog').forEach(el=>el.remove());
  // Retain the original controls but remove custom-select wrappers and their stale state.
  all('.field.sel',form).forEach(el=>{const old=el.querySelector('select');if(old){const label=el.querySelector('label');label.htmlFor=old.id;el.replaceChildren(label,old);old.className='';}});
  const brandSelect=q('[name=brand]',form),serviceSelect=q('[name=service]',form);
  brandSelect.innerHTML='<option value="">Выберите марку</option>'+brands.map(b=>`<option value="${esc(b.label)}">${esc(b.label)}</option>`).join('');brandSelect.value=brand?.label||'';
  serviceSelect.innerHTML='<option value="">Нужна консультация</option>'+leaves.map(s=>`<option value="${esc(s.label)}">${esc(s.label)}</option>`).join('');serviceSelect.value=service?.label||'';
  form.insertAdjacentHTML('afterbegin',`<p class="cat-context">${esc(context||'Выберите автомобиль')} · демонстрационная заявка</p><div class="field full"><label for="cat-model">Модель, год и коробка передач</label><input id="cat-model" name="configuration" value="${esc(model?.label||'')}" placeholder="Уточните комплектацию"></div>`);
  q('.consent span',form).textContent='Согласен на обработку данных для обращения. Демонстрационный режим: данные не отправляются.';
  form.dataset.kind='Каталог LFG';
  // Bind the cloned form through a detached container using the original validation and phone mask.
  const formHost=document.createElement('div');formHost.append(form);bindForms(formHost);
  form.addEventListener('submit',e=>{e.preventDefault();e.stopImmediatePropagation();const phone=q('[name=phone]',form),consent=q('[name=consent]',form);q('.form-msg',form).textContent=phone.value.replace(/\D/g,'').length!==11?'Введите телефон полностью.':!consent.checked?'Отметьте согласие на обработку данных.':'Демо: заявка проверена, но не отправлена. Свяжитесь с сервисом по телефону.';},true);
  function availability(s){const key=model?.url, cfg={...model,...compat.configurations[key]}, override=compat.overrides[key]?.[s.service_id];if(override)return override;if(!model)return 'unknown';if(cfg.powertrain==='electric'&&new RegExp(compat.electricExclusions,'i').test(s.label))return 'not_applicable';const rules=compat.rules.filter(r=>new RegExp(r.pattern,'i').test(s.label));for(const r of rules){if(!cfg[r.field]||cfg[r.field]==='unknown')return 'unknown';if(cfg[r.field]!==r.value)return 'not_applicable';}return 'unknown';}
  const relevant=leaves.filter(s=>availability(s)!=='not_applicable');
  const url=s=>brand?`${model?.url||brand.url}${s.route_slug}/`:s.source_url;
  const cost=s=>s.price===null?'Уточняйте стоимость':s.price===0?'Бесплатно':'от '+s.price.toLocaleString('ru-RU')+' ₽';
  const book=(s=service)=>`<button class="btn btn-signal btn-sm" data-book="${esc(s?.service_id||'')}">Записаться</button>`;
  const modelList=brand?models.filter(m=>m.brand===brand.slug):[];
  const modelUrl=m=>m.url+(service?service.route_slug+'/':'');
  const crumbs=[['/','Главная'],...(!service||brand?[['/servis/','Марки']]:[]),...(brand?[[brand.url,brand.label]]:[]),...(model?[[model.url,model.label]]:[])];
  let content=`<div class="wrap"><nav class="crumbs" aria-label="Хлебные крошки">${crumbs.map(([u,l])=>`<a href="${u}">${esc(l)}</a>`).join('<span> / </span>')}${service?`<span> / ${esc(service.label)}</span>`:''}</nav><div class="cat-hero"><h1>${esc(title)}</h1><p>Смета до начала работ. Согласуем перечень работ и стоимость после диагностики.</p>${valid?book():`<a class="btn btn-signal" href="/servis/">Перейти в каталог</a>`}</div></div>`;
  if(valid){
    if(!brand&&!service)content+=`<section class="sec"><div class="wrap"><h2>Все 52 марки</h2><div class="cat-grid">${brands.map(b=>brandLink(b)).join('')}</div></div></section>`;
    if(brand&&!model&&!service)content+=`<section class="sec"><div class="wrap"><h2>Модели ${esc(brand.label)}</h2><div class="cat-grid" id="model-grid">${modelList.map((m,i)=>`<a class="cat-tile" href="${modelUrl(m)}" ${i>=8?'hidden':''}><svg viewBox="0 0 800 300" aria-hidden="true"><use href="#car"/></svg><strong>${esc(m.label)}</strong><span class="cat-note">Выбрать модель →</span></a>`).join('')}</div>${modelList.length>8?'<p><button class="btn btn-line" id="models-toggle" aria-expanded="false">Показать все модели</button></p>':''}</div></section>`;
    else if(brand)content+=`<section class="sec"><div class="wrap"><label for="other-model">${model?'Другая модель':'Уточнить модель'}</label><select id="other-model"><option value="${brand.url+(service?service.route_slug+'/':'')}">Все модели ${esc(brand.label)}</option>${modelList.map(m=>`<option value="${modelUrl(m)}" ${m===model?'selected':''}>${esc(m.label)}</option>`).join('')}</select></div></section>`;
    if(service)content+=`<section class="sec"><div class="wrap"><article class="cat-panel"><h2>${esc(service.label)}</h2><p>${esc(context||'Ваш автомобиль')}: перед работой уточним комплектацию и согласуем способ обслуживания.</p><p><strong>${cost(service)}</strong> · Время: ${esc(service.duration||'уточняется')}</p><p class="cat-message">${availability(service)==='not_applicable'?'Работа не применима к выбранной конфигурации. Обратитесь за консультацией.':'Применимость не подтверждена. Укажите год, двигатель и тип коробки передач'+(/АКПП/i.test(service.label)?'; эта работа относится к гидромеханической АКПП.':'.')}</p>${book(service)}</article></div></section>`;
    if(service)content+=`<section class="sec" id="service-brands"><div class="wrap"><h2>${brand?'Эта услуга для других марок':'Выберите марку автомобиля'}</h2><p>${esc(service.label)}: выберите марку, затем уточните модель и комплектацию.</p><div class="cat-grid">${brands.map(b=>brandLink(b,service)).join('')}</div></div></section>`;
    content+=`<section class="sec"><div class="wrap"><div class="cat-panel"><h2>${service?'Другие услуги':'Услуги и стоимость'}</h2><p class="cat-note">Перечень для уточнения у мастера. Наличие услуги в таблице не подтверждает её применимость к комплектации.</p><div class="cat-toolbar"><label for="service-search">Найти услугу</label><input id="service-search" type="search" placeholder="Название услуги"><button class="btn btn-line btn-sm" id="search-reset">Сбросить</button></div><div class="cat-tabs" aria-label="Категории"></div><p id="table-count" aria-live="polite"></p><table class="cat-table"><thead><tr><th>Услуга</th><th>Время</th><th>Стоимость</th><th>Записаться</th></tr></thead><tbody id="service-rows"></tbody></table><p><button class="btn btn-line" id="services-more">Показать ещё</button></p></div></div></section>`;
    if(model&&service)content+=`<section class="sec"><div class="wrap"><h2>Другие работы для ${esc(context)}</h2><div class="cat-related">${relevant.filter(s=>s!==service&&s.category_id===service.category_id).slice(0,8).map(s=>`<a href="${url(s)}">${esc(s.label)}</a>`).join('')}</div></div></section>`;
    const feature=service?`${service.label}: состав операции, расходные материалы и способ выполнения согласуем после уточнения автомобиля. ${/АКПП/i.test(service.label)?'Нужно определить тип коробки и подходящую жидкость; для механики, вариатора и робота требуется другая услуга.':''}`:model?`Для ${context} уточним год выпуска, двигатель и коробку передач. По одному названию модели нельзя определить регламент, тип привода ГРМ и совместимость всех работ.`:brand?`Каталог ${context} объединяет разные модели и комплектации. Выберите модель; расходники и работы согласуем по данным автомобиля.`:'Выберите марку и модель. Справочник не содержит проверенной базы комплектаций: перечень работ нужно согласовать с мастером.';
    content+=`<section class="sec"><div class="wrap"><h2>Особенности обслуживания${context?' '+esc(context):''}</h2><p>${esc(feature)}</p></div></section><section class="sec" id="booking"><div class="wrap"><h2>Запишитесь на ремонт или диагностику</h2><div class="cat-book"></div></div></section><div id="shared-blocks"></div><section class="sec"><div class="wrap"><h2>Частые вопросы</h2><details><summary>${service?`Подходит ли «${esc(service.label)}» для ${esc(context||'моего автомобиля')}?`:model?`Какие данные нужны для обслуживания ${esc(context)}?`:`Как записать ${esc(context||'автомобиль')} на обслуживание?`}</summary><p>${esc(feature)}</p></details><details><summary>Как узнать стоимость${service?' этой работы':''}?</summary><p>Указаны только цены из прайса LFG. Если цены нет, мастер уточнит стоимость после согласования работ${model?' для '+esc(context):''}.</p></details><details><summary>Отправляется ли заявка из прототипа?</summary><p>Нет. Форма демонстрирует выбор автомобиля и услуги. Для реальной записи позвоните <a href="tel:+79045678871">+7 (904) 567-88-71</a>.</p></details></div></section>`;
  }
  const main=q('main');main.className='catalog';main.innerHTML=content;
  all('.cat-grid',main).filter(grid=>q('[data-c]',grid)).forEach(grid=>{
    grid.insertAdjacentHTML('beforebegin',countryChips());
    bindCountryFilter(q('.brand-country-tabs',grid.parentElement),grid);
  });
  const specificFaq=brand?.slug==='kia'?(model?.slug==='rio'?faq['kia/rio']:!model?faq.kia:null):null;
  if(valid&&specificFaq){
    const faqSection=main.lastElementChild;faqSection.id='catalog-faq';
    const faqWrap=q('.wrap',faqSection);
    if(!service)all('details',faqWrap).forEach(d=>d.remove());
    faqWrap.insertAdjacentHTML('beforeend',specificFaq.map(([question,answer])=>`<details><summary>${esc(question)}</summary><p>${esc(answer)}</p></details>`).join(''));
  }
  document.documentElement.classList.remove('catalog-loading');
  if(valid){
    const faqSection=main.lastElementChild;faqSection.id='catalog-faq';
    const faqWrap=q('.wrap',faqSection),faqList=document.createElement('div');
    faqList.className='faq';
    all('details',faqWrap).forEach(detail=>{
      const summary=q('summary',detail),answer=q('p',detail);
      summary.insertAdjacentHTML('beforeend','<span class="pm" aria-hidden="true"></span>');
      if(answer)answer.classList.add('ans');
      faqList.append(detail);
    });
    faqWrap.classList.add('faq-layout');faqWrap.replaceChildren(faqAside,faqList);
    const contact=q('.map-card',map),locationPanel=document.createElement('div');
    locationPanel.className='cat-location';
    q('[data-open="callback"]',contact)?.remove();
    contact.append(messengers);
    locationPanel.append(map,contact);
    q('.cat-book').append(locationPanel,form);
    q('#shared-blocks').append(about,reviews);
  }
  else map.remove();
  all('[data-brand]').forEach(a=>{const b=brandFor(a.dataset.brand);if(b){a.href=b.url;delete a.dataset.brand;}});
  all('a[href^="#"]').forEach(a=>{const h=a.getAttribute('href');if(h==='#top'){a.href='/';return;}if(h==='#'){a.removeAttribute('href');return;}if(!q(h)){a.href='/'+h;['row','brand','filter'].forEach(k=>delete a.dataset[k]);}});
  const routeLink=q('.map-card .btns a');if(routeLink)routeLink.href='https://yandex.ru/maps/?rtext=~'+encodeURIComponent('Московская область, деревня Верея, Островецкое шоссе, 17')+'&rtt=auto';
  all('a[href="tel:+74950000000"]').forEach(a=>a.remove());
  document.addEventListener('click',e=>{const b=e.target.closest('[data-book],[data-open="callback"],[data-svc-open]');if(!b||!valid)return;e.preventDefault();e.stopImmediatePropagation();closeDrawer();const s=leaves.find(s=>s.service_id===b.dataset.book);if(s)serviceSelect.value=s.label;form.dataset.kind=b.dataset.open?'Обратный звонок':'Каталог LFG';q('#booking').scrollIntoView({behavior:'smooth'});},true);
  q('#models-toggle')?.addEventListener('click',e=>{const expand=e.target.getAttribute('aria-expanded')!=='true';all('#model-grid a').forEach((a,i)=>a.hidden=!expand&&i>=8);e.target.setAttribute('aria-expanded',expand);e.target.textContent=expand?'Скрыть':'Показать все модели';});
  q('#other-model')?.addEventListener('change',e=>location.assign(e.target.value));
  let category=service?.category_id||'all',limit=20;
  function renderTable(){const search=q('#service-search').value.trim().toLowerCase();const filtered=relevant.filter(s=>s!==service&&(search?s.label.toLowerCase().includes(search):category==='all'||s.category_id===category));q('#table-count').textContent=`Найдено: ${filtered.length}`;q('.cat-tabs').innerHTML=[{service_id:'all',label:'Все услуги'},...cats].map(c=>`<button data-category="${c.service_id}" aria-pressed="${!search&&c.service_id===category}">${esc(c.label)}</button>`).join('');q('#service-rows').innerHTML=filtered.length?filtered.slice(0,limit).map(s=>`<tr><td><a href="${url(s)}">${esc(s.label)}</a><span class="cat-note">${availability(s)==='available'?'Применимость подтверждена':'Уточните комплектацию'}</span></td><td data-label="Время">${esc(s.duration||'—')}</td><td data-label="Стоимость">${cost(s)}</td><td>${book(s)}</td></tr>`).join(''):'<tr><td colspan="4">Ничего не найдено</td></tr>';q('#services-more').hidden=filtered.length<=limit;}
  if(valid){q('.cat-tabs').addEventListener('click',e=>{const b=e.target.closest('[data-category]');if(b){category=b.dataset.category;q('#service-search').value='';limit=20;renderTable();}});q('#service-search').addEventListener('input',()=>{limit=20;renderTable();});q('#search-reset').addEventListener('click',()=>{q('#service-search').value='';category='all';limit=20;renderTable();});q('#services-more').addEventListener('click',()=>{limit+=20;renderTable();});renderTable();}
}
