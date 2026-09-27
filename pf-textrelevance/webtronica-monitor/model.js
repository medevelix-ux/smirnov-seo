/* Pure monitoring model. No network requests; all records are demonstration data. */
(function (root) {
  'use strict';
  const DEFAULTS = {enabled:true, top:10, percent:60, priorities:true, drop:3, priorityTop:20, mode:'manual', general:70, width:60, depth:60};
  const clone = value => JSON.parse(JSON.stringify(value));
  const total = r => (r.width + r.depth) / 2;
  function mainQuery(object) {
    if (object.type === 'group' && object.manualMain) return object.queries.find(q => q.id === object.manualMain) || null;
    // Missing frequency on any query makes the maximum unknown. Zero is a valid frequency.
    if (!object.queries.length || object.queries.some(q => q.frequency === null || !Number.isFinite(q.frequency))) return null;
    return object.queries.reduce((a,b) => b.frequency > a.frequency ? b : a);
  }
  function evaluate(object, settings) {
    const count = object.queries.length;
    const inside = object.queries.filter(q => q.position !== null && q.position >= 1 && q.position <= settings.top).length;
    const percent = count ? inside/count*100 : 0;
    const drops = settings.priorities ? object.queries.filter(q => q.priority && q.previous !== null && q.previous >= 1 && q.previous <= settings.priorityTop && (q.position === null || q.position-q.previous >= settings.drop)) : [];
    const groupFailed = count > 0 && percent < settings.percent;
    return {count, inside, percent, drops, groupFailed, violated: settings.enabled && (groupFailed || drops.length>0)};
  }
  function trStatus(object, settings) {
    const result = object.analyses.at(-1);
    if (!result) return 'none';
    return total(result)>=settings.general && result.width>=settings.width && result.depth>=settings.depth ? 'ok' : 'below';
  }
  function eligible(object, context) { return !!(mainQuery(object)?.url && context.engine && context.region); }
  function validate(settings) {
    if (![3,5,10,20,30].includes(settings.top)) return 'Выберите допустимый целевой ТОП.';
    if (![10,20,30].includes(settings.priorityTop)) return 'Выберите диапазон контроля приоритетных запросов.';
    if (!Number.isFinite(settings.percent) || settings.percent<1 || settings.percent>100) return 'Доля запросов должна быть от 1 до 100%.';
    if (!Number.isInteger(settings.drop) || settings.drop<1 || settings.drop>100) return 'Допустимое снижение — целое число от 1 до 100.';
    for (const key of ['general','width','depth']) if (!Number.isFinite(settings[key]) || settings[key]<0 || settings[key]>100) return 'Цели TR должны быть от 0 до 100.';
    if (!['manual','auto'].includes(settings.mode)) return 'Выберите режим запуска TR.';
    return '';
  }
  function initialJobs(state, date) {
    if (!state.settings.enabled || state.initialized) return [];
    state.initialized=true;
    const ids=[];
    for (const o of state.objects) if (eligible(o,state.context) && !o.analyses.length) {o.trState='running'; o.run={kind:'initial',date,engine:state.context.engine,region:state.context.region,query:mainQuery(o).text,url:mainQuery(o).url};ids.push(o.id);}
    return ids;
  }
  function collect(state, date, collectionId) {
    // A collection has exactly one event per object, even when both reasons match.
    if (state.collections.includes(collectionId)) return {events:[],jobs:[]};
    state.collections.push(collectionId);
    state.lastCollection=date;
    const events=[],jobs=[];
    if (!state.settings.enabled) return {events,jobs};
    for (const o of state.objects) {
      const check=evaluate(o,state.settings);
      const reasons=[];
      if(check.groupFailed) reasons.push(`${format(check.percent)}% в ТОП-${state.settings.top}, требуется ≥${state.settings.percent}%`);
      if(check.drops.length) reasons.push(`Приоритетных запросов со снижением ≥${state.settings.drop}: ${check.drops.length}`);
      const row={id:`${collectionId}:${o.id}`,date,percent:check.percent,inside:check.inside,count:check.count,top:state.settings.top,target:state.settings.percent,violated:check.violated,reasons,mode:state.settings.mode,engine:state.context.engine,region:state.context.region,tr:'Не требуется'};
      if(check.violated) {
        const event={id:row.id,objectId:o.id,name:o.name,date,reasons:clone(reasons),read:false};
        events.push(event);state.events.unshift(event);
        o.needsAnalysis=true;
        if (!eligible(o,state.context)) row.tr='Не запущен: не определён Главный запрос';
        else if(state.settings.mode==='auto') {
          const run={kind:'signal',collectionId,date,query:mainQuery(o).text,url:mainQuery(o).url,engine:state.context.engine,region:state.context.region};
          if(o.trState==='running') {o.queue.push(run);row.tr='Автоматический TR в очереди';}
          else {o.trState='running';o.run=run;row.tr='TR запущен автоматически';jobs.push(o.id);}
        } else {row.tr='Требуется ручной анализ TR';if(o.trState==='running')o.pendingManualCollection=true;}
      }
      o.checks.unshift(row);o.lastCheck=date;
    }
    return {events,jobs};
  }
  function finishAnalysis(object,date) {
    const prior=object.analyses.at(-1);
    const n=object.analyses.length;
    const width=prior ? Math.max(0,Math.min(100,prior.width+(n%2===0 ? 4: -2))) : 68;
    const depth=prior ? Math.max(0,Math.min(100,prior.depth+(n%2===0 ? 2: -4))) : 60;
    const run=object.run || {};
    const result={id:`${object.id}-tr-${n+1}`,date,width,depth,query:run.query||mainQuery(object)?.text,url:run.url||mainQuery(object)?.url,engine:run.engine||'Яндекс',region:run.region||'Санкт-Петербург',kind:run.kind||'manual'};
    object.analyses.push(result);
    const check=object.checks.find(c=>c.id===`${run.collectionId}:${object.id}`);
    if(check) {check.tr=`TR: Общая ${total(result)} / Ширина ${width} / Глубина ${depth}`;check.analysisId=result.id;}
    object.needsAnalysis=object.queue.length>0 || !!object.pendingManualCollection;
    object.run=object.queue.shift() || null;
    object.trState=object.run ? 'running':'ready';
    return result;
  }
  function format(n) {return new Intl.NumberFormat('ru-RU',{maximumFractionDigits:1}).format(n);}
  function createDemo(enabled=true) {
    const specs=[
      {id:'gabiony',name:'Габионы',url:'/gabiony/',folder:'Каталог',count:25,inside:13,prefix:'габионы',main:'габионы купить',freq:2400,drop:2,manual:true,values:[[72,62],[69,57]]},
      {id:'zabory',name:'Заборы из габионов',url:'/zabory-iz-gabionov/',folder:'Каталог',count:25,inside:17,prefix:'забор из габионов',main:'забор из габионов купить',freq:1860,drop:0,values:[[74,72],[80,76]]},
      {id:'montazh',name:'Монтаж габионов',url:'/montazh-gabionov/',folder:'Услуги',count:20,inside:13,prefix:'монтаж габионов',main:'монтаж габионов цена',freq:970,drop:1,running:true,values:[[73,69],[76,70]]},
      {id:'setka',name:'Сетка для габионов',url:'/setka/',folder:'Каталог',count:25,inside:13,prefix:'сетка для габионов',main:'сетка для габионов купить',freq:1250,drop:0,values:[[66,60],[62,54]]},
      {id:'kamen',name:'Камень для габионов',url:'/kamen/',folder:'Каталог',count:20,inside:15,prefix:'камень для габионов',main:'камень для габионов купить',freq:880,drop:0,values:[[70,58]]},
      {id:'matrasy',name:'Матрацы Рено',url:'/matrasy-reno/',folder:'Каталог',count:10,inside:4,prefix:'матрацы рено',main:'матрацы рено купить',freq:null,drop:0,values:[]},
      {id:'ungrouped-gabiony',name:'Без группы',type:'ungrouped',url:'/gabiony-spb/',folder:'Без папки',count:10,inside:7,prefix:'габионы спб',main:'габионы купить в спб',freq:560,drop:0,values:[[80,68]]},
      {id:'ungrouped-ustanovka',name:'Без группы',type:'ungrouped',url:'/ustanovka/',folder:'Без папки',count:8,inside:3,prefix:'установка габионов',main:'установка габионов под ключ',freq:null,drop:0,values:[]}
    ];
    const suffixes=['','цена','стоимость','спб','под ключ','от производителя','за м3','в санкт-петербурге','недорого','с доставкой','на заказ','для участка','за метр','из оцинкованной сетки','для дачи','каталог','размеры','расчёт стоимости','с установкой','с камнем','оптом','для ограждения','для подпорной стены','в ленинградской области','купить онлайн'];
    const objects=specs.map(s=>{
      const queries=Array.from({length:s.count},(_,i)=>({id:`${s.id}-q${i}`,text:i===0?s.main:`${s.prefix} ${suffixes[i]}`,frequency:s.freq===null?null:Math.max(0,s.freq-i*37),url:s.url,position:i<s.inside?1+i%10:11+(i-s.inside)*2,previous:i<s.inside?2+i%9:11+(i-s.inside)*2,priority:i===0||i===s.inside||i===s.count-1}));
      for(let j=0;j<s.drop;j++){const q=queries[s.inside+j];q.previous=j===0?7:18;q.position=j===0?11:24;q.priority=true;}
      if(!s.drop) {queries[0].previous=queries[0].position;queries[s.inside].previous=queries[s.inside].position;}
      const analyses=s.values.map((v,i)=>({id:`${s.id}-tr-${i+1}`,date:s.values.length===1?'27.09.2026 08:45':i===0?'25.09.2026 09:04':'26.09.2026 09:06',width:v[0],depth:v[1],query:s.main,url:s.url,engine:'Яндекс',region:'Санкт-Петербург',kind:i===0?'initial':'auto'}));
      return {id:s.id,name:s.name,type:s.type||'group',folder:s.folder,queries,manualMain:s.manual?queries[1].id:null,analyses,checks:[],queue:[],trState:s.running?'running':'ready',run:s.running?{kind:'signal',collectionId:'demo-27',date:'27.09.2026 09:00',query:s.main,url:s.url,engine:'Яндекс',region:'Санкт-Петербург'}:null,needsAnalysis:false,lastCheck:'27.09.2026 09:00'};
    });
    const state={version:1,settings:{...DEFAULTS,enabled},objects,events:[],context:{engine:'Яндекс',region:'Санкт-Петербург'},collections:[],initialized:enabled,lastCollection:'27.09.2026 09:00'};
    if(enabled) {
      for(const o of objects) {
        const check=evaluate(o,state.settings);
        const reasons=[];
        if(check.groupFailed) reasons.push(`${format(check.percent)}% в ТОП-10, требуется ≥60%`);
        if(check.drops.length) reasons.push(`Приоритетных запросов со снижением ≥3: ${check.drops.length}`);
        o.needsAnalysis=check.violated;
        o.checks=[{id:`demo-27:${o.id}`,date:'27.09.2026 09:00',percent:check.percent,inside:check.inside,count:check.count,top:10,target:60,violated:check.violated,reasons,mode:o.run?'auto':'manual',engine:'Яндекс',region:'Санкт-Петербург',tr:o.run?'TR запущен автоматически':check.violated?(mainQuery(o)?'Требуется ручной анализ TR':'Не запущен: не определён Главный запрос'):'Не требуется'}, {id:`demo-26:${o.id}`,date:'26.09.2026 09:00',percent:Math.min(100,check.percent+12),inside:Math.round(check.count*(check.percent+12)/100),count:check.count,top:10,target:60,violated:check.percent+12<60,reasons:[],mode:'manual',engine:'Яндекс',region:'Санкт-Петербург',tr:o.analyses.length>1?'TR завершён':'Анализ не запускался'}];
        const previousCheck=o.checks[1];previousCheck.inside=Math.min(check.count,previousCheck.inside);previousCheck.percent=previousCheck.inside/check.count*100;previousCheck.violated=previousCheck.percent<60;
        if(check.violated) state.events.push({id:`demo-27:${o.id}`,objectId:o.id,name:o.type==='ungrouped'?`Без группы · ${o.queries[0].url}`:o.name,date:'27.09.2026 09:00',reasons,read:false});
      }
      state.collections=['demo-26','demo-27'];
    } else {
      for(const o of objects){o.analyses=[];o.trState='ready';o.run=null;o.needsAnalysis=false;o.lastCheck=null;}
    }
    return state;
  }
  root.MonitorModel={DEFAULTS,clone,total,mainQuery,evaluate,trStatus,eligible,validate,initialJobs,collect,finishAnalysis,format,createDemo};
  if(typeof module!=='undefined')module.exports=root.MonitorModel;
})(typeof window!=='undefined'?window:globalThis);
