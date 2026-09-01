# ordinal-words

Ordinal numbers in words (`twenty-first`, `vigésimo primeiro`) and in numeric form
(`21st`, `21.º`), across locales. Zero runtime dependencies, ESM + CJS, typed.

## Install

```bash
npm install ordinal-words
```

## Usage

```ts
import { getOrdinalWord, getOrdinalNumeric, getOrdinalSuffix } from 'ordinal-words';

getOrdinalWord(21, 'en-US');   // 'twenty-first'
getOrdinalWord(21, 'pt-PT');   // 'vigésimo primeiro'
getOrdinalWord(1_234_567);     // 'one million two hundred thirty-four thousand five hundred sixty-seventh'

getOrdinalNumeric(21, 'en-US'); // '21st'
getOrdinalNumeric(21, 'pt-PT'); // '21.º'

getOrdinalSuffix(2, 'en-US');   // 'nd'
```

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
| `getOrdinalWord(value, locale?, options?)` | the ordinal spelled out |
| `getOrdinalNumeric(value, locale?, options?)` | the digits plus the indicator |
| `getOrdinalSuffix(value, locale?, options?)` | the indicator alone |
| `resolveLocale(tag?)` | the `OrdinalLocale` a tag resolves to |
| `registerLocale(locale)` | adds or replaces a locale |
| `getSupportedLocales()` | every tag the registry answers to |

`locale` defaults to `'en-US'`.

**Options** — `gender: 'masculine' | 'feminine'` (default masculine),
`plural: boolean` (default `false`), `dot: boolean` (default `true`).

**Range** — each locale spells out 1 to 999,999,999. Outside that, the functions
fall back to the numeric form (`getOrdinalWord(0, 'en')` is `'0th'`) rather than
throwing. A non-integer throws a `TypeError`.

**Locale resolution** — exact tag, then the bare language subtag (`pt-CV` → `pt-PT`),
then `en-US`.

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

const es: OrdinalLocale = {
  code: 'es-ES',
  aliases: ['es'],
  min: 1,
  max: 999_999_999,
  toWords: (value, options) => { /* ... */ },
  suffix: (value, options) => (options?.gender === 'feminine' ? '.ª' : '.º')
};

registerLocale(es);
```

## Development

```bash
npm run typecheck
npm test
npm run build
```

## Known open question

For pt-PT, multiples of a thousand are composed as ordinal multiplier + noun:
`getOrdinalWord(2000, 'pt-PT')` returns `segundo milésimo`. Traditional grammars
also accept *bimilésimo* and *dois milésimos*. If you prefer one of those, the
rule lives in `src/locales/pt.ts` and affects nothing below 1000.

## License

ISC © Pedro Lopes
