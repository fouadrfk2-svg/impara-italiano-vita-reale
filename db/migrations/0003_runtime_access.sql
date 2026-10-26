-- Additive security migration 0003. Explicitly verified pilot branch only.
-- No credentials, customer-table access, role membership grants or deployment changes.
DO $migration$
DECLARE expected_checksum constant text := '1979b9d3c8ba61864d85600e1d60027939f432fd57c9812b08a914a0012bc17d';
DECLARE runtime_oid oid;
BEGIN
  IF current_setting('vita_pilot.migration_target',true) IS DISTINCT FROM 'vita-reale-arabic-pilot' THEN
    RAISE EXCEPTION 'Verified isolated migration target required' USING ERRCODE='42501';
  END IF;
  PERFORM pg_advisory_xact_lock(741956,1);
  PERFORM set_config('lock_timeout','5s',true);
  IF NOT EXISTS(SELECT 1 FROM vita_pilot.schema_migrations WHERE version='0002' AND checksum='d509d0c21be3e3750730b5e62b4430a68f6fc3a64013a7ea400a00dabd7800e0') THEN
    RAISE EXCEPTION 'Verified 0002 required';
  END IF;
  IF EXISTS(SELECT 1 FROM vita_pilot.schema_migrations WHERE version='0003' AND checksum<>expected_checksum) THEN
    RAISE EXCEPTION 'Migration checksum mismatch';
  END IF;

  -- The API-created vita_pilot_runtime is deliberately not reused or granted access.
  -- SQL creation avoids automatic neon_superuser membership. No password is set here.
  IF NOT EXISTS(SELECT 1 FROM pg_catalog.pg_roles WHERE rolname='vita_pilot_app') THEN
    CREATE ROLE vita_pilot_app LOGIN NOSUPERUSER NOBYPASSRLS NOCREATEROLE NOCREATEDB NOREPLICATION NOINHERIT CONNECTION LIMIT 20;
    ALTER ROLE vita_pilot_app SET search_path=pg_catalog;
    ALTER ROLE vita_pilot_app SET statement_timeout='10s';
    ALTER ROLE vita_pilot_app SET lock_timeout='3s';
    ALTER ROLE vita_pilot_app SET idle_in_transaction_session_timeout='10s';
  END IF;
  SELECT oid INTO runtime_oid FROM pg_catalog.pg_roles WHERE rolname='vita_pilot_app';
  IF NOT EXISTS(SELECT 1 FROM pg_catalog.pg_roles WHERE oid=runtime_oid AND rolcanlogin AND NOT rolsuper AND NOT rolbypassrls AND NOT rolcreaterole AND NOT rolcreatedb AND NOT rolreplication AND NOT rolinherit) THEN
    RAISE EXCEPTION 'Restricted role attributes required' USING ERRCODE='42501';
  END IF;
  -- NOINHERIT alone is insufficient: any membership could permit SET ROLE.
  IF EXISTS(SELECT 1 FROM pg_catalog.pg_auth_members WHERE member=runtime_oid) THEN
    RAISE EXCEPTION 'Runtime role must have no memberships' USING ERRCODE='42501';
  END IF;
  IF EXISTS(SELECT 1 FROM pg_catalog.pg_class WHERE relowner=runtime_oid)
    OR EXISTS(SELECT 1 FROM pg_catalog.pg_namespace WHERE nspowner=runtime_oid)
    OR EXISTS(SELECT 1 FROM pg_catalog.pg_proc WHERE proowner=runtime_oid)
    OR EXISTS(SELECT 1 FROM pg_catalog.pg_database WHERE datdba=runtime_oid)
    OR has_database_privilege(runtime_oid,current_database(),'CREATE') THEN
    RAISE EXCEPTION 'Runtime must own no objects or schema-creation rights' USING ERRCODE='42501';
  END IF;
  -- Catalog ACL inspection only. Never select records from other application schemas.
  IF EXISTS(SELECT 1 FROM pg_catalog.pg_class c JOIN pg_catalog.pg_namespace n ON n.oid=c.relnamespace
    WHERE n.nspname NOT IN ('pg_catalog','information_schema') AND n.nspname NOT LIKE 'pg_toast%' AND n.nspname NOT LIKE 'pg_temp%'
      AND c.relkind IN ('r','p','v','m','f') AND (
       EXISTS(SELECT 1 FROM pg_catalog.aclexplode(COALESCE(c.relacl,pg_catalog.acldefault('r',c.relowner))) acl WHERE acl.grantee IN (0,runtime_oid))
       OR has_any_column_privilege(runtime_oid,c.oid,'SELECT,INSERT,UPDATE,REFERENCES'))) THEN
    RAISE EXCEPTION 'Runtime has unexpected effective table privileges' USING ERRCODE='42501';
  END IF;
  IF EXISTS(SELECT 1 FROM pg_catalog.pg_class c JOIN pg_catalog.pg_namespace n ON n.oid=c.relnamespace
    WHERE n.nspname NOT IN ('pg_catalog','information_schema') AND c.relkind='S'
    AND CASE WHEN c.relkind='S' THEN has_sequence_privilege(runtime_oid,c.oid,'USAGE,SELECT,UPDATE') ELSE false END) THEN
    RAISE EXCEPTION 'Runtime has unexpected sequence privileges' USING ERRCODE='42501';
  END IF;
  IF EXISTS(SELECT 1 FROM pg_catalog.pg_proc p JOIN pg_catalog.pg_namespace n ON n.oid=p.pronamespace
    WHERE n.nspname NOT IN ('pg_catalog','information_schema') AND p.prosecdef
    AND has_function_privilege(runtime_oid,p.oid,'EXECUTE')
    AND NOT(p.oid=ANY(ARRAY[
      COALESCE(to_regprocedure('vita_pilot.read_my_state(bytea,smallint)')::oid,0::oid),
      COALESCE(to_regprocedure('vita_pilot.read_my_lesson_progress(bytea,smallint,text)')::oid,0::oid),
      COALESCE(to_regprocedure('vita_pilot.save_my_state(bytea,smallint,jsonb,bigint)')::oid,0::oid),
      COALESCE(to_regprocedure('vita_pilot.save_my_lesson_progress(bytea,smallint,text,jsonb,bigint)')::oid,0::oid)]))) THEN
    RAISE EXCEPTION 'Runtime has unexpected privileged function access' USING ERRCODE='42501';
  END IF;
  -- Reruns revalidate the role before trusting the ledger, rather than hiding drift.
  IF EXISTS(SELECT 1 FROM vita_pilot.schema_migrations WHERE version='0003') THEN RETURN; END IF;

