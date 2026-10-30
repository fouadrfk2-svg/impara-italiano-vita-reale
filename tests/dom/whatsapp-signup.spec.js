const {test,expect}=require("@playwright/test");
const fs=require("node:fs");
const AXE=fs.readFileSync(require.resolve("axe-core/axe.min.js"),"utf8");
const message="مرحباً، أريد التسجيل في Vita Reale والدفع عبر واتساب. هل يمكنكم مساعدتي؟";
const whatsappUrl="https://wa.me/393517015376?text="+encodeURIComponent(message);
function json(route,body,status=200){return route.fulfill({status,contentType:"application/json",headers:{"Cache-Control":"no-store"},body:JSON.stringify(body)});}
async function configure(page,status){
 await page.addInitScript(AXE);
 await page.route("**/api/auth/session",route=>json(route,{authenticated:false},401));
 await page.route("**/api/billing/config",route=>json(route,{enabled:true,amountCents:999,currency:"eur",interval:"month",intervalCount:1}));
 await page.route("**/api/billing/status",route=>json(route,status||{authenticated:false}));
 await page.context().route("https://wa.me/**",route=>route.fulfill({status:200,contentType:"text/html",body:"<!doctype html><title>Synthetic WhatsApp destination</title>"}));
}
async function expectWhatsAppLink(link){
 await expect(link).toHaveAttribute("href",whatsappUrl);
 await expect(link).toHaveAttribute("target","_blank");
 await expect(link).toHaveAttribute("rel","noopener noreferrer");
 await expect(link).toHaveAttribute("referrerpolicy","no-referrer");
 await expect(link).toHaveAccessibleName("التسجيل والدفع عبر واتساب");
 const icon=link.locator("svg");
 await expect(icon).toHaveAttribute("aria-hidden","true");
 await expect(icon).toHaveAttribute("viewBox","0 0 24 24");
 await expect(icon.locator("path")).toHaveCount(1);
 await expect(icon.locator("path")).toHaveAttribute("fill","currentColor");
}

test("member email sign-in CTA has a clear accessible door icon",async({page})=>{
 await page.route("**/icon-fixture",route=>route.fulfill({status:200,contentType:"text/html",body:'<!doctype html><html lang="ar" dir="rtl"><body><main class="guest-page"><div class="guest-actions"><a class="btn btn--ghost guest-cta" href="#/account">الدخول بالكود</a></div></main></body></html>'}));
 await page.goto("/icon-fixture",{waitUntil:"domcontentloaded"});
 await page.addStyleTag({content:".guest-page{direction:rtl}.guest-page .btn{display:inline-flex;align-items:center;justify-content:center;gap:8px;min-height:50px;padding:12px 22px}.guest-page .guest-signin-icon{display:block;width:1.35rem;height:1.35rem;flex:0 0 auto;overflow:visible}"});
 await page.evaluate(()=>{window.Views={};window.fetch=async()=>({ok:true,json:async()=>({enabled:true})});window.__signinMarkupChanges=0;new MutationObserver(records=>{window.__signinMarkupChanges+=records.length;}).observe(document.querySelector(".guest-cta"),{childList:true,subtree:true});});
 await page.addScriptTag({content:fs.readFileSync("assets/js/billing.js","utf8")});
 await page.evaluate(()=>{window.Billing.upgradeGuest();return true;});
 const button=page.locator(".guest-cta"),icon=button.locator(".guest-signin-icon");
 await expect(button).toHaveAttribute("href","#/billing?signin=1");
 await expect(button).toHaveAccessibleName("تسجيل الدخول بالإيميل");
 await expect(icon).toHaveAttribute("viewBox","0 0 24 24");
 await expect(icon).toHaveAttribute("aria-hidden","true");
 await expect(icon.locator("path")).toHaveAttribute("stroke-width","2.2");
 await page.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));
 expect(await page.evaluate(()=>window.__signinMarkupChanges)).toBe(1);
 for(const width of [390,1440]){
  await page.setViewportSize({width,height:900});
  const buttonBounds=await button.boundingBox(),iconBounds=await icon.boundingBox();
  expect(buttonBounds.height).toBeGreaterThanOrEqual(44);expect(buttonBounds.x).toBeGreaterThanOrEqual(0);expect(buttonBounds.x+buttonBounds.width).toBeLessThanOrEqual(width);
  expect(iconBounds.width).toBeGreaterThanOrEqual(20);expect(Math.abs(iconBounds.width-iconBounds.height)).toBeLessThanOrEqual(0.5);
 }
});

