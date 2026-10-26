-- Synthetic-only, operator-executed rollback fixture; tests SQL behavior, not runtime authentication.
-- Effective-role/API denial tests run separately; this fixture never changes role membership.
-- No legacy schema, customer identity or real credential is referenced.
DO $fixture$
DECLARE admin uuid:='20000000-0000-4000-8000-000000000099'; learner uuid; first_id uuid; result jsonb; checks integer:=0;
BEGIN
 BEGIN
  INSERT INTO vita_pilot.admin_principals(id) VALUES(admin);
  INSERT INTO vita_pilot.admin_credentials(admin_id,credential_hash,expires_at,enabled)
  VALUES(admin,decode(repeat('1',64),'hex'),clock_timestamp()+interval '1 day',true);
  GRANT EXECUTE ON FUNCTION vita_pilot.account_request(text,jsonb) TO vita_pilot_app;
  IF NOT has_function_privilege('vita_pilot_app','vita_pilot.account_request(text,jsonb)','EXECUTE') THEN RAISE EXCEPTION 'Transactional test grant missing'; END IF;
  result:=vita_pilot.account_request('admin_login',jsonb_build_object('credential',repeat('1',64),'global',repeat('2',64),'bucket',repeat('3',64),'newToken',repeat('4',64)));
  IF result->'authenticated' IS DISTINCT FROM 'true'::jsonb THEN RAISE EXCEPTION 'Synthetic Admin login failed'; END IF; checks:=checks+1;
  result:=vita_pilot.account_request('admin_issue',jsonb_build_object('token',repeat('4',64),'credential',repeat('5',64),'requestId','30000000-0000-4000-8000-000000000099','codeExpiresAt',clock_timestamp()+interval '1 day','accessExpiresAt',clock_timestamp()+interval '2 days'));
  IF result->'ok' IS DISTINCT FROM 'true'::jsonb THEN RAISE EXCEPTION 'Synthetic issuance failed'; END IF; checks:=checks+1;
  result:=vita_pilot.account_request('redeem',jsonb_build_object('credential',repeat('5',64),'global',repeat('2',64),'bucket',repeat('6',64),'newToken',repeat('7',64)));
  learner:=(result->>'learnerId')::uuid;first_id:=learner;
  IF learner IS NULL THEN RAISE EXCEPTION 'Synthetic learner login failed'; END IF; checks:=checks+1;
  result:=vita_pilot.account_request('progress_save',jsonb_build_object('token',repeat('7',64),'expectedLearner',learner,'revision',0,'state','{"schema":2,"lessons":{"a1-u01-l1":{"score":8,"total":9,"best":0.8888888888888888,"done":true,"attempts":1}},"writing":{"synthetic":{"text":"Bozza fittizia."}},"srs":{"ciao":{"it":"ciao","tr":{"ar":"مرحبا"},"due":123}}}'::jsonb));
  IF result->'revision' IS DISTINCT FROM '1'::jsonb THEN RAISE EXCEPTION 'Synthetic save failed'; END IF; checks:=checks+1;
  result:=vita_pilot.account_request('progress_save',jsonb_build_object('token',repeat('7',64),'expectedLearner',learner,'revision',0,'state','{"schema":2}'::jsonb));
  IF result->'conflict' IS DISTINCT FROM 'true'::jsonb THEN RAISE EXCEPTION 'Stale revision accepted'; END IF; checks:=checks+1;
  PERFORM vita_pilot.account_request('logout',jsonb_build_object('token',repeat('7',64)));
  BEGIN PERFORM vita_pilot.account_request('progress_read',jsonb_build_object('token',repeat('7',64),'expectedLearner',learner));RAISE EXCEPTION 'Revoked session accepted';EXCEPTION WHEN insufficient_privilege THEN checks:=checks+1;END;
  result:=vita_pilot.account_request('redeem',jsonb_build_object('credential',repeat('5',64),'global',repeat('2',64),'bucket',repeat('6',64),'newToken',repeat('8',64)));
  learner:=(result->>'learnerId')::uuid;
  IF learner IS DISTINCT FROM first_id THEN RAISE EXCEPTION 'Duplicate learner'; END IF; checks:=checks+1;
  result:=vita_pilot.account_request('progress_read',jsonb_build_object('token',repeat('8',64),'expectedLearner',learner));
  IF result#>>'{state,writing,synthetic,text}' IS DISTINCT FROM 'Bozza fittizia.' OR result#>>'{state,lessons,a1-u01-l1,score}' IS DISTINCT FROM '8' THEN RAISE EXCEPTION 'Second-session restoration failed'; END IF; checks:=checks+1;
  BEGIN PERFORM vita_pilot.account_request('admin_list',jsonb_build_object('token',repeat('8',64)));RAISE EXCEPTION 'Learner received Admin authority';EXCEPTION WHEN insufficient_privilege THEN checks:=checks+1;END;
  BEGIN PERFORM vita_pilot.account_request('progress_read',jsonb_build_object('token',repeat('8',64),'expectedLearner','10000000-0000-4000-8000-000000000099'));RAISE EXCEPTION 'Cross-learner access accepted';EXCEPTION WHEN insufficient_privilege THEN checks:=checks+1;END;
  PERFORM vita_pilot.account_request('admin_revoke_access',jsonb_build_object('token',repeat('4',64),'id',learner,'requestId','30000000-0000-4000-8000-000000000098'));
  BEGIN PERFORM vita_pilot.account_request('progress_read',jsonb_build_object('token',repeat('8',64),'expectedLearner',learner));RAISE EXCEPTION 'Revoked entitlement accepted';EXCEPTION WHEN insufficient_privilege THEN checks:=checks+1;END;
  result:=vita_pilot.account_request('redeem',jsonb_build_object('credential',repeat('5',64),'global',repeat('2',64),'bucket',repeat('6',64),'newToken',repeat('9',64)));
  IF result->'authenticated' IS DISTINCT FROM 'false'::jsonb THEN RAISE EXCEPTION 'Revoked access reactivated'; END IF; checks:=checks+1;
  IF checks<>12 THEN RAISE EXCEPTION 'Expected twelve checks'; END IF;
  RAISE EXCEPTION 'Rollback synthetic account fixture' USING ERRCODE='VP999';
 EXCEPTION WHEN SQLSTATE 'VP999' THEN NULL;
 END;
 IF checks<>12 OR EXISTS(SELECT 1 FROM vita_pilot.admin_principals WHERE id=admin) OR EXISTS(SELECT 1 FROM vita_pilot.learners WHERE id=first_id) THEN RAISE EXCEPTION 'Synthetic fixture not rolled back'; END IF;
 IF has_function_privilege('vita_pilot_app','vita_pilot.account_request(text,jsonb)','EXECUTE') THEN RAISE EXCEPTION 'Rollout grant escaped rollback'; END IF;
END $fixture$;
