import { Queue } from './queue'
import type { ActionOpts, QueueItem, QueueItems, ScopeData, UnTyperType } from './types'
import { delay, random } from './utils'
import { animationspancontent } from './constants'
import { setcursoranimation } from './cursoranimation'
export class UnTyper implements UnTyperType {
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

  private _type(char: string) {
    const cursor = document.querySelector('.cursor') as HTMLElement
    cursor && cursor.insertAdjacentHTML('beforebegin', char)
  }

  private _queueAndReturn(steps: QueueItem[] | QueueItem, opts: ActionOpts = {}) {
    const _opts = this._queue.add(steps)
    if (opts && opts.delay)
      _opts.add({ delay: opts.delay })
    return this
  }

  // type text
  public type(text: string, opts: ActionOpts = {}) {
    const { speed } = this._scopedata
    const chars = text.split('')
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

  // // move to next element
  // public move(movementArg: number, opts: ActionOpts = {}) {
  //   return this
  // }

  // pause typing
  public pause(ms: number) {
    return this._queueAndReturn({
      delay: ms,
    })
  }

  private _delete(index: number) {
    const cursor = document.querySelector('.cursor') as HTMLElement
    const nodeParent = cursor.parentNode as HTMLElement
    let nodeToRemove: HTMLElement | null | ChildNode = null
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
    const lastIndex = [...this._queue.getQueue()].filter(([, item]) => item.char).length - 1
    const deleteQueueItem = Array.from({ length: charAt }, (_, i) => {
      return {
        char: `delete${i}`,
        delay: speed,
        func: () => this._delete(lastIndex - i),
      }
    })
    return this._queueAndReturn(deleteQueueItem, opts)
  }

  // start typing
  public async go() {
    await this._attachCursor()
    const queueItems = [...this._queue.getQueue()]
    for (let i = 0; i < queueItems.length; i++) {
      const [_queueKey, queueItem] = queueItems[i]
      if (queueItem.func)
        await delay(queueItem.delay * random(0, 1))
      else
        await delay(queueItem.delay)
      queueItem.func && queueItem.func()

      this._queue.cleanup(_queueKey)
    }
  }
}