CREATE FUNCTION vita_pilot.session_learner(p_token_hash bytea,p_key_version smallint)
RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER
SET search_path=pg_catalog,vita_pilot AS $fn$
DECLARE learner uuid;
BEGIN
  IF p_token_hash IS NULL OR octet_length(p_token_hash)<>32 OR p_key_version IS NULL OR p_key_version<1 THEN
    RAISE EXCEPTION 'Access denied' USING ERRCODE='42501';
  END IF;
  SELECT s.learner_id INTO learner FROM vita_pilot.sessions s
  JOIN vita_pilot.learners l ON (l.app_id,l.environment,l.id)=(s.app_id,s.environment,s.learner_id)
  WHERE s.app_id='vita-reale-arabic' AND s.environment='pilot'
    AND s.token_hash=p_token_hash AND s.hash_key_version=p_key_version
    AND s.revoked_at IS NULL AND s.expires_at>clock_timestamp() AND l.disabled_at IS NULL
  FOR SHARE OF s,l;
  IF learner IS NULL THEN RAISE EXCEPTION 'Access denied' USING ERRCODE='42501'; END IF;
  PERFORM 1 FROM vita_pilot.entitlements e
  WHERE e.app_id='vita-reale-arabic' AND e.environment='pilot' AND e.learner_id=learner
    AND e.entitlement_key='course_access' AND e.revoked_at IS NULL AND e.starts_at<=clock_timestamp()
    AND (e.expires_at IS NULL OR e.expires_at>clock_timestamp()) LIMIT 1 FOR SHARE;
  IF NOT FOUND THEN RAISE EXCEPTION 'Access denied' USING ERRCODE='42501'; END IF;
  RETURN learner;
END $fn$;

CREATE FUNCTION vita_pilot.read_my_state(p_token_hash bytea,p_key_version smallint)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path=pg_catalog,vita_pilot AS $fn$
DECLARE learner uuid;
BEGIN
  learner:=vita_pilot.session_learner(p_token_hash,p_key_version);
  RETURN (SELECT jsonb_build_object('state',l.state_snapshot,'revision',l.revision)
    FROM vita_pilot.learners l WHERE l.app_id='vita-reale-arabic' AND l.environment='pilot' AND l.id=learner);
END $fn$;

