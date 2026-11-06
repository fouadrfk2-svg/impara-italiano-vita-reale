const {test,expect}=require('../helpers/learner-fixture.cjs');
const fs=require('node:fs'),path=require('node:path');
const AXE=fs.readFileSync(require.resolve('axe-core/axe.min.js'),'utf8');
const WIDTHS=[320,360,390,430,768,1440];
const ROUTES=[
 ['oggi'],['percorso'],['lezione',{id:'a1-u01-l1'}],['grammatica'],
 ['grammatica',{id:'g-nome-plurale'}],['grammatica',{id:'g-preposizioni'}],
 ['lessico'],['progressi'],['ripasso'],['cinque'],['allenamento'],
 ['conversazione'],['chiacchiere'],['shadowing'],['velocita'],['lettura'],
 ['scrittura'],['suoni'],['esame'],['falsi'],['copertura'],['piazzamento'],
 ['guida'],['impostazioni'],['account']
];
const gallery=process.env.MOBILE_RESPONSIVE_DIR;
if(gallery)fs.mkdirSync(gallery,{recursive:true});
async function capture(page,name){if(gallery)await page.screenshot({path:path.join(gallery,name+'.png'),animations:'disabled'});}
async function ready(page){
 await page.waitForFunction(()=>window.Account&&Account.snapshot().authenticated&&document.documentElement.dataset.access==='learner');
 await page.evaluate(()=>{Core.state.settings.lang='ar';Core.state.settings.autoplay=false;Core.save();});
 await page.evaluate(()=>document.fonts.ready);
}
async function visit(page,route,params){
 const query=new URLSearchParams(params||{}).toString();
 await page.goto(`/index.html#/${route}${query?'?'+query:''}`);
 let result;try{result=await page.waitForFunction(r=>{const main=document.querySelector('#main');if(Router.current.route!==r||!main||main.hasAttribute('aria-busy'))return null;if(main.querySelector('.course-opening[role="alert"]'))return {error:main.innerText};return main.querySelector('h1,.empty')?{ok:true}:null;},route,{timeout:20000});}catch(error){throw new Error(`route ${route} did not finish rendering: ${error.message}`,{cause:error});}
 const outcome=await result.jsonValue();expect(outcome,`route ${route} failed to prepare`).toEqual({ok:true});
}
async function pageFits(page,label){
 const result=await page.evaluate(()=>({
  viewport:innerWidth,document:document.documentElement.scrollWidth,body:document.body.scrollWidth,
  main:document.querySelector('#main')?.scrollWidth,mainClient:document.querySelector('#main')?.clientWidth,
  recordCellOverflow:[...document.querySelectorAll('table[data-mobile-layout="records"] td')].filter(c=>c.clientWidth&&c.scrollWidth>c.clientWidth+1).length
 }));
 expect(result.document,`${label}: document has horizontal overflow ${JSON.stringify(result)}`).toBeLessThanOrEqual(result.viewport+1);
 expect(result.body,`${label}: body has horizontal overflow ${JSON.stringify(result)}`).toBeLessThanOrEqual(result.viewport+1);
 expect(result.main,`${label}: main has horizontal overflow ${JSON.stringify(result)}`).toBeLessThanOrEqual(result.mainClient+1);
 expect(result.recordCellOverflow,`${label}: a responsive table cell clips content`).toBe(0);
}

