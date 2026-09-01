import { describe, expect, it } from 'vitest';
import {
  getOrdinalWord,
  getSupportedLocales,
  registerLocale,
  resolveLocale
} from '../src/index';
import type { OrdinalLocale } from '../src/types';

describe('locale resolution', () => {
  it('matches exact tags, case-insensitively', () => {
    expect(resolveLocale('pt-PT').code).toBe('pt-PT');
    expect(resolveLocale('PT-pt').code).toBe('pt-PT');
  });

  it('falls back to the bare language subtag', () => {
    expect(resolveLocale('pt-CV').code).toBe('pt-PT');
    expect(resolveLocale('en-GB').code).toBe('en-US');
  });

  it('falls back to en-US for unknown languages', () => {
    expect(resolveLocale('ja-JP').code).toBe('en-US');
    expect(getOrdinalWord(1, 'ja-JP')).toBe('first');
  });

  it('defaults to en-US when no locale is given', () => {
    expect(getOrdinalWord(2)).toBe('second');
  });

  it('lists the registered tags', () => {
    expect(getSupportedLocales()).toContain('pt-pt');
    expect(getSupportedLocales()).toContain('en-us');
  });
});

describe('bounds and validation', () => {
  it('returns the numeric form outside the supported range', () => {
    expect(getOrdinalWord(0, 'en-US')).toBe('0th');
    expect(getOrdinalWord(-1, 'en-US')).toBe('-1st');
    expect(getOrdinalWord(1_000_000_000, 'pt-PT')).toBe('1000000000.º');
  });

  it('rejects non-integers', () => {
    expect(() => getOrdinalWord(1.5, 'en-US')).toThrow(TypeError);
    expect(() => getOrdinalWord(Number.NaN, 'en-US')).toThrow(TypeError);
  });
});

describe('custom locales', () => {
  it('accepts a locale plugin', () => {
    const xx: OrdinalLocale = {
      code: 'xx',
      aliases: [],
      min: 1,
      max: 9,
      toWords: (n) => `#${n}`,
      suffix: () => '!'
    };
    registerLocale(xx);
    expect(getOrdinalWord(3, 'xx')).toBe('#3');
    expect(getOrdinalWord(30, 'xx')).toBe('30!');
  });
});
