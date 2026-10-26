-- Account APIs for the verified isolated pilot only. No legacy data or secrets.
DO $migration$
DECLARE expected_checksum constant text := '9d759afbe3adaf3ae1a4eee1d98a9c83a355b06021b1169de09c1fc74d8cd464';
BEGIN
 IF current_setting('vita_pilot.migration_target',true) IS DISTINCT FROM 'vita-reale-arabic-pilot' THEN RAISE EXCEPTION 'Verified isolated migration target required' USING ERRCODE='42501'; END IF;
 PERFORM pg_advisory_xact_lock(741956,1);
 IF NOT EXISTS(SELECT 1 FROM vita_pilot.schema_migrations WHERE version='0003' AND checksum='1979b9d3c8ba61864d85600e1d60027939f432fd57c9812b08a914a0012bc17d') THEN RAISE EXCEPTION 'Verified 0003 required'; END IF;
 IF EXISTS(SELECT 1 FROM vita_pilot.schema_migrations WHERE version='0004') THEN
  IF NOT EXISTS(SELECT 1 FROM vita_pilot.schema_migrations WHERE version='0004' AND checksum=expected_checksum) THEN RAISE EXCEPTION 'Migration checksum mismatch'; END IF;
  RETURN;
 END IF;
 IF NOT EXISTS(SELECT 1 FROM pg_catalog.pg_roles WHERE rolname='vita_pilot_app' AND rolcanlogin AND NOT(rolsuper OR rolbypassrls OR rolcreaterole OR rolcreatedb OR rolreplication OR rolinherit))
 OR EXISTS(SELECT 1 FROM pg_catalog.pg_auth_members WHERE member=(SELECT oid FROM pg_catalog.pg_roles WHERE rolname='vita_pilot_app')) THEN RAISE EXCEPTION 'Restricted runtime required' USING ERRCODE='42501'; END IF;

