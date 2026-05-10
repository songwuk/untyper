/**
 * type add delete pause move go
 */
export interface UnTyperAnimate {
  cancel?: boolean
}
export interface QueueItem {
  char?: string
  delay?: number
  func?: () => void | Promise<void>
  meta?: Record<string, unknown>
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

export interface UnTyperPluginInstance {
  type: (text: string, opts?: ActionOpts) => UnTyperPluginInstance
  move: (movementArg: number | null, opts?: ActionOpts) => UnTyperPluginInstance
  pause: (ms: number) => UnTyperPluginInstance
  delete: (charAt: number, opts?: ActionOpts) => UnTyperPluginInstance
  add: (htmlelement: string, opts?: ActionOpts) => UnTyperPluginInstance
  image: (src: string, opts?: ImageActionOpts) => UnTyperPluginInstance
  action: (name: string, ...args: any[]) => UnTyperPluginInstance
  registerAction: (name: string, handler: UnTyperPluginAction) => UnTyperPluginInstance
  use: <TOptions = unknown>(plugin: UnTyperPlugin<TOptions> | UnTyperPluginInstaller<TOptions>, options?: TOptions) => UnTyperPluginInstance
  go: () => Promise<void>
}

export interface UnTyperHookPayload {
  instance: UnTyperPluginInstance
  root: HTMLElement
  cursor: HTMLElement | null
  options: Readonly<ScopeData>
  queueItem?: QueueItem
  index?: number
  error?: unknown
}

export type UnTyperHookName = 'beforeRun' | 'afterRun' | 'beforeStep' | 'afterStep' | 'onError'

export type UnTyperHook = (payload: UnTyperHookPayload) => void | Promise<void>

export interface UnTyperPluginContext {
  readonly instance: UnTyperPluginInstance
  readonly root: HTMLElement
  readonly cursor: HTMLElement | null
  readonly options: Readonly<ScopeData>
  registerAction: (name: string, handler: UnTyperPluginAction) => void
  enqueue: (steps: QueueItem[] | QueueItem, opts?: ActionOpts) => UnTyperPluginInstance
  insertText: (text: string, opts?: ActionOpts, jumpNextLine?: boolean) => UnTyperPluginInstance
  insertElement: (element: HTMLElement, opts?: ActionOpts) => UnTyperPluginInstance
  hook: (name: UnTyperHookName, handler: UnTyperHook) => void
}

export type UnTyperPluginAction = (ctx: UnTyperPluginContext, ...args: any[]) => void | UnTyperPluginInstance

export type UnTyperPluginInstaller<TOptions = unknown> = (ctx: UnTyperPluginContext, options?: TOptions) => void

export interface UnTyperPlugin<TOptions = unknown> {
  name: string
  install: UnTyperPluginInstaller<TOptions>
}

export type UnTyperPluginUse<TOptions = any> =
  | UnTyperPlugin<TOptions>
  | UnTyperPluginInstaller<TOptions>
  | readonly [UnTyperPlugin<TOptions> | UnTyperPluginInstaller<TOptions>, TOptions]

export interface ScopeData {
  speed?: number
  startDelay?: number
  animationspancontent?: string
  animate?: UnTyperAnimate
  cursorAnimation?: CursorAnimationOptions
  plugins?: UnTyperPluginUse<any>[]
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
