import { UnTyper } from '../src/index'
import './main.css'
const text = document.querySelector('#text')! as HTMLElement
const unTyper = new UnTyper(text, {
  speed: 100,
  startDelay: 1000,
  // animate: {},
})
// const lenObject = {
//   'zh-CN': {
//     text: '嗨, 我正在成为独立<span>开发者 !</span>',
//   },
//   'en-US': {
//     text: 'Hi, I&apos;m becoming indie <span>developer !</span>',
//   },
// }
// let k = 0
// for (const i in lenObject) {
//   k++
//   if (k === Object.keys(lenObject).length)
//     unTyper.add(lenObject[i].text).delete(1)
//   else
//     unTyper.add(lenObject[i].text).delete(32)
// }

// unTyper.go()
unTyper
  .add('a simple ')
  .add('<span>typewriter</span>')
  .add(' <em><strong class="font-semibold">for browser</strong></em> and ')
  .delete(5)
  .add(' <span>and</span> more support')
  // .delete(30)
  .go()
