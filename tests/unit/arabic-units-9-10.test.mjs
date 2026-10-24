import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {join} from 'node:path';
import {createHash} from 'node:crypto';
import vm from 'node:vm';
import {loadEngine,CORE,VERBS,ROOT} from './_harness.mjs';
import {checkPartialCourse} from '../../scripts/parity.mjs';
// Reviewed answer plans are independent from source grading fields.
const plans=[
  {
    "id": "a1-u09-l1",
    "answers": [
      1,
      1,
      "Faccio",
      "Ti",
      "match",
      "Ti va di andare al cinema stasera?",
      [
        "gioco",
        "suono",
        "faccio"
      ],
      [
        0,
        0
      ],
      "Nel tempo libero faccio palestra e guardo serie tv.",
      "Ti va di fare una passeggiata in centro?"
    ],
    "keys": [
      "Suono",
      "Gioco",
      "faccio",
      "ti",
      [
        "carte",
        "il pianoforte",
        "una passeggiata",
        "piscina"
      ],
      "Ti va di andare al cinema stasera?",
      [
        "gioco",
        "suono",
        "faccio"
      ],
      [
        "Volentieri! A che ora?",
        "Perfetto, ci vediamo lì!"
      ],
      "Nel tempo libero faccio palestra e guardo serie tv.",
      "Ti va di fare una passeggiata in centro?"
    ],
    "title": "التحدّث عن هواياتك واقتراح نشاط"
  },
  {
    "id": "a1-u09-l2",
    "answers": [
      1,
      "C'è",
      "piove",
      1,
      "match",
      [
        "fa",
        "c'è",
        "piove"
      ],
      "Che tempo fa a Roma?",
      [
        "In",
        "inverno",
        "a",
        "Milano",
        "c'è",
        "spesso",
        "nebbia"
      ],
      "Oggi fa bel tempo, ci sono venticinque gradi.",
      "Che tempo fa oggi? Fa freddo e piove."
    ],
    "keys": [
      "Fa caldo",
      "c'è",
      "piove",
      "أشعر بالبرد",
      [
        "تتساقط الثلوج",
        "يوجد ضباب",
        "الطقس سيّئ",
        "مظلّة"
      ],
      [
        "fa",
        "c'è",
        "piove"
      ],
      "Che tempo fa a Roma?",
      "In inverno a Milano c'è spesso nebbia.",
      "Oggi fa bel tempo, ci sono venticinque gradi.",
      "Che tempo fa oggi? Fa freddo e piove."
    ],
    "title": "وصف الطقس والفصول"
  },
  {
    "id": "a1-u09-l3",
    "answers": [
      1,
      "facendo",
      "dormendo",
      "stanno",
      1,
      "Non posso parlare, sto guidando.",
      [
        "stai",
        "sto",
        "sto"
      ],
      [
        "Ti",
        "sto",
        "aspettando",
        "davanti",
        "al",
        "bar"
      ],
      "Scusa, sto per entrare in riunione.",
      "Che stai facendo? — Sto studiando italiano."
    ],
    "keys": [
      "آكل الآن",
      "facendo",
      "dormendo",
      "stanno",
      "Domani vedo Anna",
      "Non posso parlare, sto guidando.",
      [
        "stai",
        "sto",
        "sto"
      ],
      "Ti sto aspettando davanti al bar.",
      "Scusa, sto per entrare in riunione.",
      "Che stai facendo? — Sto studiando italiano."
    ],
    "title": "stare مع gerundio: ما يحدث الآن"
  },
  {
    "id": "a1-u09-l4",
    "answers": [
      1,
      "piaciuto",
      "ridotti",
      "match",
      "Mi è piaciuto molto, te lo consiglio.",
      1,
      [
        "spettacolo",
        "ridotti",
        "ridotto"
      ],
      [
        "Che",
        "genere",
        "di",
        "film",
        "preferisci?"
      ],
      "Il concerto mi è piaciuto molto, soprattutto la seconda parte.",
      "Ti va di andare a vedere una mostra domenica?"
    ],
    "keys": [
      "النسخة الأصلية، وغالبًا مع ترجمة مكتوبة",
      "piaciuto",
      "ridotti",
      [
        "المخرج",
        "الموسيقى التصويرية",
        "الترجمة المكتوبة على الشاشة",
        "معرض"
      ],
      "Mi è piaciuto molto, te lo consiglio.",
      "عرض الساعة التاسعة",
      [
        "spettacolo",
        "ridotti",
        "ridotto"
      ],
      "Che genere di film preferisci?",
      "Il concerto mi è piaciuto molto, soprattutto la seconda parte.",
      "Ti va di andare a vedere una mostra domenica?"
    ],
    "title": "السينما والموسيقى والتعبير عن رأيك"
  },
  {
    "id": "a1-u09-test",
    "answers": [
      1,
      1,
      "Fa",
      "C'è",
      "bevendo",
      "stanno",
      1,
      [
        "Ti",
        "va",
        "di",
        "fare",
        "una",
        "passeggiata?"
      ],
      "Sto uscendo adesso, fa freddo, prendo l'ombrello.",
      "Nel weekend gioco a tennis e faccio una passeggiata."
    ],
    "keys": [
      "Suono",
      "Gioco",
      "fa",
      "c'è",
      "bevendo",
      "stanno",
      "Domani vado a Roma",
      "Ti va di fare una passeggiata?",
      "Sto uscendo adesso, fa freddo, prendo l'ombrello.",
      "Nel weekend gioco a tennis e faccio una passeggiata."
    ],
    "title": "اختبار الوحدة التاسعة"
  },
  {
    "id": "a1-u10-l1",
    "answers": [
      1,
      "parlato",
      "creduto",
      "finito",
      "ho mangiato",
      "match",
      [
        "ho",
        "ho",
        "ho"
      ],
      "Non ho capito, puoi ripetere?",
      "La settimana scorsa abbiamo visitato Firenze.",
      "Ieri sera ho letto un libro molto interessante."
    ],
    "keys": [
      "avere أوessere مع participio passato",
      "parlato",
      "creduto",
      "finito",
      "ho mangiato",
      [
        "fatto",
        "visto",
        "scritto",
        "preso"
      ],
      [
        "ho",
        "ho",
        "ho"
      ],
      "Non ho capito, puoi ripetere?",
      "La settimana scorsa abbiamo visitato Firenze.",
      "Ieri sera ho letto un libro molto interessante."
    ],
    "title": "passato prossimo مع avere: ماذا فعلت؟"
  },
  {
    "id": "a1-u10-l2",
    "answers": [
      1,
      1,
      "arrivate",
      "nato",
      [
        0,
        2,
        4
      ],
      1,
      [
        "sono",
        "sono",
        "sono"
      ],
      [
        "Siamo",
        "arrivati",
        "in",
        "ritardo"
      ],
      "Sono nata a Varsavia, ma sono cresciuta a Cracovia.",
      "Ieri sono andata al cinema con un'amica."
    ],
    "keys": [
      "توافق الفاعل في الجنس والعدد مثل الصفة",
      "sono partita",
      "arrivate",
      "nato",
      [
        "andare",
        "partire",
        "nascere"
      ],
      "è finito",
      [
        "sono",
        "sono",
        "sono"
      ],
      "Siamo arrivati in ritardo.",
      "Sono nata a Varsavia, ma sono cresciuta a Cracovia.",
      "Ieri sono andata al cinema con un'amica."
    ],
    "title": "passato prossimo مع essere: أين ذهبت؟"
  },
  {
    "id": "a1-u10-l3",
    "answers": [
      1,
      "mai",
      "Prima",
      1,
      [
        "ho",
        "poi",
        "siamo"
      ],
      "Non ho ancora finito.",
      [
        "Alla",
        "fine",
        "siamo",
        "tornati",
        "a",
        "casa",
        "tardi"
      ],
      [
        0,
        0
      ],
      "Prima ho fatto la spesa, poi mi sono riposata.",
      "Com'è andata? — Bene, è stato bello."
    ],
    "keys": [
      "بين avere وparticipio passato",
      "mai",
      "prima",
      "كيف سار حدث أو تجربة",
      [
        "ho",
        "poi",
        "siamo"
      ],
      "Non ho ancora finito.",
      "Alla fine siamo tornati a casa tardi.",
      [
        "Niente di che, sono stato a casa.",
        "Con chi sei andato?"
      ],
      "Prima ho fatto la spesa, poi mi sono riposata.",
      "Com'è andata? — Bene, è stato bello."
    ],
    "title": "سرد أحداث قصيرة وطرح أسئلة عن الماضي"
  },
  {
    "id": "a1-u10-l4",
    "answers": [
      [
        "sono",
        "è",
        "siamo",
        "sono"
      ],
      [
        "hai",
        "abbiamo",
        "hanno"
      ],
      [
        "capisco",
        "capiamo",
        "capiscono"
      ],
      {
        "zaino": "lo",
        "amica": "l'",
        "studenti": "gli",
        "case": "le",
        "treno": "il"
      },
      [
        "mi",
        "sono",
        "abito",
        "faccio"
      ],
      "piacciono",
      "al",
      "ho mangiato",
      "sono andata",
      [
        "Ieri",
        "sera",
        "siamo",
        "andati",
        "al",
        "ristorante",
        "con",
        "gli",
        "amici"
      ],
      "Mi sono svegliata presto e ho fatto colazione al bar.",
      "Mi chiamo Anna, sono polacca e abito a Firenze da un anno."
    ],
    "keys": [
      [
        "sono",
        "è",
        "siamo",
        "sono"
      ],
      [
        "hai",
        "abbiamo",
        "hanno"
      ],
      [
        "capisco",
        "capiamo",
        "capiscono"
      ],
      [
        "lo",
        "l'",
        "gli",
        "le",
        "il"
      ],
      [
        "mi",
        "sono",
        "abito",
        "faccio"
      ],
      "piacciono",
      "al",
      "ho mangiato",
      "sono andata",
      "Ieri sera siamo andati al ristorante con gli amici.",
      "Mi sono svegliata presto e ho fatto colazione al bar.",
      "Mi chiamo Anna, sono polacca e abito a Firenze da un anno."
    ],
    "title": "مراجعة مهارات المستوى A1"
  },
  {
    "id": "a1-u10-test",
    "answers": [
      [
        "vado",
        "vai",
        "va",
        "andiamo",
        "andate",
        "vanno"
      ],
      1,
      {
        "studente": "lo",
        "acqua": "l'",
        "amici": "gli",
        "stazione": "la"
      },
      "piace",
      "alzarmi",
      "Sono",
      "in",
      "C'è",
      1,
      "siamo andati",
      [
        "ho",
        "poi",
        "sono"
      ],
      "Buongiorno, vorrei prenotare un tavolo per due alle otto."
    ],
    "keys": [
      [
        "vado",
        "vai",
        "va",
        "andiamo",
        "andate",
        "vanno"
      ],
      "Buonasera",
      [
        "lo",
        "l'",
        "gli",
        "la"
      ],
      "piace",
      "alzarmi",
      "sono",
      "in",
      "c'è",
      "che",
      "siamo andati",
      [
        "ho",
        "poi",
        "sono"
      ],
      "Buongiorno, vorrei prenotare un tavolo per due alle otto."
    ],
    "title": "الاختبار الختامي للمستوى A1"
  }
];
const previousHash="8b59a205af0deb775bc1b265222ee0afb4217d7d231a8ad5d59a7ea20093c945";
const plain=value=>JSON.parse(JSON.stringify(value));
const files=['a1-01.js','a1-02.js','a1-03.js','a2-01.js'];
function bag(lang,file){let result;vm.runInNewContext(readFileSync(join(ROOT,'data/i18n',lang,file),'utf8'),{LINGUAI:{addStrings(_lang,map){result=plain(map);}}});return result;}
const bags=lang=>Object.fromEntries(files.map(file=>[file,bag(lang,file)]));
const entries=lang=>Object.assign({},...Object.values(bags(lang)));
const ar=entries('ar'),en=entries('en');
function setup(){const box=loadEngine({files:[...CORE,...VERBS,'assets/js/i18n.js','assets/js/i18n-merge.js','data/i18n/ui-en.js','data/i18n/ui-ar.js']});box.Core.load();for(const file of ['data/core/curriculum-index.js',...files.map(file=>'data/core/'+file),...['en','pl','es','fr','de','ar'].flatMap(lang=>files.map(file=>'data/i18n/'+lang+'/'+file))])vm.runInContext(readFileSync(join(ROOT,file),'utf8'),box.sandbox);return box;}
function language(box,lang){box.Core.state.settings.lang=lang;box.sandbox.LINGUAI.applyStrings(lang);box.sandbox.Registry.reindex();}

