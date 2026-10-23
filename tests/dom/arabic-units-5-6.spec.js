const {test,expect}=require('@playwright/test');
const {readFileSync}=require('node:fs');
const path=require('node:path'),vm=require('node:vm');
const AXE=readFileSync(require.resolve('axe-core/axe.min.js'),'utf8');
let arabicUI;vm.runInNewContext(readFileSync(path.join(__dirname,'../../data/i18n/ui-ar.js'),'utf8'),{LINGUAI:{addUI(_l,map){arabicUI=map;}}});
const active='.exq:not([hidden])';
// Independent reviewed answers: the driver never reads a grading key to answer.
// Independent reviewed answers; no grading-key lookup is used to answer.
const lessons=[
  {
    "id": "a1-u05-l1",
    "title": "أستيقظ في السابعة: الأفعال الانعكاسية",
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
    ]
  },
  {
    "id": "a1-u05-l2",
    "title": "كم الساعة؟ قراءة الوقت وتحديد موعد",
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
    ]
  },
  {
    "id": "a1-u05-l3",
    "title": "أستطيع، أريد، يجب عليّ",
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
    ]
  },
  {
    "id": "a1-u05-l4",
    "title": "دائمًا، غالبًا، أبدًا: وصف العادات",
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
    ]
  },
  {
    "id": "a1-u05-test",
    "title": "اختبار الوحدة الخامسة",
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
    ]
  },
  {
    "id": "a1-u06-l1",
    "title": "حروف الجر مع أدوات التعريف: al وdel وnel وsul",
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
    ]
  },
  {
    "id": "a1-u06-l2",
    "title": "أذهب أم آتي؟ andare وvenire",
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
    ]
  },
  {
    "id": "a1-u06-l3",
    "title": "أين المحطّة؟ السؤال عن الطريق وفهم الإرشادات",
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
    ]
  },
  {
    "id": "a1-u06-l4",
    "title": "ما الذي يوجد هنا؟ c’è وci sono والنفي",
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
    ]
  },
  {
    "id": "a1-u06-test",
    "title": "اختبار الوحدة السادسة",
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
    ]
  }
];
async function ready(page){await page.waitForFunction(()=>window.Core&&window.Core.registry.loaded.A1===true&&document.querySelector('.exq'));await page.evaluate(()=>{window.Core.state.settings.autoplay=false;window.Core.save();});}
async function language(page,lang){if(await page.locator('#railToggle').isVisible()&&!await page.locator('#rail').evaluate(el=>el.classList.contains('is-open')))await page.locator('#railToggle').click();await page.locator('#langToggle').click();await page.locator('#langList [data-lang="'+lang+'"]').click();await expect(page.locator('html')).toHaveAttribute('dir',lang==='ar'?'rtl':'ltr');await expect(page.locator('#main')).toHaveAttribute('data-lesson-language',lang);}
async function audit(page){expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1)).toBe(true);const violations=await page.evaluate(async()=>(await window.axe.run(document,{runOnly:{type:'tag',values:['wcag2a','wcag2aa','wcag21aa']}})).violations.map(v=>({id:v.id,targets:v.nodes.map(n=>n.target)})));expect(violations).toEqual([]);}
async function answer(page,type,value){
 const current=page.locator(active);
 if(type==='mcq')await current.locator('[data-orig="'+value+'"]').click();
 else if(type==='multi')for(const index of value)await current.locator('[data-orig="'+index+'"]').click();
 else if(type==='conj')for(let i=0;i<value.length;i++)await current.locator('.js-cell').nth(i).fill(value[i]);
 else if(type==='cloze')for(let i=0;i<value.length;i++)await current.locator('.js-gap').nth(i).fill(value[i]);
 else if(type==='gender'){const rows=current.locator('.field-row');for(let i=0;i<await rows.count();i++){const row=rows.nth(i),noun=(await row.locator('b').innerText()).trim();expect(value[noun],noun).toBeDefined();await row.locator('.js-sel').selectOption(value[noun]);}}
 else if(type==='order')for(const word of value)await current.locator('.js-bank').getByRole('button',{name:word,exact:true}).first().click();
 else if(type==='match'){for(let i=0;i<4;i++){await current.locator('.js-l [data-i="'+i+'"]').click();await current.locator('.js-r [data-i="'+i+'"]').click();}return;}
 else if(type==='dialogue'){for(const index of value){const choice=current.locator('.js-turn [data-k="'+index+'"]');const clicked=await choice.elementHandle();expect(clicked).not.toBeNull();await choice.click();await expect.poll(()=>clicked.evaluate(node=>node.isConnected)).toBe(false);await clicked.dispose();}return;}
 else await current.locator('.js-in').fill(value);
 await current.locator('.js-check').click();
}
async function shot(page,info,name){const target=info.outputPath(name);await page.screenshot({path:target,fullPage:true});await info.attach(name,{path:target,contentType:'image/png'});}

