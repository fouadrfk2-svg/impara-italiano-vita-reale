import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {join} from 'node:path';
import {createHash} from 'node:crypto';
import vm from 'node:vm';
import {loadEngine,CORE,ROOT} from './_harness.mjs';
import {checkPartialCourse} from '../../scripts/parity.mjs';
import fixture from '../fixtures/supporting-localization.cjs';
const frozen={
  "data/audio-index.js": "f8b5641843767fe48f5d0166e8cc197eeb7636f49dd557329d3a58a97d50a8c8",
  "data/core/a1-01.js": "8fd2ad2fd51e9f060df860666db1132c2681eca1eeafc4b3227e27fafe0cf8cd",
  "data/core/a1-02.js": "4e341b7accf3f768216fcba91783c90397f19650da56ae293baec206c6273c42",
  "data/core/a1-03.js": "25d2d18db9fd583f87b0cf1849583399972ba5f83b4f7cbdebf881a5a50ef62c",
  "data/core/a2-01.js": "a5a59fa0ea4980e1b369155b6a42cac5c9553ac1d9f5a990ceb987caaf2a4d9e",
  "data/core/a2-02.js": "57b31454a876b153d6f99acc997a8d74a4bef3c14ca77ba50a1e6b9c878aa3b2",
  "data/core/b1-01.js": "84ceb6712f58ad6e1d50116cf7315b9e9bdaaf02a213ba46b9984534f1756573",
  "data/core/b2-01.js": "a2d8f305d4d684ec9cb2dc45d1b8b0b3e7d7d33e8a87c3ebbb225d09386c2431",
  "data/core/b2-02.js": "3aa2c700c634696bc569d2c189fc0642b4547996dfb179ea2c09a8d9bcbb9a67",
  "data/core/b2-03.js": "33b7520263a1b80b9407d1b7547833fe11a8eeebb75c7864426a7e41e22f2d7e",
  "data/core/c1-01.js": "f40c15594a03891e6ccfae0c421f57335c5947991f12782dc797df062801f3e3",
  "data/core/c1-02.js": "e9290c45d1278886d43ca61bca40dbbcdaeeb5ff9e86006ded10f15aa54e5a23",
  "data/core/c1-03.js": "a3287ab5893457a0ba5eefb82c429245269061f6350af47eb97dff21ec82fcd4",
  "data/core/c2-01.js": "c83185f4749a53c8693026a2644f13d22edcaed68bdf21f4cbb6b53e040b01b5",
  "data/core/c2-02.js": "7ac8b9764e6574caeefacce842ffc2dbafc3fe16e35fd8cad264b6e70c3de542",
  "data/core/chat-scenarios.js": "606e82a17596ccbebd7ed8e65a2a2871027ea6ad2006a5ba678f5b6d67965237",
  "data/core/cils.js": "2bd7892342dee3cc940f74c9223b463a4755b75e2e165fba357745d6ec95f642",
  "data/core/conversations.js": "f31f9508a268781892e0a0d7a3442bd2e57f197c70487949de63b9c9266b13cb",
  "data/core/curriculum-index.js": "1f6c1e41e19849c4456d285acea0389e195463d5620ef345533214d1ffa16a42",
  "data/core/frequenza.js": "75bd18bd2aafb98b6a6844bc90cefe52aff3d193d424b499b33e8b9004fc903c",
  "data/core/grammar-reference.js": "44134eb886beeb551d5053c1a7b3a3264a73355dc28966657800867abc226343",
  "data/core/interference.js": "33cebbd989efc27e6d630050461e68b509ae1a5468803c190d89f62d011719e3",
  "data/core/library-a1.js": "dec87394a64e71e6299e115ec10aa2f0c12d279dd311316c8a86a8a4e100f631",
  "data/core/library-a2.js": "d43173213ad5b28dfc1ef5223b3763349d43a28a7b17b4331753a09fcb9a3c35",
  "data/core/library-b1.js": "2455914a966121319d2fc16a8c4517963f59948eca269e4dccc89aa76853192f",
  "data/core/library-b2.js": "933fd38b8c32cffec65bf8e31ce0bebbd7c3f364db18f1b185a9bf9b3a60dc79",
  "data/core/library-c1.js": "3a3e8f6a96af083427a7ecf92b3f4d37ff00fb547ccfa203d62ab78299631921",
  "data/core/library-c2.js": "7f271d4d051a9dd1b549c8e8c5890db85f8f4c68c8084e9f6015c48c4b090794",
  "data/core/phonetics.js": "4a5a31b1abdda7118838347a18a831304db5d982f24c7b09a0bdff7655a8d1c2",
  "data/core/readings.js": "e3930ad98391099a55503a3b86e17f06721cf2b3ce8ca47d6a574ccaa1c5c7ff",
  "data/core/writing.js": "6013fd46b4aab041b94626539d0c3fb5cab5da6fa894e1ae140c2c264f4d41b3",
  "data/i18n/ar/a1-01.js": "fb0816c334408a20991cf77404e68a54e6712f1ee5cb283588abad73e0d291d0",
  "data/i18n/ar/a1-02.js": "e1268fec9b02af562f38366e7af9e89bbe31f0bcde31e05a471423048fd596b7",
  "data/i18n/ar/a1-03.js": "cf87821e14692288c36882199e334becdd95ba8ad4425b53dd8ba310d71db488",
  "data/i18n/ar/a2-01.js": "c592ad5679f501e8dd6a4a0f1715bcc6534b05efb55e83c8c392ec2249837ef2",
  "data/i18n/ar/a2-02.js": "2624a3934b50862a9e99f58c2aa5eff65dc22fe9a0f78771987282ec841c3f14",
  "data/i18n/ar/b1-01.js": "84689c17a13a31c754e9b825217437d9f00acf1ec77f999dd49684f775ab9b62",
  "data/i18n/ar/b2-01.js": "3e3f5786a3a65fc0629ce6de8c7bdfdddc57d8c00ef2909f30627aabc9360e30",
  "data/i18n/ar/b2-02.js": "122a151bf2be451a55d96f38927076a71fd45e8b4da1f6524cdd3d5127fdf5d4",
  "data/i18n/ar/b2-03.js": "6246a0be089ddb5ba2b09fcbc1162e1de4acb3c75018ccc6702f2c5d1b1e6ce1",
  "data/i18n/ar/c1-01.js": "67784262a1c924c9048c94910aaa9a60661e2993e94584c4ec98a582cfce462b",
  "data/i18n/ar/c1-02.js": "b9a3a904905cd60349eef7a6694496f52a647e1e2f62a699c647ab0107a66cf0",
  "data/i18n/ar/c1-03.js": "f3c159afa4aeb496d9a1cda964e076d0cf65c55b27abc4c21881cfd64fd8ae5b",
  "data/i18n/en/a1-01.js": "b35d10335a32f2bd92866bcd734c06154c38384462b2da8f0dc0a93ebb6509e2",
  "data/i18n/en/a1-02.js": "5c7f5e9e09fd636c1ca7b38a15452ede86e8fde36e6982d6b745aa144e38c39d",
  "data/i18n/en/a1-03.js": "ac4501e642faa3f5d22b8ca77bc975a4d558149b9cbb0f646e01a6819f75f773",
  "data/i18n/en/a2-01.js": "49101cbd8bf567b8e576ba8b4c94a29c9ecb5e861972a8bd7c9d28ef417ab9f2",
  "data/i18n/en/a2-02.js": "d11cdc36eb298acb2ab4e12dc8e812473fbc8f7d35250e0e3d7f8185061995de",
  "data/i18n/en/b1-01.js": "9547feeedb41865c68b28537cfb0151594f7ea3350c36b2309dcc9bb335ed3ba",
  "data/i18n/en/b2-01.js": "adf10ca0da323798fa16f30c0038c1a5792a52c16a39b59b1b02a1da4839abb8",
  "data/i18n/en/b2-02.js": "1c8330d9d66404da8b54570be15dbaaee230ca084553c3c82d63a112e91d7037",
  "data/i18n/en/b2-03.js": "5fc355abc1d24107fcc20298530fdb2e31d7b76db269600a138d4f8cd2f34a48",
  "data/i18n/en/c1-01.js": "edb5a23248cfaaa718fcd88e065fd10251873ac615ab3579cfd1642c839eb363",
  "data/i18n/en/c1-02.js": "d3f72f093f41250d4917dd5c39738eae85f6fa6758be736549af3921480d335c",
  "data/i18n/en/c1-03.js": "796f319f5ff2fa836638a593c26ae36aa72c396e765320166640c00739da4719",
  "data/i18n/en/c2-01.js": "eec343f2580fdee5b434f77f444c2334cafa97099c24ec03b8a66f51992ed4cc",
  "data/i18n/en/c2-02.js": "ceb840adad0645a28c2769aa5a4c4719ce3487b18364c9a3c3ded1a8eccb8bbd",
  "data/i18n/en/conversations.js": "a76c86e530e2a660ce74c70aad043f4c9551510ee2b3f6cefa6ad48c8ff989c7",
  "data/i18n/en/curriculum-index.js": "f77feda9d738f07e6647c68cc9abe49b01dedf17968bd4bfdedcc40f775aa963",
  "data/i18n/en/grammar-reference.js": "803628efe2a0f2e5a8b86b5583f4a20cbe0dc911fa25e7e2cc1ff1f3d6da58d7",
  "data/i18n/en/interference.js": "02c3a08e2e45e7f21670245371e93c5084050f67b6f0bfbf56314f24bf42194e",
  "data/i18n/en/library-a1.js": "fafce1f6c275bff1f9e25d2605d85291efad5703752dac2e3f9122e158e1e43c",
  "data/i18n/en/library-a2.js": "a2944da0ba258313dbf13a4a8f66ae58c9b278f446d55e30085459de015c7a3d",
  "data/i18n/en/library-b1.js": "61ea03cf5c16af7ddb0be3eff832829349b7a64402a7e11b99751af05dff7fbd",
  "data/i18n/en/library-b2.js": "1f74aaa5cbc34396c0deab8b8253a41e5ee2ba46392e5a17c08c812c28fdb11d",
  "data/i18n/en/library-c1.js": "9abaa386d3747563fe819606b26e0ff3d10c601135d2161ae26c9c8f6c391bfb",
  "data/i18n/en/library-c2.js": "f30b2d3d14aecc34bf9292933db228a8cd2633eaa4704ebbf54566b94da12f83",
  "data/i18n/en/phonetics.js": "45e6b2263e418ca0c2130d5cb975ea72760cd492a53633b5b00627fe949e3a96",
  "data/i18n/en/readings.js": "624d85b780dcf860ae1513ff9be2724ba4deff1642593c005bcf92da6957f24e",
  "data/i18n/en/writing.js": "f65d7ca7dd0d31508db4baf2c9059aeb0c4dbc60074b314aa334888e12ab2184",
};
const plain=v=>JSON.parse(JSON.stringify(v)),read=f=>readFileSync(join(ROOT,f),'utf8');
const files=Object.keys(fixture.selections),allFiles=files.concat('interference.js','a1-01.js');
function setup(languages=false){const b=loadEngine({files:[...CORE,'assets/js/i18n.js','assets/js/i18n-merge.js','data/i18n/ui-en.js','data/i18n/ui-ar.js']});b.Core.load();for(const f of ['curriculum-index.js',...allFiles.filter(f=>f!=='curriculum-index.js')])vm.runInContext(read('data/core/'+f),b.sandbox);for(const lang of languages?['en']:['en'])for(const f of allFiles)vm.runInContext(read('data/i18n/'+lang+'/'+f),b.sandbox);vm.runInContext(read('data/i18n/ar/a1-01.js'),b.sandbox);return b;}
function language(b,lang){b.Core.state.settings.lang=lang;b.sandbox.I18n.set(lang);b.sandbox.LINGUAI.applyStrings(lang);b.sandbox.Registry.reindex();}
function enable(b,parts=fixture.make(ROOT)){b.sandbox.I18n.LANGS.find(l=>l.code==='ar').contentOverrides=parts.manifest;for(const values of Object.values(parts.byFile))b.sandbox.LINGUAI.addStrings('ar',plain(values));return parts;}
function entry(b,key){const w=b.sandbox,[type,id]=key.split(':');if(type==='level'){const l=b.Core.registry.byCode[id];return plain({name:l.name,desc:l.desc});}if(type==='refsec')return plain(w.GRAMMAR_REF.map(s=>s.title));const pools={ref:w.GRAMMAR_REF.flatMap(s=>s.items),conv:w.CONVERSATIONS,read:w.READINGS,write:w.WRITING,ph:w.PHONETICS};return plain(pools[type].find(v=>v.id===id));}
function neutral(v,target){if(v&&typeof v==='object')for(const k of Object.keys(v))neutral(v[k],target[k]);else assert.equal(target,v);}

