-- 47 synthetic checks, reusable on PostgreSQL and PGlite. No legacy reads.
-- The VP999 exception rolls back this entire inner block, including fixtures.
DO $tests$
BEGIN
  BEGIN
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

-- only unexpired sessions active
IF NOT ((SELECT count(*)=1 FROM vita_pilot.active_sessions WHERE learner_id='10000000-0000-4000-8000-000000000001')) THEN RAISE EXCEPTION 'only unexpired sessions active'; END IF;
-- expired and future grants inactive
IF NOT ((SELECT count(*)=1 FROM vita_pilot.active_entitlements WHERE learner_id='10000000-0000-4000-8000-000000000001')) THEN RAISE EXCEPTION 'expired and future grants inactive'; END IF;
-- application scope
BEGIN
  INSERT INTO vita_pilot.learners(app_id) VALUES ('another-app');
  RAISE EXCEPTION 'Expected rejection: application scope';
EXCEPTION WHEN SQLSTATE '23514' THEN NULL; END;
-- environment scope
BEGIN
  INSERT INTO vita_pilot.learners(environment) VALUES ('production');
  RAISE EXCEPTION 'Expected rejection: environment scope';
EXCEPTION WHEN SQLSTATE '23514' THEN NULL; END;
-- snapshot schema
BEGIN
  INSERT INTO vita_pilot.learners(state_snapshot) VALUES ('{"schema":3}');
  RAISE EXCEPTION 'Expected rejection: snapshot schema';
EXCEPTION WHEN SQLSTATE '23514' THEN NULL; END;
-- snapshot array
BEGIN
  INSERT INTO vita_pilot.learners(state_snapshot) VALUES ('[]');
  RAISE EXCEPTION 'Expected rejection: snapshot array';
EXCEPTION WHEN SQLSTATE '23514' THEN NULL; END;
-- snapshot missing version
BEGIN
  INSERT INTO vita_pilot.learners(state_snapshot) VALUES ('{}');
  RAISE EXCEPTION 'Expected rejection: snapshot missing version';
EXCEPTION WHEN SQLSTATE '23514' THEN NULL; END;
-- snapshot size
BEGIN
  INSERT INTO vita_pilot.learners(state_snapshot) VALUES (jsonb_build_object('schema',2,'draft',repeat('x',2097152)));
  RAISE EXCEPTION 'Expected rejection: snapshot size';
EXCEPTION WHEN SQLSTATE '23514' THEN NULL; END;
-- separate admin authority
BEGIN
  INSERT INTO vita_pilot.activation_codes(code_hash,hash_key_version,created_by_admin_id,expires_at) VALUES (decode(repeat('e',64),'hex'),1,'10000000-0000-4000-8000-000000000001',clock_timestamp()+interval '1 day');
  RAISE EXCEPTION 'Expected rejection: separate admin authority';
EXCEPTION WHEN SQLSTATE '23514' THEN NULL; END;
-- hash length
BEGIN
  INSERT INTO vita_pilot.activation_codes(code_hash,hash_key_version,created_by_admin_id,expires_at) VALUES (decode('aa','hex'),1,'20000000-0000-4000-8000-000000000001',clock_timestamp()+interval '1 day');
  RAISE EXCEPTION 'Expected rejection: hash length';
EXCEPTION WHEN SQLSTATE '23514' THEN NULL; END;
-- duplicate code hash
BEGIN
  INSERT INTO vita_pilot.activation_codes(code_hash,hash_key_version,created_by_admin_id,expires_at) VALUES (decode(repeat('a',64),'hex'),1,'20000000-0000-4000-8000-000000000001',clock_timestamp()+interval '1 day');
  RAISE EXCEPTION 'Expected rejection: duplicate code hash';
EXCEPTION WHEN SQLSTATE '23505' THEN NULL; END;
-- duplicate token hash
BEGIN
  INSERT INTO vita_pilot.sessions(learner_id,token_hash,hash_key_version,expires_at) VALUES ('10000000-0000-4000-8000-000000000001',decode(repeat('c',64),'hex'),1,clock_timestamp()+interval '1 day');
  RAISE EXCEPTION 'Expected rejection: duplicate token hash';
