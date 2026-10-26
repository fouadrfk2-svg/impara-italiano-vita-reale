"use strict";
// Non-secret, reviewed bindings to one isolated Neon branch and one Vercel project.
const PILOT=Object.freeze({projectId:'crimson-cake-79153987',branchId:'br-old-shape-b9onuuiu',database:'vita_reale_test',role:'vita_pilot_app',owner:'vita_reale_test_owner',directHost:'ep-nameless-field-b9iui2w8.c-7.eu-central-1.aws.neon.tech',pooledHost:'ep-nameless-field-b9iui2w8-pooler.c-7.eu-central-1.aws.neon.tech',vercelProjectId:'prj_6iDrQCYqlDY9Hx0buZEMirMoJJYF',vercelProjectName:'vita-reale-arabic-demo',vercelTeamId:'team_1iIo3BfW8Vk8BduLPPTbgnpv'});
// Fixed read-only system-catalog query. No application/legacy records, input SQL or secrets.
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
 AND NOT EXISTS(SELECT 1 FROM pg_catalog.pg_class c JOIN pg_catalog.pg_namespace n ON n.oid=c.relnamespace
   WHERE n.nspname NOT IN('pg_catalog','information_schema') AND n.nspname NOT LIKE 'pg_toast%' AND n.nspname NOT LIKE 'pg_temp%'
   AND c.relkind IN('r','p','v','m','f') AND (has_table_privilege(i.oid,c.oid,'SELECT,INSERT,UPDATE,DELETE,TRUNCATE,REFERENCES,TRIGGER') OR has_any_column_privilege(i.oid,c.oid,'SELECT,INSERT,UPDATE,REFERENCES')))
 AND NOT EXISTS(SELECT 1 FROM pg_catalog.pg_class c JOIN pg_catalog.pg_namespace n ON n.oid=c.relnamespace
   WHERE n.nspname NOT IN('pg_catalog','information_schema') AND CASE WHEN c.relkind='S' THEN has_sequence_privilege(i.oid,c.oid,'USAGE,SELECT,UPDATE') ELSE false END)
 AND (SELECT count(*)=4 FROM approved a JOIN pg_catalog.pg_proc p ON p.oid=a.oid JOIN pg_catalog.pg_roles owner_role ON owner_role.oid=p.proowner
   WHERE has_function_privilege(i.oid,p.oid,'EXECUTE') AND NOT has_function_privilege(i.oid,p.oid,'EXECUTE WITH GRANT OPTION')
   AND p.prosecdef AND owner_role.rolname='vita_reale_test_owner' AND p.proconfig=ARRAY['search_path=pg_catalog, vita_pilot']::text[])
 AND NOT EXISTS(SELECT 1 FROM pg_catalog.pg_proc p JOIN pg_catalog.pg_namespace n ON n.oid=p.pronamespace
   WHERE n.nspname NOT IN('pg_catalog','information_schema') AND (n.nspname='vita_pilot' OR p.prosecdef)
   AND has_function_privilege(i.oid,p.oid,'EXECUTE') AND NOT EXISTS(SELECT 1 FROM approved a WHERE a.oid=p.oid))
 FROM identity i),false) AS identity_verified`;
function parsePilotUrl(value,role=PILOT.role){
 try{
  if(typeof value!=='string'||!value.trim())throw Error();
  const u=new URL(value.trim());
  if(!['postgres:','postgresql:'].includes(u.protocol)||![PILOT.directHost,PILOT.pooledHost].includes(u.hostname)||u.username!==role||!u.password||u.pathname!=='/'+PILOT.database||u.hash||(u.port&&u.port!=='5432'))throw Error();
  if(!['require','verify-ca','verify-full'].includes(u.searchParams.get('sslmode'))||u.searchParams.getAll('sslmode').length!==1)throw Error();
  for(const key of u.searchParams.keys())if(!['sslmode','channel_binding'].includes(key)||u.searchParams.getAll(key).length!==1)throw Error();
  if(u.searchParams.has('channel_binding')&&!['require','prefer'].includes(u.searchParams.get('channel_binding')))throw Error();
  return u;
 }catch{throw new Error('Database unavailable');}
}
module.exports={PILOT,RUNTIME_HEALTH_SQL,parsePilotUrl};
