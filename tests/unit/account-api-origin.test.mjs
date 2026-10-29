import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const { sameOrigin } = require('../../server/account-api.cjs');
const saved = new Map();
const keys = ['PILOT_ORIGIN', 'VERCEL', 'VERCEL_URL', 'VERCEL_BRANCH_URL', 'NODE_ENV'];

before(() => {
  for (const key of keys) saved.set(key, process.env[key]);
  process.env.PILOT_ORIGIN = 'https://vita-reale-arabic-demo.vercel.app';
  process.env.VERCEL = '1';
  process.env.VERCEL_URL = 'vita-reale-arabic-demo.vercel.app';
  process.env.VERCEL_BRANCH_URL = 'vita-reale-arabic-demo.vercel.app';
  process.env.NODE_ENV = 'production';
});

after(() => {
  for (const key of keys) {
    if (saved.get(key) === undefined) delete process.env[key];
    else process.env[key] = saved.get(key);
  }
});

const request = origin => ({ headers: { origin, host: 'vita-reale-arabic-demo.vercel.app' } });

test('allows both the existing Vercel origin and canonical www domain', () => {
  assert.equal(sameOrigin(request('https://vita-reale-arabic-demo.vercel.app')), true);
  assert.equal(sameOrigin(request('https://www.vitare.it')), true);
});

test('keeps origin checking exact and rejects insecure or unrelated origins', () => {
  for (const origin of [
    'http://www.vitare.it',
    'https://vitare.it',
    'https://evil.vitare.it',
    'https://www.vitare.it.evil.example',
    'https://www.vitare.it/',
    'https://www.vitare.it/path',
  ]) assert.equal(sameOrigin(request(origin)), false, origin);
  assert.equal(sameOrigin({ headers: { host: 'vita-reale-arabic-demo.vercel.app' } }), false);
});
