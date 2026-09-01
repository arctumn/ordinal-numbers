import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  getDefaultLocale,
  getOrdinalWord,
  getSupportedLocales,
  registerLocale,
  resolveLocale,
  setDefaultLocale,
  unregisterLocale
} from '../src/index.ts';
import { enUS } from '../src/locales/en-US.ts';
import { ptPT } from '../src/locales/pt-PT.ts';
import type { OrdinalLocale } from '../src/types.ts';

describe('an empty registry', () => {
  it('ships no locale and refuses to guess one', () => {
    assert.deepEqual(getSupportedLocales(), []);
    assert.equal(getDefaultLocale(), undefined);
    assert.throws(() => getOrdinalWord(1), { name: 'RangeError', message: /No locale registered\./ });
    assert.throws(() => getOrdinalWord(1, 'pt-PT'), {
      name: 'RangeError',
      message: /No locale registered for "pt-PT"\. Registered: none\./
    });
  });
});

describe('registration', () => {
  it('makes the first registered locale the default', () => {
    registerLocale(ptPT);
    assert.equal(getDefaultLocale(), 'pt-PT');
    assert.equal(getOrdinalWord(1), 'primeiro');
  });

  it('does not pull in locales that were not registered', () => {
    assert.throws(() => getOrdinalWord(1, 'en-US'), {
      message: /No locale registered for "en-US"\. Registered: pt-PT\./
    });

    registerLocale(enUS);
    assert.equal(getOrdinalWord(1, 'en-US'), 'first');
    assert.equal(getDefaultLocale(), 'pt-PT', 'registering a second locale must not steal the default');
  });

  it('moves the default only when asked', () => {
    setDefaultLocale('en-US');
    assert.equal(getDefaultLocale(), 'en-US');
    assert.equal(getOrdinalWord(1), 'first');
    assert.throws(() => setDefaultLocale('fr-FR'), { name: 'RangeError' });
  });

  it('registers the canonical code and every alias', () => {
    assert.equal(resolveLocale('pt-PT').code, 'pt-PT');
    assert.equal(resolveLocale('PT-pt').code, 'pt-PT');
    assert.equal(resolveLocale('pt').code, 'pt-PT');
    assert.equal(resolveLocale('en-GB').code, 'en-US');
  });

  it('falls back to the bare language subtag for unlisted regions', () => {
    assert.equal(resolveLocale('pt-CV').code, 'pt-PT');
  });

  it('removes a locale and every tag pointing at it', () => {
    assert.equal(unregisterLocale(enUS), true);
    assert.equal(unregisterLocale(enUS), false);
    assert.throws(() => getOrdinalWord(1, 'en-GB'), { name: 'RangeError' });
    assert.equal(getDefaultLocale(), 'pt-PT', 'the default falls back to a locale still registered');
  });
});

describe('bounds and validation', () => {
  it('returns the numeric form outside the supported range', () => {
    assert.equal(getOrdinalWord(0, 'pt-PT'), '0.º');
    assert.equal(getOrdinalWord(1_000_000_000, 'pt-PT'), '1000000000.º');
  });

  it('rejects non-integers', () => {
    assert.throws(() => getOrdinalWord(1.5, 'pt-PT'), { name: 'TypeError' });
    assert.throws(() => getOrdinalWord(Number.NaN, 'pt-PT'), { name: 'TypeError' });
  });
});

describe('custom locales', () => {
  it('accepts a locale plugin', () => {
    const xx: OrdinalLocale = {
      code: 'xx',
      aliases: [],
      min: 1,
      max: 9,
      toWords: (value) => `#${value}`,
      suffix: () => '!'
    };
    registerLocale(xx);
    assert.equal(getOrdinalWord(3, 'xx'), '#3');
    assert.equal(getOrdinalWord(30, 'xx'), '30!');
  });
});
