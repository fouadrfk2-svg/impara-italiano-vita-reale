import process from "node:process";
// Test-only content transport. No environment/Neon/customer data is loaded.
import {createRequire} from 'node:module';
import {serwer} from '../../scripts/serve.mjs';
const require=createRequire(import.meta.url),{mac}=require('../../server/account-api.cjs');
process.env.PILOT_AUTH_SECRET='A'.repeat(43);
const expected=mac('learner_session','A'.repeat(43));
serwer({podmiany:{"/api/billing/config":()=>JSON.stringify({enabled:false,amountCents:999,currency:"eur",interval:"month",intervalCount:1})},accountRun:async(action,p)=>{if(action!=='session'||p.token!==expected){const e=Error('Synthetic access denied');e.code='42501';throw e;}return {authenticated:true};}}).listen(Number(process.argv[2]||8123),'localhost');
