const {test,expect}=require('../helpers/learner-fixture.cjs');
const fs=require('node:fs'),path=require('node:path');
const AXE=fs.readFileSync(require.resolve('axe-core/axe.min.js'),'utf8');
for(const width of [320,390,1440])for(const theme of ['light','dark'])test('RED VR learner brand, footer and accessible navigation '+width+' '+theme,async({page})=>{
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.setViewportSize({width,height:900});await page.addInitScript(AXE);await page.addInitScript(t=>localStorage.setItem('linguai.italiano.v2',JSON.stringify({schema:2,settings:{lang:'ar',theme:t}})),theme);
 await page.goto('/index.html#/oggi');await page.evaluate(()=>document.fonts.ready);
 if(width<900)await page.locator('#railToggle').click();
 const brand=page.locator('.rail__brand');await expect(brand).toBeVisible();await expect(brand).toHaveAttribute('href','#/oggi');await expect(brand).toHaveAccessibleName(/Vita Reale/);
 const img=brand.locator('img');await expect(img).toHaveAttribute('src','assets/branding/header_learning_dark.svg');expect(await img.evaluate(i=>i.complete&&i.naturalWidth===1050)).toBe(true);
 await brand.click({trial:true});const box=await brand.boundingBox();expect(box.height).toBeGreaterThanOrEqual(44);expect(box.width).toBeGreaterThanOrEqual(44);expect(box.x).toBeGreaterThanOrEqual(0);expect(box.x+box.width).toBeLessThanOrEqual(width);
 await page.keyboard.press('Tab');await brand.focus();expect(await brand.evaluate(e=>getComputedStyle(e).outlineStyle)).toBe('solid');
 if(process.env.BRAND_KIT_DIR)await page.screenshot({path:path.join(process.env.BRAND_KIT_DIR,'learner-'+width+'-'+theme+'.png')});
 await brand.press('Enter');await expect(page).toHaveURL(/#\/oggi$/);if(width<900)await expect(page.locator('#railToggle')).toHaveAttribute('aria-expanded','false');
 const foot=page.locator('.site-foot__brand');await expect(foot).toBeVisible();await expect(foot.locator('.brand-logo--'+theme)).toBeVisible();await expect(foot.locator('.brand-logo--'+(theme==='dark'?'light':'dark'))).toBeHidden();
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1)).toBe(true);
 const audit=await page.evaluate(()=>window.axe.run(document,{runOnly:{type:'tag',values:['wcag2a','wcag2aa','wcag21aa']}}));expect(audit.violations.map(v=>({id:v.id,nodes:v.nodes.map(n=>n.target)}))).toEqual([]);expect(errors).toEqual([]);
});
