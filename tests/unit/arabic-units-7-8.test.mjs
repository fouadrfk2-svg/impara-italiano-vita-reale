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
    "id": "a1-u07-l1",
    "answers": [
      1,
      1,
      "prenotare",
      "Il conto, per favore.",
      "match",
      [
        "No,",
        "siamo",
        "in",
        "due.",
        "C'è",
        "un",
        "tavolo",
        "libero?"
      ],
      [
        0,
        0
      ],
      "Vorrei prenotare un tavolo per quattro alle otto.",
      "Buonasera, siamo in due. C'è posto fuori?"
    ],
    "keys": [
      "طبق خضار جانبي يُطلب على حدة",
      "رسوم تجهيز الطاولة والخبز",
      "prenotare",
      "Il conto, per favore.",
      [
        "مقبّلات",
        "معكرونة أو حساء",
        "لحم أو سمك",
        "حلوى"
      ],
      "No, siamo in due. C'è un tavolo libero?",
      [
        "No, c'è un tavolo per due?",
        "Va bene, il menù per favore."
      ],
      "Vorrei prenotare un tavolo per quattro alle otto.",
      "Buonasera, siamo in due. C'è posto fuori?"
    ],
    "title": "حجز طاولة والدخول إلى المطعم"
  },
  {
    "id": "a1-u07-l2",
    "answers": [
      1,
      "allergica",
      "Per me una carbonara, per favore.",
      1,
      "match",
      [
        "per",
        "senza",
        "naturale"
      ],
      [
        "Cosa",
        "c'è",
        "in",
        "questo",
        "piatto?"
      ],
      [
        0,
        0,
        0
      ],
      "Sono vegetariana, questo piatto contiene carne?",
      "Prendo la cacio e pepe. Da bere acqua frizzante."
    ],
    "keys": [
      "الماء: غير غازي أم غازي",
      "allergica",
      "Per me una carbonara, per favore.",
      "بعد الحلوى",
      [
        "خالٍ من الغلوتين",
        "حارّ المذاق",
        "مطهوّ جيدًا",
        "للشرب"
      ],
      [
        "per",
        "senza",
        "naturale"
      ],
      "Cosa c'è in questo piatto?",
      [
        "Per me una cacio e pepe.",
        "Una bottiglia d'acqua naturale.",
        "No grazie, così va bene."
      ],
      "Sono vegetariana, questo piatto contiene carne?",
      "Prendo la cacio e pepe. Da bere acqua frizzante."
    ],
    "title": "طلب طبق ومشروب والسؤال عن المكوّنات"
  },
  {
    "id": "a1-u07-l3",
    "answers": [
      1,
      "ne",
      "ne",
      1,
      "Quanti caffè bevi al giorno? Ne bevo tre.",
      "match",
      [
        "ne",
        "ne"
      ],
      [
        "Vorrei",
        "prenderne",
        "due"
      ],
      "Quante fette di torta vuoi? — Ne voglio una, grazie.",
      "Hai fratelli? — Sì, ne ho due."
    ],
    "keys": [
      "إلى birre، أي الجِعَة التي يدور عنها الحديث",
      "ne",
      "ne",
      "متصلة بآخره: ⁦prenderne⁩",
      "Quanti caffè bevi al giorno? Ne bevo tre.",
      [
        "ما رأيك في ذلك؟",
        "لا أعرف شيئًا عن ذلك",
        "سأنصرف",
        "سآخذ اثنتين منها"
      ],
      [
        "ne",
        "ne"
      ],
      "Vorrei prenderne due",
      "Quante fette di torta vuoi? — Ne voglio una, grazie.",
      "Hai fratelli? — Sì, ne ho due."
    ],
    "title": "ne: الحديث عن كمية من شيء سبق ذكره"
  },
  {
    "id": "a1-u07-l4",
    "answers": [
      1,
      1,
      "Possiamo avere il conto?",
      "offro",
      "match",
      [
        "era",
        "conto",
        "carta"
      ],
      [
        "Paghiamo",
        "alla",
        "romana,",
        "grazie"
      ],
      [
        0,
        0,
        0
      ],
      "Il conto è quarantasei euro, coperto incluso.",
      "Era tutto buonissimo, complimenti al cuoco!"
    ],
    "keys": [
      "تقاسم الحساب بالتساوي",
      "كي لا يبدو أنه يستعجل الضيف للمغادرة",
      "Possiamo avere il conto?",
      "offro",
      [
        "إكرامية",
        "الباقي من المال",
        "شهيّ جدًا",
        "حسابات منفصلة"
      ],
      [
        "era",
        "conto",
        "carta"
      ],
      "Paghiamo alla romana, grazie",
      [
        "Il conto, per favore.",
        "Era tutto buonissimo, complimenti!",
        "Si può pagare con la carta?"
      ],
      "Il conto è quarantasei euro, coperto incluso.",
      "Era tutto buonissimo, complimenti al cuoco!"
    ],
    "title": "طلب الحساب والدفع وتوديع الموظّف"
  },
  {
    "id": "a1-u07-test",
    "answers": [
      1,
      1,
      "prenotare",
      "ne",
      "allergica",
      "Il conto, per favore.",
      "match",
      [
        "Per",
        "me",
        "una",
        "carbonara,",
        "senza",
        "cipolla"
      ],
      "Da bere prendiamo una bottiglia d'acqua naturale.",
      "Possiamo avere il conto, per favore?"
    ],
    "keys": [
      "طبق خضار جانبي",
      "رسوم الطاولة",
      "prenotare",
      "ne",
      "allergica",
      "Il conto, per favore.",
      [
        "تقاسم الحساب بالتساوي",
        "الحساب عليّ",
        "شهيّ جدًا",
        "للشرب"
      ],
      "Per me una carbonara, senza cipolla",
      "Da bere prendiamo una bottiglia d'acqua naturale.",
      "Possiamo avere il conto, per favore?"
    ],
    "title": "اختبار الوحدة السابعة"
  },
  {
    "id": "a1-u08-l1",
    "answers": [
      1,
      1,
      "la",
      "la",
      {
        "libro": "il mio",
        "macchina": "la mia",
        "genitori": "i miei",
        "sorelle": "le mie"
      },
      2,
      "Il mio capo è molto esigente.",
      [
        "-",
        "i"
      ],
      "Mia sorella e i suoi figli abitano a Palermo.",
      "Il mio migliore amico si chiama Paolo."
    ],
    "keys": [
      "mia madre",
      "i miei genitori",
      "la",
      "la",
      [
        "il mio",
        "la mia",
        "i miei",
        "le mie"
      ],
      "له أو لها؛ يحدّد السياق المقصود",
      "Il mio capo è molto esigente.",
      [
        "-",
        "i"
      ],
      "Mia sorella e i suoi figli abitano a Palermo.",
      "Il mio migliore amico si chiama Paolo."
    ],
    "title": "أمّي ومديري: التعبير عن الملكية والعلاقات"
  },
  {
    "id": "a1-u08-l2",
    "answers": [
      1,
      "gli",
      "è",
      1,
      "match",
      [
        "è",
        "ha",
        "porta"
      ],
      "Ha i capelli lunghi e ricci.",
      [
        "Com'è",
        "tua",
        "sorella?",
        "È",
        "bassa",
        "e",
        "sportiva"
      ],
      "Ha i capelli castani, gli occhi verdi e un bel sorriso.",
      "Mio fratello è alto e ha i capelli neri."
    ],
    "keys": [
      "Ha i capelli neri.",
      "gli",
      "è",
      "كيف هي شخصيّته؟",
      [
        "شعر مجعّد",
        "متوسّط القامة",
        "يرتدي نظّارة",
        "يشبه"
      ],
      [
        "è",
        "ha",
        "porta"
      ],
      "Ha i capelli lunghi e ricci.",
      "Com'è tua sorella? È bassa e sportiva",
      "Ha i capelli castani, gli occhi verdi e un bel sorriso.",
      "Mio fratello è alto e ha i capelli neri."
    ],
    "title": "وصف مظهر شخص والسؤال عنه"
  },
  {
    "id": "a1-u08-l3",
    "answers": [
      1,
      1,
      "gentile",
      1,
      "match",
      "Secondo me è una persona tranquilla.",
      [
        "secondo",
        "socievole"
      ],
      [
        "All'inizio",
        "è",
        "un",
        "po'",
        "timido"
      ],
      "Secondo me è una persona generosa e divertente.",
      "Il mio collega è molto simpatico, mi sta simpatico."
    ],
    "keys": [
      "ممتع وطيّب المعشر",
      "Secondo me",
      "gentile",
      "هو جيّد في الرياضيات",
      [
        "antipatico",
        "egoista",
        "timido",
        "nervoso"
      ],
      "Secondo me è una persona tranquilla.",
      [
        "secondo",
        "socievole"
      ],
      "All'inizio è un po' timido",
      "Secondo me è una persona generosa e divertente.",
      "Il mio collega è molto simpatico, mi sta simpatico."
    ],
    "title": "وصف الشخصية والتعبير عن رأيك"
  },
  {
    "id": "a1-u08-l4",
    "answers": [
      1,
      1,
      "di",
      "migliore",
      1,
      "Milano è più cara di Bologna.",
      [
        "di",
        "che"
      ],
      [
        "Questo",
        "vino",
        "è",
        "migliore",
        "dell'altro"
      ],
      "Mio fratello è meno paziente di me.",
      "Questa città è più tranquilla di Milano."
    ],
    "keys": [
      "di",
      "che",
      "di",
      "migliore",
      "هو الأفضل في الصفّ",
      "Milano è più cara di Bologna.",
      [
        "di",
        "che"
      ],
      "Questo vino è migliore dell'altro",
      "Mio fratello è meno paziente di me.",
      "Questa città è più tranquilla di Milano."
    ],
    "title": "أطول منك: المقارنة والتفضيل"
  },
  {
    "id": "a1-u08-test",
    "answers": [
      1,
      "i",
      "la",
      1,
      "gli",
      1,
      1,
      "peggiore",
      "Mia sorella è più giovane di me e ha i capelli ricci.",
      "Secondo me è una persona molto gentile."
    ],
    "keys": [
      "mia madre",
      "i",
      "la",
      "Ha i capelli neri.",
      "gli",
      "ممتع وطيّب المعشر",
      "di",
      "peggiore",
      "Mia sorella è più giovane di me e ha i capelli ricci.",
      "Secondo me è una persona molto gentile."
    ],
    "title": "اختبار الوحدة الثامنة"
  }
];
const previousHash="f475023eeec52602bd0bf6ee74ac53f900ba99399e61a556f30891d6f0f89056";
const plain=value=>JSON.parse(JSON.stringify(value));
const files=['a1-01.js','a1-02.js','a1-03.js','a2-01.js','a2-02.js'];
function bag(lang,file){let result;vm.runInNewContext(readFileSync(join(ROOT,'data/i18n',lang,file),'utf8'),{LINGUAI:{addStrings(_lang,map){result=plain(map);}}});return result;}
const bags=lang=>Object.fromEntries(files.map(file=>[file,bag(lang,file)]));
const entries=lang=>Object.assign({},...Object.values(bags(lang)));
const ar=entries('ar'),en=entries('en');
function setup(){const box=loadEngine({files:[...CORE,...VERBS,'assets/js/i18n.js','assets/js/i18n-merge.js','data/i18n/ui-en.js','data/i18n/ui-ar.js']});box.Core.load();for(const file of ['data/core/curriculum-index.js',...['a1-01.js','a1-02.js','a1-03.js','a2-01.js','a2-02.js','b1-01.js'].map(f=>'data/core/'+f),...['en','pl','es','fr','de','ar'].flatMap(lang=>['a1-01.js','a1-02.js','a1-03.js','a2-01.js','a2-02.js',...(lang==='ar'?[]:['b1-01.js'])].map(f=>'data/i18n/'+lang+'/'+f))])vm.runInContext(readFileSync(join(ROOT,file),'utf8'),box.sandbox);return box;}
function language(box,lang){box.Core.state.settings.lang=lang;box.sandbox.LINGUAI.applyStrings(lang);box.sandbox.Registry.reindex();}

