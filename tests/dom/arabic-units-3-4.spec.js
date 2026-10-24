const {test,expect}=require('@playwright/test');
const {readFileSync}=require('node:fs');
const path=require('node:path'),vm=require('node:vm');
const AXE=readFileSync(require.resolve('axe-core/axe.min.js'),'utf8');
let arabicUI;vm.runInNewContext(readFileSync(path.join(__dirname,'../../data/i18n/ui-ar.js'),'utf8'),{LINGUAI:{addUI(_l,map){arabicUI=map;}}});
const active='.exq:not([hidden])';
// Independent reviewed answers: the driver never reads a grading key to answer.
const lessons=[
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
 else if(type==='dialogue'){for(const index of value){const choice=current.locator('.js-turn [data-k="'+index+'"]');await choice.click();await expect(choice).toHaveCount(0);}return;}
 else await current.locator('.js-in').fill(value);
 await current.locator('.js-check').click();
}
async function shot(page,info,name){const target=info.outputPath(name);await page.screenshot({path:target,fullPage:true});await info.attach(name,{path:target,contentType:'image/png'});}

for(const width of [1440,390])test.describe('Arabic units three and four at '+width+'px',()=>{
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
    if(types[i]==='match'){const italian=false;await expect(current.locator('.js-r')).toHaveAttribute('lang',italian?'it':'ar');expect(await current.locator('.js-r').evaluate(n=>getComputedStyle(n).direction)).toBe(italian?'ltr':'rtl');}
    if(lesson.id==='a1-u03-l2'&&types[i]==='mcq'){
     const endings=await current.locator('.opts .opt span').evaluateAll(nodes=>nodes.map(node=>{const text=node.firstChild,value=text.textContent,index=value.indexOf('-');const x=i=>{const range=document.createRange();range.setStart(text,i);range.setEnd(text,i+1);return range.getBoundingClientRect().left;};return {isolated:value.startsWith('\u2066-'),hyphenBeforeLetters:x(index)<x(index+1)};}));
     expect(endings).toHaveLength(3);for(const ending of endings){expect(ending.isolated).toBe(true);expect(ending.hyphenBeforeLetters).toBe(true);}
    }
    await audit(page);
   }
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
   if(types[0]==='mcq')await first.locator('[data-orig="0"]').click();else if(types[0]==='conj')for(const input of await first.locator('.js-cell').all())await input.fill('sbagliato');else await first.locator('.js-in').fill('sbagliato');
   await first.locator('.js-check').click();await expect(first).toHaveClass(/exq--ko/);await expect(first.locator('.fb')).toContainText(types[0]==='conj'?'ليست صحيحة بعد.':'الإجابة الصحيحة');
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
 test('both new Arabic unit summaries restore across English and untranslated A2 Unit 3 stays English',async({page})=>{
  await page.goto('/index.html#/lezione?id=a1-u03-l1');await ready(page);await page.evaluate(()=>window.App.go('percorso'));
  const headings=page.locator('.unit__titles p');await expect(headings.nth(2)).toContainText('الطعام والشراب وما يعجبك');await expect(headings.nth(3)).toContainText('الملابس والمقاسات والتسوّق');await expect(headings.nth(3)).toContainText('الأسعار والدفع');await audit(page);
  await page.evaluate(()=>window.App.go('lezione',{id:'a1-u04-test'}));await ready(page);await language(page,'en');await language(page,'ar');await page.evaluate(()=>window.App.go('percorso'));await expect(headings.nth(2)).toContainText('الطعام والشراب وما يعجبك');await expect(headings.nth(3)).toContainText('الملابس والمقاسات والتسوّق');
  await page.evaluate(()=>new Promise(resolve=>window.Core.loadLevelData('A2',resolve)));
      const english=await page.evaluate(()=>window.Core.getLesson('a2-u03-l1').lesson.title);await page.evaluate(()=>window.App.go('lezione',{id:'a2-u03-l1'}));await expect(page.locator('#main')).toHaveAttribute('data-lesson-language','en');await expect(page.locator('.view-head > p')).toHaveText(english);expect(await page.locator('.prose').first().evaluate(n=>getComputedStyle(n).direction)).toBe('ltr');
 });
 test('new dialogue wrong choice, retry and Arabic feedback preserve Italian LTR choices',async({page})=>{
  await page.goto('/index.html#/lezione?id=a1-u03-l4');await ready(page);await page.locator('.ex-chip[data-go="6"]').click();const current=page.locator(active);
  await current.locator('.js-turn [data-k="1"]').click();await expect(current.locator('.js-turn [data-k="1"]')).toHaveClass(/is-ko/);await answer(page,'dialogue',[0,1]);await expect(current).toHaveClass(/exq--ko/);await expect(current.locator('.fb')).toContainText('عدد الأخطاء: 1');await audit(page);
 });
});
