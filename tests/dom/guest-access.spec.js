const {test,expect}=require('@playwright/test');
const fs=require('node:fs'),http=require('node:http');
const helper=require('../helpers/pilot-account.cjs'),{createHandler}=require('../../server/account-api.cjs');
const AXE=fs.readFileSync(require.resolve('axe-core/axe.min.js'),'utf8');
let db,server,base,previous;
const routes={'/api/auth/redeem':'auth/redeem','/api/auth/session':'auth/session','/api/auth/logout':'auth/logout','/api/progress':'learner/progress','/api/admin/login':'admin/login','/api/admin/session':'admin/session','/api/admin/logout':'admin/logout','/api/admin/list':'admin/list','/api/admin/operation':'admin/operation'};
test.beforeAll(async()=>{
 previous=process.env.PILOT_AUTH_SECRET;process.env.PILOT_AUTH_SECRET='A'.repeat(43);db=await helper.createDatabase();
 const run=helper.runtime(db),{serwer}=await import('../../scripts/serve.mjs'),staticServer=serwer({accountRun:run});
 server=http.createServer((req,res)=>{const route=routes[new URL(req.url,'http://localhost').pathname];if(route)return createHandler(route,{run})(req,res);staticServer.emit('request',req,res);});
 await new Promise(r=>server.listen(0,'localhost',r));base='http://localhost:'+server.address().port;
});
test.beforeEach(async()=>{await helper.rollback(db);await helper.begin(db);});
test.afterAll(async()=>{await new Promise(r=>server.close(r));await helper.rollback(db);await db.close();if(previous===undefined)delete process.env.PILOT_AUTH_SECRET;else process.env.PILOT_AUTH_SECRET=previous;});
async function context(browser,width){const c=await browser.newContext({viewport:{width,height:900}});await c.addInitScript(AXE);return c;}
async function guest(page,hash=''){await page.goto(base+'/index.html'+hash);await expect(page.locator('.guest-page')).toBeVisible();await page.waitForFunction(()=>window.Account&&Account.snapshot().checked);}
async function code(){const admin=helper.client(db);expect((await admin.request('admin/login',{key:helper.ADMIN_KEY})).statusCode).toBe(200);return (await helper.issue(admin)).code;}
async function signIn(page,value){await page.evaluate(()=>App.go('account'));await page.locator('#pilot-code').fill(value);await page.locator('.js-login').click();await page.waitForFunction(()=>Account.snapshot().authenticated&&document.documentElement.dataset.access==='learner');}
async function audit(page){expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1)).toBe(true);expect(await page.evaluate(async()=>(await window.axe.run(document,{runOnly:{type:'tag',values:['wcag2a','wcag2aa','wcag21aa']}})).violations.map(v=>({id:v.id,targets:v.nodes.map(n=>n.target)})))).toEqual([]);}
for(const width of [390,1440])test.describe('guest and learner at '+width,()=>{
 test('fresh guest, stored progress, direct routes, language switching and no pre-auth content requests',async({browser})=>{
  const c=await context(browser,width),p=await c.newPage(),requests=[],errors=[];p.on('pageerror',e=>errors.push(e.message));p.on('request',r=>requests.push(new URL(r.url()).pathname));
  try{
   await c.addInitScript(()=>localStorage.setItem('linguai.italiano.v2',JSON.stringify({schema:2,settings:{lang:'ar'},lessons:{'a1-u01-l1':{done:true,total:9,score:9,best:1}},writing:{private:{text:'SYNTHETIC_PRIVATE_DRAFT'}}})));
   await guest(p);await expect(p.locator('#rail')).toBeHidden();await expect(p.locator('.bottom-nav')).toBeHidden();await expect(p.locator('#main')).not.toContainText('SYNTHETIC_PRIVATE_DRAFT');await audit(p);
   await p.evaluate(()=>App.go('privacy'));await expect(p.locator('#main h1')).toContainText('بيانات');await p.evaluate(()=>App.go('home'));
   for(const route of ['percorso','lezione?id=a1-u01-l1','ripasso','conversazione?id=bar-mattina','progressi','letture','scrittura','guida','unknown']){await p.evaluate(r=>{location.hash='#/'+r;},route);await expect(p.locator('.guest-page')).toBeVisible();await expect(p.locator('#rail')).toBeHidden();await expect(p.locator('.exq')).toHaveCount(0);}
   await p.locator('.js-guest-language').selectOption('en');await expect(p.locator('#guest-title')).toContainText('Learn with confidence');expect(await p.locator('html').getAttribute('dir')).toBe('ltr');await audit(p);
   await p.locator('.js-guest-language').selectOption('ar');expect(await p.locator('html').getAttribute('dir')).toBe('rtl');await expect(p.locator('#guest-title')).toContainText('تعلّم');
   expect(requests.filter(s=>/^\/(data\/(?!i18n\/ui-)|audio\/)/.test(s))).toEqual([]);expect(errors).toEqual([]);expect(await p.evaluate(()=>Core.state.lessons['a1-u01-l1'].done)).toBe(true);
  }finally{await c.close();}
 });
 test('invalid code, verified fallback/retry, intended lesson, reload, private delivery, saved progress and logout',async({browser})=>{
  const c=await context(browser,width),p=await c.newPage(),errors=[];p.on('pageerror',e=>errors.push(e.message));
  let failTranslation=true;await p.route('**/data/i18n/ar/conversations.js',route=>failTranslation?route.abort('failed'):route.continue());
  try{
   await guest(p,'#/lezione?id=a1-u01-l1');await p.locator('.guest-cta').click();await p.locator('#pilot-code').fill('INVALID');await p.locator('.js-login').click();await expect(p.locator('[data-account-error]')).toBeVisible();expect(await p.evaluate(()=>Account.snapshot().authenticated)).toBe(false);
   const activation=await code();await signIn(p,activation);await expect(p.locator('.exq').first()).toBeVisible();await expect(p.locator('#main h1')).toBeVisible();expect(await p.evaluate(()=>LINGUAI.entryLanguage('ar','conv:bar-mattina'))).toBe('en');failTranslation=false;await p.evaluate(()=>App.applyLang('ar'));await p.waitForFunction(()=>LINGUAI.entryLanguage('ar','conv:bar-mattina')==='ar');await expect(p.locator('.exq').first()).toBeVisible();
   const privateResponse=await c.request.get(base+'/data/core/a1-01.js');expect(privateResponse.status()).toBe(200);expect(privateResponse.headers()['cache-control']).toContain('no-store');
   await p.evaluate(()=>{Core.recordLesson('a1-u01-l1',9,9,30);Core.state.writing.synthetic={text:'Bozza privata sintetica.'};Core.save();});await p.waitForFunction(()=>Account.snapshot().status==='saved'&&!Account.snapshot().active.pending);
   await p.reload();await p.waitForFunction(()=>document.documentElement.dataset.access==='learner');expect(await p.evaluate(()=>Core.state.writing.synthetic.text)).toBe('Bozza privata sintetica.');await expect(p.locator('.exq').first()).toBeVisible();await audit(p);
   await p.evaluate(()=>Account.suspend());await expect(p.locator('.js-guest-retry')).toBeVisible();await p.locator('.js-guest-retry').click();await p.waitForFunction(()=>document.documentElement.dataset.access==='learner');await expect(p).toHaveURL(/#\/lezione\?id=a1-u01-l1$/);await expect(p.locator('.exq').first()).toBeVisible();
   await p.evaluate(()=>App.go('account'));await expect(p.locator('.js-logout')).toBeVisible();await p.locator('.js-logout').click();await expect(p.locator('.guest-page')).toBeVisible();expect((await c.request.get(base+'/data/core/a1-01.js')).status()).toBe(401);
   expect(await p.evaluate(()=>Object.keys(localStorage).filter(k=>k.startsWith('vita.pilot.account.')).length)).toBe(1);expect(await p.evaluate(()=>JSON.stringify(localStorage))).not.toContain(activation);expect(p.url()).not.toContain(activation);await p.evaluate(()=>{Views.lezione({id:'a1-u01-l1'});Views.shell.set('SYNTHETIC_LATE_PRIVATE_CONTENT');});await expect(p.locator('#main')).not.toContainText('SYNTHETIC_LATE_PRIVATE_CONTENT');expect(errors).toEqual([]);await audit(p);
  }finally{await c.close();}
 });
 test('revoked learner closes the interface and cannot reload course data; Admin alone never unlocks learning',async({browser})=>{
  const c=await context(browser,width),p=await c.newPage();try{
   await guest(p);await p.evaluate(()=>App.go('admin'));await p.locator('#pilot-admin-key').fill(helper.ADMIN_KEY);await p.locator('.js-admin-login').click();await expect(p.locator('.js-issue')).toBeVisible();
   await p.evaluate(()=>App.go('percorso'));await expect(p.locator('.guest-page')).toBeVisible();expect((await c.request.get(base+'/data/core/a1-01.js')).status()).toBe(401);
   await signIn(p,await code());const learner=await p.evaluate(()=>Account.snapshot().active.id);const admin=helper.client(db);await admin.request('admin/login',{key:helper.ADMIN_KEY});expect((await admin.request('admin/operation',{action:'revoke_access',id:learner,requestId:crypto.randomUUID()})).statusCode).toBe(200);
   await p.evaluate(()=>Account.refresh());await expect(p.locator('.guest-page')).toBeVisible();await expect(p.locator('#rail')).toBeHidden();expect((await c.request.get(base+'/data/core/a1-01.js')).status()).toBe(401);await p.reload();await expect(p.locator('.guest-page')).toBeVisible();await audit(p);
  }finally{await c.close();}
 });
 test('expired learner session denies the shell and direct content',async({browser})=>{
  const learner=helper.client(db),activation=await code(),login=await learner.request('auth/redeem',{code:activation});expect(login.statusCode).toBe(200);
  const raw='E'.repeat(43),{mac}=require('../../server/account-api.cjs');
  await db.exec('SET LOCAL SESSION AUTHORIZATION vita_reale_test_owner');
  try{await db.query("INSERT INTO vita_pilot.sessions(learner_id,created_at,expires_at,token_hash,hash_key_version) VALUES($1::uuid,clock_timestamp()-interval '2 days',clock_timestamp()-interval '1 day',decode($2,'hex'),1)",[login.body.learnerId,mac('learner_session',raw)]);}finally{await db.exec('SET LOCAL SESSION AUTHORIZATION vita_pilot_app');}
  const c=await context(browser,width),p=await c.newPage();try{await c.addCookies([{name:'__Host-vita_pilot',value:raw,url:base.replace('http:','https:')+'/',httpOnly:true,secure:true,sameSite:'Strict'}]);await guest(p,'#/percorso');await expect(p.locator('#rail')).toBeHidden();expect((await c.request.get(base+'/data/core/a1-01.js')).status()).toBe(401);await audit(p);}finally{await c.close();}
 });
 test('delayed session never flashes protected UI, network failures fail closed and retry recovers',async({browser})=>{
  const c=await context(browser,width),p=await c.newPage();let release;const held=new Promise(r=>release=r);await p.route('**/api/auth/session',async route=>{await held;await route.abort('failed');});
  try{
   await p.goto(base+'/index.html#/progressi');await expect(p.locator('.guest-status')).toContainText('جارٍ');await expect(p.locator('#rail')).toBeHidden();await expect(p.locator('#main')).not.toContainText('XP');release();await expect(p.locator('.js-guest-retry')).toBeVisible();await audit(p);
   await p.unroute('**/api/auth/session');await p.locator('.js-guest-retry').click();await p.waitForFunction(()=>Account.snapshot().status==='local');await signIn(p,await code());await p.evaluate(()=>{Core.state.writing.synthetic={text:'Local offline backup.'};Core.save();});await c.setOffline(true);await p.evaluate(()=>window.dispatchEvent(new Event('offline')));await expect(p.locator('.guest-page')).toBeVisible();expect(await p.evaluate(()=>JSON.stringify(localStorage))).toContain('Local offline backup.');await p.reload();await expect(p.locator('.guest-page')).toBeVisible();await expect(p.locator('#rail')).toBeHidden();expect(await p.evaluate(()=>Core.registry.levels.length)).toBe(0);await c.setOffline(false);await p.evaluate(()=>window.dispatchEvent(new Event('online')));await p.waitForFunction(()=>document.documentElement.dataset.access==='learner');await expect(p.locator('.guest-page')).toHaveCount(0);
  }finally{release();await c.close();}
 });
});
test('private assets and API aliases deny anonymous callers; no content in service-worker caches',async({browser})=>{
 const c=await context(browser,390),p=await c.newPage();try{await guest(p);for(const path of ['/data/core/a1-01.js','/data/i18n/ar/a1-01.js','/data/audio-index.js','/assets/js/verbs-data.js','/assets/js/drills-lex.js','/audio/00/0000000000000000.mp3','/api/content?path=data/core/a1-01.js'])expect((await c.request.get(base+path)).status()).toBe(401);
 await p.evaluate(async()=>{await navigator.serviceWorker.register('/sw.js');await navigator.serviceWorker.ready;});const privateKeys=await p.evaluate(async()=>{const out=[];for(const k of await caches.keys())for(const r of await (await caches.open(k)).keys())if(window.Guest.isPrivatePath(new URL(r.url).pathname))out.push(r.url);return out;});expect(privateKeys).toEqual([]);
 }finally{await c.close();}
});

test('unverified cached profile keeps its backup without exposing it through the account screen',async({browser})=>{
 const c=await context(browser,390),p=await c.newPage();try{
  await c.addInitScript(()=>{const id='10000000-0000-4000-8000-000000000099',state={schema:2,settings:{lang:'ar'},writing:{private:{text:'SYNTHETIC_CACHED_PRIVATE_DRAFT'}}};localStorage.setItem('vita.pilot.profile',JSON.stringify({id}));localStorage.setItem('vita.pilot.account.'+id,JSON.stringify({id,state,base:{schema:2},revision:0,pending:true}));});
  await p.route('**/api/auth/session',r=>r.abort('failed'));await p.goto(base+'/index.html#/account');await expect(p.locator('#pilot-code')).toBeVisible();await expect(p.locator('.js-export')).toHaveCount(0);await expect(p.locator('#main')).not.toContainText('SYNTHETIC_CACHED_PRIVATE_DRAFT');await expect(p.locator('#rail')).toBeHidden();expect(await p.evaluate(()=>JSON.stringify(localStorage))).toContain('SYNTHETIC_CACHED_PRIVATE_DRAFT');await audit(p);
 }finally{await c.close();}
});

test('public sign-in navigation during startup verification stays in place and reports an invalid code',async({browser})=>{
 const c=await context(browser,390),p=await c.newPage();let release;const held=new Promise(r=>release=r);
 await p.route('**/api/auth/session',async route=>{await held;await route.continue();});
 try{await p.goto(base+'/index.html');await p.locator('.guest-cta').click();await p.locator('#pilot-code').fill('INVALID');await p.locator('.js-login').click();release();await expect(p.locator('[data-account-error]')).toBeVisible();await expect(p).toHaveURL(/#\/account$/);await expect(p.locator('#rail')).toBeHidden();expect(await p.evaluate(()=>Account.snapshot().authenticated)).toBe(false);}
 finally{release();await c.close();}
});
