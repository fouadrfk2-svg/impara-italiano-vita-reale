import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {join} from 'node:path';
import {createHash} from 'node:crypto';
import vm from 'node:vm';
import {loadEngine,CORE,VERBS,ROOT} from './_harness.mjs';
import {checkPartialCourse} from '../../scripts/parity.mjs';
// Independently reviewed responses to the original exercises; no new curriculum.
const plans=[
  {
    "id": "a2-u01-l1",
    "answers": [
      [
        "parlavo",
        "parlavi",
        "parlava",
        "parlavamo",
        "parlavate",
        "parlavano"
      ],
      [
        "ero",
        "era",
        "eravamo",
        "erano"
      ],
      [
        "facevo",
        "faceva",
        "facevano"
      ],
      1,
      "abitavo",
      "era",
      [
        "passavo",
        "era",
        "mangiavamo"
      ],
      "Prima fumavo, adesso ho smesso.",
      "Da bambino giocavo a calcio ogni pomeriggio.",
      "Da piccola abitavo in una casa vicino al mare."
    ],
    "keys": [
      [
        "parlavo",
        "parlavi",
        "parlava",
        "parlavamo",
        "parlavate",
        "parlavano"
      ],
      [
        "ero",
        "era",
        "eravamo",
        "erano"
      ],
      [
        "facevo",
        "faceva",
        "facevano"
      ],
      "عادة متكرّرة في الماضي",
      "abitavo",
      "era",
      [
        "passavo",
        "era",
        "mangiavamo"
      ],
      "Prima fumavo, adesso ho smesso.",
      "Da bambino giocavo a calcio ogni pomeriggio.",
      "Da piccola abitavo in una casa vicino al mare."
    ],
    "title": "imperfetto: وصف الماضي والعادات"
  },
  {
    "id": "a2-u01-l2",
    "answers": [
      1,
      [
        "mangiavo",
        "è arrivato"
      ],
      [
        "ho lavorato",
        "sono uscito"
      ],
      1,
      1,
      [
        0,
        2,
        4
      ],
      "Non sapevo che abitavi qui.",
      [
        "era",
        "pioveva",
        "avevo",
        "è arrivato"
      ],
      "Mentre tornavo a casa, ho incontrato una vecchia amica.",
      "Da bambino andavo al mare ogni estate, ma l'anno scorso sono andato in montagna."
    ],
    "keys": [
      "imperfetto ثم passato prossimo",
      [
        "mangiavo",
        "è arrivato"
      ],
      [
        "ho lavorato",
        "sono uscito"
      ],
      "تعرّفت إلى ماركو في روما",
      "لأن فترة العمل معروضة بحدود واضحة",
      [
        "ogni giorno",
        "di solito",
        "da bambino"
      ],
      "Non sapevo che abitavi qui.",
      [
        "era",
        "pioveva",
        "avevo",
        "è arrivato"
      ],
      "Mentre tornavo a casa, ho incontrato una vecchia amica.",
      "Da bambino andavo al mare ogni estate, ma l'anno scorso sono andato in montagna."
    ],
    "title": "الفرق بين imperfetto وpassato prossimo"
  },
  {
    "id": "a2-u01-l3",
    "answers": [
      "C'era",
      "C'erano",
      "più",
      1,
      [
        "c'era",
        "c'è",
        "è"
      ],
      "Non ci sono più i negozi di una volta.",
      [
        "Quando",
        "ero",
        "piccolo",
        "si",
        "giocava",
        "in",
        "strada"
      ],
      "match",
      "Vent'anni fa c'erano meno macchine e più negozi di quartiere.",
      "La mia città è cambiata molto negli ultimi dieci anni."
    ],
    "keys": [
      "C'era",
      "C'erano",
      "più",
      "بين المساعد والصيغة الماضية",
      [
        "c'era",
        "c'è",
        "è"
      ],
      "Non ci sono più i negozi di una volta.",
      "Quando ero piccolo si giocava in strada.",
      [
        "في المقابل",
        "مزدحم",
        "يصبح",
        "حركة المرور"
      ],
      "Vent'anni fa c'erano meno macchine e più negozi di quartiere.",
      "La mia città è cambiata molto negli ultimi dieci anni."
    ],
    "title": "وصف ما تغيّر"
  },
  {
    "id": "a2-u01-l4",
    "answers": [
      1,
      "era",
      "avevo",
      "match",
      [
        "aveva",
        "era"
      ],
      "Ti ricordi quando siamo andati in Sicilia?",
      [
        0,
        0
      ],
      [
        "Non",
        "sono",
        "uscito",
        "perché",
        "avevo",
        "promesso",
        "di",
        "lavorare"
      ],
      "Quando sono tornato, mia sorella era già andata via.",
      "Ti ricordi quando eravamo compagni di classe?"
    ],
    "keys": [
      "مغادرة القطار",
      "era",
      "avevo",
      [
        "لا أصدّق!",
        "حقًا؟",
        "ثمّ ماذا؟",
        "ما أجمل ذلك!"
      ],
      [
        "aveva",
        "era"
      ],
      "Ti ricordi quando siamo andati in Sicilia?",
      [
        "Che bello! Com'è andata?",
        "Mamma mia! E poi?"
      ],
      "Non sono uscito perché avevo promesso di lavorare.",
      "Quando sono tornato, mia sorella era già andata via.",
      "Ti ricordi quando eravamo compagni di classe?"
    ],
    "title": "التحدّث عن ذكريات الماضي"
  },
  {
    "id": "a2-u01-test",
    "answers": [
      [
        "ero",
        "era",
        "eravamo",
        "erano"
      ],
      [
        "facevo",
        "faceva"
      ],
      [
        "uscivo",
        "è squillato"
      ],
      [
        "ho lavorato"
      ],
      1,
      "c'era",
      "più",
      "era",
      "Da bambina passavo ogni estate al mare con i nonni.",
      "Mentre tornavo a casa ho incontrato un vecchio amico."
    ],
    "keys": [
      [
        "ero",
        "era",
        "eravamo",
        "erano"
      ],
      [
        "facevo",
        "faceva"
      ],
      [
        "uscivo",
        "è squillato"
      ],
      [
        "ho lavorato"
      ],
      "تعرّفت إلى آنا",
      "c'era",
      "più",
      "era",
      "Da bambina passavo ogni estate al mare con i nonni.",
      "Mentre tornavo a casa ho incontrato un vecchio amico."
    ],
    "title": "اختبار الوحدة الأولى من A2"
  },
  {
    "id": "a2-u02-l1",
    "answers": [
      1,
      1,
      "binario",
      "andata",
      "match",
      "Devo cambiare treno?",
      [
        0,
        0,
        0
      ],
      [
        "ritardo",
        "binario"
      ],
      "Il treno per Roma parte dal binario dodici con dieci minuti di ritardo.",
      "Scusi, devo convalidare questo biglietto?"
    ],
    "keys": [
      "أُلغيت رحلة القطار",
      "تذكرة قطار إقليمي دون موعد محدّد",
      "binario",
      "andata",
      [
        "عربة القطار",
        "رحلة مواصلة",
        "تأخير",
        "يفعّل صلاحية التذكرة"
      ],
      "Devo cambiare treno?",
      [
        "Un biglietto per Firenze per oggi pomeriggio.",
        "Quanto tempo ci vuole in più con il regionale?",
        "Prendo il Frecciarossa. Da quale binario parte?"
      ],
      [
        "ritardo",
        "binario"
      ],
      "Il treno per Roma parte dal binario dodici con dieci minuti di ritardo.",
      "Scusi, devo convalidare questo biglietto?"
    ],
    "title": "القطارات والتذاكر"
  },
  {
    "id": "a2-u02-l2",
    "answers": [
      [
        "partirò",
        "partirai",
        "partirà",
        "partiremo",
        "partirete",
        "partiranno"
      ],
      [
        "sarò",
        "sarà",
        "saranno"
      ],
      [
        "andrò",
        "andrà",
        "andremo"
      ],
      1,
      "avrò",
      "verranno",
      1,
      [
        "mi trasferirò",
        "cercherò"
      ],
      "Ti chiamerò appena arrivo alla stazione.",
      "L'anno prossimo andrò a vivere in Italia."
    ],
    "keys": [
      [
        "partirò",
        "partirai",
        "partirà",
        "partiremo",
        "partirete",
        "partiranno"
      ],
      [
        "sarò",
        "sarà",
        "saranno"
      ],
      [
        "andrò",
        "andrà",
        "andremo"
      ],
      "تتحوّل a إلى e قبل النهاية",
      "avrò",
      "verranno",
      "لعلّ الساعة الثالثة تقريبًا، على سبيل التخمين",
      [
        "mi trasferirò",
        "cercherò"
      ],
      "Ti chiamerò appena arrivo alla stazione.",
      "L'anno prossimo andrò a vivere in Italia."
    ],
    "title": "المستقبل البسيط (futuro semplice)"
  },
  {
    "id": "a2-u02-l3",
    "answers": [
      1,
      "prenotazione",
      "funziona",
      "mancano",
      "match",
      "La colazione è inclusa?",
      [
        0,
        0
      ],
      [
        "funziona",
        "mancano"
      ],
      "La camera è al terzo piano, la colazione dalle sette alle dieci.",
      "Posso lasciare le valigie dopo il check-out?"
    ],
    "keys": [
      "ضريبة إقامة تُدفع في مكان الإقامة",
      "prenotazione",
      "funziona",
      "mancano",
      [
        "مصعد",
        "ملاءة سرير",
        "طابق",
        "مفتاح"
      ],
      "La colazione è inclusa?",
      [
        "Sì, a nome Nowak, per tre notti.",
        "La colazione è inclusa?"
      ],
      [
        "funziona",
        "mancano"
      ],
      "La camera è al terzo piano, la colazione dalle sette alle dieci.",
      "Posso lasciare le valigie dopo il check-out?"
    ],
    "title": "الفنادق والإقامة"
  },
  {
    "id": "a2-u02-l4",
    "answers": [
      "avrò finito",
      "saremo partiti",
      1,
      [
        "saremo arrivati",
        "scriveremo"
      ],
      "Quando avrò finito il lavoro, ti chiamerò.",
      1,
      "match",
      [
        "Entro",
        "venerdì",
        "avremo",
        "prenotato",
        "tutto"
      ],
      "Appena saremo arrivati all'aeroporto, ti mandiamo un messaggio.",
      "Non risponde al telefono, avrà perso la coincidenza."
    ],
    "keys": [
      "avrò finito",
      "saremo partiti",
      "لعلّه فاته القطار",
      [
        "saremo arrivati",
        "scriveremo"
      ],
      "Quando avrò finito il lavoro, ti chiamerò.",
      "Quando finisco, ti chiamo.",
      [
        "الصعود إلى الطائرة أو السفينة",
        "رحلة جوّية",
        "بحلول موعد محدّد",
        "يلغي"
      ],
      "Entro venerdì avremo prenotato tutto.",
      "Appena saremo arrivati all'aeroporto, ti mandiamo un messaggio.",
      "Non risponde al telefono, avrà perso la coincidenza."
    ],
    "title": "المستقبل السابق والتخطيط"
  },
  {
    "id": "a2-u02-test",
    "answers": [
      [
        "sarò",
        "sarà",
        "saranno"
      ],
      "andrò",
      "potremo",
      1,
      "binario",
      "funziona",
      "avrò finito",
      "Ho una prenotazione per tre notti.",
      "Il volo per Varsavia parte dal gate B12 con venti minuti di ritardo.",
      "Vorrei un biglietto di sola andata per Bologna."
    ],
    "keys": [
      [
        "sarò",
        "sarà",
        "saranno"
      ],
      "andrò",
      "potremo",
      "ملغى",
      "binario",
      "funziona",
      "avrò finito",
      "Ho una prenotazione per tre notti.",
      "Il volo per Varsavia parte dal gate B12 con venti minuti di ritardo.",
      "Vorrei un biglietto di sola andata per Bologna."
    ],
    "title": "اختبار الوحدة الثانية من A2"
  }
];
const priorA1Hash='72ca6465c27cf5f4e6a0d930cea4613aab6f4d68c9ebc6858f3452c97fb83445',originalA2Hash='7a7dea523610a596b05f280edead1b954da3950e57400ebb76ff0b88cb9d8c5a';

