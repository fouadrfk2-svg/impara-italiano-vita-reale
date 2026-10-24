import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {join} from 'node:path';
import {createHash} from 'node:crypto';
import vm from 'node:vm';
import {loadEngine,CORE,VERBS,ROOT} from './_harness.mjs';
import {checkPartialCourse} from '../../scripts/parity.mjs';
// Reviewed answer plans are independent of the source grading fields.
const plans=[
  {
    "id": "a1-u05-l1",
    "answers": [
      [
        "mi sveglio",
        "ti svegli",
        "si sveglia",
        "ci svegliamo",
        "vi svegliate",
        "si svegliano"
      ],
      1,
      "ci alziamo",
      "alzarmi",
      1,
      "Mi vesto in fretta",
      [
        "mi",
        "mi",
        "mi faccio"
      ],
      [
        "Mia",
        "sorella",
        "si",
        "sveglia",
        "tardi"
      ],
      "Mi sveglio alle sette e mi alzo subito.",
      "A che ora ti svegli di solito?"
    ],
    "keys": [
      [
        "mi sveglio",
        "ti svegli",
        "si sveglia",
        "ci svegliamo",
        "vi svegliate",
        "si svegliano"
      ],
      "تنتهي بـ⁦-si⁩",
      "ci alziamo",
      "alzarmi",
      "Mi sveglio alle sette.",
      "Mi vesto in fretta",
      [
        "mi",
        "mi",
        "mi faccio"
      ],
      "Mia sorella si sveglia tardi",
      "Mi sveglio alle sette e mi alzo subito.",
      "A che ora ti svegli di solito?"
    ],
    "title": "أستيقظ في السابعة: الأفعال الانعكاسية"
  },
  {
    "id": "a1-u05-l2",
    "answers": [
      1,
      "sono",
      "alle",
      2,
      "match",
      "A che ora apre il negozio?",
      [
        "sono",
        "sono",
        "in"
      ],
      [
        "Ci",
        "vediamo",
        "alle",
        "otto",
        "di",
        "sera"
      ],
      "Il treno parte alle diciotto e quarantacinque.",
      "Scusi, che ore sono? — Sono le tre e mezza."
    ],
    "keys": [
      "لأن una تدلّ على ساعة واحدة",
      "sono",
      "alle",
      "العبارتان صحيحتان",
      [
        "12:00",
        "14:15",
        "13:30",
        "6:50"
      ],
      "A che ora apre il negozio?",
      [
        "sono",
        "sono",
        "in"
      ],
      "Ci vediamo alle otto di sera",
      "Il treno parte alle diciotto e quarantacinque.",
      "Scusi, che ore sono? — Sono le tre e mezza."
    ],
    "title": "كم الساعة؟ قراءة الوقت وتحديد موعد"
  },
  {
    "id": "a1-u05-l3",
    "answers": [
      [
        "posso",
        "puoi",
        "può",
        "possiamo",
        "potete",
        "possono"
      ],
      [
        "voglio",
        "vuole",
        "vogliamo",
        "vogliono"
      ],
      [
        "devo",
        "dobbiamo",
        "devono"
      ],
      1,
      "dobbiamo",
      0,
      "Posso pagare con la carta?",
      [
        "posso",
        "devo"
      ],
      "Scusi, posso provare questa giacca?",
      "Vorrei prenotare un tavolo per due, per favore."
    ],
    "keys": [
      [
        "posso",
        "puoi",
        "può",
        "possiamo",
        "potete",
        "possono"
      ],
      [
        "voglio",
        "vuole",
        "vogliamo",
        "vogliono"
      ],
      [
        "devo",
        "dobbiamo",
        "devono"
      ],
      "Vorrei una pizza.",
      "dobbiamo",
      "Devo di andare.",
      "Posso pagare con la carta?",
      [
        "posso",
        "devo"
      ],
      "Scusi, posso provare questa giacca?",
      "Vorrei prenotare un tavolo per due, per favore."
    ],
    "title": "أستطيع، أريد، يجب عليّ"
  },
  {
    "id": "a1-u05-l4",
    "answers": [
      1,
      "non mai",
      1,
      [
        "Di",
        "solito",
        "lavoro",
        "da",
        "casa"
      ],
      "match",
      "Non prendo mai il taxi",
      [
        "il",
        "non",
        "mai"
      ],
      [
        0,
        2
      ],
      "Di solito mi sveglio presto, ma la domenica dormo fino a tardi.",
      "Vado spesso al mercato il sabato mattina."
    ],
    "keys": [
      "مباشرةً بعد الفعل المصَرّف",
      "non mai",
      "من عادتي أن أنام حتى وقت متأخّر أيام السبت",
      "Di solito lavoro da casa",
      [
        "دائمًا",
        "نادرًا",
        "أحيانًا",
        "كل يوم"
      ],
      "Non prendo mai il taxi",
      [
        "il",
        "non",
        "mai"
      ],
      [
        "Non vado mai al cinema.",
        "Non ho più tempo."
      ],
      "Di solito mi sveglio presto, ma la domenica dormo fino a tardi.",
      "Vado spesso al mercato il sabato mattina."
    ],
    "title": "دائمًا، غالبًا، أبدًا: وصف العادات"
  },
  {
    "id": "a1-u05-test",
    "answers": [
      [
        "mi sveglio",
        "ci svegliamo",
        "si svegliano"
      ],
      "alzarmi",
      "sono",
      "all'",
      [
        "devo",
        "dobbiamo"
      ],
      1,
      1,
      [
        "Di",
        "solito",
        "faccio",
        "colazione",
        "alle",
        "otto"
      ],
      "Mi sveglio alle sei e mezza ogni giorno.",
      "A che ora ti alzi di solito?"
    ],
    "keys": [
      [
        "mi sveglio",
        "ci svegliamo",
        "si svegliano"
      ],
      "alzarmi",
      "sono",
      "all'",
      [
        "devo",
        "dobbiamo"
      ],
      "Vorrei…",
      "لا أذهب إلى النادي الرياضي أبدًا",
      "Di solito faccio colazione alle otto",
      "Mi sveglio alle sei e mezza ogni giorno.",
      "A che ora ti alzi di solito?"
    ],
    "title": "اختبار الوحدة الخامسة"
  },
  {
    "id": "a1-u06-l1",
    "answers": [
      "al",
      "sul",
      "nel",
      {
        "stazione": "alla",
        "aeroporto": "all'",
        "studenti": "agli",
        "ristorante": "al",
        "nove": "alle"
      },
      1,
      [
        "all'",
        "alla",
        "alla"
      ],
      "Torno dalla stazione",
      [
        "La",
        "chiave",
        "della",
        "macchina",
        "è",
        "sul",
        "tavolo"
      ],
      "L'ufficio postale è vicino alla piazza principale.",
      "Scusi, dov'è la fermata dell'autobus?"
    ],
    "keys": [
      "al",
      "sul",
      "nel",
      [
        "alla",
        "all'",
        "agli",
        "al",
        "alle"
      ],
      "con + il",
      [
        "all'",
        "alla",
        "alla"
      ],
      "Torno dalla stazione",
      "La chiave della macchina è sul tavolo",
      "L'ufficio postale è vicino alla piazza principale.",
      "Scusi, dov'è la fermata dell'autobus?"
    ],
    "title": "حروف الجر مع أدوات التعريف: al وdel وnel وsul"
  },
  {
    "id": "a1-u06-l2",
    "answers": [
      [
        "vado",
        "vai",
        "va",
        "andiamo",
        "andate",
        "vanno"
      ],
      [
        "vengo",
        "viene",
        "vengono"
      ],
      1,
      "in",
      "a",
      "dal",
      [
        0,
        2,
        4
      ],
      [
        "Andiamo",
        "a",
        "piedi,",
        "è",
        "vicino"
      ],
      "Vengo con voi, ma andiamo in metro.",
      "Vado in centro a piedi, ci vuole mezz'ora."
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
      [
        "vengo",
        "viene",
        "vengono"
      ],
      "Sì, vengo!",
      "in",
      "a",
      "dal",
      [
        "in treno",
        "a piedi",
        "in banca"
      ],
      "Andiamo a piedi, è vicino",
      "Vengo con voi, ma andiamo in metro.",
      "Vado in centro a piedi, ci vuole mezz'ora."
    ],
    "title": "أذهب أم آتي؟ andare وvenire"
  },
  {
    "id": "a1-u06-l3",
    "answers": [
      1,
      1,
      "dov'è",
      "match",
      [
        "vada",
        "giri",
        "di fronte"
      ],
      "Scusi, dov'è la farmacia?",
      [
        1,
        0,
        0
      ],
      [
        "Il",
        "museo",
        "è",
        "tra",
        "la",
        "piazza",
        "e",
        "il",
        "ponte"
      ],
      "Vada dritto e attraversi la piazza.",
      "Mi sono persa, può aiutarmi per favore?"
    ],
    "keys": [
      "انعطف يسارًا",
      "vada dritto",
      "dov'è",
      [
        "مقابل",
        "بجانب",
        "خلف",
        "بين… و…"
      ],
      [
        "vada",
        "giri",
        "di fronte"
      ],
      "Scusi, dov'è la farmacia?",
      [
        "Scusi, dov'è la stazione?",
        "Non capisco, può ripetere più lentamente?",
        "Grazie mille, molto gentile!"
      ],
      "Il museo è tra la piazza e il ponte",
      "Vada dritto e attraversi la piazza.",
      "Mi sono persa, può aiutarmi per favore?"
    ],
    "title": "أين المحطّة؟ السؤال عن الطريق وفهم الإرشادات"
  },
  {
    "id": "a1-u06-l4",
    "answers": [
      "c'è",
      "ci sono",
      1,
      "non c'è",
      [
        "c'è",
        "ci sono"
      ],
      "Non c'è nessuno alla reception",
      "match",
      [
        "C'è",
        "una",
        "farmacia",
        "da",
        "queste",
        "parti?"
      ],
      "Nel quartiere ci sono due parchi e una biblioteca.",
      "Scusi, c'è il bagno? — Sì, in fondo a destra."
    ],
    "keys": [
      "c'è",
      "ci sono",
      "Il museo è molto grande.",
      "non c'è",
      [
        "c'è",
        "ci sono"
      ],
      "Non c'è nessuno alla reception",
      [
        "موقف سيارات",
        "مستشفى",
        "مكتبة للقراءة والاستعارة",
        "حيّ سكني"
      ],
      "C'è una farmacia da queste parti?",
      "Nel quartiere ci sono due parchi e una biblioteca.",
      "Scusi, c'è il bagno? — Sì, in fondo a destra."
    ],
    "title": "ما الذي يوجد هنا؟ c’è وci sono والنفي"
  },
  {
    "id": "a1-u06-test",
    "answers": [
      {
        "cinema": "al",
        "stazione": "alla",
        "aeroporto": "all'",
        "studenti": "agli"
      },
      "sul",
      "nel",
      [
        "vado",
        "va",
        "vanno"
      ],
      "in",
      "dal",
      0,
      "ci sono",
      "Vada dritto, la banca è di fronte alla chiesa.",
      "Scusi, dov'è la fermata dell'autobus?"
    ],
    "keys": [
      [
        "al",
        "alla",
        "all'",
        "agli"
      ],
      "sul",
      "nel",
      [
        "vado",
        "va",
        "vanno"
      ],
      "in",
      "dal",
      "giri a destra",
      "ci sono",
      "Vada dritto, la banca è di fronte alla chiesa.",
      "Scusi, dov'è la fermata dell'autobus?"
    ],
    "title": "اختبار الوحدة السادسة"
  }
];
const previousHash="42714af192c9fd3fbb318316c8b4eea0f6be1211070d46d0dc2078a841ef558c";
const plain=value=>JSON.parse(JSON.stringify(value));
const files=['a1-01.js','a1-02.js','a1-03.js','a2-01.js','a2-02.js'];
function bag(lang,file){let result;vm.runInNewContext(readFileSync(join(ROOT,'data/i18n',lang,file),'utf8'),{LINGUAI:{addStrings(_lang,map){result=plain(map);}}});return result;}
const bags=lang=>Object.fromEntries(files.map(file=>[file,bag(lang,file)]));
const entries=lang=>Object.assign({},...Object.values(bags(lang)));
const ar=entries('ar'),en=entries('en');
function setup(){const box=loadEngine({files:[...CORE,...VERBS,'assets/js/i18n.js','assets/js/i18n-merge.js','data/i18n/ui-en.js','data/i18n/ui-ar.js']});box.Core.load();for(const file of ['data/core/curriculum-index.js',...['a1-01.js','a1-02.js','a1-03.js','a2-01.js','a2-02.js','b1-01.js'].map(f=>'data/core/'+f),...['en','pl','es','fr','de','ar'].flatMap(lang=>['a1-01.js','a1-02.js','a1-03.js','a2-01.js','a2-02.js',...(lang==='ar'?[]:['b1-01.js'])].map(f=>'data/i18n/'+lang+'/'+f))])vm.runInContext(readFileSync(join(ROOT,file),'utf8'),box.sandbox);return box;}
function language(box,lang){box.Core.state.settings.lang=lang;box.sandbox.LINGUAI.applyStrings(lang);box.sandbox.Registry.reindex();}

