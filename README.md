# smart-number-input

A tiny, framework‑agnostic utility that turns a regular `<input>` into a well-behaved **numeric** field with formatting and validation powered by [numeral.js](http://numeraljs.com/).

- **Dual formatting**: one format while typing (focus), another when blurred
- **Validation**: `min`, `max`, and opt‑out of negatives
- **Keyboard**: ArrowUp/ArrowDown stepping with a configurable step
- **Value access**: keep using `input.value` (string)
- **Value Change Callback**: assign custom callback methods to call on value change on initialization or after
- **Framework‑agnostic**: works in vanilla JS, React, Vue, etc.
- **Side‑effect free on import**: only mutates the element you pass to it

## Install

```bash
npm i smart-number-input
# or
pnpm add smart-number-input
# or
yarn add smart-number-input
```

## Quick start

```ts
import { createNumberInput } from 'smart-number-input';

const el = document.querySelector<HTMLInputElement>('#price')!;

const handle = createNumberInput(el, {
  focusFormat: '0,0[.]00', // while editing
  blurFormat: '$0,0.00',   // when blurred
  allowNegative: false,
  min: 0,
  max: 999999,
  step: 5,
  onValueChange(newVal, oldVal) {
    console.log('value changed:', { newVal, oldVal });
  },
  onInvalidInput(reason, ctx) {
    console.warn('invalid input:', reason, ctx);
  },
});
```

### Browser (no bundler)

```html
<script type="module">
  import { createNumberInput } from 'https://cdn.jsdelivr.net/npm/smart-number-input/+esm';
  // …
</script>

```

> **SSR note:** This package accesses `document` and `HTMLInputElement`. Import it normally, but call `createNumberInput` only on the client.

## API

### `createNumberInput(element, options?) => { destroy() }`

Enhances an existing `<input>` (type can be `"text"` or `"number"`) to behave as a formatted numeric field.

- **`element: HTMLInputElement`** – the input to enhance.
- **`options`**:

| Option | Type | Default | Description |
|---|---|---|---|
| `focusFormat` | `string` | `"0.[000000000000000]"` | Numeral.js format while the input has focus. It is recomended that you keep a high level of precision so as to not loose exact values that users input. |
| `blurFormat` | `string` | `"0.[0]"` | Numeral.js format when blurred. |
| `allowNegative` | `boolean` | `true` | Whether to allow negative values. |
| `min` | `number` | `undefined` | Minimum allowed value (inclusive). |
| `max` | `number` | `undefined` | Maximum allowed value (inclusive). |
| `stepValue` / `step` | `number` | `1` | Increment/decrement size for ArrowUp/ArrowDown. |
| `onValueChange` / `valueChangeCallback` | `(newVal: number\|null, oldVal: number\|null) => void` | `undefined` | Updates the elements onValueChange property which is called on valid value update. |
| `onInvalidInput` / `invalidInputCallback` | `(reason: 'negative-violation'\|'min-violation'\|'max-violation' \| Array<...>, ctx: { attempted: string; parsed: number\|null; oldValue: number\|null; element: HTMLInputElement }) => void` | `undefined` | Called once when user input is rejected. |

**Return value**: `{ destroy(): void }` – removes listeners and restores the element.

### Values & formatting

- `el.value` returns the numeric value as a **string**.
- You can also use `el.value` to set the input field’s value using either a number or a string (formatted or unformatted). This is treated as a trusted action and bypasses validation.
- When focused, the input uses `focusFormat`. When blurred, it uses `blurFormat`.
- The module parses with numeral.js and enforces `min`, `max`, and `allowNegative` both on free typing and when stepping with Arrow keys.
- `el.textValue` can be used to read the exact text content of an input field.
- `el.onValueChange` is read on value change. This can either be set in options or later directly.

## TypeScript

Type definitions are included. If you keep the file local, add to `package.json`:

```json
{
  "types": "index.d.ts"
}
```

## License

MIT © Geoffrey Wortham