const plain=value=>JSON.parse(JSON.stringify(value));
const a1Files=['a1-01.js','a1-02.js','a1-03.js'],files=[...a1Files,'a2-01.js','a2-02.js','b1-01.js','b2-01.js','b2-02.js','b2-03.js','c1-01.js','c1-02.js','c1-03.js'];
const read=file=>readFileSync(join(ROOT,file),'utf8');
function bag(lang,file){let result;vm.runInNewContext(read('data/i18n/'+lang+'/'+file),{LINGUAI:{addStrings(_l,map){result=plain(map);}}});return result;}
const bags=lang=>Object.fromEntries(files.map(file=>[file,bag(lang,file)]));
const entries=lang=>Object.assign({},...Object.values(bags(lang)));
const ar=entries('ar'),en=entries('en');
function setup(){const box=loadEngine({files:[...CORE,...VERBS,'assets/js/i18n.js','assets/js/i18n-merge.js','data/i18n/ui-en.js','data/i18n/ui-ar.js']});box.Core.load();for(const file of ['data/core/curriculum-index.js',...['a1-01.js','a1-02.js','a1-03.js','a2-01.js','a2-02.js','b1-01.js','b2-01.js','b2-02.js','b2-03.js','c2-01.js','c2-02.js'].map(f=>'data/core/'+f),...['en','ar'].flatMap(lang=>['a1-01.js','a1-02.js','a1-03.js','a2-01.js','a2-02.js','b1-01.js','b2-01.js','b2-02.js','b2-03.js','c1-01.js','c1-02.js','c1-03.js',...(lang==='ar'?[]:['c2-01.js','c2-02.js'])].map(f=>'data/i18n/'+lang+'/'+f))])vm.runInContext(readFileSync(join(ROOT,file),'utf8'),box.sandbox);return box;}
function language(box,lang){box.Core.state.settings.lang=lang;box.sandbox.I18n.set(lang);box.sandbox.LINGUAI.applyStrings(lang);box.sandbox.Registry.reindex();}
test('four existing A2 units are declared to the 60 unchanged A1 entries',()=>{
 const box=setup(),manifest=plain(box.sandbox.I18n.courseOverrides('ar'));
 const keys=n=>['unit:a2-u0'+n,...[1,2,3,4].map(l=>'lesson:a2-u0'+n+'-l'+l),'lesson:a2-u0'+n+'-test'];
 assert.equal(Object.values(manifest).flat().length,187);assert.equal(a1Files.flatMap(f=>manifest[f]).length,60);assert.deepEqual(manifest['a2-01.js'],[...keys(1),...keys(2),...keys(3),...keys(4)]);
 assert.equal(plans.length,10);assert.equal(plans.filter(p=>/-l[1-4]$/.test(p.id)).length,8);assert.equal(plans.reduce((n,p)=>n+p.answers.length,0),100);
 for(const f of files)assert.deepEqual(Object.keys(bag('ar',f)),manifest[f]);
 const errors=[];checkPartialCourse(manifest,bags('ar'),entries('en'),errors);assert.deepEqual(errors,[]);
});
test('all A1 content and original Italian A2 core bytes remain unchanged',()=>{
 assert.equal(createHash('sha256').update(a1Files.map(f=>read('data/i18n/ar/'+f).replace(/\r\n/g,'\n')).join('\n')).digest('hex'),priorA1Hash);
 assert.equal(createHash('sha256').update(read('data/core/a2-01.js').replace(/\r\n/g,'\n')).digest('hex'),originalA2Hash);
 const box=setup(),units=plain(box.Core.registry.byCode.A2.units),all=units.filter(u=>['a2-u01','a2-u02'].includes(u.id)).flatMap(u=>[...u.lessons,u.test]);
 assert.equal(all.length,10);assert.equal(all.reduce((n,l)=>n+l.exercises.length,0),100);assert.deepEqual(all.map(l=>l.id),plans.map(p=>p.id));
});
const italianColumns={'a2-u01-l1':[0,1,2,3,4],'a2-u01-l2':[0,1],'a2-u01-l3':[0,1],'a2-u01-l4':[1],'a2-u02-l1':[1],'a2-u02-l2':[0,1,2,3,4],'a2-u02-l3':[1],'a2-u02-l4':[0,1,2]};
const italianHeaders=new Set(['parlare','prendere','dormire','essere','partire']);
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
   if(plan.id==='a2-u01-l2'&&/\.exercises\[5\]\.opts\[/.test(where))return assert.equal(value,source,'Italian marker option');
   if(plan.id==='a2-u02-l4'&&/\.exercises\[5\]\.opts\[[01]\]/.test(where))return assert.equal(value,source,'Italian example option');
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
test('Arabic adaptation follows Italian names, gender, aspect and qualified source explanations',()=>{
 assert.match(ar['lesson:a2-u01-l1'].theory[3].contrast,/في العربية/);
 assert.doesNotMatch(JSON.stringify(ar['lesson:a2-u01-l1'].theory),/used to|was -ing/);
 assert.match(ar['lesson:a2-u01-l1'].theory[1].p,/ليست قائمة/);
 assert.match(ar['lesson:a2-u01-l2'].theory[2].list[1],/ليست هذه الكلمات وحدها/);
 assert.match(ar['lesson:a2-u01-l4'].theory[0].p,/ليست قاعدة/);
 assert.match(ar['lesson:a2-u02-l2'].theory[3].trap,/ليس منعًا/);
 assert.match(ar['lesson:a2-u02-l3'].exercises[6].lines[1].answerTr,/نوفاك/);
 assert.equal(ar['lesson:a2-u02-l3'].grammar.table.rows[0][1],'Ho una prenotazione a nome Smith.');
 assert.match(ar['lesson:a2-u02-l3'].exercises[7].tr,/204/);
 assert.match(ar['lesson:a2-u02-test'].exercises[8].tr,/وارسو.*B12/);
 assert.match(ar['lesson:a2-u02-l4'].exercises[3].q,/المجموعة مختلطة/);
 assert.match(ar['lesson:a2-u02-l3'].theory[0].p,/لا تعني.*حصرًا/);
 assert.match(ar['lesson:a2-u02-l3'].theory[1].p,/ليس تعرفة/);
});
test('required conjugation-tense labels stay Arabic while undeclared UI keys use English fallback',()=>{
 const box=setup();language(box,'ar');assert.match(box.sandbox.I18n.t('tense.imperf'),/الماضي/);assert.match(box.sandbox.I18n.t('tense.futuro'),/المستقبل/);
 // The interface is now complete: this formerly missing label is native Arabic.
 assert.equal(box.sandbox.I18n.t('tense.futAnt'), 'المستقبل التام (futuro anteriore)');
 box.sandbox.I18n.set('en');assert.equal(box.sandbox.I18n.lang,'ar');assert.equal(box.sandbox.I18n.t('tense.futAnt'), 'المستقبل التام (futuro anteriore)');
 // Keep testing the fallback mechanism independently of today's complete key set.
 box.sandbox.LINGUAI.addUI('en',{'ui.futureFallbackProbe':'English fallback'});
 box.sandbox.I18n.set('ar');assert.equal(box.sandbox.I18n.t('ui.futureFallbackProbe'),'English fallback');
});
test('every language restores exact A1/A2 content and untranslated C2 Unit 1 stays English',()=>{
 const box=setup(),snapshot=()=>plain([box.Core.registry.byCode.A1.units,box.Core.registry.byCode.A2.units]);
 for(const lang of ['en']){language(box,lang);const base=snapshot();language(box,'ar');const arabic=snapshot();for(const next of [lang,'ar',lang,'ar']){language(box,next);assert.deepEqual(snapshot(),next==='ar'?arabic:base);}}
 language(box,'en');const fallback=plain(box.Core.registry.byCode.C2.units[0]);language(box,'ar');assert.deepEqual(plain(box.Core.registry.byCode.C2.units[0]),fallback);assert.equal(box.sandbox.LINGUAI.lessonLanguage('ar','c2-u01-l1'),'en');
});
test('each new lesson and assessment falls back atomically when malformed without damaging A1 or its neighbors',()=>{
 for(const plan of plans)for(const damage of [p=>{delete p.title;},p=>p.exercises.pop(),p=>{p.theory=[];}]){
  const box=setup(),all=bags('ar');damage(all['a2-01.js']['lesson:'+plan.id]);box.sandbox.LINGUAI.addStrings('ar',all['a2-01.js']);language(box,'en');language(box,'ar');
  assert.equal(box.sandbox.LINGUAI.lessonLanguage('ar',plan.id),'en');assert.equal(box.Core.getLesson(plan.id).lesson.title,en['lesson:'+plan.id].title);
  assert.equal(box.sandbox.LINGUAI.lessonLanguage('ar',plans.find(p=>p.id!==plan.id).id),'ar');assert.equal(box.sandbox.LINGUAI.lessonLanguage('ar','a1-u10-l1'),'ar');
  const errors=[];checkPartialCourse(box.sandbox.I18n.courseOverrides('ar'),all,entries('en'),errors);assert(errors.some(e=>e.includes(plan.id)));
 }
});
test('unit summaries remain atomic and undeclared C2 Unit 1 cannot override English',()=>{
 for(const unit of ['a2-u01','a2-u02'])for(const field of ['title','grammarNote']){
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
 const card=C.state.srs[C.cardKey('il binario')];assert.equal(card.tr.en,'platform');assert.equal(card.tr.ar,'رصيف القطار');const state=()=>{const s=plain(C.state);delete s.settings.lang;return s;},before=state();for(const lang of ['en','ar']){language(box,lang);assert.deepEqual(state(),before);}assert.equal(C.state.schema,2);
});

for(const number of [1,2,3,4])test('untranslated C2 Unit '+number+' keeps all three lessons, its assessment and metadata exactly English',()=>{
 const box=setup(),unitId='c2-u'+String(number).padStart(2,'0');
 const current=()=>plain(box.Core.registry.byCode.C2.units.find(unit=>unit.id===unitId));
 language(box,'en');const english=current();assert.ok(english);assert.equal(english.lessons.length,3);assert.equal(english.test.id,unitId+'-test');
 const ids=[...english.lessons,english.test].map(lesson=>lesson.id);
 assert.deepEqual(ids,[1,2,3].map(n=>unitId+'-l'+n).concat(unitId+'-test'));
 for(const lang of ['ar','en','ar']){
  language(box,lang);
  if(lang!=='ar')continue;
  assert.deepEqual(current(),english,'All English explanations, vocabulary, questions, feedback and metadata restore');
  for(const id of ids)assert.equal(box.sandbox.LINGUAI.lessonLanguage('ar',id),'en',id);
 }
});
