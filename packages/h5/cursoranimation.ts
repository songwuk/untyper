export const beforePoint = (cb) => {
  return new Promise((resolve) => {
    requestAnimationFrame(async () => {
      resolve(await cb())
    })
  })
}
export function setcursoranimation(cursor: HTMLElement | null, opts: { speed?: number } = {}): Animation {
  const random = () => Math.random().toString().substring(2, 9)
  if (!window.Animation)
    throw new Error('Browser does not support Animation')
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
  return animation
}