test('the first six Arabic units remain complete in the expanded eight-unit manifest',()=>{
 const box=setup(),manifest=plain(box.sandbox.I18n.courseOverrides('ar'));
 const keys=n=>['unit:a1-u0'+n,...[1,2,3,4].map(l=>'lesson:a1-u0'+n+'-l'+l),'lesson:a1-u0'+n+'-test'];
 assert.equal(Object.values(manifest).flat().length,108);
 assert.deepEqual(manifest['a1-01.js'].slice(12),keys(3));assert.deepEqual(manifest['a1-02.js'].slice(0,18),[...keys(4),...keys(5),...keys(6)]);
 assert.equal(plans.length,10);assert.equal(plans.reduce((n,p)=>n+p.answers.length,0),100);
 for(const file of files)assert.deepEqual(Object.keys(bag('ar',file)),manifest[file]);
 const errors=[];checkPartialCourse(manifest,bags('ar'),entries('pl'),errors);assert.deepEqual(errors,[]);
});

test('all 24 Arabic entries in Units 1–4 retain their reviewed content',()=>{
 const previous=Object.fromEntries(Object.entries(ar).filter(([key])=>/^(unit|lesson):a1-u0[1-4](?:-|$)/.test(key)).sort(([a],[b])=>a.localeCompare(b)));
 assert.equal(Object.keys(previous).length,24);
 assert.equal(createHash('sha256').update(JSON.stringify(previous)).digest('hex'),previousHash);
});

