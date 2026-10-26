/* global module */
/* Pure three-way state reconciliation. No identity or entitlement authority. */
(function(root){
 "use strict";
 var forbidden=["__proto__","prototype","constructor"];
 function clone(v){return v===undefined?undefined:JSON.parse(JSON.stringify(v),function(k,value){return forbidden.indexOf(k)>=0?undefined:value;});}
 // PostgreSQL JSONB may reorder object keys; array order and actual values stay significant.
 function signature(v){return JSON.stringify(v,function(k,value){if(!object(value))return value;var ordered={};Object.keys(value).sort().forEach(function(name){if(forbidden.indexOf(name)<0)ordered[name]=value[name];});return ordered;});}
 function equal(a,b){return signature(a)===signature(b);}
 function object(v){return v&&typeof v==='object'&&!Array.isArray(v);}
 function union(a,b){var seen=Object.create(null);return (a||[]).concat(b||[]).filter(function(v){var k=signature(v);if(seen[k])return false;seen[k]=true;return true;});}
 function reconcile(base,local,remote){
  var conflicts=[];
  function merge(b,l,r,path){
   if(equal(l,b))return clone(r);
   if(equal(r,b)||equal(l,r))return clone(l);
   if(path==='reviews')return union(r,l).sort(function(a,b){return (a.t||0)-(b.t||0);});
   if(path.indexOf('lessons.')===0&&path.split('.').length===2&&object(l)&&object(r)){
    var latest=clone((l.ts||0)>(r.ts||0)?l:r);latest.done=!!(l.done||r.done);latest.best=Math.max(l.best||0,r.best||0);
    latest.attempts=Math.max(r.attempts||0,(b&&b.attempts)||0)+Math.max(0,(l.attempts||0)-((b&&b.attempts)||0));return latest;
   }
   if((path==='xp'||path==='minutes'||/^stats\.(?:correct|wrong|days\.)/.test(path))&&typeof l==='number'&&typeof r==='number')return Math.max(r,b||0)+Math.max(0,l-(b||0));
   if(path==='stats.lessonsDone')return Math.max(l||0,r||0);
   if(path.indexOf('srs.')===0&&path.split('.').length===2){
    function last(s,k){return (s.reviews||[]).reduce(function(n,e){return e.k===k?Math.max(n,e.t||0):n;},0);}
    var k=path.slice(4),lt=last(local,k),rt=last(remote,k);if(lt!==rt)return clone(lt>rt?l:r);
   }
   if(object(l)&&object(r)){
    var result={},keys=Object.keys(r).concat(Object.keys(l)).filter(function(k,i,a){return a.indexOf(k)===i&&forbidden.indexOf(k)<0;});
    keys.forEach(function(k){var v=merge(b&&b[k],l[k],r[k],path?path+'.'+k:k);if(v!==undefined)result[k]=v;});return result;
   }
   // Concurrent drafts/settings/schedules are never silently replaced.
   conflicts.push(path);return clone(r);
  }
  var result=merge(base||{schema:2},local,remote,'');
  result.schema=2;if(result.lessons&&result.stats)result.stats.lessonsDone=Object.keys(result.lessons).filter(function(id){return result.lessons[id].done;}).length;
  return {state:result,conflicts:conflicts};
 }
 var api={clone:clone,equal:equal,reconcile:reconcile};
 if(typeof module==='object'&&module.exports)module.exports=api;else root.AccountRules=api;
})(typeof window!=='undefined'?window:globalThis);
