import { UnTyper } from '../src/index'
import './main.css'
const text = document.querySelector('#text')! as HTMLElement
const unTyper = new UnTyper(text, {
  speed: 100,
  startDelay: 1000,
  // animate: {},
})

unTyper
  .add('a simple ')
  .add('<span>typewriter</span>')
  .add(' <em><strong class="font-semibold">for browser</strong></em> and ')
  .delete(5)
  .add(' <span>and</span> more support')
  // .add('<em><strong class="font-semibold">for browser</strong></em>123')
  // .move(null, { to: 'start', delay: 1000 })
  // .move(null, { to: 'end' })
  // .delete(30)
  .go()
