/* Shared visual-system regression checks and optional small screenshot set. */
const {test,expect}=require('../helpers/learner-fixture.cjs');
const {test:rawTest}=require('@playwright/test');
const fs=require('node:fs'),path=require('node:path');
const gallery=process.env.PREMIUM_UI_GALLERY;
if(gallery)fs.mkdirSync(gallery,{recursive:true});
async function capture(page,name){if(gallery)await page.screenshot({path:path.join(gallery,name+'.png'),fullPage:true,animations:'disabled'});}

rawTest('premium public homepage stays readable at mobile and desktop widths',async({page})=>{
 await page.goto('/index.html#/home');await expect(page.locator('.guest-page')).toBeVisible();
 for(const width of [320,360,390,768,1440]){await page.setViewportSize({width,height:1000});expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),'guest overflow '+width).toBe(true);if(width===390||width===1440)await capture(page,'home-'+(width===390?'mobile':'desktop'));}
});

test('premium learner surfaces use local icons and remain responsive',async({page})=>{

 await page.goto('/index.html#/oggi');await expect(page.locator('.today-next')).toBeVisible();
 for(const width of [360,390,768,1440]){await page.setViewportSize({width,height:900});expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),'today overflow '+width).toBe(true);}
 const nav=page.locator('.rail__item[data-route="oggi"] .vr-icon');await expect(nav).toHaveAttribute('aria-hidden','true');
 expect(await nav.evaluate(n=>getComputedStyle(n).maskImage)).toContain('sun.svg');
 await page.setViewportSize({width:390,height:900});await capture(page,'today-mobile-light');
 await page.setViewportSize({width:1440,height:900});await capture(page,'today-desktop-light');
 await page.evaluate(()=>{document.documentElement.dataset.theme='dark';});await capture(page,'today-desktop-dark');
 await page.setViewportSize({width:390,height:900});await capture(page,'today-mobile-dark');

 await page.emulateMedia({reducedMotion:'reduce'});
 expect(await page.locator('.view-head').evaluate(n=>parseFloat(getComputedStyle(n).animationDuration))).toBeLessThanOrEqual(.001);
 await page.goto('/index.html#/percorso');await expect(page.locator('.unit .node').first()).toBeVisible();await capture(page,'path-mobile-dark');
 await page.goto('/index.html#/lezione?id=a1-u01-l1');await expect(page.locator('.step').first()).toBeVisible();await capture(page,'lesson-mobile-dark');
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),'lesson overflow 390').toBe(true);
});
