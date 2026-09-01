import { describe, expect, it } from 'vitest';
import { getOrdinalNumeric, getOrdinalWord } from '../src/index';

const words = (n: number) => getOrdinalWord(n, 'en-US');

describe('en-US words', () => {
  it('spells the units', () => {
    expect([1, 2, 3, 4, 5, 6, 7, 8, 9].map(words)).toEqual([
      'first', 'second', 'third', 'fourth', 'fifth',
      'sixth', 'seventh', 'eighth', 'ninth'
    ]);
  });

  it('spells the teens, which are not tens plus units', () => {
    expect([10, 11, 12, 13, 15, 18, 19].map(words)).toEqual([
      'tenth', 'eleventh', 'twelfth', 'thirteenth', 'fifteenth', 'eighteenth', 'nineteenth'
    ]);
  });

  it('hyphenates compound tens and ordinalises only the last element', () => {
    expect(words(21)).toBe('twenty-first');
    expect(words(42)).toBe('forty-second');
    expect(words(90)).toBe('ninetieth');
    expect(words(99)).toBe('ninety-ninth');
  });

  it('keeps the leading elements cardinal', () => {
    expect(words(100)).toBe('one hundredth');
    expect(words(101)).toBe('one hundred first');
    expect(words(113)).toBe('one hundred thirteenth');
    expect(words(1000)).toBe('one thousandth');
    expect(words(2001)).toBe('two thousand first');
    expect(words(1_000_000)).toBe('one millionth');
  });

  it('spells large numbers', () => {
    expect(words(1_234_567)).toBe(
      'one million two hundred thirty-four thousand five hundred sixty-seventh'
    );
    expect(words(999_999_999)).toBe(
      'nine hundred ninety-nine million nine hundred ninety-nine thousand nine hundred ninety-ninth'
    );
  });
});

describe('en-US numeric', () => {
  it('picks the right suffix', () => {
    expect([1, 2, 3, 4, 11, 12, 13, 21, 22, 23, 101, 111, 112].map((n) => getOrdinalNumeric(n, 'en-US')))
      .toEqual([
        '1st', '2nd', '3rd', '4th', '11th', '12th', '13th',
        '21st', '22nd', '23rd', '101st', '111th', '112th'
      ]);
  });
});
