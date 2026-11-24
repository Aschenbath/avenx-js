import assert from 'node:assert/strict';
import '../../../test/helpers/register-happy-dom.js';
import { createI18n } from '../src/index.js';
import { captureLogs, reset } from './helpers.js';

captureLogs();

const cyclic = {};
cyclic.self = cyclic;
const hostile = { toJSON() { throw new Error('should not serialize a key'); } };
for (const key of [1n, Symbol('key'), cyclic, hostile, Object.create(null), '', null, undefined]) {
  reset();
  const failures = [];
  const i18n = createI18n({ onError: (failure) => failures.push(failure) });
  assert.equal(i18n.t(key), '');
  assert.equal(String(i18n.tHtml(key)), '');
  assert.equal(i18n.has(key), false);
  assert.equal(failures.length, 1);
  assert.equal(failures[0].phase, 'key');
}

for (const value of [1n, Symbol('date')]) {
  reset();
  const failures = [];
  const i18n = createI18n({ onError: (failure) => failures.push(failure) });
  assert.equal(i18n.d(value), String(value));
  assert.equal(failures.length, 1);
  assert.equal(failures[0].phase, 'format');
  assert.equal(i18n.d('2024-01-02', { year: 'numeric', timeZone: 'UTC' }), '2024');
}

console.log('Invalid i18n inputs preserve fallbacks and diagnostics.');
