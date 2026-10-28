import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {join} from 'node:path';
import {createHash} from 'node:crypto';
import vm from 'node:vm';
import {loadEngine,CORE,VERBS,ROOT} from './_harness.mjs';
import {checkPartialCourse} from '../../scripts/parity.mjs';
import plans from '../fixtures/arabic-b1-plans.cjs';
const preservedHashes={
  "data/core/b1-01.js": "84ceb6712f58ad6e1d50116cf7315b9e9bdaaf02a213ba46b9984534f1756573",
  "data/i18n/ar/a1-01.js": "fb0816c334408a20991cf77404e68a54e6712f1ee5cb283588abad73e0d291d0",
  "data/i18n/ar/a1-02.js": "e1268fec9b02af562f38366e7af9e89bbe31f0bcde31e05a471423048fd596b7",
  "data/i18n/ar/a1-03.js": "cf87821e14692288c36882199e334becdd95ba8ad4425b53dd8ba310d71db488",
  "data/i18n/ar/a2-01.js": "c592ad5679f501e8dd6a4a0f1715bcc6534b05efb55e83c8c392ec2249837ef2",
  "data/i18n/ar/a2-02.js": "2624a3934b50862a9e99f58c2aa5eff65dc22fe9a0f78771987282ec841c3f14"
};
const italianLeaves={
  "unit:b1-u01": [],
  "lesson:b1-u01-l1": [
    "/theory/1/list/0",
    "/theory/1/list/1",
    "/theory/1/list/2",
    "/grammar/table/head/1",
    "/grammar/table/head/2",
    "/grammar/table/head/3",
    "/grammar/table/head/4",
    "/grammar/table/head/5",
    "/grammar/table/rows/0/0",
    "/grammar/table/rows/0/1",
    "/grammar/table/rows/0/2",
    "/grammar/table/rows/0/3",
    "/grammar/table/rows/0/4",
    "/grammar/table/rows/0/5",
    "/grammar/table/rows/1/0",
    "/grammar/table/rows/1/1",
    "/grammar/table/rows/1/2",
    "/grammar/table/rows/1/3",
    "/grammar/table/rows/1/4",
    "/grammar/table/rows/1/5",
    "/grammar/table/rows/2/0",
    "/grammar/table/rows/2/1",
    "/grammar/table/rows/2/2",
    "/grammar/table/rows/2/3",
    "/grammar/table/rows/2/4",
    "/grammar/table/rows/2/5",
    "/grammar/table/rows/3/0",
    "/grammar/table/rows/3/1",
    "/grammar/table/rows/3/2",
    "/grammar/table/rows/3/3",
    "/grammar/table/rows/3/4",
    "/grammar/table/rows/3/5",
    "/grammar/table/rows/4/0",
    "/grammar/table/rows/4/1",
    "/grammar/table/rows/4/2",
    "/grammar/table/rows/4/3",
    "/grammar/table/rows/4/4",
    "/grammar/table/rows/4/5",
    "/grammar/table/rows/5/0",
    "/grammar/table/rows/5/1",
    "/grammar/table/rows/5/2",
    "/grammar/table/rows/5/3",
    "/grammar/table/rows/5/4",
    "/grammar/table/rows/5/5",
    "/exercises/6/opts/0",
    "/exercises/6/opts/1",
    "/exercises/6/opts/2"
  ],
  "lesson:b1-u01-l2": [
    "/grammar/table/rows/0/0",
    "/grammar/table/rows/0/2",
    "/grammar/table/rows/1/0",
    "/grammar/table/rows/1/2",
    "/grammar/table/rows/2/0",
    "/grammar/table/rows/2/2",
    "/grammar/table/rows/3/2",
    "/grammar/table/rows/4/0",
    "/grammar/table/rows/4/2",
    "/grammar/table/rows/5/0",
    "/grammar/table/rows/5/2",
    "/exercises/0/opts/0",
    "/exercises/0/opts/1",
    "/exercises/0/opts/2",
    "/exercises/1/opts/0",
    "/exercises/1/opts/1",
    "/exercises/1/opts/2",
    "/exercises/4/opts/0",
    "/exercises/4/opts/1",
    "/exercises/4/opts/2",
    "/exercises/4/opts/3",
    "/exercises/4/opts/4"
  ],
  "lesson:b1-u01-l3": [
    "/grammar/table/rows/0/0",
    "/grammar/table/rows/0/2",
    "/grammar/table/rows/0/3",
    "/grammar/table/rows/1/0",
    "/grammar/table/rows/1/2",
    "/grammar/table/rows/1/3",
    "/grammar/table/rows/2/0",
    "/grammar/table/rows/2/2",
    "/grammar/table/rows/2/3",
    "/grammar/table/rows/3/0",
    "/grammar/table/rows/3/3",
    "/grammar/table/rows/4/0",
    "/grammar/table/rows/4/3",
    "/grammar/table/rows/5/0",
    "/grammar/table/rows/5/3"
  ],
  "lesson:b1-u01-l4": [
    "/grammar/table/rows/0/1",
    "/grammar/table/rows/0/2",
    "/grammar/table/rows/1/1",
    "/grammar/table/rows/2/1",
    "/grammar/table/rows/3/1",
    "/grammar/table/rows/3/2",
    "/grammar/table/rows/4/1",
    "/grammar/table/rows/5/1",
    "/grammar/table/rows/5/2",
    "/exercises/0/opts/0",
    "/exercises/0/opts/1",
    "/exercises/0/opts/2"
  ],
  "lesson:b1-u01-test": [
    "/exercises/4/opts/0",
    "/exercises/4/opts/1",
    "/exercises/4/opts/2",
    "/exercises/7/opts/0",
    "/exercises/7/opts/1",
    "/exercises/7/opts/2",
    "/exercises/7/opts/3"
  ],
  "unit:b1-u02": [],
  "lesson:b1-u02-l1": [
    "/grammar/table/head/0",
    "/grammar/table/head/1",
    "/grammar/table/head/2",
    "/grammar/table/head/3",
    "/grammar/table/head/4",
    "/grammar/table/head/5",
    "/grammar/table/rows/0/0",
    "/grammar/table/rows/0/1",
    "/grammar/table/rows/0/2",
    "/grammar/table/rows/0/3",
    "/grammar/table/rows/0/4",
    "/grammar/table/rows/0/5",
    "/grammar/table/rows/1/0",
    "/grammar/table/rows/1/1",
    "/grammar/table/rows/1/2",
    "/grammar/table/rows/1/3",
    "/grammar/table/rows/1/4",
    "/grammar/table/rows/1/5",
    "/grammar/table/rows/2/0",
    "/grammar/table/rows/2/1",
    "/grammar/table/rows/2/2",
    "/grammar/table/rows/2/3",
    "/grammar/table/rows/2/4",
    "/grammar/table/rows/2/5",
    "/grammar/table/rows/3/0",
    "/grammar/table/rows/3/1",
    "/grammar/table/rows/3/2",
    "/grammar/table/rows/3/3",
    "/grammar/table/rows/3/4",
    "/grammar/table/rows/3/5",
    "/grammar/table/rows/4/0",
    "/grammar/table/rows/4/1",
    "/grammar/table/rows/4/2",
    "/grammar/table/rows/4/3",
    "/grammar/table/rows/4/4",
    "/grammar/table/rows/4/5",
    "/exercises/0/opts/0",
    "/exercises/0/opts/1",
    "/exercises/0/opts/2",
    "/exercises/3/opts/0",
    "/exercises/3/opts/1",
    "/exercises/3/opts/2"
  ],
  "lesson:b1-u02-l2": [
    "/grammar/table/rows/0/0",
    "/grammar/table/rows/0/2",
    "/grammar/table/rows/1/0",
    "/grammar/table/rows/1/2",
    "/grammar/table/rows/2/0",
    "/grammar/table/rows/2/2",
    "/grammar/table/rows/3/0",
    "/grammar/table/rows/3/2",
    "/grammar/table/rows/4/0",
    "/grammar/table/rows/4/2",
    "/grammar/table/rows/5/0",
    "/grammar/table/rows/5/2",
    "/grammar/table/rows/6/0",
    "/grammar/table/rows/6/2",
    "/grammar/table/rows/7/0",
    "/grammar/table/rows/7/2"
  ],
  "lesson:b1-u02-l3": [
    "/grammar/table/rows/0/0",
    "/grammar/table/rows/0/2",
    "/grammar/table/rows/1/0",
    "/grammar/table/rows/1/2",
    "/grammar/table/rows/2/0",
    "/grammar/table/rows/2/2",
    "/grammar/table/rows/3/0",
    "/grammar/table/rows/3/2",
    "/grammar/table/rows/4/0",
    "/grammar/table/rows/4/2",
    "/grammar/table/rows/5/0",
    "/grammar/table/rows/5/2",
    "/grammar/table/rows/6/0",
    "/grammar/table/rows/6/2",
    "/exercises/4/opts/0",
    "/exercises/4/opts/1",
    "/exercises/4/opts/2"
  ],
  "lesson:b1-u02-l4": [
    "/grammar/table/rows/0/0",
    "/grammar/table/rows/0/2",
    "/grammar/table/rows/1/0",
    "/grammar/table/rows/1/2",
    "/grammar/table/rows/2/0",
    "/grammar/table/rows/2/2",
    "/grammar/table/rows/3/0",
    "/grammar/table/rows/3/2",
    "/grammar/table/rows/4/0",
    "/grammar/table/rows/4/2",
    "/grammar/table/rows/5/0",
    "/grammar/table/rows/5/2",
    "/exercises/0/opts/0",
    "/exercises/0/opts/1",
    "/exercises/0/opts/2",
    "/exercises/1/opts/0",
    "/exercises/1/opts/1",
    "/exercises/1/opts/2",
    "/exercises/6/opts/0",
    "/exercises/6/opts/1",
    "/exercises/6/opts/2",
    "/exercises/6/opts/3"
  ],
  "lesson:b1-u02-test": [
    "/exercises/0/opts/0",
    "/exercises/0/opts/1",
    "/exercises/0/opts/2",
    "/exercises/6/opts/0",
    "/exercises/6/opts/1",
    "/exercises/6/opts/2"
  ],
  "unit:b1-u03": [],
  "lesson:b1-u03-l1": [
    "/grammar/table/rows/0/0",
    "/grammar/table/rows/1/0",
    "/grammar/table/rows/2/0",
    "/grammar/table/rows/3/0",
    "/grammar/table/rows/4/0",
    "/grammar/table/rows/5/0"
  ],
  "lesson:b1-u03-l2": [
    "/grammar/table/rows/0/0",
    "/grammar/table/rows/1/0",
    "/grammar/table/rows/2/0",
    "/grammar/table/rows/3/0",
    "/grammar/table/rows/4/0",
    "/grammar/table/rows/5/0"
  ],
  "lesson:b1-u03-l3": [
    "/grammar/table/rows/0/1",
    "/grammar/table/rows/1/1",
    "/grammar/table/rows/2/1",
    "/grammar/table/rows/3/1",
    "/grammar/table/rows/4/1",
    "/grammar/table/rows/5/1"
  ],
  "lesson:b1-u03-l4": [
    "/grammar/table/rows/0/0",
    "/grammar/table/rows/1/0",
    "/grammar/table/rows/2/0",
    "/grammar/table/rows/3/0",
    "/grammar/table/rows/4/0",
    "/grammar/table/rows/5/0"
  ],
  "lesson:b1-u03-test": [],
  "unit:b1-u04": [],
  "lesson:b1-u04-l1": [
    "/grammar/table/rows/0/0",
    "/grammar/table/rows/0/1",
    "/grammar/table/rows/0/2",
    "/grammar/table/rows/1/0",
    "/grammar/table/rows/1/1",
    "/grammar/table/rows/1/2",
    "/grammar/table/rows/2/0",
    "/grammar/table/rows/2/1",
    "/grammar/table/rows/2/2",
    "/grammar/table/rows/3/0",
    "/grammar/table/rows/3/2",
    "/grammar/table/rows/4/2",
    "/grammar/table/rows/5/0",
    "/grammar/table/rows/5/1",
    "/grammar/table/rows/5/2",
    "/exercises/0/opts/0",
    "/exercises/0/opts/1",
    "/exercises/0/opts/2"
  ],
  "lesson:b1-u04-l2": [
    "/grammar/table/rows/0/1",
    "/grammar/table/rows/1/1",
    "/grammar/table/rows/2/1",
    "/grammar/table/rows/3/1",
    "/grammar/table/rows/4/1",
    "/grammar/table/rows/5/1",
    "/exercises/1/opts/0",
    "/exercises/1/opts/1",
    "/exercises/1/opts/2"
  ],
  "lesson:b1-u04-l3": [
    "/grammar/table/rows/0/1",
    "/grammar/table/rows/0/2",
    "/grammar/table/rows/1/1",
    "/grammar/table/rows/1/2",
    "/grammar/table/rows/2/1",
    "/grammar/table/rows/2/2",
    "/grammar/table/rows/3/1",
    "/grammar/table/rows/3/2",
    "/grammar/table/rows/4/1",
    "/grammar/table/rows/4/2",
    "/grammar/table/rows/5/1",
    "/grammar/table/rows/5/2",
    "/exercises/0/opts/0",
    "/exercises/0/opts/1",
    "/exercises/0/opts/2",
    "/exercises/1/opts/0",
    "/exercises/1/opts/1",
    "/exercises/1/opts/2",
    "/exercises/6/opts/0",
    "/exercises/6/opts/1",
    "/exercises/6/opts/2"
  ],
  "lesson:b1-u04-l4": [
    "/grammar/table/rows/0/1",
    "/grammar/table/rows/1/1",
    "/grammar/table/rows/2/1",
    "/grammar/table/rows/3/1",
    "/grammar/table/rows/4/1",
    "/grammar/table/rows/5/1",
    "/exercises/2/opts/0",
    "/exercises/2/opts/1"
  ],
  "lesson:b1-u04-test": [
    "/exercises/6/opts/0",
    "/exercises/6/opts/1",
    "/exercises/6/opts/2"
  ]
};
const plain=v=>JSON.parse(JSON.stringify(v));
const read=f=>readFileSync(join(ROOT,f),'utf8');
const files=['a1-01.js','a1-02.js','a1-03.js','a2-01.js','a2-02.js','b1-01.js','b2-01.js','b2-02.js','b2-03.js','c1-01.js','c1-02.js','c1-03.js'];
function bag(lang,file){let out;vm.runInNewContext(read('data/i18n/'+lang+'/'+file),{LINGUAI:{addStrings(_l,b){out=plain(b);}}});return out;}
const bags=lang=>Object.fromEntries(files.map(f=>[f,bag(lang,f)]));
const entries=lang=>Object.assign({},...Object.values(bags(lang)));
const ar=bag('ar','b1-01.js'),en=bag('en','b1-01.js');
function setup(){const b=loadEngine({files:[...CORE,...VERBS,'assets/js/i18n.js','assets/js/i18n-merge.js','data/i18n/ui-en.js','data/i18n/ui-ar.js']});b.Core.load();for(const f of ['data/core/curriculum-index.js',...[...files,'c2-01.js','c2-02.js'].map(f=>'data/core/'+f),...['en','ar'].flatMap(l=>(l==='ar'?files:[...files,'c2-01.js','c2-02.js']).map(f=>'data/i18n/'+l+'/'+f))])vm.runInContext(read(f),b.sandbox);return b;}
function language(b,lang){b.Core.state.settings.lang=lang;b.sandbox.I18n.set(lang);b.sandbox.LINGUAI.applyStrings(lang);b.sandbox.Registry.reindex();}
test('B1 contains exactly the 16 original lessons, four assessments and 203 original exercises, all fully Arabic',()=>{
 const b=setup(),m=plain(b.sandbox.I18n.courseOverrides('ar'));assert.equal(Object.values(m).flat().length,187);assert.deepEqual(m['b1-01.js'],Object.keys(ar));assert.equal(Object.keys(ar).length,24);
 const errors=[];checkPartialCourse(m,bags('ar'),entries('en'),errors);assert.deepEqual(errors,[]);
 language(b,'ar');const us=plain(b.Core.registry.byCode.B1.units);assert.equal(us.length,4);assert.equal(us.flatMap(u=>u.lessons).length,16);assert.equal(us.filter(u=>u.test).length,4);assert.equal(us.flatMap(u=>[...u.lessons,u.test]).reduce((n,l)=>n+l.exercises.length,0),203);
 assert.equal(plans.length,20);assert.equal(plans.reduce((n,p)=>n+p.answers.length,0),203);for(const u of us)for(const l of [...u.lessons,u.test])assert.equal(b.sandbox.LINGUAI.lessonLanguage('ar',l.id),'ar');
});
test('all completed Arabic A1/A2 files and the original Italian B1 core are byte-identical',()=>{for(const[f,h]of Object.entries(preservedHashes))assert.equal(createHash('sha256').update(readFileSync(join(ROOT,f))).digest('hex'),h,f);});
for(const plan of plans){
 test(plan.id+' translates every existing learner field while preserving Italian and exact shape',()=>{
  const b=setup();language(b,'ar');const key='lesson:'+plan.id,patch=ar[key],base=en[key];assert.equal(patch.title,plan.title);
  function check(v,original,p=''){
   if(Array.isArray(v)){assert.equal(v.length,original.length,p);return v.forEach((x,i)=>check(x,original[i],p+'/'+i));}
   if(v&&typeof v==='object'){assert.deepEqual(Object.keys(v).sort(),Object.keys(original).sort(),p);return Object.entries(v).forEach(([k,x])=>check(x,original[k],p+'/'+k));}
   assert.equal(typeof v,'string',p);assert(v.trim()||original==='',p);
   if(italianLeaves[key].includes(p))return assert.equal(v,original,p);
   assert.match(v,/[\u0600-\u06ff]/,plan.id+p);
  }check(patch,base);
  let neutral;vm.runInNewContext(read('data/core/b1-01.js'),{LINGUAI:{addUnits(_l,us){for(const u of us)for(const l of [...u.lessons,u.test])if(l.id===plan.id)neutral=plain(l);}}});
  function unchanged(v,to){for(const[k,x]of Object.entries(v)){if(x&&typeof x==='object')unchanged(x,to[k]);else assert.equal(to[k],x,plan.id+'.'+k);}}unchanged(neutral,plain(b.Core.getLesson(plan.id).lesson));assert.equal(patch.exercises.length,neutral.exercises.length);
 });
 plan.answers.forEach((answer,i)=>test(plan.id+' exercise '+(i+1)+' Arabic meaning matches its original accepted Italian response',()=>{
  const b=setup();language(b,'ar');const e=plain(b.Core.getLesson(plan.id).lesson.exercises[i]);
  if(e.t==='conj')assert.deepEqual(e.persons.map(p=>b.sandbox.Verbs.conjugate(e.verb,e.tense)[p]),answer);
  else if(e.t==='mcq'||e.t==='multi')assert.deepEqual(e.a,answer);
  else if(e.t==='match')assert.deepEqual(e.pairs.map(p=>p.tr),plan.matches[i]);
  else if(e.t==='dialogue')assert.deepEqual(e.lines.filter(l=>l.choices).map(l=>l.a),answer);
  else if(e.t==='cloze'){assert.equal(e.gaps.length,answer.length);answer.forEach((v,j)=>assert(b.Core.checkOpen(v,e.gaps[j],false).ok));}
  else if(e.t==='order'){assert.deepEqual(e.tokens,answer);assert(b.Core.checkOpen(answer.join(' '),e.a,true).ok);}
  else if(['fill','trans'].includes(e.t))assert(b.Core.checkOpen(answer,e.a,true).ok);
  else if(['listen','speak'].includes(e.t))assert.equal(e.it,answer);
  else assert.fail('Unverified exercise '+e.t);
 }));
}
test('every unit title and summary is Arabic and matches the original key shape',()=>{for(const n of [1,2,3,4]){const k='unit:b1-u0'+n;assert.deepEqual(Object.keys(ar[k]),Object.keys(en[k]));Object.values(ar[k]).forEach(s=>assert.match(s,/[\u0600-\u06ff]/));}});
test('all six language cycles restore exact A1/A2/B1 content, scores, glossary and unchanged English C2 fallback',()=>{
 const b=setup(),C=b.Core;language(b,'en');for(const p of plans)C.recordLesson(p.id,p.answers.length,p.answers.length,80);C.addCard('il riscontro','reply','b1-u03-l3');language(b,'ar');C.addCard('il riscontro','الرد','b1-u03-l3');
 const state=()=>{const s=plain(C.state);delete s.settings.lang;return s;},before=state(),snapshot=()=>plain([C.registry.byCode.A1.units,C.registry.byCode.A2.units,C.registry.byCode.B1.units]);
 for(const lang of ['en']){language(b,lang);const original=snapshot();language(b,'ar');const arabic=snapshot();for(const next of [lang,'ar',lang,'ar']){language(b,next);assert.deepEqual(snapshot(),next==='ar'?arabic:original);assert.deepEqual(state(),before);}}
 language(b,'en');const fallback=plain(C.registry.byCode.C2.units);language(b,'ar');assert.deepEqual(plain(C.registry.byCode.C2.units),fallback);for(const u of fallback)for(const l of [...u.lessons,u.test])assert.equal(b.sandbox.LINGUAI.lessonLanguage('ar',l.id),'en');assert.equal(C.state.schema,2);assert.deepEqual(plain(C.state.srs[C.cardKey('il riscontro')].tr),{en:'reply',ar:'الرد'});
});
test('each B1 lesson falls back atomically when an existing required text family is incomplete',()=>{
 for(const p of plans)for(const damage of [o=>{delete o.title;},o=>o.exercises.pop(),o=>{o.theory=[];}]){const b=setup(),all=bags('ar');damage(all['b1-01.js']['lesson:'+p.id]);b.sandbox.LINGUAI.addStrings('ar',all['b1-01.js']);language(b,'en');language(b,'ar');assert.equal(b.sandbox.LINGUAI.lessonLanguage('ar',p.id),'en');assert.equal(b.Core.getLesson(p.id).lesson.title,en['lesson:'+p.id].title);assert.equal(b.sandbox.LINGUAI.lessonLanguage('ar','a2-u01-l1'),'ar');const errors=[];checkPartialCourse(b.sandbox.I18n.courseOverrides('ar'),all,entries('en'),errors);assert(errors.some(e=>e.includes(p.id)));}
});
test('unit metadata is atomic and undeclared C2 overrides cannot replace English',()=>{
 for(const n of [1,2,3,4])for(const field of ['title','grammarNote']){const b=setup(),patch=plain(ar),key='unit:b1-u0'+n;delete patch[key][field];patch['unit:c2-u01']={title:'غير معلن',grammarNote:'غير معلن'};b.sandbox.LINGUAI.addStrings('ar',patch);language(b,'ar');const u=b.Core.registry.byCode.B1.units[n-1];assert.equal(u.title,en[key].title);assert.equal(u.grammarNote,en[key].grammarNote);assert.equal(b.Core.registry.byCode.C2.units[0].title,bag('en','c2-01.js')['unit:c2-u01'].title);}
});
test('B1 overlays load after English and failed Arabic scripts remain retryable while C2 stays unrequested',()=>{
 const b=setup(),R=b.sandbox.Registry;assert.deepEqual(R.i18nPaths('ar',['b1-01.js','b2-01.js','b2-02.js','b2-03.js','c2-01.js','c2-02.js']),["data/i18n/en/b1-01.js","data/i18n/en/b2-01.js","data/i18n/en/b2-02.js","data/i18n/en/b2-03.js","data/i18n/en/c2-01.js","data/i18n/en/c2-02.js","data/i18n/ar/b1-01.js","data/i18n/ar/b2-01.js","data/i18n/ar/b2-02.js","data/i18n/ar/b2-03.js"]);R.markI18n(['data/i18n/en/b1-01.js','data/i18n/ar/b1-01.js'],['data/i18n/ar/b1-01.js']);assert.deepEqual(R.i18nPaths('ar',['b1-01.js']),['data/i18n/ar/b1-01.js']);language(b,'ar');assert.match(b.sandbox.I18n.t('tense.cong'),/صيغة/);
});
test('Arabic clarifies inherited source ambiguity without changing Italian examples or accepted keys',()=>{
 assert.match(ar['lesson:b1-u01-l1'].theory[2].trap,/إذا أوضح السياق/);
 assert.match(ar['lesson:b1-u01-l2'].theory[0].list[3],/imperfetto/);
 assert.match(ar['lesson:b1-u02-l1'].exercises[2].why,/ve la spiego/);
 assert.match(ar['lesson:b1-u02-l3'].grammar.examples[4].tr,/مَن ينام/);
 assert.match(ar['lesson:b1-u03-l1'].culture.text,/ليست تعليمات قانونية/);
 assert.match(ar['lesson:b1-u03-l4'].theory[2].p,/ليس قاعدة عامة/);
 assert.match(ar['lesson:b1-u04-l1'].theory[0].p,/قد يبقى الزمن الأصلي/);
 assert.match(ar['lesson:b1-u04-l2'].theory[0].p,/ولا تثبت وحدها/);
});
