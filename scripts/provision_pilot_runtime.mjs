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
export const VERCEL_DEPLOY_TIMEOUT_MS=15*60*1000;
export const VERCEL_CLI_TIMEOUT_MS=30*1000;
export const VERCEL_TIMEOUT_KILL_GRACE_MS=5*1000;
function ensure(condition){if(!condition)throw Error('Operator verification failed');}
function unpack(value){return value?.result??value;}
function cliMessage(stderr,stdout){
 const candidates=[];
 for(const chunk of [stderr,stdout]){let raw=String(chunk||'').replace(new RegExp(String.fromCharCode(27)+'\\[[0-9;]*m','g'),'').trim();if(!raw)continue;try{const parsed=JSON.parse(raw),nested=typeof parsed.error==='object'?parsed.error:{};raw=[typeof parsed.error==='string'?parsed.error:null,nested.message,parsed.message,parsed.reason,nested.code,parsed.code].filter(x=>typeof x==='string').join(': ')||raw;}catch{/* Vercel may emit human-readable output instead of JSON. */}candidates.push(...raw.split(/[\r\n]+/).map(x=>x.trim()).filter(Boolean));}
 return candidates.find(x=>/error|failed|failure|invalid|unauthorized|forbidden|not found|too large|too many|timeout|timed out|unable|cannot/i.test(x))||candidates[0]||'';
}
function deploymentErrorCategory(stderr,exitCode,stdout=''){const s=(String(stderr||'')+' '+String(stdout||'')).toLowerCase();if(/invalid token|unauthorized|not authenticated|authentication required|login required|token expired/.test(s))return'vercel_authentication_failed';if(/scope.*not found|team.*not found|project.*not found|project does not exist|permission denied|not authorized/.test(s))return'vercel_target_not_found';if(/too many files|file count|payload.*too large|deployment.*too large|request entity too large|upload.*size limit|413 payload|deployment size limit/.test(s))return'vercel_deployment_payload_too_large';if(/unknown or unexpected option|invalid arguments|unknown option/.test(s))return'vercel_cli_arguments_invalid';if(/build failed|deployment failed|error during build/.test(s))return'vercel_build_failed';if(/network|timeout|timed out|econnreset|enotfound/.test(s))return'vercel_network_failed';return exitCode===0?'deployment_result_unrecognized':'vercel_cli_failed';}
export function safeDeploymentStderr(stderr,exitCode,stdout=''){
 const category=deploymentErrorCategory(stderr,exitCode,stdout);let message=cliMessage(stderr,stdout);
 message=message.replace(/postgres(?:ql)?:\/\/[^\s"'<>]+/gi,'[redacted database URL]').replace(/https?:\/\/[^\s"'<>]+/gi,'[redacted URL]').replace(/\bBearer\s+[^\s,;]+/gi,'Bearer [redacted]').replace(/\b(?:vcp|vercel)_[A-Za-z0-9_-]{8,}\b/gi,'[redacted token]').replace(/\b(?:PILOT_AUTH_SECRET|DATABASE_URL|ADMIN_ACCESS_KEY|VERCEL_TOKEN|[A-Z][A-Z0-9_]*(?:TOKEN|SECRET|PASSWORD|API_KEY))\s*[:=]\s*[^\s,;]+/gi,'[redacted setting]').replace(/[A-Za-z]:\\(?:[^\\\s]+\\)*[^\\\s]*/g,'[local path]').replace(/\s+/g,' ').slice(0,240).trim();
 const fallback={vercel_authentication_failed:'Vercel CLI authentication was rejected.',vercel_target_not_found:'The requested Vercel team or project was not found or not authorized.',vercel_deployment_payload_too_large:'Vercel rejected the deployment source size or file count.',vercel_cli_arguments_invalid:'Vercel CLI rejected one or more deployment arguments.',vercel_build_failed:'Vercel reported a deployment build failure.',vercel_network_failed:'The Vercel CLI reported a network failure.',deployment_result_unrecognized:'The Vercel CLI did not return a recognizable Production deployment URL.',vercel_cli_failed:'The Vercel CLI returned an error.'};
 if(!message)message=fallback[category];return{category,sanitizedStderr:message,source:String(stderr||'').trim()?'stderr':String(stdout||'').trim()?'stdout':'unavailable'};
}
function deploymentTimeoutDiagnostic(timeoutMs,exitCode,stderr,stdout){const captured=safeDeploymentStderr(stderr,exitCode,stdout),progress=captured.source==='unavailable'?null:captured.sanitizedStderr;return{operation:'vercel deploy',exitCode,timedOut:true,timeoutMs,category:'vercel_network_failed',sanitizedStderr:`Vercel CLI deployment exceeded its bounded wrapper timeout (${timeoutMs} ms) and was terminated.`,...(progress?{lastProgress:progress,outputSource:captured.source}:{})};}
export function parseVercelDeploymentUrl(output){const text=String(output||''),labeled=text.match(/\bProduction(?:\s+deployment)?:\s*(https:\/\/[a-z0-9-]+\.vercel\.app\b)/i);if(labeled)return labeled[1];const urls=[...new Set(text.match(/https:\/\/[a-z0-9-]+\.vercel\.app\b/gi)||[])];return urls.length===1?urls[0]:null;}
function envMetadata(e){return {id:e.id,key:e.key,type:e.type,target:[...(e.target||[])].sort(),gitBranch:e.gitBranch??null,customEnvironmentIds:e.customEnvironmentIds||[],updatedAt:e.updatedAt};}
function databaseEnv(data){const envs=unpack(data).envs;ensure(Array.isArray(envs));const matches=envs.filter(e=>e.key==='DATABASE_URL');ensure(matches.length===1);const entry=envMetadata(matches[0]);ensure(JSON.stringify(entry.target)===JSON.stringify(TARGETS)&&!entry.gitBranch&&entry.customEnvironmentIds.length===0&&['sensitive','secret'].includes(entry.type));return {entry,others:envs.filter(e=>e.key!=='DATABASE_URL').map(envMetadata).sort((a,b)=>a.id.localeCompare(b.id))};}

// Private pipes: neither the secret stdin nor CLI stdout/stderr is forwarded to logs.
export async function invokeCli(cliPath,args,input='',limits={}){
 ensure(isAbsolute(cliPath)&&cliPath.replaceAll('\\','/').endsWith('/vercel/dist/vc.js'));
 const pkg=JSON.parse(readFileSync(join(dirname(cliPath),'../package.json'),'utf8'));ensure(pkg.name==='vercel');
 const env={...process.env,NO_COLOR:'1',VERCEL_TELEMETRY_DISABLED:'1',DO_NOT_TRACK:'1'};
 for(const key of ['DATABASE_URL','DEBUG','VERCEL_DEBUG','VERCEL_LOG_LEVEL'])delete env[key];
 return await new Promise((done,fail)=>{
  const child=spawn(process.execPath,[cliPath,...args],{cwd:ROOT,env,windowsHide:true,stdio:['pipe','pipe','pipe']});
  let output='',stderr='',overflow=false,timedOut=false,settled=false,graceTimer;const deployment=args[0]==='deploy';const timeoutMs=deployment?(limits.deployTimeoutMs??VERCEL_DEPLOY_TIMEOUT_MS):(limits.commandTimeoutMs??VERCEL_CLI_TIMEOUT_MS);
  const timer=setTimeout(()=>{timedOut=true;child.kill();graceTimer=setTimeout(()=>{const error=Error('CLI unavailable');if(deployment)error.safeDeploymentDiagnostic=deploymentTimeoutDiagnostic(timeoutMs,null,stderr,output);if(!settled){settled=true;fail(error);}},limits.killGraceMs??VERCEL_TIMEOUT_KILL_GRACE_MS);},timeoutMs);
  child.stdout.on('data',d=>{output+=d;if(output.length>2097152){overflow=true;child.kill();}});
  child.stderr.on('data',d=>{if(stderr.length<65536)stderr+=d.toString().slice(0,65536-stderr.length);});child.on('error',()=>{clearTimeout(timer);clearTimeout(graceTimer);if(!settled){settled=true;fail(Error('CLI unavailable'));}});
  child.on('close',code=>{clearTimeout(timer);clearTimeout(graceTimer);if(settled)return;settled=true;if(timedOut){const error=Error('CLI unavailable');if(deployment)error.safeDeploymentDiagnostic=deploymentTimeoutDiagnostic(timeoutMs,code,stderr,output);fail(error);}else if(code!==0||overflow){const error=Error('CLI unavailable');if(deployment)error.safeDeploymentDiagnostic={operation:'vercel deploy',exitCode:code,...safeDeploymentStderr(stderr,code,output)};fail(error);}else done(deployment?output+'\n'+stderr:output);});
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
