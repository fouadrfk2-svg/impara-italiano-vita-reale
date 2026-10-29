(function(global){
 "use strict";
 var A=global.Account,t=A.t,esc=global.Core.esc,shell=global.Views.shell,accountUnsubscribe=null;
 function viewKey(s){return [s.active&&s.active.id,s.authenticated,s.active&&s.active.conflicts,s.active&&s.active.importAvailable].join(':');}
 function button(label,cls){var logout=cls&&(/(?:^|\s)(?:js-logout|js-admin-logout)(?:\s|$)/.test(cls));return '<button type="button" class="btn btn--ghost '+(cls||'')+'">'+(logout?shell.icon('sign-out','account-logout__icon'):'')+esc(t(label))+'</button>';}
 function errorText(error){return t(error&&error.status===429?'rate':error&&error.status===409?'duplicate':'error');}
 function status(){var s=A.snapshot(),n=global.document.querySelector('[data-account-status]'),e=global.document.querySelector('[data-account-error]');if(n)n.textContent=t(s.status);if(e){e.textContent=s.error?t(s.error):'';e.hidden=!s.error;}}
 function bindEnter(input,button){input.addEventListener('keydown',function(e){if(e.key==='Enter'){e.preventDefault();button.click();}});}
 global.Views.account=function(){
  if(accountUnsubscribe)accountUnsubscribe();var s=A.snapshot(),identity=viewKey(s);if(!s.checked)A.refresh();
  var html=(!s.authenticated?'<p><a class="btn btn--quiet" href="#/home">'+esc(global.Guest.t('home'))+'</a></p>':'')+shell.head(t('account'),t('title'),t('intro'))+'<section class="account-panel"><p data-account-status role="status" aria-live="polite">'+esc(t(s.status))+'</p><p data-account-error role="alert" hidden></p>';
  if(s.authenticated&&s.active){
   html+='<div class="account-actions account-session-actions">'+button('logout','js-logout account-logout')+'</div><div class="account-actions">'+button('continue','js-continue')+button('retry','js-sync')+'</div><p class="account-note">'+esc(t('device'))+'</p>';
   if(s.active.importAvailable)html+='<section class="account-import"><h2>'+esc(t('importTitle'))+'</h2><p>'+esc(t('importHelp'))+'</p>'+button('import','js-import')+'</section>';
   if(s.active.conflicts)html+='<section class="account-import"><p>'+esc(t('conflict'))+'</p>'+button('resolve','js-resolve')+'</section>';
   html+=button('export','js-export');
  }else{
   html+='<fieldset class="account-fields"><legend>'+esc(t('login'))+'</legend><label for="pilot-code">'+esc(t('code'))+'</label><input id="pilot-code" dir="ltr" lang="en" type="text" maxlength="64" autocomplete="off" autocapitalize="characters" spellcheck="false" aria-describedby="pilot-login-help"><p id="pilot-login-help">'+esc(t('intro'))+'</p><button type="button" class="btn btn--primary js-login">'+esc(t('login'))+'</button></fieldset>';
   // Retain cached drafts, but expose their export only after learner verification.
  }
  var root=shell.publicSet(html+'</section>');
  function wire(cls,fn){var n=root.querySelector(cls);if(n)n.addEventListener('click',fn);}
  wire('.js-login',async function(){var b=this,input=root.querySelector('#pilot-code');b.disabled=true;var value=input.value;input.value='';var ok=await A.login(value);if(ok&&global.App.enterCourse)await global.App.enterCourse();else if(ok)global.Views.account();else{b.disabled=false;status();input.focus();}});
  var code=root.querySelector('#pilot-code');if(code)bindEnter(code,root.querySelector('.js-login'));
  wire('.js-continue',function(){global.App.go('percorso');});wire('.js-sync',A.refresh);wire('.js-import',function(){A.importAnonymous();global.Views.account();});wire('.js-resolve',function(){A.resolve();global.Views.account();});wire('.js-export',A.exportPending);
  wire('.js-logout',async function(){this.disabled=true;if(await A.logout())global.App.go('home');else{this.disabled=false;status();}});
  accountUnsubscribe=A.subscribe(function(){var n=A.snapshot();if(viewKey(n)!==identity)global.Views.account();else status();});
  global.Views.onLeave=function(){if(accountUnsubscribe)accountUnsubscribe();accountUnsubscribe=null;var input=root.querySelector('#pilot-code');if(input)input.value='';};status();
 };

 global.Views.admin=function(){
  var disposed=false,offset=0,issued='',working=false;
  function draw(data,initialMessage){
   var html=shell.head(t('account'),t('admin'),t('adminHelp'))+'<section class="account-panel"><p class="js-admin-message" role="status" aria-live="polite">'+esc(initialMessage||'')+'</p>';
   if(!A.adminSession){html+='<fieldset class="account-fields"><legend>'+esc(t('login'))+'</legend><label for="pilot-admin-key">'+esc(t('key'))+'</label><input id="pilot-admin-key" dir="ltr" type="password" maxlength="43" autocomplete="off"><button type="button" class="btn btn--primary js-admin-login">'+esc(t('login'))+'</button></fieldset>';}
   else{
    html+='<div class="account-actions account-session-actions">'+button('logout','js-admin-logout account-logout')+button('refresh','js-admin-refresh')+'</div>';
    html+='<fieldset class="account-fields"><legend>'+esc(t('issue'))+'</legend><label for="pilot-code-expiry">'+esc(t('codeExpiry'))+'</label><input id="pilot-code-expiry" type="datetime-local"><label for="pilot-access-expiry">'+esc(t('accessExpiry'))+'</label><input id="pilot-access-expiry" type="datetime-local"><label for="pilot-assign">'+esc(t('assignment'))+'</label><input id="pilot-assign" type="text" dir="ltr" maxlength="36" autocomplete="off"><button type="button" class="btn btn--primary js-issue">'+esc(t('issue'))+'</button></fieldset>';
    if(issued)html+='<aside class="account-import"><p>'+esc(t('oneTime'))+'</p><label for="pilot-issued-code">'+esc(t('code'))+'</label><input id="pilot-issued-code" type="text" readonly dir="ltr" autocomplete="off"><div>'+button('clear','js-clear')+'</div></aside>';
    if(data){
     html+='<h2>'+esc(t('learners'))+' <bdi>'+esc(String(data.statistics.learners))+'</bdi></h2><div class="account-records">';
     (data.learners||[]).forEach(function(l){html+='<article class="account-record"><h3><bdi dir="ltr">'+esc(l.id)+'</bdi></h3><p>'+esc(t(l.access?'active':'revoked'))+' · '+esc(t('completed'))+' <bdi>'+esc(String(l.completed))+'</bdi></p><div class="account-actions"><button type="button" class="btn btn--ghost js-operation" data-action="revoke_access" data-id="'+esc(l.id)+'">'+esc(t('revokeAccess'))+'</button><button type="button" class="btn btn--ghost js-operation" data-action="grant" data-id="'+esc(l.id)+'">'+esc(t('grant'))+'</button></div></article>';});
     html+='</div><h2>'+esc(t('codes'))+' <bdi>'+esc(String(data.statistics.codes))+'</bdi></h2><div class="account-records">';
     (data.codes||[]).forEach(function(c){html+='<article class="account-record"><h3><bdi dir="ltr">'+esc(c.id)+'</bdi></h3><p><time dir="ltr">'+esc(c.expires_at)+'</time></p>';if(!c.revoked_at)html+='<div class="account-actions"><button type="button" class="btn btn--ghost js-operation" data-action="rotate" data-id="'+esc(c.id)+'">'+esc(t('rotate'))+'</button><button type="button" class="btn btn--ghost js-operation" data-action="revoke_code" data-id="'+esc(c.id)+'">'+esc(t('revokeCode'))+'</button></div>';html+='</article>';});
     html+='</div><div class="account-actions">'+button('previous','js-previous')+button('next','js-next')+'</div>';
    }
   }
   var root=shell.publicSet(html+'</section>');
   function on(cls,fn){var n=root.querySelector(cls);if(n)n.addEventListener('click',fn);}
   function message(text){var n=root.querySelector('.js-admin-message');if(n)n.textContent=text;}
   function dates(){var c=root.querySelector('#pilot-code-expiry'),a=root.querySelector('#pilot-access-expiry');return {codeExpiresAt:new Date(c.value).toISOString(),accessExpiresAt:new Date(a.value).toISOString()};}
   function defaultDate(days){var d=new Date(Date.now()+days*86400000);return new Date(d.getTime()-d.getTimezoneOffset()*60000).toISOString().slice(0,16);}
   if(root.querySelector('#pilot-code-expiry')){root.querySelector('#pilot-code-expiry').value=defaultDate(7);root.querySelector('#pilot-access-expiry').value=defaultDate(30);}
   var shown=root.querySelector('#pilot-issued-code');if(shown)shown.value=issued;
   on('.js-clear',function(){issued='';draw(data);});
   on('.js-admin-login',async function(){if(working)return;working=true;this.disabled=true;var input=root.querySelector('#pilot-admin-key'),value=input.value;input.value='';try{A.adminSession=await A.request('admin/login',{key:value},true);await load();}catch(e){message(errorText(e));this.disabled=false;}finally{working=false;}});
   var key=root.querySelector('#pilot-admin-key');if(key)bindEnter(key,root.querySelector('.js-admin-login'));
   on('.js-admin-logout',async function(){try{await A.request('admin/logout',{},true);A.adminSession=null;issued='';draw();}catch(e){message(errorText(e));}});
   on('.js-admin-refresh',function(){issued='';load();});
   on('.js-previous',function(){offset=Math.max(0,offset-50);issued='';load();});on('.js-next',function(){offset+=50;issued='';load();});
   on('.js-issue',function(){var body;try{body=dates();}catch(e){message(t('expiry'));return;}var assigned=root.querySelector('#pilot-assign').value.trim();if(assigned)body.learnerId=assigned;operate('issue',null,body);});
   root.querySelectorAll('.js-operation').forEach(function(b){b.addEventListener('click',function(){if(!global.confirm(t('confirm')))return;var body={};if(this.dataset.action==='grant'||this.dataset.action==='rotate'){try{body=dates();}catch(e){message(t('expiry'));return;}}operate(this.dataset.action,this.dataset.id,body);});});
   async function operate(action,id,fields){if(working)return;working=true;issued='';root.querySelectorAll('button').forEach(function(b){b.disabled=true;});var body=Object.assign({action:action,requestId:global.crypto.randomUUID()},fields||{});if(id)body.id=id;try{var result=await A.request('admin/operation',body,true);issued=result.code||'';await load();}catch(e){if(e.status===401)A.adminSession=null;draw(data,errorText(e));}finally{working=false;}}
  }
  async function load(){try{var data=await A.request('admin/list',undefined,true,undefined,offset);if(!disposed)draw(data);}catch(e){if(e.status===401)A.adminSession=null;if(!disposed)draw(null,errorText(e));}}
  draw(null,t('loading'));
  A.request('admin/session',undefined,true).then(function(s){A.adminSession=s.authenticated?s:null;if(!disposed){if(A.adminSession)load();else draw();}}).catch(function(){A.adminSession=null;if(!disposed)draw();});
  global.Views.onLeave=function(){disposed=true;issued='';var input=global.document.querySelector('#pilot-issued-code');if(input)input.value='';var key=global.document.querySelector('#pilot-admin-key');if(key)key.value='';};
 };
})(window);
