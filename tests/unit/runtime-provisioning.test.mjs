import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { readFileSync } from 'node:fs';
import { provisionPilot } from '../../scripts/provision_pilot_runtime.mjs';
const require=createRequire(import.meta.url),{PILOT,RUNTIME_HEALTH_SQL}=require('../../server/runtime-policy.cjs');
const manifest=JSON.parse(readFileSync(new URL('../../db/migrations/manifest.json',import.meta.url),'utf8'));
const CANARY='S'.repeat(64),ownerUrl='postgresql://'+PILOT.owner+':synthetic-operator@'+PILOT.directHost+'/'+PILOT.database+'?sslmode=require';
function setup(flags={}){
 const calls={clients:[],queries:[],cli:[],clears:0,updates:0},options={operatorUrl:ownerUrl,cliPath:'/synthetic/vercel/dist/vc.js',initial:true,verifiedBranch:PILOT.branchId};
 const goodRole={rolcanlogin:true,rolsuper:false,rolbypassrls:false,rolcreaterole:false,rolcreatedb:false,rolreplication:false,rolinherit:false,memberships:0};
 const deps={randomPassword:()=>CANARY,createClient:url=>{
  const role=new URL(url).username;calls.clients.push(role);
  return {transaction:async requests=>Promise.all(requests),query:async(sql,params=[])=>{
   calls.queries.push({sql,params,role});
   if(sql==='ALTER ROLE vita_pilot_app PASSWORD NULL'){calls.clears++;return [];}
   if(sql==='SELECT current_user AS role,current_database() AS database')return [{role:PILOT.owner,database:PILOT.database}];
   if(sql.startsWith('SELECT rolcanlogin'))return [{...goodRole,...flags.role}];
   if(sql.startsWith('SELECT version,checksum'))return manifest.migrations.map(m=>({version:m.version,checksum:m.checksum}));
   if(sql==='SELECT current_user AS role,session_user AS authenticated_role')return [{role:PILOT.role,authenticated_role:PILOT.role}];
   if(sql===RUNTIME_HEALTH_SQL)return [{ok:1,identity_verified:!flags.invalidIdentity}];
   if(sql.includes('DO $verify$')&&flags.badDenials)throw Error(CANARY);
   return [];
  }};
 },runCli:async(_path,args,input='')=>{
  calls.cli.push({args,input});if(flags.noCli)throw Error('403 '+CANARY);
  if(args[0]==='env'){calls.updates++;if(flags.updateFails)throw Error(CANARY);return 'CLI output not forwarded: '+CANARY;}
  if(args[1].includes('/env?'))return JSON.stringify({envs:[{id:'synthetic-env',key:'DATABASE_URL',target:flags.targets||['production','preview'],type:'sensitive',updatedAt:calls.updates?2:1}]});
  return JSON.stringify({id:PILOT.vercelProjectId,name:flags.wrongProject?'vita-reale':PILOT.vercelProjectName,accountId:PILOT.vercelTeamId});
 },health:async url=>new URL(url).username===PILOT.role?{status:flags.badRestrictedHealth?503:200,body:{status:flags.badRestrictedHealth?'unavailable':'ok'}}:{status:flags.badOwnerHealth?200:503,body:{status:flags.badOwnerHealth?'ok':'unavailable'}}};
 return {options,deps,calls};
}
test('initial provisioning retains the new credential only after restricted proof, health and scoped Secret handoff',async()=>{const s=setup(),r=await provisionPilot(s.options,s.deps);assert.equal(r.status,'PASS');assert.equal(r.credentialProvisioned,true);assert.equal(r.vercelUpdated,true);assert.equal(r.restrictedVerified,true);assert.equal(r.ownerHealthDenied,true);assert.equal(r.escalationDenials,52);assert.deepEqual(r.targets,['preview','production']);assert.equal(s.calls.clears,0);assert.equal(s.calls.updates,1);assert.deepEqual(s.calls.clients,[PILOT.owner,PILOT.role]);assert(!JSON.stringify(r).includes(CANARY));});
test('all Vercel operations are restricted to the named project/team and never place the secret in argv',async()=>{const s=setup();await provisionPilot(s.options,s.deps);for(const {args}of s.calls.cli){assert(!args.some(v=>v.includes(CANARY)||v.includes('://')));assert(!args.includes('--value'));assert(!args.some(v=>['deploy','promote','--prod','--token'].includes(v)));assert.equal(args[args.indexOf('--scope')+1],PILOT.vercelTeamId);}const update=s.calls.cli.find(c=>c.args[0]==='env');assert.equal(update.args[update.args.indexOf('--project')+1],PILOT.vercelProjectId);assert.equal(update.args[3],'preview');assert.equal(update.args[update.args.indexOf('--type')+1],'secret');assert.equal(new URL(update.input.trim()).username,PILOT.role);});
for(const flags of [{noCli:true},{wrongProject:true},{targets:['development']},{role:{rolbypassrls:true}},{role:{memberships:1}}])test('preflight failure cannot provision a credential: '+Object.keys(flags)[0],async()=>{const s=setup(flags),r=await provisionPilot(s.options,s.deps);assert.equal(r.status,'FAIL');assert.equal(r.credentialProvisioned,false);assert.equal(s.calls.updates,0);assert(!s.calls.queries.some(q=>q.sql.includes('provision_password')));assert(!JSON.stringify(r).includes(CANARY));});
for(const flags of [{invalidIdentity:true},{badDenials:true},{badRestrictedHealth:true},{badOwnerHealth:true}])test('runtime failure clears incomplete credentials and never updates Vercel: '+Object.keys(flags)[0],async()=>{const s=setup(flags),r=await provisionPilot(s.options,s.deps);assert.equal(r.status,'FAIL');assert.equal(r.credentialProvisioned,false);assert.equal(s.calls.updates,0);assert.equal(s.calls.clears,1);assert.equal(r.incompleteCredentialCleared,true);assert(!JSON.stringify(r).includes(CANARY));});
test('uncertain Vercel write fails closed and requires review instead of reverting to an owner URL',async()=>{const s=setup({updateFails:true}),r=await provisionPilot(s.options,s.deps);assert.equal(r.status,'FAIL');assert.equal(r.vercelUpdated,false);assert.equal(r.vercelUpdateRequiresReview,true);assert.equal(r.incompleteCredentialCleared,true);assert.equal(s.calls.updates,1);assert.equal(s.calls.clears,1);assert(!JSON.stringify(r).includes(CANARY));});
test('wrong branch confirmation and wrong operator role stop before remote operations',async()=>{for(const change of [{verifiedBranch:'main'},{operatorUrl:ownerUrl.replace(PILOT.owner,PILOT.role)},{initial:false}]){const s=setup(),r=await provisionPilot({...s.options,...change},s.deps);assert.equal(r.status,'FAIL');assert.equal(s.calls.clients.length,0);assert.equal(s.calls.cli.length,0);}});
test('operator SQL cannot query legacy tables or provision learner/payment records',async()=>{const s=setup();await provisionPilot(s.options,s.deps);const denialFixture=readFileSync(new URL('../fixtures/vita-pilot-runtime-denials.sql',import.meta.url),'utf8');for(const q of s.calls.queries){assert(!/\b(?:FROM|JOIN)\s+public\./i.test(q.sql));if(q.sql===denialFixture){assert.equal(q.role,PILOT.role);continue;}assert(!/\b(?:INSERT INTO|UPDATE|DELETE FROM)\s+vita_pilot\./i.test(q.sql));}});
