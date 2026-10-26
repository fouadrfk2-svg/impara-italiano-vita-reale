// OPERATOR ONLY. Never imported by application routes or public assets.
import { randomBytes } from 'node:crypto';
import { spawn } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { dirname, join, resolve, isAbsolute } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';
const require=createRequire(import.meta.url),{neon}=require('@neondatabase/serverless');
const {PILOT,parsePilotUrl,RUNTIME_HEALTH_SQL}=require('../server/runtime-policy.cjs');
const ROOT=resolve(dirname(fileURLToPath(import.meta.url)),'..');
const TARGETS=['preview','production'];
function ensure(condition){if(!condition)throw Error('Operator verification failed');}
function unpack(value){return value?.result??value;}
function envMetadata(e){return {id:e.id,key:e.key,type:e.type,target:[...(e.target||[])].sort(),gitBranch:e.gitBranch??null,customEnvironmentIds:e.customEnvironmentIds||[],updatedAt:e.updatedAt};}
function databaseEnv(data){const envs=unpack(data).envs;ensure(Array.isArray(envs));const matches=envs.filter(e=>e.key==='DATABASE_URL');ensure(matches.length===1);const entry=envMetadata(matches[0]);ensure(JSON.stringify(entry.target)===JSON.stringify(TARGETS)&&!entry.gitBranch&&entry.customEnvironmentIds.length===0&&['sensitive','secret'].includes(entry.type));return {entry,others:envs.filter(e=>e.key!=='DATABASE_URL').map(envMetadata).sort((a,b)=>a.id.localeCompare(b.id))};}

