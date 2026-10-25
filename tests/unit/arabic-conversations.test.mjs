import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {join} from 'node:path';
import vm from 'node:vm';
import {loadEngine,CORE,ROOT} from './_harness.mjs';
import {checkPartialCourse} from '../../scripts/parity.mjs';
const ids=['bar-mattina','presentarsi','mercato','ristorante','treno','medico','affitto','colloquio','burocrazia','dibattito','ristorante-scelte','treno-perso','casa-visita','medico-gola'];
const levels=['A1','A2','B1','B2','C1'];
const plain=v=>JSON.parse(JSON.stringify(v)),read=f=>readFileSync(join(ROOT,f),'utf8');
function overlay(lang,file){let bag;vm.runInNewContext(read('data/i18n/'+lang+'/'+file),{LINGUAI:{addStrings:(_l,v)=>bag=plain(v)}});return bag;}
const reference={...overlay('en','conversations.js'),...overlay('en','curriculum-index.js')};
const translated={'conversations.js':overlay('ar','conversations.js'),'curriculum-index.js':overlay('ar','curriculum-index.js')};
function setup(){const b=loadEngine({files:[...CORE,'assets/js/i18n.js','assets/js/i18n-merge.js','assets/js/talk-run.js']});b.Core.load();for(const f of ['curriculum-index.js','conversations.js'])vm.runInContext(read('data/core/'+f),b.sandbox);for(const lang of ['en','pl','es','fr','de','ar'])for(const f of ['curriculum-index.js','conversations.js'])vm.runInContext(read('data/i18n/'+lang+'/'+f),b.sandbox);return b;}
function language(b,lang){b.Core.state.settings.lang=lang;b.sandbox.I18n.set(lang);b.sandbox.LINGUAI.applyStrings(lang);b.sandbox.Registry.reindex();}
function leaves(v,path=''){return typeof v==='string'?[[path,v]]:Object.entries(v).flatMap(([k,x])=>leaves(x,path+'.'+k));}
function checkOriginal(core,merged){if(core&&typeof core==='object')for(const[k,v]of Object.entries(core))checkOriginal(v,merged[k]);else assert.equal(merged,core);}
function routes(conv){const out=[];function walk(i,seen,choices){assert(seen.length<40,'no branch cycle');if(i>=conv.turns.length){out.push({seen,choices});return;}const t=conv.turns[i],next=x=>x.go?conv.turns.findIndex(t=>t.id===x.go):i+1;if(t.opts)t.opts.forEach((o,n)=>walk(next(o),seen.concat(i),choices.concat(n)));else walk(next(t),seen.concat(i),choices);}walk(0,[],[]);return out;}

test('only the 14 complete conversations and A1–C1 metadata are declared; C2 has no Arabic overlay',()=>{const b=setup(),m=plain(b.sandbox.I18n.contentOverrides('ar'));assert.deepEqual(m,{'conversations.js':ids.map(id=>'conv:'+id),'curriculum-index.js':levels.map(l=>'level:'+l)});assert.equal(Object.keys(translated['conversations.js']).length,14);assert.equal(Object.keys(translated['curriculum-index.js']).length,5);const errors=[];checkPartialCourse({},translated,reference,errors,m);assert.deepEqual(errors,[]);for(const bag of Object.values(translated))for(const[k,v]of Object.entries(bag))for(const[p,s]of leaves(v)){assert.match(s,/[\u0600-\u06ff]/,k+p);assert.notEqual(s,leaves(reference[k]).find(([q])=>q===p)?.[1],k+p);}assert(!Object.hasOwn(translated['curriculum-index.js'],'level:C2'));});