test("online signup retains its primary billing route and offers a separate WhatsApp request at mobile and desktop",async({page})=>{
 await configure(page);
 const apiWrites=[];page.on("request",request=>{if(request.url().includes("/api/billing/")&&request.method()!=="GET")apiWrites.push(new URL(request.url()).pathname);});
 for(const width of [390,1440]){
  await page.setViewportSize({width,height:900});
  await page.goto("/index.html#/home",{waitUntil:"domcontentloaded"});
  await expect(page.locator("#guest-title")).toBeVisible();
  await expect.poll(()=>page.locator(".guest-whatsapp-marketing").count()).toBe(4);
  const primary=page.locator(".guest-subscribe").first(),option=page.locator(".guest-whatsapp-marketing").first(),link=option.locator(".guest-whatsapp-link");
  const memberSignIn=page.locator(".guest-cta").first(),signInIcon=memberSignIn.locator(".guest-signin-icon");
  await expect(primary).toHaveAttribute("href","#/billing");
  await expect(primary).toContainText("اشترك الآن");
  await expect(memberSignIn).toHaveAttribute("href","#/billing?signin=1");
  await expect(memberSignIn).toHaveAccessibleName("تسجيل الدخول بالإيميل");
  await expect(signInIcon).toHaveAttribute("viewBox","0 0 24 24");
  await expect(signInIcon).toHaveAttribute("aria-hidden","true");
  await expect(signInIcon.locator("path")).toHaveCount(1);
  const signInIconBounds=await signInIcon.boundingBox();expect(signInIconBounds.width).toBeGreaterThanOrEqual(20);expect(Math.abs(signInIconBounds.width-signInIconBounds.height)).toBeLessThanOrEqual(0.5);
  await expect(option.locator(".guest-whatsapp-separator")).toHaveText("أو");
  await expectWhatsAppLink(link);
  const dimensions=await page.evaluate(()=>{const a=document.querySelector(".guest-subscribe"),o=a.nextElementSibling,r=o.getBoundingClientRect(),p=a.getBoundingClientRect(),icon=o.querySelector("svg").getBoundingClientRect();return {width:r.width,height:r.height,x:r.x,right:r.right,top:r.top,primaryBottom:p.bottom,scrollWidth:document.documentElement.scrollWidth,innerWidth,dir:document.querySelector(".guest-page").dir,iconWidth:icon.width,iconHeight:icon.height};});
  expect(dimensions.dir).toBe("rtl");expect(dimensions.scrollWidth).toBeLessThanOrEqual(width);expect(dimensions.width).toBeGreaterThanOrEqual(44);expect(dimensions.height).toBeGreaterThanOrEqual(44);expect(dimensions.x).toBeGreaterThanOrEqual(0);expect(dimensions.right).toBeLessThanOrEqual(width);expect(dimensions.top).toBeGreaterThanOrEqual(dimensions.primaryBottom);
  expect(dimensions.iconWidth).toBeGreaterThanOrEqual(18);expect(Math.abs(dimensions.iconWidth-dimensions.iconHeight)).toBeLessThanOrEqual(0.5);
  expect(await page.locator(".guest-italian").first().evaluate(el=>getComputedStyle(el).direction)).toBe("ltr");
  const audit=await page.evaluate(()=>window.axe.run(document.querySelector("#main"),{runOnly:{type:"tag",values:["wcag2a","wcag2aa","wcag21aa"]}}));expect(audit.violations.map(v=>v.id)).toEqual([]);
 }
 const link=page.locator(".guest-whatsapp-marketing .guest-whatsapp-link").first(),popupPromise=page.waitForEvent("popup");
 await link.click();const popup=await popupPromise;await popup.waitForLoadState();expect(popup.url()).toBe(whatsappUrl);await popup.close();
 expect(apiWrites).toEqual([]);await expect(page).toHaveURL(/#\/home$/);await expect(page.locator(".guest-subscribe").first()).toHaveAttribute("href","#/billing");
 await page.locator(".guest-subscribe").first().click();await expect(page.locator(".billing-page")).toBeVisible();await expect(page.locator("#billing-email")).toBeVisible();await expect(page.locator("[data-checkout]")).toBeHidden();expect(apiWrites).toEqual([]);
});

test("verified new subscriber sees WhatsApp below the unchanged checkout button; active subscriber does not",async({page})=>{
 const verified={authenticated:true,csrf:"a".repeat(64),subscription:null};await configure(page,verified);
 for(const width of [390,1440]){
  await page.setViewportSize({width,height:900});await page.goto("/index.html#/billing",{waitUntil:"domcontentloaded"});
  const checkout=page.locator("[data-checkout]"),option=page.locator(".billing-whatsapp-option"),link=option.locator(".guest-whatsapp-link");
  await expect(checkout).toBeVisible();await expect(option).toBeVisible();await expect(option.locator(".guest-whatsapp-separator")).toHaveText("أو");await expectWhatsAppLink(link);
  const bounds=await link.boundingBox();expect(bounds.width).toBeGreaterThanOrEqual(44);expect(bounds.height).toBeGreaterThanOrEqual(44);expect(bounds.x).toBeGreaterThanOrEqual(0);expect(bounds.x+bounds.width).toBeLessThanOrEqual(width);expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
  const audit=await page.evaluate(()=>window.axe.run(document.querySelector("#main"),{runOnly:{type:"tag",values:["wcag2a","wcag2aa","wcag21aa"]}}));expect(audit.violations.map(v=>v.id)).toEqual([]);
 }
 const requests=[];page.on("request",request=>{if(request.url().includes("/api/billing/checkout"))requests.push(request.url());});
 const popupPromise=page.waitForEvent("popup");await page.locator(".billing-whatsapp-option .guest-whatsapp-link").click();const popup=await popupPromise;await popup.waitForLoadState();expect(popup.url()).toBe(whatsappUrl);await popup.close();expect(requests).toEqual([]);
 await page.locator("[data-checkout]").click();await expect(page.locator("#billing-email")).toBeVisible();expect(requests).toEqual([]);
 await page.route("**/api/billing/status",route=>json(route,{authenticated:true,csrf:"a".repeat(64),subscription:{status:"active",currentPeriodEnd:"2099-01-01T00:00:00.000Z",cancelAtPeriodEnd:false,cancelAt:null}}));
 await page.goto("/index.html#/billing?manage=1",{waitUntil:"domcontentloaded"});await expect(page.locator("[data-portal]")).toBeVisible();await expect(page.locator("[data-checkout]")).toBeHidden();await expect(page.locator(".billing-whatsapp-option")).toBeHidden();
});