test('the first eight Arabic units remain complete in the expanded ten-unit manifest',()=>{
 const box=setup(),manifest=plain(box.sandbox.I18n.courseOverrides('ar'));
 const keys=n=>['unit:a1-u0'+n,...[1,2,3,4].map(l=>'lesson:a1-u0'+n+'-l'+l),'lesson:a1-u0'+n+'-test'];
 assert.equal(Object.values(manifest).flat().length,108);
 assert.deepEqual(manifest['a1-01.js'].slice(12),keys(3));assert.deepEqual(manifest['a1-02.js'],[...keys(4),...keys(5),...keys(6),...keys(7)]);assert.deepEqual(manifest['a1-03.js'].slice(0,6),keys(8));
 assert.equal(plans.length,10);assert.equal(plans.reduce((n,p)=>n+p.answers.length,0),99);
 for(const file of files)assert.deepEqual(Object.keys(bag('ar',file)),manifest[file]);
 const errors=[];checkPartialCourse(manifest,bags('ar'),entries('pl'),errors);assert.deepEqual(errors,[]);
});

test('all 36 Arabic entries in Units 1–6 retain their reviewed content',()=>{
 const previous=Object.fromEntries(Object.entries(ar).filter(([key])=>/^(unit|lesson):a1-u0[1-6](?:-|$)/.test(key)).sort(([a],[b])=>a.localeCompare(b)));
 assert.equal(Object.keys(previous).length,36);
 assert.equal(createHash('sha256').update(JSON.stringify(previous)).digest('hex'),previousHash);
});

