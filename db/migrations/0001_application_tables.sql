-- Additive, immutable migration 0001. No automatic application/deployment.
-- Run in a transaction only after control-plane verification of the exact pilot branch.
DO $migration$
DECLARE expected_checksum constant text := 'f1c064963fc01df5b80cecef8fdd62063bd3a25bdd50f3c95baba91913a6328a';
BEGIN
  IF current_setting('vita_pilot.migration_target', true) IS DISTINCT FROM 'vita-reale-arabic-pilot' THEN
    RAISE EXCEPTION 'Verified isolated migration target required' USING ERRCODE = '42501';
  END IF;
  PERFORM pg_advisory_xact_lock(741956, 1);
  PERFORM set_config('lock_timeout', '5s', true);
  CREATE SCHEMA IF NOT EXISTS vita_pilot;
  REVOKE ALL ON SCHEMA vita_pilot FROM PUBLIC;
  CREATE TABLE IF NOT EXISTS vita_pilot.schema_migrations (
    version text PRIMARY KEY,
    checksum text NOT NULL CHECK (checksum ~ '^[0-9a-f]{64}$'),
    applied_at timestamptz NOT NULL DEFAULT clock_timestamp()
  );
  IF EXISTS (SELECT 1 FROM vita_pilot.schema_migrations WHERE version = '0001') THEN
    IF NOT EXISTS (SELECT 1 FROM vita_pilot.schema_migrations WHERE version = '0001' AND checksum = expected_checksum) THEN RAISE EXCEPTION 'Migration checksum mismatch'; END IF;
    RETURN;
  END IF;

CREATE TABLE vita_pilot.learners (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  app_id text NOT NULL DEFAULT 'vita-reale-arabic',
  environment text NOT NULL DEFAULT 'pilot',
  created_at timestamptz NOT NULL DEFAULT clock_timestamp(),
  updated_at timestamptz NOT NULL DEFAULT clock_timestamp(),
  disabled_at timestamptz,
  revision bigint NOT NULL DEFAULT 0 CHECK (revision BETWEEN 0 AND 9007199254740990),
  state_snapshot jsonb NOT NULL DEFAULT '{"schema":2}'::jsonb,
  CHECK (app_id = 'vita-reale-arabic' AND environment = 'pilot'),
  CHECK (jsonb_typeof(state_snapshot) = 'object' AND state_snapshot -> 'schema' = '2'::jsonb AND state_snapshot ? 'schema'),
  CHECK (octet_length(state_snapshot::text) <= 2097152),
  CHECK (updated_at >= created_at AND (disabled_at IS NULL OR disabled_at >= created_at)),
  UNIQUE (app_id, environment, id)
);

-- Separate operator identities; learner sessions can never confer admin authority.
CREATE TABLE vita_pilot.admin_principals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  app_id text NOT NULL DEFAULT 'vita-reale-arabic',
  environment text NOT NULL DEFAULT 'pilot',
  created_at timestamptz NOT NULL DEFAULT clock_timestamp(),
  updated_at timestamptz NOT NULL DEFAULT clock_timestamp(),
  revoked_at timestamptz,
  CHECK (app_id = 'vita-reale-arabic' AND environment = 'pilot'),
  CHECK (updated_at >= created_at AND (revoked_at IS NULL OR revoked_at >= created_at)),
  UNIQUE (app_id, environment, id)
);

CREATE TABLE vita_pilot.activation_codes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  app_id text NOT NULL DEFAULT 'vita-reale-arabic',
  environment text NOT NULL DEFAULT 'pilot',
  created_at timestamptz NOT NULL DEFAULT clock_timestamp(),
  updated_at timestamptz NOT NULL DEFAULT clock_timestamp(),
  code_hash bytea NOT NULL CHECK (octet_length(code_hash) = 32),
  hash_key_version smallint NOT NULL CHECK (hash_key_version > 0),
  created_by_admin_id uuid NOT NULL,
  expires_at timestamptz NOT NULL,
  revoked_at timestamptz,
  redeemed_by uuid,
  redeemed_at timestamptz,
  CHECK (app_id = 'vita-reale-arabic' AND environment = 'pilot'),
  CHECK (updated_at >= created_at AND expires_at > created_at),
  CHECK (revoked_at IS NULL OR revoked_at >= created_at),
  CHECK ((redeemed_by IS NULL) = (redeemed_at IS NULL)),
  CHECK (redeemed_at IS NULL OR (redeemed_at >= created_at AND redeemed_at < expires_at)),
  UNIQUE (app_id, environment, id),
  UNIQUE (app_id, environment, id, redeemed_by),
  UNIQUE (app_id, environment, hash_key_version, code_hash),
  FOREIGN KEY (app_id, environment, created_by_admin_id) REFERENCES vita_pilot.admin_principals (app_id, environment, id) ON DELETE RESTRICT,
  FOREIGN KEY (app_id, environment, redeemed_by) REFERENCES vita_pilot.learners (app_id, environment, id) ON DELETE RESTRICT
);

