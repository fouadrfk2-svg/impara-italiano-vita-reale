import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {join} from 'node:path';
import {createHash} from 'node:crypto';
import vm from 'node:vm';
import {loadEngine,CORE,VERBS,ROOT} from './_harness.mjs';
import {checkPartialCourse} from '../../scripts/parity.mjs';
// Reviewed responses to the original 100 exercises; no new learner exercises.
const plans=[
  {
    "id": "a2-u03-l1",
    "title": "ضمائر المفعول به",
    "answers": [
      1,
      "li",
      "la",
      2,
      [
        "lo",
        "le"
      ],
      "Non lo conosco.",
      [
        0,
        1
      ],
      [
        "Mi",
        "aspetti",
        "cinque",
        "minuti?"
      ],
      "Le chiavi non le trovo, forse le ho lasciate in ufficio.",
      "Conosci quel ristorante? — Sì, lo conosco bene."
    ],
    "keys": [
      "Sì, la conosco.",
      "li",
      "la",
      "كلتا الصيغتين صحيحتان.",
      [
        "lo",
        "le"
      ],
      "Non lo conosco.",
      [
        "lo",
        "la"
      ],
      "Mi aspetti cinque minuti?",
      "Le chiavi non le trovo, forse le ho lasciate in ufficio.",
      "Conosci quel ristorante? — Sì, lo conosco bene."
    ]
  },
  {
    "id": "a2-u03-l2",
    "title": "مطابقة الصيغة الماضية مع الضمير",
    "answers": [
      1,
      "li i",
      "e",
      1,
      [
        "a",
        "e"
      ],
      "L'ho conosciuta a Roma.",
      [
        0,
        2
      ],
      [
        "I",
        "documenti",
        "li",
        "ho",
        "già",
        "spediti"
      ],
      "Le foto del viaggio non le ho ancora guardate.",
      "Hai visto Giulia? — Sì, l'ho vista ieri sera."
    ],
    "keys": [
      "Sì, l'ho vista.",
      "li i",
      "e",
      "لأن le هنا ضمير غير مباشر، بمعنى «إليها»",
      [
        "a",
        "e"
      ],
      "L'ho conosciuta a Roma.",
      [
        "L'ho vista.",
        "Li ho invitati."
      ],
      "I documenti li ho già spediti",
      "Le foto del viaggio non le ho ancora guardate.",
      "Hai visto Giulia? — Sì, l'ho vista ieri sera."
    ]
  },
  {
    "id": "a2-u03-l3",
    "title": "ضمائر المفعول غير المباشر",
    "answers": [
      1,
      0,
      "le",
      "gli",
      [
        0,
        2,
        4
      ],
      [
        "le",
        "gli"
      ],
      "Voglio parlargli oggi.",
      "match",
      "Le ho scritto ieri, ma non mi ha ancora risposto.",
      "Gli telefono stasera e gli spiego tutto."
    ],
    "keys": [
      "Gli telefono.",
      "Lo vedo.",
      "le",
      "gli",
      [
        "telefonare",
        "rispondere",
        "credere"
      ],
      [
        "le",
        "gli"
      ],
      "Voglio parlargli oggi.",
      [
        "يهدي شخصًا",
        "يُعير شخصًا",
        "يشرح لشخص",
        "ينصح شخصًا"
      ],
      "Le ho scritto ieri, ma non mi ha ancora risposto.",
      "Gli telefono stasera e gli spiego tutto."
    ]
  },
  {
    "id": "a2-u03-l4",
    "title": "الأمر مع الضمائر",
    "answers": [
      0,
      "prendi",
      "parli",
      "dimmi",
      1,
      "Non ti preoccupare.",
      [
        "fammi",
        "mandami"
      ],
      [
        "Mi",
        "dica",
        "pure,",
        "signora"
      ],
      "Fammi sapere quando arrivi, ti vengo a prendere.",
      "Dimmi tutto, non ti preoccupare."
    ],
    "keys": [
      "tu",
      "prendi",
      "parli",
      "dimmi",
      "بعد الصيغة القصيرة da' يتضاعف الحرف الساكن في بداية الضمير",
      "Non ti preoccupare.",
      [
        "fammi",
        "mandami"
      ],
      "Mi dica pure, signora",
      "Fammi sapere quando arrivi, ti vengo a prendere.",
      "Dimmi tutto, non ti preoccupare."
    ]
  },
  {
    "id": "a2-u03-test",
    "title": "اختبار الوحدة الثالثة من A2",
    "answers": [
      1,
      "li",
      "e",
      1,
      "le",
      "senti",
      "dimmi",
      "Non ti preoccupare, ci penso io.",
      "L'ho vista ieri e le ho parlato del progetto.",
      "Fammi sapere quando arrivi, ti aspetto."
    ],
    "keys": [
      "Sì, la conosco.",
      "li",
      "e",
      "Gli telefono",
      "le",
      "senti",
      "dimmi",
      "Non ti preoccupare, ci penso io.",
      "L'ho vista ieri e le ho parlato del progetto.",
      "Fammi sapere quando arrivi, ti aspetto."
    ]
  },
  {
    "id": "a2-u04-l1",
    "title": "التعبير عن الألم والأعراض",
    "answers": [
      1,
      "fa",
      "di",
      1,
      "match",
      "Mi fa male la gola da tre giorni.",
      [
        "mi",
        "ho",
        "debole"
      ],
      [
        "Ho",
        "la",
        "tosse",
        "e",
        "il",
        "raffreddore",
        "da",
        "una",
        "settimana"
      ],
      "Mi fanno male le gambe dopo la corsa.",
      "Mi fa male la testa e ho la febbre."
    ],
    "keys": [
      "Mi fanno",
      "fa",
      "di",
      "Mi fa male la testa.",
      [
        "السعال",
        "الزكام",
        "الغثيان",
        "الحمّى"
      ],
      "Mi fa male la gola da tre giorni.",
      [
        "mi",
        "ho",
        "debole"
      ],
      "Ho la tosse e il raffreddore da una settimana",
      "Mi fanno male le gambe dopo la corsa.",
      "Mi fa male la testa e ho la febbre."
    ]
  },
  {
    "id": "a2-u04-l2",
    "title": "عند الطبيب",
    "answers": [
      1,
      "allergica",
      "volte",
      "match",
      "Da quanto tempo ha questi sintomi?",
      [
        0,
        0,
        0
      ],
      [
        "pastiglia",
        "pasti",
        "beva"
      ],
      [
        "Ho",
        "bisogno",
        "di",
        "un",
        "certificato",
        "medico"
      ],
      "Prenda l'antibiotico per sei giorni, anche se sta meglio.",
      "Sono allergica alla penicillina, c'è un'alternativa?"
    ],
    "keys": [
      "Al pronto soccorso",
      "allergica",
      "volte",
      [
        "الوصفة الطبية",
        "القرص الدوائي",
        "على معدة فارغة",
        "يتعافى"
      ],
      "Da quanto tempo ha questi sintomi?",
      [
        "Mi fa male la gola e ho la febbre.",
        "Da tre giorni.",
        "No, nessuna. Quante volte al giorno lo prendo?"
      ],
      [
        "pastiglia",
        "pasti",
        "beva"
      ],
      "Ho bisogno di un certificato medico",
      "Prenda l'antibiotico per sei giorni, anche se sta meglio.",
      "Sono allergica alla penicillina, c'è un'alternativa?"
    ]
  },
  {
    "id": "a2-u04-l3",
    "title": "تقديم النصيحة",
    "answers": [
      [
        "dovrei",
        "dovresti",
        "dovrebbe",
        "dovremmo",
        "dovreste",
        "dovrebbero"
      ],
      [
        "potresti",
        "potrebbe",
        "potrebbero"
      ],
      1,
      "sarebbe",
      "potresti",
      "Dovresti riposare qualche giorno.",
      "match",
      [
        "dovresti",
        "perché"
      ],
      "Sarebbe meglio se prendessi un giorno libero.",
      "Dovresti riposare e bere molta acqua."
    ],
    "keys": [
      [
        "dovrei",
        "dovresti",
        "dovrebbe",
        "dovremmo",
        "dovreste",
        "dovrebbero"
      ],
      [
        "potresti",
        "potrebbe",
        "potrebbero"
      ],
      "Dovresti riposare.",
      "sarebbe",
      "potresti",
      "Dovresti riposare qualche giorno.",
      [
        "يؤسفني ذلك",
        "يا للأسف",
        "أتمنّى لك الشفاء قريبًا",
        "من الأفضل لك أن"
      ],
      [
        "dovresti",
        "perché"
      ],
      "Sarebbe meglio se prendessi un giorno libero.",
      "Dovresti riposare e bere molta acqua."
    ]
  },
  {
    "id": "a2-u04-l4",
    "title": "العادات والنشاط اليومي",
    "answers": [
      "di",
      "a",
      "alla",
      1,
      1,
      "Cerco di dormire almeno sette ore.",
      [
        "a",
        "cercando"
      ],
      "match",
      "Ho smesso di fumare tre mesi fa e sto molto meglio.",
      "Vado a correre tre volte alla settimana, la mattina presto."
    ],
    "keys": [
      "di",
      "a",
      "alla",
      "في يوم دون اليوم التالي",
      "نمط التغذية",
      "Cerco di dormire almeno sette ore.",
      [
        "a",
        "cercando"
      ],
      [
        "يتدرّب؛ يتمرّن",
        "يسجّل نفسه؛ يشترك",
        "يقلّل",
        "على الأقلّ"
      ],
      "Ho smesso di fumare tre mesi fa e sto molto meglio.",
      "Vado a correre tre volte alla settimana, la mattina presto."
    ]
  },
  {
    "id": "a2-u04-test",
    "title": "اختبار الوحدة الرابعة من A2",
    "answers": [
      "fanno",
      "di",
      1,
      [
        "dovrei",
        "dovresti",
        "dovrebbe"
      ],
      "sarebbe",
      "di",
      "match",
      "Mi fa male la gola da due giorni.",
      "Prenda una pastiglia due volte al giorno dopo i pasti.",
      "Non mi sento bene, dovrei andare dal medico."
    ],
    "keys": [
      "fanno",
      "di",
      "pronto soccorso",
      [
        "dovrei",
        "dovresti",
        "dovrebbe"
      ],
      "sarebbe",
      "di",
      [
        "الوصفة الطبية",
        "السعال",
        "يتعافى",
        "على معدة فارغة"
      ],
      "Mi fa male la gola da due giorni.",
      "Prenda una pastiglia due volte al giorno dopo i pasti.",
      "Non mi sento bene, dovrei andare dal medico."
    ]
  }
];
const priorA1Hash='64cc53d1610b558488ee67bbab4426079df67567405dec13a20425e7eb11c293',originalA2Hash='7a7dea523610a596b05f280edead1b954da3950e57400ebb76ff0b88cb9d8c5a';

