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
   if(route==='progressi'&&width===390){expect(await page.locator('.progress-chart__day').count()).toBe(14);await page.evaluate(()=>{const node=document.querySelector('.progress-chart');window.scrollTo(0,node.getBoundingClientRect().top+window.scrollY-24);});await capture(page,'progress-390');}
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
