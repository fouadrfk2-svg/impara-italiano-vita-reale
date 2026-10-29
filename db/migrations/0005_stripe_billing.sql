-- Additive Stripe billing foundation. Applies only after explicit migration-target verification.
DO $migration$
DECLARE expected_checksum constant text := '296307bc08531b87b57b2980efdffbcda1a065ab7ac385497c1b9ccae20938c9';
BEGIN
  IF current_setting('vita_pilot.migration_target',true) IS DISTINCT FROM 'vita-reale-arabic-pilot' THEN RAISE EXCEPTION 'Verified isolated migration target required' USING ERRCODE='42501'; END IF;
  PERFORM pg_advisory_xact_lock(741956,1);
  PERFORM set_config('lock_timeout','5s',true);
  IF NOT EXISTS(SELECT 1 FROM vita_pilot.schema_migrations WHERE version='0004' AND checksum='9d759afbe3adaf3ae1a4eee1d98a9c83a355b06021b1169de09c1fc74d8cd464') THEN RAISE EXCEPTION 'Verified 0004 required'; END IF;
  IF EXISTS(SELECT 1 FROM vita_pilot.schema_migrations WHERE version='0005' AND checksum<>expected_checksum) THEN RAISE EXCEPTION 'Migration checksum mismatch'; END IF;
  IF EXISTS(SELECT 1 FROM vita_pilot.schema_migrations WHERE version='0005') THEN RETURN; END IF;

