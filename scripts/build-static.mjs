// Copy public files verbatim. No transpilation, environment interpolation or database access.
import { copyFileSync, mkdirSync, rmSync, lstatSync, existsSync, realpathSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { publicFileList } from "./public-files.mjs";

const ROOT = realpathSync(join(dirname(fileURLToPath(import.meta.url)), ".."));
export function buildStatic() {
  const out = resolve(ROOT, "dist");
  if (dirname(out) !== ROOT || (existsSync(out) && (lstatSync(out).isSymbolicLink() || realpathSync(out) !== out))) throw new Error("Unsafe static output directory");
  // Resolve all inputs first. This deletes only the checked, generated ROOT/dist directory.
  const files = publicFileList(ROOT);
  rmSync(out, { recursive: true, force: true });
  for (const file of files) {
    const target = join(out, file);
    mkdirSync(dirname(target), { recursive: true });
    copyFileSync(join(ROOT, file), target);
  }
  return { files: files.length, output: "dist" };
}
if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) console.log(JSON.stringify(buildStatic()));
