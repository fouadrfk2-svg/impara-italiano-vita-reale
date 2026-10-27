// One publish boundary shared by the static build and local static server.
import { lstatSync, readdirSync, realpathSync } from "node:fs";
import contentPaths from "../server/content-path.cjs";
import { resolve, relative, sep, extname, posix } from "node:path";

export const PUBLIC_FILES = ["index.html", "404.html", "manifest.webmanifest", "sw.js", ".nojekyll",
  "LICENSE", "LICENSE-CONTENT", "README.md", "README.it.md", "README.pl.md", "SECURITY.md", "SECURITY.it.md"];
export const PUBLIC_DIRS = ["assets", "data", "audio", "badges"];
const extensions = { assets: [".js", ".css", ".json", ".svg", ".png", ".ico", ".webp", ".jpg", ".jpeg", ".woff", ".woff2", ".ttf", ".txt"], data: [".js"], audio: [".mp3"], badges: [".json"] };

export function isPublicPath(file) {
  if (contentPaths.isPrivateContent(file) || file.startsWith("audio/") || (file.startsWith("data/") && !/^data\/i18n\/ui-(?:ar|en|pl|es|fr|de)\.js$/.test(file))) return false;
  if (PUBLIC_FILES.includes(file)) return true;
  if (file.includes("\\") || file.includes("\0")) return false;
  const parts = file.split("/");
  if (parts.length < 2 || parts.some(p => !p || p.startsWith(".") || /^(?:credentials|secrets)(?:\.|$)/i.test(p))) return false;
  return PUBLIC_DIRS.includes(parts[0]) && extensions[parts[0]].includes(extname(file).toLowerCase());
}

export function resolvePublicPath(root, requestUrl) {
  let file;
  try { file = decodeURIComponent(requestUrl.split("?")[0].split("#")[0]); } catch { return null; }
  if (file === "/") file = "/index.html";
  // Reject traversal before path normalisation, including encoded separators and Windows paths.
  if (!file.startsWith("/") || file.startsWith("//") || file.includes("\\") || file.includes("\0")) return null;
  const rel = file.slice(1);
  if (posix.normalize(rel) !== rel || !isPublicPath(rel)) return null;
  const base = realpathSync(root), target = resolve(base, ...rel.split("/"));
  try {
    const real = realpathSync(target), inside = relative(base, real);
    if (!inside || inside.startsWith(".." + sep) || inside === ".." || resolve(base, inside) !== real || !lstatSync(real).isFile()) return null;
    // A public name must never be an alias to private files via a symlink.
    let walk = base;
    for (const part of rel.split("/")) { walk = resolve(walk, part); if (lstatSync(walk).isSymbolicLink()) return null; }
    return real;
  } catch { return null; }
}

export function publicFileList(root) {
  const files = [];
  function walk(rel) {
    const target = resolve(root, ...rel.split("/")), info = lstatSync(target);
    if (info.isSymbolicLink()) throw new Error("Symbolic links are not publishable");
    if (info.isDirectory()) {
      for (const name of readdirSync(target).sort()) {
        if (name.startsWith(".")) continue;
        walk(rel + "/" + name);
      }
    } else if (info.isFile() && isPublicPath(rel)) files.push(rel);
  }
  for (const file of PUBLIC_FILES) walk(file);
  for (const dir of PUBLIC_DIRS) walk(dir);
  return files.sort();
}