CREATE TABLE vita_pilot.billing_email_links (
 email_hash bytea PRIMARY KEY CHECK(octet_length(email_hash)=32), learner_id uuid NOT NULL UNIQUE REFERENCES vita_pilot.learners(id) ON DELETE RESTRICT,
 created_at timestamptz NOT NULL DEFAULT clock_timestamp(), updated_at timestamptz NOT NULL DEFAULT clock_timestamp()
);
CREATE TABLE vita_pilot.billing_email_challenges (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), email_hash bytea NOT NULL CHECK(octet_length(email_hash)=32),
 purpose text NOT NULL CHECK(purpose IN('access','bind')), code_hash bytea NOT NULL CHECK(octet_length(code_hash)=32),
 attempts smallint NOT NULL DEFAULT 0 CHECK(attempts BETWEEN 0 AND 8), created_at timestamptz NOT NULL DEFAULT clock_timestamp(),
 expires_at timestamptz NOT NULL, consumed_at timestamptz, CHECK(expires_at>created_at AND expires_at<=created_at+interval '16 minutes')
);
CREATE INDEX billing_email_challenges_lookup ON vita_pilot.billing_email_challenges(email_hash,purpose,created_at DESC) WHERE consumed_at IS NULL;
CREATE TABLE vita_pilot.billing_sessions (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), token_hash bytea NOT NULL UNIQUE CHECK(octet_length(token_hash)=32),
 learner_id uuid NOT NULL REFERENCES vita_pilot.learners(id) ON DELETE RESTRICT, email_hash bytea NOT NULL CHECK(octet_length(email_hash)=32),
 created_at timestamptz NOT NULL DEFAULT clock_timestamp(), expires_at timestamptz NOT NULL, revoked_at timestamptz,
 CHECK(expires_at>created_at AND expires_at<=created_at+interval '31 minutes')
);
CREATE INDEX billing_sessions_active ON vita_pilot.billing_sessions(learner_id,expires_at) WHERE revoked_at IS NULL;
CREATE TABLE vita_pilot.billing_rate_limits (
 kind text NOT NULL CHECK(kind IN('email','ip','verify','checkout')), bucket bytea NOT NULL CHECK(octet_length(bucket)=32),
 window_started timestamptz NOT NULL, hits integer NOT NULL CHECK(hits>0), PRIMARY KEY(kind,bucket)
);
CREATE TABLE vita_pilot.stripe_customers (
 learner_id uuid PRIMARY KEY REFERENCES vita_pilot.learners(id) ON DELETE RESTRICT,
 customer_id text NOT NULL UNIQUE CHECK(customer_id ~ '^cus_[A-Za-z0-9]+$'), email_hash bytea NOT NULL CHECK(octet_length(email_hash)=32),
 created_at timestamptz NOT NULL DEFAULT clock_timestamp(), updated_at timestamptz NOT NULL DEFAULT clock_timestamp()
);
CREATE TABLE vita_pilot.stripe_checkout_intents (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), learner_id uuid NOT NULL REFERENCES vita_pilot.learners(id) ON DELETE RESTRICT,
 request_id uuid NOT NULL, email_hash bytea NOT NULL CHECK(octet_length(email_hash)=32), customer_id text REFERENCES vita_pilot.stripe_customers(customer_id) ON DELETE RESTRICT,
 checkout_session_id text UNIQUE CHECK(checkout_session_id IS NULL OR checkout_session_id ~ '^cs_[A-Za-z0-9_]+$'),
 created_at timestamptz NOT NULL DEFAULT clock_timestamp(), expires_at timestamptz NOT NULL,
 UNIQUE(learner_id,request_id), CHECK(expires_at>created_at AND expires_at<=created_at+interval '2 hours')
);
CREATE TABLE vita_pilot.stripe_webhook_events (
 event_id text PRIMARY KEY CHECK(event_id ~ '^evt_[A-Za-z0-9]+$'), event_type text NOT NULL CHECK(length(event_type)<=100),
 event_created bigint NOT NULL CHECK(event_created>0), processed_at timestamptz NOT NULL DEFAULT clock_timestamp()
);
CREATE TABLE vita_pilot.stripe_subscriptions (
 subscription_id text PRIMARY KEY CHECK(subscription_id ~ '^sub_[A-Za-z0-9]+$'), customer_id text NOT NULL REFERENCES vita_pilot.stripe_customers(customer_id) ON DELETE RESTRICT,
 learner_id uuid NOT NULL REFERENCES vita_pilot.learners(id) ON DELETE RESTRICT,
 product_id text NOT NULL CHECK(product_id ~ '^prod_[A-Za-z0-9]+$'), price_id text NOT NULL CHECK(price_id ~ '^price_[A-Za-z0-9]+$'),
 status text NOT NULL CHECK(status IN('incomplete','incomplete_expired','trialing','active','past_due','canceled','unpaid','paused')),
 current_period_end timestamptz NOT NULL, cancel_at_period_end boolean NOT NULL DEFAULT false, cancel_at timestamptz,
 risk_hold boolean NOT NULL DEFAULT false, latest_event_created bigint NOT NULL CHECK(latest_event_created>0),
 created_at timestamptz NOT NULL DEFAULT clock_timestamp(), updated_at timestamptz NOT NULL DEFAULT clock_timestamp(),
 CHECK(cancel_at IS NULL OR cancel_at>=created_at)
);
CREATE INDEX stripe_subscriptions_learner ON vita_pilot.stripe_subscriptions(learner_id,current_period_end DESC);
CREATE TABLE vita_pilot.stripe_event_risk_holds (
 event_id text PRIMARY KEY CHECK(event_id ~ '^evt_[A-Za-z0-9]+$'), risk_id text NOT NULL, customer_id text NOT NULL REFERENCES vita_pilot.stripe_customers(customer_id) ON DELETE RESTRICT,
 created_at timestamptz NOT NULL DEFAULT clock_timestamp(), resolved_at timestamptz, UNIQUE(risk_id,customer_id)
);

ALTER TABLE vita_pilot.billing_email_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE vita_pilot.billing_email_challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE vita_pilot.billing_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE vita_pilot.billing_rate_limits ENABLE ROW LEVEL SECURITY;
ALTER TABLE vita_pilot.stripe_customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE vita_pilot.stripe_checkout_intents ENABLE ROW LEVEL SECURITY;
ALTER TABLE vita_pilot.stripe_webhook_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE vita_pilot.stripe_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE vita_pilot.stripe_event_risk_holds ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON ALL TABLES IN SCHEMA vita_pilot FROM PUBLIC,vita_pilot_app;

