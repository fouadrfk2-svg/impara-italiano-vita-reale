import { test } from 'node:test';
import assert from 'node:assert/strict';
import { PGlite } from '@electric-sql/pglite';
import { applyPendingMigrations } from '../../scripts/apply_pending_migrations.mjs';
import { validatedMigrations } from '../../scripts/check_db_migrations.mjs';

const migrations = validatedMigrations();

function instrument(db) {
  const statements = [];
  return {
    statements,
    async exec(sql) { statements.push(sql); return db.exec(sql); },
    query(sql, params) { return db.query(sql, params); }
  };
}

test('migration runner applies each pending version once and skips all recorded versions on rerun', async () => {
  const db = new PGlite();
  try {
    const client = instrument(db);
    const first = await applyPendingMigrations(client, migrations);
    assert.deepEqual(first, { applied: ['0001', '0002', '0003', '0004', '0005'], skipped: [] });
    assert.equal(client.statements.filter(sql => migrations.some(m => m.sql === sql)).length, 5);

    client.statements.length = 0;
    const second = await applyPendingMigrations(client, migrations);
    assert.deepEqual(second, { applied: [], skipped: ['0001', '0002', '0003', '0004', '0005'] });
    assert.equal(client.statements.some(sql => migrations.some(m => m.sql === sql)), false);
  } finally {
    await db.close();
  }
});

test('migration runner applies only the pending suffix', async () => {
  const db = new PGlite();
  try {
    const client = instrument(db);
    await applyPendingMigrations(client, migrations.slice(0, 4));
    client.statements.length = 0;

    const result = await applyPendingMigrations(client, migrations);
    assert.deepEqual(result, { applied: ['0005'], skipped: ['0001', '0002', '0003', '0004'] });
    assert.deepEqual(client.statements.filter(sql => migrations.some(m => m.sql === sql)), [migrations[4].sql]);
  } finally {
    await db.close();
  }
});

test('migration runner rejects a gapped ledger before executing pending SQL', async () => {
  const db = new PGlite();
  try {
    const client = instrument(db);
    await applyPendingMigrations(client, migrations);
    await db.query("DELETE FROM vita_pilot.schema_migrations WHERE version='0002'");
    client.statements.length = 0;

    await assert.rejects(applyPendingMigrations(client, migrations), /Migration history gap or unknown version/);
    assert.deepEqual(client.statements, []);
  } finally {
    await db.close();
  }
});

test('migration runner rejects a recorded checksum mismatch before executing SQL', async () => {
  const db = new PGlite();
  try {
    const client = instrument(db);
    await applyPendingMigrations(client, migrations.slice(0, 4));
    await db.query("UPDATE vita_pilot.schema_migrations SET checksum=$1 WHERE version='0003'", ['0'.repeat(64)]);
    client.statements.length = 0;

    await assert.rejects(applyPendingMigrations(client, migrations), /Recorded migration checksum mismatch/);
    assert.deepEqual(client.statements, []);
  } finally {
    await db.close();
  }
});

test('failed pending migration rolls back and leaves its ledger version unapplied', async () => {
  const db = new PGlite();
  try {
    const client = instrument(db);
    await applyPendingMigrations(client, migrations.slice(0, 4));
    const broken = [...migrations.slice(0, 4), { ...migrations[4], sql: 'THIS IS NOT SQL' }];

    await assert.rejects(applyPendingMigrations(client, broken));
    const ledger = (await db.query('SELECT version FROM vita_pilot.schema_migrations ORDER BY version')).rows.map(row => row.version);
    assert.deepEqual(ledger, ['0001', '0002', '0003', '0004']);
    assert(client.statements.includes('ROLLBACK'));
  } finally {
    await db.close();
  }
});
