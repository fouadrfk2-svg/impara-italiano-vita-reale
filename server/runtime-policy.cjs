"use strict";
// Non-secret, reviewed bindings to one isolated Neon branch and one Vercel project.
const PILOT=Object.freeze({projectId:'crimson-cake-79153987',branchId:'br-old-shape-b9onuuiu',database:'vita_reale_test',role:'vita_pilot_app',owner:'vita_reale_test_owner',directHost:'ep-nameless-field-b9iui2w8.c-7.eu-central-1.aws.neon.tech',pooledHost:'ep-nameless-field-b9iui2w8-pooler.c-7.eu-central-1.aws.neon.tech',vercelProjectId:'prj_6iDrQCYqlDY9Hx0buZEMirMoJJYF',vercelProjectName:'vita-reale-arabic-demo',vercelTeamId:'team_1iIo3BfW8Vk8BduLPPTbgnpv'});
const STRIPE_PREVIEW=Object.freeze({projectId:'crimson-cake-79153987',branchId:'br-morning-truth-b9gfj39x',branchName:'stripe-billing-preview',gitBranch:'codex/stripe-subscriptions',database:'vita_reale_test',role:'vita_pilot_app',directHost:'ep-morning-field-b9qrkyb2.c-7.eu-central-1.aws.neon.tech',pooledHost:'ep-morning-field-b9qrkyb2-pooler.c-7.eu-central-1.aws.neon.tech',vercelProjectId:PILOT.vercelProjectId,vercelProjectName:PILOT.vercelProjectName,vercelTeamId:PILOT.vercelTeamId});
// Fixed system-catalog query; never reads application rows or secrets.
const RUNTIME_HEALTH_SQL=`WITH identity AS (
 SELECT r.oid,r.rolcanlogin,r.rolsuper,r.rolbypassrls,r.rolcreaterole,r.rolcreatedb,r.rolreplication,r.rolinherit
 FROM pg_catalog.pg_roles r WHERE r.rolname=current_user
), approved AS (
 SELECT unnest(ARRAY[
  to_regprocedure('vita_pilot.read_my_state(bytea,smallint)')::oid,
  to_regprocedure('vita_pilot.read_my_lesson_progress(bytea,smallint,text)')::oid,
  to_regprocedure('vita_pilot.save_my_state(bytea,smallint,jsonb,bigint)')::oid,
  to_regprocedure('vita_pilot.save_my_lesson_progress(bytea,smallint,text,jsonb,bigint)')::oid
 ]) AS oid
)
SELECT 1 AS ok, COALESCE((SELECT
 current_user='vita_pilot_app' AND session_user='vita_pilot_app' AND current_database()='vita_reale_test'
 AND i.rolcanlogin AND NOT(i.rolsuper OR i.rolbypassrls OR i.rolcreaterole OR i.rolcreatedb OR i.rolreplication OR i.rolinherit)
 AND NOT EXISTS(SELECT 1 FROM pg_catalog.pg_auth_members WHERE member=i.oid)
 AND NOT EXISTS(SELECT 1 FROM pg_catalog.pg_class WHERE relowner=i.oid)
 AND NOT EXISTS(SELECT 1 FROM pg_catalog.pg_namespace WHERE nspowner=i.oid)
 AND NOT EXISTS(SELECT 1 FROM pg_catalog.pg_proc WHERE proowner=i.oid)
 AND NOT EXISTS(SELECT 1 FROM pg_catalog.pg_database WHERE datdba=i.oid)
 AND NOT has_database_privilege(i.oid,current_database(),'CREATE')
 AND has_schema_privilege(i.oid,to_regnamespace('vita_pilot'),'USAGE')
 AND NOT EXISTS(SELECT 1 FROM pg_catalog.pg_namespace n WHERE n.nspname NOT IN('pg_catalog','information_schema') AND n.nspname NOT LIKE 'pg_toast%' AND n.nspname NOT LIKE 'pg_temp%' AND has_schema_privilege(i.oid,n.oid,'CREATE'))
 AND (SELECT count(*)=7 AND bool_and(c.relrowsecurity) FROM pg_catalog.pg_class c JOIN pg_catalog.pg_namespace n ON n.oid=c.relnamespace WHERE n.nspname='vita_pilot' AND c.relkind='r' AND c.relname IN('learners','admin_principals','activation_codes','sessions','entitlements','learner_progress','admin_audit_log'))
 AND (to_regclass('vita_pilot.admin_credentials') IS NULL OR (SELECT count(*)=4 AND bool_and(c.relrowsecurity) FROM pg_catalog.pg_class c JOIN pg_catalog.pg_namespace n ON n.oid=c.relnamespace WHERE n.nspname='vita_pilot' AND c.relkind='r' AND c.relname IN('admin_credentials','admin_sessions','auth_budgets','lesson_catalog')))
 AND (to_regclass('vita_pilot.billing_email_links') IS NULL OR (SELECT count(*)=9 AND bool_and(c.relrowsecurity) FROM pg_catalog.pg_class c JOIN pg_catalog.pg_namespace n ON n.oid=c.relnamespace WHERE n.nspname='vita_pilot' AND c.relkind='r' AND c.relname IN('billing_email_links','billing_email_challenges','billing_sessions','billing_rate_limits','stripe_customers','stripe_checkout_intents','stripe_webhook_events','stripe_subscriptions','stripe_event_risk_holds')))
 AND NOT EXISTS(SELECT 1 FROM pg_catalog.pg_class c JOIN pg_catalog.pg_namespace n ON n.oid=c.relnamespace WHERE n.nspname NOT IN('pg_catalog','information_schema') AND n.nspname NOT LIKE 'pg_toast%' AND n.nspname NOT LIKE 'pg_temp%' AND c.relkind IN('r','p','v','m','f') AND (has_table_privilege(i.oid,c.oid,'SELECT,INSERT,UPDATE,DELETE,TRUNCATE,REFERENCES,TRIGGER') OR has_any_column_privilege(i.oid,c.oid,'SELECT,INSERT,UPDATE,REFERENCES')))
 AND NOT EXISTS(SELECT 1 FROM pg_catalog.pg_class c JOIN pg_catalog.pg_namespace n ON n.oid=c.relnamespace CROSS JOIN LATERAL pg_catalog.aclexplode(COALESCE(c.relacl,pg_catalog.acldefault('S',c.relowner))) acl WHERE n.nspname NOT IN('pg_catalog','information_schema') AND n.nspname NOT LIKE 'pg_toast%' AND n.nspname NOT LIKE 'pg_temp%' AND c.relkind='S' AND acl.grantee IN(i.oid,0) AND acl.privilege_type IN('USAGE','SELECT','UPDATE'))
 AND (SELECT count(*)=4 FROM approved a JOIN pg_catalog.pg_proc p ON p.oid=a.oid JOIN pg_catalog.pg_roles owner_role ON owner_role.oid=p.proowner WHERE has_function_privilege(i.oid,p.oid,'EXECUTE') AND NOT has_function_privilege(i.oid,p.oid,'EXECUTE WITH GRANT OPTION') AND p.prosecdef AND owner_role.rolname='vita_reale_test_owner' AND p.proconfig=ARRAY['search_path=pg_catalog, vita_pilot']::text[])
 AND NOT EXISTS(SELECT 1 FROM pg_catalog.pg_proc optional JOIN pg_catalog.pg_roles owner_role ON owner_role.oid=optional.proowner WHERE optional.oid=to_regprocedure('vita_pilot.account_request(text,jsonb)') AND has_function_privilege(i.oid,optional.oid,'EXECUTE') AND (has_function_privilege(i.oid,optional.oid,'EXECUTE WITH GRANT OPTION') OR NOT optional.prosecdef OR owner_role.rolname<>'vita_reale_test_owner' OR optional.proconfig IS DISTINCT FROM ARRAY['search_path=pg_catalog, vita_pilot']::text[]))
 AND NOT EXISTS(SELECT 1 FROM pg_catalog.pg_proc optional JOIN pg_catalog.pg_roles owner_role ON owner_role.oid=optional.proowner WHERE optional.oid=to_regprocedure('vita_pilot.billing_request(text,jsonb)') AND has_function_privilege(i.oid,optional.oid,'EXECUTE') AND (has_function_privilege(i.oid,optional.oid,'EXECUTE WITH GRANT OPTION') OR NOT optional.prosecdef OR owner_role.rolname<>'vita_reale_test_owner' OR optional.proconfig IS DISTINCT FROM ARRAY['search_path=pg_catalog, vita_pilot']::text[]))
 AND NOT EXISTS(SELECT 1 FROM pg_catalog.pg_proc p JOIN pg_catalog.pg_namespace n ON n.oid=p.pronamespace WHERE n.nspname NOT IN('pg_catalog','information_schema') AND (n.nspname='vita_pilot' OR p.prosecdef) AND has_function_privilege(i.oid,p.oid,'EXECUTE') AND NOT EXISTS(SELECT 1 FROM approved a WHERE a.oid=p.oid) AND p.oid NOT IN(COALESCE(to_regprocedure('vita_pilot.account_request(text,jsonb)')::oid,0::oid),COALESCE(to_regprocedure('vita_pilot.billing_request(text,jsonb)')::oid,0::oid)))
 FROM identity i),false) AS identity_verified`;
