/* Validate false-friend fallback explanations and preserve Italian recordings. */
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import vm from "node:vm";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const GATE = process.argv.includes("--gate");
const store = {};
const box = {
  console, JSON, Object, Array, String,
  LINGUAI: { addStrings(lang, map) {
    const bag = store[lang] || (store[lang] = {});
    Object.keys(map).forEach(key => { bag[key] = map[key]; });
  } }
};
box.window = box;
box.global = box;
vm.createContext(box);
vm.runInContext(readFileSync(join(ROOT, "data/core/interference.js"), "utf8"), box);
vm.runInContext(readFileSync(join(ROOT, "data/i18n/en/interference.js"), "utf8"), box);
vm.runInContext(readFileSync(join(ROOT, "data/audio-index.js"), "utf8"), box);

const entries = box.INTERFERENCE || [];
const audioIndex = box.AUDIO_INDEX || "";
const problems = [];
function hash(text) {
  let value = 0xcbf29ce484222325n;
  const mask = 0xffffffffffffffffn;
  for (const byte of Buffer.from(String(text).replace(/\s+/g, " ").trim(), "utf8")) {
    value ^= BigInt(byte);
    value = (value * 0x100000001b3n) & mask;
  }
  return value.toString(16).padStart(16, "0");
}

for (const entry of entries) {
  const fallback = (store.en || {})["int:" + entry.id];
  if (fallback) for (const field of ["looks", "mean", "why"]) {
    if (!fallback[field] || !String(fallback[field]).trim()) problems.push(`en/${entry.id}: empty ${field}`);
  }
  for (const text of [entry.it, entry.ex]) {
    if (text && !audioIndex.includes(hash(text))) problems.push(`${entry.id}: missing Italian recording ${JSON.stringify(text)}`);
  }
}

console.log(`false-friend source integrity: ${entries.length} entries`);
const totalAudio = entries.reduce((count, entry) => count + [entry.it, entry.ex].filter(Boolean).length, 0);
console.log(`Italian recordings: ${totalAudio - problems.filter(problem => problem.includes("missing Italian recording")).length}/${totalAudio}`);
if (problems.length) {
  problems.slice(0, 20).forEach(problem => console.log("x " + problem));
  if (problems.length > 20) console.log(`… and ${problems.length - 20} more`);
  if (GATE) process.exit(1);
} else console.log("OK");