/**
 * type add delete pause move go
 */
export interface UnTyperAnimate {
  cancel: boolean
}
export interface QueueItem {
  char?: string
  delay?: number
  func?: () => void
}
export interface ScopeData {
  speed?: number
  startDelay?: number
  animationspancontent?: string
  animate?: UnTyperAnimate
  cursorAnimation?: CursorAnimationOptions
}

export type CursorAnimationKind = 'opacity' | 'size' | 'gradient' | 'combined'

export interface CursorAnimationOptions {
  kind?: CursorAnimationKind
  duration?: number
  size?: {
    minScale?: number
    maxScale?: number
  }
  gradient?: {
    from?: string
    to?: string
    angle?: number
  }
}

export interface ElementAnimation {
  keyframes: Keyframe[]
  options?: KeyframeAnimationOptions
}

export interface ActionOpts {
  delay?: number
  to?: 'start' | 'end'
  animation?: ElementAnimation
}

export interface ImageActionOpts extends ActionOpts {
  alt?: string
  className?: string
  width?: number
  height?: number
  attrs?: Record<string, string>
}

export interface QueueItems {
  add: (steps: QueueItem[] | QueueItem) => QueueItems
  getQueue: () => Map<symbol, QueueItem>
  getKey: () => symbol[]
  cleanup: (key: symbol) => void
}

export interface ParsehtmlIn {
  nodeName: string
  parentNode: any
  value: string
}

export interface ParsehtmlOut {
  parentNode: any
  content?: string
  isEmpty?: boolean
  nodeName: string
  func: () => string
}