EXCEPTION WHEN SQLSTATE '23505' THEN NULL; END;
-- expired code cannot redeem
BEGIN
  UPDATE vita_pilot.activation_codes SET redeemed_by='10000000-0000-4000-8000-000000000001',redeemed_at=clock_timestamp() WHERE id='30000000-0000-4000-8000-000000000002';
  RAISE EXCEPTION 'Expected rejection: expired code cannot redeem';
EXCEPTION WHEN SQLSTATE '23514' THEN NULL; END;
-- claim once
UPDATE vita_pilot.activation_codes SET redeemed_by='10000000-0000-4000-8000-000000000001',redeemed_at=clock_timestamp() WHERE id='30000000-0000-4000-8000-000000000001' AND redeemed_at IS NULL AND revoked_at IS NULL AND expires_at>clock_timestamp();
IF NOT FOUND THEN RAISE EXCEPTION 'Synthetic claim failed'; END IF;
UPDATE vita_pilot.activation_codes SET redeemed_by='10000000-0000-4000-8000-000000000002',redeemed_at=clock_timestamp() WHERE id='30000000-0000-4000-8000-000000000001' AND redeemed_at IS NULL AND revoked_at IS NULL AND expires_at>clock_timestamp();
IF FOUND THEN RAISE EXCEPTION 'Duplicate conditional claim succeeded'; END IF;
-- redeemed code immutable
BEGIN
  UPDATE vita_pilot.activation_codes SET redeemed_by='10000000-0000-4000-8000-000000000002' WHERE id='30000000-0000-4000-8000-000000000001';
  RAISE EXCEPTION 'Expected rejection: redeemed code immutable';
EXCEPTION WHEN SQLSTATE '23514' THEN NULL; END;
-- entitlement cannot cross learners
BEGIN
  INSERT INTO vita_pilot.entitlements(learner_id,entitlement_key,grant_reference,created_by_admin_id,activation_code_id) VALUES ('10000000-0000-4000-8000-000000000002','course_access','51000000-0000-4000-8000-000000000004','20000000-0000-4000-8000-000000000001','30000000-0000-4000-8000-000000000001');
  RAISE EXCEPTION 'Expected rejection: entitlement cannot cross learners';
EXCEPTION WHEN SQLSTATE '23503' THEN NULL; END;
-- duplicate grant reference
BEGIN
  INSERT INTO vita_pilot.entitlements(learner_id,entitlement_key,grant_reference,created_by_admin_id) VALUES ('10000000-0000-4000-8000-000000000001','course_access','51000000-0000-4000-8000-000000000001','20000000-0000-4000-8000-000000000001');
  RAISE EXCEPTION 'Expected rejection: duplicate grant reference';
EXCEPTION WHEN SQLSTATE '23505' THEN NULL; END;
-- missing progress learner
BEGIN
  INSERT INTO vita_pilot.learner_progress(learner_id,lesson_id,state) VALUES ('10000000-0000-4000-8000-000000000099','a1-u01-l1','{}');
  RAISE EXCEPTION 'Expected rejection: missing progress learner';
EXCEPTION WHEN SQLSTATE '23503' THEN NULL; END;
-- no unauthenticated CAS
BEGIN
  PERFORM vita_pilot.write_lesson_progress('10000000-0000-4000-8000-000000000001','a1-u01-l1','{}',0);
  RAISE EXCEPTION 'Expected rejection: no unauthenticated CAS';
EXCEPTION WHEN SQLSTATE '42501' THEN NULL; END;
-- trusted request context
PERFORM set_config('vita_pilot.app_id','vita-reale-arabic',true);
PERFORM set_config('vita_pilot.environment','pilot',true);
PERFORM set_config('vita_pilot.learner_id','10000000-0000-4000-8000-000000000001',true);
-- no other learner CAS
BEGIN
  PERFORM vita_pilot.write_lesson_progress('10000000-0000-4000-8000-000000000002','a1-u01-l1','{}',0);
  RAISE EXCEPTION 'Expected rejection: no other learner CAS';
EXCEPTION WHEN SQLSTATE '42501' THEN NULL; END;
-- create progress revision one
IF NOT (vita_pilot.write_lesson_progress('10000000-0000-4000-8000-000000000001','a1-u01-l1','{"draft":"synthetic"}',0)=1) THEN RAISE EXCEPTION 'create progress revision one'; END IF;
-- duplicate progress CAS
BEGIN
  PERFORM vita_pilot.write_lesson_progress('10000000-0000-4000-8000-000000000001','a1-u01-l1','{}',0);
  RAISE EXCEPTION 'Expected rejection: duplicate progress CAS';
