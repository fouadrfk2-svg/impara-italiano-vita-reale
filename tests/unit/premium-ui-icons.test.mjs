import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {join} from 'node:path';
import {ROOT} from './_harness.mjs';
const read=f=>readFileSync(join(ROOT,f),'utf8');

test('the learner interface uses only same-origin Phosphor masks with preserved license',()=>{
 const html=read('index.html'),css=read('assets/css/icons.css'),js=read('assets/js/views.js');
 assert.match(html,/<link rel="stylesheet" href="assets\/css\/icons\.css">/);
 assert.match(read('sw.js'),/\.\/assets\/css\/icons\.css/);
 assert.match(read('assets/icons/phosphor/LICENSE'),/MIT License/);
 const icons=[...new Set([...css.matchAll(/phosphor\/regular\/([a-z-]+)\.svg/g)].map(m=>m[1]))];
 assert.equal(icons.length,31);
 const declared=[...js.matchAll(/"([a-z-]+)": 1/g)].map(m=>m[1]).sort();
 assert.deepEqual(declared,icons.slice().sort(),'icon allowlist must match the locally bundled, actually used icon set');
 const rendered=[...html.matchAll(/vr-icon--([a-z-]+)/g)].map(m=>m[1]);
 assert(rendered.length>0);
 for(const name of rendered)assert(icons.includes(name),'rendered icon lacks a sourced mask: '+name);
 assert(!html.includes('vr-icon--calculator'),'grammar navigation must not reference an unmapped icon');
 for(const name of icons){const svg=read('assets/icons/phosphor/regular/'+name+'.svg');assert.match(svg,/<svg\b/);assert(!/<(?:script|foreignObject|text)\b|\son\w+=|(?:href|src)="https?:/i.test(svg),name);}
 assert.match(js,/function icon\(name, className\)/);assert.match(js,/if \(!ICONS\[name\]\) return ""/);
 assert(!/fonts\.googleapis|unpkg\.com|jsdelivr\.net/.test(html+css));
});

test('existing navigation labels and audio controls keep their behavior and accessible names',()=>{
 const html=read('index.html'),account=read('assets/js/views-account.js'),css=read('assets/css/icons.css');
 assert.equal((html.match(/class="rail__item" data-route=/g)||[]).length,22);
 for(const route of ['oggi','percorso','ripasso','cinque','allenamento','conversazione','chiacchiere','shadowing','velocita','lettura','scrittura','suoni','esame','grammatica','coniugatore','lessico','falsi','copertura','progressi','guida','impostazioni'])assert.match(html,new RegExp('data-route="'+route+'"'));
 assert.match(account,/A\.logout\(\)/);assert.match(account,/admin\/logout/);assert.match(account,/sign-out/);
 assert.match(css,/\.say-btn::before[\s\S]*speaker-high\.svg/);assert.match(read('assets/js/views.js'),/a11y\.listen/);
});