// Private pipes: neither the secret stdin nor CLI stdout/stderr is forwarded to logs.
export async function invokeCli(cliPath,args,input=''){
 ensure(isAbsolute(cliPath)&&cliPath.replaceAll('\\','/').endsWith('/vercel/dist/vc.js'));
 const pkg=JSON.parse(readFileSync(join(dirname(cliPath),'../package.json'),'utf8'));ensure(pkg.name==='vercel');
 const env={...process.env,NO_COLOR:'1',VERCEL_TELEMETRY_DISABLED:'1',DO_NOT_TRACK:'1'};
 for(const key of ['DATABASE_URL','DEBUG','VERCEL_DEBUG','VERCEL_LOG_LEVEL'])delete env[key];
 return await new Promise((done,fail)=>{
  const child=spawn(process.execPath,[cliPath,...args],{cwd:ROOT,env,windowsHide:true,stdio:['pipe','pipe','pipe']});
  let output='',overflow=false;const timer=setTimeout(()=>{child.kill();fail(Error('CLI unavailable'));},30000);
  child.stdout.on('data',d=>{output+=d;if(output.length>2097152){overflow=true;child.kill();}});
  child.stderr.on('data',()=>{});child.on('error',()=>{clearTimeout(timer);fail(Error('CLI unavailable'));});
  child.on('close',code=>{clearTimeout(timer);if(code!==0||overflow)fail(Error('CLI unavailable'));else done(output);});
  child.stdin.on('error',()=>{});child.stdin.end(input);
 });
}
export async function localHealth(url){
 const previous=process.env.DATABASE_URL;
 try{
  process.env.DATABASE_URL=url;const handler=require('../api/health.js');const res={setHeader(){},end(body){this.body=JSON.parse(body);}};
  await handler({method:'GET'},res);return {status:res.statusCode,body:res.body};
 }finally{if(previous===undefined)delete process.env.DATABASE_URL;else process.env.DATABASE_URL=previous;}
}
export async function provisionPilot(options,deps={}){
 const createClient=deps.createClient||neon,runCli=deps.runCli||invokeCli,health=deps.health||localHealth,generate=deps.randomPassword||(()=>randomBytes(48).toString('base64url'));
 let owner,passwordAttempted=false,vercelAttempted=false,phase='operator target';
 const result={credentialProvisioned:false,vercelUpdated:false,restrictedVerified:false};
 try{
  ensure(options.initial===true&&options.verifiedBranch===PILOT.branchId);
  const operator=parsePilotUrl(options.operatorUrl,PILOT.owner);operator.hostname=PILOT.directHost;
  const api=async endpoint=>unpack(JSON.parse(await runCli(options.cliPath,['api',endpoint,'--method','GET','--scope',PILOT.vercelTeamId,'--raw','--non-interactive'])));
  const projectEndpoint='/v9/projects/'+PILOT.vercelProjectId+'?teamId='+PILOT.vercelTeamId;
  const envEndpoint='/v9/projects/'+PILOT.vercelProjectId+'/env?teamId='+PILOT.vercelTeamId;
  phase='Vercel preflight';
  const project=await api(projectEndpoint);ensure(project.id===PILOT.vercelProjectId&&project.name===PILOT.vercelProjectName&&project.accountId===PILOT.vercelTeamId);
  const before=databaseEnv(await api(envEndpoint));
  phase='Neon preflight';owner=createClient(operator.toString());
  const identity=await owner.query('SELECT current_user AS role,current_database() AS database');ensure(identity.length===1&&identity[0].role===PILOT.owner&&identity[0].database===PILOT.database);
  const role=await owner.query("SELECT rolcanlogin,rolsuper,rolbypassrls,rolcreaterole,rolcreatedb,rolreplication,rolinherit,(SELECT count(*)::int FROM pg_catalog.pg_auth_members WHERE member=r.oid) AS memberships FROM pg_catalog.pg_roles r WHERE rolname='vita_pilot_app'");
  ensure(role.length===1&&role[0].rolcanlogin&&role[0].memberships===0&&['rolsuper','rolbypassrls','rolcreaterole','rolcreatedb','rolreplication','rolinherit'].every(k=>role[0][k]===false));
  const manifest=JSON.parse(readFileSync(join(ROOT,'db/migrations/manifest.json'),'utf8'));
  const ledger=await owner.query('SELECT version,checksum FROM vita_pilot.schema_migrations ORDER BY version');ensure(JSON.stringify(ledger)===JSON.stringify(manifest.migrations.map(m=>({version:m.version,checksum:m.checksum}))));
  phase='credential provisioning';const password=generate();ensure(typeof password==='string'&&/^[A-Za-z0-9_-]{64}$/.test(password));
  passwordAttempted=true;
  await owner.transaction([owner.query("SELECT set_config('vita_pilot.provision_password',$1,true)",[password]),owner.query("DO $p$ BEGIN EXECUTE format('ALTER ROLE vita_pilot_app PASSWORD %L',current_setting('vita_pilot.provision_password')); END $p$")]);
  const runtimeUrl=new URL(operator.toString());runtimeUrl.hostname=PILOT.directHost;runtimeUrl.username=PILOT.role;runtimeUrl.password=password;
  phase='restricted verification';const runtime=createClient(runtimeUrl.toString());
  const auth=await runtime.query('SELECT current_user AS role,session_user AS authenticated_role');ensure(auth.length===1&&auth[0].role===PILOT.role&&auth[0].authenticated_role===PILOT.role);
  const verified=await runtime.query(RUNTIME_HEALTH_SQL);ensure(verified.length===1&&verified[0].ok===1&&verified[0].identity_verified===true);
  await runtime.query(readFileSync(join(ROOT,'tests/fixtures/vita-pilot-runtime-denials.sql'),'utf8'));
  result.restrictedVerified=true;result.escalationDenials=52;
  phase='health contract';const restrictedHealth=await health(runtimeUrl.toString()),ownerHealth=await health(operator.toString());
  ensure(restrictedHealth.status===200&&JSON.stringify(restrictedHealth.body)==='{"status":"ok"}');
  ensure(ownerHealth.status===503&&JSON.stringify(ownerHealth.body)==='{"status":"unavailable"}');
  result.restrictedHealth='PASS';result.ownerHealthDenied=true;
  phase='Vercel secret update';vercelAttempted=true;
  // No value, token or URI in argv. No environment pull, link, project creation or deploy.
  await runCli(options.cliPath,['env','update','DATABASE_URL','preview','--project',PILOT.vercelProjectId,'--scope',PILOT.vercelTeamId,'--type','secret','--yes','--non-interactive'],runtimeUrl.toString()+'\n');
  phase='Vercel verification';const after=databaseEnv(await api(envEndpoint));
  ensure(after.entry.id===before.entry.id&&JSON.stringify(after.entry.target)===JSON.stringify(before.entry.target)&&JSON.stringify(after.others)===JSON.stringify(before.others));
  if(before.entry.updatedAt!==undefined&&after.entry.updatedAt!==undefined)ensure(after.entry.updatedAt>before.entry.updatedAt);
  const projectAfter=await api(projectEndpoint);ensure(projectAfter.id===project.id&&projectAfter.name===project.name&&projectAfter.accountId===project.accountId);
  const final=await runtime.query(RUNTIME_HEALTH_SQL);ensure(final.length===1&&final[0].identity_verified===true);
  result.credentialProvisioned=true;result.vercelUpdated=true;result.project=PILOT.vercelProjectName;result.targets=[...TARGETS];result.status='PASS';
  return result;
 }catch{
  result.status='FAIL';result.phase=phase;
  if(passwordAttempted){try{await owner.query('ALTER ROLE vita_pilot_app PASSWORD NULL');result.incompleteCredentialCleared=true;}catch{result.incompleteCredentialCleared=false;}}
  if(vercelAttempted)result.vercelUpdateRequiresReview=true;
  return result;
 }
}
async function main(){
 const args=process.argv.slice(2);let cliPath,verifiedBranch,initial=false;
 for(let i=0;i<args.length;i++){if(args[i]==='--initial')initial=true;else if(args[i]==='--vercel-cli')cliPath=args[++i];else if(args[i]==='--verified-branch')verifiedBranch=args[++i];else throw Error('Unsupported operator option');}
 ensure(initial&&verifiedBranch===PILOT.branchId&&cliPath);
 if(process.stdin.isTTY)process.stdin.setRawMode(true);process.stdin.setEncoding('utf8');
 process.stdout.write('Operator connection input ready; echo disabled. No value will be displayed.\n');
 let input='';await new Promise((done,fail)=>{process.stdin.on('data',chunk=>{input+=chunk;if(input.length>16384){fail(Error('Input rejected'));return;}if(/[\r\n]/.test(input)){process.stdin.removeAllListeners('data');process.stdin.pause();done();}});process.stdin.on('end',()=>input?done():fail(Error('Input unavailable')));});
 const result=await provisionPilot({operatorUrl:input.split(/[\r\n]/)[0],cliPath,verifiedBranch,initial});input='';process.stdout.write(JSON.stringify(result)+'\n');process.exit(result.status==='PASS'?0:1);
}
if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url))main().catch(()=>{process.stdout.write('{"status":"FAIL","phase":"operator input"}\n');process.exit(1);});
