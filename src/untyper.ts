import * as parse5 from 'parse5'
import { parsehtml } from '../packages/h5/parse'
import { Queue } from '../packages/h5/queue'
import { delay, getMapSize, random, toString } from '../packages/h5/utils'
import { animationspancontent } from '../packages/h5/constants'
import { setcursoranimation } from '../packages/h5/cursoranimation'
import type {
  ActionOpts,
  ElementAnimation,
  ImageActionOpts,
  QueueItem,
  QueueItems,
  ScopeData,
} from './types'

type InsertPosition = 'beforebegin' | 'afterbegin' | 'beforeend' | 'afterend'

const DEFAULT_SCOPE: ScopeData = {
  speed: 120,
  startDelay: 0,
  animationspancontent,
  animate: {
    cancel: false,
  },
}

const VOID_ELEMENTS = new Set([
  'area',
  'base',
  'br',
  'col',
  'embed',
  'hr',
  'img',
  'input',
  'link',
  'meta',
  'param',
  'source',
  'track',
  'wbr',
])

export class UnTyper {
  private _dom: HTMLElement
  private _scopedata: ScopeData
  private _queue: QueueItems
  private _cursor: HTMLElement | null
  private _hashMap: Map<symbol, number>
  private _classSet: Set<number>

  constructor(dom: HTMLElement, scopedata: ScopeData = {}) {
    if (!dom)
      throw new Error('No element found')
    this._dom = dom
    this._scopedata = {
      ...DEFAULT_SCOPE,
      ...scopedata,
      animate: {
        ...DEFAULT_SCOPE.animate,
        ...scopedata.animate,
      },
    }
    this._queue = Queue([{ delay: this._scopedata.startDelay }])
    this._hashMap = new Map<symbol, number>()
    this._classSet = new Set<number>()
    this._cursor = this._initCursor()
  }

  private _checkRandom(randomSet: number): number {
    if (!this._classSet.has(randomSet)) {
      this._classSet.add(randomSet)
      return randomSet
    }
    return this._checkRandom(random(0, 100000))
  }

  private _initCursor(): null | HTMLElement {
    const classValue = this._checkRandom(random(0, 100000))
    const span = document.createElement('span')
    span.setAttribute('class', `cursor${classValue}`)
    span.style.width = '0'
    span.style.setProperty('--untyper-cursor-translate', '-0.05em')
    span.style.transform = 'translateX(var(--untyper-cursor-translate))'
    span.style.marginLeft = '2px'
    span.style.display = 'inline-block'
    span.textContent = this._scopedata.animationspancontent ?? animationspancontent
    span.style.visibility = 'visible'
    return span as HTMLElement
  }

  private _attachCursor() {
    if (this._dom && this._cursor)
      this._dom.appendChild(this._cursor)
    return setcursoranimation(this._cursor, {
      speed: this._scopedata.speed,
      animation: this._scopedata.cursorAnimation,
    })
  }

  private _applyAnimation(target: HTMLElement, animation?: ElementAnimation) {
    if (!animation)
      return
    const animatable = target as HTMLElement & {
      animate?: (keyframes: Keyframe[], options?: KeyframeAnimationOptions) => Animation
    }
    if (typeof animatable.animate !== 'function')
      return
    animatable.animate(animation.keyframes, animation.options)
  }

  private _type(char: string, positionSelect: InsertPosition = 'beforebegin') {
    const cursor = this._cursor
    cursor && cursor.insertAdjacentHTML(positionSelect, char)
  }

  private _queueAndReturn(steps: QueueItem[] | QueueItem, opts: ActionOpts = {}) {
    const _opts = this._queue.add(steps)
    if (opts && opts.delay)
      _opts.add({ delay: opts.delay })
    return this
  }

  // type text
  public type(text: string, opts: ActionOpts = {}) {
    const doc = Array.from(parse5.parseFragment(text).childNodes) as any[]
    const node = doc[0]
    if (!node)
      return this
    if (typeof node.value !== 'string')
      throw new Error('type only supports plain text nodes')
    if (node.value.length === 0)
      return this
    const { speed } = this._scopedata
    const chars = node.value ? node.value.split('') : []
    const charsAsQueueItems = chars.map((char: string) => {
      return {
        char,
        delay: speed,
        func: () => this._type(char),
      }
    })
    const itemtoQueue = [
      ...charsAsQueueItems,
      {
        char: 'calculateTotal',
        func: () => this._hashMap.set(Symbol(node.value.length), node.value.length),
      },
    ]
    return this._queueAndReturn(itemtoQueue, opts)
  }

