const { test, expect } = require("@playwright/test");
const { readFileSync } = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const AXE = readFileSync(require.resolve("axe-core/axe.min.js"), "utf8");
let arabicUI;
vm.runInNewContext(readFileSync(path.join(__dirname, "../../data/i18n/ui-ar.js"), "utf8"), { LINGUAI: { addUI(_l, data) { arabicUI = data; } } });
const active = ".exq:not([hidden])";
const lessons = [
  { id: "a1-u01-l2", title: "مذكّر أم مؤنّث؟", vocab: 14, gender: 3, forms: {libro:"il",casa:"la",stazione:"la",ristorante:"il",chiave:"la",giorno:"il"}, arabicOptions: 4,
    order: ["Il", "ristorante", "è", "chiuso"], orderIndex: 6, speech: "La città è molto bella.", listen: "Le chiavi sono sul tavolo." },
  { id: "a1-u01-l3", title: "أدوات التعريف والتنكير", vocab: 12, gender: 2, forms: {treno:"il",studente:"lo",amica:"l'",acqua:"l'",bottiglia:"la",zaino:"lo"}, arabicOptions: 5,
    order: ["Lo", "zaino", "dello", "studente", "è", "pesante"], orderIndex: 7, speech: "Gli studenti sono all'università." }
];
async function ready(page) {
  await page.waitForFunction(() => window.Core && window.Core.registry.loaded.A1 === true && document.querySelector(".exq"));
  await page.evaluate(() => { window.Core.state.settings.autoplay = false; window.Core.save(); });
}
async function language(page, lang) {
  if (await page.locator("#railToggle").isVisible() && !await page.locator("#rail").evaluate(el => el.classList.contains("is-open"))) await page.locator("#railToggle").click();
  await page.locator("#langToggle").click();
  await page.locator('#langList [data-lang="' + lang + '"]').click();
  await expect(page.locator("#main")).toHaveAttribute("data-lesson-language", lang);
  await expect(page.locator("html")).toHaveAttribute("dir", lang === "ar" ? "rtl" : "ltr");
}
async function audit(page) {
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)).toBe(true);
  const violations = await page.evaluate(async () => (await window.axe.run(document, { runOnly: { type: "tag", values: ["wcag2a", "wcag2aa", "wcag21aa"] } })).violations.map(v => ({id:v.id,targets:v.nodes.map(n=>n.target)})));
  expect(violations).toEqual([]);
}
async function screenshot(page, info, name) {
  const target = process.env.ARABIC_23_QA_DIR ? path.join(process.env.ARABIC_23_QA_DIR, name) : info.outputPath(name);
  await page.screenshot({path:target,fullPage:true});
  await info.attach(name, {path:target,contentType:"image/png"});
}

