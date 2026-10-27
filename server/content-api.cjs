"use strict";
const fs=require('node:fs'),path=require('node:path');
const {isPrivateContent}=require('./content-path.cjs');
const {accountRequest}=require('./database.cjs');
const {mac,COOKIE}=require('./account-api.cjs');
function contentPath(req){
 const u=new URL(req.url,'https://private.invalid');
 if(u.pathname==='/api/content'){
  const values=u.searchParams.getAll('path');
  return values.length===1&&[...u.searchParams.keys()].every(k=>k==='path')?values[0]:null;
 }
 try{return decodeURIComponent(u.pathname).slice(1);}catch{return null;}
}
function createContentHandler(options={}){
 const root=options.root||path.resolve(__dirname,'..'),run=options.run||accountRequest;
 return async(req,res)=>{
  for(const h of ['Cache-Control','CDN-Cache-Control','Vercel-CDN-Cache-Control'])res.setHeader(h,'private, no-store');
  res.setHeader('Vary','Cookie');res.setHeader('X-Content-Type-Options','nosniff');res.setHeader('Referrer-Policy','no-referrer');res.setHeader('Cross-Origin-Resource-Policy','same-origin');res.setHeader('X-Robots-Tag','noindex');
  function deny(status){res.statusCode=status;res.setHeader('Content-Type','application/json; charset=utf-8');res.end(req.method==='HEAD'?undefined:JSON.stringify({error:status===401?'authentication_required':status===503?'unavailable':'not_found'}));}
  if(!['GET','HEAD'].includes(req.method)){res.setHeader('Allow','GET, HEAD');return deny(405);}
  const file=contentPath(req);if(!isPrivateContent(file))return deny(404);
  const cookies=String(req.headers.cookie||'').split(';').map(s=>s.trim()).filter(s=>s.startsWith(COOKIE+'='));
  const token=cookies.length===1?cookies[0].slice(COOKIE.length+1):'';
  if(!/^[A-Za-z0-9_-]{43}$/.test(token))return deny(401);
  if(req.headers['sec-fetch-site']==='cross-site')return deny(401);
  try{
   // Fresh, fail-closed runtime + active learner/entitlement checks for EVERY file/range.
   const session=await run('session',{token:mac('learner_session',token)});
   if(session&&session.rateLimited)return deny(429);
   if(!session||!session.authenticated)return deny(401);
  }catch(e){return deny(e.code==='42501'?401:503);}
  try{
   let target=root;for(const part of file.split('/')){target=path.join(target,part);if(fs.lstatSync(target).isSymbolicLink())return deny(404);}
   const resolved=fs.realpathSync(target),rel=path.relative(fs.realpathSync(root),resolved),stat=fs.statSync(resolved);
   if(rel.startsWith('..')||path.isAbsolute(rel)||!stat.isFile())return deny(404);
   const audio=file.endsWith('.mp3');let start=0,end=stat.size-1;
   res.setHeader('Content-Type',audio?'audio/mpeg':'text/javascript; charset=utf-8');
   if(audio)res.setHeader('Accept-Ranges','bytes');
   if(req.headers.range){
    const m=/^bytes=(\d*)-(\d*)$/.exec(req.headers.range);
    if(!audio||!m||(!m[1]&&!m[2])){res.setHeader('Content-Range','bytes */'+stat.size);res.statusCode=416;return res.end();}
    if(!m[1]){const n=Number(m[2]);start=Math.max(0,stat.size-n);}
    else{start=Number(m[1]);if(m[2])end=Math.min(end,Number(m[2]));}
    if(!Number.isSafeInteger(start)||!Number.isSafeInteger(end)||start>end||start>=stat.size){res.setHeader('Content-Range','bytes */'+stat.size);res.statusCode=416;return res.end();}
    res.statusCode=206;res.setHeader('Content-Range','bytes '+start+'-'+end+'/'+stat.size);
   }else res.statusCode=200;
   res.setHeader('Content-Length',end-start+1);
   if(req.method==='HEAD')return res.end();
   const stream=fs.createReadStream(resolved,{start,end});stream.on('error',()=>res.destroy());res.on('close',()=>stream.destroy());stream.pipe(res);
  }catch{return deny(404);}
 };
}
module.exports={createContentHandler,contentPath};
