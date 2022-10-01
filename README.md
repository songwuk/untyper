<h1 style='text-align:center'>
  <img src='./public/untyper.png' alt="logo">
</h1>

[![NPM version](https://img.shields.io/npm/v/untyper?color=a1b858&label=)](https://www.npmjs.com/package/untyper)

![untyper](./gif/CPT2209191551-397x87.gif)

## [Live demo](https://stackblitz.com/edit/vitejs-vite-2qxcej?file=main.js)
A simple typewriter for browser,Typing effects can be achieved using chained methods

## 🛹 TODO
- [x] support custom typing effect
- [x] support custom cursor
- [x] support move cursor
- [ ] support add any document node

## 🚀 Feature
  1. use [Web Animations API](https://developer.mozilla.org/en-US/docs/Web/API/Animation) Api to achieve typing effect
  2. Support custom typing speed
  3. Support chained methods
  
## 📦 Install

```bash
  npm install untyper
```

# Usage

```ts
import { UnTyper } from 'untyper'
const text = document.querySelector('#text')
const unTyper = new UnTyper(text, { speed: 100, startDelay: 1000 })
unTyper.type('hi', { delay: 200 }).go()

```

## Inspired by 
 - [typeit](https://github.com/alexmacarthur/typeit)

## License

[MIT](./LICENSE) License © 2022 [Song wuk](https://github.com/songwuk)
