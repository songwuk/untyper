import { expect, test } from 'vitest'
import { UnTyper } from '../src/index'

/**
 * @vitest-environment jsdom
 */
test('Element render correctly', async () => {
  const dom = document.createElement('div')
  document.body.appendChild(dom)
  dom.classList.add('typeText')
  const unTyper = new UnTyper(dom, {
    speed: 100,
    animate: {
      cancel: false,
    },
  })
  unTyper.type('type fn checked', {
    delay: 1000,
  }).go()
  await new Promise(resolve => setTimeout(resolve, 2500))
  const element = document.querySelector('.typeText')
  expect(element).not.toBeNull()
  expect(element?.textContent).toMatchInlineSnapshot('"type fn checked|"')
})
