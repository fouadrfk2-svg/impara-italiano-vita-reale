import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {join} from 'node:path';
import {createHash} from 'node:crypto';
import vm from 'node:vm';
import {loadEngine,CORE,VERBS,ROOT} from './_harness.mjs';
import {checkPartialCourse} from '../../scripts/parity.mjs';
import plans from '../fixtures/arabic-a2-final-plans.cjs';
const preservedHashes={
  "data/i18n/ar/a1-01.js": "fb0816c334408a20991cf77404e68a54e6712f1ee5cb283588abad73e0d291d0",
  "data/i18n/ar/a1-02.js": "6efe8ff0f4149d59ea4d692a59ac2d91d296593afbec9646241162232d83d439",
  "data/i18n/ar/a1-03.js": "8aafa4ddf1a7c722691879d3f42e824184efc04decb930ef2b7322c20dcd8c38",
  "data/i18n/ar/a2-01.js": "c592ad5679f501e8dd6a4a0f1715bcc6534b05efb55e83c8c392ec2249837ef2",
  "data/core/a2-01.js": "7a7dea523610a596b05f280edead1b954da3950e57400ebb76ff0b88cb9d8c5a",
  "data/core/a2-02.js": "e8f70cf2523bf046b7d5301c9655720c25f69251c014e747a79e8bc287c43f75"
};
const plain=v=>JSON.parse(JSON.stringify(v));
const read=f=>readFileSync(join(ROOT,f),'utf8');
const files=['a1-01.js','a1-02.js','a1-03.js','a2-01.js','a2-02.js','b1-01.js'];
function bag(lang,file){let out;vm.runInNewContext(read('data/i18n/'+lang+'/'+file),{LINGUAI:{addStrings(_l,b){out=plain(b);}}});return out;}
const bags=lang=>Object.fromEntries(files.map(f=>[f,bag(lang,f)]));
const entries=lang=>Object.assign({},...Object.values(bags(lang)));
const ar=bag('ar','a2-02.js'),en=bag('en','a2-02.js');
function setup(){const box=loadEngine({files:[...CORE,...VERBS,'assets/js/i18n.js','assets/js/i18n-merge.js','data/i18n/ui-en.js','data/i18n/ui-ar.js']});box.Core.load();for(const f of ['data/core/curriculum-index.js',...[...files,'b2-01.js'].map(f=>'data/core/'+f),...['en','pl','es','fr','de','ar'].flatMap(l=>(l==='ar'?files:[...files,'b2-01.js']).map(f=>'data/i18n/'+l+'/'+f))])vm.runInContext(read(f),box.sandbox);return box;}
function language(box,lang){box.Core.state.settings.lang=lang;box.sandbox.I18n.set(lang);box.sandbox.LINGUAI.applyStrings(lang);box.sandbox.Registry.reindex();}
const italianColumns={'a2-u05-l1':[0],'a2-u05-l2':[1],'a2-u05-l3':[0,1,2],'a2-u05-l4':[1],'a2-u06-l1':[1],'a2-u06-l2':[1],'a2-u06-l3':[1],'a2-u06-l4':[1],'a2-u07-l1':[1,2],'a2-u07-l2':[1],'a2-u07-l3':[0,1],'a2-u07-l4':[0,1,2],'a2-u08-l1':[2],'a2-u08-l2':[0,1],'a2-u08-l3':[1,2]};
const italianOptions={'a2-u05-l2':[0,5],'a2-u05-l4':[0],'a2-u06-l1':[1],'a2-u06-l2':[0],'a2-u06-l3':[0,6],'a2-u06-test':[4],'a2-u07-l1':[0,1],'a2-u07-l2':[0],'a2-u07-l4':[2],'a2-u07-test':[0,7],'a2-u08-l1':[3],'a2-u08-l2':[4],'a2-u08-l3':[0,1,6],'a2-u08-test':[4]};
test('complete Arabic A2 contains exactly 32 original lessons, 8 assessments and 405 exercises',()=>{
 const b=setup(),m=plain(b.sandbox.I18n.courseOverrides('ar'));assert.equal(Object.values(m).flat().length,132);assert.equal(m['a2-01.js'].length,24);assert.deepEqual(m['a2-02.js'],Object.keys(ar));assert.equal(Object.keys(ar).length,24);
 const errors=[];checkPartialCourse(m,bags('ar'),entries('pl'),errors);assert.deepEqual(errors,[]);
 language(b,'ar');const units=plain(b.Core.registry.byCode.A2.units);assert.equal(units.length,8);assert.equal(units.flatMap(u=>u.lessons).length,32);assert.equal(units.filter(u=>u.test).length,8);assert.equal(units.flatMap(u=>[...u.lessons,u.test]).reduce((n,l)=>n+l.exercises.length,0),405);
 assert.equal(plans.length,20);assert.equal(plans.filter(p=>p.id.endsWith('-test')).length,4);assert.equal(plans.reduce((n,p)=>n+p.answers.length,0),205);
 for(const u of units)for(const l of [...u.lessons,u.test])assert.equal(b.sandbox.LINGUAI.lessonLanguage('ar',l.id),'ar');
});
test('all previous Arabic files and original Italian core content remain byte-equivalent',()=>{
 for(const [f,h]of Object.entries(preservedHashes))assert.equal(createHash('sha256').update(read(f).replace(/\r\n/g,'\n')).digest('hex'),h,f);
});
for(const plan of plans){
 test(plan.id+' fully translates existing learner fields without adding examples or changing Italian',()=>{
  const b=setup();language(b,'ar');const patch=ar['lesson:'+plan.id],base=en['lesson:'+plan.id],merged=plain(b.Core.getLesson(plan.id).lesson);assert.equal(patch.title,plan.title);
  function check(v,original,p=''){
   if(Array.isArray(v)){assert.equal(v.length,original.length,p);return v.forEach((x,i)=>check(x,original[i],p+'['+i+']'));}
   if(v&&typeof v==='object'){assert.deepEqual(Object.keys(v).sort(),Object.keys(original).sort(),p);return Object.entries(v).forEach(([k,x])=>check(x,original[k],p+'.'+k));}
   if(v===null)return assert.equal(original,null,p);
   assert.equal(typeof v,'string',p);assert(v.trim(),p);assert.equal((v.match(/\u2066/g)||[]).length,(v.match(/\u2069/g)||[]).length,p);
   if(/[\u0600-\u06ff]/.test(v))return;
   const cell=/\.grammar\.table\.rows\[(\d+)\]\[(\d+)\]$/.exec(p);
   if(cell&&((italianColumns[plan.id]||[]).includes(Number(cell[2]))||['volerci','metterci','farcela','si + si → ci si','futuro semplice','chissà','ci','ne'].includes(v)||plan.id==='a2-u07-l3'&&[1,3,4].includes(Number(cell[1]))&&Number(cell[2])===2))return assert.equal(v,original,p);
   const option=/\.exercises\[(\d+)\]\.opts\[/.exec(p);if(option&&(italianOptions[plan.id]||[]).includes(Number(option[1])))return assert.equal(v,original,p);
   if(/\.exercises\[0\]\.pairs\[/.test(p)&&['a2-u05-l3','a2-u07-l3'].includes(plan.id)||plan.id==='a2-u07-test'&&/\.exercises\[5\]\.pairs\[/.test(p))return assert.equal(v,original,p);
   if(plan.id==='a2-u06-l1'&&/^\.theory\[2\]\.list\[[0-3]\]$/.test(p))return assert.equal(v,original,p);
   assert.fail('Untranslated learner text '+plan.id+p+': '+v);
  }check(patch,base);
  let neutral;vm.runInNewContext(read('data/core/a2-02.js'),{LINGUAI:{addUnits(_l,us){for(const u of us)for(const l of [...u.lessons,u.test])if(l.id===plan.id)neutral=plain(l);}}});
  function unchanged(v,to){for(const [k,x]of Object.entries(v)){if(x&&typeof x==='object')unchanged(x,to[k]);else assert.equal(to[k],x,plan.id+'.'+k);}}
  unchanged(neutral,merged);assert.equal(patch.exercises.length,neutral.exercises.length);
 });
 plan.answers.forEach((answer,i)=>test(plan.id+' original exercise '+(i+1)+' reviewed Arabic prompt retains the accepted Italian response',()=>{
  const b=setup();language(b,'ar');const e=plain(b.Core.getLesson(plan.id).lesson.exercises[i]);
  if(e.t==='conj')assert.deepEqual(e.persons.map(p=>b.sandbox.Verbs.conjugate(e.verb,e.tense)[p]),answer);
  else if(e.t==='mcq')assert.equal(e.a,answer);
  else if(e.t==='multi')assert.deepEqual(e.a,answer);
  else if(e.t==='match')assert.deepEqual(e.pairs.map(p=>p.tr),plan.matches[i]);
  else if(e.t==='dialogue')assert.deepEqual(e.lines.filter(l=>l.choices).map(l=>l.a),answer);
  else if(e.t==='gender')assert.deepEqual(Object.fromEntries(e.items.map(item=>[item.it,item.a])),answer);
  else if(e.t==='cloze'){assert.equal(e.gaps.length,answer.length);answer.forEach((v,j)=>assert(b.Core.checkOpen(v,e.gaps[j],false).ok));}
  else if(e.t==='order'){assert.deepEqual(e.tokens,answer);assert(b.Core.checkOpen(answer.join(' '),e.a,true).ok);}
  else if(['fill','trans'].includes(e.t))assert(b.Core.checkOpen(answer,e.a,true).ok);
  else if(['listen','speak'].includes(e.t))assert.equal(e.it,answer);
  else assert.fail('Unverified exercise '+e.t);
 }));
}
test('Arabic adaptations clarify source ambiguities without changing grading',()=>{
 assert.match(ar['lesson:a2-u05-l3'].theory[2].p,/بعض/);assert.match(ar['lesson:a2-u05-l4'].theory[1].p,/تبسيط لغوي/);
 assert.match(ar['lesson:a2-u06-l1'].exercises[6].lines[1].answerTr,/نوفاك/);assert.match(ar['lesson:a2-u06-l2'].exercises[9].tr,/دكتورة/);assert.doesNotMatch(ar['lesson:a2-u06-l2'].exercises[9].tr,/روسّي/);
 assert.match(ar['lesson:a2-u07-l1'].theory[1].p,/ليس قاعدة/);assert.match(ar['lesson:a2-u07-l4'].theory[1].p,/جيدًا/);
 assert.match(ar['lesson:a2-u08-l2'].exercises[1].q,/امرأة/);assert.match(ar['lesson:a2-u08-l4'].theory[1].p,/للعربية/);
});
test('all languages restore exact A1/A2 and B2 fallback while scores and glossary state survive',()=>{
 const b=setup(),C=b.Core;language(b,'en');plans.forEach(p=>C.recordLesson(p.id,p.answers.length,p.answers.length,80));C.addCard('il rubinetto','faucet','a2-u05-l4');language(b,'ar');C.addCard('il rubinetto','الصنبور','a2-u05-l4');
 const state=()=>{const s=plain(C.state);delete s.settings.lang;return s;},before=state(),snapshot=()=>plain([C.registry.byCode.A1.units,C.registry.byCode.A2.units]);
 for(const l of ['en','pl','es','fr','de']){language(b,l);const expected=snapshot();language(b,'ar');const arabic=snapshot();for(const next of [l,'ar',l,'ar']){language(b,next);assert.deepEqual(snapshot(),next==='ar'?arabic:expected);assert.deepEqual(state(),before);}}
 language(b,'en');const fallback=plain(C.registry.byCode.B2.units);language(b,'ar');assert.deepEqual(plain(C.registry.byCode.B2.units),fallback);for(const u of fallback)for(const l of [...u.lessons,u.test])assert.equal(b.sandbox.LINGUAI.lessonLanguage('ar',l.id),'en');
 assert.equal(C.state.schema,2);assert.deepEqual(plain(C.state.srs[C.cardKey('il rubinetto')].tr),{en:'faucet',ar:'الصنبور'});
});
test('each final A2 lesson rejects incomplete translations atomically without stale text',()=>{
 for(const p of plans)for(const damage of [o=>{delete o.title;},o=>o.exercises.pop(),o=>{o.theory=[];}]){
  const b=setup(),all=bags('ar');damage(all['a2-02.js']['lesson:'+p.id]);b.sandbox.LINGUAI.addStrings('ar',all['a2-02.js']);language(b,'es');language(b,'ar');assert.equal(b.sandbox.LINGUAI.lessonLanguage('ar',p.id),'en');assert.equal(CURRENT(b,p.id).title,en['lesson:'+p.id].title);assert.equal(b.sandbox.LINGUAI.lessonLanguage('ar','a2-u03-l1'),'ar');const errors=[];checkPartialCourse(b.sandbox.I18n.courseOverrides('ar'),all,entries('pl'),errors);assert(errors.some(e=>e.includes(p.id)));
 }
});
function CURRENT(b,id){return b.Core.getLesson(id).lesson;}
test('unit titles and summaries reject partial overrides and undeclared B2 remains English',()=>{
 for(const n of [5,6,7,8])for(const field of ['title','grammarNote']){const b=setup(),patch=plain(ar),key='unit:a2-u0'+n;delete patch[key][field];patch['unit:b2-u01']={title:'غير معلن',grammarNote:'غير معلن'};b.sandbox.LINGUAI.addStrings('ar',patch);language(b,'ar');const u=b.Core.registry.byCode.A2.units[n-1];assert.equal(u.title,en[key].title);assert.equal(u.grammarNote,en[key].grammarNote);assert.equal(b.Core.registry.byCode.B2.units[0].title,bag('en','b2-01.js')['unit:b2-u01'].title);}
});
test('both A2 files load after English, failed Arabic loads retry, and B2 has no Arabic request',()=>{
 const b=setup(),R=b.sandbox.Registry;assert.deepEqual(R.i18nPaths('ar',['a2-01.js','a2-02.js','b1-01.js','b2-01.js']),['data/i18n/en/a2-01.js','data/i18n/en/a2-02.js','data/i18n/en/b1-01.js','data/i18n/en/b2-01.js','data/i18n/ar/a2-01.js','data/i18n/ar/a2-02.js','data/i18n/ar/b1-01.js']);R.markI18n(['data/i18n/en/a2-01.js','data/i18n/en/a2-02.js','data/i18n/ar/a2-01.js','data/i18n/ar/a2-02.js'],['data/i18n/ar/a2-02.js']);assert.deepEqual(R.i18nPaths('ar',['a2-01.js','a2-02.js']),['data/i18n/ar/a2-02.js']);
});

test('original sparse article glossary slots never introduce stale null values on language switching',()=>{
 const b=setup();language(b,'en');const english=plain(b.Core.getLesson('a2-u05-l3').lesson.exercises[7]);language(b,'ar');const arabic=plain(b.Core.getLesson('a2-u05-l3').lesson.exercises[7]);assert.equal(arabic.items.length,4);assert(arabic.items.every(i=>!Object.hasOwn(i,'gloss')));for(const l of ['en','ar','es','ar','en']){language(b,l);if(l==='en')assert.deepEqual(plain(b.Core.getLesson('a2-u05-l3').lesson.exercises[7]),english);}assert.equal(arabic.q,'اختر أدوات التعريف المناسبة.');
});

test('example meanings follow original Italian names, gender and requests rather than mismatched English glosses',()=>{
 assert.equal(ar['lesson:a2-u06-l2'].grammar.examples[0].tr,'السيد الدكتور بيانكي المحترم، أكتب إليك بشأن عرض أمس.');
 assert.equal(ar['lesson:a2-u08-l2'].grammar.examples[3].tr,'أود أن أطلب منك خدمة.');
 assert.equal(ar['lesson:a2-u08-l2'].grammar.examples[5].tr,'تعرّفتُ عليها العام الماضي في روما.');
 assert.equal(ar['lesson:a2-u08-l3'].grammar.examples[2].tr,'المفاتيح؟ لم أعد أجدها.');
 assert.match(ar['lesson:a2-u07-l4'].grammar.examples[0].tr,/من فضلك/);
});
