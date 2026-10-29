"use strict";

const { checkDatabaseHealth } = require("../server/database.cjs");

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
    res.statusCode = 200;
    res.end(JSON.stringify({ status: "ok" }));
  } catch {
    // Never serialize or log driver errors: they may contain credentials or SQL details.
    res.statusCode = 503;
    res.end(JSON.stringify({ status: "unavailable" }));
  }
};