for(const width of WIDTHS){
 test(`Arabic learner route matrix is responsive at ${width}px`,async({page})=>{
  test.setTimeout(180000);
  await page.setViewportSize({width,height:900});
  await page.addInitScript(()=>localStorage.setItem('linguai.italiano.v2',JSON.stringify({schema:2,onboarded:true,settings:{lang:'ar',autoplay:false}})));
  await page.addInitScript(AXE);
  const errors=[];page.on('pageerror',error=>errors.push(error.message));
  await page.goto('/index.html#/oggi');await ready(page);
  const saved=await page.evaluate(()=>JSON.stringify({lessons:Core.state.lessons,writing:Core.state.writing,srs:Core.state.srs}));
  for(const [route,params] of ROUTES){
   await visit(page,route,params);await page.evaluate(()=>document.fonts.ready);await pageFits(page,route+(params?.id?`:${params.id}`:''));
   if(route==='percorso'){
    const partial=await page.locator('.level-strip').evaluate(strip=>{
     const box=strip.getBoundingClientRect(),left=box.left+strip.clientLeft,right=left+strip.clientWidth;
     return [...strip.querySelectorAll('.level-pill')].map(button=>button.getBoundingClientRect())
      .filter(rect=>rect.left<right&&rect.right>left)
      .filter(rect=>rect.left<left-1||rect.right>right+1).length;
    });
    expect(partial,`level selector shows a clipped card at ${width}px`).toBe(0);
   }
   if(route==='lezione'){
    const record=page.locator('#step-gram table.gt[data-mobile-layout="records"]');
    await expect(record).toBeVisible();
    await expect(record.locator('tbody td[data-label]').first()).toBeVisible();
    const dirs=await record.evaluate(t=>({arabic:[...t.querySelectorAll('td[lang="ar"]')].length,italian:[...t.querySelectorAll('td.it[lang="it"]')].length}));
    expect(dirs.arabic).toBeGreaterThan(0);expect(dirs.italian).toBeGreaterThan(0);
    if(width===390){await page.evaluate(()=>{const node=document.querySelector('#step-gram');window.scrollTo(0,node.getBoundingClientRect().top+window.scrollY-24);});await capture(page,'lesson-grammar-390');}
   }
   if(route==='grammatica'&&params?.id==='g-preposizioni'){
    const wrap=page.locator('.prose .table-wrap').first();
    await expect(wrap).toHaveAttribute('role','region');await expect(wrap).toHaveAttribute('tabindex','0');
    expect(await wrap.locator('table').getAttribute('data-mobile-layout')).toBe('scroll');
   }
   if(route==='progressi'){
    await page.evaluate(()=>{Core.state.stats.days={};Views.progressi();});
    expect(await page.locator('.progress-chart__day').count()).toBe(14);
    const chart=await page.locator('.progress-chart').evaluate(node=>({empty:node.classList.contains('progress-chart--empty'),height:node.getBoundingClientRect().height}));
    expect(chart.empty,`zero-activity chart should expose its honest empty state at ${width}px`).toBe(true);
    expect(chart.height,`zero-activity chart should not reserve blank space at ${width}px`).toBeLessThan(50);
    const labels=await page.locator('.progress-chart__day').first().evaluate(node=>({weekday:getComputedStyle(node.querySelector('.progress-chart__weekday')).display,date:getComputedStyle(node.querySelector('.progress-chart__date')).display}));
    expect(labels.date,`compact date labels should be visible at ${width}px`).toBe(width<=560?'inline':'none');
    expect(labels.weekday,`weekday labels should remain visible at ${width}px`).toBe(width<=560?'none':'inline');
    if(width===390){await page.evaluate(()=>{const node=document.querySelector('.progress-chart');window.scrollTo(0,node.getBoundingClientRect().top+window.scrollY-24);});await capture(page,'progress-390');}
   }
  }
  if(width===390){
   await visit(page,'coniugatore');await page.locator('.js-verb').fill('essere');await page.locator('.js-go').click();
   const conj=page.locator('#conjOut table.gt--conjugation').first();await expect(conj).toBeVisible();
   await expect(conj).toHaveAttribute('data-mobile-layout','compact');
   expect(await page.locator('#conjOut .table-wrap[role="region"]').count()).toBe(0);
   await page.locator('#conjOut').scrollIntoViewIfNeeded();await capture(page,'conjugation-390');

   await visit(page,'grammatica',{id:'g-nome-plurale'});await page.locator('.prose').scrollIntoViewIfNeeded();
   const a11y=await page.evaluate(async()=>({violations:(await window.axe.run(document,{runOnly:{type:'tag',values:['wcag2a','wcag2aa','wcag21aa']}})).violations.map(v=>({id:v.id,targets:v.nodes.map(n=>n.target)}))}));
   expect(a11y.violations).toEqual([]);await capture(page,'grammar-reference-390');
   expect(await page.evaluate(()=>JSON.stringify({lessons:Core.state.lessons,writing:Core.state.writing,srs:Core.state.srs}))).toBe(saved);
   await expect(page.locator('#railToggle')).toHaveCSS('width','48px');
   for(const button of await page.locator('.bottom-nav__item').all()){
    const box=await button.boundingBox();expect(box.height,'mobile navigation target').toBeGreaterThanOrEqual(44);
   }
  }
  expect(errors).toEqual([]);
 });
}

