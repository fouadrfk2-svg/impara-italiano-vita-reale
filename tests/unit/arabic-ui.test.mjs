import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {join} from 'node:path';
import vm from 'node:vm';
import {loadEngine,CORE,ROOT} from './_harness.mjs';
import original from '../fixtures/arabic-ui-baseline.cjs';

function dictionary(lang){let bag;vm.runInNewContext(readFileSync(join(ROOT,'data/i18n/ui-'+lang+'.js'),'utf8'),{LINGUAI:{addUI(code,map){assert.equal(code,lang);bag=JSON.parse(JSON.stringify(map));}}});return bag;}
const en=dictionary('en'),ar=dictionary('ar'),categories=['zero','one','two','few','many','other'];
const vars=s=>[...s.matchAll(/\{(\w+)\}/g)].map(m=>m[1]).sort();
const tags=s=>s.match(/<\/?[a-z][^>]*>/gi)||[];
const plain=v=>JSON.parse(JSON.stringify(v));
function engine(){const b=loadEngine({files:[...CORE,'assets/js/i18n.js','assets/js/i18n-merge.js',...['en','ar','pl','es','fr','de'].map(l=>'data/i18n/ui-'+l+'.js')]});b.Core.load();return b;}

test('Arabic UI has exactly the original 962 keys, with no missing, extra or duplicate declarations',()=>{
 assert.equal(Object.keys(en).length,962);assert.equal(Object.keys(ar).length,962);assert.deepEqual(Object.keys(ar).sort(),Object.keys(en).sort());
 const source=readFileSync(join(ROOT,'data/i18n/ui-ar.js'),'utf8');const declared=[...source.matchAll(/^\s*"([^"\n]+)":/gm)].map(m=>m[1]);assert.equal(declared.length,962);assert.equal(new Set(declared).size,962);
});
test('all 230 pre-existing translations remain exactly unchanged',()=>{assert.equal(Object.keys(original).length,230);for(const[k,v]of Object.entries(original))assert.deepEqual(ar[k],v,k);});

