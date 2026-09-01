/** Grammatical gender. Only meaningful in locales that inflect ordinals (pt, es, fr, ...). */
export type Gender = 'masculine' | 'feminine';

export interface OrdinalOptions {
  /** Grammatical gender of the noun being counted. Ignored by locales without gender (en). Default: 'masculine'. */
  gender?: Gender;
  /** Render the plural form ("primeiras", "21.ºs"). Ignored by locales without ordinal plurals (en). Default: false. */
  plural?: boolean;
  /** Include the ordinal-indicator dot in the numeric form ("1.º" vs "1º"). Only used by locales that have one. Default: true. */
  dot?: boolean;
}

/**
 * A locale plugin. Each language owns its own composition rules, because those
 * rules differ structurally between languages and cannot be expressed by a
 * shared algorithm over a flat word list (see README, "Why locales are plugins").
 */
export interface OrdinalLocale {
  /** Canonical BCP 47 tag, e.g. 'en-US'. */
  readonly code: string;
  /** Extra tags resolving to this locale, e.g. ['en', 'en-GB']. */
  readonly aliases: readonly string[];
  /** Smallest number this locale can spell out. */
  readonly min: number;
  /** Largest number this locale can spell out. */
  readonly max: number;
  /** Spell the ordinal out in words: 21 -> "twenty-first" / "vigésimo primeiro". */
  toWords(value: number, options?: OrdinalOptions): string;
  /** The indicator appended to the digits: 21 -> "st" / ".º". */
  suffix(value: number, options?: OrdinalOptions): string;
}
