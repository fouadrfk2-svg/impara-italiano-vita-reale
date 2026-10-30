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
 await expect(email).toHaveAccessibleName('تسجيل الدخول');
 const icon=email.locator('.guest-signin-icon');await expect(icon).toHaveAttribute('viewBox','0 0 24 24');await expect(icon).toHaveAttribute('aria-hidden','true');await expect(icon.locator('path')).toHaveAttribute('stroke-width','2.2');
 for(const width of [390,1440]){await page.setViewportSize({width,height:900});const bounds=await email.boundingBox(),iconBounds=await icon.boundingBox(),scrollWidth=await page.evaluate(()=>document.documentElement.scrollWidth);expect(bounds.height).toBeGreaterThanOrEqual(44);expect(bounds.x).toBeGreaterThanOrEqual(0);expect(bounds.x+bounds.width).toBeLessThanOrEqual(width);expect(iconBounds.width).toBeGreaterThanOrEqual(20);expect(Math.abs(iconBounds.width-iconBounds.height)).toBeLessThanOrEqual(.5);expect(scrollWidth).toBeLessThanOrEqual(width);}
 await expect(page.locator('.guest-code-login a')).toHaveAttribute('href','#/account');
 await email.click();
 await expect(page.locator('.billing-heading h1')).toHaveText('تسجيل الدخول إلى Vita Reale');
 await expect(page.locator('.billing-code-login a')).toHaveAttribute('href','#/account');
 await page.locator('.billing-code-login a').click();
 await expect(page.locator('#pilot-code')).toBeVisible();
});

