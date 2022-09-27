import { UnTyper } from '../src/index'
const text = document.querySelector('#text')! as HTMLElement
const unTyper = new UnTyper(text, { speed: 100, startDelay: 1000 })

unTyper.type('a simple typewriter for browser', { delay: 200 })
  .delete(22, { delay: 500 })
  .type(' typewritr for rowser', { delay: 1200 })
  .delete(6, { delay: 500 })
  .pause(1000)
  .move(-6, { delay: 500 })
  .type('e', { delay: 1400 })
  .move(null, { delay: 500, to: 'end' })
  .type(' browser', { delay: 1200 })
  .go()
