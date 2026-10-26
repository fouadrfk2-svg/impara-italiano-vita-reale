-- Real-connection verification: no customer queries or committed fixture writes.
-- Must run authenticated as the SQL-created restricted role, not via owner SET ROLE.
DO $verify$
DECLARE object_name text; column_name text; command text; denied integer:=0;
BEGIN
  IF current_user<>'vita_pilot_app' OR session_user<>'vita_pilot_app' THEN RAISE EXCEPTION 'Real restricted connection required'; END IF;
  IF EXISTS(SELECT 1 FROM pg_catalog.pg_roles WHERE rolname=current_user AND (rolsuper OR rolbypassrls OR rolcreaterole OR rolcreatedb OR rolreplication OR rolinherit))
     OR EXISTS(SELECT 1 FROM pg_catalog.pg_auth_members WHERE member=(SELECT oid FROM pg_catalog.pg_roles WHERE rolname=current_user)) THEN RAISE EXCEPTION 'Role privilege or membership drift'; END IF;
  FOREACH object_name IN ARRAY ARRAY['learners','activation_codes','sessions','entitlements','learner_progress','admin_audit_log','admin_principals','schema_migrations'] LOOP
    column_name:=CASE WHEN object_name='schema_migrations' THEN 'version' ELSE 'app_id' END;
    FOREACH command IN ARRAY ARRAY[
      format('SELECT * FROM vita_pilot.%I WHERE false',object_name),
      format('INSERT INTO vita_pilot.%I DEFAULT VALUES',object_name),
      format('UPDATE vita_pilot.%I SET %I=%I WHERE false',object_name,column_name,column_name),
      format('DELETE FROM vita_pilot.%I WHERE false',object_name)] LOOP
      BEGIN EXECUTE command; RAISE EXCEPTION 'Unexpected direct permission: %',object_name;
      EXCEPTION WHEN insufficient_privilege THEN denied:=denied+1; END;
    END LOOP;
  END LOOP;
  FOREACH object_name IN ARRAY ARRAY['active_sessions','active_entitlements'] LOOP
    BEGIN EXECUTE format('SELECT * FROM vita_pilot.%I WHERE false',object_name); RAISE EXCEPTION 'Unexpected direct view permission';
    EXCEPTION WHEN insufficient_privilege THEN denied:=denied+1; END;
  END LOOP;
  FOREACH command IN ARRAY ARRAY[
    'SET ROLE vita_reale_test_owner',
    'SET ROLE neon_superuser',
    'SET ROLE pg_read_all_data',
    'SET ROLE pg_write_all_data',
    'SET SESSION AUTHORIZATION vita_reale_test_owner',
    'ALTER ROLE vita_pilot_app BYPASSRLS',
    'CREATE ROLE vita_pilot_escape_test NOLOGIN',
    'ALTER TABLE vita_pilot.learners DISABLE ROW LEVEL SECURITY',
    'CREATE TABLE vita_pilot.runtime_escape_test(id int)',
    'SELECT vita_pilot.request_learner_id()',
    'SELECT vita_pilot.session_learner(decode(repeat(''c'',64),''hex''),1::smallint)',
    'SELECT vita_pilot.write_learner_state(''10000000-0000-4000-8000-000000000002'',''{"schema":2}'',0)',
    'SELECT vita_pilot.write_lesson_progress(''10000000-0000-4000-8000-000000000002'',''a1-u01-l1'',''{}'',0)'] LOOP
    BEGIN EXECUTE command; RAISE EXCEPTION 'Unexpected privileged operation';
    EXCEPTION WHEN insufficient_privilege THEN denied:=denied+1;
      WHEN SQLSTATE 'XX000' THEN
        IF command IN ('SET ROLE neon_superuser','SET ROLE pg_read_all_data','SET ROLE pg_write_all_data') AND SQLERRM='It is not allowed to change role to '||substr(command,10) THEN denied:=denied+1; ELSE RAISE; END IF;
    END;
    IF current_user<>'vita_pilot_app' OR session_user<>'vita_pilot_app' THEN RAISE EXCEPTION 'Role escalation occurred'; END IF;
  END LOOP;
  -- Spoofing all legacy context settings must never substitute for a session credential.
  PERFORM set_config('vita_pilot.app_id','vita-reale-arabic',true);
  PERFORM set_config('vita_pilot.environment','pilot',true);
  PERFORM set_config('vita_pilot.learner_id','10000000-0000-4000-8000-000000000002',true);
  PERFORM set_config('row_security','off',true);
  FOREACH command IN ARRAY ARRAY[
    'SELECT vita_pilot.read_my_state(decode(repeat(''0'',64),''hex''),1::smallint)',
    'SELECT vita_pilot.read_my_lesson_progress(decode(repeat(''0'',64),''hex''),1::smallint,''a1-u01-l1'')',
    'SELECT vita_pilot.save_my_state(decode(repeat(''0'',64),''hex''),1::smallint,''{"schema":2}'',0)',
    'SELECT vita_pilot.save_my_lesson_progress(decode(repeat(''0'',64),''hex''),1::smallint,''a1-u01-l1'',''{}'',0)',
    'SELECT * FROM vita_pilot.learners WHERE false'] LOOP
    BEGIN EXECUTE command; RAISE EXCEPTION 'Context spoofing bypassed access';
    EXCEPTION WHEN insufficient_privilege THEN denied:=denied+1; END;
  END LOOP;
  IF denied<>52 THEN RAISE EXCEPTION 'Expected 52 denied operations, got %',denied; END IF;
END $verify$;