for(const width of [1440,390])test.describe('Arabic units five and six at '+width+'px',()=>{
 test.use({viewport:{width,height:920},locale:'ar-MA'});
 test.beforeEach(async({page})=>{await page.addInitScript(AXE);await page.addInitScript(()=>{delete window.SpeechRecognition;delete window.webkitSpeechRecognition;});});
 for(const lesson of lessons){
  test(lesson.id+' complete text, every interaction type accessibility and exact language restoration',async({page},info)=>{
   const errors=[],failed=[];page.on('pageerror',e=>errors.push(e.message));page.on('response',r=>{if(r.status()>=400)failed.push(r.url());});
   await page.goto('/index.html#/lezione?id='+lesson.id);await ready(page);
   await expect(page.locator('.view-head > p')).toHaveText(lesson.title);await expect(page.locator('#main')).toHaveAttribute('data-lesson-language','ar');
   const snapshot=()=>page.evaluate(id=>JSON.stringify({lesson:window.Core.getLesson(id).lesson,unit:window.Core.getLesson(id).unit.title,note:window.Core.getLesson(id).unit.grammarNote}),lesson.id);
   const arabic=await snapshot();const types=await page.evaluate(id=>window.Core.getLesson(id).lesson.exercises.map(e=>e.t),lesson.id);
   const covered=new Set();
   for(let i=0;i<types.length;i++)if(!covered.has(types[i])){
    covered.add(types[i]);await page.locator('.ex-chip[data-go="'+i+'"]').click();const current=page.locator(active);
    if(types[i]==='dialogue'){await expect(current.locator('.js-ch')).not.toHaveCount(0);await expect(current.locator('.js-turn .opts')).toHaveAttribute('dir','ltr');await expect(current.locator('.js-turn > p')).toHaveAttribute('lang','ar');}
    if(types[i]==='cloze'){const gaps=await current.locator('.js-gap').all();for(let g=0;g<gaps.length;g++){await expect(gaps[g]).toHaveAttribute('dir','ltr');await expect(gaps[g]).toHaveAccessibleName('اكتب إجابتك '+(g+1));}}
    if(types[i]==='match'){const italian=lesson.id==='a1-u05-l2';await expect(current.locator('.js-r')).toHaveAttribute('lang',italian?'it':'ar');expect(await current.locator('.js-r').evaluate(n=>getComputedStyle(n).direction)).toBe(italian?'ltr':'rtl');}
    if(lesson.id==='a1-u05-l1'&&types[i]==='mcq'){
     const suffix=await current.locator('.opts .opt span').filter({hasText:'-si'}).evaluate(node=>{const text=node.firstChild,index=text.textContent.indexOf('-');const x=i=>{const range=document.createRange();range.setStart(text,i);range.setEnd(text,i+1);return range.getBoundingClientRect().left;};return {isolated:text.textContent.includes('\u2066-si\u2069'),hyphenFirst:x(index)<x(index+1)};});
     expect(suffix.isolated).toBe(true);expect(suffix.hyphenFirst).toBe(true);
    }
    await audit(page);
   }
   const heads=await page.locator('.gt th').evaluateAll(nodes=>nodes.map(node=>{const value=node.textContent,result={text:value,lang:node.lang,dir:getComputedStyle(node).direction};if(value==="l'"){const text=node.firstChild;const x=i=>{const range=document.createRange();range.setStart(text,i);range.setEnd(text,i+1);return range.getBoundingClientRect().left;};result.apostropheAfterLetter=x(0)<x(1);}return result;}));
   for(const head of heads){const arabic=/[\u0600-\u06ff]/.test(head.text);expect(head.lang).toBe(arabic?'ar':'it');expect(head.dir).toBe(arabic?'rtl':'ltr');if(head.text==="l'")expect(head.apostropheAfterLetter).toBe(true);}
   const cells=await page.locator('.gt td').evaluateAll(nodes=>nodes.map(n=>({text:n.textContent,lang:n.lang,dir:getComputedStyle(n).direction})));
   for(const cell of cells){const ar=/[\u0600-\u06ff]/.test(cell.text);expect(cell.lang).toBe(ar?'ar':'it');expect(cell.dir).toBe(ar?'rtl':'ltr');}
   if(await page.locator('[data-say]').count()){const audio=page.waitForResponse(r=>/\/audio\/.*\.mp3$/.test(r.url()));await page.locator('[data-say]').first().click();expect((await audio).status()).toBe(200);}
   await shot(page,info,lesson.id+'-ar-'+width+'.png');
   await language(page,'en');const english=await snapshot();expect(english).not.toBe(arabic);
   for(const lang of ['ar','en','ar']){await language(page,lang);expect(await snapshot()).toBe(lang==='ar'?arabic:english);}
   expect(errors).toEqual([]);expect(failed).toEqual([]);
  });
  test(lesson.id+' wrong response, fresh retry, all exercises, completion and saved progress',async({page},info)=>{
   const errors=[];page.on('pageerror',e=>errors.push(e.message));await page.goto('/index.html#/lezione?id='+lesson.id);await ready(page);
   const types=await page.evaluate(id=>window.Core.getLesson(id).lesson.exercises.map(e=>e.t),lesson.id);
   const first=page.locator(active);
   if(types[0]==='mcq')await first.locator('[data-orig="0"]').click();else if(types[0]==='conj')for(const input of await first.locator('.js-cell').all())await input.fill('sbagliato');else if(types[0]==='gender')for(const input of await first.locator('.js-sel').all())await input.selectOption('al');else await first.locator('.js-in').fill('sbagliato');
   await first.locator('.js-check').click();await expect(first).toHaveClass(/exq--ko/);await expect(first.locator('.fb')).toContainText(['conj','gender'].includes(types[0])?'ليست صحيحة بعد.':'الإجابة الصحيحة');
   await page.reload();await ready(page);
   await page.evaluate(id=>{const original=window.I18n.t;window.__usedArabicLessonKeys=[];window.I18n.t=function(key,vars){if(/^(lesson\.|ex\.|tense\.|stt\.)/.test(key)||key==='talk.checking')window.__usedArabicLessonKeys.push(key);return original(key,vars);};window.App.go('lezione',{id});},lesson.id);
   for(let i=0;i<types.length;i++){
    await page.locator('.ex-chip[data-go="'+i+'"]').click();await answer(page,types[i],lesson.answers[i]);await expect(page.locator(active)).toHaveClass(/exq--ok/);await expect(page.locator(active+' .fb')).toContainText('أحسنت');
   }
   await expect(page.locator('.summary__score')).toHaveText('100%');await expect(page.locator('.summary__msg')).toContainText(types.length+'/'+types.length);await audit(page);
   const used=await page.evaluate(()=>[...new Set(window.__usedArabicLessonKeys)]);expect(used.length).toBeGreaterThan(25);
   for(const key of used){expect(arabicUI[key],key).toBeDefined();for(const text of typeof arabicUI[key]==='object'?Object.values(arabicUI[key]):[arabicUI[key]])expect(text,key).toMatch(/[\u0600-\u06ff]/);}
   await shot(page,info,lesson.id+'-complete-'+width+'.png');
   const state=()=>page.evaluate(()=>{const s=JSON.parse(JSON.stringify(window.Core.state));delete s.settings.lang;return s;});const before=await state();expect(before.lessons[lesson.id].done).toBe(true);expect(before.lessons[lesson.id].best).toBe(1);
   for(const lang of ['en','ar']){await language(page,lang);expect(await state()).toEqual(before);}
   await page.waitForFunction(id=>JSON.parse(localStorage.getItem('linguai.italiano.v2')).lessons[id].best===1,lesson.id);await page.reload();await ready(page);expect((await state()).lessons[lesson.id]).toEqual(before.lessons[lesson.id]);expect(errors).toEqual([]);
  });
 }
 test('both new Arabic unit summaries restore across English and unit nine stays English',async({page})=>{
  await page.goto('/index.html#/lezione?id=a1-u05-l1');await ready(page);await page.evaluate(()=>window.App.go('percorso'));
  const headings=page.locator('.unit__titles p');await expect(headings.nth(4)).toContainText('اليوم المعتاد والمواعيد');await expect(headings.nth(5)).toContainText('التنقّل والسؤال عن الأماكن في المدينة');await expect(headings.nth(5)).toContainText('إرشادات الطريق');await audit(page);
  await page.evaluate(()=>window.App.go('lezione',{id:'a1-u06-test'}));await ready(page);await language(page,'en');await language(page,'ar');await page.evaluate(()=>window.App.go('percorso'));await expect(headings.nth(4)).toContainText('اليوم المعتاد والمواعيد');await expect(headings.nth(5)).toContainText('التنقّل والسؤال عن الأماكن في المدينة');
  const english=await page.evaluate(()=>window.Core.getLesson('a1-u09-l1').lesson.title);await page.evaluate(()=>window.App.go('lezione',{id:'a1-u09-l1'}));await expect(page.locator('#main')).toHaveAttribute('data-lesson-language','en');await expect(page.locator('.view-head > p')).toHaveText(english);expect(await page.locator('.prose').first().evaluate(n=>getComputedStyle(n).direction)).toBe('ltr');
 });
 test('new dialogue wrong choice, retry and Arabic feedback preserve Italian LTR choices',async({page})=>{
  await page.goto('/index.html#/lezione?id=a1-u06-l3');await ready(page);await page.locator('.ex-chip[data-go="6"]').click();const current=page.locator(active);
  await current.locator('.js-turn [data-k="0"]').click();await expect(current.locator('.js-turn [data-k="0"]')).toHaveClass(/is-ko/);await answer(page,'dialogue',[1,0,0]);await expect(current).toHaveClass(/exq--ko/);await expect(current.locator('.fb')).toContainText('عدد الأخطاء: 1');await audit(page);
 });
});