CREATE TABLE vita_pilot.sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  app_id text NOT NULL DEFAULT 'vita-reale-arabic',
  environment text NOT NULL DEFAULT 'pilot',
  created_at timestamptz NOT NULL DEFAULT clock_timestamp(),
  updated_at timestamptz NOT NULL DEFAULT clock_timestamp(),
  learner_id uuid NOT NULL,
  token_hash bytea NOT NULL CHECK (octet_length(token_hash) = 32),
  hash_key_version smallint NOT NULL CHECK (hash_key_version > 0),
  expires_at timestamptz NOT NULL,
  revoked_at timestamptz,
  CHECK (app_id = 'vita-reale-arabic' AND environment = 'pilot'),
  CHECK (updated_at >= created_at AND expires_at > created_at),
  CHECK (revoked_at IS NULL OR revoked_at >= created_at),
  UNIQUE (app_id, environment, hash_key_version, token_hash),
  FOREIGN KEY (app_id, environment, learner_id) REFERENCES vita_pilot.learners (app_id, environment, id) ON DELETE RESTRICT
);

CREATE TABLE vita_pilot.entitlements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  app_id text NOT NULL DEFAULT 'vita-reale-arabic',
  environment text NOT NULL DEFAULT 'pilot',
  created_at timestamptz NOT NULL DEFAULT clock_timestamp(),
  updated_at timestamptz NOT NULL DEFAULT clock_timestamp(),
  learner_id uuid NOT NULL,
  entitlement_key text NOT NULL CHECK (entitlement_key ~ '^[a-z][a-z0-9_-]{0,63}$'),
  grant_reference uuid NOT NULL,
  created_by_admin_id uuid NOT NULL,
  activation_code_id uuid,
  starts_at timestamptz NOT NULL DEFAULT clock_timestamp(),
  expires_at timestamptz,
  revoked_at timestamptz,
  CHECK (app_id = 'vita-reale-arabic' AND environment = 'pilot'),
  CHECK (updated_at >= created_at AND starts_at >= created_at),
  CHECK (expires_at IS NULL OR expires_at > starts_at),
  CHECK (revoked_at IS NULL OR revoked_at >= created_at),
  UNIQUE (app_id, environment, grant_reference),
  UNIQUE (app_id, environment, activation_code_id),
  FOREIGN KEY (app_id, environment, learner_id) REFERENCES vita_pilot.learners (app_id, environment, id) ON DELETE RESTRICT,
  FOREIGN KEY (app_id, environment, created_by_admin_id) REFERENCES vita_pilot.admin_principals (app_id, environment, id) ON DELETE RESTRICT,
  FOREIGN KEY (app_id, environment, activation_code_id, learner_id)
    REFERENCES vita_pilot.activation_codes (app_id, environment, id, redeemed_by) ON DELETE RESTRICT
);

CREATE TABLE vita_pilot.learner_progress (
  app_id text NOT NULL DEFAULT 'vita-reale-arabic',
  environment text NOT NULL DEFAULT 'pilot',
  learner_id uuid NOT NULL,
  lesson_id text NOT NULL CHECK (lesson_id ~ '^[a-z][a-z0-9_-]{1,95}$'),
  state jsonb NOT NULL CHECK (jsonb_typeof(state) = 'object' AND octet_length(state::text) <= 262144),
  revision bigint NOT NULL DEFAULT 1 CHECK (revision BETWEEN 1 AND 9007199254740990),
  created_at timestamptz NOT NULL DEFAULT clock_timestamp(),
  updated_at timestamptz NOT NULL DEFAULT clock_timestamp(),
  CHECK (app_id = 'vita-reale-arabic' AND environment = 'pilot'),
  CHECK (updated_at >= created_at),
  PRIMARY KEY (app_id, environment, learner_id, lesson_id),
  FOREIGN KEY (app_id, environment, learner_id) REFERENCES vita_pilot.learners (app_id, environment, id) ON DELETE RESTRICT
);

