/* Regression checks for the hosted Stripe return / verified billing login.
 * No real Stripe calls or payments; the server authorization remains authoritative. */
const {test,expect}=require("../helpers/learner-fixture.cjs");

function respond(route,body,status=200){
 return route.fulfill({status,contentType:"application/json",headers:{"Cache-Control":"no-store"},body:JSON.stringify(body)});
}
async function mockBilling(page,options={}){
 let activations=0;
 await page.route("**/api/billing/config",route=>respond(route,{enabled:true,amountCents:999,currency:"eur",interval:"month",intervalCount:1}));
 await page.route("**/api/billing/status",route=>respond(route,options.verified===false?{authenticated:false}:{authenticated:true,csrf:"b".repeat(64),subscription:options.active===false?null:{status:"active",currentPeriodEnd:"2099-01-01T00:00:00.000Z",cancelAtPeriodEnd:false,cancelAt:null}}));
 await page.route("**/api/billing/activate",route=>{activations++;return respond(route,options.denied?{active:false}:{active:true},options.denied?202:200);});
 return {get activations(){return activations;}};
}

test("active verified Stripe user is sent directly into lessons",async({page})=>{
 const billing=await mockBilling(page);
 await page.goto("/index.html#/billing",{waitUntil:"domcontentloaded"});
 await expect.poll(()=>page.evaluate(()=>window.Router.current.route)).toBe("oggi");
 await expect(page.locator(".billing-page")).toHaveCount(0);
 expect(billing.activations).toBe(1);
});

test("unverified visitor never activates a course session",async({page})=>{
 const billing=await mockBilling(page,{verified:false});
 await page.goto("/index.html#/billing",{waitUntil:"domcontentloaded"});
 await expect(page.locator(".billing-page")).toBeVisible();
 await expect(page.locator("#billing-email")).toBeVisible();
 expect(billing.activations).toBe(0);
});

test("access denied by the server never bypasses the billing screen",async({page})=>{
 const billing=await mockBilling(page,{denied:true});
 await page.goto("/index.html#/billing",{waitUntil:"domcontentloaded"});
 await expect(page.locator("[data-open-learning]")).toBeVisible();
 await expect(page.locator(".billing-page")).toBeVisible();
 expect(billing.activations).toBeGreaterThan(0);
});

test("active subscribers can still open Stripe management when requested",async({page})=>{
 const billing=await mockBilling(page);
 await page.goto("/index.html#/billing?manage=1",{waitUntil:"domcontentloaded"});
 await expect(page.locator("[data-portal]")).toBeVisible();
 expect(billing.activations).toBe(0);
});

test("authenticated learners can reach sign-out without scrolling the long menu",async({page})=>{
 await page.goto("/index.html");
 await expect(page.locator("#railLogout")).toBeVisible();
 await expect(page.locator("#railLogout")).toHaveText("تسجيل الخروج");
});
