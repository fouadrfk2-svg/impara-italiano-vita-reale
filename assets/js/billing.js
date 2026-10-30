/* Optional Stripe billing surface. This script contains no secrets or payment identifiers. */
(function(global){
 "use strict";
 var csrf="",email="",configPromise=null;
 function request(path,method,body,needsCsrf){var h={"X-Vita-Request":"1"};if(body!==undefined)h["Content-Type"]="application/json";if(needsCsrf&&csrf)h["X-Vita-CSRF"]=csrf;return global.fetch("/api/billing/"+path,{method:method||"GET",credentials:"same-origin",cache:"no-store",headers:h,body:body===undefined?undefined:JSON.stringify(body)}).then(async function(r){var d=await r.json().catch(function(){return {};});if(!r.ok){var x=Error(d.error||"unavailable");x.status=r.status;x.diagnostic=d.diagnostic;x.diagnosticCode=d.diagnosticCode;x.diagnosticParam=d.diagnosticParam;throw x;}return d;});}
 function post(path,body){return request(path,"POST",body,true);}
 function message(root,text,bad){var box=root.querySelector("[data-billing-message]");if(!box)return;box.textContent=text;box.hidden=!text;box.setAttribute("role",bad?"alert":"status");}
 function configuration(){if(!configPromise)configPromise=global.fetch("/api/billing/config",{credentials:"same-origin",cache:"no-store",headers:{Accept:"application/json"}}).then(function(r){if(!r.ok)throw Error();return r.json();}).catch(function(){return {enabled:false};});return configPromise;}
  var whatsappSubscriptionMessage="مرحباً، أريد التسجيل في Vita Reale والدفع عبر واتساب. هل يمكنكم مساعدتي؟";
  function whatsappAlternative(extraClass){
   var box=document.createElement("div");box.className="guest-whatsapp-alternative"+(extraClass?" "+extraClass:"");
   var separator=document.createElement("span");separator.className="guest-whatsapp-separator";separator.textContent="أو";box.appendChild(separator);
   var link=document.createElement("a");link.className="guest-whatsapp-link";link.href="https://wa.me/393517015376?text="+encodeURIComponent(whatsappSubscriptionMessage);link.target="_blank";link.rel="noopener noreferrer";link.referrerPolicy="no-referrer";link.setAttribute("aria-label","التسجيل والدفع عبر واتساب");
   var ns="http://www.w3.org/2000/svg",svg=document.createElementNS(ns,"svg");svg.setAttribute("viewBox","0 0 24 24");svg.setAttribute("aria-hidden","true");svg.setAttribute("focusable","false");
   var mark=document.createElementNS(ns,"path");mark.setAttribute("d","M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.198.297-.767.966-.94 1.164-.173.198-.347.223-.644.074-.297-.149-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.074-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.875 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.71.306 1.264.489 1.696.625.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.999-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.645.001 5.131 1.031 7.004 2.905a9.825 9.825 0 012.899 7.008c-.003 5.45-4.437 9.885-9.898 9.885m8.413-18.297A11.815 11.815 0 0012.013.004C5.5.004.2 5.303.197 11.816c-.001 2.09.545 4.128 1.582 5.921L.09 24l6.399-1.679a11.92 11.92 0 005.518 1.36h.005c6.514 0 11.814-5.3 11.818-11.813a11.81 11.81 0 00-3.465-8.38z");mark.setAttribute("fill","currentColor");svg.appendChild(mark);link.appendChild(svg);
   var label=document.createElement("span");label.textContent="التسجيل والدفع عبر واتساب";link.appendChild(label);box.appendChild(link);return box;
  }
 function updateGuestCopy(selector,copy){document.querySelectorAll(selector).forEach(function(el){if(el.getAttribute("data-billing-online")==="1")return;el.setAttribute("data-billing-online","1");el.textContent=copy;});}
 function upgradeGuest(){configuration().then(function(c){
  if(!c.enabled)return;
  document.querySelectorAll(".guest-header-login").forEach(function(a){var href="#/billing?signin=1",markup='<svg class="guest-signin-icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="m10 17 5-5-5-5M15 12H3M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"></path></svg><span>تسجيل الدخول</span>';if(a.getAttribute("href")!==href)a.setAttribute("href",href);if(a.innerHTML!==markup)a.innerHTML=markup;});
  document.querySelectorAll(".guest-cta").forEach(function(a){var href="#/billing?signin=1",copy="تسجيل الدخول بالإيميل";if(a.getAttribute("href")!==href)a.setAttribute("href",href);if(a.textContent!==copy)a.textContent=copy;});
  document.querySelectorAll(".guest-actions").forEach(function(el){
   if(el.nextElementSibling?.classList.contains("guest-code-login"))return;
   var p=document.createElement("p");p.className="guest-code-login";
   p.appendChild(document.createTextNode("عندك رمز تفعيل قديم؟ "));
   var a=document.createElement("a");a.href="#/account";a.textContent="الدخول بالكود";
   p.appendChild(a);el.insertAdjacentElement("afterend",p);
  });
   document.querySelectorAll(".guest-subscribe").forEach(function(a){if(a.getAttribute("href")!=="#/billing"){a.setAttribute("href","#/billing");a.removeAttribute("target");a.removeAttribute("rel");a.removeAttribute("referrerpolicy");a.innerHTML='اشترك الآن — <bdi dir="ltr">9.99€</bdi> شهريًا <span aria-hidden="true">↗</span>';}if(a.nextElementSibling?.classList.contains("guest-whatsapp-alternative"))return;a.insertAdjacentElement("afterend",whatsappAlternative("guest-whatsapp-marketing"));var actions=a.closest(".guest-actions");if(actions)actions.classList.add("guest-actions--whatsapp");});
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
  var checkoutWhatsApp=null;if(params.signin!=="1"&&!logged){checkoutWhatsApp=whatsappAlternative("billing-whatsapp-option");root.querySelector("[data-checkout]").insertAdjacentElement("afterend",checkoutWhatsApp);}
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
   if(checkoutWhatsApp)checkoutWhatsApp.hidden=active;
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