test('all ten Arabic A1 units declare exactly 40 lessons, ten assessments and ten summaries',()=>{
 const box=setup(),manifest=plain(box.sandbox.I18n.courseOverrides('ar'));
 const keys=n=>{const id='a1-u'+String(n).padStart(2,'0');return ['unit:'+id,...[1,2,3,4].map(l=>'lesson:'+id+'-l'+l),'lesson:'+id+'-test'];};
 assert.equal(Object.values(manifest).flat().length,72);
 assert.deepEqual(manifest['a1-01.js'].slice(12),keys(3));assert.deepEqual(manifest['a1-02.js'],[...keys(4),...keys(5),...keys(6),...keys(7)]);assert.deepEqual(manifest['a1-03.js'],[...keys(8),...keys(9),...keys(10)]);
 assert.equal(plans.length,10);assert.equal(plans.reduce((n,p)=>n+p.answers.length,0),104);
 for(const file of files)assert.deepEqual(Object.keys(bag('ar',file)),manifest[file]);
 const errors=[];checkPartialCourse(manifest,bags('ar'),entries('pl'),errors);assert.deepEqual(errors,[]);
});

test('all 48 Arabic entries in Units 1–8 retain their reviewed content',()=>{
 const previous=Object.fromEntries(Object.entries(ar).filter(([key])=>/^(unit|lesson):a1-u0[1-8](?:-|$)/.test(key)).sort(([a],[b])=>a.localeCompare(b)));
 assert.equal(Object.keys(previous).length,48);
 assert.equal(createHash('sha256').update(JSON.stringify(previous)).digest('hex'),previousHash);
});