CREATE FUNCTION vita_pilot.read_my_lesson_progress(p_token_hash bytea,p_key_version smallint,p_lesson_id text)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path=pg_catalog,vita_pilot AS $fn$
DECLARE learner uuid;
BEGIN
  learner:=vita_pilot.session_learner(p_token_hash,p_key_version);
  IF p_lesson_id IS NULL OR p_lesson_id !~ '^[a-z][a-z0-9_-]{1,95}$' THEN RAISE EXCEPTION 'Invalid lesson ID' USING ERRCODE='22023'; END IF;
  RETURN COALESCE((SELECT jsonb_build_object('state',p.state,'revision',p.revision)
    FROM vita_pilot.learner_progress p WHERE p.app_id='vita-reale-arabic' AND p.environment='pilot'
    AND p.learner_id=learner AND p.lesson_id=p_lesson_id),jsonb_build_object('state',NULL,'revision',0));
END $fn$;

CREATE FUNCTION vita_pilot.save_my_state(p_token_hash bytea,p_key_version smallint,p_state jsonb,p_expected_revision bigint)
RETURNS bigint LANGUAGE plpgsql SECURITY DEFINER SET search_path=pg_catalog,vita_pilot AS $fn$
DECLARE learner uuid; result bigint;
DECLARE old_app text:=current_setting('vita_pilot.app_id',true); old_environment text:=current_setting('vita_pilot.environment',true); old_learner text:=current_setting('vita_pilot.learner_id',true);
BEGIN
  learner:=vita_pilot.session_learner(p_token_hash,p_key_version);
  PERFORM set_config('vita_pilot.app_id','vita-reale-arabic',true),set_config('vita_pilot.environment','pilot',true);
  PERFORM set_config('vita_pilot.learner_id',learner::text,true);
  result:=vita_pilot.write_learner_state(learner,p_state,p_expected_revision);
  PERFORM set_config('vita_pilot.app_id',COALESCE(old_app,''),true),set_config('vita_pilot.environment',COALESCE(old_environment,''),true),set_config('vita_pilot.learner_id',COALESCE(old_learner,''),true);
  RETURN result;
END $fn$;

CREATE FUNCTION vita_pilot.save_my_lesson_progress(p_token_hash bytea,p_key_version smallint,p_lesson_id text,p_state jsonb,p_expected_revision bigint)
RETURNS bigint LANGUAGE plpgsql SECURITY DEFINER SET search_path=pg_catalog,vita_pilot AS $fn$
DECLARE learner uuid; result bigint;
DECLARE old_app text:=current_setting('vita_pilot.app_id',true); old_environment text:=current_setting('vita_pilot.environment',true); old_learner text:=current_setting('vita_pilot.learner_id',true);
BEGIN
  learner:=vita_pilot.session_learner(p_token_hash,p_key_version);
  PERFORM set_config('vita_pilot.app_id','vita-reale-arabic',true),set_config('vita_pilot.environment','pilot',true);
  PERFORM set_config('vita_pilot.learner_id',learner::text,true);
  result:=vita_pilot.write_lesson_progress(learner,p_lesson_id,p_state,p_expected_revision);
  PERFORM set_config('vita_pilot.app_id',COALESCE(old_app,''),true),set_config('vita_pilot.environment',COALESCE(old_environment,''),true),set_config('vita_pilot.learner_id',COALESCE(old_learner,''),true);
  RETURN result;
END $fn$;

  REVOKE ALL ON FUNCTION vita_pilot.session_learner(bytea,smallint) FROM PUBLIC,vita_pilot_app;
  REVOKE ALL ON FUNCTION vita_pilot.read_my_state(bytea,smallint),vita_pilot.read_my_lesson_progress(bytea,smallint,text),vita_pilot.save_my_state(bytea,smallint,jsonb,bigint),vita_pilot.save_my_lesson_progress(bytea,smallint,text,jsonb,bigint) FROM PUBLIC;
  EXECUTE format('GRANT CONNECT ON DATABASE %I TO vita_pilot_app',current_database());
  GRANT USAGE ON SCHEMA vita_pilot TO vita_pilot_app;
  GRANT EXECUTE ON FUNCTION vita_pilot.read_my_state(bytea,smallint),vita_pilot.read_my_lesson_progress(bytea,smallint,text),vita_pilot.save_my_state(bytea,smallint,jsonb,bigint),vita_pilot.save_my_lesson_progress(bytea,smallint,text,jsonb,bigint) TO vita_pilot_app;
  INSERT INTO vita_pilot.schema_migrations(version,checksum) VALUES('0003',expected_checksum);
END $migration$;
