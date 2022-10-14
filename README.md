# ^^_^^ **untyper**
> Looking forward to your feedback

[![NPM version](https://img.shields.io/npm/v/untyper?color=a1b858&label=)](https://www.npmjs.com/package/untyper)

![untyper](./gif/Kapture%202022-10-14%20at%2014.22.02.gif)

## [Live demo](https://stackblitz.com/edit/vitejs-vite-2qxcej?file=main.js)
A simple typewriter for browser,Typing effects can be achieved using chained methods

## 🛹 &nbsp;TODO
- [x] support custom typing effect
- [x] support custom cursor
- [x] support move cursor
- [x] support add any document node
- ...

## 🚀&nbsp; Feature
  1. use [Web Animations API](https://developer.mozilla.org/en-US/docs/Web/API/Animation) Api to achieve typing effect
  2. Support custom typing speed
  3. Support chained methods
  
## 📦&nbsp; Install

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
## Api
#### type 
> **Warning**: only support string
> input 
  - text `string` 
  - opts: `object` -> delay?: `number`
> output
  - `this`
#### pause 
> input 
  - ms `number` 
> output
  - `this`
####  delete
> input 
  - charAt: `number` > 0
  - opts: `object` -> delay?: `number`
> output
  - `this`
#### move
> input 
  - movementArg: `number | null`
  - opts?: `object`-> {to?: `string`, delay?: `number`}
> output 
  - `this`
#### add
> input
  - text `string | HTMLElement` 
  - opts: `object` -> delay?: `number`
> output 
  - `this`

#### go
> output
  - `Promise`

## License

[MIT](./LICENSE) License © 2022 [Song wuk](https://github.com/songwuk)