  // move to next element
  public move(movementArg: number | null, opts: ActionOpts = {}) {
    const { speed } = this._scopedata
    if (movementArg === null || toString(movementArg) === 'null') {
      const { to } = opts
      if (to === 'end') {
        const endQuereItem = {
          char: 'end',
          delay: speed,
          func: () => {
            const cursor = this._cursor!
            cursor.style.setProperty('--untyper-cursor-translate', '-0.05em')
            const nodeParent = cursor.parentNode as HTMLElement
            const lastNode = nodeParent.childNodes[nodeParent.childNodes.length]
            nodeParent.insertBefore(cursor, lastNode)
          },
        }
        return this._queueAndReturn(endQuereItem, opts)
      }
      if (to === 'start') {
        const startQuereItem = {
          char: 'start',
          delay: speed,
          func: () => {
            const cursor = this._cursor!
            cursor.style.setProperty('--untyper-cursor-translate', '-0.2em')
            const nodeParent = cursor.parentNode as HTMLElement
            const lastNode = nodeParent.childNodes[0]
            nodeParent.insertBefore(cursor, lastNode)
          },
        }
        return this._queueAndReturn(startQuereItem, opts)
      }
      throw new Error('move requires a target direction when movementArg is null')
    }
    if (movementArg >= 0)
      throw new Error('movementArg must be negative')
    const len = movementArg * -1
    const moveQuereItem = Array.from({ length: len }, (_, item) => {
      return {
        char: `move${item}`,
        delay: speed,
        func: () => {
          const cursor = this._cursor!
          const nodeParent = cursor.parentNode as HTMLElement
          // 2 because of the cursor
          const nextSibling = nodeParent.childNodes[nodeParent.childNodes.length - item - 2]
          nextSibling && nodeParent.insertBefore(cursor, nextSibling)
        },
      }
    })
    return this._queueAndReturn(moveQuereItem, opts)
  }

  // pause typing
  public pause(ms: number) {
    return this._queueAndReturn([], {
      delay: ms,
    })
  }

  private _delete() {
    const cursor = this._cursor!
    const nodeParent = cursor.parentNode as HTMLElement
    const len = nodeParent.childNodes.length - 2 // exclude self
    let nodeToRemove: HTMLElement | ChildNode | null = null
    const dfs = (sibling: HTMLElement | ChildNode | null) => {
      const childnode = sibling?.childNodes as NodeListOf<ChildNode>
      if (toString(sibling?.childNodes[childnode?.length - 1]) !== 'text') {
        if (sibling) { dfs(sibling?.childNodes[0] ?? null) }
        else {
          // limit 最大删除
          if (nodeParent === this._dom)
            return false
          const nodeParentParent = nodeParent.parentNode
          nodeParentParent && nodeParentParent.insertBefore(cursor, nodeParent)
          nodeParent && nodeParent.remove()
          nodeParentParent && nodeParentParent.removeChild(cursor.previousSibling!)
        }
      }
      else {
        cursor.previousSibling?.appendChild(cursor)
        const prenodeParent = cursor.parentNode as HTMLElement
        prenodeParent && prenodeParent.removeChild(cursor.previousSibling!)
      }
    }
    if (toString(cursor.previousSibling) === 'text') {
      nodeToRemove = nodeParent.childNodes[len]
      nodeToRemove && nodeParent.removeChild(nodeToRemove)
    }
    else {
      dfs(cursor?.previousSibling)
    }
  }

  // delete text
  public delete(charAt: number, opts: ActionOpts = {}) {
    if (charAt <= 0)
      throw new Error('delete requires charAt to be greater than 0')
    const { speed } = this._scopedata
    // calculate the last index of the queue
    const diff = () => {
      const deleteQueueItem = Array.from({ length: charAt }, (_, i) => {
        return {
          char: `delete${i}`,
          delay: speed,
          func: () => this._delete(),
        }
      })
      this._queueAndReturn([...deleteQueueItem], opts)
    }
    diff()
    return this
  }

  private _addtype(text: string, opts: ActionOpts = {}, jumpNextLine = false) {
    const { speed } = this._scopedata
    const chars = text?.split('')
    const charsAsQueueItems = chars.map((char: string, i: number) => {
      return {
        char,
        delay: speed,
        func: () => {
          const cursor = this._cursor!
          cursor && cursor.insertAdjacentHTML('beforebegin', char)
          if (jumpNextLine && i === chars.length - 1) {
            const nodeParent = cursor.parentNode as HTMLElement
            const forLen = Number(nodeParent.getAttribute('data-source')) ?? 1
            let iParent = Number((nodeParent.parentNode as HTMLElement)?.getAttribute('data-source') ?? 0)
            let lastNode = cursor as HTMLElement as any
            while (iParent < forLen) {
              ++iParent
              for (let index = 1; index <= forLen; index++) {
                lastNode = lastNode.parentNode ?? cursor
                // delete inline style `data-source`
                this._deleteinlinestyle(lastNode)
              }
            }
            lastNode && lastNode.parentNode.appendChild(cursor) // --> put in outside
          }
        },
      }
    })
    const itemtoQueue = [
      ...charsAsQueueItems,
      {
        char: 'calculateTotal',
        func: () => this._hashMap.set(Symbol(text.length), text.length),
      },
    ]
    return this._queueAndReturn(itemtoQueue, opts)
  }