test('supporting manifest declares conversations, levels and A1–C1 grammar; original data stay unchanged',()=>{const b=setup(),m=plain(b.sandbox.I18n.contentOverrides('ar'));assert.deepEqual(Object.keys(m).sort(),["conversations.js","curriculum-index.js","grammar-reference.js","library-a1.js","library-a2.js","library-b1.js","library-b2.js","library-c1.js","phonetics.js","readings.js","writing.js"]);assert.equal(m['grammar-reference.js'].length,40);for(const id of ['g-nome-avanzato','g-participio','g-perifrasi'])assert(!m['grammar-reference.js'].includes('ref:'+id));assert.equal(m['conversations.js'].length,14);assert.deepEqual(m['curriculum-index.js'],['level:A1','level:A2','level:B1','level:B2','level:C1']);assert.equal(Object.values(b.sandbox.I18n.courseOverrides('ar')).flat().length,187);for(const[f,h]of Object.entries(frozen))assert.equal(createHash('sha256').update(readFileSync(join(ROOT,f))).digest('hex'),h,f);});
test('undeclared supporting data cannot replace English; Arabic A1 remains active and C2 metadata stays English',()=>{const b=setup(),parts=fixture.make(ROOT);b.sandbox.I18n.LANGS.find(l=>l.code==='ar').contentOverrides={};Object.values(parts.byFile).forEach(p=>b.sandbox.LINGUAI.addStrings('ar',p));language(b,'en');const base=Object.fromEntries(Object.keys(parts.reference).filter(k=>Object.values(parts.manifest).flat().includes(k)).map(k=>[k,entry(b,k)])),c2=entry(b,'level:C2');language(b,'en');language(b,'ar');for(const[k,v]of Object.entries(base)){assert.deepEqual(entry(b,k),v);assert.equal(b.sandbox.LINGUAI.entryLanguage('ar',k),'en');}assert.equal(b.sandbox.LINGUAI.lessonLanguage('ar','a1-u01-l1'),'ar');assert.deepEqual(entry(b,'level:C2'),c2);});

