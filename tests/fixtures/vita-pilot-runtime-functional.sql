-- 17 live-compatible data-function assertions. Synthetic only, always rolled back.
-- Owner seeds the fixture; runtime permissions are tested separately on a real login.
DO $checks$ BEGIN BEGIN
-- SYNTHETIC ONLY. Run in a rollback transaction; never provision access with these hashes.
INSERT INTO vita_pilot.learners(id) VALUES ('10000000-0000-4000-8000-000000000001'),('10000000-0000-4000-8000-000000000002'),('10000000-0000-4000-8000-000000000003');
INSERT INTO vita_pilot.admin_principals(id) VALUES ('20000000-0000-4000-8000-000000000001');
INSERT INTO vita_pilot.activation_codes(id,code_hash,hash_key_version,created_by_admin_id,created_at,expires_at)
VALUES ('30000000-0000-4000-8000-000000000001',decode(repeat('a',64),'hex'),1,'20000000-0000-4000-8000-000000000001',statement_timestamp()-interval '2 days',statement_timestamp()+interval '1 day'),
('30000000-0000-4000-8000-000000000002',decode(repeat('b',64),'hex'),1,'20000000-0000-4000-8000-000000000001',statement_timestamp()-interval '2 days',statement_timestamp()-interval '1 day');
INSERT INTO vita_pilot.sessions(id,learner_id,token_hash,hash_key_version,created_at,expires_at)
VALUES ('40000000-0000-4000-8000-000000000001','10000000-0000-4000-8000-000000000001',decode(repeat('c',64),'hex'),1,statement_timestamp()-interval '2 days',statement_timestamp()+interval '1 day'),
('40000000-0000-4000-8000-000000000002','10000000-0000-4000-8000-000000000001',decode(repeat('d',64),'hex'),1,statement_timestamp()-interval '2 days',statement_timestamp()-interval '1 day');
INSERT INTO vita_pilot.entitlements(id,learner_id,entitlement_key,grant_reference,created_by_admin_id,created_at,starts_at,expires_at)
VALUES ('50000000-0000-4000-8000-000000000001','10000000-0000-4000-8000-000000000001','course_access','51000000-0000-4000-8000-000000000001','20000000-0000-4000-8000-000000000001',statement_timestamp()-interval '2 days',statement_timestamp()-interval '2 days',NULL),
('50000000-0000-4000-8000-000000000002','10000000-0000-4000-8000-000000000001','course_access','51000000-0000-4000-8000-000000000002','20000000-0000-4000-8000-000000000001',statement_timestamp()-interval '2 days',statement_timestamp()-interval '2 days',statement_timestamp()-interval '1 day'),
('50000000-0000-4000-8000-000000000003','10000000-0000-4000-8000-000000000001','course_access','51000000-0000-4000-8000-000000000003','20000000-0000-4000-8000-000000000001',statement_timestamp()-interval '2 days',statement_timestamp()+interval '1 day',NULL);
INSERT INTO vita_pilot.admin_audit_log(id,actor_admin_id,subject_learner_id,action,target_kind,target_id,metadata)
VALUES ('60000000-0000-4000-8000-000000000001','20000000-0000-4000-8000-000000000001','10000000-0000-4000-8000-000000000001','synthetic.verify','learner','10000000-0000-4000-8000-000000000001','{"reason_code":"synthetic_test"}');