  public add(htmlelement: string, opts: ActionOpts = {}) {
    const doc = parse5.parseFragment(htmlelement)
    const documentFragment = Array.from(doc.childNodes) as any[]
    const textArr = parsehtml(documentFragment)
    let lastk = 0
    for (const text of textArr) {
      ++lastk
      const tag = text.func() as any
      if (typeof tag === 'string')
        this._addtype(tag, opts, text.isEmpty)
      else
        this._addDom(tag, opts)

      if (lastk === textArr.length) {
        const allTextCount = [{
          char: 'alltextcount',
          delay: 0,
          func: () => {
            const cursor = this._cursor!
            cursor && this._dom.appendChild(cursor)
            void getMapSize(this._hashMap)
          },
        }]
        this._queueAndReturn(allTextCount)
      }
    }
    return this
  }

  public image(src: string, opts: ImageActionOpts = {}) {
    if (!src)
      throw new Error('image requires a src value')
    const img = document.createElement('img')
    img.src = src
    if (opts.alt)
      img.alt = opts.alt
    if (opts.className)
      img.className = opts.className
    if (opts.width)
      img.width = opts.width
    if (opts.height)
      img.height = opts.height
    if (opts.attrs) {
      for (const [key, value] of Object.entries(opts.attrs))
        img.setAttribute(key, value)
    }
    return this._addDom(img, opts)
  }

  private _addDom(text: HTMLElement, opts: ActionOpts = {}) {
    const addDomAsQueueItems: any[] = []
    addDomAsQueueItems.push({
      char: 'addDom',
      delay: 0,
      func: async () => {
        const cursor = this._cursor!
        const nodeParent = cursor.parentNode as HTMLElement
        const lastNode = nodeParent.childNodes[getMapSize(this._hashMap)]
        nodeParent.insertBefore(text, lastNode ?? null)
        const dataSource = text.getAttribute('data-source')
        const textDepth = dataSource ? Number(dataSource) : null
        if (textDepth !== null) {
          const num = Number(nodeParent.getAttribute('data-source')) ?? 0
          let pNode = nodeParent as any
          if (textDepth < num) {
            for (let i = 0; i < num; i++) {
              pNode = pNode?.parentNode ?? pNode
              if (+pNode.getAttribute('data-source') === textDepth)
                break
            }
            pNode = pNode?.parentNode
            pNode.appendChild(text)
          }
          else if (textDepth === num) {
            pNode = pNode?.parentNode
            pNode.appendChild(text)
          }
        }
        // only add last childNode
        const tagName = text.tagName?.toLowerCase() ?? ''
        if (!VOID_ELEMENTS.has(tagName))
          text.insertBefore(cursor, null) // If this is null, then newNode is inserted at the end of node's child nodes.
        this._applyAnimation(text, opts.animation)
      },
    })
    return this._queueAndReturn(addDomAsQueueItems, opts)
  }

  private _checkinlinedom() {

  }

  private _deleteinlinestyle(nodeCurrent: HTMLElement) {
    nodeCurrent.removeAttribute('data-source')
  }

  // start typing
  public async go(): Promise<void> {
    return this.animateText()
  }

  private async animateText() {
    const animatefn = await this._attachCursor()
    const queueItems = [...this._queue.getQueue()]
    for (let i = 0; i < queueItems.length; i++) {
      const [_queueKey, queueItem] = queueItems[i]
      try {
        if (queueItem.func && typeof queueItem.func === 'function') {
          queueItem.func()
          if (queueItem.delay) {
            const jitter = Math.random() * 0.3 + 0.8
            const delayMs = (queueItem.delay ?? 0) * jitter
            if (delayMs >= 1000)
              animatefn.startCursorAnimation()
            else
              animatefn.stopCursorAnimation()
            await delay(delayMs, () => animatefn.stopCursorAnimation())
          }
        }
        else {
          await delay(queueItem.delay ?? 0, () => animatefn.stopCursorAnimation())
        }
        this._queue.cleanup(_queueKey)
      }
      catch (error) {
        console.error('An error occurred during animation:', error)
      }
    }
    if (this._queue.getQueue().size === 0) {
      if (!this._scopedata.animate?.cancel) { animatefn.startCursorAnimation() }
      else {
        animatefn.stopCursorAnimation()
        const cursor = this._cursor!
        cursor.style.display = 'none'
      }
    }
  }
}
