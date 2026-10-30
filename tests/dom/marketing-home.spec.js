const {test,expect}=require('@playwright/test');
const fs=require('node:fs');
const AXE=fs.readFileSync(require.resolve('axe-core/axe.min.js'),'utf8');
let server,base;
test.beforeAll(async()=>{const {serwer}=await import('../../scripts/serve.mjs');server=serwer();await new Promise(r=>server.listen(0,'localhost',r));base='http://localhost:'+server.address().port;});
test.afterAll(async()=>{await new Promise(r=>server.close(r));});
async function open(browser,width){const c=await browser.newContext({viewport:{width,height:900},reducedMotion:'reduce'});await c.addInitScript(AXE);const p=await c.newPage();await p.route('**/api/auth/session',r=>r.fulfill({status:401,contentType:'application/json',body:'{"authenticated":false}'}));await p.goto(base+'/index.html');await expect(p.locator('#guest-title')).toBeVisible();await p.waitForFunction(()=>Account.snapshot().checked);return {c,p};}
for(const width of [390,1440])test('Arabic marketing, direct WhatsApp request, privacy and language switching at '+width,async({browser})=>{
 const {c,p}=await open(browser,width);const requests=[],errors=[];p.on('request',r=>requests.push(r.url()));p.on('pageerror',e=>errors.push(e.message));
 try{
  await expect(p.locator('.guest-brand').first()).toHaveAccessibleName('Vita Reale');await expect(p.locator('.guest-price')).toContainText('9.99');await expect(p.locator('.guest-level')).toHaveCount(5);await expect(p.locator('#rail')).toBeHidden();
  await expect(p.locator('.guest-whatsapp-alternative')).toHaveCount(0); // The legacy WhatsApp primary remains unduplicated while online billing is unavailable.
  for(const img of await p.locator('.guest-page img').all())expect(await img.evaluate(i=>i.complete&&i.naturalWidth>0)).toBe(true);
  expect(requests.some(u=>u.includes('wa.me'))).toBe(false);
  for(const link of await p.locator('.guest-subscribe').all()){
   const url=new URL(await link.getAttribute('href'));expect(url.origin+url.pathname).toBe('https://wa.me/393517015376');expect(url.searchParams.get('text')).toContain('9.99');expect(url.searchParams.get('text')).toContain('التفعيل اليدوي');expect(await link.getAttribute('rel')).toBe('noopener noreferrer');expect(await link.getAttribute('referrerpolicy')).toBe('no-referrer');expect([...url.searchParams.keys()]).toEqual(['text']);
  }
  // Exercise the actual outgoing navigation without contacting WhatsApp or sending a message.
  let sent;await c.route('https://wa.me/**',r=>{sent=r.request();return r.fulfill({status:200,contentType:'text/html',body:'<!doctype html><title>Synthetic contact destination</title>'});});
  const popupPromise=p.waitForEvent('popup');await p.locator('.guest-subscribe').first().click();const popup=await popupPromise;await popup.waitForLoadState();expect(popup.url()).toContain('https://wa.me/393517015376');expect(sent.headers().referer).toBeUndefined();expect(sent.method()).toBe('GET');await popup.close();expect(await p.evaluate(()=>Account.snapshot().authenticated)).toBe(false);await expect(p).not.toHaveURL(/wa.me/);
  await p.locator('.guest-faq summary').nth(2).click();await expect(p.locator('.guest-faq details').nth(2)).toHaveAttribute('open','');
  const audit=await p.evaluate(()=>window.axe.run(document.querySelector('#main'),{runOnly:{type:'tag',values:['wcag2a','wcag2aa','wcag21aa']}}));expect(audit.violations.map(v=>({id:v.id,nodes:v.nodes.map(n=>n.target)}))).toEqual([]);
  expect(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);expect(await p.locator('.guest-italian').first().evaluate(e=>getComputedStyle(e).direction)).toBe('ltr');
  await expect(p.locator('.js-guest-language,#langToggle,#langList')).toHaveCount(0);const subscriptionHref=await p.locator('.guest-subscribe').first().getAttribute('href');await p.evaluate(()=>App.applyLang('en'));await expect(p.locator('#guest-title')).toContainText('تعلّم');await expect(p.locator('html')).toHaveAttribute('lang','ar');await expect(p.locator('html')).toHaveAttribute('dir','rtl');await expect(p.locator('.guest-subscribe').first()).toHaveAttribute('href',subscriptionHref);const normalized=new URL(subscriptionHref);expect(normalized.searchParams.get('text')).toContain('9.99');expect(normalized.searchParams.get('text')).toContain('التفعيل اليدوي');
  expect(requests.filter(u=>/\/(data\/(?!i18n\/ui-)|audio\/)/.test(new URL(u).pathname))).toEqual([]);expect(requests.some(u=>u.includes('/api/subscription'))).toBe(false);expect(errors).toEqual([]);
 }finally{await c.close();}
});
for(const width of [320,375,430,768])test('public responsive bounds and tap targets at '+width,async({browser})=>{const {c,p}=await open(browser,width);try{expect(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);for(const btn of await p.locator('.guest-subscribe,.guest-cta').all()){const b=await btn.boundingBox();expect(b.width).toBeGreaterThanOrEqual(44);expect(b.height).toBeGreaterThanOrEqual(44);expect(b.x).toBeGreaterThanOrEqual(0);expect(b.x+b.width).toBeLessThanOrEqual(width);}await p.emulateMedia({reducedMotion:'reduce'});expect(await p.locator('.guest-subscribe').first().evaluate(e=>getComputedStyle(e).transitionDuration)).toBe('0s');}finally{await c.close();}});
test('marketing assets, private files and server source obey the static/server boundary',async({request})=>{for(const f of ['vita-italia.svg','learning-desk.svg','social.png'])expect((await request.get(base+'/assets/marketing/'+f)).status()).toBe(200);expect((await request.get(base+'/data/core/a1-01.js')).status()).toBe(401);expect((await request.get(base+'/server/database.cjs')).status()).toBe(404);});
