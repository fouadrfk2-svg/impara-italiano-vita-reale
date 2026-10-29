# Stripe subscriptions: staged billing runbook

This repository contains a disabled-by-default subscription integration for
the Arabic Vita Reale app. It uses Stripe-hosted Checkout and the existing
`vita_pilot` database function. It does not replace activation-code access;
manual `course_access` entitlements remain independent.

## Current state

- Application code and additive migration `0005` are prepared locally.
- Migration `0005` has **not** been applied to Neon.
- No Stripe or email-provider variables were added to Vercel.
- Billing is unavailable unless the complete environment passes validation
  and `BILLING_ENABLED=true`.
- The existing guest subscription buttons keep their current WhatsApp/manual
  behavior while billing is disabled.
- The configured live catalog was reviewed as product
  `prod_VWHmlQLz4C7MOO` and price `price_1UVFDCJps25FSUMkd3hBBqAO`: active,
  EUR 9.99 monthly, with no trial. The code independently rechecks the live
  Stripe product and price before creating Checkout.

## Required configuration (not yet configured)

Set variables only on the existing `vita-reale-arabic-demo` project. Keep
Preview restricted to the feature branch and use Stripe test-mode credentials
and a separate test-mode product/price. Production must use the reviewed live
catalog and the canonical site URL. Do not copy a local environment file.

| Variable | Purpose |
| --- | --- |
| `BILLING_ENABLED` | Explicit feature gate; only the literal `true` enables signup |
| `STRIPE_SECRET_KEY` | Server-side Stripe API key; test key for Preview, live key for Production |
| `STRIPE_WEBHOOK_SECRET` | Signing secret for this project's Stripe webhook endpoint |
| `STRIPE_PRODUCT_ID` | Expected product ID; Production is checked against the reviewed product |
| `STRIPE_PRICE_ID` | Expected monthly EUR 9.99 price ID; Production is checked against the reviewed price |
| `PUBLIC_SITE_URL` | Exact HTTPS origin; Production must be `https://www.vitare.it` |
| `RESEND_API_KEY` | Optional email delivery provider key; required before billing signup can be enabled |
| `BILLING_EMAIL_FROM` | Verified sender identity; required before billing signup can be enabled |

### Branch-scoped database binding

The existing Production binding remains pinned to the original pilot endpoint.
The `codex/stripe-subscriptions` Preview deployment must have its own
`DATABASE_URL`, scoped to Preview and that Git branch, using the restricted
`vita_pilot_app` role on Neon branch `br-morning-truth-b9gfj39x` and database
`vita_reale_test`. Do not make this value available to Production or other
Preview branches. The runtime also requires Vercel's `VERCEL_ENV`,
`VERCEL_PROJECT_ID`, and `VERCEL_GIT_COMMIT_REF` system variables; it fails
closed if the project or branch scope is absent or incorrect. Ensure Vercel's
Automatically expose System Environment Variables setting is enabled for this
project; otherwise runtime database access fails closed. Production
accepts only its existing endpoint, and the Preview endpoint is rejected in
Production. No fallback between these bindings is allowed.

Values must be entered through the Vercel dashboard or authenticated CLI,
never committed or printed. Preview validation rejects the reviewed live
product/price IDs and live Stripe keys. Production validation rejects test
keys and any noncanonical URL.

## Database and deployment order

1. Verify the Vercel project ID, team, branch, and Neon pilot branch/database
   independently. Never point this migration at Neon main or the old project.
2. Apply only pending, checksum-verified migration `0005_stripe_billing.sql`
   on the isolated pilot branch. The migration creates only additive
   `vita_pilot` tables, enables RLS, revokes direct runtime table access, and
   grants the existing restricted runtime role execution of the narrowly
   scoped `billing_request(text,jsonb)` function.
3. Independently verify the function owner, fixed `search_path`, role grants,
   RLS, migration ledger/checksum, and that `vita_pilot_app` still has no
   direct table privileges or privileged role attributes.
4. Configure Preview with test-mode values and a branch-scoped environment,
   deploy a Preview, then test webhook signature handling and a synthetic
   subscription in Stripe test mode.
5. Before Production enablement, configure a verified sender, test email OTP,
   complete/cancel checkout, webhook retries, renewal, past-due grace, portal
   cancellation, dispute holds, activation, and preservation of manual access
   and progress. Inspect Stripe's Billing Portal configuration and ensure
   customers can update/cancel only their own subscription.
6. Confirm with the owner/accountant how VAT/tax should be handled. The
   reviewed existing price has no trial; this code does not enable automatic
   tax or make a tax/legal determination.
7. Only after all checks pass, enable `BILLING_ENABLED=true` for Production
   and deploy the reviewed commit. Do not enable it by changing code defaults.

The implementation never accepts a browser-supplied amount, price, product,
customer ID, or entitlement. Email verification is rate limited and stores
only keyed hashes in the database. Stripe access is granted only after a
verified webhook synchronization; the Checkout return URL alone grants no
access. Existing learner progress and manual activation-code entitlements are
not changed by billing events.

## Stripe webhook endpoint

Configure the existing Stripe account to send these event families to
`https://www.vitare.it/api/stripe/webhook`:

- `checkout.session.completed`
- `checkout.session.async_payment_succeeded`
- `checkout.session.async_payment_failed`
- `customer.subscription.*`
- `invoice.paid`
- `invoice.payment_failed`
- `charge.dispute.created`
- `charge.dispute.closed`

Use the endpoint's signing secret as `STRIPE_WEBHOOK_SECRET`. The handler
verifies Stripe's signature over the raw request body, retrieves the current
subscription from Stripe, checks the configured product/price, and makes
event processing idempotent. Do not expose webhook secrets to the browser.

## Recovery and rollback

- Keep the billing feature disabled until the database migration, runtime
  preflight, Preview flow, email delivery, and webhook behavior are verified.
- To disable new signup, set `BILLING_ENABLED` to anything other than the
  literal `true`; existing manual access remains intact. Do not remove the
  webhook signing configuration while paid subscriptions exist, since that
  would prevent cancellation and renewal state from synchronizing.
- If a deploy is faulty, roll back the Vercel deployment while leaving the
  additive database objects and webhook available. Do not delete billing
  records or reverse the migration while live subscriptions may exist.
- Handle refunds and disputes through the existing Stripe account workflow;
  do not grant access based on a client request or manual database edit.

## Local verification

All billing tests use synthetic data and mocked Stripe/email services or an
in-memory PostgreSQL-compatible test database. They do not configure Vercel,
connect to live Stripe, or write to Neon. The `scripts/apply_pending_migrations.mjs`
helper accepts a caller-provided database client and is used by tests; it must
not be pointed at any production database without a separately reviewed,
explicit migration operation.
