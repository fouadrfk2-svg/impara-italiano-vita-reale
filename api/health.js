"use strict";

const { checkDatabaseHealth } = require("../server/database.cjs");

// Narrow read-only Stripe connectivity diagnosis for the isolated test branch.
// It never returns credentials, requests customer information, or creates Stripe objects.
async function stripeTestReadiness() {
  const env = process.env;
  if (env.VERCEL_ENV !== "preview" ||
      env.VERCEL_PROJECT_ID !== "prj_6iDrQCYqlDY9Hx0buZEMirMoJJYF" ||
      env.VERCEL_GIT_COMMIT_REF !== "codex/stripe-subscriptions") {
    return "unavailable";
  }
  const { envConfig } = require("../server/stripe-billing.cjs");
  const { Stripe } = require("stripe");
  const c = envConfig(env);
  if (!c.ready) return "config_incomplete";
  try {
    // Separate transport/authentication failure from SDK behavior without exposing secrets.
    if (c.mode !== "test") return "unavailable";
    let probe;
    try {
      probe = await fetch("https://api.stripe.com/v1/prices/" + encodeURIComponent(c.price), {
        headers: { Authorization: "Bearer " + c.key },
        signal: AbortSignal.timeout(8000)
      });
    } catch { return "stripe_network_failed"; }
    if (!probe.ok) return "stripe_http_" + String(probe.status);
    const stripe = new Stripe(c.key);
    const price = await stripe.prices.retrieve(c.price, { expand: ["product"] });
    const product = typeof price.product === "string"
      ? await stripe.products.retrieve(price.product)
      : price.product;
    if (price.id !== c.price || !price.active || price.currency !== "eur" ||
        price.unit_amount !== 999 || price.recurring?.interval !== "month" ||
        price.recurring?.interval_count !== 1 || product?.id !== c.product ||
        !product?.active) return "catalog_mismatch";
    return "ok";
  } catch (error) {
    // Return only a fixed category; do not serialize exception text or Stripe responses.
    if (error?.type === "StripeAuthenticationError") return "stripe_auth_failed";
    if (error?.type === "StripePermissionError") return "stripe_permission_failed";
    if (error?.type === "StripeInvalidRequestError") return "stripe_request_failed";
    if (error?.type === "StripeConnectionError") return "stripe_connection_failed";
    if (error?.name === "TypeError") return "sdk_type_error";
    if (error?.name === "StripeAPIError") return "stripe_api_error";
    if (error?.name === "StripeRateLimitError") return "stripe_rate_limited";
    return "stripe_failed";
  }
}


// Plain Vercel Node function. No framework, sessions, purchases, or learner data.
module.exports = async function health(req, res) {
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.setHeader("Cache-Control", "no-store");
  res.setHeader("CDN-Cache-Control", "no-store");
  res.setHeader("Vercel-CDN-Cache-Control", "no-store");
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("Referrer-Policy", "no-referrer");
  res.setHeader("X-Robots-Tag", "noindex");

  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    res.statusCode = 405;
    res.end(JSON.stringify({ status: "method_not_allowed" }));
    return;
  }

  try {
    await checkDatabaseHealth();
    const diagnose = req.url === "/api/health?stripe_test=1";
    const stripeTest = diagnose ? await stripeTestReadiness() : null;
    res.statusCode = stripeTest === null || stripeTest === "ok" ? 200 : 503;
    res.end(JSON.stringify(diagnose ? { status: "ok", stripe_test: stripeTest } : { status: "ok" }));
  } catch {
    // Never serialize or log driver errors: they may contain credentials or SQL details.
    res.statusCode = 503;
    res.end(JSON.stringify({ status: "unavailable" }));
  }
};
