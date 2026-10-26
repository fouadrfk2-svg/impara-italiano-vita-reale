-- Additive, immutable migration 0002. No automatic application/deployment.
-- Run in a transaction only after control-plane verification of the exact pilot branch.
DO $migration$
DECLARE expected_checksum constant text := 'd509d0c21be3e3750730b5e62b4430a68f6fc3a64013a7ea400a00dabd7800e0';
BEGIN
  IF current_setting('vita_pilot.migration_target', true) IS DISTINCT FROM 'vita-reale-arabic-pilot' THEN
    RAISE EXCEPTION 'Verified isolated migration target required' USING ERRCODE = '42501';
  END IF;
  PERFORM pg_advisory_xact_lock(741956, 1);
  PERFORM set_config('lock_timeout', '5s', true);
  IF NOT EXISTS (SELECT 1 FROM vita_pilot.schema_migrations WHERE version = '0001') THEN RAISE EXCEPTION 'Apply 0001 first'; END IF;
  IF EXISTS (SELECT 1 FROM vita_pilot.schema_migrations WHERE version = '0002') THEN
    IF NOT EXISTS (SELECT 1 FROM vita_pilot.schema_migrations WHERE version = '0002' AND checksum = expected_checksum) THEN RAISE EXCEPTION 'Migration checksum mismatch'; END IF;
    RETURN;
  END IF;

