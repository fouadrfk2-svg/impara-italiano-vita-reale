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
