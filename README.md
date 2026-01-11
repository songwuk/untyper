# ^^_^^ **untyper**
> Looking forward to your feedback

[![NPM version](https://img.shields.io/npm/v/untyper?color=a1b858&label=)](https://www.npmjs.com/package/untyper)

![untyper](./gif/Kapture%202022-10-14%20at%2014.22.02.gif)

## [Live demo](https://stackblitz.com/edit/vitejs-vite-2qxcej?file=main.js)
A typewriter utility for the browser. It builds a queue of actions so you can chain `type`, `pause`, `delete`, `move`, `add`, `image`, and then run them with `go()`.

## 🚀 Features
- Chained typing actions powered by the Web Animations API cursor
- Customizable typing speed, start delay, and cursor animation
- Supports plain text typing as well as inserting HTML elements and images
- Optional per-element animations when inserting DOM nodes
- Works with any DOM element

## 📦 Install

```bash
npm install untyper
```

## Usage

```ts
import { UnTyper } from 'untyper'

const target = document.querySelector('#text')
const typer = new UnTyper(target, {
  speed: 90,
  startDelay: 300,
  cursorAnimation: {
    kind: 'combined',
    duration: 900,
  },
})

await typer
  .type('Hi there!')
  .pause(400)
  .delete(6)
  .type('untyper!')
  .go()
```

## API

### `new UnTyper(element, options)`

| Option | Type | Default | Description |
| --- | --- | --- | --- |
| `speed` | `number` | `120` | Base delay between characters (ms). |
| `startDelay` | `number` | `0` | Delay before the queue starts (ms). |
| `animationspancontent` | `string` | `|` | Cursor character. |
| `animate.cancel` | `boolean` | `false` | Hide cursor after the queue completes. |
| `cursorAnimation` | `CursorAnimationOptions` | — | Cursor animation customization. |

### `type(text, options)`
Adds a plain text typing action. HTML is not supported here.

- `text`: `string`
- `options.delay`: optional delay (ms) after typing this text

Returns `this`.

### `pause(ms)`
Adds a pause action.

- `ms`: `number`

Returns `this`.

### `delete(charCount, options)`
Deletes characters from the current cursor position.

- `charCount`: `number` (must be greater than 0)
- `options.delay`: optional delay (ms) after deleting

Returns `this`.

### `move(movementArg, options)`
Moves the cursor.

- `movementArg`: `number | null`
  - Provide a negative number to move left by that many characters.
  - Use `null` with `options.to = 'start' | 'end'` to jump to the start or end.

Returns `this`.

### `add(html, options)`
Parses HTML and inserts elements with typing animation for text nodes. You can pass `options.animation` to animate inserted elements.

- `html`: `string`
- `options.delay`: optional delay (ms) after adding
- `options.animation`: optional `ElementAnimation` to apply to added elements

Returns `this`.

### `image(src, options)`
Inserts an `img` element with optional attributes. You can also pass `options.animation` to animate the image after insertion.

- `src`: `string`
- `options.alt`: `string`
- `options.className`: `string`
- `options.width`: `number`
- `options.height`: `number`
- `options.attrs`: `Record<string, string>` for additional attributes
- `options.delay`: optional delay (ms) after inserting
- `options.animation`: optional `ElementAnimation` to apply to the image

Returns `this`.

### `go()`
Runs the queued actions.

Returns `Promise<void>`.

## Animation support
You can apply custom animations to inserted DOM elements using `options.animation` on `add` or `image`.

```ts
await typer
  .add('<strong>Spotlight</strong>', {
    animation: {
      keyframes: [
        { opacity: 0, transform: 'translateY(4px)' },
        { opacity: 1, transform: 'translateY(0)' },
      ],
      options: { duration: 300, easing: 'ease-out' },
    },
  })
  .image('/logo.png', {
    alt: 'Brand logo',
    animation: {
      keyframes: [
        { transform: 'scale(0.9)', opacity: 0 },
        { transform: 'scale(1)', opacity: 1 },
      ],
      options: { duration: 250 },
    },
  })
  .go()
```

## License

[MIT](./LICENSE) License © 2022 [Song wuk](https://github.com/songwuk)