const translatedChoices=new Set(['a1-u07-l1:0','a1-u07-l1:1','a1-u07-l2:0','a1-u07-l2:3','a1-u07-l3:0','a1-u07-l3:3','a1-u07-l4:0','a1-u07-l4:1','a1-u07-test:0','a1-u07-test:1','a1-u08-l1:5','a1-u08-l2:3','a1-u08-l3:0','a1-u08-l3:3','a1-u08-l4:4','a1-u08-test:5']);
const italianColumns={'a1-u07-l1':[1],'a1-u07-l2':[1],'a1-u07-l3':[0,1],'a1-u07-l4':[1],'a1-u08-l1':[0,1,2,3,4],'a1-u08-l2':[1,2],'a1-u08-l3':[0],'a1-u08-l4':[0,1]};
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
   if(plan.id==='a1-u08-l3'&&/\.pairs\[/.test(where)){assert.equal(value,source);return;}
   assert.fail('Untranslated learner text: '+where+': '+value);
  }
  translated(patch,base);
  let neutral;vm.runInNewContext(readFileSync(join(ROOT,'data/core',plan.id.startsWith('a1-u07')?'a1-02.js':'a1-03.js'),'utf8'),{LINGUAI:{addUnits(_code,units){for(const unit of units)for(const lesson of [...unit.lessons,unit.test])if(lesson.id===plan.id)neutral=plain(lesson);}}});
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

