import * as parse5 from 'parse5'
import { parsehtml } from './Parse'
import { Queue } from './queue'
import type { ActionOpts, QueueItem, QueueItems, ScopeData } from './types'
import { delay, random, toString } from './utils'
import { animationspancontent } from './constants'
import { setcursoranimation } from './cursoranimation'
const HashMap = new Map()
type InsertPosition = 'beforebegin' | 'afterbegin' | 'beforeend' | 'afterend'
export class UnTyper {
  private _dom: HTMLElement
  private _scopedata: ScopeData
  private _queue: QueueItems
  private _addTotalNumber: number
  private _cursor: HTMLElement | null
  constructor(dom: HTMLElement, scopedata: ScopeData = {}) {
    if (!dom)
      throw new Error('No element found')
    this._dom = dom
    this._addTotalNumber = 0
    this._scopedata = scopedata
    this._queue = Queue([{ delay: this._scopedata.startDelay }])
    this._cursor = this._initCursor()
  }

  private _initCursor(): null | HTMLElement {
    const span = document.createElement('span')
    span.setAttribute('class', 'cursor')
    span.style.width = '0'
    span.style.transform = 'translateX(-0.05em)'
    span.style.display = 'inline-block'
    span.textContent = animationspancontent
    span.style.visibility = 'visible'
    return span as HTMLElement
  }

  private async _attachCursor() {
    if (this._dom && this._cursor)
      this._dom.appendChild(this._cursor)
    setcursoranimation(this._cursor, { speed: this._scopedata.speed })
  }

  private _type(char: string, positionSelect: InsertPosition = 'beforebegin') {
    const cursor = document.querySelector('.cursor') as HTMLElement
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
    this._addTotalNumber += doc[0].value?.length
    const { speed } = this._scopedata
    const chars = doc[0].value?.split('')
    const charsAsQueueItems = chars.map((char: string) => {
      return {
        char,
        delay: speed,
        func: () => this._type(char),
      }
    })
    const itemtoQueue = [
      ...charsAsQueueItems,
    ]
    return this._queueAndReturn(itemtoQueue, opts)
  }

