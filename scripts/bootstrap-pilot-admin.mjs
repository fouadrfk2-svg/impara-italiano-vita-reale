// Trusted operator only. No server route imports this module. No secret argv/output.
import {randomBytes,randomUUID,createHmac} from 'node:crypto';
import {readFileSync,existsSync,realpathSync} from 'node:fs';
import {dirname,resolve,relative,isAbsolute,join} from 'node:path';
import {fileURLToPath} from 'node:url';
import {spawn} from 'node:child_process';
import {createRequire} from 'node:module';
import {invokeCli} from './provision_pilot_runtime.mjs';
const require=createRequire(import.meta.url),{neon}=require('@neondatabase/serverless'),{PILOT,parsePilotUrl}=require('../server/runtime-policy.cjs');
const ROOT=resolve(dirname(fileURLToPath(import.meta.url)),'..');
function ensure(v){if(!v)throw Error('Operator verification failed');}
function unpack(v){return v?.result??v;}
export async function protectVault(vaultPath,content){
 ensure(isAbsolute(vaultPath)&&vaultPath.endsWith('.dpapi')&&!existsSync(vaultPath));
 const parent=realpathSync(dirname(vaultPath));for(const forbidden of [ROOT,resolve(ROOT,'../vita-reale')])ensure(relative(forbidden,parent).startsWith('..'));
 return await new Promise((done,fail)=>{
  const child=spawn('pwsh.exe',['-NoProfile','-NonInteractive','-File',join(ROOT,'scripts/protect-pilot-vault.ps1'),'-VaultPath',vaultPath],{windowsHide:true,stdio:['pipe','pipe','pipe']});
  let output='';const timeout=setTimeout(()=>{child.kill();fail(Error('Vault unavailable'));},15000);
  child.stdout.on('data',b=>{output+=b;if(output.length>1024)child.kill();});child.stderr.on('data',()=>{});child.on('error',()=>{clearTimeout(timeout);fail(Error('Vault unavailable'));});
  child.on('close',code=>{clearTimeout(timeout);if(code===0&&output==='{"protected":true}')done();else fail(Error('Vault unavailable'));});child.stdin.on('error',()=>{});child.stdin.end(JSON.stringify(content));
 });
}
export async function bootstrap(options,deps={}){
 const cli=deps.cli||invokeCli,connect=deps.connect||neon,vault=deps.vault||protectVault,random=deps.random||(()=>randomBytes(32).toString('base64url'));
 let phase='operator target',db,adminId,created=false;
 try{
  ensure(options.verifiedBranch===PILOT.branchId&&options.initial===true);
  const url=parsePilotUrl(options.operatorUrl,PILOT.owner);url.hostname=PILOT.directHost;
  const origin=new URL(options.origin);ensure(origin.protocol==='https:'&&origin.origin===options.origin&&!origin.username&&!origin.password);
  const base='/v9/projects/'+PILOT.vercelProjectId,scope='?teamId='+PILOT.vercelTeamId;
  const get=async endpoint=>unpack(JSON.parse(await cli(options.cliPath,['api',endpoint,'--method','GET','--scope',PILOT.vercelTeamId,'--raw','--non-interactive'])));
  phase='Vercel preflight';const project=await get(base+scope);ensure(project.id===PILOT.vercelProjectId&&project.name===PILOT.vercelProjectName&&project.accountId===PILOT.vercelTeamId);
  const domains=await get(base+'/domains'+scope);ensure(domains.domains.some(d=>d.name===origin.hostname&&d.verified));
  const before=(await get(base+'/env'+scope)).envs;ensure(before.filter(e=>e.key==='DATABASE_URL'&&e.type==='sensitive').length===1);ensure(!before.some(e=>['PILOT_AUTH_SECRET','PILOT_ORIGIN'].includes(e.key)));
  phase='Neon preflight';db=connect(url.toString());
  const identity=await db.query('SELECT current_user role,current_database() database');ensure(identity[0]?.role===PILOT.owner&&identity[0]?.database===PILOT.database);
  const manifest=JSON.parse(readFileSync(join(ROOT,'db/migrations/manifest.json'))),ledger=await db.query('SELECT version,checksum FROM vita_pilot.schema_migrations ORDER BY version');ensure(JSON.stringify(ledger)===JSON.stringify(manifest.migrations.map(m=>({version:m.version,checksum:m.checksum}))));
  ensure((await db.query('SELECT count(*)::int n FROM vita_pilot.admin_credentials'))[0].n===0);
  phase='encrypted operator vault';const secret=random(),adminKey=random();ensure(/^[A-Za-z0-9_-]{43}$/.test(secret)&&/^[A-Za-z0-9_-]{43}$/.test(adminKey)&&secret!==adminKey);adminId=randomUUID();
  const expiresAt=new Date(Date.now()+30*86400000).toISOString();
  await vault(options.vaultPath,{project:PILOT.vercelProjectName,branch:PILOT.branchId,adminId,adminKey,authSecret:secret,expiresAt,purpose:'synthetic-pilot-only'});
  const hash=createHmac('sha256',Buffer.from(secret,'base64url')).update('vita-reale-arabic:pilot:v1:admin_credential:'+adminKey).digest('hex');
  phase='disabled pilot Admin';await db.transaction([
   db.query('INSERT INTO vita_pilot.admin_principals(id) VALUES($1::uuid)',[adminId]),
   db.query("INSERT INTO vita_pilot.admin_credentials(admin_id,credential_hash,expires_at,enabled) VALUES($1::uuid,decode($2,'hex'),$3::timestamptz,false)",[adminId,hash,expiresAt])]);created=true;
  phase='pilot-only configuration';
  for(const [key,value,type]of [['PILOT_AUTH_SECRET',secret,'sensitive'],['PILOT_ORIGIN',origin.origin,'plain']])await cli(options.cliPath,['api','/v10/projects/'+PILOT.vercelProjectId+'/env'+scope,'--method','POST','--input','-','--scope',PILOT.vercelTeamId,'--raw','--non-interactive'],JSON.stringify({key,value,type,target:['production','preview']}));
  phase='configuration verification';const after=(await get(base+'/env'+scope)).envs;
  for(const name of ['PILOT_AUTH_SECRET','PILOT_ORIGIN']){const env=after.filter(e=>e.key===name);ensure(env.length===1&&!env[0].gitBranch&&JSON.stringify([...env[0].target].sort())==='["preview","production"]');if(name==='PILOT_AUTH_SECRET')ensure(env[0].type==='sensitive');}
  const metadata=e=>({id:e.id,key:e.key,type:e.type,target:e.target,gitBranch:e.gitBranch??null,updatedAt:e.updatedAt});ensure(JSON.stringify(after.filter(e=>!['PILOT_AUTH_SECRET','PILOT_ORIGIN'].includes(e.key)).map(metadata))===JSON.stringify(before.map(metadata)));
  phase='enable synthetic pilot Admin';await db.transaction([
   db.query('UPDATE vita_pilot.admin_credentials SET enabled=true WHERE admin_id=$1::uuid AND enabled=false',[adminId]),
   db.query("INSERT INTO vita_pilot.admin_audit_log(actor_admin_id,action,target_kind,target_id) VALUES($1::uuid,'admin.bootstrap','admin_principal',$1::uuid)",[adminId])]);
  return {status:'PASS',adminPrepared:true,credentialPrinted:false,vaultProtected:true,variables:['PILOT_AUTH_SECRET','PILOT_ORIGIN'],project:PILOT.vercelProjectName,runtimeActivated:false,deployment:false};
 }catch{
  let disabled=!created;if(created)try{await db.query('UPDATE vita_pilot.admin_credentials SET enabled=false WHERE admin_id=$1::uuid',[adminId]);disabled=true;}catch{disabled=false;}
  return {status:'FAIL',phase,adminEnabled:false,incompleteAdminDisabled:disabled,runtimeActivated:false,deployment:false};
 }
}
async function main(){
 const args=process.argv.slice(2),options={};for(let i=0;i<args.length;i++){if(args[i]==='--initial')options.initial=true;else if(args[i]==='--verified-branch')options.verifiedBranch=args[++i];else if(args[i]==='--vercel-cli')options.cliPath=args[++i];else if(args[i]==='--origin')options.origin=args[++i];else if(args[i]==='--vault-file')options.vaultPath=args[++i];else throw Error('Unsupported option');}
 ensure(options.initial&&options.verifiedBranch===PILOT.branchId&&options.cliPath&&options.vaultPath);
 if(process.stdin.isTTY)process.stdin.setRawMode(true);process.stdin.setEncoding('utf8');process.stdout.write('Operator connection input ready; echo disabled.\n');let input='';
 await new Promise((done,fail)=>{process.stdin.on('data',b=>{input+=b;if(input.length>16384)return fail(Error('Input rejected'));if(/[\r\n]/.test(input)){process.stdin.removeAllListeners('data');process.stdin.pause();done();}});process.stdin.on('end',()=>input?done():fail(Error('Input unavailable')));});
 options.operatorUrl=input.split(/[\r\n]/)[0];const result=await bootstrap(options);input='';options.operatorUrl='';process.stdout.write(JSON.stringify(result)+'\n');process.exit(result.status==='PASS'?0:1);
}
if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url))main().catch(()=>{process.stdout.write('{"status":"FAIL","phase":"operator input"}\n');process.exit(1);});
