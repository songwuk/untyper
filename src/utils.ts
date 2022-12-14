// delay
export function delay(ms: number): Promise<any> {
  return new Promise(resolve => setTimeout(resolve, ms))
}
// random
export function random(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1) + min)
}

export function toString(str: unknown) {
  return Object.prototype.toString.call(str).toLocaleLowerCase().slice(8, -1)
}
// htmlRE
// export const htmltagRE = /<[^>]*>/g
