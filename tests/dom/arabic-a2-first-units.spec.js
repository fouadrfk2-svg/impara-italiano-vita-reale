const { test, expect, expectAudioResponse }=require('../helpers/learner-fixture.cjs');
const {readFileSync}=require('node:fs');
const path=require('node:path'),vm=require('node:vm');
const AXE=readFileSync(require.resolve('axe-core/axe.min.js'),'utf8');
let arabicUI;vm.runInNewContext(readFileSync(path.join(__dirname,'../../data/i18n/ui-ar.js'),'utf8'),{LINGUAI:{addUI(_l,map){arabicUI=map;}}});
const active='.exq:not([hidden])';
// Independent reviewed answers: no grading-key lookup drives these responses.
const lessons=[
  {
    "id": "a2-u01-l1",
    "title": "imperfetto: وصف الماضي والعادات",
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
    ]
  },
  {
    "id": "a2-u01-l2",
    "title": "الفرق بين imperfetto وpassato prossimo",
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
    ]
  },
  {
    "id": "a2-u01-l3",
    "title": "وصف ما تغيّر",
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
    ]
  },
  {
    "id": "a2-u01-l4",
    "title": "التحدّث عن ذكريات الماضي",
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
    ]
  },
  {
    "id": "a2-u01-test",
    "title": "اختبار الوحدة الأولى من A2",
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
    ]
  },
  {
    "id": "a2-u02-l1",
    "title": "القطارات والتذاكر",
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
    ]
  },
  {
    "id": "a2-u02-l2",
    "title": "المستقبل البسيط (futuro semplice)",
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
    ]
  },
  {
    "id": "a2-u02-l3",
    "title": "الفنادق والإقامة",
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
    ]
  },
  {
    "id": "a2-u02-l4",
    "title": "المستقبل السابق والتخطيط",
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
    ]
  },
  {
    "id": "a2-u02-test",
    "title": "اختبار الوحدة الثانية من A2",
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
    ]
  }
];
async function ready(page){await page.waitForFunction(()=>window.Core&&window.Core.registry.loaded.A2===true&&document.querySelector('.exq'));await page.evaluate(()=>{window.Core.state.settings.autoplay=false;window.Core.save();});}
async function language(page,requested,contentLanguage){await expect(page.locator('#langToggle,#langList,.js-guest-language')).toHaveCount(0);await page.evaluate(code=>new Promise(resolve=>window.Core.setLanguage(code,resolve)),requested);await expect(page.locator('html')).toHaveAttribute('lang','ar');await expect(page.locator('html')).toHaveAttribute('dir','rtl');await expect.poll(()=>page.evaluate(()=>window.Core.state.settings.lang)).toBe('ar');if(contentLanguage)await expect(page.locator('#main')).toHaveAttribute('data-lesson-language',contentLanguage);}
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

for(const width of [1440,390])test.describe('Arabic A2 units one and two at '+width+'px',()=>{
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
   if(await page.locator('[data-say]').count()){const audio=page.waitForResponse(r=>/\/audio\/.*\.mp3$/.test(r.url()));await page.locator('[data-say]').first().click();await expectAudioResponse(await audio);}
   await shot(page,info,lesson.id+'-ar-'+width+'.png');
   await language(page,'en');expect(await snapshot()).toBe(arabic);
   for(const lang of ['ar','en','ar']){await language(page,lang);expect(await snapshot()).toBe(arabic);}
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
 test('both Arabic A2 unit summaries restore and untranslated C2 Unit 1 stays English',async({page})=>{
  await page.goto('/index.html#/lezione?id=a2-u01-l1');await ready(page);await page.evaluate(()=>window.App.go('percorso',{level:'A2'}));
  const headings=page.locator('.unit__titles p');await expect(headings.nth(0)).toContainText('بين الأمس واليوم');await expect(headings.nth(1)).toContainText('في السفر');await expect(headings.nth(1)).toContainText('futuro semplice');await audit(page);
  await page.evaluate(()=>window.App.go('lezione',{id:'a2-u02-test'}));await ready(page);await language(page,'en');await language(page,'ar');await page.evaluate(()=>window.App.go('percorso',{level:'A2'}));await expect(headings.nth(0)).toContainText('بين الأمس واليوم');await expect(headings.nth(1)).toContainText('في السفر');
  await page.evaluate(()=>new Promise(resolve=>window.Core.loadLevelData('C2',resolve)));
      const english=await page.evaluate(()=>window.Core.getLesson('c2-u01-l1').lesson.title);await page.evaluate(()=>window.App.go('lezione',{id:'c2-u01-l1'}));await expect(page.locator('#main')).toHaveAttribute('data-lesson-language','en');await expect(page.locator('.view-head > p')).toHaveText(english);expect(await page.locator('.prose').first().evaluate(n=>getComputedStyle(n).direction)).toBe('ltr');
 });

 for(const number of [1,2,3,4])test('c2-u0'+number+' complete English fallback for all lessons and assessment',async({page})=>{
  const errors=[],failed=[];page.on('pageerror',e=>errors.push(e.message));page.on('response',r=>{if(r.status()>=400)failed.push(r.url());});
  const unitId='c2-u'+String(number).padStart(2,'0');
  await page.goto('/index.html#/lezione?id=a2-u01-l1');await ready(page);await language(page,'en');await page.evaluate(()=>new Promise(resolve=>window.Core.loadLevelData('C2',resolve)));
  const snapshot=()=>page.evaluate(id=>JSON.stringify(window.Core.registry.byCode.C2.units.find(u=>u.id===id)),unitId);
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
  await page.goto('/index.html#/lezione?id=a2-u01-l4');await ready(page);await page.locator('.ex-chip[data-go="6"]').click();const current=page.locator(active);
  await current.locator('.js-turn [data-k="1"]').click();await expect(current.locator('.js-turn [data-k="1"]')).toHaveClass(/is-ko/);await answer(page,'dialogue',[0,0]);await expect(current).toHaveClass(/exq--ko/);await expect(current.locator('.fb')).toContainText('عدد الأخطاء: 1');await audit(page);
 });
});