test('exercise feedback keeps the error cue in the answer and explanation, not the entire card',async({page})=>{
 await page.setViewportSize({width:390,height:900});
 await page.addInitScript(()=>localStorage.setItem('linguai.italiano.v2',JSON.stringify({schema:2,onboarded:true,settings:{lang:'ar',autoplay:false}})));
 await page.goto('/index.html#/lezione?id=a1-u01-l1');await ready(page);await expect(page.locator('.exq:visible').first()).toBeVisible();
 const exercise=page.locator('.exq:visible').first();await exercise.locator('input[type="radio"]').last().check();await exercise.locator('.js-check').click();
 await expect(exercise.locator('.fb--ko.is-on')).toBeVisible();
 const colors=await exercise.evaluate(node=>({outer:getComputedStyle(node).borderTopColor,feedback:getComputedStyle(node.querySelector('.fb')).borderTopColor,answer:getComputedStyle(node.querySelector('.opt.is-ko')).borderTopColor}));
 expect(colors.feedback).not.toBe(colors.outer);expect(colors.answer).not.toBe(colors.outer);
});

test('mobile lesson menu and exercise navigation stay out of the learning content',async({page})=>{
 await page.addInitScript(AXE);
 let firstVisit=true;
 for(const width of [320,360,390,430]){
  await page.setViewportSize({width,height:844});
  if(firstVisit){await page.goto('/index.html#/lezione?id=a1-u01-l1');firstVisit=false;}else{await page.reload();}
  await ready(page);
  const menu=page.locator('#railToggle');
  await expect(menu).toBeVisible();
  expect(await menu.evaluate(e=>getComputedStyle(e).position),`menu shortcut must scroll with the page at ${width}px`).toBe('absolute');
  await page.locator('.lesson-steps [data-step="ex"]').click();
  const picker=page.locator('.js-ex-menu');
  await expect(picker).toBeVisible();
  await expect(picker).toHaveAttribute('aria-controls','lessonExerciseList');
  await expect(picker).toHaveAttribute('aria-expanded','false');
  await expect(page.locator('.ex-chips')).toBeHidden();
  await expect(page.locator('.ex-nav__progress')).toHaveAttribute('aria-valuemax','9');
  await expect(page.locator('.js-ex-current')).toContainText('1');
  await expect(page.locator('.js-ex-open')).toBeHidden();
  await expect(page.locator('.js-ex-answered')).toBeHidden();
  const nav=page.locator('.ex-nav');
  await expect(nav).toBeVisible();
  expect(await nav.evaluate(e=>getComputedStyle(e).position),`exercise shortcuts must not pin over the task at ${width}px`).toBe('static');
  await picker.click();await expect(picker).toHaveAttribute('aria-expanded','true');await expect(page.locator('.ex-chips')).toBeVisible();
  await expect(page.locator('.ex-chip')).toHaveCount(9);
  await expect(page.locator('.ex-chip[aria-current="step"]')).toHaveCount(1);
  await expect(page.locator('.js-ex-pos')).toContainText('9');
  const geometry=await page.evaluate(()=>{
   const menu=document.querySelector('#railToggle').getBoundingClientRect();
   const nav=document.querySelector('.ex-nav').getBoundingClientRect();
   const chip=document.querySelector('.ex-chip').getBoundingClientRect();
   return {menuBottom:menu.bottom,navTop:nav.top,chipWidth:chip.width,scrollWidth:document.documentElement.scrollWidth,viewport:innerWidth};
  });
  expect(geometry.scrollWidth,`lesson overflow at ${width}px`).toBeLessThanOrEqual(geometry.viewport+1);
  expect(geometry.navTop,`exercise navigator should be brought into view at ${width}px`).toBeGreaterThanOrEqual(0);
  expect(geometry.chipWidth,`exercise shortcut should retain a touch-sized target at ${width}px`).toBeGreaterThanOrEqual(44);
  if(width===390){
   const isMenuOffContent=await page.evaluate(()=>document.querySelector('#railToggle').getBoundingClientRect().bottom<=0);
   expect(isMenuOffContent,'top menu shortcut should scroll away; bottom More navigation remains persistent').toBe(true);
   const accessibility=await page.evaluate(async()=>window.axe.run(document,{runOnly:{type:'tag',values:['wcag2a','wcag2aa','wcag21aa']}}));
   expect(accessibility.violations.map(v=>({id:v.id,targets:v.nodes.map(n=>n.target)}))).toEqual([]);
   const pickerForFill=page.locator('.js-ex-menu');
   if(await pickerForFill.isVisible()&&await pickerForFill.getAttribute('aria-expanded')!=='true')await pickerForFill.click();
   await page.locator('.ex-chip[data-go="3"]').click();
   await page.setViewportSize({width:390,height:520});
   const answer=page.locator('.exq[data-idx="3"] .js-in');await answer.focus();await expect(page.locator('body')).toHaveClass(/is-mobile-field-focused/);
   await page.waitForFunction(()=>document.querySelector('.bottom-nav').getBoundingClientRect().top>innerHeight-1);
   const keyboardGeometry=await page.evaluate(()=>({input:document.querySelector('.exq[data-idx="3"] .js-in').getBoundingClientRect(),nav:document.querySelector('.bottom-nav').getBoundingClientRect(),width:document.documentElement.scrollWidth,viewport:innerWidth,height:innerHeight}));
   expect(keyboardGeometry.input.bottom,`focused answer must clear the bottom bar when keyboard space is reduced`).toBeLessThanOrEqual(keyboardGeometry.nav.top);
   expect(keyboardGeometry.nav.top).toBeGreaterThan(keyboardGeometry.height-1);
   expect(keyboardGeometry.width).toBeLessThanOrEqual(keyboardGeometry.viewport+1);
   await answer.fill('sono');await page.locator('.exq[data-idx="3"] .js-check').click();await expect(page.locator('.exq[data-idx="3"] .fb.is-on')).toBeVisible();
   await expect(page.locator('body')).not.toHaveClass(/is-mobile-field-focused/);
  }
  await page.evaluate(()=>LearningJourney.clearResume('a1-u01-l1'));
 }
});

