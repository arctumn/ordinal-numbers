import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { getOrdinalNumeric, getOrdinalWord, registerLocale } from '../src/index.ts';
import { enUS } from '../src/locales/en-US.ts';

registerLocale(enUS);

const words = (value: number) => getOrdinalWord(value, 'en-US');

describe('en-US words', () => {
  it('spells the units', () => {
    assert.deepEqual([1, 2, 3, 4, 5, 6, 7, 8, 9].map(words), [
      'first', 'second', 'third', 'fourth', 'fifth',
      'sixth', 'seventh', 'eighth', 'ninth'
    ]);
  });

  it('spells the teens, which are not tens plus units', () => {
    assert.deepEqual([10, 11, 12, 13, 15, 18, 19].map(words), [
      'tenth', 'eleventh', 'twelfth', 'thirteenth', 'fifteenth', 'eighteenth', 'nineteenth'
    ]);
  });

  it('hyphenates compound tens and ordinalises only the last element', () => {
    assert.equal(words(21), 'twenty-first');
    assert.equal(words(42), 'forty-second');
    assert.equal(words(90), 'ninetieth');
    assert.equal(words(99), 'ninety-ninth');
  });

  it('keeps the leading elements cardinal', () => {
    assert.equal(words(100), 'one hundredth');
    assert.equal(words(101), 'one hundred first');
    assert.equal(words(113), 'one hundred thirteenth');
    assert.equal(words(1000), 'one thousandth');
    assert.equal(words(2001), 'two thousand first');
    assert.equal(words(1_000_000), 'one millionth');
  });

  it('spells large numbers', () => {
    assert.equal(
      words(1_234_567),
      'one million two hundred thirty-four thousand five hundred sixty-seventh'
    );
    assert.equal(
      words(999_999_999),
      'nine hundred ninety-nine million nine hundred ninety-nine thousand nine hundred ninety-ninth'
    );
  });
});

describe('en-US numeric', () => {
  it('picks the right suffix', () => {
    assert.deepEqual(
      [1, 2, 3, 4, 11, 12, 13, 21, 22, 23, 101, 111, 112].map((n) => getOrdinalNumeric(n, 'en-US')),
      ['1st', '2nd', '3rd', '4th', '11th', '12th', '13th',
        '21st', '22nd', '23rd', '101st', '111th', '112th']
    );
  });
});
