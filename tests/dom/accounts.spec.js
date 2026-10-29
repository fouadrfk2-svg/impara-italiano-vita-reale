const {test,expect}=require('@playwright/test');
const fs=require('node:fs'),http=require('node:http');
const helper=require('../helpers/pilot-account.cjs');
const {createHandler}=require('../../server/account-api.cjs');
const AXE=fs.readFileSync(require.resolve('axe-core/axe.min.js'),'utf8');
let db,server,base,previous;
const routes={'/api/auth/redeem':'auth/redeem','/api/auth/session':'auth/session','/api/auth/logout':'auth/logout','/api/progress':'learner/progress','/api/admin/login':'admin/login','/api/admin/session':'admin/session','/api/admin/logout':'admin/logout','/api/admin/list':'admin/list','/api/admin/operation':'admin/operation'};
test.beforeAll(async()=>{
 previous=process.env.PILOT_AUTH_SECRET;process.env.PILOT_AUTH_SECRET='A'.repeat(43);db=await helper.createDatabase();
 const {serwer}=await import('../../scripts/serve.mjs'),staticServer=serwer({accountRun:helper.runtime(db)}),run=helper.runtime(db);
 server=http.createServer((req,res)=>{const route=routes[new URL(req.url,'http://localhost').pathname];if(route)return createHandler(route,{run})(req,res);staticServer.emit('request',req,res);});
 await new Promise(r=>server.listen(0,'localhost',r));base='http://localhost:'+server.address().port;
});
test.beforeEach(async()=>{await helper.rollback(db);await helper.begin(db);});
test.afterAll(async()=>{await new Promise(r=>server.close(r));await helper.rollback(db);await db.close();if(previous===undefined)delete process.env.PILOT_AUTH_SECRET;else process.env.PILOT_AUTH_SECRET=previous;});
async function ready(page,route='account'){if(!page.__accountAxe){await page.addInitScript(AXE);await page.addInitScript(()=>{delete window.SpeechRecognition;delete window.webkitSpeechRecognition;});page.__accountAxe=true;}await page.goto(base+'/index.html#/'+route);await page.waitForFunction(()=>window.Core&&window.Account&&document.querySelector('#main h1'));}
async function audit(page){expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1)).toBe(true);expect(await page.evaluate(async()=>(await window.axe.run(document,{runOnly:{type:'tag',values:['wcag2a','wcag2aa','wcag21aa']}})).violations.map(v=>({id:v.id,targets:v.nodes.map(n=>n.target)})))).toEqual([]);}
async function adminLogin(page){await ready(page,'admin');await page.locator('#pilot-admin-key').fill(helper.ADMIN_KEY);await page.locator('.js-admin-login').click();await expect(page.locator('.js-issue')).toBeVisible();}
async function issue(page){await page.locator('.js-issue').click();await expect(page.locator('#pilot-issued-code')).toBeVisible();return await page.locator('#pilot-issued-code').inputValue();}
async function login(page,code){await ready(page);await page.locator('#pilot-code').fill(code);await page.locator('.js-login').click();await page.waitForFunction(()=>Account.snapshot().authenticated&&document.documentElement.dataset.access==='learner');await page.evaluate(()=>App.go('account'));await expect(page.locator('.js-logout')).toBeVisible();}
async function saved(page){await expect(page.locator('[data-account-status]')).toContainText('تم حفظ');await page.waitForFunction(()=>window.Account.snapshot().status==='saved'&&!window.Account.snapshot().active.pending);}
async function lesson(page){
 // Direct test navigation must wait for the lazy level and its answer overlays, not the truthy 'loading' marker.
 await page.evaluate(()=>new Promise(resolve=>Core.loadLevelData('A1',resolve)));
 await page.waitForFunction(()=>Core.registry.loaded.A1===true);
 await page.evaluate(()=>App.go('lezione',{id:'a1-u01-l1'}));await page.waitForFunction(()=>window.Core.registry.loaded.A1===true&&document.querySelector('.exq'));
 await page.evaluate(()=>{Core.state.settings.autoplay=false;Core.save();});
 for(let i=0;i<9;i++){
  await page.locator('.ex-chip[data-go="'+i+'"]').click();const current=page.locator('.exq:not([hidden])');
  if(i<2)await current.locator('[data-orig="1"]').click();
  if(i===2){const forms=['sono','sei','è','siamo','siete','sono'];for(let p=0;p<forms.length;p++)await current.locator('.js-cell').nth(p).fill(forms[p]);}
  if(i===3)await current.locator('.js-in').fill('sono');if(i===4)await current.locator('.js-in').fill('Sono dalla Polonia');
  if(i===5)for(const word of ['Un','caffè','e','un','cornetto,','per','favore'])await current.locator('.js-bank').getByRole('button',{name:word,exact:true}).first().click();
  if(i===6)for(let p=0;p<4;p++){await current.locator('.js-l [data-i="'+p+'"]').click();await current.locator('.js-r [data-i="'+p+'"]').click();}
  if(i===7)await current.locator('.js-in').fill('Buonasera, un cappuccino per favore.');if(i===8)await current.locator('.js-in').fill('Buongiorno, un caffè per favore.');
  if(i!==6)await current.locator('.js-check').click();await expect(current).toHaveClass(/exq--ok/);
 }
 await expect(page.locator('.summary__score')).toHaveText('100%');await page.evaluate(()=>App.go('account'));await saved(page);
}
for(const width of [390,1440])test.describe('Integrated Arabic pilot accounts '+width,()=>{
 test.use({viewport:{width,height:920},locale:'ar',storageState:{cookies:[],origins:[]}});
 test('Admin logout is prominent, Arabic, and invalidates the server session',async({browser})=>{
  const context=await browser.newContext({viewport:{width,height:920},locale:'ar'}),page=await context.newPage();
  try{
   await adminLogin(page);
   const logout=page.getByRole('button',{name:'تسجيل الخروج',exact:true});
   await expect(logout).toBeVisible();
   expect(await logout.evaluate(button=>button.closest('.account-session-actions')!==null)).toBe(true);
   await logout.click();
   await expect(page.locator('#pilot-admin-key')).toBeVisible();
   expect(await page.evaluate(async()=>{try{await Account.request('admin/list');return 200;}catch(error){return error.status;}})).toBe(401);
   expect((await page.evaluate(()=>Account.request('admin/session'))).authenticated).toBe(false);
   await audit(page);
  }finally{await context.close();}
 });
 test('Admin issuance → all nine original exercises → second device → revocation, with no URL leakage',async({browser})=>{
  const contexts=[];async function page(){const c=await browser.newContext({viewport:{width,height:920},locale:'ar'});contexts.push(c);return await c.newPage();}
  const admin=await page(),a=await page(),b=await page(),errors=[],urls=[];
  for(const p of [admin,a,b]){p.on('pageerror',e=>errors.push(e.message));p.on('request',r=>urls.push(r.url()));}
  try{
   await adminLogin(admin);const code=await issue(admin);await audit(admin);await login(a,code);await audit(a);
   const cookies=await a.context().cookies();expect(cookies.some(c=>c.name==='__Host-vita_pilot'&&c.httpOnly&&c.secure&&c.sameSite==='Strict')).toBe(true);expect(await a.evaluate(()=>document.cookie)).not.toContain('__Host-vita_pilot');
   await lesson(a);await a.locator('.js-logout').click();await expect(a.locator('.guest-page')).toBeVisible();
   await login(b,code);expect(await b.evaluate(()=>Core.state.lessons['a1-u01-l1'].best)).toBe(1);expect(await b.evaluate(()=>Core.state.srs.grazie.tr.ar)).toBe('شكرًا');
   await b.reload();await expect(b.locator('.js-logout')).toBeVisible();expect(await b.evaluate(()=>Core.state.lessons['a1-u01-l1'].done)).toBe(true);await audit(b);
   const learnerId=await b.evaluate(()=>Account.snapshot().active.id);await admin.locator('.js-admin-refresh').click();const card=admin.locator('.account-record').filter({hasText:learnerId}).filter({has:admin.locator('[data-action="revoke_access"]')});
   admin.once('dialog',d=>d.accept());await card.locator('[data-action="revoke_access"]').click();await expect(admin.locator('.js-issue')).toBeEnabled();await b.locator('.js-sync').click();await expect(b.locator('.guest-page')).toBeVisible();expect(await b.evaluate(()=>Account.snapshot().authenticated)).toBe(false);
   expect(urls.every(u=>!u.includes(code)&&!u.includes('Buongiorno%2C')&&!u.includes('Sono%20dalla'))).toBe(true);expect(errors).toEqual([]);
   const locals=await b.evaluate(()=>JSON.stringify(localStorage));expect(locals).not.toContain(code);expect(locals).not.toContain(helper.ADMIN_KEY);
  }finally{await Promise.allSettled(contexts.map(c=>c.close()));}
 });
 test('anonymous progress requires opt-in; offline edits survive reload and sync after reconnect',async({browser})=>{
  const adminContext=await browser.newContext({viewport:{width,height:920}}),context=await browser.newContext({viewport:{width,height:920}}),admin=await adminContext.newPage(),page=await context.newPage();
  try{
   await adminLogin(admin);const code=await issue(admin);await ready(page);await page.evaluate(()=>{Core.state.lessons['a1-u01-l2']={done:true,score:7,total:9,best:7/9,attempts:1};Core.state.writing['w-a2-giornata']={text:'Versione anonima.'};Core.save();});
   await login(page,code);expect(await page.evaluate(()=>Core.state.lessons['a1-u01-l2'])).toBeUndefined();await expect(page.locator('.js-import')).toBeVisible();await page.locator('.js-import').click();
   // Import may require review of independently changed default fields; the backup remains local.
   if(await page.locator('.js-resolve').isVisible())await page.locator('.js-resolve').click();await saved(page);expect(await page.evaluate(()=>Core.state.lessons['a1-u01-l2'].done)).toBe(true);
   await context.setOffline(true);await page.evaluate(()=>{Core.state.writing['w-a2-giornata']={text:'Bozza offline privata.'};Core.save();});await page.waitForFunction(()=>Account.snapshot().active.pending);
   await page.reload();await page.waitForFunction(()=>window.Account&&window.Core);expect(await page.evaluate(()=>Core.state.writing['w-a2-giornata'].text)).toBe('Bozza offline privata.');
   await context.setOffline(false);await page.evaluate(()=>window.dispatchEvent(new Event('online')));await page.evaluate(()=>App.go('account'));await saved(page);await audit(page);
   await page.locator('.js-logout').click();await expect(page.locator('.guest-page')).toBeVisible();expect(await page.evaluate(()=>Core.state.writing['w-a2-giornata'].text)).toBe('Versione anonima.');
  }finally{await context.close();await adminContext.close();}
 });
 test('conflicting drafts keep the newer account version and a recoverable local backup',async({browser})=>{
  const contexts=[];async function page(){const c=await browser.newContext({viewport:{width,height:920}});contexts.push(c);return await c.newPage();}
  const admin=await page(),a=await page(),b=await page();
  try{
   await adminLogin(admin);const code=await issue(admin);await login(a,code);
   await a.evaluate(()=>{Core.state.writing['w-a2-giornata']={text:'Bozza iniziale.'};Core.save();});await saved(a);await login(b,code);
   await a.context().setOffline(true);await a.evaluate(()=>{Core.state.writing['w-a2-giornata']={text:'Bozza locale non inviata.'};Core.save();});
   await b.evaluate(()=>{Core.state.writing['w-a2-giornata']={text:'Versione recente del secondo dispositivo.'};Core.save();});await saved(b);
   await a.context().setOffline(false);await a.evaluate(()=>Account.refresh());await a.evaluate(()=>App.go('account'));await expect(a.locator('.js-resolve')).toBeVisible();
   expect(await a.evaluate(()=>{var id=Account.snapshot().active.id;return JSON.parse(localStorage.getItem('vita.pilot.account.'+id)).conflictBackup.writing['w-a2-giornata'].text;})).toBe('Bozza locale non inviata.');
   expect(await b.evaluate(()=>Core.state.writing['w-a2-giornata'].text)).toBe('Versione recente del secondo dispositivo.');
   await a.locator('.js-resolve').click();await saved(a);expect(await a.evaluate(()=>Core.state.writing['w-a2-giornata'].text)).toBe('Versione recente del secondo dispositivo.');await audit(a);
  }finally{await Promise.allSettled(contexts.map(c=>c.close()));}
 });
 test('a lost save acknowledgement never duplicates a review or earned points',async({browser})=>{
  const adminContext=await browser.newContext({viewport:{width,height:920}}),context=await browser.newContext({viewport:{width,height:920}}),admin=await adminContext.newPage(),page=await context.newPage();
  try{
   await adminLogin(admin);const code=await issue(admin);await login(page,code);let lost=false,acknowledge;const committed=new Promise(resolve=>acknowledge=resolve);
   await page.route('**/api/progress',async route=>{if(route.request().method()==='POST'&&!lost){lost=true;const response=await route.fetch();expect(response.status()).toBe(200);await route.abort('failed');acknowledge();}else await route.continue();});
   const expected=await page.evaluate(()=>{const event={k:'ciao',t:Date.now(),q:4};Core.state.reviews.push(event);Core.state.xp+=3;Core.save();return {event,xp:Core.state.xp};});
   await committed;await page.waitForFunction(()=>Account.snapshot().status==='offline');await expect(page.locator('.guest-page')).toBeVisible();await page.evaluate(()=>Account.refresh());await page.evaluate(()=>App.go('account'));await saved(page);
   const restored=await page.evaluate(async()=>{const r=await Account.request('progress');return {reviews:r.state.reviews,xp:r.state.xp};});expect(restored.reviews).toEqual([expected.event]);expect(restored.xp).toBe(expected.xp);expect(await page.evaluate(()=>Core.state.reviews.length)).toBe(1);await audit(page);
  }finally{await context.close();await adminContext.close();}
 });
 test('anonymous edits made during a delayed sign-in remain separate and recoverable',async({browser})=>{
  const adminContext=await browser.newContext({viewport:{width,height:920}}),context=await browser.newContext({viewport:{width,height:920}}),admin=await adminContext.newPage(),page=await context.newPage();
  try{
   await adminLogin(admin);const code=await issue(admin);await ready(page);let release,arrived;const waiting=new Promise(resolve=>arrived=resolve),gate=new Promise(resolve=>release=resolve);
   await page.route('**/api/progress',async route=>{if(route.request().method()==='GET'){arrived();await gate;}await route.continue();});
   await page.locator('#pilot-code').fill(code);await page.locator('.js-login').click();await waiting;
   await page.evaluate(()=>{Core.state.writing['w-a2-giornata']={text:'Bozza anonima durante accesso.'};Core.save();});release();
   await page.waitForFunction(()=>Account.snapshot().authenticated&&document.documentElement.dataset.access==='learner');await page.evaluate(()=>App.go('account'));await expect(page.locator('.js-logout')).toBeVisible();expect(await page.evaluate(()=>Core.state.writing['w-a2-giornata'])).toBeUndefined();
   await page.locator('.js-logout').click();await expect(page.locator('.guest-page')).toBeVisible();expect(await page.evaluate(()=>Core.state.writing['w-a2-giornata'].text)).toBe('Bozza anonima durante accesso.');
  }finally{await context.close();await adminContext.close();}
 });
 test('language preferences and voice/AI consent remain device-local through reload and account sync',async({browser})=>{
  const adminContext=await browser.newContext({viewport:{width,height:920}}),aContext=await browser.newContext({viewport:{width,height:920}}),bContext=await browser.newContext({viewport:{width,height:920}});
  const admin=await adminContext.newPage(),a=await aContext.newPage(),b=await bContext.newPage();
  try{
   await adminLogin(admin);const code=await issue(admin);await login(a,code);await saved(a);
   await a.evaluate(async()=>{Core.state.settings.lang='en';Core.state.settings.sttConsent=true;Core.state.settings.llmConsent=true;Core.save();await new Promise(resolve=>Core.setLanguage('en',resolve));I18n.set('en');App.go('account');});
   await a.reload();await expect(a.locator('.js-logout')).toBeVisible();await expect(a.locator('html')).toHaveAttribute('lang','ar');await expect(a.locator('html')).toHaveAttribute('dir','rtl');expect(await a.evaluate(()=>Core.state.settings.lang)).toBe('ar');expect(await a.evaluate(()=>Core.state.settings.sttConsent)).toBe(true);
   await login(b,code);await expect(b.locator('html')).toHaveAttribute('dir','rtl');expect(await b.evaluate(()=>Core.state.settings.sttConsent)).toBe(false);expect(await b.evaluate(()=>Core.state.settings.llmConsent)).not.toBe(true);
   await a.evaluate(async()=>{Core.state.settings.lang='ar';Core.save();await new Promise(resolve=>Core.setLanguage('ar',resolve));I18n.set('ar');App.go('account');});await expect(a.locator('html')).toHaveAttribute('dir','rtl');await audit(a);
   expect(await a.evaluate(()=>document.querySelector('#main form'))).toBe(null);
  }finally{await Promise.allSettled([adminContext.close(),aContext.close(),bContext.close()]);}
 });
});
