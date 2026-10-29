import assert from 'node:assert/strict';
import { validatedMigrations } from './check_db_migrations.mjs';

// Apply only pending, checksum-verified versions. Replaying older SQL after a
// later SECURITY DEFINER grant can invalidate a historical role preflight.
export async function applyPendingMigrations(client, migrations = validatedMigrations()) {
  assert(client && typeof client.query === 'function' && typeof client.exec === 'function');
  const applied = [], skipped = [];
  for (let i = 0; i < migrations.length; i++) {
    assert.equal(migrations[i].version, String(i + 1).padStart(4, '0'), 'Migration versions must be contiguous and ordered');
  }
  const ledgerExists = (await client.query("SELECT to_regclass('vita_pilot.schema_migrations') IS NOT NULL AS present")).rows[0].present;
  const ledger = new Map();
  if (ledgerExists) {
    const rows = (await client.query('SELECT version,checksum FROM vita_pilot.schema_migrations ORDER BY version')).rows;
    const known = new Map(migrations.map(m => [m.version,m.checksum]));
    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      assert.equal(row.version, migrations[i]?.version, 'Migration history gap or unknown version');
      assert.equal(known.get(row.version),row.checksum,'Recorded migration checksum mismatch');
      ledger.set(row.version,row.checksum);
    }
  }
  for (let i=0;i<migrations.length;i++) {
    const migration=migrations[i];
    if (ledger.has(migration.version)) { skipped.push(migration.version); continue; }
    if (i>0 && ledger.get(migrations[i-1].version)!==migrations[i-1].checksum) throw new Error('Migration history gap');
    await client.exec('BEGIN');
    try {
      await client.exec("SET LOCAL vita_pilot.migration_target='vita-reale-arabic-pilot'");
      await client.exec(migration.sql);
      await client.exec('COMMIT');
      ledger.set(migration.version,migration.checksum);
      applied.push(migration.version);
    } catch (error) {
      await client.exec('ROLLBACK');
      throw error;
    }
  }
  return {applied,skipped};
}