CREATE TABLE vita_pilot.admin_credentials (
 admin_id uuid PRIMARY KEY REFERENCES vita_pilot.admin_principals(id),
 credential_hash bytea NOT NULL UNIQUE CHECK(octet_length(credential_hash)=32),
 created_at timestamptz NOT NULL DEFAULT clock_timestamp(),
 expires_at timestamptz NOT NULL CHECK(expires_at>created_at), revoked_at timestamptz,
 enabled boolean NOT NULL DEFAULT false
);
CREATE TABLE vita_pilot.admin_sessions (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), admin_id uuid NOT NULL REFERENCES vita_pilot.admin_principals(id),
 token_hash bytea NOT NULL UNIQUE CHECK(octet_length(token_hash)=32),
 created_at timestamptz NOT NULL DEFAULT clock_timestamp(),
 expires_at timestamptz NOT NULL DEFAULT clock_timestamp()+interval '4 hours', revoked_at timestamptz,
 CHECK(expires_at>created_at AND expires_at<=created_at+interval '4 hours 1 second')
);
CREATE INDEX admin_sessions_active ON vita_pilot.admin_sessions(admin_id,expires_at) WHERE revoked_at IS NULL;
CREATE TABLE vita_pilot.auth_budgets (
 kind text NOT NULL CHECK(kind IN('redeem_ip','redeem_code','admin_ip','global','session','admin_session')),
 bucket bytea NOT NULL CHECK(octet_length(bucket)=32), window_start timestamptz NOT NULL,
 hits integer NOT NULL CHECK(hits>0), PRIMARY KEY(kind,bucket)
);
CREATE TABLE vita_pilot.lesson_catalog (lesson_id text PRIMARY KEY,exercise_count integer NOT NULL CHECK(exercise_count>0));
-- The inventory is generated from unchanged original core IDs/counts only.
INSERT INTO vita_pilot.lesson_catalog(lesson_id,exercise_count) VALUES
('a1-u01-l1',9),
('a1-u01-l2',9),
('a1-u01-l3',9),
('a1-u01-l4',9),
('a1-u01-test',10),
('a1-u02-l1',9),
('a1-u02-l2',10),
('a1-u02-l3',10),
('a1-u02-l4',10),
('a1-u02-test',10),
('a1-u03-l1',10),
('a1-u03-l2',10),
('a1-u03-l3',10),
('a1-u03-l4',10),
('a1-u03-test',10),
('a1-u04-l1',10),
('a1-u04-l2',10),
('a1-u04-l3',10),
('a1-u04-l4',10),
('a1-u04-test',10),
('a1-u05-l1',10),
('a1-u05-l2',10),
('a1-u05-l3',10),
('a1-u05-l4',10),
('a1-u05-test',10),
('a1-u06-l1',10),
('a1-u06-l2',10),
('a1-u06-l3',10),
('a1-u06-l4',10),
('a1-u06-test',10),
('a1-u07-l1',9),
('a1-u07-l2',10),
('a1-u07-l3',10),
('a1-u07-l4',10),
('a1-u07-test',10),
('a1-u08-l1',10),
('a1-u08-l2',10),
('a1-u08-l3',10),
('a1-u08-l4',10),
('a1-u08-test',10),
('a1-u09-l1',10),
('a1-u09-l2',10),
('a1-u09-l3',10),
('a1-u09-l4',10),
('a1-u09-test',10),
('a1-u10-l1',10),
('a1-u10-l2',10),
('a1-u10-l3',10),
('a1-u10-l4',12),
('a1-u10-test',12),
('a2-u01-l1',10),
('a2-u01-l2',10),
('a2-u01-l3',10),
('a2-u01-l4',10),
('a2-u01-test',10),
('a2-u02-l1',10),
('a2-u02-l2',10),
('a2-u02-l3',10),
('a2-u02-l4',10),
('a2-u02-test',10),
('a2-u03-l1',10),
('a2-u03-l2',10),
('a2-u03-l3',10),
('a2-u03-l4',10),
('a2-u03-test',10),
('a2-u04-l1',10),
('a2-u04-l2',10),
('a2-u04-l3',10),
('a2-u04-l4',10),
('a2-u04-test',10),
('a2-u05-l1',10),
('a2-u05-l2',10),
('a2-u05-l3',10),
('a2-u05-l4',10),
('a2-u05-test',10),
('a2-u06-l1',10),
('a2-u06-l2',10),
('a2-u06-l3',10),
('a2-u06-l4',10),
('a2-u06-test',10),
('a2-u07-l1',10),
('a2-u07-l2',10),
('a2-u07-l3',10),
('a2-u07-l4',10),
('a2-u07-test',10),
('a2-u08-l1',10),
('a2-u08-l2',11),
('a2-u08-l3',10),
('a2-u08-l4',12),
('a2-u08-test',12),
('b1-u01-l1',11),
('b1-u01-l2',10),
('b1-u01-l3',10),
('b1-u01-l4',10),
('b1-u01-test',10),
('b1-u02-l1',10),
('b1-u02-l2',10),
('b1-u02-l3',10),
('b1-u02-l4',10),
('b1-u02-test',10),
('b1-u03-l1',10),
('b1-u03-l2',10),
('b1-u03-l3',10),
('b1-u03-l4',10),
('b1-u03-test',10),
('b1-u04-l1',10),
('b1-u04-l2',10),
('b1-u04-l3',10),
('b1-u04-l4',10),
('b1-u04-test',12),
('b2-u01-l1',11),
('b2-u01-l2',10),
('b2-u01-l3',10),
('b2-u01-test',10),
('b2-u02-l1',10),
('b2-u02-l2',10),
('b2-u02-l3',10),
('b2-u02-test',10),
('b2-u03-l1',10),
('b2-u03-l2',11),
('b2-u03-l3',10),
('b2-u03-test',10),
('b2-u04-l1',10),
('b2-u04-l2',10),
('b2-u04-l3',10),
('b2-u04-test',12),
('b2-u05-l1',11),
('b2-u05-l2',11),
('b2-u05-l3',11),
('b2-u05-test',10),
('b2-u06-l1',11),
('b2-u06-l2',11),
('b2-u06-l3',11),
('b2-u06-test',12),
('c1-u01-l1',10),
('c1-u01-l2',10),
('c1-u01-l3',10),
('c1-u01-test',10),
('c1-u02-l1',10),
('c1-u02-l2',10),
('c1-u02-l3',10),
('c1-u02-test',10),
('c1-u03-l1',10),
('c1-u03-l2',10),
('c1-u03-l3',10),
('c1-u03-test',12),
('c1-u04-l1',11),
('c1-u04-l2',11),
('c1-u04-l3',11),
('c1-u04-test',10),
('c1-u05-l1',11),
('c1-u05-l2',11),
('c1-u05-l3',11),
('c1-u05-test',12),
('c2-u01-l1',10),
('c2-u01-l2',10),
('c2-u01-l3',10),
('c2-u01-test',10),
('c2-u02-l1',10),
('c2-u02-l2',10),
('c2-u02-l3',10),
('c2-u02-test',10),
('c2-u03-l1',10),
('c2-u03-l2',10),
('c2-u03-l3',10),
('c2-u03-test',12),
('c2-u04-l1',11),
('c2-u04-l2',11),
('c2-u04-l3',11),
('c2-u04-test',12),
('conv-bar-mattina',1000),
('conv-presentarsi',1000),
('conv-mercato',1000),
('conv-ristorante',1000),
('conv-treno',1000),
('conv-medico',1000),
('conv-affitto',1000),
('conv-colloquio',1000),
('conv-burocrazia',1000),
('conv-dibattito',1000),
('conv-ristorante-scelte',1000),
('conv-treno-perso',1000),
('conv-casa-visita',1000),
('conv-medico-gola',1000);
ALTER TABLE vita_pilot.activation_codes ADD COLUMN assigned_to uuid REFERENCES vita_pilot.learners(id);
ALTER TABLE vita_pilot.activation_codes ADD COLUMN entitlement_expires_at timestamptz NOT NULL DEFAULT clock_timestamp()+interval '90 days';
ALTER TABLE vita_pilot.sessions ADD COLUMN activation_code_id uuid REFERENCES vita_pilot.activation_codes(id);
ALTER TABLE vita_pilot.admin_credentials ENABLE ROW LEVEL SECURITY;
ALTER TABLE vita_pilot.admin_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE vita_pilot.auth_budgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE vita_pilot.lesson_catalog ENABLE ROW LEVEL SECURITY;
CREATE UNIQUE INDEX audit_request_unique ON vita_pilot.admin_audit_log(actor_admin_id,action,(metadata->>'request_id')) WHERE metadata ? 'request_id';