const plain=value=>JSON.parse(JSON.stringify(value));
const a1Files=['a1-01.js','a1-02.js','a1-03.js'],files=[...a1Files,'a2-01.js','a2-02.js','b1-01.js','b2-01.js','b2-02.js','b2-03.js','c1-01.js','c1-02.js','c1-03.js'];
const read=file=>readFileSync(join(ROOT,file),'utf8');
function bag(lang,file){let result;vm.runInNewContext(read('data/i18n/'+lang+'/'+file),{LINGUAI:{addStrings(_l,map){result=plain(map);}}});return result;}
const bags=lang=>Object.fromEntries(files.map(file=>[file,bag(lang,file)]));
const entries=lang=>Object.assign({},...Object.values(bags(lang)));
const ar=entries('ar'),en=entries('en');
function setup(){const box=loadEngine({files:[...CORE,...VERBS,'assets/js/i18n.js','assets/js/i18n-merge.js','data/i18n/ui-en.js','data/i18n/ui-ar.js']});box.Core.load();for(const file of ['data/core/curriculum-index.js',...['a1-01.js','a1-02.js','a1-03.js','a2-01.js','a2-02.js','b1-01.js','b2-01.js','b2-02.js','b2-03.js','c2-01.js','c2-02.js'].map(f=>'data/core/'+f),...['en','pl','es','fr','de','ar'].flatMap(lang=>['a1-01.js','a1-02.js','a1-03.js','a2-01.js','a2-02.js','b1-01.js','b2-01.js','b2-02.js','b2-03.js','c1-01.js','c1-02.js','c1-03.js',...(lang==='ar'?[]:['c2-01.js','c2-02.js'])].map(f=>'data/i18n/'+lang+'/'+f))])vm.runInContext(readFileSync(join(ROOT,file),'utf8'),box.sandbox);return box;}
function language(box,lang){box.Core.state.settings.lang=lang;box.sandbox.I18n.set(lang);box.sandbox.LINGUAI.applyStrings(lang);box.sandbox.Registry.reindex();}
test('A2 Units 3–4 extend only the existing partial Arabic manifest',()=>{
 const box=setup(),manifest=plain(box.sandbox.I18n.courseOverrides('ar'));
 const keys=n=>['unit:a2-u0'+n,...[1,2,3,4].map(l=>'lesson:a2-u0'+n+'-l'+l),'lesson:a2-u0'+n+'-test'];
 assert.equal(Object.values(manifest).flat().length,187);assert.equal(a1Files.flatMap(f=>manifest[f]).length,60);assert.deepEqual(manifest['a2-01.js'],[...keys(1),...keys(2),...keys(3),...keys(4)]);
 assert.equal(plans.length,10);assert.equal(plans.filter(p=>/-l[1-4]$/.test(p.id)).length,8);assert.equal(plans.reduce((n,p)=>n+p.answers.length,0),100);
 for(const f of files)assert.deepEqual(Object.keys(bag('ar',f)),manifest[f]);
 const errors=[];checkPartialCourse(manifest,bags('ar'),entries('pl'),errors);assert.deepEqual(errors,[]);
});
test('all A1 content and original Italian A2 core bytes remain unchanged',()=>{
 assert.equal(createHash('sha256').update(a1Files.map(f=>read('data/i18n/ar/'+f).replace(/\r\n/g,'\n')).join('\n')).digest('hex'),priorA1Hash);
 assert.equal(createHash('sha256').update(read('data/core/a2-01.js').replace(/\r\n/g,'\n')).digest('hex'),originalA2Hash);
 const box=setup(),units=plain(box.Core.registry.byCode.A2.units),all=units.filter(u=>['a2-u03','a2-u04'].includes(u.id)).flatMap(u=>[...u.lessons,u.test]);
 assert.equal(all.length,10);assert.equal(all.reduce((n,l)=>n+l.exercises.length,0),100);assert.deepEqual(all.map(l=>l.id),plans.map(p=>p.id));
});
const italianColumns={'a2-u03-l1':[0,2],'a2-u03-l2':[0,1,2],'a2-u03-l3':[0,2],'a2-u03-l4':[0,1,2,3,4],'a2-u04-l1':[0,1],'a2-u04-l2':[1],'a2-u04-l3':[0,1,2,3,4],'a2-u04-l4':[0,1]};
const italianHeaders=new Set(['parlare','prendere','sentire','dovere','potere','volere','essere']);
const italianOptions={'a2-u03-l1':[0,3,6],'a2-u03-l2':[0,6],'a2-u03-l3':[0,1,4],'a2-u03-l4':[0],'a2-u03-test':[0,3],'a2-u04-l1':[0,3],'a2-u04-l2':[0],'a2-u04-l3':[2],'a2-u04-test':[2]};
for(const plan of plans){
 test(plan.id+' fully translates source learner text without adding examples, exercises or neutral fields',()=>{
  const box=setup();language(box,'ar');const patch=ar['lesson:'+plan.id],base=en['lesson:'+plan.id],merged=plain(box.Core.getLesson(plan.id).lesson);
  assert.equal(box.sandbox.LINGUAI.lessonLanguage('ar',plan.id),'ar');assert.equal(patch.title,plan.title);assert.deepEqual(Object.keys(patch).sort(),Object.keys(base).sort());
  function translated(value,source,where=''){
   if(Array.isArray(value)){assert.equal(value.length,source.length,where);return value.forEach((v,i)=>translated(v,source[i],where+'['+i+']'));}
   if(value&&typeof value==='object'){assert.deepEqual(Object.keys(value).sort(),Object.keys(source).sort(),where);return Object.entries(value).forEach(([k,v])=>translated(v,source[k],where+'.'+k));}
   assert.equal(typeof value,'string',where);assert.equal((value.match(/\u2066/g)||[]).length,(value.match(/\u2069/g)||[]).length,where);
   if(/[\u0600-\u06ff]/.test(value))return;
   const cell=/\.grammar\.table\.rows\[(\d+)\]\[(\d+)\]$/.exec(where);
   if(cell&&(italianColumns[plan.id]||[]).includes(Number(cell[2])))return assert.equal(value,source,'Original Italian table cell');
   if(/\.grammar\.table\.head/.test(where)&&italianHeaders.has(value))return assert.equal(value,source,'Italian verb header');
   const option=/\.exercises\[(\d+)\]\.opts\[/.exec(where);
   if(option&&(italianOptions[plan.id]||[]).includes(Number(option[1])))return assert.equal(value,source,'Original Italian answer option');
   assert.fail('Untranslated learner text '+where+': '+value);
  }
  translated(patch,base);
  let neutral;vm.runInNewContext(read('data/core/a2-01.js'),{LINGUAI:{addUnits(_l,units){for(const u of units)for(const l of [...u.lessons,u.test])if(l.id===plan.id)neutral=plain(l);}}});
  function unchanged(source,target){for(const[k,v]of Object.entries(source)){if(v&&typeof v==='object')unchanged(v,target[k]);else assert.equal(target[k],v,plan.id+': '+k);}}
  unchanged(neutral,merged);assert.equal(patch.exercises.length,neutral.exercises.length);
  if(patch.grammar){assert.equal(patch.grammar.examples.length,base.grammar.examples.length);assert.equal(patch.grammar.table.rows.length,base.grammar.table.rows.length);}
 });
 plan.keys.forEach((expected,index)=>test(plan.id+' original exercise '+(index+1)+' Arabic prompt matches the unchanged answer key',()=>{
  const box=setup();language(box,'ar');const ex=plain(box.Core.getLesson(plan.id).lesson.exercises[index]);
  if(ex.t==='conj')assert.deepEqual(ex.persons.map(p=>box.sandbox.Verbs.conjugate(ex.verb,ex.tense)[p]),expected);
  if(ex.t==='mcq')assert.equal(ex.opts[ex.a],expected);
  if(ex.t==='multi')assert.deepEqual(ex.a.map(i=>ex.opts[i]),expected);
  if(['fill','trans','order'].includes(ex.t))assert.equal(box.Core.checkOpen(expected,ex.a,true).ok,true);
  if(ex.t==='order')assert.equal(box.Core.norm(ex.tokens.join(' ')),box.Core.norm(expected));
  if(ex.t==='cloze'){assert.equal(ex.gaps.length,expected.length);expected.forEach((word,i)=>assert.equal(box.Core.checkOpen(word,ex.gaps[i],false).ok,true));}
  if(ex.t==='match')assert.deepEqual(ex.pairs.map(p=>p.tr),expected);
  if(ex.t==='dialogue')assert.deepEqual(ex.lines.filter(l=>l.choices).map(l=>l.choices[l.a]),expected);
  if(['listen','speak'].includes(ex.t))assert.equal(ex.it,expected);
 }));
}
test('Arabic explanations match Arabic usage, Italian scope and the unchanged exercise wording',()=>{
 assert.match(ar['lesson:a2-u03-l1'].theory[2].p,/في العربية/);
 assert.match(ar['lesson:a2-u03-l2'].theory[0].p,/lo, la, li, le/);
 assert.match(ar['lesson:a2-u03-l2'].theory[0].p,/اختيارية/);
 assert.equal(ar['lesson:a2-u03-l4'].exercises[7].tr,'تفضّلي بالكلام، يا سيدتي.');
 assert.equal(ar['lesson:a2-u03-l2'].exercises[1].hint,'الضمير + نهاية الصيغة الماضية');
 assert.match(ar['lesson:a2-u04-l1'].theory[2].p,/في العربية/);
 assert.match(ar['lesson:a2-u04-l2'].theory[0].p,/لا يعني ذلك أن كلّ خدمة مجانية/);
 assert.match(ar['lesson:a2-u04-l2'].exercises[1].q,/المتحدّثة امرأة/);
 assert.match(ar['lesson:a2-u04-l2'].exercises[4].q,/Lei/);
 assert.match(ar['lesson:a2-u04-l3'].theory[1].p,/في العربية/);
 assert.equal(ar['lesson:a2-u04-l4'].exercises[3].opts[1],'في يوم دون اليوم التالي');
});
test('the complete prior A2 Units 1–2 Arabic content is preserved',()=>{
 const prior=Object.fromEntries(Object.entries(bag('ar','a2-01.js')).filter(([k])=>/a2-u0[12](?:-|$)/.test(k)));
 assert.equal(Object.keys(prior).length,12);
 assert.equal(createHash('sha256').update(JSON.stringify(prior)).digest('hex'),'3b10a1f14a6ea8cb5f39d397e41c18c7f9995cb924b091cb30b975a68b5b3dd9');
});
test('the conditional label is Arabic and previous tense labels and fallback remain available',()=>{
 const box=setup();language(box,'ar');assert.match(box.sandbox.I18n.t('tense.condizionale'),/الشرطية/);assert.match(box.sandbox.I18n.t('tense.imperf'),/الماضي/);assert.match(box.sandbox.I18n.t('tense.futuro'),/المستقبل/);
 assert.equal(box.sandbox.I18n.t('tense.futAnt'), 'Future perfect');
});
test('every language restores exact A1/A2 content and untranslated C2 Unit 1 stays English',()=>{
 const box=setup(),snapshot=()=>plain([box.Core.registry.byCode.A1.units,box.Core.registry.byCode.A2.units]);
 for(const lang of ['en','pl','es','fr','de']){language(box,lang);const base=snapshot();language(box,'ar');const arabic=snapshot();for(const next of [lang,'ar',lang,'ar']){language(box,next);assert.deepEqual(snapshot(),next==='ar'?arabic:base);}}
 language(box,'en');const fallback=plain(box.Core.registry.byCode.C2.units[0]);language(box,'ar');assert.deepEqual(plain(box.Core.registry.byCode.C2.units[0]),fallback);assert.equal(box.sandbox.LINGUAI.lessonLanguage('ar','c2-u01-l1'),'en');
});
test('each new lesson and assessment falls back atomically when malformed without damaging A1 or its neighbors',()=>{
 for(const plan of plans)for(const damage of [p=>{delete p.title;},p=>p.exercises.pop(),p=>{p.theory=[];}]){
  const box=setup(),all=bags('ar');damage(all['a2-01.js']['lesson:'+plan.id]);box.sandbox.LINGUAI.addStrings('ar',all['a2-01.js']);language(box,'es');language(box,'ar');
  assert.equal(box.sandbox.LINGUAI.lessonLanguage('ar',plan.id),'en');assert.equal(box.Core.getLesson(plan.id).lesson.title,en['lesson:'+plan.id].title);
  assert.equal(box.sandbox.LINGUAI.lessonLanguage('ar',plans.find(p=>p.id!==plan.id).id),'ar');assert.equal(box.sandbox.LINGUAI.lessonLanguage('ar','a1-u10-l1'),'ar');
  const errors=[];checkPartialCourse(box.sandbox.I18n.courseOverrides('ar'),all,entries('pl'),errors);assert(errors.some(e=>e.includes(plan.id)));
 }
});
test('unit summaries remain atomic and undeclared C2 Unit 1 cannot override English',()=>{
 for(const unit of ['a2-u03','a2-u04'])for(const field of ['title','grammarNote']){
  const box=setup(),patch=bag('ar','a2-01.js');delete patch['unit:'+unit][field];patch['unit:c2-u01']={title:'غير معلن',grammarNote:'غير معلن'};box.sandbox.LINGUAI.addStrings('ar',patch);language(box,'ar');
  const current=box.Core.registry.byCode.A2.units.find(u=>u.id===unit);assert.equal(current.title,en['unit:'+unit].title);assert.equal(current.grammarNote,en['unit:'+unit].grammarNote);assert.equal(box.Core.registry.byCode.C2.units[0].title,bag('en','c2-01.js')['unit:c2-u01'].title);
 }
});
test('the partial A2 file follows English, retries a failed load and never requests undeclared Arabic C2 files',()=>{
 const box=setup(),R=box.sandbox.Registry;assert.deepEqual(R.i18nPaths('ar',['a2-01.js','a2-02.js','b1-01.js','b2-01.js','b2-02.js','b2-03.js','c2-01.js','c2-02.js']),["data/i18n/en/a2-01.js","data/i18n/en/a2-02.js","data/i18n/en/b1-01.js","data/i18n/en/b2-01.js","data/i18n/en/b2-02.js","data/i18n/en/b2-03.js","data/i18n/en/c2-01.js","data/i18n/en/c2-02.js","data/i18n/ar/a2-01.js","data/i18n/ar/a2-02.js","data/i18n/ar/b1-01.js","data/i18n/ar/b2-01.js","data/i18n/ar/b2-02.js","data/i18n/ar/b2-03.js"]);
 R.markI18n(['data/i18n/en/a2-01.js','data/i18n/ar/a2-01.js'],['data/i18n/ar/a2-01.js']);assert.deepEqual(R.i18nPaths('ar',['a2-01.js']),['data/i18n/ar/a2-01.js']);
});
test('language switching preserves learner scores, reviews and separate glossary translations',()=>{
 const box=setup(),C=box.Core;language(box,'en');C.recordLesson('a1-u01-l1',9,9,80);plans.forEach(p=>C.recordLesson(p.id,10,10,80));C.addCard('il binario','platform','a2-u02-l1');language(box,'ar');C.addCard('il binario','رصيف القطار','a2-u02-l1');
 const card=C.state.srs[C.cardKey('il binario')];assert.equal(card.tr.en,'platform');assert.equal(card.tr.ar,'رصيف القطار');const state=()=>{const s=plain(C.state);delete s.settings.lang;return s;},before=state();for(const lang of ['en','pl','es','fr','de','ar']){language(box,lang);assert.deepEqual(state(),before);}assert.equal(C.state.schema,2);
});

for(const number of [1,2,3,4])test('untranslated C2 Unit '+number+' keeps all three lessons, its assessment and metadata exactly English',()=>{
 const box=setup(),unitId='c2-u'+String(number).padStart(2,'0');
 const current=()=>plain(box.Core.registry.byCode.C2.units.find(unit=>unit.id===unitId));
 language(box,'en');const english=current();assert.ok(english);assert.equal(english.lessons.length,3);assert.equal(english.test.id,unitId+'-test');
 const ids=[...english.lessons,english.test].map(lesson=>lesson.id);
 assert.deepEqual(ids,[1,2,3].map(n=>unitId+'-l'+n).concat(unitId+'-test'));
 for(const lang of ['ar','es','ar','en','ar']){
  language(box,lang);
  if(lang!=='ar')continue;
  assert.deepEqual(current(),english,'All English explanations, vocabulary, questions, feedback and metadata restore');
  for(const id of ids)assert.equal(box.sandbox.LINGUAI.lessonLanguage('ar',id),'en',id);
 }
});
