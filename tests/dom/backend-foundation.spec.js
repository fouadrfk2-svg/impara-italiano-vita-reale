const {test,expect}=require('@playwright/test');
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),http=require('node:http');
const ROOT=path.join(__dirname,'../..'),AXE=fs.readFileSync(require.resolve('axe-core/axe.min.js'),'utf8');
let server,base,probes=0;
test.beforeAll(async()=>{
 const {serwer}=await import('../../scripts/serve.mjs'),staticServer=serwer(),module={exports:{}};
 // Execute the real Vercel handler with a deterministic no-database probe. The real
 // Neon transport and SQL are tested independently by backend-health.test.mjs.
 vm.runInNewContext(fs.readFileSync(path.join(ROOT,'api/health.js'),'utf8'),{module,require:name=>{if(name!=='../server/database.cjs')throw Error('Unexpected import');return {checkDatabaseHealth:async()=>{probes++;}};}});
 server=http.createServer((req,res)=>{if(new URL(req.url,'http://local.test').pathname==='/api/health')return module.exports(req,res);staticServer.emit('request',req,res);});
 await new Promise(r=>server.listen(0,'127.0.0.1',r));base='http://127.0.0.1:'+server.address().port;
});
test.afterAll(async()=>{await new Promise(r=>server.close(r));});
for(const width of [390,1440])test.describe('Server boundary with unchanged Arabic frontend '+width,()=>{
 test.use({viewport:{width,height:920},serviceWorkers:'allow'});
 test('static UI, audio and learning state stay client-side; API/source/environment boundary is isolated',async({page})=>{
  const errors=[];page.on('pageerror',e=>errors.push(e.message));await page.addInitScript(AXE);
  await page.goto(base+'/index.html#/lezione?id=a1-u01-l1');await page.waitForFunction(()=>window.Core&&Core.registry.loaded.A1&&document.querySelector('.exq'));
  await expect(page.locator('html')).toHaveAttribute('lang','ar');await expect(page.locator('html')).toHaveAttribute('dir','rtl');
  const before=probes;expect(await page.evaluate(()=>typeof window.process)).toBe('undefined');expect(await page.evaluate(()=>typeof window.checkDatabaseHealth)).toBe('undefined');expect(probes).toBe(before);
  const response=await page.request.get(base+'/api/health');expect(response.status()).toBe(200);expect(await response.json()).toEqual({status:'ok'});expect(response.headers()['cache-control']).toBe('no-store');expect(response.headers()['set-cookie']).toBeUndefined();expect(probes).toBe(before+1);
  for(const file of ['.env.local','.vercel/project.json','server/database.cjs','api/health.js','package-lock.json']){const r=await page.request.get(base+'/'+file);expect(r.status()).toBe(404);expect(await r.text()).toBe('404');}
  const audio=await page.evaluate(()=>{const h=window.AUDIO_INDEX.slice(0,16);return '/audio/'+h.slice(0,2)+'/'+h+'.mp3';});const sound=await page.request.get(base+audio);expect(sound.status()).toBe(200);expect(sound.headers()['content-type']).toBe('audio/mpeg');
  await page.evaluate(()=>{Core.state.retention.pytanoOMiejsce=true;Core.recordLesson('a1-u01-l1',8,9,30);Core.state.writing['w-a2-giornata']={text:'Mi chiamo Sara.'};Core.save();});
  const saved=await page.evaluate(()=>JSON.parse(JSON.stringify(Core.state)));await page.waitForFunction(()=>{const s=JSON.parse(localStorage.getItem('linguai.italiano.v2'));return s&&s.lessons['a1-u01-l1'];});await page.reload();await page.waitForFunction(()=>window.Core&&document.querySelector('.exq'));expect(await page.evaluate(()=>JSON.parse(JSON.stringify(Core.state)))).toEqual(saved);
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1)).toBe(true);const violations=await page.evaluate(async()=>(await window.axe.run(document,{runOnly:{type:'tag',values:['wcag2a','wcag2aa','wcag21aa']}})).violations.map(v=>v.id));expect(violations).toEqual([]);expect(errors).toEqual([]);
 });
 test('service worker never caches API responses, serves stale API records or substitutes HTML offline',async({page,context})=>{
  await page.goto(base+'/index.html#/lezione?id=a1-u01-l1');await page.waitForFunction(()=>window.Core&&Core.registry.loaded.A1);await page.evaluate(()=>navigator.serviceWorker.ready);if(!await page.evaluate(()=>!!navigator.serviceWorker.controller)){await page.reload();await page.waitForFunction(()=>window.Core&&document.querySelector('.exq'));}await page.waitForFunction(()=>!!navigator.serviceWorker.controller);
  await page.reload();await page.waitForFunction(()=>window.Core&&document.querySelector('.exq'));
  const before=probes;expect(await page.evaluate(async()=>{const r=await fetch('/api/health');return {status:r.status,body:await r.json()};})).toEqual({status:200,body:{status:'ok'}});expect(probes).toBe(before+1);
  expect(await page.evaluate(async()=>{for(const name of await caches.keys()){const c=await caches.open(name);if(await c.match('/api/health'))return true;}return false;})).toBe(false);
  // Simulate a stale private API response from an older worker. It must never be used.
  await page.evaluate(async()=>{const c=await caches.open('synthetic-old-api-cache');await c.put('/api/health',new Response('{"status":"SYNTHETIC_STALE_PRIVATE"}',{headers:{'Content-Type':'application/json'}}));});
  expect(await page.evaluate(async()=>await(await fetch('/api/health')).json())).toEqual({status:'ok'});
  await context.setOffline(true);const offline=await page.evaluate(async()=>{try{const r=await fetch('/api/health');return {failed:false,status:r.status,text:await r.text()};}catch{return {failed:true};}});expect(offline).toEqual({failed:true});
  await page.reload();await page.waitForFunction(()=>window.Core&&document.querySelector('.exq'));await expect(page.locator('html')).toHaveAttribute('dir','rtl');expect(await page.evaluate(()=>I18n.lang)).toBe('ar');await context.setOffline(false);
 });
});