const translatedChoices=new Set(['a1-u05-l1:1','a1-u05-l2:0','a1-u05-l2:3','a1-u05-l4:0','a1-u05-l4:2','a1-u05-test:6','a1-u06-l3:0']);
const italianColumns={'a1-u05-l1':[0,1,2,3],'a1-u05-l2':[0,1],'a1-u05-l3':[0,1,2,3],'a1-u05-l4':[0,2],'a1-u06-l1':[0,1,2,3,4,5,6,7],'a1-u06-l2':[0,1,2,3],'a1-u06-l3':[0,1],'a1-u06-l4':[0,2]};
const italianHeaders=new Set(['il','lo','la',"l'",'i','gli','le','potere','volere','dovere','andare','venire']);
for(const plan of plans){
 test(plan.id+' translates every learner-language field and preserves Italian, options and neutral grading fields',()=>{
  const box=setup();language(box,'ar');const key='lesson:'+plan.id,patch=ar[key],base=en[key];
  assert.equal(box.sandbox.LINGUAI.lessonLanguage('ar',plan.id),'ar');assert.equal(patch.title,plan.title);
  assert.deepEqual(Object.keys(patch).sort(),Object.keys(base).sort());
  function translated(value,source,where=''){
   if(Array.isArray(value))return value.forEach((v,i)=>translated(v,source&&source[i],where+'['+i+']'));
   if(value&&typeof value==='object')return Object.entries(value).forEach(([k,v])=>translated(v,source&&source[k],where+'.'+k));
   assert.equal(typeof value,'string',where);
   assert.equal((value.match(/\u2066/g)||[]).length,(value.match(/\u2069/g)||[]).length,'Unbalanced LTR isolate '+where);
   if(/[\u0600-\u06ff]/.test(value))return;
   if(value===''&&source==='')return;
   const cell=/\.grammar\.table\.rows\[(\d+)\]\[(\d+)\]$/.exec(where);
   if(cell&&italianColumns[plan.id].includes(Number(cell[2]))){assert.equal(value,source,'Italian table cell');assert(!/^at\b/.test(value));return;}
   if(cell&&value==='a + le = alle'){assert.equal(value,source);return;}
   if(/\.grammar\.table\.head/.test(where)&&italianHeaders.has(value)){assert.equal(value,source);return;}
   if(/\.opts\[/.test(where)){assert.equal(value,source,'Italian option');return;}
   if(plan.id==='a1-u05-l2'&&/\.pairs\[/.test(where)&&/^\d{1,2}:\d{2}$/.test(value)){assert.equal(value,source);return;}
   assert.fail('Untranslated learner text: '+where+': '+value);
  }
  translated(patch,base);
  let neutral;vm.runInNewContext(readFileSync(join(ROOT,'data/core/a1-02.js'),'utf8'),{LINGUAI:{addUnits(_code,units){for(const unit of units)for(const lesson of [...unit.lessons,unit.test])if(lesson.id===plan.id)neutral=plain(lesson);}}});
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

test('Arabic guidance corrects source ambiguities and follows the actual Italian meaning',()=>{
 assert.match(ar['lesson:a1-u05-l1'].theory.find(p=>p.contrast).contrast,/في العربية/);
 assert.match(ar['lesson:a1-u05-l1'].exercises[3].why,/Mi devo alzare/);
 assert.match(ar['lesson:a1-u05-l2'].theory[1].p,/e un quarto/);assert.doesNotMatch(ar['lesson:a1-u05-l2'].theory[1].p,/quarter/);
 assert.match(ar['lesson:a1-u05-l4'].exercises[1].q,/كلمتَي الفراغين فقط/);
 assert.match(ar['lesson:a1-u05-l4'].exercises[8].tr,/أستيقظ/);assert.doesNotMatch(ar['lesson:a1-u05-l4'].exercises[8].tr,/أنهض/);
 assert.match(ar['lesson:a1-u06-l2'].exercises[6].q,/وضعية الوقوف/);
 assert.match(ar['lesson:a1-u06-l3'].exercises[4].q,/أسلوب مخاطبة واحد/);
 assert.match(ar['lesson:a1-u06-l3'].exercises[4].tr,/مقابل.*بجانب/);
 assert.match(ar['lesson:a1-u06-l4'].grammar.examples[4].tr,/المحطّة/);assert.doesNotMatch(ar['lesson:a1-u06-l4'].grammar.examples[4].tr,/وسط المدينة/);
});

test('Arabic-English-Arabic and all five existing languages restore exact content and clear all four target glosses',()=>{
 const box=setup(),snapshot=()=>plain(box.Core.registry.byCode.A1.units);
 for(const lang of ['en','pl','es','fr','de']){language(box,lang);const before=snapshot();language(box,'ar');const arabic=snapshot();for(const next of [lang,'ar',lang,'ar']){language(box,next);assert.deepEqual(snapshot(),next==='ar'?arabic:before);}}
 language(box,'en');const fallback=plain(box.Core.registry.byCode.B1.units[0]);language(box,'ar');assert.deepEqual(plain(box.Core.registry.byCode.B1.units[0]),fallback);
 for(const lang of ['en','pl','es','fr','de']){
  assert.deepEqual(entries(lang)['lesson:a1-u06-test'].exercises[0].items,['','','','']);
  language(box,'ar');assert.equal(box.Core.getLesson('a1-u06-test').lesson.exercises[0].items[3].gloss,'الطلّاب');
  language(box,lang);assert.deepEqual(plain(box.Core.getLesson('a1-u06-test').lesson.exercises[0].items.map(item=>item.gloss)),['','','','']);
 }
});

test('each new lesson and assessment falls back atomically when damaged, preserving translated neighbors',()=>{
 for(const plan of plans)for(const damage of [p=>{delete p.title;},p=>p.exercises.pop(),p=>{p.theory=[];}]){
  const box=setup(),all=bags('ar');damage(all['a1-02.js']['lesson:'+plan.id]);box.sandbox.LINGUAI.addStrings('ar',all['a1-02.js']);language(box,'es');language(box,'ar');
  assert.equal(box.sandbox.LINGUAI.lessonLanguage('ar',plan.id),'en');assert.equal(box.Core.getLesson(plan.id).lesson.title,en['lesson:'+plan.id].title);
  const other=plans.find(p=>p.id!==plan.id);assert.equal(box.sandbox.LINGUAI.lessonLanguage('ar',other.id),'ar');assert.equal(box.sandbox.LINGUAI.lessonLanguage('ar','a1-u04-l1'),'ar');
  const errors=[];checkPartialCourse(box.sandbox.I18n.courseOverrides('ar'),all,entries('pl'),errors);assert.ok(errors.some(e=>e.includes(plan.id)));
 }
});

test('new unit summaries are independently atomic and untranslated B1 Unit 1 retains English fallback',()=>{
 for(const unit of ['a1-u05','a1-u06'])for(const field of ['title','grammarNote']){
  const box=setup(),patch=bag('ar','a1-02.js');delete patch['unit:'+unit][field];patch['unit:b1-u01']={title:'غير معلن',grammarNote:'غير معلن'};box.sandbox.LINGUAI.addStrings('ar',patch);language(box,'ar');
  const current=box.Core.registry.byCode.A1.units.find(u=>u.id===unit);assert.equal(current.title,en['unit:'+unit].title);assert.equal(current.grammarNote,en['unit:'+unit].grammarNote);
  assert.equal(box.sandbox.LINGUAI.lessonLanguage('ar',unit+'-l1'),'ar');assert.equal(box.Core.registry.byCode.B1.units[0].title,bag('en','b1-01.js')['unit:b1-u01'].title);
 }
});

test('new translations reuse existing file loading and never request undeclared Arabic course files',()=>{
 const box=setup(),R=box.sandbox.Registry;
 assert.deepEqual(R.i18nPaths('ar',['a1-01.js','a1-02.js','a1-03.js','b1-01.js']),['data/i18n/en/a1-01.js','data/i18n/en/a1-02.js','data/i18n/en/a1-03.js','data/i18n/en/b1-01.js','data/i18n/ar/a1-01.js','data/i18n/ar/a1-02.js','data/i18n/ar/a1-03.js']);
 R.markI18n(['data/i18n/en/a1-02.js','data/i18n/ar/a1-02.js'],['data/i18n/ar/a1-02.js']);assert.deepEqual(R.i18nPaths('ar',['a1-02.js']),['data/i18n/ar/a1-02.js']);
});

test('language switching preserves scores, progress, review schedules and language-specific glossary meanings',()=>{
 const box=setup(),C=box.Core;language(box,'en');plans.forEach(p=>C.recordLesson(p.id,10,10,80));C.addCard('la fermata','stop','a1-u06-l1');language(box,'ar');C.addCard('la fermata','موقف حافلة أو ترام','a1-u06-l1');
 const card=C.state.srs[C.cardKey('la fermata')];assert.equal(card.tr.en,'stop');assert.equal(card.tr.ar,'موقف حافلة أو ترام');
 const state=()=>{const s=plain(C.state);delete s.settings.lang;return s;},before=state();for(const lang of ['en','pl','es','fr','de','ar']){language(box,lang);assert.deepEqual(state(),before);}assert.equal(C.state.schema,2);
});