for(const id of ids)test(id+': every Italian response, option, recording target and branch is preserved across all languages',()=>{
 const b=setup(),key='conv:'+id,neutral={};vm.runInNewContext(read('data/core/conversations.js'),{window:neutral});const core=plain(neutral.CONVERSATIONS.find(c=>c.id===id));language(b,'en');const english=plain(b.sandbox.CONVERSATIONS.find(c=>c.id===id));language(b,'ar');const ar=plain(b.sandbox.CONVERSATIONS.find(c=>c.id===id));checkOriginal(core,ar);assert.equal(b.sandbox.LINGUAI.entryLanguage('ar',key),'ar');assert.deepEqual(routes(ar),routes(core));
 for(const lang of ['en','pl','es','fr','de']){language(b,lang);const original=plain(b.sandbox.CONVERSATIONS.find(c=>c.id===id));language(b,'ar');assert.deepEqual(plain(b.sandbox.CONVERSATIONS.find(c=>c.id===id)),ar);language(b,lang);assert.deepEqual(plain(b.sandbox.CONVERSATIONS.find(c=>c.id===id)),original);}
 for(const path of routes(core)){
  const run=b.sandbox.Talk.create(ar),enRun=b.sandbox.Talk.create(english);let choice=0;
  for(const index of path.seen){assert.equal(run.index,index);assert.equal(enRun.index,index);const t=core.turns[index];if(t.sp!=='TY'){run.advance();enRun.advance();continue;}run.beginTurn(index);enRun.beginTurn(index);
   const option=t.opts?path.choices[choice++]:null,target=t.opts?t.opts[option]:t;
   for(const response of target.accept){const verdict=run.judge(response),enVerdict=enRun.judge(response);assert.equal(verdict.ok,true,id+' '+index+' '+response);assert.equal(verdict.ok,enVerdict.ok);assert.equal(verdict.opcja.go,enVerdict.opcja.go);}
   assert.equal(run.judge('risposta completamente estranea xyz').ok,false);const a=run.answer(target.accept[0]),e=enRun.answer(target.accept[0]);assert.equal(a.ok,true);assert.equal(a.punkt,e.punkt);assert.equal(a.tekst,e.tekst);assert.match(a.tr,/[\u0600-\u06ff]/);
  }assert.equal(run.done,true);assert.equal(run.score,run.turns);assert.equal(run.score,enRun.score);
 }
});

test('partial or corrupted conversation translations fall back atomically, including branch option meanings',()=>{const b=setup(),bag=translated['conversations.js'];language(b,'en');const originals=plain(b.sandbox.CONVERSATIONS);for(const id of ids){const patch=plain(bag['conv:'+id]);const branch=patch.turns.find(t=>t.opts);if(branch)delete branch.opts[1].tr;else delete patch.turns[1].task;b.sandbox.LINGUAI.addStrings('ar',{['conv:'+id]:patch});language(b,'ar');assert.equal(b.sandbox.LINGUAI.entryLanguage('ar','conv:'+id),'en');assert.deepEqual(plain(b.sandbox.CONVERSATIONS.find(c=>c.id===id)),originals.find(c=>c.id===id));}});

test('five level names/descriptions restore through Arabic–English–Arabic; C2 stays English and saved progress is unchanged',()=>{const b=setup();b.Core.recordLesson('conv-bar-mattina',4,4,0);b.Core.recordLesson('a1-u01-l1',9,10,120);b.Core.addCard('ciao','مرحبًا','a1-u01-l1');const state=()=>{const s=plain(b.Core.state);delete s.settings.lang;return s;},saved=state();for(const lang of ['ar','en','ar','es','ar']){language(b,lang);for(const code of levels){const l=b.Core.registry.byCode[code],expected=overlay(lang,'curriculum-index.js')['level:'+code];assert.equal(l.name,expected.name);assert.equal(l.desc,expected.desc);}if(lang==='ar'){const c2=b.Core.registry.byCode.C2;assert.equal(c2.name,reference['level:C2'].name);assert.equal(c2.desc,reference['level:C2'].desc);assert.equal(b.sandbox.LINGUAI.entryLanguage('ar','level:C2'),'en');assert.match(b.sandbox.I18n.contentAttrs('conv:bar-mattina'),/lang="ar" dir="rtl"/);assert.match(b.sandbox.I18n.contentAttrs('it'),/lang="it" dir="ltr"/);}assert.deepEqual(state(),saved);}assert.equal(b.Core.state.schema,2);});

test('closing summaries preserve the original Italian teaching expressions with balanced LTR isolates',()=>{for(const[id,terms]of Object.entries({mercato:['Etti','chili','basta così'],ristorante:['primo','secondo','contorno','dolce','caffè'],medico:['mi fa male','da quanto tempo','ho la febbre'],affitto:['spese condominiali','cauzione','tipo di contratto']})){const closing=translated['conversations.js']['conv:'+id].closing;for(const term of terms)assert(closing.includes('\u2066'+term+'\u2069'),term);assert.equal((closing.match(/\u2066/g)||[]).length,(closing.match(/\u2069/g)||[]).length);}});
