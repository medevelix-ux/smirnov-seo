(()=>{'use strict';
const site='https://maximahotels.ru';
const icon=id=>`<svg class="icon" aria-hidden="true"><use href="#i-${id}"/></svg>`;
const hotels=[
 {name:'Максима Заря Отель',short:'Максима Заря',area:'Москва, м. Окружная',stars:'★★★',url:'https://zarya.maximahotels.ru/',img:'assets/images/hotel-zarya.jpg',fallback:'assets/images/hotel-zarya.jpg'},
 {name:'Максима Ирбис Отель',short:'Максима Ирбис',area:'Москва, м. Окружная',stars:'★★★',url:'https://irbis.maximahotels.ru/',img:'assets/images/hotel-irbis.jpg',fallback:'assets/images/hotel-irbis.jpg'},
 {name:'Максима Панорама Отель',short:'Максима Панорама',area:'Москва, м. Автозаводская',stars:'★★★★',url:'https://panorama.maximahotels.ru/',img:'assets/images/hotel-panorama.jpg',fallback:'assets/images/hotel-panorama.jpg'},
 {name:'Максима Славия Отель',short:'Максима Славия',area:'Москва, м. ВДНХ',stars:'★★★',url:'https://slavia.maximahotels.ru/',img:'assets/images/hotel-slavia.jpg',fallback:'assets/images/hotel-slavia.jpg'},
 {name:'Максима Парк Отель',short:'Максима Парк',area:'Московская область, Горки Сухаревские',stars:'★★★',url:'https://park.maximahotels.ru/',img:'assets/images/hotel-park.jpeg'},
 {name:'Максима Домодедово Аэропорт Отель',short:'Максима Домодедово',area:'Домодедово, аэропорт',stars:'★★★★',url:'https://domodedovo.maximahotels.ru/',img:'assets/images/hotel-domodedovo.jpg',fallback:'assets/images/hotel-domodedovo.jpg'},
 {name:'Усадьба Осовец',short:'Усадьба Осовец',area:'Владимирская область, с. Осовец',stars:'',url:'https://osovec.maximahotels.ru/',img:'assets/images/hotel-osovec.jpeg'}
];
const featured=[5,0,1,2,3];
const services=[
 {n:'01',title:'Предпроектный консалтинг',desc:'Создаем прочный фундамент вашего будущего отеля.',icon:'clipboard',url:'/services/predproektnyy-konsalting/'},
 {n:'02',title:'Проектирование / техническое сопровождение',desc:'Воплощаем проект в жизнь, соблюдая стандарты и сроки.',icon:'ruler',url:'/services/proektirovanie-tekhnicheskoe-soprovozhdenie/'},
 {n:'03',title:'Ввод в эксплуатацию',desc:'УК Максима Хотелс предлагает услуги по вводу объектов в эксплуатацию.',icon:'check',url:'/services/vvod-v-ekspluatatsiyu/'},
 {n:'04',title:'Открытие отеля',desc:'Готовим ваш отель к триумфальному открытию и приему первых гостей.',icon:'key',url:'/services/otkrytie-otelya/'},
 {n:'05',title:'Операционное управление',desc:'Берем ваш отель под свое крыло для стабильного роста и процветания.',icon:'chart',url:'/services/operatsionnoe-upravlenie/'},
 {n:'06',title:'Франчайзинг',desc:'Получите проверенную бизнес-модель, поддержку экспертов и узнаваемый бренд.',icon:'star',url:'/services/franchayzing/'}
];
const blog=[
 ['Интересные факты о МГУ','06.05.2026','Главному зданию МГУ уже больше полувека, и за это время вокруг него накопилось много мифов и легенд.','a55','w1g3992g01wekbgcottki7zgci8qdqgn','jpg'],
 ['Достопримечательности Подмосковья','06.05.2026','Более насыщенного историческими и культурными ценностями региона, нежели Московская область, в России нет.','221','1c0h781sq8bjby1nr63sr9wxcyyfxrbq','jpg'],
 ['Куда сходить в Москве в выходные','06.05.2026','В столице, где культурная жизнь кипит не меньше, чем деловая, каждые выходные можно превратить в яркое приключение.','774','54o15nfxoedirdbhevhg6iqhve1i85gs','jpg'],
 ['Достопримечательности Арбата','06.05.2026','Кто не знает, что такое Арбат? Слава этой пешеходной улице идет по всей России.','05f','hgxpkj258d0fmv8it233kyz15a16jony','jpg'],
 ['Самые красивые исторические районы Москвы','06.05.2026','В старых районах Москвы все дышит историей: улицы, площади, бульвары, скверы, здания.','118','13ztuz1pn1hhbedardssbi2j3ioogp8w','jpg'],
 ['День в Парке Горького: чем заняться с детьми, что посмотреть, где перекусить','06.05.2026','Парк Горького — любимое место для прогулок и пикников в центре Москвы.','45f','6bjlx06a58znkzq77qs2tmlvrk2iixhp','jpg'],
 ['Как провести романтический вечер в отеле','06.05.2026','Как организовать свидание в отеле, чтобы оно навсегда осталось в памяти.','614','1n95nggoqrp0cspoc534csnzb5re42sb','jpg'],
 ['Китай-город: достопримечательности','06.05.2026','Китай-город называют историческим и культурным центром столицы.','2b9','yckq0crx13uql81taznfo1myd900jmgw','jpg'],
 ['Достопримечательности Замоскворечья','05.05.2026','Один из самых атмосферных районов старой Москвы.','1cb','78mpxjqn5hcs1pn2y827mr7xtkih0e7r','jpg'],
 ['Как проходит паспортный контроль в аэропорту Домодедово','05.05.2026','Паспортный контроль — обязательная процедура перед регистрацией на рейс.','a62','8iketsp8a55i4j2vj0qiwmlnriwp342v','jpg'],
 ['Рейтинги ресторанов Москвы','05.05.2026','Для вашего удобства мы составили собственный рейтинг лучших ресторанов Москвы.','2c8','p9ilbpk9sc4a27xoxoh9w8e0ozpssyaz','jpeg'],
 ['Что нужно знать при заселении и выселении из отеля?','05.05.2026','Следует знать нюансы, чтобы избежать недоразумений и сделать пребывание комфортным.','682','splwkxig0z8a2p4bfs2izbryq3fcjj7h','jpg'],
 ['Куда сходить в аэропорту Домодедово','05.05.2026','Аэропорт — не просто место, где взлетают и садятся самолеты.','7de','cpboin8hffb9hss6tnves98k4urw9adm','jpg'],
 ['Прогулка по парку Лосиный остров: что обязательно стоит посмотреть?','05.05.2026','Национальный парк Лосиный остров занимает обширную территорию на северо-востоке Москвы.','771','c9auwa8fipc7v1qunb9qoo4keby6q1t4','jpg'],
 ['Лайфхаки для комфортного перелета','05.05.2026','Как подготовиться к полету на самолете и сделать перелет комфортным.','194','p9uwjx4h1nj63mp4s7o95lg59h75ccu4','jpg'],
 ['Где переночевать в Домодедово','05.05.2026','Московский аэропорт Домодедово — один из самых современных в стране.','d6b','oy6l01en801ljw6wxwyp9owjea6fha6p','jpg'],
 ['Легенды Московского Кремля','05.05.2026','Кремль — один из самых загадочных исторических памятников Москвы.','b82','r9jr2cysf8mqk8es2jzg4ai8ob72bheb','jpeg'],
 ['За сколько начинается посадка на самолет','05.05.2026','Во сколько нужно быть в аэропорту, чтобы не опоздать на рейс?','15d','89bjbag7qgrfbzybo1a2v21wzzze1uxn','jpg'],
 ['Что посмотреть в Москве за 1 день','05.05.2026','Москва — крупнейший туристический город России с богатой историей.','e5e','cpm6gx5koksc190961scnip8v32ku3e3','jpg'],
 ['Чем заняться в самолете при долгом перелете','05.05.2026','Во время долгих путешествий на самолете можно довольно быстро заскучать.','bda','1o7evxlk3bjxq23tbosd9743y2d98cbk','jpg'],
 ['Что посмотреть на Патриарших прудах','05.05.2026','История, легенды и интересные факты о Патриарших прудах.','413','r1x2l8kgge7c0v874h2ocphvuvzspawz','jpg'],
 ['Что посмотреть в парке Царицыно','05.05.2026','Живописный парк Царицыно известен ландшафтами и архитектурой.','6d7','e1av44ov0ctscub72hzpqeg0k4z80h6z','jpg'],
 ['Советы по упаковке багажа','05.05.2026','Сборы чемодана в поездку — целая наука.','21b','j6ccv2g4t3uuafcvrkar8oq2l40om5pf','jpg'],
 ['Достопримечательности Московского Кремля','01.05.2026','Жемчужина России и главное украшение столицы — Московский Кремль.','bb0','z30u6y0gm5d9vjiyq4rbvuv6slfzcvqj','jpg'],
 ['Где погулять в Москве в плохую погоду','07.04.2026','Плохая погода не помешает интересно провести время в Москве.','95f','fz9ra3fe2909g1tlsfeshdqsq1dnbr0n','jpg'],
 ['Как выбрать лучшее место в самолете','04.04.2026','Где удобно лететь с детьми, а где спокойно поспать во время перелета.','87b','i1uq3826yymrlhy41sntm4b8c5m5z1iv','jpg'],
 ['Красивые места в Москве ночью','31.03.2026','Ночная Москва меняется и удивляет своей красотой.','4b2','h21tu54iw0vcn0v4sc7igy9hktb9kh00','jpg'],
 ['Развлечения в Москве','31.03.2026','Куда сходить в Москве сегодня, завтра и на выходных?','8d1','sk59yfx95v01f13ta8j1xtbdojdlj89n','jpg','880_586'],
 ['Что посмотреть в Москве за 2 дня','28.02.2026','Москва — самый посещаемый город России с богатой культурой и историей.','29b','50b89quib3i55pvyxewc3p10e8w1p3vo','jpg'],
 ['Что посмотреть в Москве за 3 дня','27.02.2026','Интересные места Москвы для короткой поездки.','0f8','pb4gbnypj9qryblup8k82p96vpd8elk5','jpg'],
 ['Лучшие заповедники в Москве','05.01.2026','Природные места для отдыха и прогулок в Москве.','baf','rzno7w1e1io8xivqhgueahf1a0b6ptpn','jpg'],
 ['Необычные места в Москве','01.08.2025','Творческие пространства, музеи, парки и неожиданные достопримечательности.','6bc','ptqikqw9djundptfc8zyrlkpjheq6tz0','jpg'],
 ['Лучшие отели для отдыха с детьми в Москве','10.07.2025','Путешествие всей семьей требует особого планирования.','22a','cjewv114udbf8qghowvbot3yzlwcdfg2','jpg'],
 ['Парк Зарядье в Москве','10.07.2025','Откройте виды на Москву-реку и Кремль с парящего моста.','e7f','zr6cilsngytauz6zps42uiqv843fm55i','jpg'],
 ['Самый большой океанариум в Москве','05.06.2025','Знакомство с удивительным миром рыб и морских млекопитающих.','2b5','92ngm5dgchzjweri2h8amkkzt8qnv18k','jpg']
];
const blogPaths=["interesnye-fakty-o-mgu", "dostoprimechatelnosti-podmoskovya", "kuda-skhodit-v-moskve-v-vykhodnye", "dostoprimechatelnosti-arbata", "samye-krasivye-istoricheskie-rayony-moskvy", "den-v-parke-gorkogo-chem-zanyatsya-s-detmi-chto-posmotret-gde-perekusit", "kak-provesti-romanticheskiy-vecher-v-otele", "kitay-gorod-dostoprimechatelnosti", "dostoprimechatelnosti-zamoskvorechya", "kak-prokhodit-pasportnyy-kontrol-v-aeroportu-domodedovo", "reytingi-restoranov-moskvy", "chto-nuzhno-znat-pri-zaselenii-i-vyselenii-iz-otelya", "kuda-skhodit-v-aeroportu-domodedovo", "progulka-po-parku-losinyy-ostrov-chto-obyazatelno-stoit-posmotret", "layfkhaki-dlya-komfortnogo-pereleta", "gde-perenochevat-v-domodedovo", "legendy-moskovskogo-kremlya", "za-skolko-nachinaetsya-posadka-na-samolet", "chto-posmotret-v-moskve-za-1-den", "chem-zanyatsya-v-samolete-pri-dolgom-perelete", "chto-posmotret-na-patriarshikh-prudakh", "chto-posmotret-v-parke-tsaritsyno", "sovety-po-upakovke-bagazha", "dostoprimechatelnosti-moskovskogo-kremlya", "gde-pogulyat-v-moskve-v-plokhuyu-pogodu", "kak-vybrat-luchshee-mesto-v-samolete", "krasivye-mesta-v-moskve-nochyu", "razvlecheniya-v-moskve", "chto-posmotret-v-moskve-za-2-dnya-", "chto-posmotret-v-moskve-za-3-dnya-", "luchshie-zapovedniki-v-moskve", "neobychnye-mesta-v-moskve", "luchshie-oteli-dlya-otdykha-s-detmi-v-moskve", "park-zaryade-v-moskve", "samyy-bolshoy-okeanarium-v-moskve"];
const qs=s=>document.querySelector(s),qsa=s=>[...document.querySelectorAll(s)];
const toast=message=>{const el=qs('#toast');el.textContent=message;el.classList.add('show');clearTimeout(window.__toastTimeout);window.__toastTimeout=setTimeout(()=>el.classList.remove('show'),4100)};
// Hotel chooser / selectors
qs('#hotelOptions').innerHTML=hotels.map((h,i)=>`<button type="button" class="hotel-option" data-hotel="${i}"><span class="marker">${icon('hotel')}</span><span><b>${h.name}</b><small>${h.area}</small></span><span class="stars">${h.stars}</span></button>`).join('');
qs('#bookHotel').innerHTML='<option value="" disabled selected>Выберите отель</option>'+hotels.map((h,i)=>`<option value="${i}">${h.name}</option>`).join('');
const chooser=qs('#hotelChooser'),chooseBtn=qs('#chooseBtn'),choosePanel=qs('#choosePanel');
const closeChoose=()=>{choosePanel.classList.remove('open');chooseBtn.setAttribute('aria-expanded','false')};
chooseBtn.addEventListener('click',e=>{e.stopPropagation();let next=!choosePanel.classList.contains('open');choosePanel.classList.toggle('open',next);chooseBtn.setAttribute('aria-expanded',String(next))});
qs('#hotelOptions').addEventListener('click',e=>{let b=e.target.closest('[data-hotel]');if(!b)return;let i=+b.dataset.hotel;qs('#bookHotel').value=i;qsa('.hotel-option').forEach((el,j)=>el.classList.toggle('selected',i===j));closeChoose();toast('Выбран '+hotels[i].name+'. Можно выбрать даты и перейти к бронированию.');document.querySelector('.reservation').scrollIntoView({behavior:'smooth',block:'center'})});
document.addEventListener('click',e=>{if(!chooser.contains(e.target))closeChoose()});
// Slideshow: original site has five photos.
let heroIndex=0,heroTimer;
qs('#heroSlides').innerHTML=featured.map((idx,i)=>{let h=hotels[idx];return `<div class="hero-slide${i===0?' active':''}" data-slide="${i}"><img src="${h.img}" data-fallback="${h.fallback||''}" alt="${h.name}" ${i?'loading="lazy"':'fetchpriority="high"'}></div>`}).join('');
qs('#heroDots').innerHTML=featured.map((_,i)=>`<button class="hero-dot${i===0?' active':''}" aria-label="Слайд ${i+1}" data-slide-to="${i}" aria-current="${i===0?'true':'false'}"></button>`).join('');
const showHero=i=>{heroIndex=(i+featured.length)%featured.length;qsa('.hero-slide').forEach((el,j)=>el.classList.toggle('active',j===heroIndex));qsa('.hero-dot').forEach((el,j)=>{el.classList.toggle('active',j===heroIndex);el.setAttribute('aria-current',j===heroIndex?'true':'false')});qs('#heroCounter').textContent=String(heroIndex+1).padStart(2,'0');qs('#heroName').textContent=hotels[featured[heroIndex]].name};
const restartHero=()=>{clearInterval(heroTimer);if(!matchMedia('(prefers-reduced-motion: reduce)').matches)heroTimer=setInterval(()=>showHero(heroIndex+1),6700)};
qs('#nextHero').addEventListener('click',()=>{showHero(heroIndex+1);restartHero()});qs('#prevHero').addEventListener('click',()=>{showHero(heroIndex-1);restartHero()});qs('#heroDots').addEventListener('click',e=>{let b=e.target.closest('[data-slide-to]');if(b){showHero(+b.dataset.slideTo);restartHero()}});
qs('#heroFrame').addEventListener('mouseenter',()=>clearInterval(heroTimer));qs('#heroFrame').addEventListener('mouseleave',restartHero);restartHero();
qsa('img').forEach(img=>img.addEventListener('error',()=>{if(img.dataset.fallback && !img.dataset.triedFallback){img.dataset.triedFallback='yes';img.src=img.dataset.fallback}else{img.style.display='none'} }));
// Booking interaction: no fake reservation requests.
const dateISO=d=>`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
let now=new Date();const day1=new Date(now.getFullYear(),now.getMonth(),now.getDate()+1),day2=new Date(now.getFullYear(),now.getMonth(),now.getDate()+2);
qs('#checkIn').min=dateISO(now);qs('#checkIn').value=dateISO(day1);qs('#checkOut').value=dateISO(day2);qs('#checkOut').min=dateISO(day2);
qs('#checkIn').addEventListener('change',()=>{const s=qs('#checkIn').value;if(!s)return;const d=new Date(s+'T12:00:00');d.setDate(d.getDate()+1);qs('#checkOut').min=dateISO(d);if(!qs('#checkOut').value||qs('#checkOut').value<dateISO(d))qs('#checkOut').value=dateISO(d)});
qs('#reservationForm').addEventListener('submit',e=>{e.preventDefault();let hotelIndex=qs('#bookHotel').value;if(!hotelIndex){toast('Пожалуйста, выберите отель.');return}if(qs('#checkOut').value<=qs('#checkIn').value){toast('Дата выезда должна быть позже даты заезда.');return}const h=hotels[+hotelIndex];toast('Переход на сайт отеля '+h.short+'. Выбранные даты потребуется указать там повторно.');window.open(h.url,'_blank','noopener,noreferrer')});
qs('#servicesGrid').innerHTML=services.map(s=>`<a class="service-card reveal" href="${site+s.url}" target="_blank" rel="noopener"><div class="service-top"><span class="service-num">${s.n} / УСЛУГА</span><span class="service-icon">${icon(s.icon)}</span></div><h3>${s.title}</h3><p>${s.desc}</p><div class="card-bottom"><span>Подробнее</span><span class="arrow-round">${icon('arrow')}</span></div></a>`).join('');
// Blog cards navigate to the publisher's full blog: article URLs were not guessed.
qs('#articlesTrack').innerHTML=blog.map((a,i)=>{let src=`assets/images/blog-${String(i+1).padStart(2,'0')}.${a[5]}`;const href=`${site}/blog/${blogPaths[i]}/`;return `<article class="article"><a class="article-image" href="${href}" target="_blank" rel="noopener" aria-label="Читать статью: ${a[0]}"><img src="${src}" loading="lazy" alt="${a[0]}"></a><div class="article-body"><span class="article-date">${a[1]}</span><h3><a href="${href}" target="_blank" rel="noopener">${a[0]}</a></h3><p>${a[2]}</p><a class="article-more" href="${href}" target="_blank" rel="noopener">Подробнее ${icon('arrow')}</a></div></article>`}).join('');
let blogIndex=0;const updateBlog=()=>{const track=qs('#articlesTrack'),card=track.querySelector('.article');if(!card)return;const gap=parseFloat(getComputedStyle(track).gap)||0,step=card.getBoundingClientRect().width+gap;const visible=window.innerWidth<=700?1:window.innerWidth<=980?2:3;const last=Math.max(0,blog.length-visible);blogIndex=Math.min(Math.max(blogIndex,0),last);track.style.transform=`translateX(-${Math.round(blogIndex*step)}px)`;qs('#blogPrev').disabled=blogIndex===0;qs('#blogNext').disabled=blogIndex===last;qs('#blogPosition').textContent=String(blogIndex+1).padStart(2,'0');qs('#blogCount').textContent=String(blog.length).padStart(2,'0')};
qs('#blogPrev').addEventListener('click',()=>{blogIndex--;updateBlog()});qs('#blogNext').addEventListener('click',()=>{blogIndex++;updateBlog()});window.addEventListener('resize',updateBlog);updateBlog();
let touchX=0;qs('#blogViewport').addEventListener('touchstart',e=>touchX=e.touches[0].clientX,{passive:true});qs('#blogViewport').addEventListener('touchend',e=>{let dx=e.changedTouches[0].clientX-touchX;if(Math.abs(dx)>45){blogIndex+=dx<0?1:-1;updateBlog()}},{passive:true});
const mobileNav=qs('#mobileNav'),openMob=()=>{mobileNav.classList.add('open');mobileNav.setAttribute('aria-hidden','false');document.body.classList.add('lock')},closeMob=()=>{mobileNav.classList.remove('open');mobileNav.setAttribute('aria-hidden','true');document.body.classList.remove('lock')};
qs('#menuToggle').addEventListener('click',openMob);qs('#mobClose').addEventListener('click',closeMob);mobileNav.addEventListener('click',e=>{if(e.target===mobileNav||e.target.closest('.mob-link'))closeMob()});document.addEventListener('keydown',e=>{if(e.key==='Escape'){closeMob();closeChoose()}if((e.key==='ArrowLeft'||e.key==='ArrowRight')&&document.activeElement.closest?.('#heroFrame')){showHero(heroIndex+(e.key==='ArrowRight'?1:-1));restartHero()}});
const header=qs('#siteHeader'),topBtn=qs('#toTop');window.addEventListener('scroll',()=>{header.classList.toggle('scrolled',scrollY>8);topBtn.classList.toggle('visible',scrollY>630)},{passive:true});topBtn.addEventListener('click',()=>scrollTo({top:0,behavior:'smooth'}));
if('IntersectionObserver' in window){const io=new IntersectionObserver((entries,observer)=>entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add('appear');observer.unobserve(entry.target)}}),{rootMargin:'0px 0px -45px 0px',threshold:.08});qsa('.reveal').forEach(el=>io.observe(el))}else qsa('.reveal').forEach(el=>el.classList.add('appear'));
let cookieOk=false;try{cookieOk=localStorage.getItem('maxima_prototype_cookie')==='yes'}catch{};if(!cookieOk)setTimeout(()=>qs('#cookieBanner').classList.add('show'),1700);
qs('#cookieAccept').addEventListener('click',()=>{qs('#cookieBanner').classList.remove('show');try{localStorage.setItem('maxima_prototype_cookie','yes')}catch{}});
})();
