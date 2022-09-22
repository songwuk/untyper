export interface QueueItem {
  char?: string
  delay?: number
  func?: () => void
}
export interface ScopeData {
  speed?: number
  startDelay?: number
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

export interface UnTyperType {
  type: (text: string, opts: ActionOpts) => void
  move: (movementArg: number, opts: ActionOpts) => void
  delete: (charAt: number, opts: ActionOpts) => void
  pause: (ms: number) => void
  go: () => void
}
