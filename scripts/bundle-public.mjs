// Build-only bundling of classic public scripts. Preserve exact script order.
// Never copy private course, audio or payment data into any static bundle.
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { createHash } from "node:crypto";
import { isPublicPath } from "./public-files.mjs";

const digest = text => createHash("sha256").update(text).digest("hex").slice(0,12);
const shellPattern = /<script defer src="([^"]+)"><\/script>/g;
const coursePattern = /<script type="application\/json" data-course-src="([^"]+)" data-course-feature="([a-z-]+)"><\/script>/g;

export function bundlePublic(root, out) {
  const output = join(out, "index.html");
  let html = readFileSync(output, "utf8");
  const generated = [];
  function pack(inputs, kind) {
    if (!inputs.length) throw Error("Empty public bundle");
    for (const path of inputs) {
      if (!(/^(?:assets\/js\/[a-z0-9-]+|data\/i18n\/ui-(?:en|ar))\.js$/.test(path)) || !isPublicPath(path))
        throw Error("Private or invalid module in public bundle: " + path);
    }
    const body = inputs.map(p => "/* "+p+" */\n"+readFileSync(join(root,p),"utf8")+"\n;\n").join("\n");
    const name = "assets/js/vita-"+kind+"."+digest(body)+".js";
    mkdirSync(dirname(join(out,name)),{recursive:true});
    writeFileSync(join(out,name),body);
    generated.push(name);
    return name;
  }
  // Split the startup shell into three independently downloaded chunks.
  // The browser fetches deferred scripts concurrently and EXECUTES them in
  // document order, so global dependencies remain exactly as authored.
  const shellSources=[...html.matchAll(shellPattern)].map(m=>m[1]);
  if(shellSources.length<15)throw Error("Unexpected shell module inventory");
  const uiStart=shellSources.indexOf("data/i18n/ui-en.js");
  const appStart=shellSources.indexOf("assets/js/router.js");
  if(uiStart<2||appStart<uiStart+2)throw Error("Unrecognized boot dependency boundaries");
  const cut=[0,uiStart,appStart,shellSources.length],shellBundles=[];
  for(let i=0;i<cut.length-1;i++){
    shellBundles.push(pack(shellSources.slice(cut[i],cut[i+1]),"shell-"+(i+1)));
  }
  let shellIndex=0;
  html=html.replace(shellPattern,()=>{
    const n=shellIndex++;
    const chunk=cut.indexOf(n);
    return chunk>=0&&chunk<shellBundles.length?'<script defer src="'+shellBundles[chunk]+'"></script>':"";
  });

  // Group only contiguous public UI modules. Private script placeholders
  // remain verbatim and in the same order (and are fetched AFTER login).
  const course=Array.from(html.matchAll(coursePattern));
  if(course.length<60)throw Error("Unexpected course module inventory");
  let index=0, chunks=[], sequence=[], count=0, outHtml="", chunkFeature=null;
  function flush(){
    if(!chunks.length)return;
    const source=pack(chunks,"course-"+chunkFeature+"-"+(++count));
    sequence.push({bundle:source,count:chunks.length,feature:chunkFeature});
    outHtml+='<script type="application/json" data-course-src="'+source+'" data-course-feature="'+chunkFeature+'"></script>';
    chunks=[]; chunkFeature=null;
  }
  for(const m of course){
    outHtml+=html.slice(index,m.index);
    const path=m[1], feature=m[2];
    if(!/^[a-z-]+$/.test(feature))throw Error("Invalid course feature: "+feature);
    if(/^assets\/js\//.test(path)&&isPublicPath(path)){
      if(chunks.length&&chunkFeature!==feature)flush();
      chunkFeature=feature; chunks.push(path);
    }
    else{
      flush();
      outHtml+=m[0];
      sequence.push({private:path,feature});
    }
    index=m.index+m[0].length;
  }
  flush();
  outHtml+=html.slice(index);
  html=outHtml;
  writeFileSync(output,html);

  // Publish shell remains offline-capable. Avoid precaching all the original
  // constituent files; precache only the one generated shell instead.
  const swPath=join(out,"sw.js");
  let sw=readFileSync(swPath,"utf8");
  const initTag='self.addEventListener("install", function (e) {';
  if(!sw.includes(initTag)||!sw.includes('var INSTALL_SHELL ='))throw Error("Unknown PWA install implementation");
  const patch=[
    "/* Generated deployment-specific cache inventory. */",
    "var ORIGINAL_SHELL_FILES = new Set("+JSON.stringify(shellSources.map(p=>"./"+p))+");",
    "INSTALL_SHELL = INSTALL_SHELL.filter(function(p){return !ORIGINAL_SHELL_FILES.has(p);});",
    "INSTALL_SHELL.push("+shellBundles.map(p=>JSON.stringify("./"+p)).join(",")+");",
    "PRECACHE.push("+generated.map(p=>JSON.stringify("./"+p)).join(",")+");",
    ""
  ].join("\n");
  sw=sw.replace(initTag,patch+initTag);
  const marker=sw.match(/var SW_VERSION = "([^"]+)"/)?.[1];
  if(!marker)throw Error("Missing PWA version");
  const combined=digest(generated.join("|")+marker);
  sw=sw.replace('var SW_VERSION = "'+marker+'"','var SW_VERSION = "'+marker+"-"+combined+'"');
  writeFileSync(swPath,sw);
  return {shell: shellSources.length, courses:course.length, bundledPublic:sequence.filter(x=>x.bundle).reduce((n,x)=>n+x.count,0), privateModules:sequence.filter(x=>x.private).length, courseBundles:count, paths:generated};
}
