import { UnTyper } from '../src/index'
import './main.css'
const text = document.querySelector('#text')! as HTMLElement
const text2 = document.querySelector('#text2')! as HTMLElement
const unTyper = new UnTyper(text, {
  speed: 100,
  startDelay: 1000,
  animationspancontent: '+',
  animate: {
    cancel: true,
  },
})
const lineNew = `
a simple <span>typewriter</span>
 <em><strong class="font-semibold">for browser</strong></em>
  <span>and</span> more support`
const line = `
  a simple <span>typewriter</span>
   <em><strong class="font-semibold">for browser</strong></em>
    <span>and</span> more support`
// unTyper.go()
const unTyper2 = new UnTyper(text2, {
  speed: 100,
  startDelay: 1000,
})
unTyper2
  .add(lineNew)
  .go()

unTyper
  .add(line)
  .go()