CREATE FUNCTION vita_pilot.consume_budget(p_kind text,p_bucket bytea) RETURNS boolean LANGUAGE plpgsql
SET search_path=pg_catalog,vita_pilot AS $fn$
DECLARE n integer; seconds integer; maximum integer;
BEGIN
 IF p_bucket IS NULL OR octet_length(p_bucket)<>32 THEN RAISE EXCEPTION 'Access denied' USING ERRCODE='42501'; END IF;
 SELECT v.s,v.m INTO seconds,maximum FROM (VALUES('redeem_ip',900,20),('redeem_code',900,12),('admin_ip',900,10),('global',60,500),('session',60,120),('admin_session',60,60)) v(k,s,m) WHERE v.k=p_kind;
 IF maximum IS NULL THEN RAISE EXCEPTION 'Access denied' USING ERRCODE='42501'; END IF;
 INSERT INTO vita_pilot.auth_budgets(kind,bucket,window_start,hits) VALUES(p_kind,p_bucket,clock_timestamp(),1)
 ON CONFLICT(kind,bucket) DO UPDATE SET
 hits=CASE WHEN auth_budgets.window_start+make_interval(secs=>seconds)<=clock_timestamp() THEN 1 ELSE least(auth_budgets.hits+1,maximum+1) END,
 window_start=CASE WHEN auth_budgets.window_start+make_interval(secs=>seconds)<=clock_timestamp() THEN clock_timestamp() ELSE auth_budgets.window_start END RETURNING hits INTO n;
 RETURN n<=maximum;
END $fn$;

CREATE FUNCTION vita_pilot.account_request(p_action text,p jsonb) RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER
SET search_path=pg_catalog,vita_pilot AS $fn$
DECLARE actor uuid; learner uuid; c vita_pilot.activation_codes%ROWTYPE; token bytea; code bytea;
 expires timestamptz; code_expires timestamptz; target uuid; request uuid; prior jsonb; incoming jsonb; rev bigint;
 old_entry record; next_entry jsonb; changed integer; result jsonb;