test('Arabic guidance handles family distinctions, accurate descriptions, restaurant customs and source limitations',()=>{
 assert.match(ar['lesson:a1-u07-l1'].theory[0].p,/ليس عليك طلب جميع/);
 assert.doesNotMatch(JSON.stringify(ar['lesson:a1-u07-l2'].culture),/ممنوع.*الكابتشينو|طبق أمريكي/);
 assert.match(ar['lesson:a1-u07-l2'].exercises[5].q,/غير غازي أو غازي/);
 assert.match(ar['lesson:a1-u07-l3'].theory.at(-1).tip,/una figlia/);
 assert.match(ar['lesson:a1-u08-l1'].vocab[11],/حفيد.*ابن.*الأخ.*الأخت/);
 assert.match(ar['lesson:a1-u08-l1'].theory[0].p,/ـه.*ـها/);
 assert.match(ar['lesson:a1-u08-l1'].exercises[3].why,/بلا أداة/);
 assert.match(ar['lesson:a1-u08-l2'].exercises[0].q,/أداة التعريف/);
 assert.match(ar['lesson:a1-u08-l3'].exercises[2].q,/La mia collega/);
 assert.match(ar['lesson:a1-u08-l3'].grammar.table.rows[4][2],/egoisti.*egoiste/);
 assert.match(ar['lesson:a1-u08-l4'].theory[1].p,/لطيف المعشر أكثر ممّا هو ذكي/);
 assert.equal(ar['lesson:a1-u08-l4'].grammar.table.rows[3][2],'هو لطيف المعشر أكثر ممّا هو وسيم.');
 assert.doesNotMatch(JSON.stringify(ar['lesson:a1-u08-l4']),/الطرافة/);
 assert.match(ar['lesson:a1-u08-l4'].exercises[5].q,/المؤنّث/);
 assert.match(ar['lesson:a1-u08-test'].exercises[7].q,/غير المنتظمة/);
});