for (const width of [1440,390]) for (const lesson of lessons) {
  test.describe(lesson.id + " Arabic at " + width + "px", () => {
    test.use({viewport:{width,height:920},locale:"ar-MA"});
    test.beforeEach(async ({page}) => {
      await page.addInitScript(AXE);
      await page.addInitScript(() => {delete window.SpeechRecognition;delete window.webkitSpeechRecognition;});
    });
    test("complete translation, mixed table/option directions, Italian audio and exact language cycle", async ({page},info) => {
      const errors=[],failed=[];page.on("pageerror",e=>errors.push(e.message));page.on("response",r=>{if(r.status()>=400)failed.push(r.url());});
      await page.goto("/index.html#/lezione?id="+lesson.id);await ready(page);
      await expect(page.locator(".view-head > p")).toHaveText(lesson.title);
      await expect(page.locator(".vocab-card__pl")).toHaveCount(lesson.vocab);
      await expect(page.locator(".dlg")).toHaveCount(0);
      const ar = await page.evaluate(id=>JSON.stringify(window.Core.getLesson(id).lesson),lesson.id);
      const choiceOrder=await page.locator(".exq .opts").evaluateAll(groups=>groups.map(group=>Array.from(group.querySelectorAll(".opt"),n=>n.getAttribute("data-orig"))));
      const cells=await page.locator(".gt td").evaluateAll(nodes=>nodes.map(n=>({text:n.textContent,lang:n.lang,dir:getComputedStyle(n).direction})));
      for(const cell of cells){const arabic=/[\u0600-\u06ff]/.test(cell.text);expect(cell.lang).toBe(arabic?"ar":"it");expect(cell.dir).toBe(arabic?"rtl":"ltr");}
      await page.locator('.ex-chip[data-go="'+lesson.arabicOptions+'"]').click();
      await expect(page.locator(active+" .opts")).toHaveAttribute("lang","ar");
      expect(await page.locator(active+" .opts").evaluate(n=>getComputedStyle(n).direction)).toBe("rtl");
      await page.locator('.ex-chip[data-go="0"]').click();
      await expect(page.locator(active+" .opts")).toHaveAttribute("lang","it");
      expect(await page.locator(active+" .opts").evaluate(n=>getComputedStyle(n).direction)).toBe("ltr");
      await page.locator('.ex-chip[data-go="'+lesson.gender+'"]').click();
      expect(await page.locator(active+" .field-row > span").first().evaluate(n=>getComputedStyle(n).direction)).toBe("rtl");
      await expect(page.locator(active+" .js-sel").first()).toHaveAttribute("dir","ltr");
      await page.locator(active+" .js-sel").first().focus();await expect(page.locator(active+" .js-sel").first()).toBeFocused();
      const recording=page.waitForResponse(r=>/\/audio\/.*\.mp3$/.test(r.url()));
      await page.locator(".vocab-card [data-say]").first().click();expect((await recording).status()).toBe(200);
      await audit(page);await screenshot(page,info,lesson.id+"-"+width+".png");
      await language(page,"en");
      const en=await page.evaluate(id=>JSON.stringify(window.Core.getLesson(id).lesson),lesson.id);expect(en).not.toBe(ar);
      for(const lang of ["ar","en","ar"]){await language(page,lang);expect(await page.evaluate(id=>JSON.stringify(window.Core.getLesson(id).lesson),lesson.id)).toBe(lang==="ar"?ar:en);expect(await page.locator(".exq .opts").evaluateAll(groups=>groups.map(group=>Array.from(group.querySelectorAll(".opt"),n=>n.getAttribute("data-orig"))))).toEqual(choiceOrder);await audit(page);}
      await page.evaluate(()=>new Promise(resolve=>window.Core.loadLevelData('B1',resolve)));
      const neighbor=await page.evaluate(()=>window.Core.getLesson("b1-u01-l1").lesson.title);
      await page.evaluate(()=>window.App.go("lezione",{id:"b1-u01-l1"}));
      await expect(page.locator("#main")).toHaveAttribute("data-lesson-language","en");
      await expect(page.locator(".view-head > p")).toHaveText(neighbor);
      expect(errors).toEqual([]);expect(failed).toEqual([]);
    });

    test("wrong feedback and all nine unchanged-answer exercises complete, persist, and use Arabic instructions", async ({page},info) => {
      const errors=[];page.on("pageerror",e=>errors.push(e.message));
      await page.goto("/index.html#/lezione?id="+lesson.id);await ready(page);
      await page.locator(active+' [data-orig="0"]').click();await page.locator(active+" .js-check").click();
      await expect(page.locator(active)).toHaveClass(/exq--ko/);
      await expect(page.locator(active+" .fb__why")).toContainText(lesson.id.endsWith("l2")?"الجواب":"الاسم");
      await page.reload();await ready(page);
      await page.evaluate(id=>{
        const original=window.I18n.t;window.__lessonUIKeys=[];
        window.I18n.t=function(key,vars){if(/^(lesson\.|ex\.|tense\.|stt\.)/.test(key)||key==="talk.checking")window.__lessonUIKeys.push(key);return original(key,vars);};
        window.App.go("lezione",{id});
      },lesson.id);
      for(let i=0;i<9;i++){
        await page.locator('.ex-chip[data-go="'+i+'"]').click();const current=page.locator(active);
        if(lesson.id.endsWith("l2")){
          if(i===0||i===4)await current.locator('[data-orig="1"]').click();
          if(i===1)await current.locator(".js-in").fill("le");
          if(i===2)await current.locator(".js-in").fill("ristoranti");
          if(i===5)for(const index of [0,2,4])await current.locator('[data-orig="'+index+'"]').click();
          if(i===7)await current.locator(".js-in").fill(lesson.listen);
        }else{
          if(i===0||i===1||i===5)await current.locator('[data-orig="1"]').click();
          if(i===3)await current.locator(".js-in").fill("un'");
          if(i===4)await current.locator(".js-in").fill("gli");
          if(i===6)for(let j=0;j<4;j++){await current.locator('.js-l [data-i="'+j+'"]').click();await current.locator('.js-r [data-i="'+j+'"]').click();}
        }
        if(i===lesson.gender){
          const rows=current.locator(".field-row");await expect(rows).toHaveCount(6);
          for(let j=0;j<6;j++){
            const row=rows.nth(j), word=(await row.locator("b").innerText()).trim();
            expect(lesson.forms[word],word).toBeDefined();
            await expect(row.locator(".js-sel")).toHaveAccessibleName(word);
            await row.locator(".js-sel").selectOption(lesson.forms[word]);
          }
        }
        if(i===lesson.orderIndex)for(const word of lesson.order)await current.locator(".js-bank").getByRole("button",{name:word,exact:true}).first().click();
        if(i===8)await current.locator(".js-in").fill(lesson.speech);
        if(!(lesson.id.endsWith("l3")&&i===6))await current.locator(".js-check").click();
        await expect(current).toHaveClass(/exq--ok/);await expect(current.locator(".fb")).toContainText("أحسنت");await audit(page);
      }
      await expect(page.locator(".summary__score")).toHaveText("100%");
      await expect(page.locator(".summary__msg")).toContainText("9/9");
      const used=await page.evaluate(()=>[...new Set(window.__lessonUIKeys)]);expect(used.length).toBeGreaterThan(40);
      for(const key of used){expect(arabicUI[key],key).toBeDefined();const values=typeof arabicUI[key]==="object"?Object.values(arabicUI[key]):[arabicUI[key]];for(const text of values)expect(text,key).toMatch(/[\u0600-\u06ff]/);}
      await screenshot(page,info,lesson.id+"-complete-"+width+".png");
      const snapshot=()=>page.evaluate(()=>{const s=JSON.parse(JSON.stringify(window.Core.state));delete s.settings.lang;return s;});
      const progress=await snapshot();expect(progress.lessons[lesson.id].best).toBe(1);expect(progress.lessons[lesson.id].done).toBe(true);
      for(const lang of ["en","ar"]){await language(page,lang);expect(await snapshot()).toEqual(progress);}
      await page.waitForFunction(id=>JSON.parse(localStorage.getItem("linguai.italiano.v2")).lessons[id].best===1,lesson.id);
      await page.reload();await ready(page);expect((await snapshot()).lessons[lesson.id].best).toBe(1);
      await expect(page.locator(".view-head > p")).toHaveText(lesson.title);expect(errors).toEqual([]);
    });
  });
}
