const {test,expect}=require('@playwright/test');
for(const lang of ['ar','en','pl','es','fr','de'])test('pilot data notice is accessible without learner access in '+lang,async({page})=>{
 await page.goto('/index.html#/privacy');await page.waitForFunction(()=>window.Account&&Account.snapshot().checked);await page.evaluate(k=>App.applyLang(k),lang);
 await expect(page.locator('#main h1')).toContainText(lang==='ar'?'بيانات النسخة التجريبية':'Pilot data and your account');
 await expect(page.locator('#main')).toContainText(lang==='ar'?'على الخادم':'server account');await expect(page.locator('#rail')).toBeHidden();
 const text=await page.locator('#main').innerText();expect(text).not.toMatch(/privacy\.[a-z]|Andrea Bonacci|andreabonacci95@|No account|لا توجد حسابات/);
 await page.locator('#main a[href="#/home"]').click();await expect(page.locator('.guest-page')).toBeVisible();
});