BEGIN
 IF p IS NULL OR jsonb_typeof(p)<>'object' OR octet_length(p::text)>2200000 THEN RAISE EXCEPTION 'Invalid request' USING ERRCODE='22023'; END IF;
 IF p_action IN('redeem','admin_login') THEN
  IF NOT vita_pilot.consume_budget('global',decode(p->>'global','hex')) THEN RETURN '{"rateLimited":true}'::jsonb; END IF;
  IF NOT vita_pilot.consume_budget(CASE WHEN p_action='redeem' THEN 'redeem_ip' ELSE 'admin_ip' END,decode(p->>'bucket','hex')) THEN RETURN '{"rateLimited":true}'::jsonb; END IF;
  token:=decode(p->>'newToken','hex');
  IF token IS NULL OR octet_length(token)<>32 THEN RAISE EXCEPTION 'Invalid request' USING ERRCODE='22023'; END IF;
  code:=decode(p->>'credential','hex');
  IF code IS NULL OR octet_length(code)<>32 THEN RETURN '{"authenticated":false}'::jsonb; END IF;
  IF p_action='admin_login' THEN
   SELECT a.id INTO actor FROM vita_pilot.admin_principals a JOIN vita_pilot.admin_credentials k ON k.admin_id=a.id
   WHERE a.app_id='vita-reale-arabic' AND a.environment='pilot' AND a.revoked_at IS NULL
   AND k.credential_hash=code AND k.enabled AND k.revoked_at IS NULL AND k.expires_at>clock_timestamp() FOR SHARE OF a,k;
   IF actor IS NULL THEN RETURN '{"authenticated":false}'::jsonb; END IF;
   INSERT INTO vita_pilot.admin_sessions(admin_id,token_hash) VALUES(actor,token) RETURNING expires_at INTO expires;
   INSERT INTO vita_pilot.admin_audit_log(actor_admin_id,action,target_kind,target_id) VALUES(actor,'admin.login','admin_principal',actor);
   RETURN jsonb_build_object('authenticated',true,'expiresAt',expires);
  END IF;
  IF NOT vita_pilot.consume_budget('redeem_code',code) THEN RETURN '{"rateLimited":true}'::jsonb; END IF;
  SELECT * INTO c FROM vita_pilot.activation_codes WHERE app_id='vita-reale-arabic' AND environment='pilot' AND code_hash=code AND hash_key_version=1 FOR UPDATE;
  IF c.id IS NULL OR c.revoked_at IS NOT NULL OR c.expires_at<=clock_timestamp() OR c.entitlement_expires_at<=clock_timestamp() THEN RETURN '{"authenticated":false}'::jsonb; END IF;
  learner:=c.redeemed_by;
  IF learner IS NULL THEN
   learner:=c.assigned_to;
   IF learner IS NULL THEN INSERT INTO vita_pilot.learners DEFAULT VALUES RETURNING id INTO learner; END IF;
   PERFORM 1 FROM vita_pilot.learners WHERE id=learner AND app_id='vita-reale-arabic' AND environment='pilot' AND disabled_at IS NULL FOR SHARE;
   IF NOT FOUND THEN RETURN '{"authenticated":false}'::jsonb; END IF;
   UPDATE vita_pilot.activation_codes SET redeemed_by=learner,redeemed_at=clock_timestamp() WHERE id=c.id;
   INSERT INTO vita_pilot.entitlements(learner_id,entitlement_key,grant_reference,created_by_admin_id,activation_code_id,expires_at)
   VALUES(learner,'course_access',gen_random_uuid(),c.created_by_admin_id,c.id,c.entitlement_expires_at);
  END IF;
  PERFORM 1 FROM vita_pilot.learners WHERE id=learner AND disabled_at IS NULL FOR SHARE;
  IF NOT FOUND THEN RETURN '{"authenticated":false}'::jsonb; END IF;
  PERFORM 1 FROM vita_pilot.entitlements WHERE learner_id=learner AND app_id='vita-reale-arabic' AND environment='pilot' AND entitlement_key='course_access' AND revoked_at IS NULL AND starts_at<=clock_timestamp() AND (expires_at IS NULL OR expires_at>clock_timestamp()) LIMIT 1 FOR SHARE;
  IF NOT FOUND THEN RETURN '{"authenticated":false}'::jsonb; END IF;
  INSERT INTO vita_pilot.sessions(learner_id,token_hash,hash_key_version,expires_at,activation_code_id) VALUES(learner,token,1,clock_timestamp()+interval '30 days',c.id) RETURNING expires_at INTO expires;
  RETURN jsonb_build_object('authenticated',true,'learnerId',learner,'expiresAt',expires);
 END IF;
 token:=decode(p->>'token','hex');
 IF token IS NULL OR octet_length(token)<>32 THEN RAISE EXCEPTION 'Access denied' USING ERRCODE='42501'; END IF;
 IF p_action LIKE 'admin_%' THEN
  SELECT a.id INTO actor FROM vita_pilot.admin_sessions s JOIN vita_pilot.admin_principals a ON a.id=s.admin_id
  JOIN vita_pilot.admin_credentials k ON k.admin_id=a.id
  WHERE s.token_hash=token AND s.revoked_at IS NULL AND s.expires_at>clock_timestamp() AND a.revoked_at IS NULL
  AND a.app_id='vita-reale-arabic' AND a.environment='pilot' AND k.enabled AND k.revoked_at IS NULL AND k.expires_at>clock_timestamp() FOR SHARE OF s,a,k;
  IF actor IS NULL THEN RAISE EXCEPTION 'Access denied' USING ERRCODE='42501'; END IF;
  IF NOT vita_pilot.consume_budget('admin_session',token) THEN RETURN '{"rateLimited":true}'::jsonb; END IF;
  IF p_action='admin_session' THEN RETURN '{"authenticated":true}'::jsonb; END IF;
  IF p_action='admin_logout' THEN
   UPDATE vita_pilot.admin_sessions SET revoked_at=clock_timestamp() WHERE token_hash=token;
   INSERT INTO vita_pilot.admin_audit_log(actor_admin_id,action,target_kind,target_id) VALUES(actor,'admin.logout','admin_principal',actor);
   RETURN '{"ok":true}'::jsonb;
  END IF;
  IF p_action='admin_list' THEN
   SELECT jsonb_build_object('learners',COALESCE((SELECT jsonb_agg(x) FROM (SELECT l.id,l.created_at,l.disabled_at,
    EXISTS(SELECT 1 FROM vita_pilot.entitlements e WHERE e.learner_id=l.id AND e.entitlement_key='course_access' AND e.revoked_at IS NULL AND e.starts_at<=clock_timestamp() AND (e.expires_at IS NULL OR e.expires_at>clock_timestamp())) AS access,
    (SELECT count(*) FROM jsonb_each(COALESCE(l.state_snapshot->'lessons','{}')) item WHERE item.value->'done'='true'::jsonb) AS completed
    FROM vita_pilot.learners l WHERE l.app_id='vita-reale-arabic' AND l.environment='pilot' ORDER BY l.created_at DESC,l.id LIMIT 50 OFFSET least(greatest(COALESCE((p->>'offset')::integer,0),0),10000)) x),'[]'::jsonb),
    'codes',COALESCE((SELECT jsonb_agg(x) FROM (SELECT id,created_at,expires_at,entitlement_expires_at,revoked_at,redeemed_by,assigned_to FROM vita_pilot.activation_codes WHERE app_id='vita-reale-arabic' AND environment='pilot' ORDER BY created_at DESC,id LIMIT 50 OFFSET least(greatest(COALESCE((p->>'offset')::integer,0),0),10000)) x),'[]'::jsonb),
    'statistics',jsonb_build_object('learners',(SELECT count(*) FROM vita_pilot.learners),'codes',(SELECT count(*) FROM vita_pilot.activation_codes),'activeSessions',(SELECT count(*) FROM vita_pilot.sessions WHERE revoked_at IS NULL AND expires_at>clock_timestamp()))) INTO result;
   RETURN result;
  END IF;
  request:=(p->>'requestId')::uuid;
  IF request IS NULL THEN RAISE EXCEPTION 'Invalid request' USING ERRCODE='22023'; END IF;
  PERFORM pg_advisory_xact_lock(hashtextextended(actor::text||request::text,0));
  IF EXISTS(SELECT 1 FROM vita_pilot.admin_audit_log WHERE actor_admin_id=actor AND metadata->>'request_id'=request::text) THEN RETURN '{"alreadyApplied":true}'::jsonb; END IF;
  IF p_action IN('admin_issue','admin_rotate','admin_grant') THEN
   expires:=(p->>'accessExpiresAt')::timestamptz;
   IF expires IS NULL OR expires<=clock_timestamp() OR expires>clock_timestamp()+interval '366 days' THEN RAISE EXCEPTION 'Invalid request' USING ERRCODE='22023'; END IF;
  END IF;
  target:=(p->>'id')::uuid;
  IF p_action IN('admin_issue','admin_rotate') THEN
   code_expires:=(p->>'codeExpiresAt')::timestamptz; code:=decode(p->>'credential','hex');
   IF code_expires IS NULL OR code_expires<=clock_timestamp() OR code_expires>expires OR code IS NULL OR octet_length(code)<>32 THEN RAISE EXCEPTION 'Invalid request' USING ERRCODE='22023'; END IF;
   learner:=(p->>'learnerId')::uuid;
   IF p_action='admin_rotate' THEN
    SELECT * INTO c FROM vita_pilot.activation_codes WHERE id=target FOR UPDATE;
    IF c.id IS NULL OR c.revoked_at IS NOT NULL THEN RAISE EXCEPTION 'Unavailable' USING ERRCODE='22023'; END IF;
    learner:=COALESCE(c.redeemed_by,c.assigned_to);
    UPDATE vita_pilot.activation_codes SET revoked_at=clock_timestamp() WHERE id=target;
    UPDATE vita_pilot.sessions SET revoked_at=clock_timestamp() WHERE activation_code_id=target AND revoked_at IS NULL;
   END IF;
   IF learner IS NOT NULL THEN
    PERFORM 1 FROM vita_pilot.learners WHERE id=learner AND disabled_at IS NULL FOR SHARE;
    IF NOT FOUND THEN RAISE EXCEPTION 'Unavailable' USING ERRCODE='22023'; END IF;
   END IF;
   INSERT INTO vita_pilot.activation_codes(code_hash,hash_key_version,created_by_admin_id,expires_at,entitlement_expires_at,assigned_to)
   VALUES(code,1,actor,code_expires,expires,learner) RETURNING id INTO target;
  ELSIF p_action='admin_revoke_code' THEN
   UPDATE vita_pilot.activation_codes SET revoked_at=clock_timestamp() WHERE id=target AND revoked_at IS NULL;
   GET DIAGNOSTICS changed=ROW_COUNT;
   IF changed=0 THEN RETURN '{"alreadyApplied":true}'::jsonb; END IF;
   UPDATE vita_pilot.sessions SET revoked_at=clock_timestamp() WHERE activation_code_id=target AND revoked_at IS NULL;
  ELSIF p_action IN('admin_revoke_access','admin_grant') THEN
   learner:=target;
   PERFORM 1 FROM vita_pilot.learners WHERE id=learner AND disabled_at IS NULL FOR UPDATE;
   IF NOT FOUND THEN RAISE EXCEPTION 'Unavailable' USING ERRCODE='22023'; END IF;
   IF p_action='admin_revoke_access' THEN
    UPDATE vita_pilot.entitlements SET revoked_at=clock_timestamp() WHERE learner_id=learner AND revoked_at IS NULL;
    UPDATE vita_pilot.sessions SET revoked_at=clock_timestamp() WHERE learner_id=learner AND revoked_at IS NULL;
    UPDATE vita_pilot.activation_codes SET revoked_at=clock_timestamp() WHERE (redeemed_by=learner OR assigned_to=learner) AND revoked_at IS NULL;
   ELSE
    INSERT INTO vita_pilot.entitlements(learner_id,entitlement_key,grant_reference,created_by_admin_id,expires_at) VALUES(learner,'course_access',request,actor,expires);
   END IF;
  ELSE RAISE EXCEPTION 'Invalid request' USING ERRCODE='22023'; END IF;
  INSERT INTO vita_pilot.admin_audit_log(actor_admin_id,subject_learner_id,action,target_kind,target_id,metadata)
  VALUES(actor,learner,replace(p_action,'_','.'),CASE WHEN p_action IN('admin_revoke_access','admin_grant') THEN 'learner' ELSE 'activation_code' END,target,jsonb_build_object('request_id',request::text));
  RETURN jsonb_build_object('ok',true,'id',target);
 END IF;
 IF p_action='logout' THEN
  UPDATE vita_pilot.sessions SET revoked_at=clock_timestamp() WHERE token_hash=token AND hash_key_version=1 AND revoked_at IS NULL;
  RETURN '{"ok":true}'::jsonb;
 END IF;
 learner:=vita_pilot.session_learner(token,1::smallint);
 IF p_action IN('progress_read','progress_save') AND p->>'expectedLearner' IS DISTINCT FROM learner::text THEN RAISE EXCEPTION 'Access denied' USING ERRCODE='42501'; END IF;
 IF NOT vita_pilot.consume_budget('session',token) THEN RETURN '{"rateLimited":true}'::jsonb; END IF;
 IF p_action='session' THEN
  RETURN jsonb_build_object('authenticated',true,'learnerId',learner,'expiresAt',(SELECT expires_at FROM vita_pilot.sessions WHERE token_hash=token AND hash_key_version=1));
 ELSIF p_action='progress_read' THEN RETURN vita_pilot.read_my_state(token,1::smallint);
 ELSIF p_action='progress_save' THEN
  incoming:=p->'state';
  IF incoming IS NULL OR incoming->'schema' IS DISTINCT FROM '2'::jsonb OR jsonb_typeof(incoming)<>'object' OR octet_length(incoming::text)>2097152 THEN RAISE EXCEPTION 'Invalid state' USING ERRCODE='22023'; END IF;
  IF incoming ? 'lessons' AND jsonb_typeof(incoming->'lessons')<>'object' THEN RAISE EXCEPTION 'Invalid state' USING ERRCODE='22023'; END IF;
  IF EXISTS(SELECT 1 FROM jsonb_object_keys(COALESCE(incoming->'lessons','{}')) k WHERE NOT EXISTS(SELECT 1 FROM vita_pilot.lesson_catalog WHERE lesson_id=k)) THEN RAISE EXCEPTION 'Invalid lesson' USING ERRCODE='22023'; END IF;
  SELECT state_snapshot,revision INTO prior,rev FROM vita_pilot.learners WHERE id=learner FOR UPDATE;
  IF (p->>'revision')::bigint IS DISTINCT FROM rev THEN RETURN jsonb_build_object('conflict',true,'state',prior,'revision',rev); END IF;
  IF NOT incoming ? 'lessons' THEN incoming:=jsonb_set(incoming,'{lessons}','{}'); END IF;
  FOR old_entry IN SELECT key,value FROM jsonb_each(COALESCE(prior->'lessons','{}')) LOOP
   next_entry:=incoming->'lessons'->old_entry.key;
   IF next_entry IS NULL THEN next_entry:=old_entry.value;
   ELSE
    IF old_entry.value->'done'='true'::jsonb THEN next_entry:=next_entry||'{"done":true}'::jsonb; END IF;
    IF COALESCE((old_entry.value->>'best')::numeric,0)>COALESCE((next_entry->>'best')::numeric,0) THEN next_entry:=jsonb_set(next_entry,'{best}',old_entry.value->'best'); END IF;
   END IF;
   incoming:=jsonb_set(incoming,ARRAY['lessons',old_entry.key],next_entry,true);
  END LOOP;
  rev:=vita_pilot.save_my_state(token,1::smallint,incoming,rev);
  RETURN jsonb_build_object('revision',rev,'state',incoming);
 END IF;
 RAISE EXCEPTION 'Invalid request' USING ERRCODE='22023';
END $fn$;

REVOKE ALL ON ALL TABLES IN SCHEMA vita_pilot FROM PUBLIC,vita_pilot_app;
REVOKE ALL ON FUNCTION vita_pilot.consume_budget(text,bytea),vita_pilot.account_request(text,jsonb) FROM PUBLIC,vita_pilot_app;
-- Account execution is a separate rollout grant, after the expanded policy is deployed.
-- This keeps the currently deployed four-function health policy healthy during preparation.
INSERT INTO vita_pilot.schema_migrations(version,checksum) VALUES('0004',expected_checksum);
END $migration$;
