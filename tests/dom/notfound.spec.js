/* ============================================================
   The not-found page, opened the way GitHub Pages serves it.

   404.html refers to everything from the root, under the prefix the site is
   published at (`/impara-italiano/...`). That is what makes it correct at
   any depth Pages hands it out at — and what makes it unopenable from the
   local server, where that prefix is not a directory. Opened by hand it
   arrives without its stylesheet, which looks like a bug and is not one.

   So the test does what Pages does: it rewrites the prefix away, and only
   then opens the page. That turns the awkward property into the assertion
   worth having — after the rewrite the stylesheet HAS to load, which proves
   the paths point at files that exist and not merely at plausible strings.
   scripts/check_404.mjs holds the other half, the shape of the references
   themselves, without a browser.

   The console assertion is the reason the font assertion stands next to it:
   "nothing went wrong" also passes on a page that drew nothing at all.
   ============================================================ */
const { test, expect } = require("../helpers/learner-fixture.cjs");

/** The prefix the site is published at, as it appears inside 404.html. */
const PREFIKS = new URL(require("../../package.json").homepage).pathname;

/** The single selectable explanation language. */
const JEZYKI = ["ar"];

/**
 * Serves the page the way Pages does: everything under the publication
 * prefix comes from the root of the local server.
 */
async function bezPrefiksu(page) {
  if (PREFIKS === "/") return;
  await page.route(`**${PREFIKS}**`, (route) => {
    const url = new URL(route.request().url());
    url.pathname = url.pathname.replace(PREFIKS, "/");
    return route.continue({ url: url.toString() });
  });
}

test("the page draws, styled, and reports nothing broken", async ({ page }) => {
  const bledy = [];
  page.on("pageerror", (e) => bledy.push(String(e)));
  page.on("console", (m) => { if (m.type() === "error") bledy.push(m.text()); });
  page.on("requestfailed", (r) => bledy.push(`${r.url()} — ${r.failure()?.errorText}`));

  await bezPrefiksu(page);
  await page.goto("/404.html");

  await expect(page.locator("h1")).toBeVisible();
  await expect(page.locator('.lost__langs > li[lang="ar"]')).toHaveCount(1);
  await expect(page.locator("html")).toHaveAttribute("dir", "rtl");

  /* The stylesheet arrived: the display family only exists in app.css, which
     the page reaches through the absolute prefix. A wrong path leaves the
     heading in the browser's default serif and everything else looking
     roughly the same. */
  const krój = await page.locator("h1").evaluate((el) => getComputedStyle(el).fontFamily);
  expect(krój, "arkusz stylów kursu nie wczytał się przez prefiks").toContain("Spectral");

  expect(bledy, `błędy na stronie 404: ${bledy.join(" | ")}`).toEqual([]);
});

test("the sentence stands in Arabic", async ({ page }) => {
  await bezPrefiksu(page);
  await page.goto("/404.html");

  for (const kod of JEZYKI) {
    const wiersz = page.locator(`.lost__langs > li[lang="${kod}"]`);
    await expect(wiersz, `brak wiersza w języku ${kod}`).toHaveCount(1);
    await expect(wiersz).not.toBeEmpty();
  }
});

test("exactly one way back, and it opens the course", async ({ page }) => {
  await bezPrefiksu(page);
  await page.goto("/404.html");

  /* One, not "at least one": a lost visitor should not be choosing between
     two doors. The static gate counts the same thing without a browser. */
  const powroty = page.locator(`a[href="${PREFIKS}"]`);
  await expect(powroty).toHaveCount(1);

  await powroty.click();

  /* The course really came up, rather than the address merely changing:
     index.html is the only page here that builds the engine. */
  await page.waitForFunction(() => window.Core && window.Views);
  await expect(page.locator("#main")).toBeVisible();
});

for(const width of [390,1440])test('standalone error page loads the real Arabic font at '+width,async({page,context})=>{
 await page.setViewportSize({width,height:900});await bezPrefiksu(page);await page.goto('/404.html');await page.evaluate(()=>document.fonts.ready);const arabic=page.locator('li[lang="ar"]');await expect(arabic).toHaveText('هذه الصفحة غير موجودة.');expect(await arabic.evaluate(e=>getComputedStyle(e).direction)).toBe('rtl');expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1)).toBe(true);
 const cdp=await context.newCDPSession(page);await cdp.send('DOM.enable');await cdp.send('CSS.enable');const doc=await cdp.send('DOM.getDocument'),{nodeId}=await cdp.send('DOM.querySelector',{nodeId:doc.root.nodeId,selector:'li[lang="ar"]'}),fonts=await cdp.send('CSS.getPlatformFontsForNode',{nodeId});expect(fonts.fonts.some(f=>f.familyName==='Noto Sans Arabic'&&f.isCustomFont&&f.glyphCount>0)).toBe(true);await cdp.detach();if(process.env.ARABIC_POLISH_DIR)await page.screenshot({path:require('node:path').join(process.env.ARABIC_POLISH_DIR,'error-page-'+width+'.png')});
});
