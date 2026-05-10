import { UnTyper } from '../src/index'
import type { ActionOpts, UnTyperPlugin, UnTyperPluginContext } from '../src/index'
import './main.css'

const text = document.querySelector('#text')! as HTMLElement
const text2 = document.querySelector('#text2')! as HTMLElement
const restart = document.querySelector('#restart')! as HTMLButtonElement
const eventLog = document.querySelector('#event-log')! as HTMLOListElement
const coreStatus = document.querySelector('#core-status')! as HTMLElement
const pluginStatus = document.querySelector('#plugin-status')! as HTMLElement

const logoSvg = `
<svg xmlns="http://www.w3.org/2000/svg" width="232" height="84" viewBox="0 0 232 84">
  <rect width="232" height="84" rx="12" fill="#1f3a2e"/>
  <path d="M32 56V28h14c8 0 13 4 13 10s-5 10-13 10h-6v8h-8Zm8-15h6c3 0 5-1 5-3s-2-3-5-3h-6v6Z" fill="#f7f4ee"/>
  <text x="74" y="53" fill="#f7f4ee" font-family="Arial, sans-serif" font-size="30" font-weight="700">UnTyper</text>
</svg>`
const logoSrc = `data:image/svg+xml,${encodeURIComponent(logoSvg)}`

const fadeIn: ActionOpts['animation'] = {
  keyframes: [
    { opacity: 0, transform: 'translateY(6px)' },
    { opacity: 1, transform: 'translateY(0)' },
  ],
  options: { duration: 280, easing: 'ease-out' },
}

const popIn: ActionOpts['animation'] = {
  keyframes: [
    { opacity: 0, transform: 'scale(0.86)' },
    { opacity: 1, transform: 'scale(1)' },
  ],
  options: { duration: 240, easing: 'cubic-bezier(.2,.8,.2,1)' },
}

function logEvent(message: string) {
  const item = document.createElement('li')
  item.textContent = message
  eventLog.appendChild(item)
}

function clearDemo() {
  text.replaceChildren()
  text2.replaceChildren()
  eventLog.replaceChildren()
  coreStatus.textContent = 'running'
  pluginStatus.textContent = 'running'
}

function createBadgePlugin(): UnTyperPlugin<{ label: string; log: (message: string) => void }> {
  return {
    name: 'playground-badge',
    install(ctx, options) {
      ctx.hook('beforeRun', ({ root }) => {
        root.dataset.state = 'running'
        options?.log(`plugin beforeRun speed=${ctx.options.speed}`)
      })

      ctx.hook('afterRun', ({ cursor, root }) => {
        root.dataset.state = 'complete'
        if (cursor)
          cursor.title = 'Animated by UnTyper'
        options?.log('plugin afterRun')
      })

      ctx.hook('onError', ({ error }) => {
        options?.log(`plugin onError ${String(error)}`)
      })

      ctx.registerAction('badge', (api, label = options?.label ?? 'plugin') => {
        const badge = document.createElement('span')
        badge.className = 'plugin-badge'
        badge.textContent = label
        api.insertElement(badge, { animation: popIn })
      })
    },
  }
}

function asyncQueuePlugin(ctx: UnTyperPluginContext) {
  ctx.registerAction('asyncText', (api, value: string) => {
    api.enqueue({
      char: 'asyncText',
      delay: 120,
      meta: { source: 'asyncQueuePlugin' },
      func: async () => {
        await new Promise(resolve => setTimeout(resolve, 120))
        api.cursor?.insertAdjacentText('beforebegin', value)
      },
    })
  })
}

async function runCoreExample() {
  const unTyper = new UnTyper(text, {
    speed: 42,
    startDelay: 250,
    animationspancontent: '+',
    animate: {
      cancel: false,
    },
    cursorAnimation: {
      kind: 'combined',
      duration: 900,
      size: {
        minScale: 0.75,
        maxScale: 1.3,
      },
      gradient: {
        from: '#245b41',
        to: '#c66a2b',
        angle: 70,
      },
    },
  })

  await unTyper
    .type('Untyper can typoo', { delay: 180 })
    .delete(2, { delay: 120 })
    .type('e')
    .pause(240)
    .move(null, { to: 'start', delay: 100 })
    .type('Core chain: ')
    .move(null, { to: 'end', delay: 100 })
    .type(' text, ')
    .move(-6, { delay: 80 })
    .type('moving cursor, ')
    .move(null, { to: 'end', delay: 120 })
    .add(' <strong>HTML</strong>, <em>nested <mark>marks</mark></em>, and <a href="https://github.com/songwuk/untyper">links</a>.', {
      delay: 180,
      animation: fadeIn,
    })
    .image(logoSrc, {
      alt: 'UnTyper logo',
      className: 'inline-logo',
      width: 116,
      height: 42,
      attrs: {
        'data-track': 'playground-image',
      },
      animation: popIn,
    })
    .go()

  coreStatus.textContent = 'complete'
}

async function runPluginExample() {
  const unTyper = new UnTyper(text2, {
    speed: 55,
    startDelay: 400,
    animationspancontent: '|',
    animate: {
      cancel: true,
    },
    plugins: [[createBadgePlugin(), { label: 'ctor plugin', log: logEvent }]],
  })

  unTyper
    .use(asyncQueuePlugin)
    .registerAction('wrap', (ctx, value: string) => {
      ctx.insertText(`[${value}]`)
    })

  await unTyper
    .type('Plugin chain: ')
    .action('badge', 'installed')
    .type(' ')
    .action('asyncText', 'async queue ')
    .pause(160)
    .action('wrap', 'instance action')
    .add(' <strong>done</strong>.', { animation: fadeIn })
    .go()

  pluginStatus.textContent = 'complete'
}

async function runPlayground() {
  clearDemo()
  await Promise.all([
    runCoreExample(),
    runPluginExample(),
  ])
}

restart.addEventListener('click', () => {
  runPlayground().catch(console.error)
})

runPlayground().catch(console.error)