CREATE FUNCTION vita_pilot.guard_mutation() RETURNS trigger LANGUAGE plpgsql
SET search_path = pg_catalog, vita_pilot AS $fn$
BEGIN
  IF TG_OP = 'INSERT' THEN
    IF TG_TABLE_NAME = 'learners' THEN
      IF NEW.revision <> 0 THEN RAISE EXCEPTION 'Initial revision required' USING ERRCODE = '23514'; END IF;
    END IF;
    IF TG_TABLE_NAME = 'learner_progress' THEN
      IF NEW.revision <> 1 THEN RAISE EXCEPTION 'Initial revision required' USING ERRCODE = '23514'; END IF;
    END IF;
    IF TG_TABLE_NAME = 'activation_codes' THEN
      IF NEW.redeemed_at IS NOT NULL THEN RAISE EXCEPTION 'Codes must start unredeemed' USING ERRCODE = '23514'; END IF;
    END IF;
    IF TG_TABLE_NAME IN ('activation_codes','entitlements') THEN
      PERFORM 1 FROM vita_pilot.admin_principals WHERE id = NEW.created_by_admin_id AND app_id = NEW.app_id AND environment = NEW.environment AND revoked_at IS NULL FOR SHARE;
      IF NOT FOUND THEN RAISE EXCEPTION 'Active separate admin required' USING ERRCODE = '23514'; END IF;
    END IF;
    IF TG_TABLE_NAME IN ('sessions','entitlements') THEN
      PERFORM 1 FROM vita_pilot.learners WHERE id = NEW.learner_id AND app_id = NEW.app_id AND environment = NEW.environment AND disabled_at IS NULL FOR SHARE;
      IF NOT FOUND THEN RAISE EXCEPTION 'Learner unavailable' USING ERRCODE = '23514'; END IF;
    END IF;
  ELSE
    IF (NEW.app_id, NEW.environment, NEW.created_at) IS DISTINCT FROM (OLD.app_id, OLD.environment, OLD.created_at) THEN
      RAISE EXCEPTION 'Immutable row identity' USING ERRCODE = '23514';
    END IF;
    IF TG_TABLE_NAME <> 'learner_progress' THEN
      IF NEW.id <> OLD.id THEN RAISE EXCEPTION 'Immutable row identity' USING ERRCODE = '23514'; END IF;
    ELSE
      IF (NEW.learner_id, NEW.lesson_id) IS DISTINCT FROM (OLD.learner_id, OLD.lesson_id) THEN RAISE EXCEPTION 'Immutable progress identity' USING ERRCODE = '23514'; END IF;
    END IF;
    IF TG_TABLE_NAME IN ('learners','learner_progress') THEN
      IF NEW.revision <> OLD.revision + 1 THEN RAISE EXCEPTION 'Revision conflict' USING ERRCODE = '40001'; END IF;
    END IF;
    IF TG_TABLE_NAME = 'learners' THEN
      IF OLD.disabled_at IS NOT NULL AND NEW.disabled_at IS DISTINCT FROM OLD.disabled_at THEN RAISE EXCEPTION 'Disabled learner is terminal' USING ERRCODE = '23514'; END IF;
    END IF;
    IF TG_TABLE_NAME IN ('admin_principals','activation_codes','sessions','entitlements') THEN
      IF OLD.revoked_at IS NOT NULL AND NEW.revoked_at IS DISTINCT FROM OLD.revoked_at THEN RAISE EXCEPTION 'Revocation is terminal' USING ERRCODE = '23514'; END IF;
    END IF;
    IF TG_TABLE_NAME IN ('activation_codes','sessions') THEN
      IF NEW.expires_at IS DISTINCT FROM OLD.expires_at OR NEW.hash_key_version <> OLD.hash_key_version THEN RAISE EXCEPTION 'Immutable credential lifetime' USING ERRCODE = '23514'; END IF;
    END IF;
    IF TG_TABLE_NAME = 'sessions' THEN
      IF NEW.token_hash <> OLD.token_hash OR NEW.learner_id <> OLD.learner_id THEN RAISE EXCEPTION 'Immutable session identity' USING ERRCODE = '23514'; END IF;
    END IF;
    IF TG_TABLE_NAME = 'activation_codes' THEN
      IF NEW.code_hash <> OLD.code_hash OR NEW.created_by_admin_id <> OLD.created_by_admin_id THEN RAISE EXCEPTION 'Immutable code identity' USING ERRCODE = '23514'; END IF;
      IF OLD.redeemed_at IS NOT NULL AND (NEW.redeemed_at, NEW.redeemed_by) IS DISTINCT FROM (OLD.redeemed_at, OLD.redeemed_by) THEN RAISE EXCEPTION 'Code already redeemed' USING ERRCODE = '23514'; END IF;
      IF OLD.redeemed_at IS NULL AND NEW.redeemed_at IS NOT NULL THEN
        IF OLD.revoked_at IS NOT NULL OR NEW.revoked_at IS NOT NULL OR OLD.expires_at <= clock_timestamp() THEN RAISE EXCEPTION 'Code unavailable' USING ERRCODE = '23514'; END IF;
        PERFORM 1 FROM vita_pilot.learners WHERE id = NEW.redeemed_by AND app_id = NEW.app_id AND environment = NEW.environment AND disabled_at IS NULL FOR SHARE;
        IF NOT FOUND THEN RAISE EXCEPTION 'Learner unavailable' USING ERRCODE = '23514'; END IF;
        NEW.redeemed_at := clock_timestamp();
      END IF;
    END IF;
    IF TG_TABLE_NAME = 'entitlements' THEN
      IF (NEW.learner_id, NEW.entitlement_key, NEW.grant_reference, NEW.created_by_admin_id, NEW.activation_code_id, NEW.starts_at, NEW.expires_at)
         IS DISTINCT FROM (OLD.learner_id, OLD.entitlement_key, OLD.grant_reference, OLD.created_by_admin_id, OLD.activation_code_id, OLD.starts_at, OLD.expires_at) THEN
        RAISE EXCEPTION 'Immutable entitlement grant; issue a new grant' USING ERRCODE = '23514';
      END IF;
    END IF;
    NEW.updated_at := greatest(clock_timestamp(), OLD.updated_at + interval '1 microsecond');
  END IF;
  RETURN NEW;
END $fn$;

CREATE FUNCTION vita_pilot.audit_append_only() RETURNS trigger LANGUAGE plpgsql
SET search_path = pg_catalog AS $fn$
BEGIN
  RAISE EXCEPTION 'Audit log is append only' USING ERRCODE = '42501';
