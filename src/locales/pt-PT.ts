import type { OrdinalLocale, OrdinalOptions } from '../types.ts';

const UNITS = ['', 'primeiro', 'segundo', 'terceiro', 'quarto', 'quinto', 'sexto', 'sétimo', 'oitavo', 'nono'];
const TENS = ['', 'décimo', 'vigésimo', 'trigésimo', 'quadragésimo', 'quinquagésimo', 'sexagésimo', 'septuagésimo', 'octogésimo', 'nonagésimo'];
const HUNDREDS = ['', 'centésimo', 'ducentésimo', 'trecentésimo', 'quadringentésimo', 'quingentésimo', 'seiscentésimo', 'septingentésimo', 'octingentésimo', 'nongentésimo'];
const THOUSAND = 'milésimo';
const MILLION = 'milionésimo';

/** Spells 0-999. Portuguese keeps every element ordinal: 234 -> "ducentésimo trigésimo quarto". */
function ordinalTrio(value: number): string {
  return [
    HUNDREDS[Math.floor(value / 100)],
    TENS[Math.floor((value % 100) / 10)],
    UNITS[value % 10]
  ].filter(Boolean).join(' ');
}

/** Every ordinal word ends in -o, so gender and number are a suffix swap. */
function inflect(phrase: string, options?: OrdinalOptions): string {
  const feminine = options?.gender === 'feminine';
  const plural = options?.plural === true;
  if (!feminine && !plural) return phrase;

  return phrase
    .split(' ')
    .map((word) => {
      const stem = feminine ? `${word.slice(0, -1)}a` : word;
      return plural ? `${stem}s` : stem;
    })
    .join(' ');
}

export const ptPT: OrdinalLocale = {
  code: 'pt-PT',
  aliases: ['pt', 'pt-BR', 'pt-AO', 'pt-MZ'],
  min: 1,
  max: 999_999_999,

  toWords(value: number, options?: OrdinalOptions): string {
    const parts: string[] = [];
    const millions = Math.floor(value / 1_000_000);
    const thousands = Math.floor((value % 1_000_000) / 1000);
    const rest = value % 1000;

    if (millions > 0) {
      parts.push(millions === 1 ? MILLION : `${ordinalTrio(millions)} ${MILLION}`);
    }
    if (thousands > 0) {
      parts.push(thousands === 1 ? THOUSAND : `${ordinalTrio(thousands)} ${THOUSAND}`);
    }
    if (rest > 0) {
      parts.push(ordinalTrio(rest));
    }

    return inflect(parts.join(' '), options);
  },

  suffix(_value: number, options?: OrdinalOptions): string {
    const indicator = options?.gender === 'feminine' ? 'ª' : 'º';
    const dot = options?.dot === false ? '' : '.';
    return `${dot}${indicator}${options?.plural ? 's' : ''}`;
  }
};
