// Structural localization sentinels only. No translated teaching content is enabled.
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const selections={
 'curriculum-index.js':['level:A1'],
 'grammar-reference.js':['refsec:titles','ref:g-nome-genere'],
 'conversations.js':['conv:bar-mattina'],
 'readings.js':['read:r-a1-mattina'],
 'writing.js':['write:w-a2-giornata','write:w-a2-ieri'],
 'phonetics.js':['ph:ph-doppie'],
 'library-a1.js':['read:lib-a1-giornata']
};
function bag(root,lang,file){let out;vm.runInNewContext(fs.readFileSync(path.join(root,'data/i18n',lang,file),'utf8'),{LINGUAI:{addStrings(_l,m){out=JSON.parse(JSON.stringify(m));}}});return out;}
function make(root){const byFile={},reference={},manifest={};for(const[file,keys]of Object.entries(selections)){const en=bag(root,'en',file);Object.assign(reference,en);manifest[file]=keys.slice();byFile[file]={};for(const key of keys){function marker(v,p){if(typeof v==='string')return v?'اختبار توطين '+p:'';if(Array.isArray(v))return v.map((x,i)=>marker(x,p+' '+i));return Object.fromEntries(Object.entries(v).map(([k,x])=>[k,marker(x,p+' '+k)]));}byFile[file][key]=marker(en[key],key);}}
 byFile['grammar-reference.js']['ref:g-nome-genere'].body='<p>اختبار بنية التوطين <em>il libro</em> <em>اختبار</em></p><div class="table-wrap"><table class="gt"><tr><th>اختبار</th><th>il libro</th></tr><tr><td>اختبار</td><td>il libro</td></tr></table></div>';
 return{byFile,reference,manifest};}
module.exports={make,bag,selections};