END $fn$;

CREATE TRIGGER learners_guard BEFORE INSERT OR UPDATE ON vita_pilot.learners FOR EACH ROW EXECUTE FUNCTION vita_pilot.guard_mutation();
CREATE TRIGGER admin_principals_guard BEFORE INSERT OR UPDATE ON vita_pilot.admin_principals FOR EACH ROW EXECUTE FUNCTION vita_pilot.guard_mutation();
CREATE TRIGGER activation_codes_guard BEFORE INSERT OR UPDATE ON vita_pilot.activation_codes FOR EACH ROW EXECUTE FUNCTION vita_pilot.guard_mutation();
CREATE TRIGGER sessions_guard BEFORE INSERT OR UPDATE ON vita_pilot.sessions FOR EACH ROW EXECUTE FUNCTION vita_pilot.guard_mutation();
CREATE TRIGGER entitlements_guard BEFORE INSERT OR UPDATE ON vita_pilot.entitlements FOR EACH ROW EXECUTE FUNCTION vita_pilot.guard_mutation();
CREATE TRIGGER learner_progress_guard BEFORE INSERT OR UPDATE ON vita_pilot.learner_progress FOR EACH ROW EXECUTE FUNCTION vita_pilot.guard_mutation();
CREATE TRIGGER audit_append_guard BEFORE UPDATE OR DELETE ON vita_pilot.admin_audit_log FOR EACH ROW EXECUTE FUNCTION vita_pilot.audit_append_only();

-- All application tables deny ordinary access unless a later explicit grant/policy allows it.
ALTER TABLE vita_pilot.learners ENABLE ROW LEVEL SECURITY;
ALTER TABLE vita_pilot.admin_principals ENABLE ROW LEVEL SECURITY;
ALTER TABLE vita_pilot.activation_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE vita_pilot.sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE vita_pilot.entitlements ENABLE ROW LEVEL SECURITY;
ALTER TABLE vita_pilot.learner_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE vita_pilot.admin_audit_log ENABLE ROW LEVEL SECURITY;

CREATE FUNCTION vita_pilot.request_learner_id() RETURNS uuid LANGUAGE sql STABLE
SET search_path = pg_catalog AS $fn$
  SELECT CASE WHEN current_setting('vita_pilot.app_id', true) = 'vita-reale-arabic'
    AND current_setting('vita_pilot.environment', true) = 'pilot'
    THEN nullif(current_setting('vita_pilot.learner_id', true), '')::uuid ELSE NULL END
$fn$;

CREATE POLICY learner_self_read ON vita_pilot.learners FOR SELECT
  USING (id = vita_pilot.request_learner_id());
CREATE POLICY progress_self_read ON vita_pilot.learner_progress FOR SELECT
  USING (learner_id = vita_pilot.request_learner_id());

-- SECURITY INVOKER views cannot bypass row security or supply admin/session authority.
CREATE VIEW vita_pilot.active_sessions WITH (security_invoker = true) AS
  SELECT s.id, s.app_id, s.environment, s.learner_id, s.token_hash, s.hash_key_version, s.expires_at
  FROM vita_pilot.sessions s JOIN vita_pilot.learners l ON (l.app_id,l.environment,l.id) = (s.app_id,s.environment,s.learner_id)
  WHERE s.revoked_at IS NULL AND s.expires_at > statement_timestamp() AND l.disabled_at IS NULL;
CREATE VIEW vita_pilot.active_entitlements WITH (security_invoker = true) AS
  SELECT e.id, e.app_id, e.environment, e.learner_id, e.entitlement_key, e.expires_at
  FROM vita_pilot.entitlements e JOIN vita_pilot.learners l ON (l.app_id,l.environment,l.id) = (e.app_id,e.environment,e.learner_id)
  WHERE e.revoked_at IS NULL AND e.starts_at <= statement_timestamp()
    AND (e.expires_at IS NULL OR e.expires_at > statement_timestamp()) AND l.disabled_at IS NULL;

