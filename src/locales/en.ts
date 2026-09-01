import type { OrdinalLocale, OrdinalOptions } from '../types';

const UNITS = ['', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine'];
const TEENS = [
  'ten', 'eleven', 'twelve', 'thirteen', 'fourteen',
  'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen'
];
const TENS = [
  '', '', 'twenty', 'thirty', 'forty',
  'fifty', 'sixty', 'seventy', 'eighty', 'ninety'
];

/** Cardinal words that do not simply take -th. */
const IRREGULAR: Record<string, string> = {
  one: 'first',
  two: 'second',
  three: 'third',
  five: 'fifth',
  eight: 'eighth',
  nine: 'ninth',
  twelve: 'twelfth'
};

/** Spells 0-999 as a cardinal. Returns '' for 0. */
function cardinalTrio(value: number): string {
  const parts: string[] = [];
  const hundreds = Math.floor(value / 100);
  const rest = value % 100;

  if (hundreds > 0) parts.push(`${UNITS[hundreds]} hundred`);

  if (rest >= 20) {
    const tens = Math.floor(rest / 10);
    const units = rest % 10;
    parts.push(units > 0 ? `${TENS[tens]}-${UNITS[units]}` : TENS[tens]);
  } else if (rest >= 10) {
    parts.push(TEENS[rest - 10]);
  } else if (rest > 0) {
    parts.push(UNITS[rest]);
  }

  return parts.join(' ');
}

/** Spells 1-999,999,999 as a cardinal: 1234567 -> "one million two hundred thirty-four thousand five hundred sixty-seven". */
function cardinal(value: number): string {
  const parts: string[] = [];
  const millions = Math.floor(value / 1_000_000);
  const thousands = Math.floor((value % 1_000_000) / 1000);
  const rest = value % 1000;

  if (millions > 0) parts.push(`${cardinalTrio(millions)} million`);
  if (thousands > 0) parts.push(`${cardinalTrio(thousands)} thousand`);
  if (rest > 0) parts.push(cardinalTrio(rest));

  return parts.join(' ');
}

/** one -> first, twenty -> twentieth, six -> sixth. */
function ordinalizeWord(word: string): string {
  if (word in IRREGULAR) return IRREGULAR[word];
  if (word.endsWith('y')) return `${word.slice(0, -1)}ieth`;
  return `${word}th`;
}

/**
 * English ordinalises only the final element of the cardinal:
 * "twenty-one" -> "twenty-first", "two thousand" -> "two thousandth".
 */
function ordinalizePhrase(phrase: string): string {
  const words = phrase.split(' ');
  const segments = words[words.length - 1].split('-');
  segments[segments.length - 1] = ordinalizeWord(segments[segments.length - 1]);
  words[words.length - 1] = segments.join('-');
  return words.join(' ');
}

export const en: OrdinalLocale = {
  code: 'en-US',
  aliases: ['en', 'en-GB', 'en-AU', 'en-CA', 'en-IE', 'en-NZ', 'en-ZA'],
  min: 1,
  max: 999_999_999,

  toWords(value: number): string {
    return ordinalizePhrase(cardinal(value));
  },

  suffix(value: number, _options?: OrdinalOptions): string {
    const abs = Math.abs(value);
    // 11th, 12th, 13th break the 1/2/3 pattern; 111th, 112th, 113th too.
    if (abs % 100 >= 11 && abs % 100 <= 13) return 'th';
    switch (abs % 10) {
      case 1: return 'st';
      case 2: return 'nd';
      case 3: return 'rd';
      default: return 'th';
    }
  }
};
