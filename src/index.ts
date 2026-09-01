import type { OrdinalLocale, OrdinalOptions } from './types';
import { enUS } from './locales/en-US';
import { ptPT } from './locales/pt-PT';

export type { Gender, OrdinalLocale, OrdinalOptions } from './types';
export { enUS } from './locales/en-US';
export { ptPT } from './locales/pt-PT';

const DEFAULT_LOCALE = 'en-US';

const registry = new Map<string, OrdinalLocale>();

/** Adds (or replaces) a locale in the registry, under its code and every alias. */
export function registerLocale(locale: OrdinalLocale): void {
  registry.set(locale.code.toLowerCase(), locale);
  for (const alias of locale.aliases) registry.set(alias.toLowerCase(), locale);
}

registerLocale(enUS);
registerLocale(ptPT);

/** Every tag the registry answers to, sorted. */
export function getSupportedLocales(): string[] {
  return [...registry.keys()].sort();
}

/**
 * Resolves a BCP 47 tag: exact match, then the bare language subtag
 * ('pt-CV' -> 'pt'), then the default locale.
 */
export function resolveLocale(tag: string = DEFAULT_LOCALE): OrdinalLocale {
  const wanted = tag.toLowerCase();
  return registry.get(wanted)
    ?? registry.get(wanted.split('-')[0])
    ?? registry.get(DEFAULT_LOCALE.toLowerCase())!;
}

function assertInteger(value: number): void {
  if (!Number.isInteger(value)) {
    throw new TypeError(`Expected an integer, received ${value}`);
  }
}

/**
 * Spells a number out as an ordinal.
 *
 * Outside the locale's supported range the numeric form is returned instead,
 * so the function never throws on a valid integer.
 *
 * @example getOrdinalWord(21, 'en-US')                        // 'twenty-first'
 * @example getOrdinalWord(21, 'pt-PT')                        // 'vigésimo primeiro'
 * @example getOrdinalWord(21, 'pt-PT', { gender: 'feminine' }) // 'vigésima primeira'
 */
export function getOrdinalWord(
  value: number,
  locale: string = DEFAULT_LOCALE,
  options?: OrdinalOptions
): string {
  assertInteger(value);
  const target = resolveLocale(locale);

  if (value < target.min || value > target.max) {
    return getOrdinalNumeric(value, locale, options);
  }
  return target.toWords(value, options);
}

/**
 * The digits plus the locale's ordinal indicator.
 *
 * @example getOrdinalNumeric(21, 'en-US')                        // '21st'
 * @example getOrdinalNumeric(21, 'pt-PT')                        // '21.º'
 * @example getOrdinalNumeric(21, 'pt-PT', { gender: 'feminine' }) // '21.ª'
 */
export function getOrdinalNumeric(
  value: number,
  locale: string = DEFAULT_LOCALE,
  options?: OrdinalOptions
): string {
  assertInteger(value);
  return `${value}${getOrdinalSuffix(value, locale, options)}`;
}

/**
 * Just the indicator, for callers that render the digits themselves.
 *
 * @example getOrdinalSuffix(2, 'en-US') // 'nd'
 * @example getOrdinalSuffix(2, 'pt-PT') // '.º'
 */
export function getOrdinalSuffix(
  value: number,
  locale: string = DEFAULT_LOCALE,
  options?: OrdinalOptions
): string {
  assertInteger(value);
  return resolveLocale(locale).suffix(value, options);
}
