import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { getOrdinalSuffix, getOrdinalWord, registerLocale } from '../src/index.ts';
import { enUS } from '../src/locales/en-US.ts';
import { ptPT } from '../src/locales/pt-PT.ts';

registerLocale(enUS);
registerLocale(ptPT);

const LIMIT = 20_000;

describe('en-US suffixes against Intl.PluralRules', () => {
  it('agrees with the platform for every value up to the limit', () => {
    const rules = new Intl.PluralRules('en-US', { type: 'ordinal' });
    const expected: Record<string, string> = { one: 'st', two: 'nd', few: 'rd', other: 'th' };

    const divergences: string[] = [];
    for (let value = 1; value <= LIMIT; value += 1) {
      const want = expected[rules.select(value)];
      const got = getOrdinalSuffix(value, 'en-US');
      if (want !== got) divergences.push(`${value}: expected ${want}, got ${got}`);
    }
    assert.deepEqual(divergences, []);
  });
});

describe('spelled-out invariants', () => {
  for (const locale of ['en-US', 'pt-PT']) {
    it(`${locale} produces clean, distinct words for every value up to the limit`, () => {
      const malformed: string[] = [];
      const collisions: string[] = [];
      const seen = new Map<string, number>();

      for (let value = 1; value <= LIMIT; value += 1) {
        const words = getOrdinalWord(value, locale);

        if (words.length === 0) malformed.push(`${value}: empty`);
        else if (/ {2}|^ | $/.test(words)) malformed.push(`${value}: stray spaces in ${JSON.stringify(words)}`);
        else if (/\d/.test(words)) malformed.push(`${value}: digits leaked into ${words}`);

        const previous = seen.get(words);
        // Two different numbers spelling the same phrase means a component is
        // being dropped somewhere.
        if (previous !== undefined) collisions.push(`${previous} and ${value} both spell "${words}"`);
        else seen.set(words, value);
      }

      assert.deepEqual(malformed, []);
      assert.deepEqual(collisions, []);
    });
  }

  it('pt-PT spells every word with the masculine -o ending that inflection assumes', () => {
    const offenders: string[] = [];
    for (let value = 1; value <= LIMIT; value += 1) {
      for (const word of getOrdinalWord(value, 'pt-PT').split(' ')) {
        if (!word.endsWith('o')) offenders.push(`${value}: ${word}`);
      }
    }
    assert.deepEqual(offenders, []);
  });
});
