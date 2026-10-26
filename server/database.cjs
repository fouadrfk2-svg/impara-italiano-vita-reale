"use strict";

// Server-only: neither this helper nor the driver belongs in public assets.
const {neon}=require('@neondatabase/serverless');
const {RUNTIME_HEALTH_SQL,parsePilotUrl}=require('./runtime-policy.cjs');
let cachedUrl,cachedClient;
function client(){
 const url=parsePilotUrl(process.env.DATABASE_URL).toString();
 if(cachedUrl!==url||!cachedClient){cachedClient=neon(url);cachedUrl=url;}
 return cachedClient;
}
async function checkDatabaseHealth(){
 try{
  // Recheck identity and effective rights on EVERY call, including warm clients.
  const rows=await client().query(RUNTIME_HEALTH_SQL,[],{fetchOptions:{signal:AbortSignal.timeout(5000),cache:'no-store'}});
  if(!Array.isArray(rows)||rows.length!==1||rows[0].ok!==1||rows[0].identity_verified!==true)throw Error();
 }catch{throw new Error('Database unavailable');}
}
module.exports={checkDatabaseHealth};
