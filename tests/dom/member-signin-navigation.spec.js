const { test, expect } = require('@playwright/test');
function json(route,body){return route.fulfill({status:200,contentType:'application/json',body:JSON.stringify(body),headers:{'Cache-Control':'no-store'}});}

test('landing page provides email sign-in and legacy activation-code sign-in',async({page})=>{
 await page.route('**/api/auth/session',route=>json(route,{authenticated:false}));
 await page.route('**/api/billing/config',route=>json(route,{enabled:true,amountCents:999,currency:'eur',interval:'month',intervalCount:1}));
 await page.route('**/api/billing/status',route=>json(route,{authenticated:false}));
 await page.goto('/index.html#/home');
 await expect(page.locator('.guest-page')).toBeVisible();
 const email=page.locator('.guest-header-login');
 await expect(email).toBeVisible();
 await expect(email).toHaveAttribute('href','#/billing?signin=1');
 await expect(page.locator('.guest-code-login a')).toHaveAttribute('href','#/account');
 await email.click();
 await expect(page.locator('.billing-heading h1')).toHaveText('تسجيل الدخول إلى Vita Reale');
 await expect(page.locator('.billing-code-login a')).toHaveAttribute('href','#/account');
 await page.locator('.billing-code-login a').click();
 await expect(page.locator('#pilot-code')).toBeVisible();
});

