import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  getOrdinal,
  getOrdinalSuffix,
  getOrdinalWord,
    registerLocale
} from '../src/index.ts';
import { ptPT } from '../src/locales/pt-PT.ts';

registerLocale(ptPT);

const words = (value: number) => getOrdinalWord(value, 'pt-PT');

describe('pt-PT words', () => {
  it('spells the units', () => {
    assert.deepEqual([1, 2, 3, 4, 5, 6, 7, 8, 9].map(words), [
      'primeiro', 'segundo', 'terceiro', 'quarto', 'quinto',
      'sexto', 'sétimo', 'oitavo', 'nono'
    ]);
  });

  it('keeps every element ordinal', () => {
    assert.equal(words(11), 'décimo primeiro');
    assert.equal(words(21), 'vigésimo primeiro');
    assert.equal(words(99), 'nonagésimo nono');
    assert.equal(words(100), 'centésimo');
    assert.equal(words(234), 'ducentésimo trigésimo quarto');
    assert.equal(words(999), 'nongentésimo nonagésimo nono');
  });

  it('spells thousands and millions', () => {
    assert.equal(words(1000), 'milésimo');
    assert.equal(words(1001), 'milésimo primeiro');
    assert.equal(words(1_000_000), 'milionésimo');
  });

  it('multiplies thousands and millions with an ordinal multiplier', () => {
    assert.equal(words(2000), 'segundo milésimo');
    assert.equal(words(3000), 'terceiro milésimo');
    assert.equal(words(15_000), 'décimo quinto milésimo');
    assert.equal(words(100_000), 'centésimo milésimo');
    assert.equal(words(2500), 'segundo milésimo quingentésimo');
    assert.equal(words(2_000_000), 'segundo milionésimo');
    assert.equal(words(21_000_000), 'vigésimo primeiro milionésimo');
    assert.equal(getOrdinalWord(2000, 'pt-PT', { gender: 'feminine' }), 'segunda milésima');
  });

  it('spells the top of the range', () => {
    assert.equal(
      words(999_999_999),
      'nongentésimo nonagésimo nono milionésimo nongentésimo nonagésimo nono milésimo '
      + 'nongentésimo nonagésimo nono'
    );
  });

  it('inflects for gender and number', () => {
    assert.equal(getOrdinalWord(21, 'pt-PT', { gender: 'feminine' }), 'vigésima primeira');
    assert.equal(getOrdinalWord(21, 'pt-PT', { plural: true }), 'vigésimos primeiros');
    assert.equal(getOrdinalWord(3, 'pt-PT', { gender: 'feminine', plural: true }), 'terceiras');
  });
});

describe('pt-PT numeric', () => {
  it('uses the ordinal indicator with the Acordo Ortográfico dot', () => {
    assert.equal(getOrdinal(1, 'pt-PT'), '1.º');
    assert.equal(getOrdinal(1, 'pt-PT', { gender: 'feminine' }), '1.ª');
    assert.equal(getOrdinal(2, 'pt-PT', { plural: true }), '2.ºs');
  });

  it('drops the dot on request', () => {
    assert.equal(getOrdinal(3, 'pt-PT', { dot: false }), '3º');
    assert.equal(getOrdinalSuffix(3, 'pt-PT', { dot: false, gender: 'feminine' }), 'ª');
  });
});