for(const[file,keys]of Object.entries(fixture.selections))for(const key of keys){
 test(key+' enables independently, uses atomic fallback and restores through every language',()=>{const b=setup(true),parts=fixture.make(ROOT);language(b,'en');const original=entry(b,key),neutralBefore=plain(b.Core.registry.byCode.A1.units);enable(b,{manifest:{[file]:[key]},byFile:{[file]:{[key]:parts.byFile[file][key]}}});language(b,'ar');assert.equal(b.sandbox.LINGUAI.entryLanguage('ar',key),'ar');const ar=entry(b,key);assert.notDeepEqual(ar,original);assert.equal(b.sandbox.LINGUAI.entryLanguage('ar','level:C2'),'en');
  for(const lang of ['en']){language(b,lang);const full=entry(b,key);for(const next of ['ar',lang,'ar']){language(b,next);assert.deepEqual(entry(b,key),next==='ar'?ar:full);}}
  // An injected grading field cannot enter a supporting patch.
  const damage=plain(parts.byFile[file][key]);if(Array.isArray(damage))damage.pop();else damage.answerKey=99;b.sandbox.LINGUAI.addStrings('ar',{[key]:damage});language(b,'en');language(b,'ar');assert.equal(b.sandbox.LINGUAI.entryLanguage('ar',key),'en');assert.deepEqual(entry(b,key),original);
  const current=plain(b.Core.registry.byCode.A1.units);assert.deepEqual(current.map(u=>u.lessons.map(l=>l.exercises.map(e=>e.a))),neutralBefore.map(u=>u.lessons.map(l=>l.exercises.map(e=>e.a))));
 });
 test(key+' rejects missing, empty, wrong-type and short nested supporting fields',()=>{const b=setup(),parts=enable(b),base=plain(parts.byFile[file][key]);language(b,'en');const en=entry(b,key);const paths=[];function leaves(v,p=[]){if(typeof v==='string'&&v.trim())paths.push(p);else if(v&&typeof v==='object')for(const k of Object.keys(v))leaves(v[k],p.concat(k));}leaves(base);for(const invalid of ['', '   ', 12, null]){const broken=plain(base);if(Array.isArray(broken)){broken[0]=invalid;}else{const p=paths[0];let at=broken;for(const k of p.slice(0,-1))at=at[k];at[p.at(-1)]=invalid;}b.sandbox.LINGUAI.addStrings('ar',{[key]:broken});language(b,'ar');assert.equal(b.sandbox.LINGUAI.entryLanguage('ar',key),'en');assert.deepEqual(entry(b,key),en);}const missing=plain(base);if(Array.isArray(missing))missing.pop();else delete missing[Object.keys(missing)[0]];b.sandbox.LINGUAI.addStrings('ar',{[key]:missing});language(b,'ar');assert.deepEqual(entry(b,key),en);});
}

