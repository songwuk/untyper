import { UnTyper } from '../src/index'
const text = document.querySelector('#text')! as HTMLElement
const unTyper = new UnTyper(text, { speed: 100, startDelay: 1000 })

unTyper.type('a simple typewriter for broswer', { delay: 200 })
  .delete(22, { delay: 500 })
  .type(' typewriter for rowser', { delay: 1200 })
  .move(-6, { delay: 500 })
  .type('b', { delay: 1400 })
  .move(null, { delay: 500, to: 'end' })
  .go()