for(const section of new Set(Object.keys(en).map(k=>k.split('.')[0])))test('complete Arabic interface section: '+section,()=>{
 for(const[k,value]of Object.entries(en).filter(([k])=>k.startsWith(section+'.'))){assert.equal(typeof ar[k],typeof value,k);const texts=typeof ar[k]==='object'?Object.values(ar[k]):[ar[k]];for(const text of texts){assert.equal(typeof text,'string',k);assert.match(text,/[\u0600-\u06ff]/,k);assert(text.trim(),k);assert(!/\b(?:TODO|FIXME|translate me|undefined)\b/i.test(text),k);}
  if(typeof value==='object')assert.deepEqual(Object.keys(ar[k]).sort(),categories.slice().sort(),k);
  if(k in original)continue;
  const reference=typeof value==='object'?value.other:value;
  for(const text of texts){assert.deepEqual(vars(text),vars(reference),k+' variables');assert.deepEqual(tags(text),tags(reference),k+' markup');assert.equal((text.match(/\u2066/g)||[]).length,(text.match(/\u2069/g)||[]).length,k+' balanced LTR isolates');}
 }
});
test('Arabic plural categories select correctly, retaining every dynamic value in new translations',()=>{
 const b=engine(),I=b.sandbox.I18n;I.set('ar');const rules=new Intl.PluralRules('ar');
 for(const[k,value]of Object.entries(ar).filter(([,v])=>typeof v==='object'))for(const n of [0,1,2,3,7,11,42,100,102,103,1.5]){const cat=rules.select(n),expected=value[cat].replace(/\{n\}/g,String(n)).replace(/\{best\}/g,'42');assert.equal(I.t(k,{n,best:42}),expected,k+' '+cat);}
 assert.equal(I.t('search.count',{n:2}),'نتيجتان (2)');assert.equal(I.t('search.count',{n:3}),'3 نتائج');assert.equal(I.t('search.count',{n:11}),'11 نتيجة');assert.equal(I.t('sound.pairs',{n:2}),'زوجان (2)');
 assert.equal(I.t('stats.lessons',{n:2}),original['stats.lessons'].two);
});
test('every UI key resolves natively in Arabic without falling back or leaving functional placeholders',()=>{
 const b=engine(),I=b.sandbox.I18n;I.set('ar');for(const[k,v]of Object.entries(en)){const reference=typeof v==='object'?v.other:v,args=Object.fromEntries(vars(reference).map(p=>[p,p==='n'?3:'قيمة']));args.n=3;const text=I.t(k,args);assert.match(text,/[\u0600-\u06ff]/,k);assert(!/\{\w+\}/.test(text),k);assert.notEqual(text,k);}
 assert.deepEqual(plain(I.missing()),[]);
});
test('technical paths, storage names, provider identities and original Italian examples remain intact',()=>{
 for(const[k,tokens]of Object.entries({'audio.recordingFailed':['audio/','index.html'],'path.noDataHint':['data/'],'set.notBuiltHint':['scripts/build_audio.py'],'set.systemVoice':['Web Speech API'],'set.offlineFile':['file://'],'privacy.dispositivo.p1':['localStorage','linguai.italiano.v2'],'privacy.dispositivo.p4':['`linguai.llm.v1`'],'privacy.modello.p2':['Google Gemini','Groq','OpenAI','Anthropic'],'privacy.hosting.p1':['GitHub Pages','IP'],'drill.aux.whyBoth':['ha cambiato casa','è cambiato'],'conj.ph':['parlare','essere','capire','svegliarsi']}))for(const token of tokens)assert(ar[k].includes(token),k+' '+token);
});
test('privacy translations retain the separate disclosures for voice, answers, compositions, automatic exam reports and whole conversations',()=>{
 assert.match(ar['privacy.voce.p2'],/يُرسل تسجيل صوتك إلى خوادم/);assert.match(ar['privacy.voce.p2'],/لا يمرّ التسجيل عبرنا/);assert.match(ar['privacy.voce.p5'],/يبقى التسجيل داخل الصفحة/);
 assert.match(ar['privacy.modello.p2'],/رفضت إجابتك بالفعل/);assert.match(ar['privacy.modello.p3'],/لا يحدث ذلك تلقائيًا/);assert.match(ar['privacy.modello.p5'],/من دون أن تضغط زرًا إضافيًا/);assert.match(ar['privacy.modello.p5'],/إذا كان التحقّق بواسطة النموذج مفعّلًا/);assert.match(ar['privacy.modello.p5'],/لا يُرسل صوتك/);
 assert.match(ar['privacy.modello.p6'],/كل ما قلته/);assert.match(ar['privacy.modello.p6'],/عند كل جولة جديدة/);assert.match(ar['privacy.modello.p6'],/موافقة خاصة/);assert.match(ar['privacy.modello.p6'],/طلب مدفوع/);assert.match(ar['privacy.modello.p4'],/سحب إحداهما لا يسحب الأخرى/);
 assert.match(ar['core.saveBlocked'],/لم يعد تقدّمك يُحفظ/);assert.match(ar['core.storagePruned'],/حُذفت أقدم بطاقات المراجعة/);assert.match(ar['privacy.dispositivo.p3'],/لا يمكن التراجع عنه/);
});
test('complete Arabic UI preserves English/other-language restoration and learner state independently from content fallback',()=>{
 const b=engine(),I=b.sandbox.I18n;b.Core.recordLesson('a1-u01-l1',8,10,120);b.Core.addCard('ciao','مرحبًا','a1-u01-l1');const state=()=>{const s=plain(b.Core.state);delete s.settings.lang;return s;},saved=state();
 for(const lang of ['en','pl','es','fr','de']){const expected=dictionary(lang);I.set(lang);assert.equal(I.t('talk.send'),expected['talk.send']);I.set('ar');assert.equal(I.t('talk.send'),ar['talk.send']);assert.deepEqual(state(),saved);}
 assert.equal(I.contentLanguage('ar'),'en');assert.deepEqual(plain(I.contentOverrides('ar')),{});assert.equal(b.sandbox.LINGUAI.lessonLanguage('ar','c2-u01-l1'),'en');assert.equal(b.Core.state.schema,2);
});
