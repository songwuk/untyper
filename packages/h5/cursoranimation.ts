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
export function setcursoranimation(cursor: HTMLElement | null, opts: { speed?: number } = {}): AnimationOut {
  const random = () => Math.random().toString().substring(2, 9)
  if (!window.Animation) {
    console.warn('Browser does not support Animation')
    return {
      stopCursorAnimation: () => {},
      startCursorAnimation: () => {},
    }
  }
  // TODO
  const { speed } = opts
  const animation = cursor!.animate([0, 0, 1].map((n) => {
    return { opacity: n }
  }), {
    iterations: Infinity,
    easing: 'ease-in-out',
    fill: 'forwards',
    duration: 900,
  })
  if (animation) {
    animation.pause()
    const _id = random()
    animation.id = Symbol(_id + speed).toString()
  }
  const stopCursorAnimation = () => {
    cursor!.style.opacity = '1'
    animation.cancel()
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

