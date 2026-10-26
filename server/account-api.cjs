"use strict";
const {randomBytes,createHmac,timingSafeEqual}=require('node:crypto');
const inventory=require('./lesson-inventory.json');
const {accountRequest}=require('./database.cjs');
const COOKIE='__Host-vita_pilot',ADMIN_COOKIE='__Host-vita_pilot_admin';
class ApiError extends Error{constructor(status){super('Request unavailable');this.status=status;}}
function key(){const raw=process.env.PILOT_AUTH_SECRET;if(!raw||!/^[A-Za-z0-9_-]{43}$/.test(raw)||Buffer.from(raw,'base64url').length!==32)throw new ApiError(503);return Buffer.from(raw,'base64url');}
function mac(purpose,value){return createHmac('sha256',key()).update('vita-reale-arabic:pilot:v1:'+purpose+':'+value).digest('hex');}
function token(){return randomBytes(32).toString('base64url');}
function normalizedCode(value){if(typeof value!=='string'||value.length>64)return null;const n=value.trim().toUpperCase().replace(/[\t\n\r -]/g,'');return /^[A-HJ-NP-Z2-9]{24}$/.test(n)?n:null;}
function newCode(){const alphabet='ABCDEFGHJKLMNPQRSTUVWXYZ23456789';return Array.from(randomBytes(24),b=>alphabet[b&31]).join('').match(/.{6}/g).join('-');}
function cookie(req,admin){const name=admin?ADMIN_COOKIE:COOKIE;const values=String(req.headers?.cookie||'').split(';').map(v=>v.trim()).filter(v=>v.startsWith(name+'='));if(values.length!==1)return null;const value=values[0].slice(name.length+1);return /^[A-Za-z0-9_-]{43}$/.test(value)?value:null;}
function setCookie(res,value,admin,seconds){res.setHeader('Set-Cookie',(admin?ADMIN_COOKIE:COOKIE)+'='+value+'; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age='+seconds);}
function safeEqual(a,b){return typeof a==='string'&&/^[0-9a-f]{64}$/.test(a)&&typeof b==='string'&&/^[0-9a-f]{64}$/.test(b)&&timingSafeEqual(Buffer.from(a),Buffer.from(b));}
function sameOrigin(req){
 const origin=req.headers?.origin;if(typeof origin!=='string')return false;
 let url;try{url=new URL(origin);if(url.origin!==origin)return false;}catch{return false;}
 const configured=process.env.PILOT_ORIGIN;
 if(configured){try{if(url.protocol==='https:'&&origin===new URL(configured).origin)return true;}catch{return false;}}
 if(process.env.VERCEL==='1')return ['VERCEL_URL','VERCEL_BRANCH_URL'].some(k=>process.env[k]&&url.protocol==='https:'&&url.host===process.env[k]);
 return process.env.NODE_ENV!=='production'&&['localhost','127.0.0.1','[::1]'].includes(url.hostname)&&url.protocol==='http:'&&url.host===req.headers?.host;
}
async function readBody(req,maximum){
 if(!/^application\/json(?:\s*;\s*charset=utf-8)?$/i.test(req.headers?.['content-type']||''))throw new ApiError(415);
 const length=req.headers?.['content-length'];if(length&&(!/^\d+$/.test(String(length))||Number(length)>maximum))throw new ApiError(413);
 let value;
 if(req.body!==undefined){
  if(Buffer.isBuffer(req.body)||typeof req.body==='string'){const bytes=Buffer.from(req.body);if(bytes.length>maximum)throw new ApiError(413);value=JSON.parse(new TextDecoder('utf-8',{fatal:true}).decode(bytes));}
  else{if(Buffer.byteLength(JSON.stringify(req.body))>maximum)throw new ApiError(413);value=req.body;}
 }else{const chunks=[];let size=0;for await(const chunk of req){const bytes=Buffer.from(chunk);size+=bytes.length;if(size>maximum)throw new ApiError(413);chunks.push(bytes);}value=JSON.parse(new TextDecoder('utf-8',{fatal:true}).decode(Buffer.concat(chunks)));}
 if(!value||typeof value!=='object'||Array.isArray(value))throw new ApiError(400);return value;
}
function fields(body,allowed){if(Object.keys(body).some(k=>!allowed.includes(k)))throw new ApiError(400);}
function uuid(v){return typeof v==='string'&&/^[0-9a-f]{8}-(?:[0-9a-f]{4}-){3}[0-9a-f]{12}$/i.test(v);}
function validateState(state){
 if(!state||state.schema!==2||Array.isArray(state)||typeof state!=='object')throw new ApiError(400);
 let nodes=0;
 function walk(v,depth){if(++nodes>100000||depth>24)throw new ApiError(400);if(v&&typeof v==='object')for(const k of Object.keys(v)){if(['__proto__','prototype','constructor'].includes(k))throw new ApiError(400);walk(v[k],depth+1);}else if(typeof v==='number'&&!Number.isFinite(v))throw new ApiError(400);}
 walk(state,0);if(Buffer.byteLength(JSON.stringify(state))>2097152)throw new ApiError(413);
 if(state.lessons!==undefined){if(!state.lessons||typeof state.lessons!=='object'||Array.isArray(state.lessons))throw new ApiError(400);for(const [id,v]of Object.entries(state.lessons)){
  if(!Object.hasOwn(inventory,id)||!v||typeof v!=='object'||Array.isArray(v))throw new ApiError(400);
  const maximum=inventory[id]<0?1000:inventory[id];
  if(v.total!==undefined&&(!Number.isInteger(v.total)||v.total<1||(inventory[id]>0?v.total!==maximum:v.total>maximum)))throw new ApiError(400);
  if(v.score!==undefined&&(!Number.isInteger(v.score)||v.score<0||v.score>(v.total??maximum)))throw new ApiError(400);
  if(v.best!==undefined&&(typeof v.best!=='number'||!Number.isFinite(v.best)||v.best<0||v.best>1))throw new ApiError(400);
  if(v.done!==undefined&&typeof v.done!=='boolean')throw new ApiError(400);
  if(v.attempts!==undefined&&(!Number.isSafeInteger(v.attempts)||v.attempts<0))throw new ApiError(400);
 }}
 for(const k of ['srs','saved','errors','drills','session','writing','settings','stats','retention','library','cils','streak','backup'])if(state[k]!==undefined&&(!state[k]||typeof state[k]!=='object'||Array.isArray(state[k])))throw new ApiError(400);
 for(const k of ['createdAt','xp','minutes'])if(state[k]!==undefined&&typeof state[k]!=='number')throw new ApiError(400);
 if(state.onboarded!==undefined&&typeof state.onboarded!=='boolean')throw new ApiError(400);
 if(state.placement!==undefined&&state.placement!==null&&(typeof state.placement!=='object'||Array.isArray(state.placement)))throw new ApiError(400);
 if(state.reviews!==undefined&&!Array.isArray(state.reviews))throw new ApiError(400);
 return state;
}
function headers(res){for(const name of ['Cache-Control','CDN-Cache-Control','Vercel-CDN-Cache-Control'])res.setHeader(name,'no-store');res.setHeader('Content-Type','application/json; charset=utf-8');res.setHeader('Referrer-Policy','no-referrer');res.setHeader('X-Content-Type-Options','nosniff');res.setHeader('X-Robots-Tag','noindex');res.setHeader('Vary','Cookie');}
function reply(res,status,value){res.statusCode=status;res.end(JSON.stringify(value));}
function createHandler(route,dependencies={}){
 const run=dependencies.run||accountRequest;
 return async(req,res)=>{
  headers(res);const admin=route.startsWith('admin/'),action=route.split('/').at(-1),read=action==='session'||(action==='progress'&&req.method==='GET')||action==='list';
  const method=read?'GET':'POST';if(req.method!==method){res.setHeader('Allow',method);return reply(res,405,{error:'method_not_allowed'});}
  try{
   key();
   // No URL/query/body parameter supplies identity, SQL, cookies or redirect destinations.
   const raw=cookie(req,admin),login=action==='redeem'||action==='login';
   if(!read){
    if(!sameOrigin(req)||req.headers?.['x-vita-request']!=='1')throw new ApiError(403);
    if(!login&&raw&&!safeEqual(req.headers?.['x-vita-csrf'],mac(admin?'admin_csrf':'learner_csrf',raw)))throw new ApiError(403);
   }
   if(!login&&!raw){if(action==='session')return reply(res,200,{authenticated:false});throw new ApiError(401);}
   const body=read?{}:await readBody(req,action==='progress'?2150000:2048);
   let result,newToken,newPlainCode;
   const data=raw?{token:mac(admin?'admin_session':'learner_session',raw)}:{};
   if(login){
    fields(body,[admin?'key':'code']);const supplied=admin?body.key:normalizedCode(body.code);
    const valid=admin?typeof supplied==='string'&&/^[A-Za-z0-9_-]{43}$/.test(supplied):!!supplied;
    const ip=process.env.VERCEL==='1'?String(req.headers?.['x-vercel-forwarded-for']||'unknown').split(',')[0].trim():String(req.socket?.remoteAddress||'local');
    newToken=token();Object.assign(data,{credential:mac(admin?'admin_credential':'activation_code',valid?supplied:'invalid'),newToken:mac(admin?'admin_session':'learner_session',newToken),bucket:mac('rate_ip',ip),global:mac('rate_global','fixed')});
    result=await run(admin?'admin_login':'redeem',data);
   }else if(action==='progress'){
    if(!uuid(req.headers?.['x-vita-account']))throw new ApiError(401);
    data.expectedLearner=req.headers['x-vita-account'];
    if(read)result=await run('progress_read',data);
    else{fields(body,['state','revision']);if(!Number.isSafeInteger(body.revision)||body.revision<0||body.revision>=Number.MAX_SAFE_INTEGER)throw new ApiError(400);result=await run('progress_save',{...data,state:validateState(body.state),revision:body.revision});}
   }else if(action==='operation'){
    fields(body,['action','id','learnerId','codeExpiresAt','accessExpiresAt','requestId']);
    if(!['issue','rotate','revoke_code','revoke_access','grant'].includes(body.action)||!uuid(body.requestId))throw new ApiError(400);
    if(body.action!=='issue'&&!uuid(body.id))throw new ApiError(400);
    if(body.learnerId!==undefined&&body.learnerId!==null&&!uuid(body.learnerId))throw new ApiError(400);
    if(['issue','rotate','grant'].includes(body.action)){
     if(typeof body.accessExpiresAt!=='string'||!Number.isFinite(Date.parse(body.accessExpiresAt)))throw new ApiError(400);
     if(body.action!=='grant'&&(typeof body.codeExpiresAt!=='string'||!Number.isFinite(Date.parse(body.codeExpiresAt))))throw new ApiError(400);
    }
    if(['issue','rotate'].includes(body.action)){newPlainCode=newCode();data.credential=mac('activation_code',normalizedCode(newPlainCode));}
    result=await run('admin_'+body.action,{...data,...body});
   }else{
    fields(body,[]);if(action==='list'){const offset=req.headers?.['x-vita-offset']||'0';if(!/^\d{1,5}$/.test(String(offset))||Number(offset)>10000)throw new ApiError(400);data.offset=Number(offset);}result=await run((admin?'admin_':'')+action,data);
   }
   if(result?.rateLimited)throw new ApiError(429);
   if(login){if(!result?.authenticated)throw new ApiError(401);setCookie(res,newToken,admin,admin?14400:2592000);result={...result,csrf:mac(admin?'admin_csrf':'learner_csrf',newToken)};}
   if(action==='session'&&result?.authenticated)result={...result,csrf:mac(admin?'admin_csrf':'learner_csrf',raw)};
   if(action==='logout')setCookie(res,'',admin,0);
   if(newPlainCode&&!result.alreadyApplied)result={...result,code:newPlainCode};
   return reply(res,result?.conflict||result?.alreadyApplied?409:200,result);
  }catch(error){
   const status=error instanceof ApiError?error.status:error instanceof SyntaxError?400:error?.code==='42501'||(error?.code==='23514'&&['redeem','login'].includes(action))?401:['22023','23514','22P02'].includes(error?.code)?400:error?.code==='40001'?409:503;
   if(status===401&&!['redeem','login'].includes(action))setCookie(res,'',admin,0);
   return reply(res,status,{error:status===429?'rate_limited':status===503?'unavailable':status===409?'conflict':status===401?'authentication_failed':'invalid_request'});
  }
 };
}
module.exports={createHandler,validateState,normalizedCode,newCode,mac,COOKIE,ADMIN_COOKIE};
