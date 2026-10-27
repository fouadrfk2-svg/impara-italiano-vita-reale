import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {createServer} from 'node:http';
import {readFileSync,readdirSync} from 'node:fs';
import {join} from 'node:path';
import vm from 'node:vm';
import {ROOT,loadEngine,CORE} from './_harness.mjs';
const require=createRequire(import.meta.url),{isPrivateContent}=require('../../server/content-path.cjs'),{createContentHandler}=require('../../server/content-api.cjs');
const read=f=>readFileSync(join(ROOT,f),'utf8');
for(const f of ['data/core/a1-01.js','data/i18n/ar/a1-01.js','data/audio-index.js','audio/00/0000000000000000.mp3','assets/js/verbs-data.js','assets/js/drills-lex.js'])test('private delivery classification '+f,()=>assert(isPrivateContent(f)));
for(const f of ['data/i18n/ui-ar.js','.env','server/database.cjs','data/core/../../server/database.cjs','data/core/%2e%2e.js','data/core/a1-01.js/extra','audio/aa/invalid.mp3','data/core/UPPER.js'])test('cannot use the content handler for '+f,()=>assert(!isPrivateContent(f)));
test('content requires a learner cookie and fresh active entitlement, never Admin or local flags; supports authorized ranges',async()=>{
 const old=process.env.PILOT_AUTH_SECRET;process.env.PILOT_AUTH_SECRET='A'.repeat(43);let calls=0,mode='ok';
 const handler=createContentHandler({run:async(action,p)=>{calls++;assert.equal(action,'session');assert.match(p.token,/^[a-f0-9]{64}$/);if(mode==='revoked'){const e=Error('private');e.code='42501';throw e;}if(mode==='offline')throw Error('private');return {authenticated:true};}});
 const server=createServer(handler);await new Promise(r=>server.listen(0,'localhost',r));const base='http://localhost:'+server.address().port,cookie='__Host-vita_pilot='+'A'.repeat(43);
 try{
  for(const headers of [{},{Cookie:'__Host-vita_pilot_admin='+'A'.repeat(43)},{Cookie:cookie+'; '+cookie}])assert.equal((await fetch(base+'/data/core/a1-01.js',{headers})).status,401);
  assert.equal(calls,0);
  let r=await fetch(base+'/data/core/a1-01.js',{headers:{Cookie:cookie}});assert.equal(r.status,200);assert.equal(await r.text(),read('data/core/a1-01.js'));assert.match(r.headers.get('cache-control'),/private, no-store/);assert.equal(r.headers.get('vary'),'Cookie');
  const audioDirs=readdirSync(join(ROOT,'audio')).filter(f=>/^[a-f0-9]{2}$/.test(f));const dir=audioDirs[0],file=readdirSync(join(ROOT,'audio',dir)).find(f=>f.endsWith('.mp3')),url=base+'/audio/'+dir+'/'+file;
  r=await fetch(url,{headers:{Cookie:cookie,Range:'bytes=0-15'}});assert.equal(r.status,206);assert.equal((await r.arrayBuffer()).byteLength,16);assert.match(r.headers.get('content-range'),/^bytes 0-15\//);
  r=await fetch(url,{method:'HEAD',headers:{Cookie:cookie}});assert.equal(r.status,200);assert.equal((await r.arrayBuffer()).byteLength,0);
  assert.equal((await fetch(url,{headers:{Cookie:cookie,Range:'bytes=0-1,4-5'}})).status,416);
  mode='revoked';assert.equal((await fetch(url,{headers:{Cookie:cookie,Range:'bytes=0-15'}})).status,401);
  mode='offline';assert.equal((await fetch(base+'/data/core/a1-01.js',{headers:{Cookie:cookie}})).status,503);
  mode='ok';for(const url of ['/api/content?path=../.env','/api/content?path=data/core/a1-01.js&path=data/core/a2-01.js','/api/content?path=data/core/a1-01.js&other=1'])assert.equal((await fetch(base+url,{headers:{Cookie:cookie}})).status,404);
  assert.equal((await fetch(base+'/data/core/a1-01.js',{method:'POST',headers:{Cookie:cookie}})).status,405);
 }finally{await new Promise(r=>server.close(r));if(old===undefined)delete process.env.PILOT_AUTH_SECRET;else process.env.PILOT_AUTH_SECRET=old;}
});
test('every existing course dataset and recording is excluded from precache; worker never intercepts private assets',()=>{
 const events={},box={URL,console,self:{location:{origin:'https://pilot.example'},addEventListener:(k,f)=>events[k]=f},fetch:()=>{throw Error('private assets must not enter worker');}};vm.runInNewContext(read('sw.js'),box);
 assert(!box.PRECACHE.some(p=>isPrivateContent(p.replace(/^\.\//,''))));
 for(const path of ['/data/core/a1-01.js','/%64ata/i18n/ar/readings.js','/audio/ab/0123456789abcdef.mp3','/assets/js/verbs-data.js','/api/content?path=data/core/a1-01.js']){let caught=false;events.fetch({request:{method:'GET',url:'https://pilot.example'+path},respondWith(){caught=true;}});assert.equal(caught,false,path);}
});
test('router guard stops view execution, cleanup and content rendering until access is allowed',()=>{
 const box=loadEngine({files:[...CORE,'assets/js/router.js']}),s=box.sandbox;let rendered=0;s.Views={percorso(){rendered++;},onLeave:null};box.el('main');s.Router.beforeRender=()=>false;s.Router.render('percorso',{});assert.equal(rendered,0);s.Router.beforeRender=()=>true;s.Router.render('percorso',{});assert.equal(rendered,1);s.Router.render('constructor',{});assert.equal(rendered,2,'inherited properties cannot become views');
 assert.doesNotThrow(()=>s.Router.decode('#/lezione?id=%FF'));assert.equal(Object.hasOwn(s.Router.decode('#/lezione?__proto__=bad').params,'__proto__'),false);
});
test('HTML gates the shell before first paint and defers all protected content until verification',()=>{
 const html=read('index.html');assert.match(html,/data-access="checking"/);for(const m of html.matchAll(/<script src="([^"]+)"/g))assert(!isPrivateContent(m[1]),m[1]);assert.match(html,/<script type="application\/json" data-course-src="data\/core\/curriculum-index.js"/);assert.match(read('assets/js/app.js'),/await global.Account.refresh\(\)/);assert.match(read('assets/css/guest.css'),/html:not\(\[data-access="learner"\]\)/);
});