test('mobile exercise picker traverses all nine and restores answer feedback',async({page})=>{
 await page.addInitScript(AXE);
 await page.addInitScript(()=>localStorage.setItem('linguai.italiano.v2',JSON.stringify({schema:2,onboarded:true,settings:{lang:'ar',autoplay:false}})));
 await page.setViewportSize({width:390,height:844});
 await page.goto('/index.html#/lezione?id=a1-u01-l1');await ready(page);
 await page.locator('.lesson-steps [data-step="ex"]').click();
 const picker=page.locator('.js-ex-menu');
 await expect(picker).toHaveAttribute('aria-expanded','false');
 await expect(page.locator('.ex-nav__progress')).toHaveAttribute('aria-valuenow','0');
 await expect(page.locator('.js-ex-open')).toBeHidden();
 await expect(page.locator('.js-ex-answered')).toBeHidden();
 const hint=page.locator('.journey-ex-guidance');
 if(await hint.isVisible()){
  expect(await hint.evaluate(node=>node.open)).toBe(false);
  await hint.locator('summary').click();await expect(hint.locator('.journey-ex-guidance__text')).toBeVisible();
  await hint.locator('summary').click();await expect(hint.locator('.journey-ex-guidance__text')).toBeHidden();
 }
 const collapsedAudit=await page.evaluate(async()=>window.axe.run(document,{runOnly:{type:'tag',values:['wcag2a','wcag2aa','wcag21aa']}}));
 expect(collapsedAudit.violations.map(v=>v.id)).toEqual([]);
 for(let index=0;index<9;index++){
  if(await picker.getAttribute('aria-expanded')!=='true')await picker.click();
  const chip=page.locator('.ex-chip[data-go="'+index+'"]').first();
  await expect(chip).toBeVisible();await expect(page.locator('.ex-chip')).toHaveCount(9);
  await chip.click();
  await expect(picker).toHaveAttribute('aria-expanded','false');
  await expect(page.locator('.exq:visible')).toHaveAttribute('data-idx',String(index));
  await expect(page.locator('.js-ex-current')).toContainText(String(index+1));
  if(index===0){
   const first=page.locator('.exq[data-idx="0"]:visible');
   await first.locator('.opt[data-orig="0"]').click();await first.locator('.js-check').click();
   await expect(first.locator('.fb--ko.is-on')).toBeVisible();
  }
  if(index===3){
   const fill=page.locator('.exq[data-idx="3"]:visible');
   await fill.locator('.js-in').fill('sono');await fill.locator('.js-check').click();
   await expect(fill.locator('.fb--ok.is-on')).toBeVisible();
  }
 }
 await expect(page.locator('.ex-nav__progress')).toHaveAttribute('aria-valuenow','2');
 await page.reload();await ready(page);
 await expect(page.locator('.exq:visible')).toHaveAttribute('data-idx','8');
 await expect(page.locator('.js-ex-current')).toContainText('9');
 await expect(page.locator('.ex-nav__progress')).toHaveAttribute('aria-valuenow','2');
 await picker.click();
 await expect(page.locator('.ex-chip[data-go="0"]')).toHaveClass(/is-ko/);
 await expect(page.locator('.ex-chip[data-go="3"]')).toHaveClass(/is-ok/);
 const expandedAudit=await page.evaluate(async()=>window.axe.run(document,{runOnly:{type:'tag',values:['wcag2a','wcag2aa','wcag21aa']}}));
 expect(expandedAudit.violations.map(v=>v.id)).toEqual([]);
 await page.locator('.ex-chip[data-go="0"]').click();
 await expect(page.locator('.exq[data-idx="0"]:visible .journey-answer')).toBeVisible();
 await expect(page.locator('.exq[data-idx="0"] .js-check')).toHaveCount(0);
 await expect(page.locator('.ex-nav__progress')).toHaveAttribute('aria-valuenow','2');
});
test('mobile lesson footer keeps legal links compact and clear of the fixed navigation',async({page})=>{
 await page.addInitScript(()=>localStorage.setItem('linguai.italiano.v2',JSON.stringify({schema:2,onboarded:true,settings:{lang:'ar',autoplay:false}})));
 for(const width of [320,360,390,430]){
  await page.setViewportSize({width,height:844});
  await page.goto('/index.html#/lezione?id=a1-u01-l1');await ready(page);
  await expect(page.locator('body')).toHaveClass(/is-lesson-screen/);
  const footer=page.locator('.site-foot');
  await expect(footer.locator('.site-foot__brand')).toBeHidden();
  const privacy=footer.locator('a[href="#/privacy"]');
  const attribution=footer.locator('a[href="https://github.com/AndreaBonn"]');
  await expect(privacy).toBeVisible();await expect(attribution).toBeVisible();
  const compact=await page.evaluate(()=>({
   mainBottom:getComputedStyle(document.querySelector('#main')).paddingBottom,
   width:document.documentElement.scrollWidth,viewport:innerWidth
  }));
  expect(parseFloat(compact.mainBottom),`lesson should not reserve the oversized shared footer gap at ${width}px`).toBeLessThanOrEqual(40);
  expect(compact.width,`lesson footer causes page overflow at ${width}px`).toBeLessThanOrEqual(compact.viewport+1);
  await page.evaluate(()=>window.scrollTo(0,document.documentElement.scrollHeight));
  const footerGeometry=await page.evaluate(()=>{
   const privacy=document.querySelector('.site-foot a[href="#/privacy"]').getBoundingClientRect();
   const attribution=document.querySelector('.site-foot a[href="https://github.com/AndreaBonn"]').getBoundingClientRect();
   const nav=document.querySelector('.bottom-nav').getBoundingClientRect();
   return {privacyBottom:privacy.bottom,attributionBottom:attribution.bottom,navTop:nav.top,footerHeight:document.querySelector('.site-foot').getBoundingClientRect().height};
  });
  expect(footerGeometry.privacyBottom,`privacy link is covered by the bottom navigation at ${width}px`).toBeLessThan(footerGeometry.navTop);
  expect(footerGeometry.attributionBottom,`attribution is covered by the bottom navigation at ${width}px`).toBeLessThan(footerGeometry.navTop);
  expect(footerGeometry.footerHeight,`lesson should use a compact legal footer at ${width}px`).toBeLessThan(140);
 }
 await page.locator('.site-foot a[href="#/privacy"]').click();
 await expect(page).toHaveURL(/#\/privacy$/);
 await expect(page.locator('body')).not.toHaveClass(/is-lesson-screen/);
 await expect(page.locator('.site-foot__brand')).toBeVisible();
});

test('mobile exercise types retain clear task cards, answer feedback and adjacent controls',async({page})=>{
 await page.addInitScript(()=>localStorage.setItem('linguai.italiano.v2',JSON.stringify({schema:2,onboarded:true,settings:{lang:'ar',autoplay:false}})));
 const exercises=[[0,'.opt'],[3,'.js-in'],[4,'.js-in'],[5,'.js-bank .tok'],[6,'.match-btn'],[7,'.js-play'],[8,'.voice-target']];
 for(const width of [320,390,430]){
  await page.setViewportSize({width,height:844});
  await page.goto('/index.html#/lezione?id=a1-u01-l1');await ready(page);
  await page.locator('.lesson-steps [data-step="ex"]').click();
  for(const [index,selector] of exercises){
   const pickerEach=page.locator('.js-ex-menu');
   if(await pickerEach.isVisible()&&await pickerEach.getAttribute('aria-expanded')!=='true')await pickerEach.click();
   await page.locator('.ex-chip[data-go="'+index+'"]').click();
   const active=page.locator('.exq:visible');await expect(active).toHaveAttribute('data-idx',String(index));
   await expect(active.locator(selector).first()).toBeVisible();
   const previous=page.locator('.js-ex-prev'),next=page.locator('.js-ex-next');
   await expect(previous).toBeVisible();await expect(next).toBeVisible();
   for(const button of [previous,next]){
    const size=await button.boundingBox();expect(size.height,`navigation touch target at ${width}px`).toBeGreaterThanOrEqual(44);
    await button.scrollIntoViewIfNeeded();
    const geometry=await button.evaluate(element=>{const r=element.getBoundingClientRect(),bar=document.querySelector('.bottom-nav').getBoundingClientRect();return {top:r.top,bottom:r.bottom,height:r.height,barTop:bar.top,inView:r.top>=0&&r.bottom<=innerHeight,overlap:r.bottom>bar.top&&r.top<bar.bottom};});
    expect(geometry.inView,`lesson action should be fully reachable at ${width}px: ${JSON.stringify(geometry)}`).toBe(true);
    expect(geometry.overlap,`bottom navigation must not cover lesson actions at ${width}px: ${JSON.stringify(geometry)}`).toBe(false);
   }
  }
  if(width===390){
   const pickerForFill=page.locator('.js-ex-menu');
   if(await pickerForFill.isVisible()&&await pickerForFill.getAttribute('aria-expanded')!=='true')await pickerForFill.click();
   await page.locator('.ex-chip[data-go="3"]').click();
   const fill=page.locator('.exq[data-idx="3"]:visible');await fill.locator('.js-in').fill('sono');await fill.locator('.js-check').click();
   await expect(fill).toHaveClass(/exq--ok/);await expect(fill.locator('.fb--ok.is-on')).toBeVisible();
   await page.waitForFunction(()=>!document.body.classList.contains('is-mobile-field-focused'));
   const feedbackGeometry=await page.evaluate(()=>({feedback:document.querySelector('.exq[data-idx="3"]:not([hidden])').getBoundingClientRect(),barHeight:document.querySelector('.bottom-nav').getBoundingClientRect().height,height:innerHeight}));
   expect(feedbackGeometry.feedback.bottom,`answer feedback must clear the bottom bar`).toBeLessThanOrEqual(feedbackGeometry.height-feedbackGeometry.barHeight);
   await page.locator('.js-ex-next').click();await expect(page.locator('.exq:visible')).toHaveAttribute('data-idx','4');
   await page.locator('.js-ex-prev').click();await expect(page.locator('.exq:visible')).toHaveAttribute('data-idx','3');
  }
 }
});

test('CILS results keep skill labels and values readable as mobile records',async({page})=>{
 await page.setViewportSize({width:390,height:900});
 await page.addInitScript(()=>localStorage.setItem('linguai.italiano.v2',JSON.stringify({schema:2,onboarded:true,settings:{lang:'ar',autoplay:false}})));
 await page.goto('/index.html#/esame');await ready(page);await page.locator('.js-start').first().click();
 for(let i=0;i<4;i++){if(await page.locator('.js-text').count())await page.locator('.js-text').fill('نص تجريبي باللغة الإيطالية');await page.locator('.js-next').click();}
 await expect(page.locator('.js-said')).toBeVisible();await page.locator('.js-next').click();
 const table=page.locator('.cils-tab[data-mobile-layout="records"]');await expect(table).toBeVisible();
 expect(await page.locator('.cils-tab tr').count()).toBe(4);
 await expect(table.locator('td bdi[dir="ltr"]')).toHaveCount(2);
 expect(await table.locator('td bdi').first().evaluate(e=>getComputedStyle(e).direction)).toBe('ltr');
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1)).toBe(true);
 await table.scrollIntoViewIfNeeded();await capture(page,'cils-results-390');
 const labels=await page.locator('.cils-tab th').allTextContents();expect(labels.length).toBe(4);expect(labels.every(x=>x.trim().length>0)).toBe(true);
});
