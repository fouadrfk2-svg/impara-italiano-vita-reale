import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {join} from 'node:path';
import vm from 'node:vm';
import {loadEngine,CORE,VERBS,ROOT,assertCanonicalSnapshots} from './_harness.mjs';
import {checkPartialCourse} from '../../scripts/parity.mjs';
import plans from '../fixtures/arabic-b2-plans.cjs';
const preservedHashes={
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
  "data/i18n/ar/b1-01.js": "84689c17a13a31c754e9b825217437d9f00acf1ec77f999dd49684f775ab9b62"
};
const italianLeaves={
  "unit:b2-u01": [],
  "lesson:b2-u01-l1": [
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
    "/exercises/5/opts/0",
    "/exercises/5/opts/1",
    "/exercises/5/opts/2"
  ],
  "lesson:b2-u01-l2": [
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
    "/grammar/table/rows/3/2",
    "/grammar/table/rows/3/3",
    "/grammar/table/rows/4/0",
    "/grammar/table/rows/4/2",
    "/grammar/table/rows/4/3",
    "/grammar/table/rows/5/0",
    "/grammar/table/rows/5/2",
    "/grammar/table/rows/5/3",
    "/exercises/2/opts/0",
    "/exercises/2/opts/1",
    "/exercises/2/opts/2",
    "/exercises/3/opts/0",
    "/exercises/3/opts/1",
    "/exercises/3/opts/2"
  ],
  "lesson:b2-u01-l3": [
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
    "/grammar/table/rows/3/1",
    "/grammar/table/rows/3/2",
    "/grammar/table/rows/4/0",
    "/grammar/table/rows/4/1",
    "/grammar/table/rows/4/2",
    "/grammar/table/rows/5/0",
    "/grammar/table/rows/5/1",
    "/grammar/table/rows/5/2",
    "/grammar/table/rows/6/0",
    "/grammar/table/rows/6/1",
    "/grammar/table/rows/6/2",
    "/exercises/0/opts/0",
    "/exercises/0/opts/1",
    "/exercises/0/opts/2",
    "/exercises/4/opts/0",
    "/exercises/4/opts/1",
    "/exercises/4/opts/2",
    "/exercises/4/opts/3",
    "/exercises/4/opts/4"
  ],
  "lesson:b2-u01-test": [
    "/exercises/4/opts/0",
    "/exercises/4/opts/1",
    "/exercises/4/opts/2",
    "/exercises/5/opts/0",
    "/exercises/5/opts/1",
    "/exercises/5/opts/2",
    "/exercises/7/opts/0",
    "/exercises/7/opts/1",
    "/exercises/7/opts/2",
    "/exercises/7/opts/3"
  ],
  "unit:b2-u02": [],
  "lesson:b2-u02-l1": [
    "/grammar/table/rows/0/1",
    "/grammar/table/rows/0/2",
    "/grammar/table/rows/0/3",
    "/grammar/table/rows/1/1",
    "/grammar/table/rows/1/2",
    "/grammar/table/rows/1/3",
    "/grammar/table/rows/2/1",
    "/grammar/table/rows/2/2",
    "/grammar/table/rows/2/3",
    "/grammar/table/rows/3/1",
    "/grammar/table/rows/3/2",
    "/grammar/table/rows/3/3",
    "/grammar/table/rows/4/1",
    "/grammar/table/rows/4/2",
    "/grammar/table/rows/4/3",
    "/exercises/0/opts/0",
    "/exercises/0/opts/1",
    "/exercises/0/opts/2",
    "/exercises/1/opts/0",
    "/exercises/1/opts/1",
    "/exercises/1/opts/2",
    "/exercises/3/opts/0",
    "/exercises/3/opts/1",
    "/exercises/3/opts/2"
  ],
  "lesson:b2-u02-l2": [
    "/grammar/table/rows/0/1",
    "/grammar/table/rows/0/2",
    "/grammar/table/rows/1/1",
    "/grammar/table/rows/1/2",
    "/grammar/table/rows/2/1",
    "/grammar/table/rows/2/2",
    "/grammar/table/rows/3/1",
    "/grammar/table/rows/3/2",
    "/grammar/table/rows/4/2",
    "/grammar/table/rows/5/2"
  ],
  "lesson:b2-u02-l3": [
    "/grammar/table/rows/0/2",
    "/grammar/table/rows/1/2",
    "/grammar/table/rows/2/2",
    "/grammar/table/rows/3/1",
    "/grammar/table/rows/3/2",
    "/grammar/table/rows/4/1",
    "/grammar/table/rows/4/2",
    "/grammar/table/rows/5/2",
    "/exercises/2/opts/0",
    "/exercises/2/opts/1",
    "/exercises/2/opts/2"
  ],
  "lesson:b2-u02-test": [
    "/exercises/0/opts/0",
    "/exercises/0/opts/1",
    "/exercises/0/opts/2",
    "/exercises/1/opts/0",
    "/exercises/1/opts/1",
    "/exercises/1/opts/2",
    "/exercises/7/opts/0",
    "/exercises/7/opts/1",
    "/exercises/7/opts/2"
  ],
  "unit:b2-u03": [],
  "lesson:b2-u03-l1": [
    "/grammar/table/rows/0/0",
    "/grammar/table/rows/0/1",
    "/grammar/table/rows/1/0",
    "/grammar/table/rows/1/1",
    "/grammar/table/rows/2/0",
    "/grammar/table/rows/2/1",
    "/grammar/table/rows/3/0",
    "/grammar/table/rows/3/1",
    "/grammar/table/rows/4/1",
    "/grammar/table/rows/5/1"
  ],
  "lesson:b2-u03-l2": [
    "/grammar/table/head/1",
    "/grammar/table/head/2",
    "/grammar/table/head/3",
    "/grammar/table/head/4",
    "/grammar/table/rows/0/0",
    "/grammar/table/rows/0/1",
    "/grammar/table/rows/0/2",
    "/grammar/table/rows/0/3",
    "/grammar/table/rows/0/4",
    "/grammar/table/rows/1/0",
    "/grammar/table/rows/1/1",
    "/grammar/table/rows/1/2",
    "/grammar/table/rows/1/3",
    "/grammar/table/rows/1/4",
    "/grammar/table/rows/2/0",
    "/grammar/table/rows/2/1",
    "/grammar/table/rows/2/2",
    "/grammar/table/rows/2/3",
    "/grammar/table/rows/2/4",
    "/grammar/table/rows/3/0",
    "/grammar/table/rows/3/1",
    "/grammar/table/rows/3/2",
    "/grammar/table/rows/3/3",
    "/grammar/table/rows/3/4",
    "/grammar/table/rows/4/0",
    "/grammar/table/rows/4/1",
    "/grammar/table/rows/4/2",
    "/grammar/table/rows/4/3",
    "/grammar/table/rows/4/4",
    "/grammar/table/rows/5/0",
    "/grammar/table/rows/5/1",
    "/grammar/table/rows/5/2",
    "/grammar/table/rows/5/3",
    "/grammar/table/rows/5/4",
    "/grammar/table/rows/6/0",
    "/grammar/table/rows/6/1",
    "/grammar/table/rows/6/2",
    "/grammar/table/rows/6/3",
    "/grammar/table/rows/6/4",
    "/grammar/table/rows/7/0",
    "/grammar/table/rows/7/1",
    "/grammar/table/rows/7/2",
    "/grammar/table/rows/7/3",
    "/grammar/table/rows/7/4"
  ],
  "lesson:b2-u03-l3": [
    "/grammar/table/rows/0/0",
    "/grammar/table/rows/0/1",
    "/grammar/table/rows/1/0",
    "/grammar/table/rows/1/1",
    "/grammar/table/rows/2/0",
    "/grammar/table/rows/2/1",
    "/grammar/table/rows/3/0",
    "/grammar/table/rows/3/1",
    "/grammar/table/rows/4/0",
    "/grammar/table/rows/4/1",
    "/grammar/table/rows/5/0",
    "/grammar/table/rows/5/1",
    "/exercises/0/opts/0",
    "/exercises/0/opts/1",
    "/exercises/0/opts/2"
  ],
  "lesson:b2-u03-test": [
    "/exercises/5/opts/0",
    "/exercises/5/opts/1",
    "/exercises/5/opts/2"
  ],
  "unit:b2-u04": [],
  "lesson:b2-u04-l1": [
    "/grammar/table/rows/0/0",
    "/grammar/table/rows/1/0",
    "/grammar/table/rows/2/0",
    "/grammar/table/rows/3/0",
    "/grammar/table/rows/4/0",
    "/grammar/table/rows/5/0",
    "/grammar/table/rows/6/0"
  ],
  "lesson:b2-u04-l2": [
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
    "/exercises/3/opts/0",
    "/exercises/3/opts/1"
  ],
  "lesson:b2-u04-l3": [
    "/grammar/table/rows/0/1",
    "/grammar/table/rows/1/1",
    "/grammar/table/rows/2/1",
    "/grammar/table/rows/3/1",
    "/grammar/table/rows/4/1",
    "/grammar/table/rows/5/1"
  ],
  "lesson:b2-u04-test": [
    "/exercises/3/opts/0",
    "/exercises/3/opts/1",
    "/exercises/3/opts/2",
    "/exercises/7/opts/0",
    "/exercises/7/opts/1",
    "/exercises/7/opts/2"
  ],
  "unit:b2-u05": [],
  "lesson:b2-u05-l1": [
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
    "/grammar/table/rows/4/0",
    "/grammar/table/rows/4/1",
    "/grammar/table/rows/4/2",
    "/exercises/0/opts/0",
    "/exercises/0/opts/1",
    "/exercises/0/opts/2",
    "/exercises/3/opts/0",
    "/exercises/3/opts/1",
    "/exercises/3/opts/2",
    "/exercises/6/opts/0",
    "/exercises/6/opts/1",
    "/exercises/6/opts/2"
  ],
  "lesson:b2-u05-l2": [
    "/grammar/table/rows/0/0",
    "/grammar/table/rows/0/1",
    "/grammar/table/rows/1/0",
    "/grammar/table/rows/1/1",
    "/grammar/table/rows/1/2",
    "/grammar/table/rows/2/0",
    "/grammar/table/rows/2/1",
    "/grammar/table/rows/3/0",
    "/grammar/table/rows/3/1",
    "/grammar/table/rows/4/0",
    "/grammar/table/rows/4/1",
    "/grammar/table/rows/4/2",
    "/grammar/table/rows/5/0",
    "/grammar/table/rows/5/1",
    "/exercises/0/opts/0",
    "/exercises/0/opts/1",
    "/exercises/0/opts/2",
    "/exercises/3/opts/0",
    "/exercises/3/opts/1",
    "/exercises/3/opts/2",
    "/exercises/7/opts/0",
    "/exercises/7/opts/1",
    "/exercises/7/opts/2"
  ],
  "lesson:b2-u05-l3": [
    "/grammar/table/rows/0/0",
    "/grammar/table/rows/0/1",
    "/grammar/table/rows/1/0",
    "/grammar/table/rows/1/1",
    "/grammar/table/rows/2/0",
    "/grammar/table/rows/2/1",
    "/grammar/table/rows/3/0",
    "/grammar/table/rows/3/1",
    "/exercises/0/opts/0",
    "/exercises/0/opts/1",
    "/exercises/0/opts/2",
    "/exercises/3/opts/0",
    "/exercises/3/opts/1",
    "/exercises/3/opts/2",
    "/exercises/4/opts/0",
    "/exercises/4/opts/1",
    "/exercises/4/opts/2"
  ],
  "lesson:b2-u05-test": [
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
  "unit:b2-u06": [],
  "lesson:b2-u06-l1": [
    "/grammar/table/rows/0/0",
    "/grammar/table/rows/0/2",
    "/grammar/table/rows/1/0",
    "/grammar/table/rows/1/2",
    "/grammar/table/rows/2/0",
    "/grammar/table/rows/2/2",
    "/grammar/table/rows/3/0",
    "/grammar/table/rows/3/2",
    "/grammar/table/rows/4/2",
    "/exercises/4/opts/0",
    "/exercises/4/opts/1",
    "/exercises/4/opts/2"
  ],
  "lesson:b2-u06-l2": [
    "/grammar/table/rows/0/2",
    "/grammar/table/rows/1/2",
    "/grammar/table/rows/2/2",
    "/grammar/table/rows/3/2",
    "/grammar/table/rows/4/0",
    "/grammar/table/rows/4/2",
    "/exercises/7/opts/0",
    "/exercises/7/opts/1",
    "/exercises/7/opts/2"
  ],
  "lesson:b2-u06-l3": [
    "/grammar/table/rows/0/0",
    "/grammar/table/rows/1/0",
    "/grammar/table/rows/2/0",
    "/grammar/table/rows/3/0",
    "/grammar/table/rows/4/0",
    "/grammar/table/rows/5/0",
    "/exercises/4/opts/0",
    "/exercises/4/opts/1",
    "/exercises/4/opts/2"
  ],
  "lesson:b2-u06-test": [
    "/exercises/6/opts/0",
    "/exercises/6/opts/1",
    "/exercises/6/opts/2"
  ]
};
const plain=v=>JSON.parse(JSON.stringify(v)),read=f=>readFileSync(join(ROOT,f),'utf8');
const files=['a1-01.js','a1-02.js','a1-03.js','a2-01.js','a2-02.js','b1-01.js','b2-01.js','b2-02.js','b2-03.js','c1-01.js','c1-02.js','c1-03.js'];
const b2Files=files.filter(f=>f.startsWith('b2-')),fallbackFiles=['c2-01.js','c2-02.js'];
function bag(lang,file){let out;vm.runInNewContext(read('data/i18n/'+lang+'/'+file),{LINGUAI:{addStrings(_l,b){out=plain(b);}}});return out;}
const bags=lang=>Object.fromEntries(files.map(f=>[f,bag(lang,f)])),entries=lang=>Object.assign({},...Object.values(bags(lang)));
const ar=Object.assign({},...b2Files.map(f=>bag('ar',f))),en=Object.assign({},...b2Files.map(f=>bag('en',f)));
const fileFor=id=>b2Files.find(f=>Object.hasOwn(bag('en',f),'lesson:'+id));
// Load the target file per exercise; only cross-level/cross-language tests load all fixtures.
function setup({all=false,languages=false,fallback=false,history=false,file=null}={}){const b=loadEngine({files:[...CORE,...VERBS,'assets/js/i18n.js','assets/js/i18n-merge.js','data/i18n/ui-en.js','data/i18n/ui-ar.js']});b.Core.load();const content=all?files:[...(history?['b1-01.js']:[]),...(file?[file]:b2Files)],extra=all?fallbackFiles:fallback?['c2-01.js']:[],langs=all||languages?['en','ar']:['en','ar'];for(const f of ['data/core/curriculum-index.js',...[...content,...extra].map(f=>'data/core/'+f),...langs.flatMap(l=>(l==='ar'?content:[...content,...extra]).map(f=>'data/i18n/'+l+'/'+f))])vm.runInContext(read(f),b.sandbox);return b;}
function language(b,lang){b.Core.state.settings.lang=lang;b.sandbox.I18n.set(lang);b.sandbox.LINGUAI.applyStrings(lang);b.sandbox.Registry.reindex();}
test('B2 has exactly six original units, 18 lessons, six assessments and 252 exercises, fully declared in Arabic',()=>{
 const b=setup(),m=plain(b.sandbox.I18n.courseOverrides('ar'));assert.equal(Object.values(m).flat().length,187);assert.equal(Object.keys(ar).length,30);for(const f of b2Files)assert.deepEqual(m[f],Object.keys(bag('ar',f)));
 const errors=[];checkPartialCourse(m,bags('ar'),entries('en'),errors);assert.deepEqual(errors,[]);language(b,'ar');const us=plain(b.Core.registry.byCode.B2.units);assert.equal(us.length,6);assert.equal(us.flatMap(u=>u.lessons).length,18);assert.equal(us.filter(u=>u.test).length,6);assert.equal(us.flatMap(u=>[...u.lessons,u.test]).reduce((n,l)=>n+l.exercises.length,0),252);assert.equal(plans.length,24);assert.equal(plans.reduce((n,p)=>n+p.answers.length,0),252);for(const u of us)for(const l of [...u.lessons,u.test])assert.equal(b.sandbox.LINGUAI.lessonLanguage('ar',l.id),'ar');
});
test('all previously translated Arabic files and every original Italian core match canonical Git content',()=>assertCanonicalSnapshots(preservedHashes));
for(const plan of plans){
 test(plan.id+' completely translates the original fields, preserving exact structure and Italian',()=>{
  const b=setup({file:fileFor(plan.id)});language(b,'ar');const k='lesson:'+plan.id,patch=ar[k],base=en[k];assert.equal(patch.title,plan.title);
  function check(v,o,p=''){if(Array.isArray(v)){assert.equal(v.length,o.length,p);return v.forEach((x,i)=>check(x,o[i],p+'/'+i));}if(v&&typeof v==='object'){assert.deepEqual(Object.keys(v).sort(),Object.keys(o).sort(),p);return Object.entries(v).forEach(([k,x])=>check(x,o[k],p+'/'+k));}assert.equal(typeof v,'string',p);assert(v.trim()||o==='',p);if(italianLeaves[k].includes(p))return assert.equal(v,o,p);assert.match(v,/[\u0600-\u06ff]/,plan.id+p);}check(patch,base);
  let neutral;vm.runInNewContext(read('data/core/'+fileFor(plan.id)),{LINGUAI:{addUnits(_l,us){for(const u of us)for(const l of [...u.lessons,u.test])if(l.id===plan.id)neutral=plain(l);}}});
  function unchanged(v,to){for(const[k,x]of Object.entries(v)){if(x&&typeof x==='object')unchanged(x,to[k]);else assert.equal(to[k],x,plan.id+'.'+k);}}unchanged(neutral,plain(b.Core.getLesson(plan.id).lesson));assert.equal(patch.exercises.length,neutral.exercises.length);
 });
 plan.answers.forEach((answer,i)=>test(plan.id+' exercise '+(i+1)+' matches the independently reviewed original response',()=>{
  const b=setup({file:fileFor(plan.id)});language(b,'ar');const e=plain(b.Core.getLesson(plan.id).lesson.exercises[i]);
  if(e.t==='conj')assert.deepEqual(e.persons.map(p=>b.sandbox.Verbs.conjugate(e.verb,e.tense)[p]),answer);
  else if(e.t==='mcq'||e.t==='multi')assert.deepEqual(e.a,answer);
  else if(e.t==='match'){assert.deepEqual(e.pairs.map(p=>p.it),answer);assert.deepEqual(e.pairs.map(p=>p.tr),plan.matches[i]);}
  else if(e.t==='dialogue')assert.deepEqual(e.lines.filter(l=>l.choices).map(l=>l.a),answer);
  else if(e.t==='cloze'){assert.equal(e.gaps.length,answer.length);answer.forEach((v,j)=>assert(b.Core.checkOpen(v,e.gaps[j],false).ok));}
  else if(e.t==='order'){assert.deepEqual(e.tokens,answer);assert(b.Core.checkOpen(answer.join(' '),e.a,true).ok);}
  else if(['fill','trans'].includes(e.t))assert(b.Core.checkOpen(answer,e.a,true).ok);
  else if(['listen','speak'].includes(e.t))assert.equal(e.it,answer);else assert.fail('Unverified type '+e.t);
 }));
}
test('all six original unit titles and summaries are fully Arabic',()=>{for(let n=1;n<=6;n++){const k='unit:b2-u0'+n;assert.deepEqual(Object.keys(ar[k]),Object.keys(en[k]));Object.values(ar[k]).forEach(s=>assert.match(s,/[\u0600-\u06ff]/));}});
test('six-language cycles preserve A1–B2 content, learner scores, glossary and English C2 fallback',()=>{
 const b=setup({all:true}),C=b.Core;language(b,'en');for(const p of plans)C.recordLesson(p.id,p.answers.length,p.answers.length,80);C.addCard('la conferma','confirmation','b2-u02-l2');language(b,'ar');C.addCard('la conferma','تأكيد','b2-u02-l2');
 const state=()=>{const s=plain(C.state);delete s.settings.lang;return s;},before=state(),snapshot=()=>plain(['A1','A2','B1','B2'].map(c=>C.registry.byCode[c].units));
 for(const lang of ['en']){language(b,lang);const original=snapshot();language(b,'ar');const arabic=snapshot();for(const next of [lang,'ar',lang,'ar']){language(b,next);assert.deepEqual(snapshot(),next==='ar'?arabic:original);assert.deepEqual(state(),before);}}
 for(const code of ['C2']){language(b,'en');const fallback=plain(C.registry.byCode[code].units);language(b,'ar');assert.deepEqual(plain(C.registry.byCode[code].units),fallback);for(const u of fallback)for(const l of [...u.lessons,u.test])assert.equal(b.sandbox.LINGUAI.lessonLanguage('ar',l.id),'en');}assert.equal(C.state.schema,2);assert.deepEqual(plain(C.state.srs[C.cardKey('la conferma')].tr),{en:'confirmation',ar:'تأكيد'});
});
test('each B2 lesson falls back atomically if an original required text family is incomplete',()=>{
 for(const p of plans){const damage=[o=>{delete o.title;},o=>o.exercises.pop()];if(en['lesson:'+p.id].theory)damage.push(o=>{o.theory=[];});for(const mutate of damage){const f=fileFor(p.id),b=setup({file:f,history:true}),all=bags('ar');mutate(all[f]['lesson:'+p.id]);b.sandbox.LINGUAI.addStrings('ar',all[f]);language(b,'en');language(b,'ar');assert.equal(b.sandbox.LINGUAI.lessonLanguage('ar',p.id),'en');assert.equal(b.Core.getLesson(p.id).lesson.title,en['lesson:'+p.id].title);assert.equal(b.sandbox.LINGUAI.lessonLanguage('ar','b1-u01-l1'),'ar');const errors=[];checkPartialCourse(b.sandbox.I18n.courseOverrides('ar'),all,entries('en'),errors);assert(errors.some(e=>e.includes(p.id)));}}
});
test('every B2 unit rejects partial metadata and undeclared C2 cannot override English',()=>{
 for(let n=1;n<=6;n++)for(const field of ['title','grammarNote']){const b=setup({fallback:true}),f=b2Files.find(f=>Object.hasOwn(bag('en',f),'unit:b2-u0'+n)),patch=bag('ar',f),k='unit:b2-u0'+n;delete patch[k][field];patch['unit:c2-u01']={title:'غير معلن',grammarNote:'غير معلن'};b.sandbox.LINGUAI.addStrings('ar',patch);language(b,'ar');const u=b.Core.registry.byCode.B2.units[n-1];assert.equal(u.title,en[k].title);assert.equal(u.grammarNote,en[k].grammarNote);assert.equal(b.Core.registry.byCode.C2.units[0].title,bag('en','c2-01.js')['unit:c2-u01'].title);}
});
test('all three B2 overlays follow English, failed Arabic loads retry, C2 remains unrequested',()=>{
 const b=setup(),R=b.sandbox.Registry;assert.deepEqual(R.i18nPaths('ar',[...b2Files,'c2-01.js']),[...b2Files,'c2-01.js'].map(f=>'data/i18n/en/'+f).concat(b2Files.map(f=>'data/i18n/ar/'+f)));for(const f of b2Files){R.markI18n(['data/i18n/en/'+f,'data/i18n/ar/'+f],['data/i18n/ar/'+f]);assert.deepEqual(R.i18nPaths('ar',[f]),['data/i18n/ar/'+f]);}language(b,'ar');for(const k of ['tense.congImp','tense.remoto'])assert.match(b.sandbox.I18n.t(k),/[\u0600-\u06ff]/);
});
test('Arabic resolves documented source overstatements while keeping examples and keys unchanged',()=>{
 assert.match(ar['lesson:b2-u02-l1'].theory[3].trap,/المستقبل فيجوز/);
 assert.match(ar['lesson:b2-u03-l3'].theory[1].p,/له فاعله/);
 assert.match(ar['lesson:b2-u03-l3'].exercises[0].q,/المصدر الماضي/);
 assert.match(ar['lesson:b2-u04-l2'].theory[3].tip,/جميع السياقات/);
 assert.match(ar['lesson:b2-u05-l2'].theory[0].p,/ليست هذه تبديلات آلية/);
 assert.match(ar['lesson:b2-u06-l2'].theory[1].p,/واقعًا أم افتراضًا/);
});
test('an original assessment without theory stays complete, but an added empty theory is rejected',()=>{
 const b=setup(),k='lesson:b2-u05-test';assert(!Object.hasOwn(en[k],'theory'));assert(!Object.hasOwn(ar[k],'theory'));language(b,'ar');assert.equal(b.sandbox.LINGUAI.lessonLanguage('ar','b2-u05-test'),'ar');
 const all=bags('ar');all['b2-02.js'][k].theory=[];b.sandbox.LINGUAI.addStrings('ar',all['b2-02.js']);language(b,'ar');assert.equal(b.sandbox.LINGUAI.lessonLanguage('ar','b2-u05-test'),'en');const errors=[];checkPartialCourse(b.sandbox.I18n.courseOverrides('ar'),all,entries('en'),errors);assert(errors.some(e=>e.includes(k)&&e.includes('empty theory')));
});
test('original tr-array matching glosses and Italian pairs restore exactly in all existing languages',()=>{
 const b=setup({languages:true});for(const lang of ['ar','en','ar']){language(b,lang);for(const id of ['b2-u05-l1','b2-u05-l3','b2-u06-l1','b2-u06-l3']){const patch=bag(lang,fileFor(id))['lesson:'+id];patch.exercises.forEach((e,i)=>{if(Array.isArray(e.tr)){const actual=plain(b.Core.getLesson(id).lesson.exercises[i].pairs);assert.deepEqual(actual.map(p=>p.tr),e.tr);assert.deepEqual(actual.map(p=>p.it),plans.find(p=>p.id===id).answers[i]);}});}}
});
