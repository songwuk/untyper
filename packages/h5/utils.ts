// delay
export function delay(ms: number, fn?: () => void): Promise<any> {
  fn && fn()
  return new Promise(resolve => setTimeout(resolve, ms))
}
export function delayAnimate(ms: number, fn?: () => void): Promise<any> {
  fn && fn()
  return new Promise(resolve => setTimeout(resolve, ms))
}
// random
export function random(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1) + min)
}

export function toString(str: unknown) {
  return Object.prototype.toString.call(str).toLocaleLowerCase().slice(8, -1)
}

export function getMapSize(getMap: Map<Symbol, number>): number {
  let len = 0
  getMap.forEach((value) => {
    len += value
  })
  return len
}
// htmlRE
// export const htmltagRE = /<[^>]*>/g
