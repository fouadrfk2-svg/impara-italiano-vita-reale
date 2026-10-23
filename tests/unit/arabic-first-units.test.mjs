import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import vm from 'node:vm';
import { loadEngine, CORE, VERBS, ROOT } from './_harness.mjs';
import { checkPartialCourse } from '../../scripts/parity.mjs';

const plain=x=>JSON.parse(JSON.stringify(x));
const ids=['a1-u01-l4','a1-u01-test','a1-u02-l1','a1-u02-l2','a1-u02-l3','a1-u02-l4','a1-u02-test'];
const expectedKeys=['lesson:a1-u01-l1','lesson:a1-u01-l2','lesson:a1-u01-l3','unit:a1-u01','lesson:a1-u01-l4','lesson:a1-u01-test','unit:a1-u02','lesson:a1-u02-l1','lesson:a1-u02-l2','lesson:a1-u02-l3','lesson:a1-u02-l4','lesson:a1-u02-test'];
function overlay(lang){let data;vm.runInNewContext(readFileSync(join(ROOT,'data/i18n',lang,'a1-01.js'),'utf8'),{LINGUAI:{addStrings(_l,map){data=plain(map);}}});return data;}
function setup(){const box=loadEngine({files:[...CORE,...VERBS,'assets/js/i18n.js','assets/js/i18n-merge.js','data/i18n/ui-en.js','data/i18n/ui-ar.js']});box.Core.load();for(const file of ['data/core/curriculum-index.js','data/core/a1-01.js','data/core/a1-02.js',...['en','pl','es','fr','de','ar'].flatMap(lang=>['a1-01.js','a1-02.js'].map(file=>'data/i18n/'+lang+'/'+file))])vm.runInContext(readFileSync(join(ROOT,file),'utf8'),box.sandbox);return box;}
function select(box,lang){box.Core.state.settings.lang=lang;box.sandbox.LINGUAI.applyStrings(lang);box.sandbox.Registry.reindex();}
const ar=overlay('ar'),en=overlay('en');
const plans={
 'a1-u01-l4':[
  ['mcq','Come sta?','Lei'],['mcq','Sono bene.','غير صحيحة'],['conj',['sto','stai','sta','state'],'أنا'],['fill','state','ragazzi'],['trans','Sto bene, grazie. E tu?','وأنت'],
  ['dialogue',['Sto bene, e tu?','Sì, grazie!'],'مقهى'],['match',['بخير جدًا','لا بأس','حالتي متوسّطة','لست بخير'],'بمعناه'],['listen','Buonasera signora, come sta?','سيّدتي'],['speak',"Non c'è male, grazie. E Lei?",'وحضرتك']
 ],
 'a1-u01-test':[
  ['mcq','Buonasera','السادسة والنصف'],['fill','siamo','Noi'],['fill','stai','صديقتك'],['gender',['lo',"l'",'la','il'],'أداة التعريف'],['mcq','gli amici','جمع'],['multi',['il caffè','il bar','la città'],'الجمع'],
  ['trans',"Un'acqua per favore",'ماء'],['order','Gli studenti sono al bar','الطلاب'],['listen','Due caffè e un cornetto, per favore.','قهوة'],['speak','Buongiorno, come sta?','حضرتك']
 ],
 'a1-u02-l1':[
  ['mcq','Come ti chiami?','اسمه'],['mcq','Sono americana.','صحيحة'],['fill','mi','Marta'],['fill','a','Roma'],['cloze',['mi','sono','abito'],'كاشيا'],['order','Piacere di conoscerti, mi chiamo Luca','لوكا'],
  ['dialogue',['Mi chiamo Ewa.','Sono dalla Polonia.'],'إيفا'],['listen','Mi chiamo Elena e abito a Napoli.','نابولي'],['speak','Piacere di conoscerti!','بمعرفتك']
 ],
 'a1-u02-l2':[
  ['conj',['ho','hai','ha','abbiamo','avete','hanno'],'الصامت'],['mcq','Ho fame','جائع'],['mcq','76','settantasei'],['fill','93','novantatré'],['fill',"'",'العلامة الناقصة فقط'],['trans','Quanti anni hai?','عمرك'],
  ['match',['أنا عطشان','أشعر بالنعاس','أنا خائف','أنا على حقّ'],'بمعناه'],['cloze',['costa','trentadue','ho'],'اثنان وثلاثون'],['listen','Ho trentacinque anni e abito a Torino.','خمسة وثلاثون'],['speak','Quanto costa un cappuccino?','الكابتشينو']
 ],
 'a1-u02-l3':[
  ['conj',['faccio','fai','fa','facciamo','fate','fanno'],'المضعّفة'],['mcq',"Faccio l'insegnante.",'معلّم'],['mcq','la professoressa','مؤنّث'],['fill','la','dottoressa'],['gender',['la',"l'",'la',"l'"],'أداة التعريف'],['trans','Che lavoro fai?','عملك'],
  ['match',["l'attrice",'la commessa','la studentessa','la giornalista'],'المؤنّث'],['order','Lavoro in una banca a Milano','مصرف'],['listen',"Faccio l'architetto, lavoro con mio fratello.",'أخي'],['speak','Che lavoro fai? Io faccio la giornalista.','صحفية']
 ],
 'a1-u02-l4':[
  ['conj',['parlo','parli','parla','parliamo','parlate','parlano'],'نهايات'],['conj',['cerchi','cerchiamo'],'الكتابة'],['mcq','mangi','تأكل'],['fill','abitano','Bologna'],['fill','non','النفي'],['trans','Cerchiamo un appartamento a Roma','شقّة'],
  ['multi',['studio','studi','studiamo','studiate'],'الصيغ'],['order','Non lavoro il sabato','السبت'],['listen','Studio italiano da tre mesi.','ثلاثة أشهر'],['speak','Non parlo bene, ma capisco quasi tutto.','تقريبًا']
 ],
 'a1-u02-test':[
  ['fill','mi','Peter'],['fill','hai','عمرك'],['mcq','84','ottantaquattro'],['mcq','Ho fame','جائع'],['conj',['faccio','fa','facciamo'],null],['mcq','paghi','تدفع'],
  ['cloze',['sono','abito','faccio'],'بولندية'],['trans','Non parlo italiano','الإيطالية'],['listen','Ho ventisette anni e cerco lavoro.','سبعة وعشرون'],['speak','Mi chiamo Anna e faccio la giornalista.','صحفية']
 ]
};