CREATE OR REPLACE FUNCTION vita_pilot.session_learner(p_token_hash bytea,p_key_version smallint)
RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path=pg_catalog,vita_pilot AS $fn$
DECLARE learner uuid;
BEGIN
 IF p_token_hash IS NULL OR octet_length(p_token_hash)<>32 OR p_key_version IS NULL OR p_key_version<1 THEN RAISE EXCEPTION 'Access denied' USING ERRCODE='42501'; END IF;
 SELECT s.learner_id INTO learner FROM vita_pilot.sessions s JOIN vita_pilot.learners l ON (l.app_id,l.environment,l.id)=(s.app_id,s.environment,s.learner_id)
 WHERE s.app_id='vita-reale-arabic' AND s.environment='pilot' AND s.token_hash=p_token_hash AND s.hash_key_version=p_key_version AND s.revoked_at IS NULL AND s.expires_at>clock_timestamp() AND l.disabled_at IS NULL FOR SHARE OF s,l;
 IF learner IS NULL THEN RAISE EXCEPTION 'Access denied' USING ERRCODE='42501'; END IF;
 IF NOT EXISTS(SELECT 1 FROM vita_pilot.entitlements e WHERE e.app_id='vita-reale-arabic' AND e.environment='pilot' AND e.learner_id=learner AND e.entitlement_key='course_access' AND e.revoked_at IS NULL AND e.starts_at<=clock_timestamp() AND (e.expires_at IS NULL OR e.expires_at>clock_timestamp()))
 AND NOT EXISTS(SELECT 1 FROM vita_pilot.stripe_subscriptions s WHERE s.learner_id=learner AND NOT s.risk_hold AND ((s.status IN('active','trialing') AND s.current_period_end>clock_timestamp()) OR (s.status='past_due' AND s.current_period_end+interval '7 days'>clock_timestamp()))) THEN RAISE EXCEPTION 'Access denied' USING ERRCODE='42501'; END IF;
 RETURN learner;
END $fn$;

