import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { dirname } from "node:path";
import vm from "node:vm";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
function dictionary(lang) {
  const ctx = { console };
  ctx.window = ctx;
  let out = {};
  ctx.LINGUAI = { addUI: (_lang, data) => { out = data; } };
  vm.createContext(ctx);
  vm.runInContext(readFileSync(join(ROOT, "data", "i18n", `ui-${lang}.js`), "utf8"), ctx);
  return out;
}
function literalKeys(src) {
  const out = new Set();
  const re = /(?:\bI18n\.t|\bt)\(\s*"([a-zA-Z0-9_.:-]+)"\s*[),]/g;
  let match;
  while ((match = re.exec(src)) !== null) out.add(match[1]);
  return out;
}

describe("Arabic-only interface key coverage", () => {
  const ar = dictionary("ar");
  const en = dictionary("en");
  const files = readdirSync(join(ROOT, "assets", "js")).filter(file => file.endsWith(".js")).sort();

  test("Arabic covers all 963 keys in the English interface dictionary", () => {
    assert.equal(Object.keys(en).length, 963);
    assert.equal(Object.keys(ar).length, 963);
    assert.deepEqual(Object.keys(ar).sort(), Object.keys(en).sort());
  });

  test("every literal engine key exists in Arabic or its English fallback", () => {
    const keys = new Set(files.flatMap(file => [...literalKeys(readFileSync(join(ROOT, "assets", "js", file), "utf8"))]));
    assert.ok(keys.size > 200, `only ${keys.size} literal keys found — scanner may be broken`);
    const missing = [...keys].filter(key => !(key in ar) && !(key in en));
    assert.deepEqual(missing, []);
  });

  test("markup and conversation title keys exist in Arabic or English fallback", () => {
    const markup = ["index.html", "404.html"], re = /data-i18n(?:-label|-content)?="([a-zA-Z0-9_.:-]+)"/g;
    let found = 0;
    for (const file of markup) {
      const source = readFileSync(join(ROOT, file), "utf8"), missing = [];
      let match;
      while ((match = re.exec(source)) !== null) {
        found++;
        if (!(match[1] in ar) && !(match[1] in en)) missing.push(match[1]);
      }
      assert.deepEqual(missing, [], `${file} missing UI keys: ${missing.join(", ")}`);
    }
    assert.ok(found > 20, `only ${found} markup keys found — scanner may be broken`);

    const ctx = { console }; ctx.window = ctx; vm.createContext(ctx);
    vm.runInContext(readFileSync(join(ROOT, "data", "core", "chat-scenarios.js"), "utf8"), ctx);
    const scenes = Array.from(ctx.CHAT_SCENARIOS || []);
    assert.ok(scenes.length > 0, "no conversation scenes loaded");
    const missingTitles = scenes.map(scene => "chat.sc." + scene.id).filter(key => !(key in ar) && !(key in en));
    assert.deepEqual(missingTitles, []);
  });
});