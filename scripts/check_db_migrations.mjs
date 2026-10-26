import { readFileSync, readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { createHash } from 'node:crypto';
import assert from 'node:assert/strict';
const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
export function validatedMigrations() {
  const dir = join(ROOT, 'db/migrations'), manifest = JSON.parse(readFileSync(join(dir, 'manifest.json'), 'utf8'));
  assert.equal(manifest.schema, 'vita_pilot'); assert.equal(manifest.targetBranch, 'vita-reale-arabic-pilot');
  assert.deepEqual(readdirSync(dir).filter(f => f.endsWith('.sql')).sort(), manifest.migrations.map(m => m.file));
  return manifest.migrations.map((m, i) => {
    assert.equal(m.version, String(i + 1).padStart(4, '0'));
    // Git may check out CRLF on Windows; checksums use canonical LF on every host.
    const sql = readFileSync(join(dir, m.file), 'utf8').replace(/\r\n/g, '\n');
    const normalized = sql.replace(/expected_checksum constant text := '[0-9a-f]{64}'/, "expected_checksum constant text := '__CHECKSUM__'");
    assert.equal(createHash('sha256').update(normalized).digest('hex'), m.checksum, m.file + ' immutable checksum');
    assert(sql.includes("expected_checksum constant text := '" + m.checksum + "'"));
    assert(!/\b(?:DROP|TRUNCATE|COPY)\b|\bDELETE\s+FROM\b|public\.|\b(?:purchases|manual_access|last_day)\b/i.test(sql), m.file + ' additive scope');
    assert(!/DATABASE_URL|postgres(?:ql)?:\/\//i.test(sql));
    return { ...m, sql };
  });
}
if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) console.log(JSON.stringify({status:'ok',migrations:validatedMigrations().length,schema:'vita_pilot'}));
