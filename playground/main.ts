import { UnTyper } from '../src/index'
import './main.css'
const text = document.querySelector('#text')! as HTMLElement
const text2 = document.querySelector('#text2')! as HTMLElement
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
const lineNew = `
a simple <span>typewriter</span>
 <em><strong class="font-semibold">for browser</strong></em>
  <span>and</span> more support`
const line = `<ol>
  <li><p>Roadtrippers [<a href="https://maps.roadtrippers.com/" target="_new">1</a>] is a website and app that allows you to plan your road trip by selecting your starting and ending points and adding any stops along the way. The site provides maps and guides to help you find the best places to visit, such as campsites, attractions, restaurants, and hotels. Roadtrippers also offers a paid service, Roadtrippers Plus, which provides additional features such as offline maps, customized itineraries, and exclusive discounts.</p></li>
  <li><p>Another option for planning a road trip is the website Roadtrippers.com [<a href="https://roadtrippers.com/" target="_new">2</a>], which allows you to input your desired route and interests, and provides a personalized itinerary with recommended stops along the way. Roadtrippers also includes reviews and ratings from other travelers to help you make informed decisions about where to go and what to do.</p></li>
  <li><p>For those looking for a more adventurous and off-the-beaten-path road trip, the website Road Trip USA [<a href="https://www.roadtripusa.com/" target="_new">3</a>] offers a guide to driving the &quot;Loneliest Road in America,&quot; US-50, which spans from San Francisco to Ocean City, Maryland. The site provides detailed information about the route, including recommended stops and attractions, as well as practical advice for road tripping, such as how to prepare your vehicle and what to pack.</p></li>
</ol>`
// unTyper.go()
const unTyper2 = new UnTyper(text2, {
  speed: 100,
  startDelay: 1000,
  // animate: {},
})
unTyper2
  .add(lineNew)
  .go()

unTyper
  .add(line)
  .go()