test('Arabic-English-Arabic and all five existing languages restore exact content and all target glossary meanings',()=>{
 const box=setup(),snapshot=()=>plain(box.Core.registry.byCode.A1.units);
 for(const lang of ['en','pl','es','fr','de']){language(box,lang);const before=snapshot();language(box,'ar');const arabic=snapshot();for(const next of [lang,'ar',lang,'ar']){language(box,next);assert.deepEqual(snapshot(),next==='ar'?arabic:before);}}
 language(box,'en');const fallback=plain(box.Core.registry.byCode.B1.units[0]);language(box,'ar');assert.deepEqual(plain(box.Core.registry.byCode.B1.units[0]),fallback);
 for(const lang of ['en','pl','es','fr','de']){
  language(box,'ar');assert.equal(box.Core.getLesson('a1-u08-l1').lesson.exercises[4].items[2].gloss,'والدان');
  language(box,lang);assert.deepEqual(plain(box.Core.getLesson('a1-u08-l1').lesson.exercises[4].items.map(item=>item.gloss)),entries(lang)['lesson:a1-u08-l1'].exercises[4].items);
 }
});

test('each new lesson and assessment falls back atomically when damaged, preserving translated neighbors',()=>{
 for(const plan of plans)for(const damage of [p=>{delete p.title;},p=>p.exercises.pop(),p=>{p.theory=[];}]){
  const box=setup(),all=bags('ar');const file=plan.id.startsWith('a1-u07')?'a1-02.js':'a1-03.js';damage(all[file]['lesson:'+plan.id]);box.sandbox.LINGUAI.addStrings('ar',all[file]);language(box,'es');language(box,'ar');
  assert.equal(box.sandbox.LINGUAI.lessonLanguage('ar',plan.id),'en');assert.equal(box.Core.getLesson(plan.id).lesson.title,en['lesson:'+plan.id].title);
  const other=plans.find(p=>p.id!==plan.id);assert.equal(box.sandbox.LINGUAI.lessonLanguage('ar',other.id),'ar');assert.equal(box.sandbox.LINGUAI.lessonLanguage('ar','a1-u04-l1'),'ar');
  const errors=[];checkPartialCourse(box.sandbox.I18n.courseOverrides('ar'),all,entries('pl'),errors);assert.ok(errors.some(e=>e.includes(plan.id)));
 }
});

test('new unit summaries are independently atomic and untranslated B1 Unit 1 retains English fallback',()=>{
 for(const unit of ['a1-u07','a1-u08'])for(const field of ['title','grammarNote']){
  const box=setup(),patch=bag('ar',unit==='a1-u07'?'a1-02.js':'a1-03.js');delete patch['unit:'+unit][field];patch['unit:b1-u01']={title:'غير معلن',grammarNote:'غير معلن'};box.sandbox.LINGUAI.addStrings('ar',patch);language(box,'ar');
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
 const box=setup(),C=box.Core;language(box,'en');plans.forEach(p=>C.recordLesson(p.id,p.answers.length,p.answers.length,80));C.addCard('il tavolo','table','a1-u07-l1');language(box,'ar');C.addCard('il tavolo','طاولة','a1-u07-l1');
 const card=C.state.srs[C.cardKey('il tavolo')];assert.equal(card.tr.en,'table');assert.equal(card.tr.ar,'طاولة');
 const state=()=>{const s=plain(C.state);delete s.settings.lang;return s;},before=state();for(const lang of ['en','pl','es','fr','de','ar']){language(box,lang);assert.deepEqual(state(),before);}assert.equal(C.state.schema,2);
});
