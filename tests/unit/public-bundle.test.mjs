import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, copyFileSync, readFileSync, rmSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { fileURLToPath } from "node:url";
import vm from "node:vm";
import { bundlePublic } from "../../scripts/bundle-public.mjs";

const ROOT=join(fileURLToPath(new URL("../..",import.meta.url)));
const courseRx=/data-course-src="([^"]+)" data-course-feature="([a-z-]+)"/g;
test("public production bundles preserve exact classic script order and private content boundaries",()=>{
  const tmp=mkdtempSync(join(tmpdir(),"vita-build-"));
  try {
    for(const name of ["index.html","sw.js"])copyFileSync(join(ROOT,name),join(tmp,name));
    const out=bundlePublic(ROOT,tmp);
    assert.equal(out.shell,22);
    assert.ok(out.courseBundles>=15&&out.courseBundles<=45);
    assert.ok(out.privateModules>=10);
    assert.equal(out.bundledPublic+out.privateModules,out.courses);
    const html=readFileSync(join(tmp,"index.html"),"utf8");
    assert.equal((html.match(/<script defer src=/g)||[]).length,3);
    assert.equal((html.match(/class="startup-screen"/g)||[]).length,1);
    const original=[...readFileSync(join(ROOT,"index.html"),"utf8").matchAll(courseRx)].map(x=>[x[1],x[2]]);
    const packed=[...html.matchAll(courseRx)].flatMap(match=>{
      const [path,feature]=[match[1],match[2]];
      if(!path.includes("vita-course-"))return [[path,feature]];
      return [...readFileSync(join(tmp,path),"utf8").matchAll(/\/\* (assets\/js\/[a-z0-9-]+\.js) \*\//g)].map(x=>[x[1],feature]);
    });
    assert.deepEqual(packed,original,"no private lessons or course modules may be lost/reordered or moved between feature groups");
    for(const path of out.paths){
      const source=readFileSync(join(tmp,path),"utf8");
      assert.ok(source.length>1000);
      assert.doesNotMatch(source,/\/\* (?:data\/core\/|data\/audio-|audio\/|assets\/js\/(?:verbs-data|drills-lex))/);
    }
    const sw=readFileSync(join(tmp,"sw.js"),"utf8");
    const sandbox={self:{addEventListener(){},skipWaiting(){},clients:{claim(){}}}};
    vm.createContext(sandbox);
    vm.runInContext(sw,sandbox);
    assert.ok(sandbox.INSTALL_SHELL.length<35);
    assert.equal(sandbox.INSTALL_SHELL.filter(p=>p.includes("vita-shell-")).length,3);
    assert.ok(!sandbox.INSTALL_SHELL.some(p=>p.endsWith("/core.js")));
    const sharedRenderer=out.paths.find(path=>readFileSync(join(tmp,path),"utf8").includes("/* assets/js/views.js */"));
    assert.ok(sharedRenderer,"the shared guest renderer must be included in a generated shell bundle");
    assert.ok(sandbox.INSTALL_SHELL.includes("./"+sharedRenderer),"the generated guest renderer bundle must be available offline");
    assert.ok(!sandbox.INSTALL_SHELL.some(p=>p.endsWith("/exercises.js")),"the exercise engine must remain lazy and outside the public install shell");
    assert.ok(sandbox.PRECACHE.every(p=>!p.includes("data/core/")));
  } finally {rmSync(tmp,{recursive:true,force:true});}
});
