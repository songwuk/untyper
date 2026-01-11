import type { CursorAnimationOptions } from '../../src/types'

export const beforePoint = (cb) => {
  return new Promise((resolve) => {
    requestAnimationFrame(async () => {
      resolve(await cb())
    })
  })
}
export interface AnimationOut {
  stopCursorAnimation: () => void
  startCursorAnimation: () => void
}
interface CursorAnimationConfig {
  speed?: number
  animation?: CursorAnimationOptions
}

const translateToken = 'var(--untyper-cursor-translate, -0.05em)'

const buildKeyframes = (kind: CursorAnimationOptions['kind'], options: CursorAnimationOptions = {}): Keyframe[] => {
  const minScale = options.size?.minScale ?? 0.7
  const maxScale = options.size?.maxScale ?? 1.15
  const frames: Keyframe[] = [
    { opacity: 1, offset: 0 },
    { opacity: 0.2, offset: 0.5 },
    { opacity: 1, offset: 1 },
  ]
  if (kind === 'size' || kind === 'combined') {
    frames[0] = { ...frames[0], transform: `translateX(${translateToken}) scaleY(${minScale})` }
    frames[1] = { ...frames[1], transform: `translateX(${translateToken}) scaleY(${maxScale})` }
    frames[2] = { ...frames[2], transform: `translateX(${translateToken}) scaleY(${minScale})` }
  }
  if (kind === 'gradient' || kind === 'combined') {
    frames[0] = { ...frames[0], backgroundPosition: '0% 50%' }
    frames[1] = { ...frames[1], backgroundPosition: '100% 50%' }
    frames[2] = { ...frames[2], backgroundPosition: '0% 50%' }
  }
  return frames
}

const applyGradientStyles = (cursor: HTMLElement, options: CursorAnimationOptions) => {
  const angle = options.gradient?.angle ?? 90
  const from = options.gradient?.from ?? '#5eead4'
  const to = options.gradient?.to ?? '#6366f1'
  cursor.style.backgroundImage = `linear-gradient(${angle}deg, ${from}, ${to})`
  cursor.style.backgroundSize = '200% 200%'
  cursor.style.backgroundClip = 'text'
  cursor.style.webkitBackgroundClip = 'text'
  cursor.style.color = 'transparent'
}

export function setcursoranimation(cursor: HTMLElement | null, opts: CursorAnimationConfig = {}): AnimationOut {
  const random = () => Math.random().toString().substring(2, 9)
  if (!window.Animation) {
    console.warn('Browser does not support Animation')
    return {
      stopCursorAnimation: () => {},
      startCursorAnimation: () => {},
    }
  }
  // TODO
  const { speed, animation: animationOptions = {} } = opts
  cursor!.style.transition = 'opacity 150ms ease-in-out'
  const baseDuration = Math.min(Math.max((speed ?? 150) * 6, 600), 1400)
  const duration = animationOptions.duration ?? baseDuration
  const kind = animationOptions.kind ?? 'opacity'
  if (kind === 'gradient' || kind === 'combined')
    applyGradientStyles(cursor!, animationOptions)
  const animation = cursor!.animate(buildKeyframes(kind, animationOptions), {
    iterations: Infinity,
    easing: 'ease-in-out',
    fill: 'forwards',
    duration,
  })
  if (animation) {
    animation.pause()
    const _id = random()
    animation.id = Symbol(_id + speed).toString()
  }
  const stopCursorAnimation = () => {
    cursor!.style.opacity = '1'
    animation.pause()
  }
  const startCursorAnimation = () => {
    beforePoint(async () => {
      beforePoint(async () => {
        animation.play()
      })
    })
  }
  return {
    stopCursorAnimation,
    startCursorAnimation,
  }
}
