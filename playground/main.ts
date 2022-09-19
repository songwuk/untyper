import { UnTyper } from '../src/index'
const text = document.querySelector('#text')! as HTMLElement
const unTyper = new UnTyper(text, { speed: 100, startDelay: 1000 })

const btn = document.querySelector('.btn') as HTMLElement
unTyper.type('a simple typewriter for brower', { delay: 200 })
  .delete(21, { delay: 500 })
  .type(' typewriter for brower', { delay: 200 })
  .go()
btn.addEventListener('click', () => {

})
