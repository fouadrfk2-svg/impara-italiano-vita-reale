import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {join} from 'node:path';
import {ROOT} from './_harness.mjs';
import {publicFileList} from '../../scripts/public-files.mjs';
const read=f=>readFileSync(join(ROOT,f),'utf8');
const hashes=JSON.parse(read('tests/fixtures/red-vr-brand-assets.json'));
test('all twelve approved RED VR assets retain supplied bytes and are public without widening the private boundary',()=>{
 const files=publicFileList(ROOT);assert.equal(Object.keys(hashes).length,12);
 for(const [f,hash] of Object.entries(hashes)){assert.equal(createHash('sha256').update(readFileSync(join(ROOT,f))).digest('hex'),hash,f);assert(files.includes(f),f);}
 assert(!files.some(f=>/^(audio\/|data\/(?!i18n\/ui-))/.test(f)));
 for(const f of Object.keys(hashes).filter(f=>f.endsWith('.svg'))){const svg=read(f);assert.match(svg,/<svg/);assert(!/<(?:script|foreignObject|text)\b|onload=|href="https?:/i.test(svg),f);assert.match(svg,/#D8313D/i,f);}
});
test('browser, Apple and PWA point to correctly sized standard and maskable supplied artwork',()=>{
 const html=read('index.html');assert.match(html,/<link rel="icon" type="image\/svg\+xml" href="assets\/icons\/favicon.svg">/);assert.match(html,/rel="alternate icon"[^>]+favicon.ico/);assert(!html.includes('data:image/svg+xml'));
 const ico=readFileSync(join(ROOT,'assets/icons/favicon.ico'));assert.equal(ico.readUInt32LE(0),65536);assert(ico.readUInt16LE(4)>0);
 assert.match(html,/rel="apple-touch-icon" sizes="180x180" href="assets\/icons\/icon-180.png"/);
 const m=JSON.parse(read('manifest.webmanifest'));assert.equal(m.lang,'ar');assert.equal(m.dir,'rtl');assert.equal(m.scope,'./');assert.equal(m.start_url,'./index.html');assert.equal(m.theme_color,'#064B3A');assert.equal(m.background_color,'#F8F6EF');
 assert.deepEqual(m.icons.map(i=>[i.sizes,i.purpose]),[['192x192','any'],['512x512','any'],['192x192','maskable'],['512x512','maskable']]);
 for(const i of [...m.icons,{src:'assets/icons/icon-180.png',sizes:'180x180'}]){const png=readFileSync(join(ROOT,i.src));assert.equal(png.subarray(1,4).toString(),'PNG');assert.equal(png.readUInt32BE(16)+'x'+png.readUInt32BE(20),i.sizes);}
});
test('logos preserve guarded destinations, accessible names, attribution, Noto typography and cache coverage',()=>{
 const html=read('index.html'),guest=read('assets/js/guest.js'),sw=read('sw.js');
 assert.match(html,/<a class="rail__brand" href="#\/oggi"[^>]+data-i18n-label="app.brandHome"[^>]*><img[^>]+header_learning_dark.svg/);
 assert.match(guest,/href="#\/home" class="guest-brand"[^>]+aria-label="Vita Reale"/);assert(!guest.includes('guest-mark'));assert(!html.includes('rail__flag'));
 assert.match(guest,/Andrea Bonacci/);assert.match(guest,/CC BY-SA 4.0/);assert.match(html,/© <a href="https:\/\/github.com\/AndreaBonn"/);
 assert.match(read('assets/css/rtl.css'),/font-family:"Noto Sans Arabic"/);assert.match(read('assets/js/app.js'),/document.querySelector\(".rail__brand"\).addEventListener\("click"/);
 for(const f of [...Object.keys(hashes),'assets/css/branding.css'])assert(sw.includes('./'+f),f);
 assert.match(html,/og:image[^>]+https:\/\/www.vitare.it\/assets\/marketing\/social.png/);
 const png=readFileSync(join(ROOT,'assets/marketing/social.png'));assert.equal(png.readUInt32BE(16),1200);assert.equal(png.readUInt32BE(20),630);
});
