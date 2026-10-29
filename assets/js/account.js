/* Verified account transport. Server sessions authorize learner access. */
(function(global){
 "use strict";
 var R=global.AccountRules,active=null,session=null,adminSession=null,busy=false,muted=false,timer=null,delay=1500,status='local',listeners=[],lastError='',prepared=false,checked=false,verified=false,refreshing=null;
 var META='vita.pilot.profile',ANON='vita.pilot.anonymous',PREFIX='vita.pilot.account.';
 var words={
  ar:{guide:'سجّل الدخول برمز التفعيل لمزامنة الدروس والدرجات والمراجعات والنصوص المكتوبة بين أجهزتك. يبقى التقدّم دون حساب منفصلًا حتى تختار إضافته.',account:'حسابي',title:'تعلّمك محفوظ معك',intro:'سجّل الدخول برمز التفعيل لحفظ تقدمك ومراجعته على أجهزتك. يتطلّب الوصول إلى التعلّم جلسة متعلّم فعّالة.',code:'رمز التفعيل',login:'تسجيل الدخول',logout:'تسجيل الخروج',loading:'جارٍ التحقق…',local:'تقدّم محفوظ على هذا الجهاز',saved:'تم حفظ التقدّم في حسابك',pending:'تغييرات بانتظار المزامنة',offline:'أنت غير متصل. تقدّمك محفوظ على هذا الجهاز وستُعاد المزامنة عند الاتصال.',blocked:'انتهت الجلسة أو أُلغي الوصول. تغييراتك غير المرسلة محفوظة على هذا الجهاز.',error:'تعذّر إكمال الطلب. تحقّق من الرمز أو الاتصال ثم حاول مجددًا.',rate:'محاولات كثيرة. انتظر قليلًا ثم أعد المحاولة.',storage:'تعذّر حفظ نسخة آمنة على هذا الجهاز. لم نستبدل تقدّمك.',retry:'إعادة المزامنة',continue:'متابعة التعلّم',importTitle:'هل تريد إضافة تقدّمك السابق؟',importHelp:'لدينا نسخة منفصلة من التقدّم الذي أحرزته دون حساب. لن نضيفها إلى حسابك إلا بموافقتك.',import:'إضافة التقدّم السابق إلى هذا الحساب',skip:'الاحتفاظ به منفصلًا',conflict:'هناك تعديلات متزامنة تحتاج إلى مراجعة. احتفظنا بنسختك المحلية ولم نستبدل الأحدث في الحساب.',resolve:'اعتماد النسخة الأحدث مع الاحتفاظ بنسخة احتياطية محلية',export:'تنزيل نسخة التغييرات المحلية',device:'هذا جهاز مشترك؟ سجّل الخروج بعد الانتهاء. تُحفظ النسخ غير المرسلة محليًا حتى تتم مزامنتها.',admin:'إدارة Vita Reale',adminHelp:'إدارة حسابات تجريبية فقط؛ لا مبيعات أو وصول مدفوع.',key:'مفتاح الإدارة',issue:'إصدار رمز تجريبي',codeExpiry:'انتهاء صلاحية الرمز',accessExpiry:'انتهاء صلاحية الوصول',assignment:'معرّف متعلّم موجود (اختياري)',codes:'رموز التفعيل',learners:'المتعلّمون',active:'وصول فعّال',revoked:'وصول غير فعّال',rotate:'استبدال الرمز',revokeCode:'إلغاء الرمز',revokeAccess:'إلغاء الوصول',grant:'منح وصول تجريبي',completed:'الدروس المكتملة',oneTime:'انسخ هذا الرمز الآن وسلّمه بأمان. لن يُعرض مرة أخرى. لا تُرسله تلقائيًا بالبريد أو واتساب.',clear:'إخفاء الرمز',refresh:'تحديث القائمة',confirm:'هل تؤكد تنفيذ هذا الإجراء على الحساب التجريبي؟',duplicate:'قد يكون الطلب قد نُفّذ. حدّث القائمة قبل إصدار رمز آخر.',expiry:'اختر تاريخين صالحين، بحيث تنتهي صلاحية الرمز قبل صلاحية الوصول.',empty:'لا توجد حسابات أو رموز في هذه الصفحة.',next:'الصفحة التالية',previous:'الصفحة السابقة'},
  en:{guide:'Sign in with an activation code to sync lessons, scores, reviews and written drafts across devices. Anonymous progress stays separate unless you choose to import it.',account:'My account',title:'Keep your learning with you',intro:'Sign in with an activation code to sync progress across devices. Access to learning requires an active learner session.',code:'Activation code',login:'Sign in',logout:'Sign out',loading:'Checking…',local:'Progress saved on this device',saved:'Progress saved to your account',pending:'Changes waiting to sync',offline:'You are offline. Progress stays on this device and will retry when connected.',blocked:'Session expired or access revoked. Unsent changes are preserved on this device.',error:'The request could not be completed. Check your code or connection and try again.',rate:'Too many attempts. Wait a little before retrying.',storage:'A safe local copy could not be saved. Your progress was not replaced.',retry:'Sync again',continue:'Continue learning',importTitle:'Add your earlier progress?',importHelp:'Your anonymous progress has a separate local copy. It will only be added to this account with your permission.',import:'Add earlier progress to this account',skip:'Keep it separate',conflict:'Concurrent changes need review. Your local version is preserved; newer account data was not overwritten.',resolve:'Use the newer version and keep a local backup',export:'Download local changes',device:'Shared device? Sign out when finished. Unsent backups stay locally until synchronized.',admin:'Vita Reale administration',adminHelp:'Synthetic pilot accounts only. No sales or paid access.',key:'Admin key',issue:'Issue pilot code',codeExpiry:'Code expiry',accessExpiry:'Access expiry',assignment:'Existing learner ID (optional)',codes:'Activation codes',learners:'Learners',active:'Active access',revoked:'No active access',rotate:'Replace code',revokeCode:'Revoke code',revokeAccess:'Revoke access',grant:'Grant pilot access',completed:'Completed lessons',oneTime:'Copy this code now and deliver it securely. It will not be shown again. No automatic email or WhatsApp delivery.',clear:'Hide code',refresh:'Refresh list',confirm:'Confirm this action for the pilot account?',duplicate:'The request may already have completed. Refresh before issuing another code.',expiry:'Choose valid dates with code expiry before access expiry.',empty:'No accounts or codes on this page.',next:'Next page',previous:'Previous page'}
 };
 function t(k){return (words[global.I18n&&global.I18n.lang]||words.en)[k]||words.en[k]||k;}
 function read(k){try{return JSON.parse(global.localStorage.getItem(k));}catch(e){return null;}}
 function write(k,v){try{global.localStorage.setItem(k,JSON.stringify(v));return true;}catch(e){lastError='storage';return false;}}
 function validId(id){return typeof id==='string'&&/^[0-9a-f]{8}-(?:[0-9a-f]{4}-){3}[0-9a-f]{12}$/i.test(id);}
 function profile(){var p=read(META);return p&&validId(p.id)?p.id:null;}
 function emit(){listeners.forEach(function(fn){fn();});var nav=global.document.querySelector('[data-account-nav]');if(nav)nav.textContent=t('account');}
 function saveCache(){if(!active)return true;return write(PREFIX+active.id,active);}
 function current(){return R.clone(global.Core.state);}
 function adopt(state,settings){muted=true;var s=R.clone(state);s.settings=R.clone(settings||global.Core.state.settings);try{global.Store.importState(JSON.stringify(s));global.Store.flush();}finally{muted=false;}}
 function hasProgress(s){return s&&(['lessons','srs','saved','writing','errors','drills','library'].some(function(k){return Object.keys(s[k]||{}).length;})||(s.reviews||[]).length||s.placement||(s.cils&&s.cils.runs||[]).length||s.minutes||s.xp);}
 function learningSnapshot(){var state=current();if(active){active.deviceSettings=R.clone(state.settings);state.settings=R.clone(active.base.settings||{});}return state;}
 function checkpoint(){if(muted||!active)return;active.state=learningSnapshot();active.pending=!R.equal(active.state,active.base);saveCache();status=active.pending?'pending':'saved';if(active.pending)schedule();emit();}
 function schedule(){if(timer||!active||!session||active.conflicts)return;timer=global.setTimeout(function(){timer=null;sync();},delay);}
 async function request(path,body,isAdmin,expectedAccount,offset){
  var controller=new AbortController(),timeout=global.setTimeout(function(){controller.abort();},10000),s=isAdmin?adminSession:session;
  try{var headers={'X-Vita-Request':'1'};if(s&&s.csrf)headers['X-Vita-CSRF']=s.csrf;if(!isAdmin&&(expectedAccount||active))headers['X-Vita-Account']=expectedAccount||active.id;if(body!==undefined)headers['Content-Type']='application/json';
   if(isAdmin&&offset!==undefined)headers['X-Vita-Offset']=String(offset);
   var r=await global.fetch('/api/'+path,{method:body===undefined?'GET':'POST',credentials:'same-origin',cache:'no-store',headers:headers,body:body===undefined?undefined:JSON.stringify(body),signal:controller.signal});
   var data;try{data=await r.json();}catch(e){data={};}if(!r.ok){var error=new Error('Account request failed');error.status=r.status;error.data=data;throw error;}return data;
  }finally{global.clearTimeout(timeout);}
 }
 async function attach(s){
  if(!s.authenticated||!validId(s.learnerId))return;
  var id=s.learnerId,existing=read(PREFIX+id),previousProfile=profile();
  if(active&&active.id!==id){active.state=learningSnapshot();if(!saveCache())throw Error('storage');}
  // No current anonymous/other-account state enters the server automatically.
  var candidate=existing&&existing.id===id?existing:{id:id,state:{schema:2},base:{schema:2},revision:0,pending:false};
  var device=R.clone(existing&&existing.deviceSettings||global.Core.state.settings);
  if(!existing||!existing.deviceSettings){device.sttConsent=false;delete device.llmConsent;}
  device.lang=global.Core.state.settings.lang;device.theme=global.Core.state.settings.theme;candidate.deviceSettings=device;
  var online=await request('progress',undefined,false,id);
  if(!candidate.pending){candidate.state=online.state;candidate.base=online.state;candidate.revision=online.revision;}
  else{var merged=R.reconcile(candidate.base,candidate.state,online.state);if(merged.conflicts.length){candidate.conflictBackup=R.clone(candidate.state);candidate.conflicts={paths:merged.conflicts,remote:online,proposed:merged.state};}else{candidate.state=merged.state;candidate.base=online.state;candidate.revision=online.revision;}}
  // Keep any anonymous work completed while the account request was in flight.
  if(profile()!==previousProfile)throw Error('Account changed during login');
  if(!previousProfile&&!write(ANON,current()))throw Error('storage');
  if(active&&active.id!==id){active.state=learningSnapshot();if(!saveCache())throw Error('storage');}
  if(!write(PREFIX+id,candidate)||!write(META,{id:id}))throw Error('storage');active=candidate;session=s;verified=true;adopt(active.state,device);status=active.conflicts?'conflict':active.pending?'pending':'saved';schedule();emit();
 }
 function refresh(){
  if(refreshing)return refreshing;
  refreshing=(async function(){
   try{var s=await request('auth/session');if(s.authenticated){if(!active||active.id!==s.learnerId)await attach(s);else{session=s;verified=true;await sync();}}else{verified=false;session=null;if(active)detach();else status='local';}}
   catch(e){verified=false;session=null;status=e.status===401?'blocked':'offline';}
   finally{checked=true;refreshing=null;emit();}
  })();return refreshing;
 }
 async function sync(){
  if(busy||!active||!session||active.conflicts)return;busy=true;var id=active.id;
  try{
   if(profile()!==id){status='blocked';return;}
   var s=await request('auth/session');if(!s.authenticated||s.learnerId!==id){session=null;verified=false;status='blocked';return;}session=s;
   var remote=await request('progress');if(active.id!==id)return;
   var merged=R.reconcile(active.base,active.state,remote.state);
   if(merged.conflicts.length){active.conflictBackup=R.clone(active.state);active.conflicts={paths:merged.conflicts,remote:remote,proposed:merged.state};status='conflict';saveCache();return;}
   var sent=R.clone(merged.state),before=R.clone(active.state),response;
   if(active.pending)response=await request('progress',{revision:remote.revision,state:sent});else response=remote;
   // Edits made while the request was in flight are a new delta, not an acknowledged save.
   active.base=response.state;active.revision=response.revision;
   var changed=!R.equal(before,active.state),inflight=changed?R.reconcile(before,active.state,response.state):{state:response.state,conflicts:[]};active.pending=changed;
   if(inflight.conflicts.length){active.conflictBackup=R.clone(active.state);active.conflicts={paths:inflight.conflicts,remote:response,proposed:inflight.state};status='conflict';saveCache();return;}
   active.state=inflight.state;saveCache();adopt(active.state);delay=1500;status=changed?'pending':'saved';
  }catch(e){if(e.status===401){session=null;verified=false;status='blocked';}else{verified=false;session=null;status='offline';delay=Math.min(delay*2,30000);}saveCache();}
  finally{busy=false;emit();if(active&&active.pending&&session&&status!=='conflict')schedule();}
 }
 function detach(){if(active){active.state=learningSnapshot();if(!saveCache())throw Error('storage');}if(!write(META,{id:null}))throw Error('storage');var anonymous=read(ANON)||{schema:2},settings=R.clone(anonymous.settings||global.Core.state.settings);if(!anonymous.settings){settings.sttConsent=false;delete settings.llmConsent;}settings.lang=global.Core.state.settings.lang;settings.theme=global.Core.state.settings.theme;active=null;session=null;verified=false;adopt(anonymous,settings);status='local';emit();}
 async function login(code){if(refreshing)await refreshing;lastError='';try{var s=await request('auth/redeem',{code:code});await attach(s);return true;}catch(e){lastError=e.status===429?'rate':lastError==='storage'?'storage':'error';emit();return false;}}
 async function logout(){lastError='';try{if(active){active.state=learningSnapshot();active.pending=!R.equal(active.state,active.base);if(!saveCache())throw Error('storage');}await request('auth/logout',{});detach();return true;}catch(e){lastError=lastError==='storage'?'storage':'error';emit();return false;}}
 function importAnonymous(){if(!active)return;var anonymous=read(ANON);if(!anonymous)return;var backup=R.clone(anonymous);anonymous.settings=R.clone(active.base.settings||{});var merged=R.reconcile({schema:2},anonymous,active.state);active.conflictBackup=backup;active.state=merged.state;if(merged.conflicts.length){active.conflicts={paths:merged.conflicts,remote:{state:active.base,revision:active.revision},proposed:merged.state};status='conflict';}active.pending=true;active.imported=true;saveCache();adopt(active.state);schedule();emit();}
 function resolve(){if(!active||!active.conflicts)return;var remote=active.conflicts.remote;active.state=active.conflicts.proposed;active.base=remote.state;active.revision=remote.revision;active.conflicts=null;active.pending=true;saveCache();adopt(active.state);schedule();emit();}
 function exportPending(){var blob=new Blob([JSON.stringify(active&&(active.conflictBackup||active.state)||current(),null,2)],{type:'application/json'}),url=URL.createObjectURL(blob),a=global.document.createElement('a');a.href=url;a.download='vita-reale-progress.json';a.click();global.setTimeout(function(){URL.revokeObjectURL(url);},1000);}
 function prepare(){if(prepared)return;prepared=true;var id=profile(),cache=id&&read(PREFIX+id);if(cache&&cache.state&&cache.state.schema===2){try{var restored=R.clone(cache.state);if(cache.deviceSettings)restored.settings=R.clone(cache.deviceSettings);global.localStorage.setItem(global.Store.KEY,JSON.stringify(restored));active=cache;}catch(e){lastError='storage';}}}
 prepare();
 function start(){global.Store.subscribe(checkpoint);global.Store.setWriteGuard(function(){return profile()===(active?active.id:null);});global.addEventListener('online',function(){if(active||checked)refresh();});global.addEventListener('storage',function(e){if(e.key===META&&profile()!==(active?active.id:null)){if(active){active.state=learningSnapshot();saveCache();}else write(ANON,current());global.location.reload();}});}
 if(global.document.readyState==='loading')global.document.addEventListener('DOMContentLoaded',start);else start();
 global.Account={suspend:function(){verified=false;session=null;status='offline';if(active){active.state=learningSnapshot();saveCache();}emit();},t:t,request:request,login:login,logout:logout,refresh:refresh,sync:sync,importAnonymous:importAnonymous,resolve:resolve,exportPending:exportPending,
  subscribe:function(fn){listeners.push(fn);return function(){listeners=listeners.filter(function(f){return f!==fn;});};},
  snapshot:function(){return {checked:checked,active:active&&{id:active.id,pending:active.pending,conflicts:!!active.conflicts,importAvailable:!active.imported&&hasProgress(read(ANON))},authenticated:!!session&&verified,status:status,error:lastError};},
  requestBilling:function(path,body){if(!['billing/request-code','billing/verify-code'].includes(path))return Promise.reject(Error('Invalid request'));return request(path,body,false);},get adminSession(){return adminSession;},set adminSession(s){adminSession=s;},emit:emit};
})(window);
