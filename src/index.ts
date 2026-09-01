import type { OrdinalLocale, OrdinalOptions } from './types.ts';

export type { Gender, OrdinalLocale, OrdinalOptions } from './types.ts';

// Locales are deliberately NOT re-exported here. Import the ones you need from
// their own entry point — 'ordinal-words/locales/pt-PT' — so a build never
// carries a language nobody asked for.

/**
 * Registered locales, keyed by canonical code and by every alias, lower-cased.
 * Empty until the caller registers something: the library ships no locale by
 * default and never picks one on your behalf.
 */
const registry = new Map<string, OrdinalLocale>();

/** Tag used when a call omits the locale. Set by the first registration. */
let defaultTag: string | undefined;

/** Canonical codes currently registered, for error messages. */
function registeredCodes(): string {
  if (registry.size === 0) return 'none';
  return [...new Set([...registry.values()].map((locale) => locale.code))].join(', ');
}

/**
 * Adds (or replaces) a locale, under its canonical code and every alias.
 * The first locale registered becomes the default; change it with
 * {@link setDefaultLocale}.
 *
 * @example
 * import { registerLocale } from 'ordinal-words';
 * import { ptPT } from 'ordinal-words/locales/pt-PT';
 * registerLocale(ptPT);
 */
export function registerLocale(locale: OrdinalLocale): void {
  registry.set(locale.code.toLowerCase(), locale);
  for (const alias of locale.aliases) registry.set(alias.toLowerCase(), locale);
  defaultTag ??= locale.code.toLowerCase();
}

/**
 * Removes a locale and all the tags pointing at it. Returns false if it was
 * not registered. If it was the default, the default moves to another
 * registered locale, or becomes unset when none remain.
 */
export function unregisterLocale(locale: OrdinalLocale | string): boolean {
  const target = typeof locale === 'string' ? registry.get(locale.toLowerCase()) : locale;
  if (target === undefined) return false;

  let removed = false;
  for (const [tag, registered] of registry) {
    if (registered === target) {
      registry.delete(tag);
      removed = true;
    }
  }
  if (!removed) return false;

  if (defaultTag !== undefined && !registry.has(defaultTag)) {
    defaultTag = registry.keys().next().value;
  }
  return true;
}

/** Chooses the locale used when a call omits one. Throws if it is not registered. */
export function setDefaultLocale(tag: string): void {
  const wanted = tag.toLowerCase();
  if (!registry.has(wanted)) {
    throw new RangeError(`Cannot default to "${tag}": not registered. Registered: ${registeredCodes()}.`);
  }
  defaultTag = wanted;
}

/** The canonical code of the current default locale, or undefined if none is registered. */
export function getDefaultLocale(): string | undefined {
  return defaultTag === undefined ? undefined : registry.get(defaultTag)?.code;
}

/**
 * Every tag the registry answers to, sorted, in the casing each locale declares
 * — the registry keys are lower-cased so lookup ignores case, but that is an
 * implementation detail and BCP 47 tags are written 'pt-PT', not 'pt-pt'.
 * Empty before the first registration.
 */
export function getSupportedLocales(): string[] {
  const tags = new Set<string>();
  for (const locale of new Set(registry.values())) {
    tags.add(locale.code);
    for (const alias of locale.aliases) tags.add(alias);
  }
  return [...tags].sort();
}

/**
 * Resolves a BCP 47 tag to a registered locale: exact match, then the bare
 * language subtag ('pt-CV' -> 'pt-PT', when pt-PT is registered). Omit the tag
 * to get the default locale.
 *
 * Throws a RangeError rather than substituting a locale you did not ask for.
 */
export function resolveLocale(tag?: string): OrdinalLocale {
  if (tag === undefined) {
    if (defaultTag === undefined) {
      throw new RangeError(
        'No locale registered. Call registerLocale() with the locale you need, e.g. registerLocale(ptPT).'
      );
    }
    return registry.get(defaultTag)!;
  }

  const wanted = tag.toLowerCase();
  const found = registry.get(wanted) ?? registry.get(wanted.split('-')[0]);
  if (found === undefined) {
    throw new RangeError(`No locale registered for "${tag}". Registered: ${registeredCodes()}.`);
  }
  return found;
}

function assertInteger(value: number): void {
  if (!Number.isInteger(value)) {
    throw new TypeError(`Expected an integer, received ${value}`);
  }
}

/**
 * The ordinal in its everyday written form: the digits plus the locale's
 * indicator. This is the form most text actually uses — "21.º", not "vigésimo
 * primeiro" — so it is the one to reach for by default. Use
 * {@link getOrdinalWord} when you specifically want it spelled out.
 *
 * @example getOrdinal(21, 'pt-PT')                        // '21.º'
 * @example getOrdinal(21, 'pt-PT', { gender: 'feminine' }) // '21.ª'
 * @example getOrdinal(21, 'en-US')                        // '21st'
 */
export function getOrdinal(value: number, locale?: string, options?: OrdinalOptions): string {
  assertInteger(value);
  return `${value}${resolveLocale(locale).suffix(value, options)}`;
}

/**
 * Spells the ordinal out in words.
 *
 * Outside the locale's supported range it falls back to {@link getOrdinal},
 * so the function never throws on a valid integer in a registered locale.
 *
 * @example getOrdinalWord(21, 'en-US')                        // 'twenty-first'
 * @example getOrdinalWord(21, 'pt-PT')                        // 'vigésimo primeiro'
 * @example getOrdinalWord(21, 'pt-PT', { gender: 'feminine' }) // 'vigésima primeira'
 */
export function getOrdinalWord(value: number, locale?: string, options?: OrdinalOptions): string {
  assertInteger(value);
  const target = resolveLocale(locale);

  if (value < target.min || value > target.max) {
    return `${value}${target.suffix(value, options)}`;
  }
  return target.toWords(value, options);
}

/**
 * Just the indicator, for callers that render the digits themselves.
 *
 * @example getOrdinalSuffix(2, 'en-US') // 'nd'
 * @example getOrdinalSuffix(2, 'pt-PT') // '.º'
 */
export function getOrdinalSuffix(value: number, locale?: string, options?: OrdinalOptions): string {
  assertInteger(value);
  return resolveLocale(locale).suffix(value, options);
}
