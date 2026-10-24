import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {join} from 'node:path';
import {createHash} from 'node:crypto';
import vm from 'node:vm';
import {loadEngine,CORE,VERBS,ROOT} from './_harness.mjs';
import {checkPartialCourse} from '../../scripts/parity.mjs';
const plans=[
  {
    "id": "a1-u03-l1",
    "title": "ما يعجبك: piace أم piacciono؟",
    "answers": [
      1,
      "piace",
      "piacciono",
      1,
      1,
      "Mi piace cucinare",
      "match",
      [
        "piace",
        "piacciono"
      ],
      "Mi piacciono molto i formaggi italiani.",
      "Mi piace l'aperitivo, ma non mi piacciono le olive."
    ],
    "meanings": [
      "le olive",
      "vino",
      "film",
      "منفيّة",
      "ماركو",
      "الطبخ",
      "الشخص",
      "الزيتون",
      "الأجبان",
      "الزيتون"
    ],
    "keys": [
      "لأن le olive اسم في الجمع",
      "piace",
      "piacciono",
      "Non mi piace il pesce.",
      "A Marco piace il pesce",
      "Mi piace cucinare",
      [
        "يعجبني / بالنسبة إليّ",
        "يعجبك / بالنسبة إليك",
        "يعجبها / بالنسبة إليها",
        "يعجبنا / بالنسبة إلينا"
      ],
      [
        "piace",
        "piacciono"
      ],
      "Mi piacciono molto i formaggi italiani.",
      "Mi piace l'aperitivo, ma non mi piacciono le olive."
    ]
  },
  {
    "id": "a1-u03-l2",
    "title": "أفعال ⁦-ERE⁩ ووجود الأشياء: c’è وci sono",
    "answers": [
      [
        "prendo",
        "prendi",
        "prende",
        "prendiamo",
        "prendete",
        "prendono"
      ],
      1,
      "c'è",
      "ci sono",
      1,
      "Prendo una birra, e tu?",
      [
        0,
        2,
        4
      ],
      [
        "Non",
        "vedo",
        "il",
        "cameriere"
      ],
      "C'è un tavolo libero per due persone?",
      "Prendiamo due spritz, per favore."
    ],
    "meanings": [
      "النهايات",
      "noi",
      "طاولة",
      "الطابور",
      "الفرق",
      "جعة",
      "الأفعال",
      "النادل",
      "شخصين",
      "سبرتس"
    ],
    "keys": [
      [
        "prendo",
        "prendi",
        "prende",
        "prendiamo",
        "prendete",
        "prendono"
      ],
      "\u2066-iamo\u2069 في صيغة \u2066noi\u2069",
      "c'è",
      "ci sono",
      "الأولى تصف المقهى، والثانية تذكر وجود مقهى قريب",
      "Prendo una birra, e tu?",
      [
        "prendere",
        "scrivere",
        "chiudere"
      ],
      "Non vedo il cameriere",
      "C'è un tavolo libero per due persone?",
      "Prendiamo due spritz, per favore."
    ]
  },
  {
    "id": "a1-u03-l3",
    "title": "أفعال ⁦-IRE⁩: نمطان في الحاضر",
    "answers": [
      [
        "capisco",
        "capisci",
        "capisce",
        "capiamo",
        "capite",
        "capiscono"
      ],
      [
        "dormo",
        "dorme",
        "dormono"
      ],
      1,
      "capiamo",
      "finiscono",
      "Preferisco un tavolo fuori",
      [
        0,
        2,
        4
      ],
      [
        "Non",
        "capisco,",
        "può",
        "ripetere?"
      ],
      "Preferisco partire domani mattina presto.",
      "Scusi, non capisco. Può ripetere?"
    ],
    "meanings": [
      "noi",
      "dormire",
      "فعل",
      "نفهم",
      "ينتهون",
      "الخارج",
      "الصيغ",
      "تعيد",
      "الغد",
      "عفوًا"
    ],
    "keys": [
      [
        "capisco",
        "capisci",
        "capisce",
        "capiamo",
        "capite",
        "capiscono"
      ],
      [
        "dormo",
        "dorme",
        "dormono"
      ],
      "preferire",
      "capiamo",
      "finiscono",
      "Preferisco un tavolo fuori",
      [
        "capisco",
        "finisce",
        "puliscono"
      ],
      "Non capisco, può ripetere?",
      "Preferisco partire domani mattina presto.",
      "Scusi, non capisco. Può ripetere?"
    ]
  },
  {
    "id": "a1-u03-l4",
    "title": "بعض الخبز والماء: الكميات وأدوات التجزئة",
    "answers": [
      1,
      "dell'",
      "delle",
      {
        "pane": "del",
        "zucchero": "dello",
        "carne": "della",
        "olio": "dell'",
        "pomodori": "dei",
        "spinaci": "degli"
      },
      1,
      "Mezzo litro di latte, per favore",
      [
        0,
        1
      ],
      [
        "del",
        "dell'",
        "dei"
      ],
      "Vorrei un chilo di pomodori e un po' di basilico.",
      "Due etti di formaggio, per favore. Basta così."
    ],
    "meanings": [
      "التجزئة",
      "الماء",
      "التفاح",
      "اسم",
      "due etti",
      "الحليب",
      "الخنزير",
      "المشتريات",
      "الريحان",
      "الجبن"
    ],
    "keys": [
      "Vorrei del pane",
      "dell'",
      "delle",
      [
        "del",
        "dello",
        "della",
        "dell'",
        "dei",
        "degli"
      ],
      "200 غرام",
      "Mezzo litro di latte, per favore",
      [
        "Due etti di prosciutto, per favore.",
        "Anche del pane, grazie."
      ],
      [
        "del",
        "dell'",
        "dei"
      ],
      "Vorrei un chilo di pomodori e un po' di basilico.",
      "Due etti di formaggio, per favore. Basta così."
    ]
  },
  {
    "id": "a1-u03-test",
    "title": "اختبار الوحدة الثالثة",
    "answers": [
      "piacciono",
      "piace",
      1,
      [
        "prendo",
        "prende",
        "prendono"
      ],
      [
        "capisco",
        "capiamo",
        "capiscono"
      ],
      "ci sono",
      {
        "acqua": "dell'",
        "carne": "della",
        "pane": "del",
        "mele": "delle"
      },
      "Preferisco il vino bianco",
      "Ci sono delle olive e del formaggio.",
      "Mi piace molto l'aperitivo italiano."
    ],
    "meanings": [
      "السباغيتي",
      "النيّئ",
      "ماركو",
      null,
      null,
      "مكانان",
      "التجزئة",
      "الأبيض",
      "الجبن",
      "الإيطالي"
    ],
    "keys": [
      "piacciono",
      "piace",
      "A Marco piace il vino",
      [
        "prendo",
        "prende",
        "prendono"
      ],
      [
        "capisco",
        "capiamo",
        "capiscono"
      ],
      "ci sono",
      [
        "dell'",
        "della",
        "del",
        "delle"
      ],
      "Preferisco il vino bianco",
      "Ci sono delle olive e del formaggio.",
      "Mi piace molto l'aperitivo italiano."
    ]
  },
  {
    "id": "a1-u04-l1",
    "title": "ألوان الملابس وتوافق الصفات",
    "answers": [
      1,
      1,
      "nere",
      "blu",
      [
        "a",
        "e"
      ],
      1,
      "match",
      [
        "Queste",
        "scarpe",
        "sono",
        "troppo",
        "strette"
      ],
      "Vorrei una giacca grigia, taglia media.",
      "Che bella camicia bianca!"
    ],
    "meanings": [
      "مؤنّث",
      "للمفرد",
      "سوداء",
      "أزرق",
      "بحرف",
      "آنا",
      "الملابس",
      "ضيّقة",
      "رمادية",
      "الأبيض"
    ],
    "keys": [
      "nera",
      "verde",
      "nere",
      "blu",
      [
        "a",
        "e"
      ],
      "italiani",
      [
        "تنّورة",
        "معطف",
        "سترة",
        "أحذية"
      ],
      "Queste scarpe sono troppo strette",
      "Vorrei una giacca grigia, taglia media.",
      "Che bella camicia bianca!"
    ]
  },
  {
    "id": "a1-u04-l2",
    "title": "هذا أم ذاك؟ الإشارة إلى ما تريد",
    "answers": [
      1,
      "quelle",
      "quest'",
      {
        "cappotto": "quel",
        "stivali": "quegli",
        "gonna": "quella",
        "pantaloni": "quei",
        "orologio": "quell'"
      },
      1,
      "Quanto costa questa borsa?",
      [
        "Posso",
        "provare",
        "quella",
        "giacca?"
      ],
      [
        0,
        0
      ],
      "Quegli stivali neri sono in saldo.",
      "Scusi, avete questa camicia nella taglia media?"
    ],
    "meanings": [
      "zaino",
      "الأحذية",
      "العام",
      "صيغة",
      "دون اسم",
      "الحقيبة",
      "السترة",
      "التنّورة",
      "السوداء",
      "القميص"
    ],
    "keys": [
      "quello zaino",
      "quelle",
      "quest'",
      [
        "quel",
        "quegli",
        "quella",
        "quei",
        "quell'"
      ],
      "لأن quello تأتي وحدها، دون اسم بعدها",
      "Quanto costa questa borsa?",
      "Posso provare quella giacca?",
      [
        "Posso provare questa gonna?",
        "La media, grazie."
      ],
      "Quegli stivali neri sono in saldo.",
      "Scusi, avete questa camicia nella taglia media?"
    ]
  },
  {
    "id": "a1-u04-l3",
    "title": "كم السعر؟ الأعداد والدفع",
    "answers": [
      1,
      1,
      "2025",
      "quanto",
      "Posso pagare con la carta?",
      0,
      [
        "quant'è",
        "con"
      ],
      "match",
      "Sono centoventi euro, con lo sconto del dieci per cento.",
      "Quanto costano quegli stivali in vetrina?"
    ],
    "meanings": [
      "millecinquecento",
      "ثلاثون",
      "0–9",
      "الأحذية",
      "بالبطاقة",
      "ventidue",
      "ثلاثة وأربعون",
      "معناها",
      "عشرون",
      "واجهة"
    ],
    "keys": [
      "1500",
      "trenta euro",
      "2025",
      "quanto",
      "Posso pagare con la carta?",
      "€22.50",
      [
        "quant'è",
        "con"
      ],
      [
        "إيصال الشراء",
        "الباقي من النقود",
        "نقدًا",
        "مجّانًا"
      ],
      "Sono centoventi euro, con lo sconto del dieci per cento.",
      "Quanto costano quegli stivali in vetrina?"
    ]
  },
  {
    "id": "a1-u04-l4",
    "title": "كثير وقليل وزائد: الكمية والدرجة",
    "answers": [
      1,
      1,
      "bellissimo",
      "poco",
      [
        0,
        2
      ],
      "È troppo caro, grazie",
      [
        "i",
        "o"
      ],
      "match",
      "È bellissima, ma costa troppo per me.",
      "Ci penso, grazie lo stesso."
    ],
    "meanings": [
      "أشخاص",
      "الحقيبة",
      "جميل جدًا",
      "وقت قليل",
      "ثابتة",
      "غالٍ",
      "بحرف",
      "معناه",
      "لي",
      "سأفكّر"
    ],
    "keys": [
      "molte",
      "molto",
      "bellissimo",
      "poco",
      [
        "Costa troppo.",
        "Sei troppo gentile."
      ],
      "È troppo caro, grazie",
      [
        "i",
        "o"
      ],
      [
        "بما يكفي",
        "أكثر من اللازم",
        "قليل من / بعض",
        "قليل"
      ],
      "È bellissima, ma costa troppo per me.",
      "Ci penso, grazie lo stesso."
    ]
  },
  {
    "id": "a1-u04-test",
    "title": "اختبار الوحدة الرابعة",
    "answers": [
      "rosse",
      "verdi",
      {
        "zaino": "quello",
        "scarpe": "quelle",
        "cappotto": "quel",
        "stivali": "quegli"
      },
      1,
      1,
      "molte",
      "Posso provare questa camicia?",
      [
        "Quanto",
        "costano",
        "quelle",
        "scarpe?"
      ],
      "Questa giacca è carissima.",
      "Posso pagare con la carta?"
    ],
    "meanings": [
      "حمراء",
      "أخضر",
      "quello",
      "duemilatrecento",
      "متعبة",
      "أشخاص",
      "القميص",
      "الأحذية",
      "غالية",
      "بالبطاقة"
    ],
    "keys": [
      "rosse",
      "verdi",
      [
        "quello",
        "quelle",
        "quel",
        "quegli"
      ],
      "2300",
      "molto",
      "molte",
      "Posso provare questa camicia?",
      "Quanto costano quelle scarpe?",
      "Questa giacca è carissima.",
      "Posso pagare con la carta?"
    ]
  }
];
const originalHash='45b6e1a90852437a20dec47d2b3fd91b9c14ccaefa3ab1f59d853f661df283fb';
const plain=value=>JSON.parse(JSON.stringify(value));
const files=['a1-01.js','a1-02.js','a1-03.js','a2-01.js','a2-02.js','b1-01.js'];
function bag(lang,file){let result;vm.runInNewContext(readFileSync(join(ROOT,'data/i18n',lang,file),'utf8'),{LINGUAI:{addStrings(_lang,map){result=plain(map);}}});return result;}
const bags=lang=>Object.fromEntries(files.map(file=>[file,bag(lang,file)]));
const entries=lang=>Object.assign({},...Object.values(bags(lang)));
const ar=entries('ar'),en=entries('en');
function setup(){const box=loadEngine({files:[...CORE,...VERBS,'assets/js/i18n.js','assets/js/i18n-merge.js','data/i18n/ui-en.js','data/i18n/ui-ar.js']});box.Core.load();for(const file of ['data/core/curriculum-index.js',...['a1-01.js','a1-02.js','a1-03.js','a2-01.js','a2-02.js','b1-01.js','b2-01.js'].map(f=>'data/core/'+f),...['en','pl','es','fr','de','ar'].flatMap(lang=>['a1-01.js','a1-02.js','a1-03.js','a2-01.js','a2-02.js','b1-01.js',...(lang==='ar'?[]:['b2-01.js'])].map(f=>'data/i18n/'+lang+'/'+f))])vm.runInContext(readFileSync(join(ROOT,file),'utf8'),box.sandbox);return box;}
function language(box,lang){box.Core.state.settings.lang=lang;box.sandbox.LINGUAI.applyStrings(lang);box.sandbox.Registry.reindex();}
test('the first four Arabic units remain complete in the expanded manifest',()=>{
 const box=setup(),manifest=plain(box.sandbox.I18n.courseOverrides('ar'));
 const keys=unit=>['unit:'+unit,...[1,2,3,4].map(n=>'lesson:'+unit+'-l'+n),'lesson:'+unit+'-test'];
 assert.deepEqual(manifest['a1-01.js'].slice(12),keys('a1-u03'));assert.deepEqual(manifest['a1-02.js'].slice(0,6),keys('a1-u04'));
 assert.equal(Object.values(manifest).flat().length,132);assert.equal(plans.length,10);assert.equal(plans.reduce((sum,p)=>sum+p.answers.length,0),100);
 for(const file of files)assert.deepEqual(Object.keys(bag('ar',file)),manifest[file]);
 const errors=[];checkPartialCourse(manifest,bags('ar'),entries('pl'),errors);assert.deepEqual(errors,[]);
});
test('all twelve previously translated entries remain byte-equivalent after parsing',()=>{
 const previous=Object.fromEntries(Object.entries(bag('ar','a1-01.js')).slice(0,12));
 assert.equal(createHash('sha256').update(JSON.stringify(previous)).digest('hex'),originalHash);
});
const translatedChoices=new Set(['a1-u03-l1:0','a1-u03-l2:1','a1-u03-l2:4','a1-u03-l4:4','a1-u04-l2:4']);
for(const plan of plans){
 test(plan.id+' has Arabic in every learner-language slot and preserves all neutral Italian and option ordering',()=>{
  const box=setup();language(box,'ar');const key='lesson:'+plan.id,patch=ar[key],base=en[key];
  assert.equal(box.sandbox.LINGUAI.lessonLanguage('ar',plan.id),'ar');assert.equal(patch.title,plan.title);
  assert.deepEqual(Object.keys(patch).sort(),Object.keys(base).sort());
  function translated(value,where=''){
   if(Array.isArray(value))return value.forEach((v,i)=>translated(v,where+'['+i+']'));
   if(value&&typeof value==='object')return Object.entries(value).forEach(([k,v])=>translated(v,where+'.'+k));
   assert.equal(typeof value,'string',where);
   if(/[\u0600-\u06ff]/.test(value))return;
   // Only deliberate Italian/numeric examples may remain non-Arabic.
   assert(/\.grammar\.table\.rows/.test(where)||/\.opts\[/.test(where),'Untranslated learner text: '+where+': '+value);
  }
  translated(patch);
  let neutral;vm.runInNewContext(readFileSync(join(ROOT,'data/core',plan.id.startsWith('a1-u03')?'a1-01.js':'a1-02.js'),'utf8'),{LINGUAI:{addUnits(_code,units){for(const unit of units)for(const lesson of [...unit.lessons,unit.test])if(lesson.id===plan.id)neutral=plain(lesson);}}});
  function unchanged(source,target){for(const [k,v]of Object.entries(source)){if(v&&typeof v==='object')unchanged(v,target[k]);else assert.equal(target[k],v,plan.id+': '+k);}}
  unchanged(neutral,plain(box.Core.getLesson(plan.id).lesson));
  patch.exercises.forEach((ex,i)=>{if(ex.opts&&!translatedChoices.has(plan.id+':'+i))assert.deepEqual(ex.opts,base.exercises[i].opts,'Italian/numeric options');});
  if(patch.grammar)patch.grammar.table.rows.forEach((row,i)=>row.forEach((cell,j)=>{
   const source=base.grammar.table.rows[i][j];
   if(!/[\u0600-\u06ff]/.test(cell))assert.equal(cell,source,'Italian/numeric grammar cell');
   if(source.includes(' (m')||source.includes(' (f'))assert.ok(cell.includes(source.split(' (')[0]),'Retain Italian noun/article inside mixed cell');
  }));
 });
 plan.keys.forEach((answer,i)=>test(plan.id+' exercise '+(i+1)+' Arabic meaning matches the original accepted answer',()=>{
  const box=setup();language(box,'ar');const ex=plain(box.Core.getLesson(plan.id).lesson.exercises[i]),type=ex.t;
  if(plan.meanings[i])assert.ok(JSON.stringify(ar['lesson:'+plan.id].exercises[i]).includes(plan.meanings[i]),'Missing intended meaning '+plan.meanings[i]);
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
test('Arabic comparisons, precise prompts and translations correct source ambiguities without changing Italian answers',()=>{
 assert.match(ar['lesson:a1-u03-l1'].theory.find(b=>b.contrast).contrast,/يعجبني/);
 assert.match(ar['lesson:a1-u03-l2'].exercises[1].q,/noi/);assert.match(ar['lesson:a1-u03-l2'].exercises[1].q,/نهاية صيغة/);
 assert.match(ar['lesson:a1-u04-l1'].theory.find(b=>b.trap).trap,/جمع غير العاقل/);
 assert.match(ar['lesson:a1-u04-l1'].theory[3].p,/arancioni/);
 assert.match(ar['lesson:a1-u04-l2'].grammar.examples[3].tr,/هذا/);assert.doesNotMatch(ar['lesson:a1-u04-l2'].grammar.examples[3].tr,/ذاك/);
 assert.match(ar['lesson:a1-u04-l4'].exercises[6].q,/بحرف/);assert.doesNotMatch(ar['lesson:a1-u04-l4'].exercises[6].q,/شرطة/);
 assert.match(ar['lesson:a1-u03-l4'].grammar.examples[3].tr,/مئتا غرام/);assert.match(ar['lesson:a1-u03-l4'].grammar.examples[3].tr,/الخنزير/);
 assert.match(ar['lesson:a1-u04-l3'].exercises[2].q,/0–9/);
 assert.match(ar['lesson:a1-u03-l3'].theory[1].p,/في العربية/);
});
test('Arabic-English-Arabic and every existing language restore exact complete content, including unit summaries and blank glosses',()=>{
 const box=setup(),snapshot=()=>plain(box.Core.registry.byCode.A1.units);
 for(const lang of ['en','pl','es','fr','de']){language(box,lang);const before=snapshot();language(box,'ar');const arabic=snapshot();for(const next of [lang,'ar',lang,'ar']){language(box,next);assert.deepEqual(snapshot(),next==='ar'?arabic:before);}}
 language(box,'en');const fallback=plain(box.Core.registry.byCode.B2.units[0]);language(box,'ar');assert.deepEqual(plain(box.Core.registry.byCode.B2.units[0]),fallback);
 for(const unit of ['a1-u03','a1-u04'])for(const lang of ['pl','en','es','fr','de'])assert.deepEqual(entries(lang)['lesson:'+unit+'-test'].exercises[unit==='a1-u03'?6:2].items,['','','','']);
});
test('all ten new lessons and assessments fall back atomically when malformed without disabling their translated neighbors',()=>{
 for(const plan of plans)for(const damage of [p=>{delete p.title;},p=>p.exercises.pop(),p=>{p.theory=[];}]){
  const box=setup(),file=plan.id.startsWith('a1-u03')?'a1-01.js':'a1-02.js',all=bags('ar');damage(all[file]['lesson:'+plan.id]);
  box.sandbox.LINGUAI.addStrings('ar',all[file]);language(box,'es');language(box,'ar');
  assert.equal(box.sandbox.LINGUAI.lessonLanguage('ar',plan.id),'en');assert.equal(box.Core.getLesson(plan.id).lesson.title,en['lesson:'+plan.id].title);
  const other=plans.find(p=>p.id!==plan.id);assert.equal(box.sandbox.LINGUAI.lessonLanguage('ar',other.id),'ar');
  const errors=[];checkPartialCourse(box.sandbox.I18n.courseOverrides('ar'),all,entries('pl'),errors);assert.ok(errors.some(e=>e.includes(plan.id)));
 }
});
test('unit titles and grammar notes fall back together; undeclared content cannot override English',()=>{
 for(const unit of ['a1-u03','a1-u04'])for(const field of ['title','grammarNote']){
  const box=setup(),file=unit==='a1-u03'?'a1-01.js':'a1-02.js',patch=bag('ar',file);delete patch['unit:'+unit][field];patch['unit:b2-u01']={title:'غير معلن',grammarNote:'غير معلن'};box.sandbox.LINGUAI.addStrings('ar',patch);language(box,'ar');
  const current=box.Core.registry.byCode.A1.units.find(u=>u.id===unit);assert.equal(current.title,en['unit:'+unit].title);assert.equal(current.grammarNote,en['unit:'+unit].grammarNote);
  assert.equal(box.sandbox.LINGUAI.lessonLanguage('ar',unit+'-l1'),'ar');assert.equal(box.Core.registry.byCode.B2.units[0].title,bag('en','b2-01.js')['unit:b2-u01'].title);
 }
});
test('the new Arabic file loads after English, retries failures and never requests untranslated Arabic files',()=>{
 const box=setup(),R=box.sandbox.Registry;
 assert.deepEqual(R.i18nPaths('ar',['a1-01.js','a1-02.js','a1-03.js','b2-01.js']),['data/i18n/en/a1-01.js','data/i18n/en/a1-02.js','data/i18n/en/a1-03.js','data/i18n/en/b2-01.js','data/i18n/ar/a1-01.js','data/i18n/ar/a1-02.js','data/i18n/ar/a1-03.js']);
 R.markI18n(['data/i18n/en/a1-02.js','data/i18n/ar/a1-02.js'],['data/i18n/ar/a1-02.js']);assert.deepEqual(R.i18nPaths('ar',['a1-02.js']),['data/i18n/ar/a1-02.js']);
});
test('language switching preserves all learner progress and review schedules and stores Arabic glosses separately',()=>{
 const box=setup(),C=box.Core;language(box,'en');plans.forEach(p=>C.recordLesson(p.id,10,10,80));C.addCard('la gonna','skirt','a1-u04-l1');
 language(box,'ar');C.addCard('la gonna','تنّورة','a1-u04-l1');const card=C.state.srs[C.cardKey('la gonna')];assert.equal(card.tr.en,'skirt');assert.equal(card.tr.ar,'تنّورة');
 const state=()=>{const s=plain(C.state);delete s.settings.lang;return s;},before=state();
 for(const lang of ['en','pl','es','fr','de','ar']){language(box,lang);assert.deepEqual(state(),before);}assert.equal(C.state.schema,2);
});

test('Italian endings and subject pronouns inside Arabic answer labels have balanced LTR isolation',()=>{
 const options=ar['lesson:a1-u03-l2'].exercises[1].opts;
 assert.deepEqual(options,['\u2066-o\u2069 في صيغة \u2066io\u2069','\u2066-iamo\u2069 في صيغة \u2066noi\u2069','\u2066-ono\u2069 في صيغة \u2066loro\u2069']);
});
