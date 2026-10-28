const {test,expect}=require('@playwright/test');
const fs=require('node:fs'),path=require('node:path');
const AXE=fs.readFileSync(require.resolve('axe-core/axe.min.js'),'utf8');
for(const width of [320,390,1440])for(const theme of ['light','dark'])test('RED VR public assets, theme, footer and links '+width+' '+theme,async({page,request})=>{
 const errors=[];page.on('pageerror',e=>errors.push(e.message));await page.setViewportSize({width,height:900});await page.addInitScript(AXE);await page.addInitScript(t=>localStorage.setItem('linguai.italiano.v2',JSON.stringify({schema:2,settings:{lang:'ar',theme:t}})),theme);
 await page.route('**/api/auth/session',r=>r.fulfill({status:200,contentType:'application/json',body:'{"authenticated":false}'}));await page.goto('/index.html#/home');await expect(page.locator('#guest-title')).toBeVisible();await page.evaluate(()=>document.fonts.ready);
 const head=page.locator('.guest-header>.guest-brand');await expect(head).toHaveAccessibleName('Vita Reale');await expect(head).toHaveAttribute('href','#/home');await expect(head.locator('.brand-logo--'+theme)).toBeVisible();await expect(head.locator('.brand-logo--'+(theme==='dark'?'light':'dark'))).toBeHidden();
 for(const image of await page.locator('.brand-logo:visible').all())expect(await image.evaluate(i=>i.complete&&i.naturalWidth>0&&Math.abs(i.width/i.height-i.naturalWidth/i.naturalHeight)<.1)).toBe(true);
 const foot=page.locator('.guest-brand--footer');await expect(foot).toHaveAccessibleName('Vita Reale');await expect(foot.locator('.brand-logo:visible')).toHaveCount(1);await expect(foot.locator('.brand-logo--'+(width<480?'compact':'tagline')+'.brand-logo--'+theme)).toBeVisible();
 await head.focus();expect(await head.evaluate(e=>getComputedStyle(e).outlineStyle)).toBe('solid');await head.press('Enter');await expect(page).toHaveURL(/#\/home$/);
 for(const f of ['assets/branding/header_public_light.svg','assets/branding/header_learning_dark.svg','assets/branding/footer_light.svg','assets/branding/footer_dark.svg','assets/icons/favicon.svg','assets/icons/favicon.ico','assets/icons/icon-180.png','assets/icons/icon-192.png','assets/icons/icon-512.png','assets/icons/icon-maskable-192.png','assets/icons/icon-maskable-512.png','assets/marketing/social.png']){const r=await request.get('/'+f);expect(r.status(),f).toBe(200);expect((await r.body()).length).toBeGreaterThan(0);}
 expect((await request.get('/data/core/a1-01.js')).status()).toBe(401);expect((await request.get('/audio/12/12f482a3fb75c0e6.mp3')).status()).toBe(401);
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1)).toBe(true);expect(await page.evaluate(async()=>(await window.axe.run(document,{runOnly:{type:'tag',values:['wcag2a','wcag2aa','wcag21aa']}})).violations.map(v=>v.id))).toEqual([]);
 if(process.env.BRAND_KIT_DIR){await page.screenshot({path:path.join(process.env.BRAND_KIT_DIR,'home-'+width+'-'+theme+'.png')});await foot.scrollIntoViewIfNeeded();await page.screenshot({path:path.join(process.env.BRAND_KIT_DIR,'footer-'+width+'-'+theme+'.png')});}
 await foot.click();await expect(page).toHaveURL(/#\/home$/);await page.locator('.js-guest-language').selectOption('en');await expect(page.locator('html')).toHaveAttribute('dir','ltr');await expect(head).toHaveAccessibleName('Vita Reale');await page.locator('.js-guest-language').selectOption('ar');await expect(page.locator('html')).toHaveAttribute('dir','rtl');
 expect(errors).toEqual([]);
});

test('RED VR public artwork survives offline without caching private course bytes',async({page,context})=>{
 await page.addInitScript(()=>localStorage.setItem('linguai.italiano.v2',JSON.stringify({schema:2,settings:{lang:'ar',theme:'dark'}})));
 await page.route('**/api/auth/session',r=>r.fulfill({status:200,contentType:'application/json',body:'{"authenticated":false}'}));
 await page.goto('/index.html#/home');await expect(page.locator('#guest-title')).toBeVisible();
 await page.waitForFunction(()=>navigator.serviceWorker.controller);
 const files=['assets/branding/header_public_light.svg','assets/branding/header_learning_dark.svg','assets/branding/footer_light.svg','assets/branding/footer_dark.svg','assets/icons/favicon.svg','assets/icons/favicon.ico','assets/icons/icon-180.png','assets/icons/icon-192.png','assets/icons/icon-512.png','assets/icons/icon-maskable-192.png','assets/icons/icon-maskable-512.png','assets/marketing/social.png','assets/css/branding.css'];
 expect(await page.evaluate(async names=>(await Promise.all(names.map(f=>caches.match(f)))).every(Boolean),files)).toBe(true);
 expect(await page.evaluate(async()=>(await Promise.all((await caches.keys()).map(async k=>(await (await caches.open(k)).keys()).map(r=>new URL(r.url).pathname)))).flat().filter(p=>/^\/(audio\/|data\/(?!i18n\/ui-))/.test(p)))).toEqual([]);
 await context.setOffline(true);await page.reload();await expect(page.locator('#guest-title')).toBeVisible();
 expect(await page.locator('.guest-header .brand-logo--dark').evaluate(i=>i.complete&&i.naturalWidth===1050)).toBe(true);await expect(page.locator('#rail')).toBeHidden();
 expect(await page.evaluate(async()=>{try{await fetch('/data/core/a1-01.js');return 'leaked';}catch{return 'blocked';}})).toBe('blocked');
});
