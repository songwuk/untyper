import * as parse5 from 'parse5'
import { parsehtml } from '../packages/h5/parse'
import { Queue } from '../packages/h5/queue'
import { delay, getMapSize, random, toString } from '../packages/h5/utils'
import { animationspancontent } from '../packages/h5/constants'
import { setcursoranimation } from '../packages/h5/cursoranimation'
import type { ActionOpts, QueueItem, QueueItems, ScopeData } from './types'
const HashMap: Map<Symbol, any> = new Map()
const classSet = new Set()
function checkRandom(_randomSet: number) {
  if (!classSet.has(_randomSet)) {
    classSet.add(_randomSet)
    return _randomSet
  }
  else {
    const randomSet = random(0, 100000)
    return checkRandom(randomSet)
  }
}
type InsertPosition = 'beforebegin' | 'afterbegin' | 'beforeend' | 'afterend'
export class UnTyper {
  // private isAnimating: boolean
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
    const randomSet = random(0, 100000)
    const classValue = checkRandom(randomSet)
    const span = document.createElement('span')
    span.setAttribute('class', `cursor${classValue}`)
    span.style.width = '0'
    span.style.transform = 'translateX(-0.05em)'
    span.style.marginLeft = '2px'
    span.style.display = 'inline-block'
    span.textContent = this._scopedata.animationspancontent ?? animationspancontent
    span.style.visibility = 'visible'
    return span as HTMLElement
  }

  private async _attachCursor() {
    if (this._dom && this._cursor)
      this._dom.appendChild(this._cursor)
    return setcursoranimation(this._cursor, { speed: this._scopedata.speed })
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
      {
        char: 'calculateTotal',
        func: () => HashMap.set(Symbol(doc[0].value.length), doc[0].value.length),
      },
    ]
    return this._queueAndReturn(itemtoQueue, opts)
  }

  // move to next element
  public move(movementArg: number, opts: ActionOpts = {}) {
    const { speed } = this._scopedata
    if (toString(movementArg) === 'null') {
      const { to } = opts
      if (to === 'end') {
        const endQuereItem = {
          char: 'end',
          delay: speed,
          func: () => {
            const cursor = this._cursor!
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
            const cursor = this._cursor!
            cursor.style.transform = 'translateX(-0.2em)'
            const nodeParent = cursor.parentNode as HTMLElement
            const lastNode = nodeParent.childNodes[0]
            nodeParent.insertBefore(cursor, lastNode)
          },
        }
        return this._queueAndReturn(startQuereItem, opts)
      }
    }
    if (movementArg >= 0)
      throw new Error('movementArg must be negative')
    const len = movementArg! * -1
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
            const forLen = Number(nodeParent.getAttribute('data-source')) ?? 0
            let i = Number((nodeParent.parentNode as HTMLElement)?.getAttribute('data-source') ?? 0)
            let lastNode = cursor as any
            while (i < forLen) {
              ++i
              lastNode = lastNode.parentNode ?? cursor
            }
            lastNode && lastNode.parentNode.appendChild(cursor)
          }
        },
      }
    })
    const itemtoQueue = [
      ...charsAsQueueItems,
      {
        char: 'calculateTotal',
        func: () => HashMap.set(Symbol(text.length), text.length),
      },
    ]
    return this._queueAndReturn(itemtoQueue, opts)
  }

  public add(htmlelement: string, opts: ActionOpts = {}) {
    const doc = parse5.parseFragment(htmlelement)
    const documentFragment = Array.from(doc.childNodes) as any[]
    const textArr = parsehtml(documentFragment)
    let lastk = 0
    // const jumpnum = 0 // cursor -> 跳出当前的html标签
    for (const text of textArr) {
      ++lastk
      const tag = text.func() as any
      if (typeof tag === 'string') {
        /**
         * 应该跳出当前标签
         */
        if (text.isEmpty)
          this._addtype(tag, opts, true)
        else
          this._addtype(tag, opts, false)
      }
      else {
        this._addDom(tag, opts)
      }

      if (lastk === textArr.length) {
        const lastPromise = [{
          char: 'addDom',
          delay: 0,
          func: () => {
            const cursor = this._cursor!
            cursor && this._dom.appendChild(cursor)
            // eslint-disable-next-line no-console
            console.log(`总共:${getMapSize(HashMap)} 字符;添加${textArr.filter(x => typeof x.func() !== 'string').length} 标签`)
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
        const cursor = this._cursor!
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
    this.animateText()
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
            if (queueItem.delay * random(0.8, 1.1) >= 1000)
              animatefn.startCursorAnimation()
            else
              animatefn.stopCursorAnimation()
            await delay(queueItem.delay * random(0.8, 1.1), () => animatefn.stopCursorAnimation())
          }
        }
        else {
          await delay(queueItem.delay, () => animatefn.stopCursorAnimation())
        }
        this._queue.cleanup(_queueKey)
      }
      catch (error) {
        console.error('An error occurred during animation:', error)
      }
    }
    if (this._queue.getQueue.length === 0)
      animatefn.startCursorAnimation()
  }

  // // 停止动画方法
  // stopAnimation() {
  //   this.isAnimating = false
  // }

  // // 恢复动画方法
  // resumeAnimation() {
  //   this.isAnimating = true
  //   this.animateText()
  // }
}