test('the first two translated units remain complete in the expanded manifest',()=>{
 const box=setup(),manifest=plain(box.sandbox.I18n.courseOverrides('ar'));
 for(const key of expectedKeys)assert.ok(manifest['a1-01.js'].includes(key));assert.deepEqual(Object.keys(ar),manifest['a1-01.js']);
 const errors=[];checkPartialCourse(manifest,{'a1-01.js':ar,'a1-02.js':overlayFile('ar','a1-02.js')},{...overlay('pl'),...overlayFile('pl','a1-02.js')},errors);assert.deepEqual(errors,[]);
 assert.equal(ids.reduce((n,id)=>n+plans[id].length,0),68);
});
for(const id of ids){
 test(id+' has complete Arabic text and preserves every neutral Italian field',()=>{
  const box=setup();select(box,'ar');assert.equal(box.sandbox.LINGUAI.lessonLanguage('ar',id),'ar');
  const patch=ar['lesson:'+id],base=en['lesson:'+id];assert.deepEqual(Object.keys(patch).sort(),Object.keys(base).sort());
  let original;vm.runInNewContext(readFileSync(join(ROOT,'data/core/a1-01.js'),'utf8'),{LINGUAI:{addUnits(_c,units){for(const u of units)for(const l of [...u.lessons,u.test])if(l.id===id)original=plain(l);}}});
  const current=plain(box.Core.getLesson(id).lesson);
  function unchanged(source,target){for(const [key,value] of Object.entries(source)){if(value&&typeof value==='object')unchanged(value,target[key]);else assert.equal(target[key],value,id+': '+key);}}
  unchanged(original,current);
  function translated(value,keyPath=''){
   if(Array.isArray(value))return value.forEach((item,i)=>translated(item,keyPath+'['+i+']'));
   if(value&&typeof value==='object')return Object.entries(value).forEach(([key,item])=>translated(item,keyPath+'.'+key));
   assert.equal(typeof value,'string',keyPath);
   if(/[\u0600-\u06ff]/.test(value))return;
   if(/\.grammar\.table\.rows/.test(keyPath))return; // Italian-only cells remain verbatim.
   if(/\.opts\[/.test(keyPath))return; // All choices in this batch are Italian or unchanged digits.
   if(id==='a1-u02-l3'&&/\.exercises\[6\]\.pairs/.test(keyPath))return; // Italian feminine forms.
   assert.fail('Untranslated text slot '+id+keyPath+': '+value);
  }
  translated(patch);
  for(let i=0;i<patch.exercises.length;i++)if(base.exercises[i].opts)assert.deepEqual(patch.exercises[i].opts,base.exercises[i].opts);
  if(patch.grammar)patch.grammar.table.rows.forEach((row,i)=>row.forEach((cell,j)=>{const before=base.grammar.table.rows[i][j];if(!/[\u0600-\u06ff]/.test(cell))assert.equal(cell,before);else if(before.includes('('))assert.ok(cell.includes(before.split('(')[0].trim()),'Italian phrase within mixed cell');}));
 });
 plans[id].forEach(([type,answer,meaning],i)=>test(id+' exercise '+(i+1)+' Arabic meaning matches the unchanged '+type+' key',()=>{
  const box=setup();select(box,'ar');const exercise=plain(box.Core.getLesson(id).lesson.exercises[i]);
  assert.equal(exercise.t,type);if(meaning)assert.ok(JSON.stringify(ar['lesson:'+id].exercises[i]).includes(meaning),meaning);
  if(type==='mcq')assert.equal(exercise.opts[exercise.a],answer);
  if(type==='multi')assert.deepEqual(exercise.a.map(index=>exercise.opts[index]),answer);
  if(['fill','trans','order'].includes(type))assert.equal(box.Core.checkOpen(answer,exercise.a,true).ok,true);
  if(type==='order')assert.equal(box.Core.norm(exercise.tokens.join(' ')),box.Core.norm(answer));
  if(['listen','speak'].includes(type))assert.equal(exercise.it,answer);
  if(type==='gender')assert.deepEqual(exercise.items.map(item=>item.a),answer);
  if(type==='match')assert.deepEqual(exercise.pairs.map(pair=>pair.tr),answer);
  if(type==='cloze'){assert.equal(exercise.gaps.length,answer.length);answer.forEach((value,gap)=>assert.equal(box.Core.checkOpen(value,exercise.gaps[gap],false).ok,true));}
  if(type==='dialogue')assert.deepEqual(exercise.lines.filter(line=>line.choices).map(line=>line.choices[line.a]),answer);
  if(type==='conj'){const forms=box.sandbox.Verbs.conjugate(exercise.verb,'pres');assert.deepEqual(exercise.persons.map(p=>forms[p]),answer);}
 }));
}
test('Arabic uses the actual Polish names, cities and nationalities in the Italian, not mismatched English glosses',()=>{
 const intro=ar['lesson:a1-u02-l1'];assert.match(intro.vocab[6],/بولندي/);assert.match(intro.grammar.examples[1].tr,/كراكوف/);assert.match(intro.grammar.examples[2].tr,/بولندية/);assert.match(intro.exercises[4].tr,/كاشيا.*غدانسك/);assert.match(ar['lesson:a1-u02-test'].exercises[6].tr,/بولندية/);
 assert.doesNotMatch(JSON.stringify(intro),/أمريكية، لكن|سياتل|بوسطن/);
 assert.match(ar['lesson:a1-u01-l4'].theory[3].contrast,/Sono stanco/);
 assert.match(ar['lesson:a1-u02-l4'].theory[1].p,/la-<b>vo<\/b>-ra-no/);
 assert.match(ar['lesson:a1-u02-l3'].theory[1].list[1],/ليست.*قاعدة لكل/);
});
test('all five complete languages have four explicit empty test glosses, so Arabic cannot leak back through sparse slots',()=>{
 for(const lang of ['pl','en','es','fr','de'])assert.deepEqual(overlay(lang)['lesson:a1-u01-test'].exercises[3].items,['','','','']);
});
test('whole units, tests and unrelated English fallback restore exactly across Arabic-English-Arabic and every existing language',()=>{
 const box=setup(),snapshot=()=>plain(box.Core.registry.byCode.A1.units);
 for(const lang of ['en','pl','es','fr','de']){
  select(box,lang);const before=snapshot();select(box,'ar');const arabic=snapshot();
  assert.equal(arabic[0].title,ar['unit:a1-u01'].title);assert.equal(arabic[1].grammarNote,ar['unit:a1-u02'].grammarNote);
  for(const next of [lang,'ar',lang,'ar']){select(box,next);assert.deepEqual(snapshot(),next==='ar'?arabic:before);}
 }
 select(box,'en');const other=snapshot()[6];select(box,'ar');assert.deepEqual(snapshot()[6],other);
});
test('each new lesson or assessment falls back as a whole when a key or exercise is missing',()=>{
 for(const id of ids)for(const damage of [p=>{delete p.title;},p=>p.exercises.pop(),p=>{p.theory=[];}]){
  const box=setup(),patch=overlay('ar');damage(patch['lesson:'+id]);box.sandbox.LINGUAI.addStrings('ar',patch);select(box,'es');select(box,'ar');
  assert.equal(box.sandbox.LINGUAI.lessonLanguage('ar',id),'en');assert.equal(box.Core.getLesson(id).lesson.title,en['lesson:'+id].title);
  const errors=[];checkPartialCourse(box.sandbox.I18n.courseOverrides('ar'),{'a1-01.js':patch,'a1-02.js':overlayFile('ar','a1-02.js')},{...overlay('pl'),...overlayFile('pl','a1-02.js')},errors);assert.ok(errors.some(e=>e.includes(id)));
 }
});
test('unit summaries fall back atomically and independently; undeclared units cannot override English',()=>{
 for(const key of ['unit:a1-u01','unit:a1-u02'])for(const damage of [p=>{delete p.grammarNote;},p=>{p.title=42;}]){
  const box=setup(),patch=overlay('ar');damage(patch[key]);patch['unit:a1-u07']={title:'غير معلن',grammarNote:'غير معلن'};box.sandbox.LINGUAI.addStrings('ar',patch);select(box,'es');select(box,'ar');
  const u=box.Core.registry.byCode.A1.units.find(u=>'unit:'+u.id===key);assert.equal(u.title,en[key].title);assert.equal(u.grammarNote,en[key].grammarNote);assert.equal(box.Core.registry.byCode.A1.units[6].title,overlayFile('en','a1-02.js')['unit:a1-u07'].title);
  assert.equal(box.sandbox.LINGUAI.lessonLanguage('ar',u.lessons[0].id),'ar');
  const errors=[];checkPartialCourse(box.sandbox.I18n.courseOverrides('ar'),{'a1-01.js':patch,'a1-02.js':overlayFile('ar','a1-02.js')},{...overlay('pl'),...overlayFile('pl','a1-02.js')},errors);assert.ok(errors.some(e=>e.includes(key)));assert.ok(errors.some(e=>e.includes('undeclared entry')));
 }
});
test('unit declarations do not interfere with card gloss lookup or learner state',()=>{
 const box=setup(),C=box.Core;select(box,'en');ids.forEach(id=>C.recordLesson(id,8,10,50));C.addCard('ho fame',"I'm hungry",'a1-u02-l2');
 select(box,'ar');C.addCard('ho fame','أنا جائع','copertura');assert.equal(C.state.srs[C.cardKey('ho fame')].tr.ar,'أنا جائع');assert.equal(C.state.srs[C.cardKey('ho fame')].tr.en,"I'm hungry");
 const before=plain(C.state);delete before.settings.lang;for(const lang of ['en','ar','en','ar']){select(box,lang);const current=plain(C.state);delete current.settings.lang;assert.deepEqual(current,before);}assert.equal(C.state.schema,2);
});

function overlayFile(lang,file){let map;vm.runInNewContext(readFileSync(join(ROOT,"data/i18n",lang,file),"utf8"),{LINGUAI:{addStrings(_l,value){map=JSON.parse(JSON.stringify(value));}}});return map;}
