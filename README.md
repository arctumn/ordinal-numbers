# ordinal-words

Ordinal numbers in words (`twenty-first`, `vigésimo primeiro`) and in numeric form
(`21st`, `21.º`), across locales.

Zero runtime dependencies, two dev dependencies (TypeScript and its Node types), ESM + CJS, typed.
**You register the locales you want** — the library ships none by default and never
falls back to a language you did not ask for.

## Install

```bash
npm install ordinal-words
```

## Usage

Register a locale first. Each one lives at its own entry point, so importing one
never pulls in the others.

```ts
import { registerLocale, getOrdinalWord, getOrdinalNumeric, getOrdinalSuffix } from 'ordinal-words';
import { ptPT } from 'ordinal-words/locales/pt-PT';

registerLocale(ptPT);

getOrdinalWord(21, 'pt-PT');    // 'vigésimo primeiro'
getOrdinalNumeric(21, 'pt-PT'); // '21.º'
getOrdinalSuffix(2, 'pt-PT');   // '.º'

getOrdinalWord(21);             // 'vigésimo primeiro' — the first locale registered is the default
getOrdinalWord(21, 'en-US');    // RangeError: No locale registered for "en-US". Registered: pt-PT.
```

Add English the same way:

```ts
import { enUS } from 'ordinal-words/locales/en-US';

registerLocale(enUS);
getOrdinalWord(21, 'en-US');    // 'twenty-first'
getOrdinalNumeric(21, 'en-US'); // '21st'
```

Nothing is registered implicitly, and an unregistered tag throws a `RangeError`
naming what *is* registered rather than silently answering in another language.

### Gender and plural

Portuguese ordinals inflect. English ones do not, so the options are ignored there.

```ts
getOrdinalWord(21, 'pt-PT', { gender: 'feminine' });               // 'vigésima primeira'
getOrdinalWord(3,  'pt-PT', { gender: 'feminine', plural: true }); // 'terceiras'

getOrdinalNumeric(1, 'pt-PT', { gender: 'feminine' });  // '1.ª'
getOrdinalNumeric(3, 'pt-PT', { dot: false });          // '3º'
```

The numeric form defaults to `1.º`, the spelling prescribed by the Acordo
Ortográfico. Pass `{ dot: false }` for the common `1º`.

## API

| Function | Returns |
| --- | --- |
| `registerLocale(locale)` | adds or replaces a locale; the first one becomes the default |
| `unregisterLocale(locale \| tag)` | removes it and every tag pointing at it; `false` if it was not registered |
| `setDefaultLocale(tag)` | chooses the locale used when a call omits one |
| `getDefaultLocale()` | the current default's canonical code, or `undefined` |
| `getSupportedLocales()` | every tag the registry answers to; empty before the first registration |
| `resolveLocale(tag?)` | the `OrdinalLocale` a tag resolves to |
| `getOrdinalWord(value, locale?, options?)` | the ordinal spelled out |
| `getOrdinalNumeric(value, locale?, options?)` | the digits plus the indicator |
| `getOrdinalSuffix(value, locale?, options?)` | the indicator alone |

Omitting `locale` uses the default locale.

**Options** — `gender: 'masculine' | 'feminine'` (default masculine),
`plural: boolean` (default `false`), `dot: boolean` (default `true`).

**Range** — each locale spells out 1 to 999,999,999. Outside that, the functions
fall back to the numeric form (`getOrdinalWord(0, 'pt-PT')` is `'0.º'`) rather than
throwing. A non-integer throws a `TypeError`.

**Locale resolution** — the canonical tags are `en-US` and `pt-PT`. Resolution tries
the exact tag, then its registered aliases (`en`, `en-GB`, …; `pt`, `pt-BR`, …), then
the bare language subtag (`pt-CV` → `pt-PT`). No match is a `RangeError`.

## Why locales are plugins, not rows in one table

A single algorithm driven by a shared word list cannot produce correct English
and correct Portuguese, because the two languages compose ordinals differently:

- **Portuguese makes every element ordinal.** 234.º is *ducentésimo trigésimo
  quarto* — hundreds, tens and units all in ordinal form, concatenated.
- **English makes only the last element ordinal**, everything before it stays
  cardinal. 234th is *two hundred thirty-fourth*, not *two hundredth thirtieth
  fourth*. English also needs a teens list (*eleventh*, *twelfth* are not
  *tenth* + *first*/*second*) and a hyphen inside compound tens.

So `OrdinalLocale` is an interface with `toWords()` and `suffix()` methods, and
each language implements its own composition. Adding a locale is a new file, not
a new row.

## Adding a locale

```ts
import { registerLocale, type OrdinalLocale } from 'ordinal-words';

const esES: OrdinalLocale = {
  code: 'es-ES',
  aliases: ['es'],
  min: 1,
  max: 999_999_999,
  toWords: (value, options) => { /* ... */ },
  suffix: (value, options) => (options?.gender === 'feminine' ? '.ª' : '.º')
};

registerLocale(esES);
```

## Development

```bash
npm run typecheck   # tsc --noEmit
npm test            # node --test, no test framework installed
npm run build       # tsc into dist/esm and dist/cjs, no bundler
```

The only dev dependencies are `typescript` and `@types/node`. Tests run on Node's
built-in runner against the TypeScript sources directly, using Node's native type
stripping — hence `engines: node >= 22.18`.

## pt-PT: multiples of a thousand

Multiples of a thousand and of a million are composed as an ordinal multiplier
followed by the noun, and the whole phrase inflects together:

```ts
getOrdinalWord(2000, 'pt-PT');                        // 'segundo milésimo'
getOrdinalWord(15_000, 'pt-PT');                      // 'décimo quinto milésimo'
getOrdinalWord(2500, 'pt-PT');                        // 'segundo milésimo quingentésimo'
getOrdinalWord(2_000_000, 'pt-PT');                   // 'segundo milionésimo'
getOrdinalWord(2000, 'pt-PT', { gender: 'feminine' }); // 'segunda milésima'
```

Traditional grammars also record *bimilésimo* and *dois milésimos* for 2000.º.
This library uses the ordinal-multiplier form throughout, because it stays
regular across the whole range and inflects for gender and number like every
other element.

## License

ISC © Pedro Lopes
