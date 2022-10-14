import * as parse5 from 'parse5'
import { parsehtml } from './Parse'
import { Queue } from './queue'
import type { ActionOpts, QueueItem, QueueItems, ScopeData } from './types'
import { delay, random, toString } from './utils'
import { animationspancontent } from './constants'
import { setcursoranimation } from './cursoranimation'
const HashMap = new Map()
//
function getMapSize(getMap: Map<Symbol, number>): number {
  let len = 0
  getMap.forEach((value) => {
    len += value
  })
  return len
}
type InsertPosition = 'beforebegin' | 'afterbegin' | 'beforeend' | 'afterend'
export class UnTyper {
  private _dom: HTMLElement
  private _scopedata: ScopeData
  private _queue: QueueItems
  private _cursor: HTMLElement | null
  constructor(dom: HTMLElement, scopedata: ScopeData = {}) {
    if (!dom)
      throw new Error('No element found')
    this._dom = dom
    this._scopedata = scopedata
    this._queue = Queue([{ delay: this._scopedata.startDelay }])
    this._cursor = this._initCursor()
  }

  private _initCursor(): null | HTMLElement {
    const span = document.createElement('span')
    span.setAttribute('class', 'cursor')
    span.style.width = '0'
    span.style.transform = 'translateX(-0.05em)'
    span.style.marginLeft = '2px'
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
    const { speed } = this._scopedata
    HashMap.set(Symbol(doc[0].value.length), doc[0].value.length)
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
            cursor.style.transform = 'translateX(-0.05em)'
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
            cursor.style.transform = 'translateX(-0.2em)'
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

  private _delete() {
    const cursor = document.querySelector('.cursor') as HTMLElement
    const nodeParent = cursor.parentNode as HTMLElement
    const len = nodeParent.childNodes.length - 2 // exclude self
    let nodeToRemove: HTMLElement | ChildNode | null = null
    const dfs = (sibling: HTMLElement | ChildNode | null) => {
      const childnode = sibling?.childNodes as NodeListOf<ChildNode>
      if (toString(sibling?.childNodes[childnode?.length - 1]) !== 'text') {
        if (sibling)
          dfs(sibling?.childNodes[0] ?? null)
        else
          console.log('最后了')
      }

      else { cursor.previousSibling?.appendChild(cursor) }
    }
    if (toString(cursor.previousSibling) === 'text') {
      nodeToRemove = nodeParent.childNodes[len]
      nodeToRemove && nodeParent.removeChild(nodeToRemove)
    }
    else {
      dfs(cursor?.previousSibling)
    }
    // if (nodeParent.childNodes.length === 1)
    //   nodeParent && nodeParent.remove()
  }

  // delete text
  public delete(charAt: number, opts: ActionOpts = {}) {
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
      this._queueAndReturn(deleteQueueItem, opts)
    }
    diff()
    return this
  }

  private _addtype(text: string, opts: ActionOpts = {}, shouldNewline: boolean) {
    const doc = Array.from(parse5.parseFragment(text).childNodes) as any[]
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
            const forLen = Number(nodeParent.getAttribute('data-source'))!
            let i = 0
            let lastNode = cursor as any
            while (i < forLen) {
              ++i
              lastNode = lastNode.parentNode ?? cursor
            }
            lastNode && lastNode.parentNode.appendChild(cursor)
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
    let lastk = 0
    let kk = 0 // cursor -> 跳出当前的html标签
    for (const text of textArr) {
      ++lastk
      const tag = text.func()
      if (typeof tag === 'string') {
        kk++
        this._addtype(tag, opts, kk === 2)
        HashMap.set(Symbol(tag.length), tag.length)
      }
      else {
        this._addDom(tag, opts)
        kk = 0
      }
      if (lastk === textArr.length) {
        const lastPromise = [{
          char: 'addDom',
          delay: 0,
          func: async () => {
            const cursor = document.querySelector('.cursor') as HTMLElement
            cursor && this._dom.appendChild(cursor)
            // eslint-disable-next-line no-console
            console.log(`全局共:${getMapSize(HashMap)} 字符,共:${textArr.filter(x => typeof x.func() !== 'string').length} 标签`)
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
        const lastNode = nodeParent.childNodes[getMapSize(HashMap)]
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
