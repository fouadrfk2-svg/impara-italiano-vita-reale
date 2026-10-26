'use strict';
// Synthetic PostgreSQL adapter for tests only; never imported by API functions.
const {PGlite}=require('@electric-sql/pglite');
const fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'../..');
const {mac,createHandler}=require('../../server/account-api.cjs');
const {RUNTIME_HEALTH_SQL}=require('../../server/runtime-policy.cjs');
const ADMIN='20000000-0000-4000-8000-000000000010',ADMIN_KEY='B'.repeat(43);
async function createDatabase(){
 const initial=new PGlite();await initial.exec('CREATE ROLE vita_reale_test_owner SUPERUSER LOGIN');await initial.exec('CREATE DATABASE vita_reale_test OWNER vita_reale_test_owner');const data=await initial.dumpDataDir('none');await initial.close();
 const db=new PGlite({loadDataDir:data,username:'vita_reale_test_owner',database:'vita_reale_test'});
 await db.exec("BEGIN; SET LOCAL vita_pilot.migration_target='vita-reale-arabic-pilot'");
 for(const m of JSON.parse(fs.readFileSync(path.join(root,'db/migrations/manifest.json'))).migrations)await db.exec(fs.readFileSync(path.join(root,'db/migrations',m.file),'utf8'));
 await db.exec('COMMIT');return db;
}
async function begin(db){
 await db.exec('SET SESSION AUTHORIZATION vita_reale_test_owner; RESET ROLE; BEGIN');
 await db.query('INSERT INTO vita_pilot.admin_principals(id) VALUES($1)',[ADMIN]);
 await db.query("INSERT INTO vita_pilot.admin_credentials(admin_id,credential_hash,expires_at,enabled) VALUES($1,decode($2,'hex'),clock_timestamp()+interval '1 day',true)",[ADMIN,mac('admin_credential',ADMIN_KEY)]);
 await db.exec('GRANT EXECUTE ON FUNCTION vita_pilot.account_request(text,jsonb) TO vita_pilot_app; SET LOCAL SESSION AUTHORIZATION vita_pilot_app');
}
async function rollback(db){await db.exec('ROLLBACK; SET SESSION AUTHORIZATION vita_reale_test_owner; RESET ROLE');}
const queues=new WeakMap();
function runtime(db){return (action,body)=>{const task=(queues.get(db)||Promise.resolve()).then(async()=>{
 await db.exec('SAVEPOINT api_operation');
 try{
  const checked=(await db.query(RUNTIME_HEALTH_SQL)).rows[0];if(!checked.identity_verified)throw Error('Restricted policy failed');
  const result=(await db.query('SELECT vita_pilot.account_request($1::text,$2::jsonb) result',[action,JSON.stringify(body)])).rows[0].result;
  await db.exec('RELEASE api_operation');return result;
 }catch(e){await db.exec('ROLLBACK TO api_operation; RELEASE api_operation');throw e;}
});queues.set(db,task.catch(()=>{}));return task;};}
function client(db,remote='synthetic-device'){
 let cookies={},learnerCsrf='',adminCsrf='',learnerId='';const run=runtime(db);
 async function request(route,body,options={}){
  const admin=route.startsWith('admin/'),read=route.endsWith('/session')||route==='admin/list'||(route==='learner/progress'&&body===undefined);
  const req={method:options.method||(read?'GET':'POST'),headers:{host:'localhost:8080',origin:'http://localhost:8080','content-type':'application/json','x-vita-request':'1','x-vita-account':learnerId,'x-vita-csrf':admin?adminCsrf:learnerCsrf,cookie:Object.entries(cookies).map(([k,v])=>k+'='+v).join('; '),...options.headers},body:body??{},socket:{remoteAddress:remote}};
  const res={headers:{},setHeader(k,v){this.headers[k.toLowerCase()]=v;},end(v){this.body=JSON.parse(v);}};
  await createHandler(route,{run})(req,res);
  if(res.headers['set-cookie']){const kv=res.headers['set-cookie'].split(';')[0].split('=');if(kv[1])cookies[kv[0]]=kv[1];else delete cookies[kv[0]];}
  if(res.body?.csrf){if(admin)adminCsrf=res.body.csrf;else learnerCsrf=res.body.csrf;}
  if(!admin&&res.body?.learnerId)learnerId=res.body.learnerId;
  return res;
 }
 return {request,get cookies(){return {...cookies};},get csrf(){return learnerCsrf;}};
}
async function issue(admin,options={}){const expires=new Date(Date.now()+86400000).toISOString();const r=await admin.request('admin/operation',{action:'issue',requestId:crypto.randomUUID(),codeExpiresAt:expires,accessExpiresAt:new Date(Date.now()+172800000).toISOString(),...options});if(r.statusCode!==200)throw Error('Synthetic issuance failed: '+r.statusCode);return r.body;}
module.exports={createDatabase,begin,rollback,runtime,client,issue,ADMIN,ADMIN_KEY};