CREATE FUNCTION vita_pilot.billing_request(p_action text,p jsonb) RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path=pg_catalog,vita_pilot AS $fn$
DECLARE e bytea; h bytea; tok bytea; learner uuid; challenge vita_pilot.billing_email_challenges%ROWTYPE; b integer; ip_hits integer; intent uuid; checkout_session text; customer text; expires timestamptz; event_created bigint; prior bigint; subrow vita_pilot.stripe_subscriptions%ROWTYPE;
BEGIN
 IF p IS NULL OR jsonb_typeof(p)<>'object' OR octet_length(p::text)>8192 THEN RAISE EXCEPTION 'Invalid request' USING ERRCODE='22023'; END IF;
 IF p_action='otp_request' THEN
  e:=decode(p->>'emailHash','hex'); h:=decode(p->>'codeHash','hex');
  IF e IS NULL OR octet_length(e)<>32 OR h IS NULL OR octet_length(h)<>32 OR p->>'purpose' NOT IN('access','bind') THEN RAISE EXCEPTION 'Invalid request' USING ERRCODE='22023'; END IF;
  INSERT INTO vita_pilot.billing_rate_limits(kind,bucket,window_started,hits) VALUES('email',e,clock_timestamp(),1)
   ON CONFLICT(kind,bucket) DO UPDATE SET hits=CASE WHEN billing_rate_limits.window_started+interval '15 minutes'<=clock_timestamp() THEN 1 ELSE least(billing_rate_limits.hits+1,6) END,window_started=CASE WHEN billing_rate_limits.window_started+interval '15 minutes'<=clock_timestamp() THEN clock_timestamp() ELSE billing_rate_limits.window_started END RETURNING hits INTO b;
  h:=decode(p->>'ipHash','hex'); IF h IS NULL OR octet_length(h)<>32 THEN RAISE EXCEPTION 'Invalid request' USING ERRCODE='22023'; END IF;
  INSERT INTO vita_pilot.billing_rate_limits(kind,bucket,window_started,hits) VALUES('ip',h,clock_timestamp(),1)
   ON CONFLICT(kind,bucket) DO UPDATE SET hits=CASE WHEN billing_rate_limits.window_started+interval '15 minutes'<=clock_timestamp() THEN 1 ELSE least(billing_rate_limits.hits+1,30) END,window_started=CASE WHEN billing_rate_limits.window_started+interval '15 minutes'<=clock_timestamp() THEN clock_timestamp() ELSE billing_rate_limits.window_started END RETURNING hits INTO ip_hits;
  IF b>5 OR ip_hits>20 THEN RETURN '{"accepted":true,"delivery":false}'::jsonb; END IF;
  UPDATE vita_pilot.billing_email_challenges SET consumed_at=clock_timestamp() WHERE email_hash=e AND purpose=p->>'purpose' AND consumed_at IS NULL;
  INSERT INTO vita_pilot.billing_email_challenges(email_hash,purpose,code_hash,expires_at) VALUES(e,p->>'purpose',decode(p->>'codeHash','hex'),clock_timestamp()+interval '10 minutes');
  RETURN '{"accepted":true,"delivery":true}'::jsonb;
 ELSIF p_action='otp_verify' THEN
  e:=decode(p->>'emailHash','hex'); h:=decode(p->>'codeHash','hex'); tok:=decode(p->>'newBillingToken','hex');
  IF e IS NULL OR octet_length(e)<>32 OR h IS NULL OR octet_length(h)<>32 OR tok IS NULL OR octet_length(tok)<>32 THEN RAISE EXCEPTION 'Invalid request' USING ERRCODE='22023'; END IF;
  SELECT * INTO challenge FROM vita_pilot.billing_email_challenges WHERE email_hash=e AND purpose=p->>'purpose' AND consumed_at IS NULL ORDER BY created_at DESC LIMIT 1 FOR UPDATE;
  IF challenge.id IS NULL OR challenge.expires_at<=clock_timestamp() OR challenge.attempts>=8 OR challenge.code_hash<>h THEN
   IF challenge.id IS NOT NULL THEN UPDATE vita_pilot.billing_email_challenges SET attempts=least(attempts+1,8),consumed_at=CASE WHEN attempts>=7 THEN clock_timestamp() ELSE consumed_at END WHERE id=challenge.id; END IF;
   RETURN '{"verified":false}'::jsonb;
  END IF;
  UPDATE vita_pilot.billing_email_challenges SET consumed_at=clock_timestamp() WHERE id=challenge.id;
  IF p->>'purpose'='bind' THEN
   learner:=vita_pilot.session_learner(decode(p->>'learnerToken','hex'),1::smallint);
   INSERT INTO vita_pilot.billing_email_links(email_hash,learner_id) VALUES(e,learner) ON CONFLICT(email_hash) DO UPDATE SET updated_at=clock_timestamp() WHERE billing_email_links.learner_id=EXCLUDED.learner_id;
   IF NOT FOUND THEN RETURN '{"verified":false}'::jsonb; END IF;
  ELSE
   SELECT learner_id INTO learner FROM vita_pilot.billing_email_links WHERE email_hash=e;
   IF learner IS NULL THEN INSERT INTO vita_pilot.learners DEFAULT VALUES RETURNING id INTO learner; INSERT INTO vita_pilot.billing_email_links(email_hash,learner_id) VALUES(e,learner); END IF;
  END IF;
  INSERT INTO vita_pilot.billing_sessions(token_hash,learner_id,email_hash,expires_at) VALUES(tok,learner,e,clock_timestamp()+interval '30 minutes');
  RETURN jsonb_build_object('verified',true,'learnerId',learner);
 ELSIF p_action='checkout_intent' THEN
  tok:=decode(p->>'billingToken','hex'); e:=decode(p->>'emailHash','hex');
  IF tok IS NULL OR octet_length(tok)<>32 OR e IS NULL OR octet_length(e)<>32 THEN RAISE EXCEPTION 'Invalid request' USING ERRCODE='22023'; END IF;
  SELECT s.learner_id,c.customer_id INTO learner,customer FROM vita_pilot.billing_sessions s LEFT JOIN vita_pilot.stripe_customers c ON c.learner_id=s.learner_id WHERE s.token_hash=tok AND s.email_hash=e AND s.revoked_at IS NULL AND s.expires_at>clock_timestamp() FOR SHARE OF s;
  IF learner IS NULL THEN RAISE EXCEPTION 'Access denied' USING ERRCODE='42501'; END IF;
  intent:=(p->>'requestId')::uuid; IF intent IS NULL THEN RAISE EXCEPTION 'Invalid request' USING ERRCODE='22023'; END IF;
  INSERT INTO vita_pilot.billing_rate_limits(kind,bucket,window_started,hits) VALUES('checkout',tok,clock_timestamp(),1)
   ON CONFLICT(kind,bucket) DO UPDATE SET hits=CASE WHEN billing_rate_limits.window_started+interval '1 hour'<=clock_timestamp() THEN 1 ELSE least(billing_rate_limits.hits+1,5) END,window_started=CASE WHEN billing_rate_limits.window_started+interval '1 hour'<=clock_timestamp() THEN clock_timestamp() ELSE billing_rate_limits.window_started END RETURNING hits INTO ip_hits;
  IF ip_hits>4 THEN RETURN '{"rateLimited":true}'::jsonb; END IF;
  INSERT INTO vita_pilot.stripe_checkout_intents(learner_id,request_id,email_hash,customer_id,expires_at) VALUES(learner,intent,e,customer,clock_timestamp()+interval '1 hour') ON CONFLICT(learner_id,request_id) DO UPDATE SET expires_at=greatest(stripe_checkout_intents.expires_at,clock_timestamp()+interval '1 hour') RETURNING id,checkout_session_id INTO intent,checkout_session;
  RETURN jsonb_build_object('intentId',intent,'learnerId',learner,'customerId',customer,'checkoutSessionId',checkout_session);
 ELSIF p_action='store_customer' THEN
  tok:=decode(p->>'billingToken','hex'); intent:=(p->>'intentId')::uuid; customer:=p->>'customerId'; e:=decode(p->>'emailHash','hex');
  SELECT i.learner_id INTO learner FROM vita_pilot.stripe_checkout_intents i JOIN vita_pilot.billing_sessions s ON s.learner_id=i.learner_id AND s.email_hash=i.email_hash WHERE i.id=intent AND s.token_hash=tok AND s.revoked_at IS NULL AND s.expires_at>clock_timestamp() AND i.expires_at>clock_timestamp() AND i.email_hash=e FOR UPDATE OF i;
  IF learner IS NULL OR customer !~ '^cus_[A-Za-z0-9]+$' THEN RAISE EXCEPTION 'Access denied' USING ERRCODE='42501'; END IF;
  INSERT INTO vita_pilot.stripe_customers(learner_id,customer_id,email_hash) VALUES(learner,customer,e) ON CONFLICT(learner_id) DO NOTHING;
  SELECT customer_id INTO customer FROM vita_pilot.stripe_customers WHERE learner_id=learner AND email_hash=e;
  IF customer IS NULL THEN RAISE EXCEPTION 'Customer conflict' USING ERRCODE='23505'; END IF;
  UPDATE vita_pilot.stripe_checkout_intents SET customer_id=customer WHERE id=intent;
  RETURN jsonb_build_object('customerId',customer,'learnerId',learner);
 ELSIF p_action='record_checkout' THEN
  tok:=decode(p->>'billingToken','hex'); intent:=(p->>'intentId')::uuid; customer:=p->>'customerId';
  UPDATE vita_pilot.stripe_checkout_intents i SET checkout_session_id=p->>'checkoutSessionId',customer_id=customer
   FROM vita_pilot.billing_sessions s WHERE i.id=intent AND s.token_hash=tok AND s.learner_id=i.learner_id AND s.email_hash=i.email_hash AND s.revoked_at IS NULL AND s.expires_at>clock_timestamp() AND i.expires_at>clock_timestamp() AND i.customer_id=customer AND i.checkout_session_id IS NULL;
  IF NOT FOUND THEN RAISE EXCEPTION 'Checkout conflict' USING ERRCODE='23505'; END IF;
  RETURN '{"ok":true}'::jsonb;
 ELSIF p_action='billing_status' OR p_action='portal_identity' THEN
  tok:=decode(p->>'billingToken','hex');
  SELECT s.learner_id,c.customer_id INTO learner,customer FROM vita_pilot.billing_sessions s LEFT JOIN vita_pilot.stripe_customers c ON c.learner_id=s.learner_id WHERE s.token_hash=tok AND s.revoked_at IS NULL AND s.expires_at>clock_timestamp();
  IF learner IS NULL THEN RAISE EXCEPTION 'Access denied' USING ERRCODE='42501'; END IF;
  IF p_action='portal_identity' THEN RETURN jsonb_build_object('learnerId',learner,'customerId',customer); END IF;
  SELECT * INTO subrow FROM vita_pilot.stripe_subscriptions WHERE learner_id=learner ORDER BY updated_at DESC LIMIT 1;
  RETURN jsonb_build_object('subscription',CASE WHEN subrow.subscription_id IS NULL THEN NULL ELSE jsonb_build_object('status',subrow.status,'currentPeriodEnd',subrow.current_period_end,'cancelAtPeriodEnd',subrow.cancel_at_period_end,'cancelAt',subrow.cancel_at) END);
 ELSIF p_action='activate' THEN
  tok:=decode(p->>'billingToken','hex'); h:=decode(p->>'newSessionToken','hex');
  SELECT s.learner_id INTO learner FROM vita_pilot.billing_sessions s WHERE s.token_hash=tok AND s.revoked_at IS NULL AND s.expires_at>clock_timestamp();
  IF learner IS NULL THEN RAISE EXCEPTION 'Access denied' USING ERRCODE='42501'; END IF;
  IF NOT EXISTS(SELECT 1 FROM vita_pilot.entitlements e WHERE e.learner_id=learner AND e.entitlement_key='course_access' AND e.revoked_at IS NULL AND e.starts_at<=clock_timestamp() AND (e.expires_at IS NULL OR e.expires_at>clock_timestamp())) AND NOT EXISTS(SELECT 1 FROM vita_pilot.stripe_subscriptions s WHERE s.learner_id=learner AND NOT s.risk_hold AND ((s.status='active' AND s.current_period_end>clock_timestamp()) OR (s.status='past_due' AND s.current_period_end+interval '7 days'>clock_timestamp()))) THEN RETURN '{"active":false}'::jsonb; END IF;
  IF h IS NULL OR octet_length(h)<>32 THEN RAISE EXCEPTION 'Invalid request' USING ERRCODE='22023'; END IF;
  INSERT INTO vita_pilot.sessions(learner_id,token_hash,hash_key_version,expires_at) VALUES(learner,h,1,clock_timestamp()+interval '30 days');
  RETURN jsonb_build_object('active',true,'learnerId',learner,'expiresAt',clock_timestamp()+interval '30 days');
 ELSIF p_action='sync_subscription' THEN
  event_created:=(p->>'eventCreated')::bigint; customer:=p->>'customerId'; intent:=(NULLIF(p->>'intentId',''))::uuid;
  IF p->>'eventId' !~ '^evt_[A-Za-z0-9]+$' OR p->>'subscriptionId' !~ '^sub_[A-Za-z0-9]+$' OR customer !~ '^cus_[A-Za-z0-9]+$' OR p->>'productId' !~ '^prod_[A-Za-z0-9]+$' OR p->>'priceId' !~ '^price_[A-Za-z0-9]+$' OR event_created IS NULL OR event_created<=0 OR p->>'status' NOT IN('incomplete','incomplete_expired','trialing','active','past_due','canceled','unpaid','paused') THEN RAISE EXCEPTION 'Invalid request' USING ERRCODE='22023'; END IF;
  IF EXISTS(SELECT 1 FROM vita_pilot.stripe_webhook_events WHERE event_id=p->>'eventId') THEN RETURN '{"duplicate":true}'::jsonb; END IF;
  SELECT learner_id INTO learner FROM vita_pilot.stripe_customers WHERE customer_id=customer;
  IF learner IS NULL THEN RETURN '{"ignored":true}'::jsonb; END IF;
  SELECT latest_event_created INTO prior FROM vita_pilot.stripe_subscriptions WHERE subscription_id=p->>'subscriptionId' FOR UPDATE;
  IF prior IS NOT NULL AND event_created<prior THEN INSERT INTO vita_pilot.stripe_webhook_events(event_id,event_type,event_created) VALUES(p->>'eventId',p->>'eventType',event_created); RETURN '{"stale":true}'::jsonb; END IF;
  IF NOT EXISTS(SELECT 1 FROM vita_pilot.stripe_subscriptions WHERE subscription_id=p->>'subscriptionId') AND intent IS NOT NULL AND NOT EXISTS(SELECT 1 FROM vita_pilot.stripe_checkout_intents WHERE id=intent AND learner_id=learner AND customer_id=customer) THEN RETURN '{"ignored":true}'::jsonb; END IF;
  INSERT INTO vita_pilot.stripe_subscriptions(subscription_id,customer_id,learner_id,product_id,price_id,status,current_period_end,cancel_at_period_end,cancel_at,latest_event_created)
  VALUES(p->>'subscriptionId',customer,learner,p->>'productId',p->>'priceId',p->>'status',(p->>'currentPeriodEnd')::timestamptz,COALESCE((p->>'cancelAtPeriodEnd')::boolean,false),(NULLIF(p->>'cancelAt',''))::timestamptz,event_created)
  ON CONFLICT(subscription_id) DO UPDATE SET status=EXCLUDED.status,current_period_end=EXCLUDED.current_period_end,cancel_at_period_end=EXCLUDED.cancel_at_period_end,cancel_at=EXCLUDED.cancel_at,price_id=EXCLUDED.price_id,product_id=EXCLUDED.product_id,latest_event_created=EXCLUDED.latest_event_created,updated_at=clock_timestamp()
  WHERE stripe_subscriptions.customer_id=EXCLUDED.customer_id AND stripe_subscriptions.learner_id=EXCLUDED.learner_id AND EXCLUDED.latest_event_created>=stripe_subscriptions.latest_event_created;
  INSERT INTO vita_pilot.stripe_webhook_events(event_id,event_type,event_created) VALUES(p->>'eventId',p->>'eventType',event_created);
  RETURN '{"ok":true}'::jsonb;
 ELSIF p_action='risk_hold' THEN
  customer:=p->>'customerId';
  IF customer !~ '^cus_[A-Za-z0-9]+$' OR p->>'eventId' !~ '^evt_[A-Za-z0-9]+$' THEN RAISE EXCEPTION 'Invalid request' USING ERRCODE='22023'; END IF;
  IF EXISTS(SELECT 1 FROM vita_pilot.stripe_webhook_events WHERE event_id=p->>'eventId') THEN RETURN '{"duplicate":true}'::jsonb; END IF;
  IF p->>'resolved'='true' THEN UPDATE vita_pilot.stripe_event_risk_holds SET resolved_at=clock_timestamp() WHERE risk_id=p->>'riskId' AND customer_id=customer AND resolved_at IS NULL;
  ELSE INSERT INTO vita_pilot.stripe_event_risk_holds(event_id,risk_id,customer_id) VALUES(p->>'eventId',p->>'riskId',customer) ON CONFLICT DO NOTHING; END IF;
  UPDATE vita_pilot.stripe_subscriptions SET risk_hold=EXISTS(SELECT 1 FROM vita_pilot.stripe_event_risk_holds WHERE customer_id=customer AND resolved_at IS NULL),updated_at=clock_timestamp() WHERE customer_id=customer;
  INSERT INTO vita_pilot.stripe_webhook_events(event_id,event_type,event_created) VALUES(p->>'eventId',p->>'eventType',(p->>'eventCreated')::bigint);
  RETURN '{"ok":true}'::jsonb;
 END IF;
 RAISE EXCEPTION 'Invalid action' USING ERRCODE='22023';
END $fn$;
REVOKE ALL ON FUNCTION vita_pilot.billing_request(text,jsonb) FROM PUBLIC,vita_pilot_app;
GRANT EXECUTE ON FUNCTION vita_pilot.billing_request(text,jsonb) TO vita_pilot_app;
INSERT INTO vita_pilot.schema_migrations(version,checksum) VALUES('0005',expected_checksum);
END $migration$;
