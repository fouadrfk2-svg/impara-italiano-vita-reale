import { test } from "node:test";
import assert from "node:assert/strict";
import { createServer } from "node:http";
import { createRequire } from "node:module";
import { readFile } from "node:fs/promises";
const require=createRequire(import.meta.url);
const {createHandler}=require("../../server/public-demo.cjs");
import { isPublicPath } from "../../scripts/public-files.mjs";
async function withServer(run){const server=createServer(createHandler());await new Promise(resolve=>server.listen(0,"localhost",resolve));try{return await run("http://localhost:"+server.address().port);}finally{await new Promise(resolve=>server.close(resolve));}}
const send=(base,path,method="GET",body)=>fetch(base+path,{method,headers:body===undefined?{}:{"Content-Type":"application/json"},body:body===undefined?undefined:JSON.stringify(body)});
test("public demo returns only the fixed A1 coffee lesson with exactly three answer-free exercises",async()=>withServer(async base=>{
 const r=await send(base,"/api/demo");assert.equal(r.status,200);assert.match(r.headers.get("cache-control"),/no-store/);assert.equal(r.headers.get("x-robots-tag"),"noindex, nofollow");
 const lesson=await r.json();assert.equal(lesson.title,"في المقهى: اطلب قهوة");assert.equal(lesson.exerciseCount,3);assert.equal(lesson.exercises.length,3);assert.equal(lesson.dialogue.length,5);
 for(const exercise of lesson.exercises){assert.ok(exercise.id);assert.ok(exercise.prompt);assert.ok(!Object.keys(exercise).some(key=>/answer|correct|accepted|grading|key/i.test(key)));}
 assert.deepEqual(lesson.dialogue.map(line=>line.audio),[1,2,3,4,5].map(n=>"/assets/marketing/demo-audio/line-"+n+".mp3"));
}));
test("all three fixed exercises accept only their intended public answers and return Arabic feedback",async()=>withServer(async base=>{
 const cases=[{exerciseId:"bar-order-meaning",answer:"invito-a-ordinare",wrong:"prezzo"},{exerciseId:"bar-polite-response",answer:"ordine-gentile",wrong:"conto"},{exerciseId:"bar-build-order",answer:["t-un-1","t-caffe","t-e","t-un-2","t-cornetto","t-per","t-favore"],wrong:["t-caffe","t-un-1","t-e","t-un-2","t-cornetto","t-per","t-favore"]}];
 for(const item of cases){let r=await send(base,"/api/demo","POST",{exerciseId:item.exerciseId,answer:item.wrong});assert.equal(r.status,200);let result=await r.json();assert.equal(result.correct,false);assert.match(result.feedback,/[\u0600-\u06ff]/);r=await send(base,"/api/demo","POST",{exerciseId:item.exerciseId,answer:item.answer});assert.equal(r.status,200);result=await r.json();assert.equal(result.correct,true);assert.match(result.feedback,/[\u0600-\u06ff]/);}
}));
test("demo endpoint rejects unknown routes, queries, methods, exercises and malformed answer schemas",async()=>withServer(async base=>{
 assert.equal((await send(base,"/api/demo?lesson=a1-u01-l1")).status,404);assert.equal((await send(base,"/api/demo/other")).status,404);assert.equal((await send(base,"/api/demo","DELETE")).status,405);assert.equal((await send(base,"/api/demo","POST",{exerciseId:"a1-u01-l1",answer:"anything"})).status,404);assert.equal((await send(base,"/api/demo","POST",{exerciseId:"bar-order-meaning",answer:"invito-a-ordinare",extra:"x"})).status,400);assert.equal((await fetch(base+"/api/demo",{method:"POST",headers:{"Content-Type":"text/plain"},body:"{}"})).status,415);assert.equal((await fetch(base+"/api/demo",{method:"POST",headers:{"Content-Type":"application/json"},body:"{"})).status,400);
}));
test("only the five explicit demo audio paths enter the public static allowlist",()=>{
 for(let n=1;n<=5;n++)assert.equal(isPublicPath("assets/marketing/demo-audio/line-"+n+".mp3"),true);
 assert.equal(isPublicPath("assets/marketing/demo-audio/line-6.mp3"),false);
 assert.equal(isPublicPath("audio/ab/0123456789abcdef.mp3"),false);
});
test("demo grading is stateless and does not depend on accounts, database or private course handlers",async()=>{
 const source=await readFile(new URL("../../server/public-demo.cjs",import.meta.url),"utf8");assert.doesNotMatch(source,/database\.cjs|account-api\.cjs|PILOT_AUTH_SECRET|localStorage|progress/i);
 await withServer(async base=>{await send(base,"/api/demo","POST",{exerciseId:"bar-order-meaning",answer:"invito-a-ordinare"});await send(base,"/api/demo","POST",{exerciseId:"bar-order-meaning",answer:"prezzo"});assert.equal((await (await send(base,"/api/demo")).json()).exerciseCount,3);});
});
