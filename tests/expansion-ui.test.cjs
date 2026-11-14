// Optional DOM integration test. Install jsdom or set SELFCARE_JSDOM_MODULE.
const {JSDOM,VirtualConsole}=require(process.env.SELFCARE_JSDOM_MODULE || 'jsdom');
const fs=require('fs'),assert=require('node:assert/strict');
const errors=[];const vc=new VirtualConsole();vc.on('jsdomError',e=>{if(!/Not implemented.*(canvas|navigation)/i.test(e.message))errors.push(e.message)});
const dom=new JSDOM(fs.readFileSync('index.html','utf8'),{url:'https://dnsmaur1992.github.io/Selfcare-Studio/',runScripts:'dangerously',virtualConsole:vc,beforeParse(w){w.scrollTo=()=>{};w.matchMedia=()=>({matches:false,addEventListener(){}});w.requestAnimationFrame=()=>1;w.setInterval=()=>1;w.setTimeout=()=>1;w.MutationObserver=class{observe(){}};w.URL.createObjectURL=()=> 'blob:test';w.Audio=class{setAttribute(){} play(){return Promise.resolve()}pause(){}};w.SpeechSynthesisUtterance=class{constructor(text){this.text=text}};w.speechSynthesis={cancel(){},speak(){}};}});
const w=dom.window,d=w.document,ev=s=>w.eval(s),click=sel=>{const el=d.querySelector(sel);assert(el,'Missing '+sel);el.click()},input=(sel,val)=>{const el=d.querySelector(sel);assert(el,'Missing input '+sel);el.value=val;el.dispatchEvent(new w.Event('input',{bubbles:true}));};
ev("S.setup=true;S.ack='2026-11-01';S.newsSeen=NEWS.v;S.days=tmplDays(3);S.weeks={};U.view='home';render();");
// Calendar arrows and future planning through real click handlers.
const currentPlan=ev('JSON.stringify(thisWeek())');
for(let i=0;i<7;i++)click('[data-a="weeknext"]');assert.equal(ev('U.weekOffset'),5);assert(d.querySelector('[data-a="weeknext"]').disabled);
click('[data-a="add-slot"][data-wd="2"]');click('[data-a="addtype"][data-t="mobility"]');
const futureSlot=ev('calendarWeek().slots.at(-1).id');click('[data-a="slot"][data-s="'+futureSlot+'"]');
assert(!d.querySelector('#sheet [data-a="start"]'));click('[data-a="move"][data-s="'+futureSlot+'"][data-w="4"]');assert.equal(ev('calendarWeek().slots.at(-1).wd'),4);
click('[data-a="weeknow"]');assert.equal(ev('JSON.stringify(thisWeek())'),currentPlan);
for(let i=0;i<7;i++)click('[data-a="weekprev"]');assert.equal(ev('U.weekOffset'),-5);assert(d.querySelector('[data-a="weekprev"]').disabled);assert(!d.querySelector('[data-a="add-slot"]'));
click('[data-a="weeknow"]');assert.equal(ev('U.weekOffset'),0);
// Merge next week's units through the dialog and check isolation/persistence.
const beforeMerge=ev('JSON.stringify(thisWeek())');
click('[data-a="weeknext"]');click('[data-a="less"]');assert(d.body.textContent.includes('Die Änderung gilt nur für diese Woche'));
click('[data-a="lesspick"][data-p="1"]');assert.equal(ev("calendarWeek().slots.filter(s=>s.type==='kraft').length"),1);
assert.equal(ev('JSON.stringify(thisWeek())'),beforeMerge);
click('[data-a="weeknow"]');click('[data-a="weeknext"]');assert.equal(ev("calendarWeek().slots.find(s=>s.type==='kraft').name"),'Ganzkörper kompakt');
click('[data-a="weeknow"]');
// With only one studio the picker is hidden on home (4.3.1); profiles are created under Profil → Studio-Profile.
assert(!d.querySelector('#app [data-a="studios"]'),'single studio: no picker on home');
ev("U.psec=null;go('prof')");
click('[data-a="studios"]');input('#newstudio','Zuhause');click('[data-a="studioadd"][data-copy="0"]');assert.equal(ev('studioName()'),'Zuhause');assert.equal(ev('S.equip.hack'),false);
const main=ev('S.studios[0].id');click('[data-a="studioselect"][data-id="'+main+'"]');assert.equal(ev('studioName()'),'Mein Studio');
ev("startSetup(thisWeek().slots.find(s=>s.type==='kraft').id)");click('[data-a="timebudget"][data-v="30"]');assert(ev('setupTimePlan(setupRawItems()).minutes<=30'));click('[data-a="go-train"]');assert(ev('!!S.active'));
ev("goStep(S.active.steps.findIndex(q=>q.k==='item'));itemById(curStep().id).confirmed=true;itemById(curStep().id).warmAsk=false;S.active.ph='sets';render();");
input('#sw','40');input('#sr','12');click('[data-a="setdone"]');const done=ev('S.active.items.reduce((n,it)=>n+doneWork(it).length,0)');
click('[data-a="tr-menu"]');click('[data-a="remainingopen"]');click('[data-a="remainingapply"]');assert.equal(ev('S.active.items.reduce((n,it)=>n+doneWork(it).length,0)'),done);
ev("finishSession();U.hist='list';go('hist');");click('[data-a="sessionedit"]');input('[data-in="sessionlog"][data-k="w"]','42,5');click('[data-a="sessionsave"]');assert.equal(ev('S.sessions.at(-1).items.find(it=>it.log.some(l=>l.done&&!l.warm)).log.find(l=>!l.warm).w'),'42,5');
click('[data-a="histt"][data-t="review"]');assert(d.body.textContent.includes('Deine letzten'));assert.equal(errors.length,0,errors.join('\n'));
console.log('DOM integration passed: week navigation limits/reset, future add/move/merge, studio creation/switch, time budget, logged set, remaining-time adjustment, saved-session correction, retrospective.');
dom.window.close();