test('all neutral IDs, Italian, audio targets, branches and answers survive selective supporting overrides',()=>{const b=setup(),initial={levels:plain(b.Core.registry.levels),grammar:plain(b.sandbox.GRAMMAR_REF),conversations:plain(b.sandbox.CONVERSATIONS),readings:plain(b.sandbox.READINGS),writing:plain(b.sandbox.WRITING),phonetics:plain(b.sandbox.PHONETICS)};enable(b);language(b,'ar');for(const[name,arr]of Object.entries(initial)){const target=name==='levels'?b.Core.registry.levels:b.sandbox[{grammar:'GRAMMAR_REF',conversations:'CONVERSATIONS',readings:'READINGS',writing:'WRITING',phonetics:'PHONETICS'}[name]];neutral(arr,target);}});
test('the loader requests declared supporting files only after English and retries failed Arabic scripts',()=>{const b=setup(),I=b.sandbox.I18n,R=b.sandbox.Registry,parts=enable(b);const input=files.concat('interference.js','c2-01.js','library-c2.js');assert.deepEqual(plain(R.i18nPaths('ar',input)),input.map(f=>'data/i18n/en/'+f).concat(files.map(f=>'data/i18n/ar/'+f)));const failed=['data/i18n/ar/conversations.js'];const paths=R.i18nPaths('ar',input);R.markI18n(paths,failed);assert.deepEqual(plain(R.i18nPaths('ar',input)),failed);R.markI18n(failed,[]);assert.deepEqual(plain(R.i18nPaths('ar',input)),[]);for(const lang of ['en'])assert.deepEqual(plain(I.contentOverrides(lang)),{});I.LANGS.find(l=>l.code==='ar').contentOverrides={'unknown.js':['ref:unknown'],'grammar-reference.js':[9],'phonetics.js':null};assert.deepEqual(plain(I.overlayOverrides('ar')),plain(I.courseOverrides('ar')));assert(!I.supportsContent('interference.js','int:camera'));assert(!I.supportsContent('readings.js','read:lib-a1-giornata'));assert(parts);});
test('parity validates every supporting field, rejects blank/extra/unknown/misfiled/duplicate declarations',()=>{const parts=fixture.make(ROOT),check=p=>{const out=[];checkPartialCourse({},p.byFile,parts.reference,out,p.manifest);return out;};assert.deepEqual(check(parts),[]);for(const damage of [p=>{p.byFile['conversations.js']['conv:bar-mattina'].turns.pop();},p=>{p.byFile['grammar-reference.js']['ref:g-nome-genere'].body=' ';},p=>{p.manifest['unknown.js']=['ref:g-nome-genere'];p.byFile['unknown.js']={'ref:g-nome-genere':parts.byFile['grammar-reference.js']['ref:g-nome-genere']};},p=>p.manifest['phonetics.js'].push('ph:ph-doppie'),p=>p.manifest['phonetics.js']='ph:ph-doppie',p=>p.byFile['writing.js']['write:w-a2-ieri'].a=1,p=>delete p.byFile['readings.js']]){const changed=plain(parts);damage(changed);assert(check(changed).length>0);}});
test('reading/library and manually edited Arabic meanings preserve English glosses and saved schedules',()=>{const b=setup(),parts=fixture.make(ROOT);language(b,'en');const reading=b.sandbox.READINGS.find(r=>r.id==='r-a1-mattina'),it=reading.glossIt[0],en=reading.gloss[0];const k=b.Core.addCard(it,en,'lettura:'+reading.id);const schedule=plain(b.Core.state.srs[k]);enable(b,parts);language(b,'ar');const translated=reading.gloss[0];b.Core.addCard(it,translated,'lettura:'+reading.id);assert.equal(b.Core.state.srs[k].tr.en,en);assert.equal(b.Core.state.srs[k].tr.ar,translated);const current=plain(b.Core.state.srs[k]);delete current.tr;delete schedule.tr;assert.deepEqual(current,schedule);b.Core.addCard('parola-di-test','اختبار معنى','lettura:non-tradotto');assert.equal(b.Core.state.srs['parola-di-test'].tr.ar,'اختبار معنى');const state=()=>{const s=plain(b.Core.state);delete s.settings.lang;return s;},saved=state();for(const l of ['en','ar']){language(b,l);assert.deepEqual(state(),saved);}assert.equal(b.Core.state.schema,2);});
test('language attributes follow actual supporting/fallback and meaning languages without affecting Italian controls',()=>{const b=setup(),I=b.sandbox.I18n;enable(b);language(b,'ar');assert.match(I.contentAttrs('ref:g-nome-genere'),/lang="ar" dir="rtl"/);assert.match(I.contentAttrs('ref:g-nome-plurale'),/lang="en" dir="ltr"/);assert.match(I.contentAttrs('it'),/lang="it" dir="ltr"/);assert.match(I.meaningAttrs('اختبار'),/dir="rtl"/);assert.match(I.meaningAttrs('English'),/lang="en"/);assert.match(I.languageAttrs('bad"<'),/lang="en"/);const attrs={},node={setAttribute(k,v){attrs[k]=v;}};I.markContent(node,'read:r-a1-mattina');assert.equal(attrs.dir,'rtl');I.markMeaning(node,'English');assert.equal(attrs.dir,'ltr');I.markMeaning(node,'اختبار');assert.equal(attrs.dir,'rtl');I.markContent(null,'read:r-a1-mattina');language(b,'en');assert.match(I.meaningAttrs('sens'),/lang="en"/);});
