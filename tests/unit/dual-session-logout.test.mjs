import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const { createHandler, mac } = require('../../server/account-api.cjs');
const prior = { PILOT_AUTH_SECRET: process.env.PILOT_AUTH_SECRET, VERCEL: process.env.VERCEL, VERCEL_URL: process.env.VERCEL_URL };
before(() => { process.env.PILOT_AUTH_SECRET = 'A'.repeat(43); process.env.VERCEL='1'; process.env.VERCEL_URL='vita-reale-arabic-demo.vercel.app'; });
after(() => { for(const [key,value] of Object.entries(prior)) { if(value===undefined) delete process.env[key]; else process.env[key]=value; } });
function request(admin){
 const token = 'B'.repeat(43);
 const prefix = admin ? '__Host-vita_pilot_admin' : '__Host-vita_pilot';
 return { method:'POST', body:{}, headers:{
  origin:'https://vita-reale-arabic-demo.vercel.app', host:'vita-reale-arabic-demo.vercel.app',
  'x-vita-request':'1', 'content-type':'application/json',
  'x-vita-csrf':mac(admin?'admin_csrf':'learner_csrf',token),
  cookie:prefix+'='+token+'; __Host-vita_billing='+'C'.repeat(43)
 }};
}
function response(){return {headers:{},setHeader(k,v){this.headers[k]=v;},end(body){this.body=body;}};}
test('learner logout clears both learner and email sign-in cookies, without wiping course progress',async()=>{
 const calls=[],handler=createHandler('auth/logout',{run:async(action,payload)=>{calls.push(action);return {ok:true};}});
 const res=response();await handler(request(false),res);
 assert.equal(res.statusCode,200);
 assert.deepEqual(calls,['logout']);
 assert.equal(Array.isArray(res.headers['Set-Cookie']),true);
 assert.equal(res.headers['Set-Cookie'].length,2);
 assert.match(res.headers['Set-Cookie'][0],/^__Host-vita_pilot=; Path=\/; HttpOnly; Secure; SameSite=Strict; Max-Age=0$/);
 assert.match(res.headers['Set-Cookie'][1],/^__Host-vita_billing=; Path=\/; HttpOnly; Secure; SameSite=Strict; Max-Age=0$/);
});
test('admin logout only clears the admin cookie',async()=>{
 const handler=createHandler('admin/logout',{run:async()=>({ok:true})}),res=response();
 await handler(request(true),res);
 assert.equal(res.statusCode,200);
 assert.equal(Array.isArray(res.headers['Set-Cookie']),false);
 assert.match(res.headers['Set-Cookie'],/^__Host-vita_pilot_admin=; Path=\/; HttpOnly; Secure; SameSite=Strict; Max-Age=0$/);
});