EXCEPTION WHEN SQLSTATE '40001' THEN NULL; END;
-- update progress revision two
IF NOT (vita_pilot.write_lesson_progress('10000000-0000-4000-8000-000000000001','a1-u01-l1','{"draft":"synthetic_updated"}',1)=2) THEN RAISE EXCEPTION 'update progress revision two'; END IF;
-- stale progress revision
BEGIN
  PERFORM vita_pilot.write_lesson_progress('10000000-0000-4000-8000-000000000001','a1-u01-l1','{}',1);
  RAISE EXCEPTION 'Expected rejection: stale progress revision';
EXCEPTION WHEN SQLSTATE '40001' THEN NULL; END;
-- direct revision bypass
BEGIN
  UPDATE vita_pilot.learner_progress SET state='{}' WHERE learner_id='10000000-0000-4000-8000-000000000001';
  RAISE EXCEPTION 'Expected rejection: direct revision bypass';
EXCEPTION WHEN SQLSTATE '40001' THEN NULL; END;
-- invalid lesson id
BEGIN
  PERFORM vita_pilot.write_lesson_progress('10000000-0000-4000-8000-000000000001','../private','{}',0);
  RAISE EXCEPTION 'Expected rejection: invalid lesson id';
EXCEPTION WHEN SQLSTATE '23514' THEN NULL; END;
-- nonobject lesson state
BEGIN
  PERFORM vita_pilot.write_lesson_progress('10000000-0000-4000-8000-000000000001','a1-u01-l2','[]',0);
  RAISE EXCEPTION 'Expected rejection: nonobject lesson state';
EXCEPTION WHEN SQLSTATE '23514' THEN NULL; END;
-- oversized lesson state
BEGIN
  PERFORM vita_pilot.write_lesson_progress('10000000-0000-4000-8000-000000000001','a1-u01-l2',jsonb_build_object('draft',repeat('x',262144)),0);
  RAISE EXCEPTION 'Expected rejection: oversized lesson state';
EXCEPTION WHEN SQLSTATE '23514' THEN NULL; END;
-- snapshot CAS
IF NOT (vita_pilot.write_learner_state('10000000-0000-4000-8000-000000000001','{"schema":2,"settings":{"lang":"ar"}}',0)=1) THEN RAISE EXCEPTION 'snapshot CAS'; END IF;
-- stale snapshot CAS
BEGIN
  PERFORM vita_pilot.write_learner_state('10000000-0000-4000-8000-000000000001','{"schema":2}',0);
  RAISE EXCEPTION 'Expected rejection: stale snapshot CAS';
EXCEPTION WHEN SQLSTATE '40001' THEN NULL; END;
-- audit append only update
BEGIN
  UPDATE vita_pilot.admin_audit_log SET action='other.action';
  RAISE EXCEPTION 'Expected rejection: audit append only update';
EXCEPTION WHEN SQLSTATE '42501' THEN NULL; END;
-- audit append only delete
BEGIN
  DELETE FROM vita_pilot.admin_audit_log;
  RAISE EXCEPTION 'Expected rejection: audit append only delete';
EXCEPTION WHEN SQLSTATE '42501' THEN NULL; END;
-- audit forbids drafts
BEGIN
  INSERT INTO vita_pilot.admin_audit_log(actor_admin_id,action,target_kind,target_id,metadata) VALUES ('20000000-0000-4000-8000-000000000001','synthetic.verify','learner','10000000-0000-4000-8000-000000000001','{"draft":"not_allowed"}');
  RAISE EXCEPTION 'Expected rejection: audit forbids drafts';
EXCEPTION WHEN SQLSTATE '23514' THEN NULL; END;
-- audit requires actual admin
BEGIN
  INSERT INTO vita_pilot.admin_audit_log(actor_admin_id,action,target_kind,target_id) VALUES ('10000000-0000-4000-8000-000000000001','synthetic.verify','learner','10000000-0000-4000-8000-000000000001');
  RAISE EXCEPTION 'Expected rejection: audit requires actual admin';
