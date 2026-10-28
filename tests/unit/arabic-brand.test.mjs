import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
import {ROOT} from './_harness.mjs';
import {join} from 'node:path';
const read=f=>readFileSync(join(ROOT,f),'utf8');
test('Vita Reale learner brand is a native guarded hash link with a localized accessible name',()=>{
 const html=read('index.html');assert.match(html,/<a class="rail__brand" href="#\/oggi"[^>]+data-i18n-label="app.brandHome"/);assert(!html.includes('>Impara l\'Italiano</p>'));
 for(const l of ['ar','en']){let map;vm.runInNewContext(read('data/i18n/ui-'+l+'.js'),{LINGUAI:{addUI:(_l,m)=>map=m}});assert.match(map['app.title'],/^Vita Reale/);assert.match(map['app.brandHome'],/^Vita Reale — /);}
 assert.match(read('assets/js/guest.js'),/href="#\/home" class="guest-brand"/);assert.match(read('assets/js/guest.js'),/Andrea Bonacci/);assert.match(read('assets/js/guest.js'),/CC BY-SA 4.0/);
 const m=JSON.parse(read('manifest.webmanifest'));assert.equal(m.name,'Vita Reale');assert.equal(m.lang,'ar');assert.equal(m.dir,'rtl');
});
test('Arabic font is locally hosted, variable, licensed and cached; Latin families remain intact',()=>{
 const css=read('assets/css/rtl.css'),app=read('assets/css/app.css');assert.match(css,/font-family:"Noto Sans Arabic"/);assert.match(css,/font-weight:400 800/);assert.match(css,/font-display:swap/);assert.match(css,/unicode-range:U\+0600-06FF/);assert(!/Tahoma/.test(css+read('assets/css/guest.css')));
 assert.match(app,/--sans: 'Manrope', 'Noto Sans Arabic'/);assert.match(app,/--display: 'Spectral', 'Noto Sans Arabic'/);assert.match(app,/--mono: 'JetBrains Mono'/);
 assert.equal(readFileSync(join(ROOT,'assets/fonts/noto-sans-arabic-arabic.woff2')).subarray(0,4).toString(),'wOF2');assert.match(read('assets/fonts/OFL-NotoSansArabic.txt'),/SIL OPEN FONT LICENSE Version 1.1/);assert.match(read('sw.js'),/assets\/fonts\/noto-sans-arabic-arabic.woff2/);
 assert(!/fonts\.googleapis|fonts\.gstatic/.test(read('index.html')+css));
});
test('Arabic/Italian word boundaries are legible without changing Italian tokens or answer data',()=>{
 for(const file of ['a1-02.js','a1-03.js']){const text=read('data/i18n/ar/'+file);assert(!/أو(?=[A-Za-z])/.test(text));assert.match(text,/أو /);}
});

// These pin whole edited files; they do not exempt fields from validation.
import {createHash} from 'node:crypto';
import hashes from '../fixtures/arabic-reviewed-ui-hashes.cjs';
test('all reviewed translation files retain their exact new bytes',()=>{for(const entry of hashes)assert.equal(createHash('sha256').update(read(entry.file).replace(/\r\n/g,'\n')).digest('hex'),entry.after,entry.file);});

import courseCopy from '../fixtures/arabic-reviewed-course-copy.cjs';
test('reviewed Arabic course copy keeps Italian tokens intact',()=>{assert.equal(courseCopy.length,7);for(const change of courseCopy){const italian=t=>t.match(/[A-Za-zÀ-ÖØ-öø-ÿ]+/g)||[];assert.deepEqual(italian(change.after),italian(change.before),change.path);assert.match(change.before,/أو[A-Za-z]/);assert(!/أو[A-Za-z]/.test(change.after));}});

test('Arabic forward and return labels use consistent RTL arrows',()=>{let ar;vm.runInNewContext(read('data/i18n/ui-ar.js'),{LINGUAI:{addUI:(_l,m)=>ar=m}});for(const key of ['welcome.zeroGo','path.start','lesson.next','lesson.exNext','guide.more','fa.next','today.continue'])assert.match(ar[key],/←/);for(const key of ['lesson.back','lesson.exPrev','write.back','read.back','talk.backToList','gram.backToIndex','chat.backToList','fa.backToList'])assert.match(ar[key],/→/);});
