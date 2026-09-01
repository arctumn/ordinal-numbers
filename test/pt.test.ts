import { describe, expect, it } from 'vitest';
import { getOrdinalNumeric, getOrdinalSuffix, getOrdinalWord } from '../src/index';

const words = (n: number) => getOrdinalWord(n, 'pt-PT');

describe('pt-PT words', () => {
  it('spells the units', () => {
    expect([1, 2, 3, 4, 5, 6, 7, 8, 9].map(words)).toEqual([
      'primeiro', 'segundo', 'terceiro', 'quarto', 'quinto',
      'sexto', 'sétimo', 'oitavo', 'nono'
    ]);
  });

  it('keeps every element ordinal', () => {
    expect(words(11)).toBe('décimo primeiro');
    expect(words(21)).toBe('vigésimo primeiro');
    expect(words(99)).toBe('nonagésimo nono');
    expect(words(100)).toBe('centésimo');
    expect(words(234)).toBe('ducentésimo trigésimo quarto');
    expect(words(999)).toBe('nongentésimo nonagésimo nono');
  });

  it('spells thousands and millions', () => {
    expect(words(1000)).toBe('milésimo');
    expect(words(1001)).toBe('milésimo primeiro');
    expect(words(1_000_000)).toBe('milionésimo');
  });

  it('multiplies thousands and millions with an ordinal multiplier', () => {
    expect(words(2000)).toBe('segundo milésimo');
    expect(words(3000)).toBe('terceiro milésimo');
    expect(words(15_000)).toBe('décimo quinto milésimo');
    expect(words(100_000)).toBe('centésimo milésimo');
    expect(words(2500)).toBe('segundo milésimo quingentésimo');
    expect(words(2_000_000)).toBe('segundo milionésimo');
    expect(words(21_000_000)).toBe('vigésimo primeiro milionésimo');
    expect(getOrdinalWord(2000, 'pt-PT', { gender: 'feminine' })).toBe('segunda milésima');
  });

  it('spells the top of the range', () => {
    expect(words(999_999_999)).toBe(
      'nongentésimo nonagésimo nono milionésimo nongentésimo nonagésimo nono milésimo '
      + 'nongentésimo nonagésimo nono'
    );
  });

  it('inflects for gender and number', () => {
    expect(getOrdinalWord(21, 'pt-PT', { gender: 'feminine' })).toBe('vigésima primeira');
    expect(getOrdinalWord(21, 'pt-PT', { plural: true })).toBe('vigésimos primeiros');
    expect(getOrdinalWord(3, 'pt-PT', { gender: 'feminine', plural: true })).toBe('terceiras');
  });
});

describe('pt-PT numeric', () => {
  it('uses the ordinal indicator with the Acordo Ortográfico dot', () => {
    expect(getOrdinalNumeric(1, 'pt-PT')).toBe('1.º');
    expect(getOrdinalNumeric(1, 'pt-PT', { gender: 'feminine' })).toBe('1.ª');
    expect(getOrdinalNumeric(2, 'pt-PT', { plural: true })).toBe('2.ºs');
  });

  it('drops the dot on request', () => {
    expect(getOrdinalNumeric(3, 'pt-PT', { dot: false })).toBe('3º');
    expect(getOrdinalSuffix(3, 'pt-PT', { dot: false, gender: 'feminine' })).toBe('ª');
  });
});