  // move to next element
  public move(movementArg: number | null, opts: ActionOpts = {}) {
    const { speed } = this._scopedata
    if (toString(movementArg) === 'null') {
      const { to } = opts
      if (to === 'end') {
        const endQuereItem = {
          char: 'end',
          delay: speed,
          func: () => {
            const cursor = document.querySelector('.cursor') as HTMLElement
            const nodeParent = cursor.parentNode as HTMLElement
            const lastNode = nodeParent.childNodes[nodeParent.childNodes.length]
            nodeParent.insertBefore(cursor, lastNode)
          },
        }
        return this._queueAndReturn(endQuereItem, opts)
      }
      else if (to === 'start') {
        const startQuereItem = {
          char: 'start',
          delay: speed,
          func: () => {
            const cursor = document.querySelector('.cursor') as HTMLElement
            const nodeParent = cursor.parentNode as HTMLElement
            const lastNode = nodeParent.childNodes[0]
            nodeParent.insertBefore(cursor, lastNode)
          },
        }
        return this._queueAndReturn(startQuereItem, opts)
      }
    }
    if (movementArg! >= 0)
      throw new Error('movementArg must be negative')
    const len = movementArg! * -1
    const moveQuereItem = Array.from({ length: len }, (_, item) => {
      return {
        char: `move${item}`,
        delay: speed,
        func: () => {
          const cursor = document.querySelector('.cursor') as HTMLElement
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

  private _delete(index: number) {
    const cursor = document.querySelector('.cursor') as HTMLElement
    const nodeParent = cursor.parentNode as HTMLElement
    let nodeToRemove: HTMLElement | ChildNode | null = null
    if (nodeParent.childNodes.length > 1) {
      nodeToRemove = nodeParent.childNodes[index]
      nodeToRemove && nodeParent.removeChild(nodeToRemove)
    }
    else {
      nodeToRemove = nodeParent
      nodeToRemove.remove()
    }
  }

  // delete text
  public delete(charAt: number, opts: ActionOpts = {}) {
    const { speed } = this._scopedata
    // calculate the last index of the queue
    let lastIndex = 0
    lastIndex = (this._addTotalNumber)
    const deleteQueueItem = Array.from({ length: charAt }, (_, i) => {
      ++i
      if (i === charAt)
        this._addTotalNumber -= charAt
      return {
        char: `delete${i}`,
        delay: speed,
        func: () => this._delete(lastIndex - i),
      }
    })
    return this._queueAndReturn(deleteQueueItem, opts)
  }

  public _addtype(text: string, opts: ActionOpts = {}, shouldNewline: boolean) {
    const doc = Array.from(parse5.parseFragment(text).childNodes) as any[]
    this._addTotalNumber += doc[0].value?.length
    const { speed } = this._scopedata
    const chars = doc[0].value?.split('')
    const charsAsQueueItems = chars.map((char: string, i: number) => {
      return {
        char,
        delay: speed,
        func: () => {
          const cursor = document.querySelector('.cursor') as HTMLElement
          if (shouldNewline && i === 0) {
            const nodeParent = cursor.parentNode as HTMLElement
            const lastNode = nodeParent.parentNode as HTMLElement
            lastNode && lastNode.appendChild(cursor)
          }
          cursor && cursor.insertAdjacentHTML('beforebegin', char)
        },
      }
    })
    const itemtoQueue = [
      ...charsAsQueueItems,
    ]
    return this._queueAndReturn(itemtoQueue, opts)
  }

  public add(htmlelement: string, opts: ActionOpts = {}) {
    const doc = parse5.parseFragment(htmlelement)
    const documentFragment = Array.from(doc.childNodes) as any[]
    const textArr = parsehtml(documentFragment)
    let lenPartof = 0
    let k = 0
    let kk = 0
    for (const text of textArr) {
      ++k
      const tag = text.func()
      if (typeof tag === 'string') {
        kk++
        this._addtype(tag, opts, kk === 2)
        lenPartof += tag.length
        if (HashMap.get('len'))
          HashMap.set('len', HashMap.get('len') + lenPartof)
        else
          HashMap.set('len', lenPartof)
      }
      else {
        this._addDom(tag, opts)
        kk = 0
      }
      if (k === textArr.length) {
        const lastPromise = [{
          char: 'addDom',
          delay: 0,
          func: () => {
            const cursor = document.querySelector('.cursor') as HTMLElement
            cursor && this._dom.appendChild(cursor)
            // eslint-disable-next-line no-console
            console.log('last')
          },
        }]
        this._queueAndReturn(lastPromise)
      }
    }
    return this
  }

  private _addDom(text: HTMLElement, opts: ActionOpts = {}) {
    const addDomAsQueueItems: any[] = []
    addDomAsQueueItems.push({
      char: 'addDom',
      delay: 0,
      func: async () => {
        const cursor = document.querySelector('.cursor') as HTMLElement
        const nodeParent = cursor.parentNode as HTMLElement
        const lastNode = nodeParent.childNodes[HashMap.get('len')]
        nodeParent.insertBefore(text, lastNode)
        const num = Number(nodeParent.getAttribute('data-source')) ?? 0
        let pNode = nodeParent as any
        if (Number(text.getAttribute('data-source')) < num) {
          for (let i = 0; i < num; i++) {
            pNode = pNode?.parentNode ?? pNode
            if (+pNode.getAttribute('data-source') === Number(text.getAttribute('data-source')))
              break
          }
          pNode = pNode?.parentNode
          pNode.appendChild(text)
        }
        else if (Number(text.getAttribute('data-source')) === num) {
          pNode = pNode?.parentNode
          pNode.appendChild(text)
        }
        // text.removeAttribute('data-source')
        // only add last childNode
        text.insertBefore(cursor, null) // If this is null, then newNode is inserted at the end of node's child nodes.
      },
    })
    return this._queueAndReturn(addDomAsQueueItems, opts)
  }

  // start typing
  public async go() {
    await this._attachCursor()
    const queueItems = [...this._queue.getQueue()]
    for (let i = 0; i < queueItems.length; i++) {
      const [_queueKey, queueItem] = queueItems[i]
      if (typeof queueItem.func === 'function')
        await delay(queueItem.delay * random(0.8, 1.1))
      else
        await delay(queueItem.delay)
      queueItem.func && queueItem.func()

      this._queue.cleanup(_queueKey)
    }
  }
}
