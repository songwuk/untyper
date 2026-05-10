import { expect, test } from 'vitest'
import { UnTyper } from '../src/index'
import type { UnTyperPlugin } from '../src/index'

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

/**
 * @vitest-environment jsdom
 */
test('Supports plugin actions and lifecycle hooks', async () => {
  const dom = document.createElement('div')
  document.body.appendChild(dom)
  const events: string[] = []
  const shoutPlugin: UnTyperPlugin = {
    name: 'shout',
    install(ctx) {
      ctx.hook('beforeRun', () => {
        events.push('beforeRun')
        ctx.enqueue({
          char: 'hookSuffix',
          func: () => {
            ctx.cursor?.insertAdjacentText('beforebegin', '!')
          },
        })
      })
      ctx.hook('afterRun', () => {
        events.push('afterRun')
      })
      ctx.registerAction('shout', (api, text: string) => {
        api.insertText(text.toUpperCase())
      })
    },
  }

  const unTyper = new UnTyper(dom, {
    speed: 1,
    startDelay: 0,
    plugins: [shoutPlugin],
  })

  await unTyper
    .type('say ')
    .action('shout', 'plugin')
    .go()

  expect(dom.textContent).toMatchInlineSnapshot('"say PLUGIN!|"')
  expect(events).toEqual(['beforeRun', 'afterRun'])
})

/**
 * @vitest-environment jsdom
 */
test('Supports function plugins with async queue items', async () => {
  const dom = document.createElement('div')
  document.body.appendChild(dom)
  const asyncTextPlugin = (ctx) => {
    ctx.registerAction('asyncText', (api, text: string) => {
      api.enqueue({
        char: 'asyncText',
        func: async () => {
          await new Promise(resolve => setTimeout(resolve, 5))
          api.cursor?.insertAdjacentText('beforebegin', text)
        },
      })
    })
  }

  const unTyper = new UnTyper(dom, {
    speed: 1,
    startDelay: 0,
  })

  await unTyper
    .use(asyncTextPlugin)
    .action('asyncText', 'later')
    .go()

  expect(dom.textContent).toMatchInlineSnapshot('"later|"')
})
