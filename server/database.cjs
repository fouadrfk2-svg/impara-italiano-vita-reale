"use strict";
// Server-only: neither this helper nor the driver belongs in public assets.
const {neon}=require('@neondatabase/serverless');
const {PILOT,RUNTIME_HEALTH_SQL,parsePilotUrl}=require('./runtime-policy.cjs');
let cachedUrl,cachedClient;
function client(){const url=parsePilotUrl(process.env.DATABASE_URL,PILOT.role,process.env).toString();if(cachedUrl!==url||!cachedClient){cachedClient=neon(url);cachedUrl=url;}return cachedClient;}
async function checkDatabaseHealth(){try{const rows=await client().query(RUNTIME_HEALTH_SQL,[],{fetchOptions:{signal:AbortSignal.timeout(5000),cache:'no-store'}});if(!Array.isArray(rows)||rows.length!==1||rows[0].ok!==1||rows[0].identity_verified!==true)throw Error();}catch{throw new Error('Database unavailable');}}
async function accountRequest(action,payload){const allowed=['redeem','session','logout','progress_read','progress_save','admin_login','admin_session','admin_logout','admin_list','admin_issue','admin_rotate','admin_revoke_code','admin_revoke_access','admin_grant'];if(!allowed.includes(action))throw new Error('Database unavailable');return callFunction('account_request',action,payload);}
const BILLING_ACTIONS=new Set(['otp_request','otp_verify','checkout_intent','store_customer','record_checkout','billing_status','portal_identity','activate','sync_subscription','risk_hold']);
async function billingRequest(action,payload){if(!BILLING_ACTIONS.has(action))throw new Error('Database unavailable');return callFunction('billing_request',action,payload);}
async function callFunction(name,action,payload){await checkDatabaseHealth();try{const rows=await client().query('SELECT vita_pilot.'+name+'($1::text,$2::jsonb) AS result',[action,JSON.stringify(payload)],{fetchOptions:{signal:AbortSignal.timeout(10000),cache:'no-store'}});if(!Array.isArray(rows)||rows.length!==1||!rows[0].result||typeof rows[0].result!=='object')throw Error();return rows[0].result;}catch(error){const safe=new Error('Database unavailable');if(['42501','22023','23514','22P02','23505','40001'].includes(error?.code))safe.code=error.code;throw safe;}}
module.exports={checkDatabaseHealth,accountRequest,billingRequest};
