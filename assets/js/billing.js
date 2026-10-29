/* Optional Stripe billing surface. This script contains no secrets or payment identifiers. */
(function(global){
 "use strict";
 var csrf="",email="",configPromise=null;
 function request(path,method,body,needsCsrf){var h={"X-Vita-Request":"1"};if(body!==undefined)h["Content-Type"]="application/json";if(needsCsrf&&csrf)h["X-Vita-CSRF"]=csrf;return global.fetch("/api/billing/"+path,{method:method||"GET",credentials:"same-origin",cache:"no-store",headers:h,body:body===undefined?undefined:JSON.stringify(body)}).then(async function(r){var d=await r.json().catch(function(){return {};});if(!r.ok){var x=Error(d.error||"unavailable");x.status=r.status;x.diagnostic=d.diagnostic;x.diagnosticCode=d.diagnosticCode;x.diagnosticParam=d.diagnosticParam;throw x;}return d;});}
 function post(path,body){return request(path,"POST",body,true);}
 function message(root,text,bad){var box=root.querySelector("[data-billing-message]");if(!box)return;box.textContent=text;box.hidden=!text;box.setAttribute("role",bad?"alert":"status");}
 function configuration(){if(!configPromise)configPromise=global.fetch("/api/billing/config",{credentials:"same-origin",cache:"no-store",headers:{Accept:"application/json"}}).then(function(r){if(!r.ok)throw Error();return r.json();}).catch(function(){return {enabled:false};});return configPromise;}
 function updateGuestCopy(selector,copy){document.querySelectorAll(selector).forEach(function(el){if(el.getAttribute("data-billing-online")==="1")return;el.setAttribute("data-billing-online","1");el.textContent=copy;});}
 function upgradeGuest(){configuration().then(function(c){
  if(!c.enabled)return;
  document.querySelectorAll(".guest-header-login").forEach(function(a){a.href="#/billing?signin=1";a.innerHTML='تسجيل الدخول <span aria-hidden="true">↗</span>';});
  document.querySelectorAll(".guest-cta").forEach(function(a){a.href="#/billing?signin=1";a.textContent="تسجيل الدخول بالإيميل";});
  document.querySelectorAll(".guest-actions").forEach(function(el){
   if(el.nextElementSibling?.classList.contains("guest-code-login"))return;
   var p=document.createElement("p");p.className="guest-code-login";
   p.appendChild(document.createTextNode("عندك رمز تفعيل قديم؟ "));
   var a=document.createElement("a");a.href="#/account";a.textContent="الدخول بالكود";
   p.appendChild(a);el.insertAdjacentElement("afterend",p);
  });
  document.querySelectorAll(".guest-subscribe").forEach(function(a){if(a.getAttribute("href")==="#/billing")return;a.setAttribute("href","#/billing");a.removeAttribute("target");a.removeAttribute("rel");a.removeAttribute("referrerpolicy");a.innerHTML='اشترك الآن — <bdi dir="ltr">9.99€</bdi> شهريًا <span aria-hidden="true">↗</span>';});
  document.querySelectorAll(".guest-how:not([data-billing-configured])").forEach(function(list){list.setAttribute("data-billing-configured","true");list.querySelectorAll("li").forEach(function(li,i){li.textContent=["أدخل بريدك الإلكتروني وتحقّق منه برمز آمن.","أكمل الدفع على صفحة Stripe الآمنة.","يُفعّل الوصول بعد تأكيد Stripe، ويمكنك إدارة اشتراكك أو إلغاؤه."][i]||li.textContent;});});
  updateGuestCopy(".guest-price-disclosure","9.99€ شهريًا مع تجديد تلقائي، دون فترة تجريبية. يتم الدفع بأمان عبر Stripe ويمكنك إلغاء التجديد في أي وقت. إذا كان لديك رمز تفعيل يدوي، يمكنك الاستمرار باستخدامه.");
  updateGuestCopy("#guest-request > div > p:last-of-type","يمكنك بدء الاشتراك الإلكتروني بـ 9.99€ شهريًا. أَكِّد بريدك الإلكتروني أولًا، ثم انتقل إلى صفحة الدفع الآمنة على Stripe.");
  updateGuestCopy("#guest-request .guest-contact > p:first-child","يفتح الزر صفحة الاشتراك الآمن: التحقق من البريد ثم الدفع عبر Stripe. لن يتم خصم أي مبلغ قبل تأكيد الدفع.");
  document.querySelectorAll(".guest-faq details:not([data-billing-configured])").forEach(function(d){
   var heading=d.querySelector("summary"),answer=d.querySelector("p");if(!heading||!answer)return;
   if(heading.textContent.trim()==="هل يمكنني الدفع الآن على الموقع؟")answer.textContent="نعم. يمكنك الاشتراك بـ 9.99€ شهريًا عبر Stripe بعد تأكيد بريدك الإلكتروني. الاشتراك يتجدد تلقائيًا ويمكنك إلغاء التجديد في أي وقت.";
   else if(heading.textContent.trim()==="كيف أدخل بعد التفعيل؟")answer.textContent="بعد تأكيد Stripe للدفع، يُفتح الوصول تلقائيًا من خلال بريدك الإلكتروني. إذا كان لديك رمز تفعيل يدوي سابق، يمكنك الاستمرار في استخدامه.";
   else return;
   d.setAttribute("data-billing-configured","true");
  });
 });}

 if(global.MutationObserver&&global.document&&global.document.documentElement){new MutationObserver(upgradeGuest).observe(global.document.documentElement,{subtree:true,childList:true});global.addEventListener("hashchange",upgradeGuest);}
 function renderUnavailable(){global.Views.shell.publicSet('<div class="billing-page" lang="ar" dir="rtl"><a class="btn btn--quiet" href="#/home">العودة إلى الصفحة الرئيسية</a><section class="billing-card"><p class="guest-eyebrow">VITA REALE / الاشتراك</p><h1>الاشتراك الإلكتروني غير متاح الآن</h1><p>يمكنك الرجوع إلى الصفحة الرئيسية والاطّلاع على وسيلة التواصل المتاحة حاليًا.</p></section></div>');}
 global.Views.billing=function(params){configuration().then(function(c){if(!c.enabled){renderUnavailable();return;}renderForm(params||{});});};
 function renderForm(params){var logged=global.Account.snapshot().authenticated,root=global.Views.shell.publicSet('<div class="billing-page" lang="ar" dir="rtl"><a class="btn btn--quiet" href="#/home">العودة</a><header class="billing-heading"><p class="guest-eyebrow">VITA REALE / اشتراك شهري</p><h1>'+(params.signin==="1"?"تسجيل الدخول إلى Vita Reale":"تعلّم الإيطالية على إيقاعك")+'</h1><p>'+(params.signin==="1"?"إذا كنت مشتركًا، أدخل بريدك الإلكتروني لتحصل على رمز تحقق آمن وتدخل مباشرة إلى دروسك.":"9.99€ شهريًا، مع تجديد تلقائي. لا توجد فترة تجريبية. يمكنك الإلغاء في أي وقت من بوابة Stripe.")+'</p><p>يشمل الاشتراك الدروس من A1 إلى C1 والتسجيلات والتمارين والمحادثات والمراجعة وحفظ التقدّم.</p></header><section class="billing-card"><div data-billing-message hidden></div><form data-email-form><label for="billing-email">البريد الإلكتروني</label><input id="billing-email" name="email" type="email" autocomplete="email" required maxlength="254" dir="ltr"><button class="btn btn--primary" type="submit">إرسال رمز التحقّق</button></form><form data-code-form hidden><label for="billing-code">رمز التحقّق المرسل إلى بريدك</label><input id="billing-code" name="code" inputmode="numeric" autocomplete="one-time-code" pattern="[0-9]{8}" minlength="8" maxlength="8" required dir="ltr"><button class="btn btn--primary" type="submit">تأكيد البريد</button></form><div data-billing-panel hidden><p data-billing-status></p><button class="btn btn--primary" type="button" data-checkout>اشترك الآن — <bdi dir="ltr">9.99€</bdi> شهريًا</button><button class="btn btn--ghost" type="button" data-portal hidden>إدارة الاشتراك أو إلغاؤه</button><button class="btn btn--ghost" type="button" data-open-learning hidden>فتح مساحة التعلّم</button></div><p class="billing-code-login">عندك رمز تفعيل؟ <a href="#/account">الدخول بالكود</a></p></section></div>');
 var emailForm=root.querySelector("[data-email-form]"),codeForm=root.querySelector("[data-code-form]"),panel=root.querySelector("[data-billing-panel]"),emailInput=root.querySelector("#billing-email"),codeInput=root.querySelector("#billing-code"),purpose=logged?"bind":"access";
 function setBusy(form,value){form.querySelectorAll("button").forEach(function(b){b.disabled=value;});}

 var opening=null,courseOpened=false;
 // The server alone grants access. A valid billing session cannot replace
 // an active Stripe subscription or a manually issued course entitlement.
 function enterLearning(silent){
  if(courseOpened)return Promise.resolve(true);
  if(opening)return opening;
  opening=(async function(){
   var button=root.querySelector("[data-open-learning]");
   button.disabled=true;
   if(!silent)message(root,"جارٍ فتح مساحة التعلّم…",false);
   try{
    var r=await post("activate",{});
    if(!r.active){if(!silent)message(root,"لم يصل تأكيد الاشتراك بعد. يمكنك المحاولة مجددًا.",false);return false;}
    await global.Account.refresh();
    if(!global.Account.snapshot().authenticated)throw Error("Session not verified");
    await global.App.enterCourse();
    courseOpened=global.Router.current.route!=="billing"&&global.Account.snapshot().authenticated;
    if(!courseOpened&&!silent)message(root,"تعذّر فتح الدروس تلقائيًا. اضغط زر فتح مساحة التعلّم للمحاولة مجددًا.",true);
    return courseOpened;
   }catch(error){
    if(!silent)message(root,"تعذّر فتح الدروس الآن. يمكنك المحاولة مجددًا دون دفع جديد.",true);
    return false;
   }finally{button.disabled=false;opening=null;}
  })();
  return opening;
 }
 function loadStatus(){return request("status").then(async function(d){
  if(!d.authenticated)return false;
  csrf=d.csrf||csrf;
  emailForm.hidden=true;codeForm.hidden=true;panel.hidden=false;
  var sub=d.subscription,copy=sub?"حالة الاشتراك: "+sub.status+(sub.currentPeriodEnd?" · حتى "+new Date(sub.currentPeriodEnd).toLocaleDateString("ar"):"")+(sub.cancelAtPeriodEnd?" · الإلغاء مجدول في نهاية الفترة":""):"تم التحقّق من البريد. يمكنك بدء الاشتراك الآمن أو متابعة حالة اشتراكك هنا.";
  var end=sub&&sub.currentPeriodEnd?Date.parse(sub.currentPeriodEnd):NaN;
  var active=!!sub&&sub.status==="active"&&Number.isFinite(end)&&end>Date.now();
  if(active)copy="اشتراكك مفعّل. جارٍ فتح مساحة التعلّم دون دفع جديد.";
  root.querySelector("[data-billing-status]").textContent=copy;
  root.querySelector("[data-checkout]").hidden=active;
  root.querySelector("[data-open-learning]").hidden=!active;
  root.querySelector("[data-portal]").hidden=!sub;
  if(active&&params.manage!=="1")await enterLearning(false);
  return true;
 }).catch(function(){return false;});}
 emailForm.addEventListener("submit",async function(e){e.preventDefault();if(!emailForm.reportValidity())return;setBusy(emailForm,true);message(root,"جارٍ إرسال رمز التحقّق…",false);email=emailInput.value.trim();try{await global.Account.requestBilling("billing/request-code",{email:email,purpose:purpose});emailForm.hidden=true;codeForm.hidden=false;codeInput.focus();message(root,"إذا كان الطلب صالحًا، فسيصلك رمز إلى بريدك الإلكتروني. تنتهي صلاحيته خلال 10 دقائق.",false);}catch(err){message(root,"تعذّر إرسال الرمز الآن. حاول مجددًا بعد قليل.",true);}finally{setBusy(emailForm,false);}});
 codeForm.addEventListener("submit",async function(e){e.preventDefault();if(!codeForm.reportValidity())return;setBusy(codeForm,true);message(root,"جارٍ التحقّق…",false);try{var result=await global.Account.requestBilling("billing/verify-code",{email:email,code:codeInput.value,purpose:purpose});csrf=result.csrf||"";var hasStatus=await loadStatus();if(hasStatus&&!courseOpened&&params.checkout==="success")pollActivation(root);else if(hasStatus&&!courseOpened)message(root,"تم التحقّق من بريدك بأمان.",false);}catch(err){message(root,"الرمز غير صالح أو انتهت صلاحيته. اطلب رمزًا جديدًا وحاول مرة أخرى.",true);}finally{setBusy(codeForm,false);}});
 root.querySelector("[data-checkout]").addEventListener("click",async function(){if(!email){message(root,"أدخل بريدك الإلكتروني ثم تحقّق منه أولًا.",true);emailForm.hidden=false;emailInput.focus();return;}this.disabled=true;message(root,"جارٍ إعداد صفحة الدفع الآمنة…",false);try{var result=await post("checkout",{email:email,requestId:global.crypto.randomUUID()});global.location.assign(result.url);}catch(err){var detail=err.diagnostic?" [TEST: "+err.diagnostic+(err.diagnosticCode?"/"+err.diagnosticCode:"")+(err.diagnosticParam?"/"+err.diagnosticParam:"")+"]":"";message(root,"تعذّر بدء الدفع. تحقّق من بريدك أو حاول مجددًا لاحقًا."+detail,true);this.disabled=false;}});
 root.querySelector("[data-portal]").addEventListener("click",async function(){this.disabled=true;try{var result=await post("portal",{});global.location.assign(result.url);}catch(err){message(root,"تعذّر فتح إدارة الاشتراك الآن.",true);this.disabled=false;}});
 root.querySelector("[data-open-learning]").addEventListener("click",function(){enterLearning(false);});
 loadStatus().then(function(ok){if(ok&&!courseOpened&&params.checkout==="success")pollActivation(root);else if(!ok&&params.checkout==="success")message(root,"يجري تأكيد الدفع بأمان. تحقّق من بريدك الإلكتروني لمتابعة الوصول.",false);});

 async function pollActivation(root){
  for(var i=0;i<15&&global.Router.current.route==="billing";i++){
   if(await enterLearning(true))return;
   await new Promise(function(resolve){setTimeout(resolve,2000);});
  }
  if(!courseOpened&&global.Router.current.route==="billing"){
   root.querySelector("[data-open-learning]").hidden=false;
   message(root,"إذا تأخر تأكيد Stripe، يمكنك استعمال زر فتح مساحة التعلّم دون دفع جديد.",false);
  }
 }
 }

 global.Billing={configuration:configuration,upgradeGuest:upgradeGuest};
})(window);
