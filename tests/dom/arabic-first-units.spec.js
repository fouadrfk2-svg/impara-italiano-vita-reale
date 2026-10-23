const {test,expect}=require('@playwright/test');
const {readFileSync}=require('node:fs');
const path=require('node:path'),vm=require('node:vm');
const AXE=readFileSync(require.resolve('axe-core/axe.min.js'),'utf8');
let arabicUI;vm.runInNewContext(readFileSync(path.join(__dirname,'../../data/i18n/ui-ar.js'),'utf8'),{LINGUAI:{addUI(_l,map){arabicUI=map;}}});
const active='.exq:not([hidden])';
// Independent reviewed answers: the driver never reads a grading key to answer.
const lessons=[
 {id:'a1-u01-l4',title:'كيف حالك؟ المخاطبة الودّية والمهذّبة',answers:[1,1,['sto','stai','sta','state'],'state','Sto bene, grazie. E tu?',[1,0],'match','Buonasera signora, come sta?',"Non c'è male, grazie. E Lei?"]},
 {id:'a1-u01-test',title:'اختبار الوحدة الأولى',answers:[1,'siamo','stai',{zaino:'lo',amica:"l'",stazione:'la',treno:'il'},0,[0,2,3],"Un'acqua per favore",['Gli','studenti','sono','al','bar'],'Due caffè e un cornetto, per favore.','Buongiorno, come sta?']},
 {id:'a1-u02-l1',title:'اسمي… التعريف بالنفس',answers:[1,1,'mi','a',['mi','sono','abito'],['Piacere','di','conoscerti,','mi','chiamo','Luca'],[0,1],'Mi chiamo Elena e abito a Napoli.','Piacere di conoscerti!']},
 {id:'a1-u02-l2',title:'الفعل avere والأعداد من صفر إلى مئة',answers:[['ho','hai','ha','abbiamo','avete','hanno'],1,1,'93',"'",'Quanti anni hai?','match',['costa','trentadue','ho'],'Ho trentacinque anni e abito a Torino.','Quanto costa un cappuccino?']},
 {id:'a1-u02-l3',title:'ما عملك؟ الحديث عن المهنة',answers:[['faccio','fai','fa','facciamo','fate','fanno'],0,1,'la',{cuoca:'la',ingegnere:"l'",studentessa:'la',operaio:"l'"},'Che lavoro fai?','match',['Lavoro','in','una','banca','a','Milano'],"Faccio l'architetto, lavoro con mio fratello.",'Che lavoro fai? Io faccio la giornalista.']},
 {id:'a1-u02-l4',title:'الأفعال المنتظمة المنتهية بـ\u2066-ARE\u2069',answers:[['parlo','parli','parla','parliamo','parlate','parlano'],['cerchi','cerchiamo'],1,'abitano','non','Cerchiamo un appartamento a Roma',[0,2,3,4],['Non','lavoro','il','sabato'],'Studio italiano da tre mesi.','Non parlo bene, ma capisco quasi tutto.']},
 {id:'a1-u02-test',title:'اختبار الوحدة الثانية',answers:['mi','hai',1,1,['faccio','fa','facciamo'],1,['sono','abito','faccio'],'Non parlo italiano','Ho ventisette anni e cerco lavoro.','Mi chiamo Anna e faccio la giornalista.']}
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

for(const width of [1440,390])test.describe('Arabic first two units at '+width+'px',()=>{
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
    if(types[i]==='match'){const italian=lesson.id==='a1-u02-l3';await expect(current.locator('.js-r')).toHaveAttribute('lang',italian?'it':'ar');expect(await current.locator('.js-r').evaluate(n=>getComputedStyle(n).direction)).toBe(italian?'ltr':'rtl');}
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
 test('both Arabic unit titles and descriptions appear in the path and restore through English',async({page})=>{
  await page.goto('/index.html#/lezione?id=a1-u01-l4');await ready(page);
  await page.evaluate(()=>window.App.go('percorso'));
  const headings=page.locator('.unit__titles p');await expect(headings.nth(0)).toContainText('التحية وحديث المقهى');await expect(headings.nth(1)).toContainText('التعارف والتعريف بالنفس');await expect(headings.nth(1)).toContainText('العمر والأعداد');await audit(page);
  await page.evaluate(()=>window.App.go('lezione',{id:'a1-u02-test'}));await ready(page);await language(page,'en');await language(page,'ar');await page.evaluate(()=>window.App.go('percorso'));await expect(headings.nth(0)).toContainText('التحية وحديث المقهى');await expect(headings.nth(1)).toContainText('التعارف والتعريف بالنفس');
 });
 test('dialogue wrong choice can be corrected and its completion feedback is Arabic',async({page})=>{
  await page.goto('/index.html#/lezione?id=a1-u01-l4');await ready(page);await page.locator('.ex-chip[data-go="5"]').click();const current=page.locator(active);
  await current.locator('.js-turn [data-k="0"]').click();await expect(current.locator('.js-turn [data-k="0"]')).toHaveClass(/is-ko/);
  await answer(page,'dialogue',[1,0]);await expect(current).toHaveClass(/exq--ko/);await expect(current.locator('.fb')).toContainText('عدد الأخطاء: 1');await audit(page);
 });
});