const translatedChoices=new Set(['a1-u09-l2:3','a1-u09-l3:0','a1-u09-l4:0','a1-u09-l4:5','a1-u10-l1:0','a1-u10-l2:0','a1-u10-l3:0','a1-u10-l3:3']);
const italianColumns={'a1-u09-l1':[0,2],'a1-u09-l2':[0,1],'a1-u09-l3':[0,1,2],'a1-u09-l4':[1],'a1-u10-l1':[0,1,2,3],'a1-u10-l2':[1,2],'a1-u10-l3':[1,2]};
const italianHeaders=new Set(['il','lo','la',"l'",'i','gli','le','potere','volere','dovere','andare','venire']);
for(const plan of plans){
 test(plan.id+' translates every learner-language field and preserves Italian, options and neutral grading fields',()=>{
  const box=setup();language(box,'ar');const key='lesson:'+plan.id,patch=ar[key],base=en[key];
  assert.equal(box.sandbox.LINGUAI.lessonLanguage('ar',plan.id),'ar');assert.equal(patch.title,plan.title);
  assert.deepEqual(Object.keys(patch).sort(),Object.keys(base).sort());
  function translated(value,source,where=''){
   if(Array.isArray(value))return value.forEach((v,i)=>translated(v,source&&source[i],where+'['+i+']'));
   if(value&&typeof value==='object')return Object.entries(value).forEach(([k,v])=>translated(v,source&&source[k],where+'.'+k));
   if(value===null&&source===null)return; // Original empty source slot, not learner text.
   assert.equal(typeof value,'string',where);
   assert.equal((value.match(/\u2066/g)||[]).length,(value.match(/\u2069/g)||[]).length,'Unbalanced LTR isolate '+where);
   if(/[\u0600-\u06ff]/.test(value))return;
   if(value===''&&(source===''||source==null))return;
   const cell=/\.grammar\.table\.rows\[(\d+)\]\[(\d+)\]$/.exec(where);
   if(cell&&italianColumns[plan.id].includes(Number(cell[2]))){assert.equal(value,source,'Italian table cell');assert(!/^at\b/.test(value));return;}
   if(cell&&value==='a + le = alle'){assert.equal(value,source);return;}
   if(/\.grammar\.table\.head/.test(where)&&italianHeaders.has(value)){assert.equal(value,source);return;}
   if(/\.opts\[/.test(where)){assert.equal(value,source,'Italian option');return;}
   if(['a1-u09-l1','a1-u10-l1'].includes(plan.id)&&/\.pairs\[/.test(where)){assert.equal(value,source);return;}
   assert.fail('Untranslated learner text: '+where+': '+value);
  }
  translated(patch,base);
  let neutral;vm.runInNewContext(readFileSync(join(ROOT,'data/core/a1-03.js'),'utf8'),{LINGUAI:{addUnits(_code,units){for(const unit of units)for(const lesson of [...unit.lessons,unit.test])if(lesson.id===plan.id)neutral=plain(lesson);}}});
  function unchanged(source,target){for(const [k,v]of Object.entries(source)){if(v&&typeof v==='object')unchanged(v,target[k]);else assert.equal(target[k],v,plan.id+': '+k);}}
  unchanged(neutral,plain(box.Core.getLesson(plan.id).lesson));
  patch.exercises.forEach((ex,i)=>{if(ex.opts&&!translatedChoices.has(plan.id+':'+i))assert.deepEqual(ex.opts,base.exercises[i].opts,'Italian option ordering');});
 });
 plan.keys.forEach((answer,i)=>test(plan.id+' exercise '+(i+1)+' Arabic prompt agrees with original Italian accepted answers',()=>{
  const box=setup();language(box,'ar');const ex=plain(box.Core.getLesson(plan.id).lesson.exercises[i]),type=ex.t;
  if(type==='mcq')assert.equal(ex.opts[ex.a],answer);
  if(type==='multi')assert.deepEqual(ex.a.map(index=>ex.opts[index]),answer);
  if(['fill','trans','order'].includes(type))assert.equal(box.Core.checkOpen(answer,ex.a,true).ok,true);
  if(type==='order')assert.equal(box.Core.norm(ex.tokens.join(' ')),box.Core.norm(answer));
  if(['listen','speak'].includes(type))assert.equal(ex.it,answer);
  if(type==='conj')assert.deepEqual(ex.persons.map(person=>box.sandbox.Verbs.conjugate(ex.verb,'pres')[person]),answer);
  if(type==='gender')assert.deepEqual(ex.items.map(item=>item.a),answer);
  if(type==='match')assert.deepEqual(ex.pairs.map(pair=>pair.tr),answer);
  if(type==='cloze'){assert.equal(ex.gaps.length,answer.length);answer.forEach((word,gap)=>assert.equal(box.Core.checkOpen(word,ex.gaps[gap],false).ok,true));}
  if(type==='dialogue')assert.deepEqual(ex.lines.filter(line=>line.choices).map(line=>line.choices[line.a]),answer);
 }));
}

test('Arabic explains the auxiliary, gender, aspect and source concerns without false universal rules',()=>{
 assert.match(ar['lesson:a1-u09-l1'].theory[1].contrast,/أعزف/);
 assert.match(ar['lesson:a1-u09-l2'].theory[0].p,/أشعر بالحرّ/);
 assert.match(ar['lesson:a1-u09-l2'].theory.at(-1).tip,/La primavera è la stagione migliore/);
 assert.match(ar['lesson:a1-u09-l3'].theory[0].p,/بحسب السياق/);
 assert.match(ar['lesson:a1-u09-l3'].exercises[6].tr,/على وشك الوصول/);
 assert.match(ar['lesson:a1-u09-l4'].theory[0].p,/لا جنس المتكلّم/);
 assert.match(ar['lesson:a1-u10-l1'].theory[2].p,/ضمائر المفعول المتقدّمة/);
 assert.match(ar['lesson:a1-u10-l1'].theory[2].p,/غير الانعكاسية/);
 assert.match(ar['lesson:a1-u10-l2'].theory[2].p,/لا تفترض.*كل فعل حركة/);
 for(const model of ['ho camminato','ho nuotato','ho dormito'])assert.ok(ar['lesson:a1-u10-l2'].theory[2].p.includes(model));
 assert.match(ar['lesson:a1-u10-l2'].exercises[2].q,/لمجموعة نساء/);
 assert.match(ar['lesson:a1-u10-l3'].theory.at(-1).tip,/aspettavo.*A2/);
 assert.match(ar['lesson:a1-u10-l3'].exercises[4].q,/امرأة.*مختلطة/);
 assert.match(ar['lesson:a1-u10-l4'].exercises[8].q,/امرأة/);
 assert.match(ar['lesson:a1-u10-test'].exercises[4].q,/أنهض من الفراش/);
 assert.match(ar['lesson:a1-u10-test'].exercises[9].q,/مختلطة/);
 assert.match(ar['lesson:a1-u10-test'].exercises[11].tr,/^صباح الخير/);
 assert.doesNotMatch(JSON.stringify(ar['lesson:a1-u09-l4'].culture),/إسكندناف|أضعف/);
});

test('Arabic-English-Arabic and all five existing languages restore exact content and all target glossary meanings',()=>{
 const box=setup(),snapshot=()=>plain(box.Core.registry.byCode.A1.units);
 for(const lang of ['en','pl','es','fr','de']){language(box,lang);const before=snapshot();language(box,'ar');const arabic=snapshot();for(const next of [lang,'ar',lang,'ar']){language(box,next);assert.deepEqual(snapshot(),next==='ar'?arabic:before);}}
 language(box,'en');const fallback=plain(box.Core.registry.byCode.A2.units[2]);language(box,'ar');assert.deepEqual(plain(box.Core.registry.byCode.A2.units[2]),fallback);
 for(const lang of ['en','pl','es','fr','de']){
  language(box,'ar');assert.equal(box.Core.getLesson('a1-u10-l4').lesson.exercises[3].items[0].gloss,undefined);
  language(box,lang);const review=box.Core.getLesson('a1-u10-l4').lesson.exercises[3].items,exam=box.Core.getLesson('a1-u10-test').lesson.exercises[2].items;assert.equal(review.length,5);assert.equal(exam.length,4);for(const item of [...review,...exam])assert.ok(item.gloss==null||item.gloss==='','No invented or stale gloss after switching');
 }
});

test('each new lesson and assessment falls back atomically when damaged, preserving translated neighbors',()=>{
 for(const plan of plans)for(const damage of [p=>{delete p.title;},p=>p.exercises.pop(),p=>{p.theory=[];}]){
  const box=setup(),all=bags('ar');const file='a1-03.js';damage(all[file]['lesson:'+plan.id]);box.sandbox.LINGUAI.addStrings('ar',all[file]);language(box,'es');language(box,'ar');
  assert.equal(box.sandbox.LINGUAI.lessonLanguage('ar',plan.id),'en');assert.equal(box.Core.getLesson(plan.id).lesson.title,en['lesson:'+plan.id].title);
  const other=plans.find(p=>p.id!==plan.id);assert.equal(box.sandbox.LINGUAI.lessonLanguage('ar',other.id),'ar');assert.equal(box.sandbox.LINGUAI.lessonLanguage('ar','a1-u04-l1'),'ar');
  const errors=[];checkPartialCourse(box.sandbox.I18n.courseOverrides('ar'),all,entries('pl'),errors);assert.ok(errors.some(e=>e.includes(plan.id)));
 }
});

test('new unit summaries are independently atomic and A2 remains undeclared English fallback',()=>{
 for(const unit of ['a1-u09','a1-u10'])for(const field of ['title','grammarNote']){
  const box=setup(),patch=bag('ar','a1-03.js');delete patch['unit:'+unit][field];patch['unit:a2-u03']={title:'غير معلن',grammarNote:'غير معلن'};box.sandbox.LINGUAI.addStrings('ar',patch);language(box,'ar');
  const current=box.Core.registry.byCode.A1.units.find(u=>u.id===unit);assert.equal(current.title,en['unit:'+unit].title);assert.equal(current.grammarNote,en['unit:'+unit].grammarNote);
  assert.equal(box.sandbox.LINGUAI.lessonLanguage('ar',unit+'-l1'),'ar');assert.equal(box.Core.registry.byCode.A2.units[2].title,en['unit:a2-u03'].title);
 }
});

test('new translations reuse existing file loading and never request undeclared Arabic course files',()=>{
 const box=setup(),R=box.sandbox.Registry;
 assert.deepEqual(R.i18nPaths('ar',['a1-01.js','a1-02.js','a1-03.js','a2-02.js']),['data/i18n/en/a1-01.js','data/i18n/en/a1-02.js','data/i18n/en/a1-03.js','data/i18n/en/a2-02.js','data/i18n/ar/a1-01.js','data/i18n/ar/a1-02.js','data/i18n/ar/a1-03.js']);
 R.markI18n(['data/i18n/en/a1-02.js','data/i18n/ar/a1-02.js'],['data/i18n/ar/a1-02.js']);assert.deepEqual(R.i18nPaths('ar',['a1-02.js']),['data/i18n/ar/a1-02.js']);
});

test('original empty article-exercise slots stay sparse without changing other-language files',()=>{
 const box=setup();language(box,'en');const before=plain(box.Core.registry.byCode.A1.units);
 let raw;vm.runInNewContext(readFileSync(join(ROOT,'data/i18n/ar/a1-03.js'),'utf8'),{LINGUAI:{addStrings(_l,map){raw=map;}}});
 for(const [id,index,length]of [['a1-u10-l4',3,4],['a1-u10-test',2,3]]){const slots=raw['lesson:'+id].exercises[index].items;assert.equal(slots.length,length);assert.deepEqual(Object.keys(slots),[]);}
 for(const lang of ['ar','en','pl','ar','en'])language(box,lang);assert.deepEqual(plain(box.Core.registry.byCode.A1.units),before);
});

test('language switching preserves scores, progress, review schedules and language-specific glossary meanings',()=>{
 const box=setup(),C=box.Core;language(box,'en');plans.forEach(p=>C.recordLesson(p.id,p.answers.length,p.answers.length,80));C.addCard('la palestra','gym','a1-u09-l1');language(box,'ar');C.addCard('la palestra','النادي الرياضي','a1-u09-l1');
 const card=C.state.srs[C.cardKey('la palestra')];assert.equal(card.tr.en,'gym');assert.equal(card.tr.ar,'النادي الرياضي');
 const state=()=>{const s=plain(C.state);delete s.settings.lang;return s;},before=state();for(const lang of ['en','pl','es','fr','de','ar']){language(box,lang);assert.deepEqual(state(),before);}assert.equal(C.state.schema,2);
});