CREATE TABLE vita_pilot.admin_audit_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  app_id text NOT NULL DEFAULT 'vita-reale-arabic',
  environment text NOT NULL DEFAULT 'pilot',
  created_at timestamptz NOT NULL DEFAULT clock_timestamp(),
  actor_admin_id uuid NOT NULL,
  subject_learner_id uuid,
  action text NOT NULL CHECK (action ~ '^[a-z][a-z0-9_.-]{1,63}$'),
  target_kind text NOT NULL CHECK (target_kind IN ('learner','activation_code','session','entitlement','admin_principal')),
  target_id uuid NOT NULL,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  CHECK (app_id = 'vita-reale-arabic' AND environment = 'pilot'),
  CHECK (jsonb_typeof(metadata) = 'object' AND octet_length(metadata::text) <= 1024),
  CHECK (metadata - ARRAY['reason_code','request_id']::text[] = '{}'::jsonb),
  CHECK (NOT (metadata ? 'reason_code') OR (jsonb_typeof(metadata -> 'reason_code') = 'string' AND metadata ->> 'reason_code' ~ '^[a-z][a-z0-9_]{0,63}$')),
  CHECK (NOT (metadata ? 'request_id') OR (jsonb_typeof(metadata -> 'request_id') = 'string' AND metadata ->> 'request_id' ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$')),
  FOREIGN KEY (app_id, environment, actor_admin_id) REFERENCES vita_pilot.admin_principals (app_id, environment, id) ON DELETE RESTRICT,
  FOREIGN KEY (app_id, environment, subject_learner_id) REFERENCES vita_pilot.learners (app_id, environment, id) ON DELETE RESTRICT
);

CREATE INDEX sessions_learner_active_idx ON vita_pilot.sessions (app_id, environment, learner_id, expires_at) WHERE revoked_at IS NULL;
CREATE INDEX codes_unredeemed_expiry_idx ON vita_pilot.activation_codes (app_id, environment, expires_at) WHERE redeemed_at IS NULL AND revoked_at IS NULL;
CREATE INDEX codes_learner_idx ON vita_pilot.activation_codes (app_id, environment, redeemed_by) WHERE redeemed_by IS NOT NULL;
CREATE INDEX codes_admin_idx ON vita_pilot.activation_codes (app_id, environment, created_by_admin_id);
CREATE INDEX entitlements_learner_active_idx ON vita_pilot.entitlements (app_id, environment, learner_id, entitlement_key, starts_at, expires_at) WHERE revoked_at IS NULL;
CREATE INDEX entitlements_admin_idx ON vita_pilot.entitlements (app_id, environment, created_by_admin_id);
CREATE INDEX progress_updated_idx ON vita_pilot.learner_progress (app_id, environment, learner_id, updated_at);
CREATE INDEX audit_actor_idx ON vita_pilot.admin_audit_log (app_id, environment, actor_admin_id, created_at DESC);
CREATE INDEX audit_learner_idx ON vita_pilot.admin_audit_log (app_id, environment, subject_learner_id, created_at DESC);
CREATE INDEX audit_target_idx ON vita_pilot.admin_audit_log (app_id, environment, target_kind, target_id, created_at DESC);

  REVOKE ALL ON ALL TABLES IN SCHEMA vita_pilot FROM PUBLIC;
  REVOKE ALL ON ALL FUNCTIONS IN SCHEMA vita_pilot FROM PUBLIC;
  ALTER DEFAULT PRIVILEGES IN SCHEMA vita_pilot REVOKE ALL ON TABLES FROM PUBLIC;
  ALTER DEFAULT PRIVILEGES IN SCHEMA vita_pilot REVOKE ALL ON FUNCTIONS FROM PUBLIC;
  INSERT INTO vita_pilot.schema_migrations(version, checksum) VALUES ('0001', expected_checksum);
END $migration$;
