const {test,expect}=require("../helpers/learner-fixture.cjs");

// A slow protected data request must not leave an authenticated visitor
// staring at the sales landing page without feedback.
test("authenticated course shows immediate opening UI while protected assets load",async({page})=>{
 await page.route("**/data/audio-index.js",async route=>{
   await new Promise(resolve=>setTimeout(resolve,2200));
   await route.continue();
 });
 await page.goto("/index.html",{waitUntil:"domcontentloaded"});
 await expect(page.locator("[data-course-opening]")).toBeVisible({timeout:10000});
 await expect(page.locator("[data-course-opening-count]")).toBeVisible();
 await expect(page.locator("html[data-access='learner']")).toHaveCount(1,{timeout:20000});
 await expect(page.locator("[data-course-opening]")).toHaveCount(0);
});
