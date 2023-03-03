import type { QueueItem, QueueItems } from '../../src/types'
export function Queue(initialItems: QueueItem[]): QueueItems {
  const _q = new Map()
  function add(steps: QueueItem[] | QueueItem): typeof Queue {
    if (typeof steps === 'object' && !Array.isArray(steps))
      steps = [steps]
    steps.forEach((step) => {
      _q.set(Symbol(step?.char), step)
    })
    return this
  }
  const getKey = () => {
    return [..._q.keys()]
  }
  const getQueue = () => _q
  add(initialItems)
  const cleanup = (key: Symbol) => {
    _q.delete(key)
  }
  return {
    add,
    cleanup,
    getQueue,
    getKey,
  }
}
