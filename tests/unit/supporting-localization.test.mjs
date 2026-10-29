import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {join} from 'node:path';
import vm from 'node:vm';
import {loadEngine,CORE,ROOT,assertCanonicalSnapshots} from './_harness.mjs';
import {checkPartialCourse} from '../../scripts/parity.mjs';
import fixture from '../fixtures/supporting-localization.cjs';
const frozen={
  "data/audio-index.js": "f8b5641843767fe48f5d0166e8cc197eeb7636f49dd557329d3a58a97d50a8c8",
  "data/core/a1-01.js": "779f7a2f61f909997010a6d7600645c4b7b88ee5e1853a4d35585eb68bf9a793",
  "data/core/a1-02.js": "c9b18817eba40257c827bed789b3b503a3284336833be701a739dfff0efd39ce",
  "data/core/a1-03.js": "1bf593168636ada1ff03b472bf68414861aa1d0b303f3a89ee07ed6e0ede1323",
  "data/core/a2-01.js": "7a7dea523610a596b05f280edead1b954da3950e57400ebb76ff0b88cb9d8c5a",
  "data/core/a2-02.js": "e8f70cf2523bf046b7d5301c9655720c25f69251c014e747a79e8bc287c43f75",
  "data/core/b1-01.js": "dffd4dadf404b57e69dc6a5e50d489a7f174b58815d3cbe532c80a8cb1658453",
  "data/core/b2-01.js": "f46736d8588c1e352ed2147538347cc734df11df3322fc777a82818352b9a2b1",
  "data/core/b2-02.js": "db0cba8570c0de6c6f2575cca1ebb8678bef3f56f0398d6f6c886fc29c613d0a",
  "data/core/b2-03.js": "16efd5dfed0c213c2e1d21a23fc873cbcb30cdd80aafa8d46e72456e4ff74b3a",
  "data/core/c1-01.js": "80c11f49e1a8162eb732f6c1bf9aa55d1ab2dc05499164ce984b4d13d0153dda",
  "data/core/c1-02.js": "d072bbae565730e4788f64ea2281c39a46f1271277eeb9fab6b0f62b194c5c6c",
  "data/core/c1-03.js": "cf2e651aafd9ad0cc1006be6f3d8f25fa87218266f37d8f10678dbeb6cee6146",
  "data/core/c2-01.js": "d8f70d3379ea80d0675d98d95776c7f1189432d603c2f5881adae808dfa3fdc6",
  "data/core/c2-02.js": "f530b91efb688a239b9a97b01937b508d26f06f130106b083596bff636316f20",
  "data/core/chat-scenarios.js": "606e82a17596ccbebd7ed8e65a2a2871027ea6ad2006a5ba678f5b6d67965237",
  "data/core/cils.js": "2bd7892342dee3cc940f74c9223b463a4755b75e2e165fba357745d6ec95f642",
  "data/core/conversations.js": "f31f9508a268781892e0a0d7a3442bd2e57f197c70487949de63b9c9266b13cb",
  "data/core/curriculum-index.js": "1f6c1e41e19849c4456d285acea0389e195463d5620ef345533214d1ffa16a42",
  "data/core/frequenza.js": "75bd18bd2aafb98b6a6844bc90cefe52aff3d193d424b499b33e8b9004fc903c",
  "data/core/grammar-reference.js": "44134eb886beeb551d5053c1a7b3a3264a73355dc28966657800867abc226343",
  "data/core/interference.js": "33cebbd989efc27e6d630050461e68b509ae1a5468803c190d89f62d011719e3",
  "data/core/library-a1.js": "5772815b0b1d5585fc865f4761dd182516e8c08429cd064f9062ffd3af114a75",
  "data/core/library-a2.js": "6eea7beaeec6071758cee5e01807be8eca747ac386b7c92b32cfe8091170dd5f",
  "data/core/library-b1.js": "930774c9a1444508501d0f04d3b881259b4e8f668ee2478efa14020aaef9439b",
  "data/core/library-b2.js": "a65d051a971b85504153bd485c03dfdd1f1d628b5465a88094492c218bb516e3",
  "data/core/library-c1.js": "72fe84f6df487f07805b96617d00ee93325c6f2e1edb50aa6ad7616fce0179a1",
  "data/core/library-c2.js": "1736983d97bce20a01cc75dcf874d8225c785ed26e6d3ba8e95aa3b21913dbc1",
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
  "data/i18n/en/a1-02.js": "527a0db0113f1bc1641433096543ae2c25a8382a1216f77f88964a26bad69a87",
  "data/i18n/en/a1-03.js": "ea93b9af8565b2f285c459d37b2c651ecbccb41b2d18d2c6711cfeebef21dff0",
  "data/i18n/en/a2-01.js": "dd8fedd10f7d576f6e42d4c8a4d0586d1ea873764b5784aafecb75201a936ba0",
  "data/i18n/en/a2-02.js": "5192d2cc2498f472291681ad8c020e8e594ea078ab6454fe3c225f95ee61bd8c",
  "data/i18n/en/b1-01.js": "98cf6b3d4b154aea005cf4d7cfe999433d1fb401e455b2be3f23799cb02acc15",
  "data/i18n/en/b2-01.js": "21756b09f1ed5b1fda60fa82a179700b62606e68b26be328073827ebd5234dc6",
  "data/i18n/en/b2-02.js": "0aef71f054329cbf8626ba374841272b29495d91c4b20b20dafe15dbd3c203a6",
  "data/i18n/en/b2-03.js": "b9d11103aa141e55a8f8f24040b78dce263f48317ae0bc5a9a821b068b28a521",
  "data/i18n/en/c1-01.js": "4b59c0125facd84ab4ba1dc08765b7a0622b66c1aadbdf9c15dae574ada794dc",
  "data/i18n/en/c1-02.js": "0e071c39cdbe00aed1febf86951db7c4674448ca3e8b1809f382584f396e78ef",
  "data/i18n/en/c1-03.js": "727ee0e5143dadc8b2b8189a17788287a696c1026031fe9414a86b625d2ce5bc",
  "data/i18n/en/c2-01.js": "b1657a2cb1b8598503ae3211f02252f80114c54511cb08ea89045dd3bbee330d",
  "data/i18n/en/c2-02.js": "6fc57db411e6ba01225040762a9f342419a1b2b80854713ce5b59aaf7746d8e9",
  "data/i18n/en/conversations.js": "ee52783a6932982c0d558b9b23c3faf37d46ecde043b9c75388aa684e45ea67b",
  "data/i18n/en/curriculum-index.js": "d2f8e25d5cb794aec73461f9b71f8896128b054e2ff7351e34f84f9d95690c49",
  "data/i18n/en/grammar-reference.js": "75f8d783427ca3fa325efdd9aa13b91a71246192e84d405ba55b34ed336d0f4b",
  "data/i18n/en/interference.js": "02c3a08e2e45e7f21670245371e93c5084050f67b6f0bfbf56314f24bf42194e",
  "data/i18n/en/library-a1.js": "680dd1cb82c3feb1ae75c93c00ac4c207f1903d8d9e472641e3679b7b8c58220",
  "data/i18n/en/library-a2.js": "64baa6bb41607bca0503176391c895ba1acd56bdae1abfc4c48281af624f5a0a",
  "data/i18n/en/library-b1.js": "cf04b13a192ad229a20a0a58b130c14a7c7a60fd8add33af7cab8da044bef3fd",
  "data/i18n/en/library-b2.js": "6cac0d0a6e24844016d712cbb7b35a22a855fcac578a3ad4fe207ced0c35b577",
  "data/i18n/en/library-c1.js": "cd07f507fc261f46f6314f075aaee22f0545a64a30a4e4d12a76a7fed7664f19",
  "data/i18n/en/library-c2.js": "4b020a021425b47123c236da7569f2c5e1a694ed595cfccc0a960578912f1560",
  "data/i18n/en/phonetics.js": "114a6ba79608503def28cdcc3f767cff3e9906b0072263401792bf7f01c95806",
  "data/i18n/en/readings.js": "97ff7965cccf7dc9234b60c05c36a2a2be78c8dbc76a4adf93a5ffaa2c2716e3",
  "data/i18n/en/writing.js": "0bb3d5a6f9756bba6c05795cbf7cadc24d5dd6c3d499c26ba2fef2cdb7051423",
};
const plain=v=>JSON.parse(JSON.stringify(v)),read=f=>readFileSync(join(ROOT,f),'utf8');
const files=Object.keys(fixture.selections),allFiles=files.concat('interference.js','a1-01.js');
function setup(languages=false){const b=loadEngine({files:[...CORE,'assets/js/i18n.js','assets/js/i18n-merge.js','data/i18n/ui-en.js','data/i18n/ui-ar.js']});b.Core.load();for(const f of ['curriculum-index.js',...allFiles.filter(f=>f!=='curriculum-index.js')])vm.runInContext(read('data/core/'+f),b.sandbox);for(const lang of languages?['en']:['en'])for(const f of allFiles)vm.runInContext(read('data/i18n/'+lang+'/'+f),b.sandbox);vm.runInContext(read('data/i18n/ar/a1-01.js'),b.sandbox);return b;}
function language(b,lang){b.Core.state.settings.lang=lang;b.sandbox.I18n.set(lang);b.sandbox.LINGUAI.applyStrings(lang);b.sandbox.Registry.reindex();}
function enable(b,parts=fixture.make(ROOT)){b.sandbox.I18n.LANGS.find(l=>l.code==='ar').contentOverrides=parts.manifest;for(const values of Object.values(parts.byFile))b.sandbox.LINGUAI.addStrings('ar',plain(values));return parts;}
function entry(b,key){const w=b.sandbox,[type,id]=key.split(':');if(type==='level'){const l=b.Core.registry.byCode[id];return plain({name:l.name,desc:l.desc});}if(type==='refsec')return plain(w.GRAMMAR_REF.map(s=>s.title));const pools={ref:w.GRAMMAR_REF.flatMap(s=>s.items),conv:w.CONVERSATIONS,read:w.READINGS,write:w.WRITING,ph:w.PHONETICS};return plain(pools[type].find(v=>v.id===id));}
function neutral(v,target){if(v&&typeof v==='object')for(const k of Object.keys(v))neutral(v[k],target[k]);else assert.equal(target,v);}

test('supporting manifest declares conversations, levels and A1–C1 grammar; original data stay unchanged',()=>{const b=setup(),m=plain(b.sandbox.I18n.contentOverrides('ar'));assert.deepEqual(Object.keys(m).sort(),["conversations.js","curriculum-index.js","grammar-reference.js","library-a1.js","library-a2.js","library-b1.js","library-b2.js","library-c1.js","phonetics.js","readings.js","writing.js"]);assert.equal(m['grammar-reference.js'].length,40);for(const id of ['g-nome-avanzato','g-participio','g-perifrasi'])assert(!m['grammar-reference.js'].includes('ref:'+id));assert.equal(m['conversations.js'].length,14);assert.deepEqual(m['curriculum-index.js'],['level:A1','level:A2','level:B1','level:B2','level:C1']);assert.equal(Object.values(b.sandbox.I18n.courseOverrides('ar')).flat().length,187);assertCanonicalSnapshots(frozen);});
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
