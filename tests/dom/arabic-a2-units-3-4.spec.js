const {test,expect}=require('@playwright/test');
const {readFileSync}=require('node:fs');
const path=require('node:path'),vm=require('node:vm');
const AXE=readFileSync(require.resolve('axe-core/axe.min.js'),'utf8');
let arabicUI;vm.runInNewContext(readFileSync(path.join(__dirname,'../../data/i18n/ui-ar.js'),'utf8'),{LINGUAI:{addUI(_l,map){arabicUI=map;}}});
const active='.exq:not([hidden])';
// Independent reviewed answers: no grading-key lookup drives these responses.
const lessons=[
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
    ]
  }
];
async function ready(page){await page.waitForFunction(()=>window.Core&&window.Core.registry.loaded.A2===true&&document.querySelector('.exq'));await page.evaluate(()=>{window.Core.state.settings.autoplay=false;window.Core.save();});}
async function language(page,lang,contentLanguage=lang){if(await page.locator('#railToggle').isVisible()&&!await page.locator('#rail').evaluate(el=>el.classList.contains('is-open')))await page.locator('#railToggle').click();await page.locator('#langToggle').click();await page.locator('#langList [data-lang="'+lang+'"]').click();await expect(page.locator('html')).toHaveAttribute('dir',lang==='ar'?'rtl':'ltr');await expect(page.locator('#main')).toHaveAttribute('data-lesson-language',contentLanguage);}
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

for(const width of [1440,390])test.describe('Arabic A2 units three and four at '+width+'px',()=>{
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
    if(types[i]==='conj')for(const cell of await current.locator('.js-cell').all())expect(await cell.evaluate(n=>getComputedStyle(n).direction)).toBe('ltr');
    if(types[i]==='cloze'){const gaps=await current.locator('.js-gap').all();for(let g=0;g<gaps.length;g++){await expect(gaps[g]).toHaveAttribute('dir','ltr');await expect(gaps[g]).toHaveAccessibleName('اكتب إجابتك '+(g+1));}}
    if(types[i]==='match'){const italian=false;await expect(current.locator('.js-r')).toHaveAttribute('lang',italian?'it':'ar');expect(await current.locator('.js-r').evaluate(n=>getComputedStyle(n).direction)).toBe(italian?'ltr':'rtl');}
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
   if(types[0]==='mcq')await first.locator('[data-orig="'+(lesson.answers[0]===0?1:0)+'"]').click();else if(types[0]==='conj')for(const input of await first.locator('.js-cell').all())await input.fill('sbagliato');else if(types[0]==='gender')for(const input of await first.locator('.js-sel').all())await input.selectOption('al');else await first.locator('.js-in').fill('sbagliato');
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
 test('both Arabic A2 unit summaries restore and untranslated C1 Unit 1 stays English',async({page})=>{
  await page.goto('/index.html#/lezione?id=a2-u03-l1');await ready(page);await page.evaluate(()=>window.App.go('percorso',{level:'A2'}));
  const headings=page.locator('.unit__titles p');await expect(headings.nth(2)).toContainText('ضمائر المفعول به والمفعول غير المباشر');await expect(headings.nth(3)).toContainText('الصحة');await expect(headings.nth(3)).toContainText('mi fa male');await audit(page);
  await page.evaluate(()=>window.App.go('lezione',{id:'a2-u04-test'}));await ready(page);await language(page,'en');await language(page,'ar');await page.evaluate(()=>window.App.go('percorso',{level:'A2'}));await expect(headings.nth(2)).toContainText('ضمائر المفعول به والمفعول غير المباشر');await expect(headings.nth(3)).toContainText('الصحة');
  await page.evaluate(()=>new Promise(resolve=>window.Core.loadLevelData('C1',resolve)));await page.evaluate(()=>window.App.go('lezione',{id:'c1-u01-l1'}));await expect(page.locator('#main')).toHaveAttribute('data-lesson-language','en');expect(await page.locator('.prose').first().evaluate(n=>getComputedStyle(n).direction)).toBe('ltr');
 });

 for(const number of [1,2,3,4])test('c1-u0'+number+' complete English fallback for all lessons and assessment',async({page})=>{
  const errors=[],failed=[];page.on('pageerror',e=>errors.push(e.message));page.on('response',r=>{if(r.status()>=400)failed.push(r.url());});
  const unitId='c1-u'+String(number).padStart(2,'0');
  await page.goto('/index.html#/lezione?id=a2-u03-l1');await ready(page);await language(page,'en');await page.evaluate(()=>new Promise(resolve=>window.Core.loadLevelData('C1',resolve)));
  const snapshot=()=>page.evaluate(id=>JSON.stringify(window.Core.registry.byCode.C1.units.find(u=>u.id===id)),unitId);
  const english=await snapshot(),unit=JSON.parse(english);expect(unit.lessons).toHaveLength(3);expect(unit.test.id).toBe(unitId+'-test');
  await language(page,'ar');expect(await snapshot()).toBe(english);
  for(const lesson of [...unit.lessons,unit.test]){
   await page.evaluate(id=>window.App.go('lezione',{id}),lesson.id);
   await expect(page.locator('#main')).toHaveAttribute('data-lesson-language','en');
   await expect(page.locator('.view-head > p')).toHaveText(lesson.title);
   await expect(page.locator('html')).toHaveAttribute('dir','rtl');
   if(lesson.theory&&lesson.theory.length){
    expect(await page.locator('.prose').first().evaluate(n=>getComputedStyle(n).direction)).toBe('ltr');
   }else{
    // Original assessments may have no theory panel; verify their actual instructions.
    const prompt=page.locator(active+' .exq__prompt').first();
    await expect(prompt).toHaveText(lesson.exercises[0].q);
    await expect(prompt).toHaveAttribute('lang','en');
    expect(await prompt.evaluate(n=>getComputedStyle(n).direction)).toBe('ltr');
   }
   expect(await page.evaluate(id=>window.LINGUAI.lessonLanguage('ar',id),lesson.id)).toBe('en');
   expect(await page.evaluate(id=>JSON.stringify(window.Core.getLesson(id).lesson),lesson.id)).toBe(JSON.stringify(lesson));
   if(lesson.id.endsWith('-l1')||lesson.id.endsWith('-test'))await audit(page);
  }
  for(const lang of ['en','ar','en','ar']){await language(page,lang,'en');expect(await snapshot()).toBe(english);}
  expect(errors).toEqual([]);expect(failed).toEqual([]);
 });
 test('new dialogue wrong choice, retry and Arabic feedback preserve Italian LTR choices',async({page})=>{
  await page.goto('/index.html#/lezione?id=a2-u04-l2');await ready(page);await page.locator('.ex-chip[data-go="5"]').click();const current=page.locator(active);
  await current.locator('.js-turn [data-k="1"]').click();await expect(current.locator('.js-turn [data-k="1"]')).toHaveClass(/is-ko/);await answer(page,'dialogue',[0,0,0]);await expect(current).toHaveClass(/exq--ko/);await expect(current.locator('.fb')).toContainText('عدد الأخطاء: 1');await audit(page);
 });
});