INSERT INTO vita_pilot.sessions(learner_id,token_hash,hash_key_version,expires_at) VALUES ('10000000-0000-4000-8000-000000000002',decode(repeat('e',64),'hex'),1,clock_timestamp()+interval '1 day');
INSERT INTO vita_pilot.entitlements(learner_id,entitlement_key,grant_reference,created_by_admin_id) VALUES ('10000000-0000-4000-8000-000000000002','course_access','51000000-0000-4000-8000-000000000006','20000000-0000-4000-8000-000000000001');
UPDATE vita_pilot.learners SET state_snapshot=jsonb_build_object('schema',2,'owner',CASE WHEN id='10000000-0000-4000-8000-000000000001' THEN 'synthetic_a' ELSE 'synthetic_b' END),revision=revision+1 WHERE id IN ('10000000-0000-4000-8000-000000000001','10000000-0000-4000-8000-000000000002');
INSERT INTO vita_pilot.learner_progress(learner_id,lesson_id,state) VALUES ('10000000-0000-4000-8000-000000000001','a1-u01-l1','{"owner":"synthetic_a"}'),('10000000-0000-4000-8000-000000000002','a1-u01-l1','{"owner":"synthetic_b"}');
PERFORM set_config('vita_pilot.learner_id','10000000-0000-4000-8000-000000000002',true),set_config('vita_pilot.app_id','other',true),set_config('vita_pilot.environment','production',true);
-- proof A snapshot
IF NOT (vita_pilot.read_my_state(decode(repeat('c',64),'hex'),1::smallint)->'state'->>'owner'='synthetic_a') THEN RAISE EXCEPTION 'proof A snapshot'; END IF;
-- proof B snapshot
IF NOT (vita_pilot.read_my_state(decode(repeat('e',64),'hex'),1::smallint)->'state'->>'owner'='synthetic_b') THEN RAISE EXCEPTION 'proof B snapshot'; END IF;
-- proof A lesson
IF NOT (vita_pilot.read_my_lesson_progress(decode(repeat('c',64),'hex'),1::smallint,'a1-u01-l1')->'state'->>'owner'='synthetic_a') THEN RAISE EXCEPTION 'proof A lesson'; END IF;
-- proof B lesson
IF NOT (vita_pilot.read_my_lesson_progress(decode(repeat('e',64),'hex'),1::smallint,'a1-u01-l1')->'state'->>'owner'='synthetic_b') THEN RAISE EXCEPTION 'proof B lesson'; END IF;
-- snapshot update
IF NOT (vita_pilot.save_my_state(decode(repeat('c',64),'hex'),1::smallint,'{"schema":2,"draft":"synthetic"}',1)=2) THEN RAISE EXCEPTION 'snapshot update'; END IF;
-- context restored
IF NOT (current_setting('vita_pilot.learner_id')='10000000-0000-4000-8000-000000000002' AND current_setting('vita_pilot.environment')='production' AND current_setting('vita_pilot.app_id')='other') THEN RAISE EXCEPTION 'context restored'; END IF;
-- other learner preserved
IF NOT (vita_pilot.read_my_state(decode(repeat('e',64),'hex'),1::smallint)->'state'->>'owner'='synthetic_b') THEN RAISE EXCEPTION 'other learner preserved'; END IF;
-- stale snapshot
BEGIN PERFORM vita_pilot.save_my_state(decode(repeat('c',64),'hex'),1::smallint,'{"schema":2}',1); RAISE EXCEPTION 'Unexpected success: stale snapshot'; EXCEPTION WHEN SQLSTATE '40001' THEN NULL; END;
-- lesson update
IF NOT (vita_pilot.save_my_lesson_progress(decode(repeat('c',64),'hex'),1::smallint,'a1-u01-l1','{"owner":"updated_a"}',1)=2) THEN RAISE EXCEPTION 'lesson update'; END IF;
-- other learner lesson preserved
IF NOT (vita_pilot.read_my_lesson_progress(decode(repeat('e',64),'hex'),1::smallint,'a1-u01-l1')->'state'->>'owner'='synthetic_b') THEN RAISE EXCEPTION 'other learner lesson preserved'; END IF;
-- stale lesson
BEGIN PERFORM vita_pilot.save_my_lesson_progress(decode(repeat('c',64),'hex'),1::smallint,'a1-u01-l1','{}',1); RAISE EXCEPTION 'Unexpected success: stale lesson'; EXCEPTION WHEN SQLSTATE '40001' THEN NULL; END;
-- independent lesson creation
IF NOT (vita_pilot.save_my_lesson_progress(decode(repeat('c',64),'hex'),1::smallint,'a1-u01-l2','{}',0)=1) THEN RAISE EXCEPTION 'independent lesson creation'; END IF;
-- invalid state schema
BEGIN PERFORM vita_pilot.save_my_state(decode(repeat('c',64),'hex'),1::smallint,'{"schema":3}',2); RAISE EXCEPTION 'Unexpected success: invalid state schema'; EXCEPTION WHEN SQLSTATE '23514' THEN NULL; END;
-- untrusted missing proof
BEGIN PERFORM vita_pilot.read_my_state(decode(repeat('0',64),'hex'),1::smallint); RAISE EXCEPTION 'Unexpected success: untrusted missing proof'; EXCEPTION WHEN SQLSTATE '42501' THEN NULL; END;
-- expired session proof
BEGIN PERFORM vita_pilot.read_my_state(decode(repeat('d',64),'hex'),1::smallint); RAISE EXCEPTION 'Unexpected success: expired session proof'; EXCEPTION WHEN SQLSTATE '42501' THEN NULL; END;
UPDATE vita_pilot.entitlements SET revoked_at=clock_timestamp() WHERE id='50000000-0000-4000-8000-000000000001';
-- revocation despite future and expired grants
BEGIN PERFORM vita_pilot.read_my_state(decode(repeat('c',64),'hex'),1::smallint); RAISE EXCEPTION 'Unexpected success: revocation despite future and expired grants'; EXCEPTION WHEN SQLSTATE '42501' THEN NULL; END;
-- other learner still active
IF NOT (vita_pilot.read_my_state(decode(repeat('e',64),'hex'),1::smallint)->'state'->>'owner'='synthetic_b') THEN RAISE EXCEPTION 'other learner still active'; END IF;
RAISE EXCEPTION 'Synthetic verification complete; rollback fixtures' USING ERRCODE='VP999';
EXCEPTION WHEN SQLSTATE 'VP999' THEN NULL; END; END $checks$;