-- Private CAS functions: no PUBLIC execute grants. Context must be set only by a
-- future authenticated server, never taken from request JSON or browser flags.
CREATE FUNCTION vita_pilot.write_lesson_progress(p_learner_id uuid, p_lesson_id text, p_state jsonb, p_expected_revision bigint)
RETURNS bigint LANGUAGE plpgsql SECURITY DEFINER
SET search_path = pg_catalog, vita_pilot AS $fn$
DECLARE next_revision bigint;
BEGIN
  IF p_learner_id IS DISTINCT FROM vita_pilot.request_learner_id() OR p_learner_id IS NULL THEN RAISE EXCEPTION 'Learner context required' USING ERRCODE = '42501'; END IF;
  IF p_expected_revision IS NULL OR p_expected_revision < 0 THEN RAISE EXCEPTION 'Expected revision required' USING ERRCODE = '22023'; END IF;
  PERFORM 1 FROM vita_pilot.learners WHERE id = p_learner_id AND app_id = 'vita-reale-arabic' AND environment = 'pilot' AND disabled_at IS NULL FOR SHARE;
  IF NOT FOUND THEN RAISE EXCEPTION 'Learner unavailable' USING ERRCODE = '42501'; END IF;
  IF p_expected_revision = 0 THEN
    INSERT INTO vita_pilot.learner_progress (learner_id, lesson_id, state)
    VALUES (p_learner_id, p_lesson_id, p_state) ON CONFLICT DO NOTHING RETURNING revision INTO next_revision;
  ELSE
    UPDATE vita_pilot.learner_progress SET state = p_state, revision = revision + 1
    WHERE app_id = 'vita-reale-arabic' AND environment = 'pilot' AND learner_id = p_learner_id AND lesson_id = p_lesson_id AND revision = p_expected_revision
    RETURNING revision INTO next_revision;
  END IF;
  IF next_revision IS NULL THEN RAISE EXCEPTION 'Revision conflict' USING ERRCODE = '40001'; END IF;
  RETURN next_revision;
END $fn$;

CREATE FUNCTION vita_pilot.write_learner_state(p_learner_id uuid, p_state jsonb, p_expected_revision bigint)
RETURNS bigint LANGUAGE plpgsql SECURITY DEFINER
SET search_path = pg_catalog, vita_pilot AS $fn$
DECLARE next_revision bigint;
BEGIN
  IF p_learner_id IS DISTINCT FROM vita_pilot.request_learner_id() OR p_learner_id IS NULL THEN RAISE EXCEPTION 'Learner context required' USING ERRCODE = '42501'; END IF;
  IF p_expected_revision IS NULL OR p_expected_revision < 0 THEN RAISE EXCEPTION 'Expected revision required' USING ERRCODE = '22023'; END IF;
  UPDATE vita_pilot.learners SET state_snapshot = p_state, revision = revision + 1
  WHERE app_id = 'vita-reale-arabic' AND environment = 'pilot' AND id = p_learner_id AND disabled_at IS NULL AND revision = p_expected_revision
  RETURNING revision INTO next_revision;
  IF next_revision IS NULL THEN RAISE EXCEPTION 'Revision conflict or learner unavailable' USING ERRCODE = '40001'; END IF;
  RETURN next_revision;
END $fn$;

  REVOKE ALL ON ALL TABLES IN SCHEMA vita_pilot FROM PUBLIC;
  REVOKE ALL ON ALL FUNCTIONS IN SCHEMA vita_pilot FROM PUBLIC;
  ALTER DEFAULT PRIVILEGES IN SCHEMA vita_pilot REVOKE ALL ON TABLES FROM PUBLIC;
  ALTER DEFAULT PRIVILEGES IN SCHEMA vita_pilot REVOKE ALL ON FUNCTIONS FROM PUBLIC;
  INSERT INTO vita_pilot.schema_migrations(version, checksum) VALUES ('0002', expected_checksum);
END $migration$;
