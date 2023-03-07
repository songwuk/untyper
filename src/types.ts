export interface QueueItem {
  char?: string
  delay?: number
  func?: () => void
}
export interface ScopeData {
  speed?: number
  startDelay?: number
  animationspancontent?: string
}

export interface ActionOpts {
  delay?: number
  to?: 'start' | 'end'
}

export interface QueueItems {
  add: (steps: QueueItem[] | QueueItem) => any
  getQueue: () => any
  getKey: () => any
  cleanup: (key: Symbol) => any
}

export interface ParsehtmlIn {
  nodeName: string
  parentNode: any
  value: string
}

export interface ParsehtmlOut {
  parentNode: any
  content?: string
  isEmpty?: Boolean
  nodeName: string
  func: () => string
}

