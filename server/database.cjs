"use strict";

// This file is outside the static publish allowlist. Never import it into browser code.
const { neon } = require("@neondatabase/serverless");

let cachedUrl, cachedClient;

function client() {
  const value = process.env.DATABASE_URL;
  if (typeof value !== "string" || !value.trim()) throw new Error("Database unavailable");
  const url = value.trim();
  let parsed;
  try { parsed = new URL(url); } catch { throw new Error("Database unavailable"); }
  // Fail closed on accidental non-Neon or insecure configuration. No URL appears in errors/logs.
  if (!['postgres:', 'postgresql:'].includes(parsed.protocol) ||
      !parsed.hostname.endsWith('.neon.tech') || !parsed.username || !parsed.password ||
      parsed.pathname.length < 2 || parsed.hash ||
      !['require', 'verify-ca', 'verify-full'].includes(parsed.searchParams.get('sslmode'))) {
    throw new Error("Database unavailable");
  }
  if (cachedUrl !== url || !cachedClient) {
    cachedClient = neon(url);
    cachedUrl = url;
  }
  return cachedClient;
}

// No arbitrary SQL API. This probe cannot read application tables or grant access.
async function checkDatabaseHealth() {
  try {
    const sql = client();
    const rows = await sql.query('SELECT 1 AS ok', [], {
      fetchOptions: { signal: AbortSignal.timeout(5000), cache: 'no-store' }
    });
    if (!Array.isArray(rows) || rows.length !== 1 || rows[0].ok !== 1) throw new Error();
  } catch {
    // Keep driver error details private even when another server caller uses this helper.
    throw new Error("Database unavailable");
  }
}

module.exports = { checkDatabaseHealth };