function bindingForEnvironment(env,role){
 const vercel=env?.VERCEL==='1'||env?.VERCEL_ENV!==undefined;
 if(!vercel){if(role===PILOT.owner||env?.NODE_ENV==='development'||env?.NODE_ENV==='test')return PILOT;throw new Error('Database unavailable');}
 if(env.VERCEL_ENV==='production'){
  if(env.VERCEL_PROJECT_ID!==PILOT.vercelProjectId)throw new Error('Database unavailable');
  return PILOT;
 }
 if(env.VERCEL_ENV==='preview'){
  if(env.VERCEL_PROJECT_ID!==STRIPE_PREVIEW.vercelProjectId||env.VERCEL_GIT_COMMIT_REF!==STRIPE_PREVIEW.gitBranch)throw new Error('Database unavailable');
  return STRIPE_PREVIEW;
 }
 if(env.VERCEL_ENV==='development'){
  if(env.VERCEL_PROJECT_ID&&env.VERCEL_PROJECT_ID!==PILOT.vercelProjectId)throw new Error('Database unavailable');
  return PILOT;
 }
 throw new Error('Database unavailable');
}
function parsePilotUrl(value,role=PILOT.role,env=process.env){
 try{const binding=bindingForEnvironment(env,role);if(typeof value!=='string'||!value.trim())throw Error();const u=new URL(value.trim());const allowedRole=role===binding.role||(binding===PILOT&&role===PILOT.owner);if(!['postgres:','postgresql:'].includes(u.protocol)||![binding.directHost,binding.pooledHost].includes(u.hostname)||u.username!==role||!allowedRole||!u.password||u.pathname!=='/'+binding.database||u.hash||(u.port&&u.port!=='5432'))throw Error();if(!['require','verify-ca','verify-full'].includes(u.searchParams.get('sslmode'))||u.searchParams.getAll('sslmode').length!==1)throw Error();for(const key of u.searchParams.keys())if(!['sslmode','channel_binding'].includes(key)||u.searchParams.getAll(key).length!==1)throw Error();if(u.searchParams.has('channel_binding')&&!['require','prefer'].includes(u.searchParams.get('channel_binding')))throw Error();return u;}catch{throw new Error('Database unavailable');}
}
module.exports={PILOT,STRIPE_PREVIEW,RUNTIME_HEALTH_SQL,parsePilotUrl};
