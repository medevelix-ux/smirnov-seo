const assert=require('node:assert/strict');
const test=require('node:test');
const M=require('./model.js');
test('demo scenarios use exact percentages and independent conditions',()=>{
 const s=M.createDemo();
 const [a,b,c,d]=s.objects.map(o=>M.evaluate(o,s.settings));
 assert.equal(a.percent,52);assert.equal(a.drops.length,2);assert(a.groupFailed);
 assert.equal(b.percent,68);assert(!b.violated);
 assert.equal(c.percent,65);assert(!c.groupFailed);assert.equal(c.drops.length,1);assert(c.violated);
 assert.equal(d.percent,52);assert.equal(d.drops.length,0);assert(d.violated);
});
test('threshold equality is valid; all queries remain in denominator',()=>{
 const s=M.createDemo(),o=s.objects[0];s.settings.percent=52;
 assert(!M.evaluate(o,s.settings).groupFailed);s.settings.priorities=false;
 assert.equal(M.evaluate(o,s.settings).count,25);assert(!M.evaluate(o,s.settings).violated);
});
test('priority boundaries: 5→8, 18→24, 27→31, inclusive top, first sample, not found',()=>{
 const s=M.createDemo(),o=s.objects[0];
 o.queries=[{priority:true,previous:5,position:8},{priority:true,previous:18,position:24},{priority:true,previous:27,position:31},{priority:true,previous:20,position:23},{priority:true,previous:null,position:40},{priority:true,previous:4,position:null}];
 const c=M.evaluate(o,s.settings);assert.equal(c.drops.length,4);assert.equal(c.count,6);assert.equal(c.inside,1);
});
test('manual main remains fixed; auto chooses maximum and permits zero',()=>{
 const s=M.createDemo(),o=s.objects[0];const manual=M.mainQuery(o);o.queries[5].frequency=99999;assert.equal(M.mainQuery(o).id,manual.id);
 o.manualMain=null;assert.equal(M.mainQuery(o).id,o.queries[5].id);
 o.queries.forEach(q=>q.frequency=0);assert.equal(M.mainQuery(o).id,o.queries[0].id);
 o.queries[2].frequency=null;assert.equal(M.mainQuery(o),null);
 o.manualMain=o.queries[1].id;assert.equal(M.mainQuery(o).id,o.queries[1].id);
});
test('ungrouped datasets stay separate and cannot override main manually',()=>{
 const s=M.createDemo();const groups=s.objects.filter(o=>o.type==='ungrouped');assert.equal(groups.length,2);assert.notEqual(groups[0].queries[0].url,groups[1].queries[0].url);
 groups[0].manualMain=groups[0].queries[3].id;assert.equal(M.mainQuery(groups[0]).id,groups[0].queries[0].id);assert.equal(M.mainQuery(groups[1]),null);
});
test('one event per object per collection; new collection repeats violations',()=>{
 const s=M.createDemo();s.events=[];
 const a=M.collect(s,'27.09.2026 09:05','a');assert.equal(a.events.length,5);assert.equal(a.jobs.length,0);
 assert.equal(a.events.filter(e=>e.objectId==='gabiony').length,1);assert.equal(a.events.find(e=>e.objectId==='gabiony').reasons.length,2);
 assert.equal(M.collect(s,'27.09.2026 09:05','a').events.length,0);
 const b=M.collect(s,'27.09.2026 09:06','b');assert.equal(b.events.length,5);assert.equal(s.events.length,10);
});
test('disabled monitor collects without checks, events or TR',()=>{
 const s=M.createDemo();s.settings.enabled=false;const n=s.events.length;const checks=s.objects[0].checks.length;
 assert.deepEqual(M.collect(s,'27.09.2026 10:00','off'),{events:[],jobs:[]});assert.equal(s.events.length,n);assert.equal(s.objects[0].checks.length,checks);assert.equal(s.lastCollection,'27.09.2026 10:00');
});
test('auto schedules only eligible objects, queues repeated collection, no TR events',()=>{
 const s=M.createDemo();s.settings.mode='auto';s.objects.forEach(o=>{o.trState='ready';o.run=null;});
 const a=M.collect(s,'27.09.2026 10:01','auto-1');assert.equal(a.events.length,5);assert.equal(a.jobs.length,3);
 const b=M.collect(s,'27.09.2026 10:02','auto-2');assert.equal(b.events.length,5);assert.equal(b.jobs.length,0);assert.equal(s.objects[0].queue.length,1);
 const count=s.events.length,analyses=s.objects[0].analyses.length;
 M.finishAnalysis(s.objects[0],'27.09.2026 10:03');assert.equal(s.events.length,count);assert.equal(s.objects[0].analyses.length,analyses+1);assert.equal(s.objects[0].trState,'running');
 M.finishAnalysis(s.objects[0],'27.09.2026 10:04');assert.equal(s.objects[0].trState,'ready');assert.equal(s.objects[0].queue.length,0);
});
test('first activation starts every eligible object even in manual mode, once only',()=>{
 const s=M.createDemo(false);assert.equal(M.initialJobs(s,'date').length,0);s.settings.enabled=true;
 const jobs=M.initialJobs(s,'date');assert.equal(jobs.length,6);assert.equal(s.events.length,0);assert.equal(M.initialJobs(s,'date').length,0);
 const o=s.objects[1];M.finishAnalysis(o,'date');assert.equal(o.analyses.length,1);assert.equal(M.total(o.analyses[0]),64);
});
test('TR general is exact mean; all three targets must pass',()=>{
 const s=M.createDemo(),o=s.objects[0];o.analyses=[{width:99,depth:59}];assert.equal(M.total(o.analyses[0]),79);assert.equal(M.trStatus(o,s.settings),'below');
 o.analyses=[{width:80,depth:60}];assert.equal(M.trStatus(o,s.settings),'ok');o.analyses=[];assert.equal(M.trStatus(o,s.settings),'none');
});
test('settings validation rejects missing, nonfinite and out-of-range inputs',()=>{
 assert.equal(M.validate(M.DEFAULTS),'');for(const change of [{percent:0},{percent:101},{percent:NaN},{drop:0},{drop:3.5},{top:7},{priorityTop:5},{width:101},{depth:-1},{general:Infinity}])assert(M.validate({...M.DEFAULTS,...change}));
});
test('semantic edits do not emit events until next collection; empty object is safe',()=>{
 const s=M.createDemo(),n=s.events.length;s.objects[0].queries.pop();M.evaluate(s.objects[0],s.settings);assert.equal(s.events.length,n);
 s.objects[0].queries=[];assert(!M.evaluate(s.objects[0],s.settings).violated);assert.equal(M.mainQuery(s.objects[0]),null);
});
test('a manual-mode violation collected during a running TR still requires a newer analysis',()=>{
 const s=M.createDemo(),o=s.objects[0];o.trState='running';o.run={kind:'manual',collectionId:'demo-27'};
 M.collect(s,'27.09.2026 09:06','new-manual-collection');M.finishAnalysis(o,'27.09.2026 09:07');
 assert.equal(o.trState,'ready');assert.equal(o.needsAnalysis,true);
});
