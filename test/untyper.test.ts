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
    speed: 1,
    startDelay: 0,
    animate: {
      cancel: false,
    },
  })
  await unTyper.type('type fn checked', { delay: 5 }).go()
  const element = document.querySelector('.typeText')
  expect(element).not.toBeNull()
  expect(element?.textContent).toMatchInlineSnapshot('"type fn checked|"')
})

/**
 * @vitest-environment jsdom
 */
test('Supports chained operations', async () => {
  const dom = document.createElement('div')
  document.body.appendChild(dom)
  const unTyper = new UnTyper(dom, {
    speed: 1,
    startDelay: 0,
  })

  await unTyper
    .type('hello')
    .pause(5)
    .delete(2)
    .type('y!')
    .go()

  expect(dom.textContent).toMatchInlineSnapshot('"hely!|"')
})

/**
 * @vitest-environment jsdom
 */
test('Supports image insertion', async () => {
  const dom = document.createElement('div')
  document.body.appendChild(dom)
  const unTyper = new UnTyper(dom, {
    speed: 1,
    startDelay: 0,
  })

  await unTyper
    .type('Image: ')
    .image('https://example.com/logo.png', {
      alt: 'Brand',
      className: 'brand-logo',
      width: 120,
      height: 60,
      attrs: {
        'data-track': 'hero',
      },
    })
    .go()

  const img = dom.querySelector('img')
  expect(img).not.toBeNull()
  expect(img?.getAttribute('src')).toBe('https://example.com/logo.png')
  expect(img?.getAttribute('alt')).toBe('Brand')
  expect(img?.getAttribute('class')).toBe('brand-logo')
  expect(img?.getAttribute('width')).toBe('120')
  expect(img?.getAttribute('height')).toBe('60')
  expect(img?.getAttribute('data-track')).toBe('hero')
})
