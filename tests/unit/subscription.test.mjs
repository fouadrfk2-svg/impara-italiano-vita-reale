import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {join} from 'node:path';
import {ROOT} from './_harness.mjs';
test('public marketing never reads or relays learner drafts or credentials',()=>{
 const source=readFileSync(join(ROOT,'assets/js/guest.js'),'utf8').split('global.Views.home=function')[1].split('global.Views.privacy=function')[0];
 assert(!/<form|<input|<textarea/.test(source));assert(!/fetch\(|localStorage|sessionStorage|state\.(?:writing|lessons)|data\/core\/|audio\//.test(source));assert.match(source,/https:\/\/wa\.me\/393517015376/);assert.match(source,/encodeURIComponent/);assert.match(source,/noopener noreferrer/);assert.match(source,/referrerpolicy="no-referrer"/);
});
test('public identity and licensing are honest and the social destination is this demo',()=>{
 const html=readFileSync(join(ROOT,'index.html'),'utf8'),pkg=JSON.parse(readFileSync(join(ROOT,'package.json'),'utf8'));assert.equal(pkg.homepage,'https://vita-reale-arabic-demo.vercel.app/');assert.match(html,/og:site_name" content="Vita Reale/);assert.match(html,/og:locale" content="ar_AR/);for(const f of ['LICENSE','LICENSE-CONTENT'])assert(readFileSync(join(ROOT,f),'utf8').length>100);assert.match(readFileSync(join(ROOT,'assets/js/guest.js'),'utf8'),/CC BY-SA 4.0/);
});
