const {test,expect}=require('@playwright/test');
const {readFileSync}=require('node:fs');
const path=require('node:path'),vm=require('node:vm');
const AXE=readFileSync(require.resolve('axe-core/axe.min.js'),'utf8');
let arabicUI;vm.runInNewContext(readFileSync(path.join(__dirname,'../../data/i18n/ui-ar.js'),'utf8'),{LINGUAI:{addUI(_l,map){arabicUI=map;}}});
const active='.exq:not([hidden])';
// Independent reviewed answers: no grading-key lookup drives these responses.
const lessons=[
  {
    "id": "a1-u07-l1",
    "title": "حجز طاولة والدخول إلى المطعم",
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
    ]
  },
  {
    "id": "a1-u07-l2",
    "title": "طلب طبق ومشروب والسؤال عن المكوّنات",
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
    ]
  },
  {
    "id": "a1-u07-l3",
    "title": "ne: الحديث عن كمية من شيء سبق ذكره",
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
    ]
  },
  {
    "id": "a1-u07-l4",
    "title": "طلب الحساب والدفع وتوديع الموظّف",
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
    ]
  },
  {
    "id": "a1-u07-test",
    "title": "اختبار الوحدة السابعة",
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
    ]
  },
  {
    "id": "a1-u08-l1",
    "title": "أمّي ومديري: التعبير عن الملكية والعلاقات",
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
    ]
  },
  {
    "id": "a1-u08-l2",
    "title": "وصف مظهر شخص والسؤال عنه",
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
    ]
  },
  {
    "id": "a1-u08-l3",
    "title": "وصف الشخصية والتعبير عن رأيك",
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
    ]
  },
  {
    "id": "a1-u08-l4",
    "title": "أطول منك: المقارنة والتفضيل",
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
    ]
  },
  {
    "id": "a1-u08-test",
    "title": "اختبار الوحدة الثامنة",
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

for(const width of [1440,390])test.describe('Arabic units seven and eight at '+width+'px',()=>{
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
    if(types[i]==='match'){const italian=lesson.id==='a1-u08-l3';await expect(current.locator('.js-r')).toHaveAttribute('lang',italian?'it':'ar');expect(await current.locator('.js-r').evaluate(n=>getComputedStyle(n).direction)).toBe(italian?'ltr':'rtl');}
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
 test('both new Arabic unit summaries restore across English and A2 stays English',async({page})=>{
  await page.goto('/index.html#/lezione?id=a1-u07-l1');await ready(page);await page.evaluate(()=>window.App.go('percorso'));
  const headings=page.locator('.unit__titles p');await expect(headings.nth(6)).toContainText('في المطعم: من حجز الطاولة إلى الحساب');await expect(headings.nth(7)).toContainText('الأشخاص من حولنا: العائلة والصفات والمقارنة');await expect(headings.nth(7)).toContainText('المقارنة والتفضيل');await audit(page);
  await page.evaluate(()=>window.App.go('lezione',{id:'a1-u08-test'}));await ready(page);await language(page,'en');await language(page,'ar');await page.evaluate(()=>window.App.go('percorso'));await expect(headings.nth(6)).toContainText('في المطعم: من حجز الطاولة إلى الحساب');await expect(headings.nth(7)).toContainText('الأشخاص من حولنا: العائلة والصفات والمقارنة');
  await page.evaluate(()=>new Promise(resolve=>window.Core.loadLevelData('A2',resolve)));
      const english=await page.evaluate(()=>window.Core.getLesson('a2-u01-l1').lesson.title);await page.evaluate(()=>window.App.go('lezione',{id:'a2-u01-l1'}));await expect(page.locator('#main')).toHaveAttribute('data-lesson-language','en');await expect(page.locator('.view-head > p')).toHaveText(english);expect(await page.locator('.prose').first().evaluate(n=>getComputedStyle(n).direction)).toBe('ltr');
 });
 test('new dialogue wrong choice, retry and Arabic feedback preserve Italian LTR choices',async({page})=>{
  await page.goto('/index.html#/lezione?id=a1-u07-l2');await ready(page);await page.locator('.ex-chip[data-go="7"]').click();const current=page.locator(active);
  await current.locator('.js-turn [data-k="1"]').click();await expect(current.locator('.js-turn [data-k="1"]')).toHaveClass(/is-ko/);await answer(page,'dialogue',[0,0,0]);await expect(current).toHaveClass(/exq--ko/);await expect(current.locator('.fb')).toContainText('عدد الأخطاء: 1');await audit(page);
 });
});
