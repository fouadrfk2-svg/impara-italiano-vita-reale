/* ============================================================
   Each route is checked after its own feature chunk has loaded. Views are
   intentionally absent from the initial shell now; checking the global view
   registry at startup would reject the lazy-loading architecture itself.
   ============================================================ */
const { test, expect } = require("../helpers/learner-fixture.cjs");

/* The routes from the side menu plus the ones reachable only from inside the course. */
const TRASY = [
  "oggi", "percorso", "ripasso", "cinque", "allenamento", "conversazione", "chiacchiere", "grammatica",
  "coniugatore", "lessico", "shadowing", "velocita", "esame", "falsi",
  "copertura", "account", "progressi", "guida", "impostazioni",
  "lezione", "piazzamento", "cerca", "lettura", "scrittura", "suoni", "privacy"
];

/** Waits until the authenticated shell is ready, not until every route is. */
async function otworz(page) {
  await page.goto("/index.html");
  await page.waitForFunction(() => window.Account && Account.snapshot().authenticated && window.App && window.Router);
}

async function navigate(page, route) {
  await page.evaluate(r => window.App.go(r), route);
  await page.waitForFunction(r => window.Router.current.route === r
    && !document.getElementById("main").hasAttribute("aria-busy")
    && !document.querySelector("[data-course-opening]"), route);
  await expect(page.locator("#main > *").first()).toBeVisible();
  await expect(page.locator("#main [role=alert]:visible")).toHaveCount(0);
}

test("rail routes are all covered by the route behavior checks", async ({ page }) => {
  await otworz(page);
  const menu = await page.locator(".rail__item").evaluateAll(nodes => nodes.map(n => n.getAttribute("data-route")));
  expect(menu.filter(route => !TRASY.includes(route)), "menu route without a dedicated route test").toEqual([]);
  for (const route of menu) await navigate(page, route);
});

for (const trasa of TRASY) {
  test(`route ${trasa} draws a screen and reports no error`, async ({ page }) => {
    const bledy = [];
    page.on("pageerror", e => bledy.push(String(e)));
    page.on("console", m => { if (m.type() === "error") bledy.push(m.text()); });

    await otworz(page);
    await navigate(page, trasa);

    /* Not "any HTML at all": an empty screen after a route change would look
       like a correct render. The view has to leave at least one element in
       #main — even the empty state is an element (the .empty class). */
    expect(bledy, `errors on route ${trasa}: ${bledy.join(" | ")}`).toEqual([]);
  });
}

test("public billing page is registered by index.html", async ({ page }) => {
  await page.goto("/index.html");
  await page.waitForFunction(() => !!window.Views);
  const registered = await page.evaluate(() => typeof window.Views.billing === "function");
  expect(registered, "billing.js must load before the public application router").toBe(true);
});