EXCEPTION WHEN SQLSTATE '23503' THEN NULL; END;
-- revoke synthetic access
UPDATE vita_pilot.sessions SET revoked_at=clock_timestamp() WHERE learner_id='10000000-0000-4000-8000-000000000001';
UPDATE vita_pilot.entitlements SET revoked_at=clock_timestamp() WHERE learner_id='10000000-0000-4000-8000-000000000001';
-- revoked access absent
IF NOT (NOT EXISTS(SELECT 1 FROM vita_pilot.active_sessions WHERE learner_id='10000000-0000-4000-8000-000000000001') AND NOT EXISTS(SELECT 1 FROM vita_pilot.active_entitlements WHERE learner_id='10000000-0000-4000-8000-000000000001')) THEN RAISE EXCEPTION 'revoked access absent'; END IF;
-- session resurrection
BEGIN
  UPDATE vita_pilot.sessions SET revoked_at=NULL WHERE learner_id='10000000-0000-4000-8000-000000000001';
  RAISE EXCEPTION 'Expected rejection: session resurrection';
EXCEPTION WHEN SQLSTATE '23514' THEN NULL; END;
-- entitlement resurrection
BEGIN
  UPDATE vita_pilot.entitlements SET revoked_at=NULL WHERE learner_id='10000000-0000-4000-8000-000000000001';
  RAISE EXCEPTION 'Expected rejection: entitlement resurrection';
EXCEPTION WHEN SQLSTATE '23514' THEN NULL; END;
-- credential lifetime immutable
BEGIN
  UPDATE vita_pilot.sessions SET expires_at=expires_at+interval '1 day' WHERE learner_id='10000000-0000-4000-8000-000000000001';
  RAISE EXCEPTION 'Expected rejection: credential lifetime immutable';
EXCEPTION WHEN SQLSTATE '23514' THEN NULL; END;
-- revoke admin
UPDATE vita_pilot.admin_principals SET revoked_at=clock_timestamp() WHERE id='20000000-0000-4000-8000-000000000001';
-- revoked admin cannot grant
BEGIN
  INSERT INTO vita_pilot.entitlements(learner_id,entitlement_key,grant_reference,created_by_admin_id) VALUES ('10000000-0000-4000-8000-000000000001','course_access','51000000-0000-4000-8000-000000000005','20000000-0000-4000-8000-000000000001');
  RAISE EXCEPTION 'Expected rejection: revoked admin cannot grant';
EXCEPTION WHEN SQLSTATE '23514' THEN NULL; END;
-- disable learner
UPDATE vita_pilot.learners SET disabled_at=clock_timestamp(),revision=revision+1 WHERE id='10000000-0000-4000-8000-000000000001';
-- disabled learner cannot write
BEGIN
  PERFORM vita_pilot.write_lesson_progress('10000000-0000-4000-8000-000000000001','a1-u01-l2','{}',0);
  RAISE EXCEPTION 'Expected rejection: disabled learner cannot write';
EXCEPTION WHEN SQLSTATE '42501' THEN NULL; END;
-- disabled learner cannot create session
BEGIN
  INSERT INTO vita_pilot.sessions(learner_id,token_hash,hash_key_version,expires_at) VALUES ('10000000-0000-4000-8000-000000000001',decode(repeat('e',64),'hex'),1,clock_timestamp()+interval '1 day');
  RAISE EXCEPTION 'Expected rejection: disabled learner cannot create session';
EXCEPTION WHEN SQLSTATE '23514' THEN NULL; END;
-- disabled learner cannot restore
BEGIN
  UPDATE vita_pilot.learners SET disabled_at=NULL,revision=revision+1 WHERE id='10000000-0000-4000-8000-000000000001';
  RAISE EXCEPTION 'Expected rejection: disabled learner cannot restore';
EXCEPTION WHEN SQLSTATE '23514' THEN NULL; END;
-- other learner unaffected
IF NOT ((SELECT revision=0 AND state_snapshot='{"schema":2}'::jsonb FROM vita_pilot.learners WHERE id='10000000-0000-4000-8000-000000000002')) THEN RAISE EXCEPTION 'other learner unaffected'; END IF;
    RAISE EXCEPTION 'Synthetic verification complete; rollback fixtures' USING ERRCODE='VP999';
  EXCEPTION WHEN SQLSTATE 'VP999' THEN NULL;
  END;
END $tests$;
