/* global window, document */
'use strict';
// Presentation tests explicitly model an already authenticated synthetic learner.
// Account/guest/security specs use Playwright directly and real SQL-backed handlers.
const base=require('@playwright/test');
const installed=new WeakSet();
async function prepare(context){
 if(installed.has(context))return;installed.add(context);let cloud=null,revision=0,offline=false;
 await context.addCookies([{name:'__Host-vita_pilot',value:'A'.repeat(43),url:'https://localhost:8123/',httpOnly:true,secure:true,sameSite:'Strict'}]);
 const setOffline=context.setOffline.bind(context);context.setOffline=async v=>{offline=v;return setOffline(v);};
 await context.route('**/api/**',async route=>{
  const request=route.request(),p=new URL(request.url()).pathname;
  if(!['/api/auth/session','/api/progress'].includes(p))return route.continue();
  if(offline)return route.abort('internetdisconnected');
  try {
  let body;
  if(p==='/api/auth/session'){
   // This fixture represents a returning learner, including explicit device consents.
   // Seed only synthetic browser data; authentication still comes from the mocked response.
   await request.frame().page().evaluate(()=>{
    const id='10000000-0000-4000-8000-000000000001';
    if(!localStorage.getItem('vita.pilot.profile')){
     const state=JSON.parse(JSON.stringify(window.Core.state));
     localStorage.setItem('vita.pilot.account.'+id,JSON.stringify({id,state,base:state,revision:0,pending:false,deviceSettings:state.settings}));
     localStorage.setItem('vita.pilot.profile',JSON.stringify({id}));
    }
   });
   body={authenticated:true,learnerId:'10000000-0000-4000-8000-000000000001',csrf:'a'.repeat(64),expiresAt:'2099-01-01T00:00:00.000Z'};
  }else{
   if(!cloud){cloud=await request.frame().page().evaluate(()=>JSON.parse(JSON.stringify(window.Core.state)));}
   if(request.method()==='POST'){cloud=request.postDataJSON().state;revision++;}
   else cloud=await request.frame().page().evaluate(()=>JSON.parse(JSON.stringify(window.Core.state)));
   body={state:cloud,revision};
  }
  await route.fulfill({status:200,contentType:'application/json',headers:{'Cache-Control':'no-store'},body:JSON.stringify(body)});
  } catch (error) {
   // Navigation cancels the old document's in-flight requests. Do not read its destroyed context.
   if(!/Execution context was destroyed|Frame was detached|Target page, context or browser has been closed|Target closed/.test(String(error.message)))throw error;
   await route.abort('aborted').catch(()=>{});
  }
 });
 function wrapPage(page){
  const go=page.goto.bind(page);page.goto=async(url,options)=>{const requestedPath=new URL(url,'http://localhost:8123').pathname;const response=await go(url,options);if(/\/(?:index\.html)?$/.test(requestedPath)&&((!options||!['commit','domcontentloaded'].includes(options.waitUntil))&&await page.locator('#rail').count()))await page.waitForFunction(()=>window.Account&&window.Account.snapshot().authenticated&&document.documentElement.dataset.access==='learner'&&window.Core.registry.levels.length>0&&Object.values(window.Core.registry.loaded).every(v=>v!=='loading'));return response;};
 }
 context.on('page',wrapPage);for(const p of context.pages())wrapPage(p);
}
const test=base.test.extend({
 browser:[async({browser},use)=>{
  const proxy=new Proxy(browser,{get(target,key){if(key==='newContext')return async options=>{const c=await target.newContext(options);await prepare(c);return c;};const v=Reflect.get(target,key);return typeof v==='function'?v.bind(target):v;}});await use(proxy);
 },{scope:'worker'}],
 context:async({context},use)=>{await prepare(context);await use(context);}
});
// Assert the exact HTTP contract requested by the media element, not just any 2xx.
async function expectAudioResponse(response){
 const headers=await response.allHeaders(),range=response.request().headers().range;
 base.expect(headers['content-type']).toContain('audio/mpeg');
 base.expect(headers['cache-control']).toContain('no-store');
 if(range){
  base.expect(response.status()).toBe(206);
  const requested=/^bytes=(\d+)-(\d*)$/.exec(range),actual=/^bytes (\d+)-(\d+)\/(\d+)$/.exec(headers['content-range']||'');
  base.expect(requested).not.toBeNull();base.expect(actual).not.toBeNull();
  const total=Number(actual[3]);base.expect(total).toBeGreaterThan(0);
  base.expect(Number(actual[1])).toBe(Number(requested[1]));
  base.expect(Number(actual[2])).toBe(requested[2]?Math.min(Number(requested[2]),total-1):total-1);
  base.expect(Number(headers['content-length'])).toBe(Number(actual[2])-Number(actual[1])+1);
 }else{base.expect(response.status()).toBe(200);base.expect(Number(headers['content-length'])).toBeGreaterThan(0);}
}
// Current private-delivery policy: shell/language controls survive offline, course bytes do not.
async function lockOfflineAndReconnect(page,context,files){
 for(const file of files)base.expect(await page.evaluate(async f=>!!await window.caches.match('data/i18n/ar/'+f),file)).toBe(false);
 await context.setOffline(true);await page.evaluate(()=>window.dispatchEvent(new Event('offline')));
 await base.expect(page.locator('.guest-page')).toBeVisible();await page.reload();
 await base.expect(page.locator('.guest-page')).toBeVisible();await base.expect(page.locator('#rail')).toBeHidden();
 base.expect(await page.evaluate(()=>window.Core.registry.levels.length)).toBe(0);
 base.expect(await page.evaluate(async()=>{try{await fetch('/data/core/a1-01.js');return 'leaked';}catch{return 'offline';}})).toBe('offline');
 await base.expect(page.locator('.js-guest-language,#langToggle,#langList')).toHaveCount(0);
 for(const requested of ['en','ar']){await page.evaluate(lang=>window.App.applyLang(lang),requested);await base.expect(page.locator('html')).toHaveAttribute('lang','ar');await base.expect(page.locator('html')).toHaveAttribute('dir','rtl');base.expect(await page.evaluate(()=>window.Core.state.settings.lang)).toBe('ar');}
 await context.setOffline(false);await page.evaluate(()=>window.Account.refresh());
 await page.waitForFunction(()=>document.documentElement.dataset.access==='learner');
 for(const file of files)base.expect(await page.evaluate(async f=>!!await window.caches.match('data/i18n/ar/'+f),file)).toBe(false);
}
module.exports={...base,test,expectAudioResponse,lockOfflineAndReconnect};
