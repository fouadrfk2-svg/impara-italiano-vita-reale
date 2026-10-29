/* Public PWA performance budget: the install phase must not download the
 * full 150-entry manifest. Access to private lessons stays network-only. */
import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {join} from 'node:path';
import vm from 'node:vm';
const ROOT=process.cwd();
function worker(){
 const sandbox={self:{addEventListener(){},skipWaiting(){},clients:{claim(){}}}};
 vm.createContext(sandbox);
 vm.runInContext(readFileSync(join(ROOT,'sw.js'),'utf8'),sandbox);
 return {full:Array.from(sandbox.PRECACHE),install:Array.from(sandbox.INSTALL_SHELL),source:readFileSync(join(ROOT,'sw.js'),'utf8')};
}
test('first visit prefetch is bounded and keeps the complete manifest available',()=>{
 const w=worker();
 assert.ok(w.full.length>=100,'full shell declaration accidentally truncated');
 assert.ok(w.install.length<=50,'unexpected first-visit PWA request spike');
 assert.ok(w.install.length<w.full.length/2,'reduced installation must matter');
 assert.equal(new Set(w.install).size,w.install.length);
 assert.ok(w.install.every(p=>w.full.includes(p)),'only reviewed public assets can be preloaded');
});
test('offline guest boot has every parser-loaded script, stylesheet and manifest',()=>{
 const w=worker(),body=readFileSync(join(ROOT,'index.html'),'utf8').replace(/<!--[\\s\\S]*?-->/g,'');
 const files=[...body.matchAll(/<script\\b[^>]*\\ssrc\\s*=\\s*["']([^"']+)["']/gi)].map(m=>'./'+m[1]);
 for(const m of body.matchAll(/<link\\b[^>]*>/gi)){
  const tag=m[0],rel=tag.match(/\\brel=["']([^"']+)["']/i)?.[1];
  if(!['stylesheet','manifest'].includes(rel))continue;
  const href=tag.match(/\\bhref=["']([^"']+)["']/i)?.[1];
  if(href)files.push('./'+href);
 }
 for(const item of ['./','./index.html',...files])assert.ok(w.install.includes(item),'offline parser dependency missing: '+item);
});
test('no private lesson material is preloaded or intercepted by service worker',()=>{
 const w=worker();
 assert.equal(w.install.some(u=>['/api/','/data/core/','/audio/','/data/i18n/ar/'].some(p=>u.includes(p))),false);
 assert.ok(w.source.includes('if(/^\\/+api'),'API requests must bypass the SW');
 assert.ok(w.source.includes('Promise.all(INSTALL_SHELL.map'),'first-visit budget must be enforced');
});
