import Koa from 'koa'

interface MiddlewareItem {
  mid: Koa.Middleware
  weight: number
}

let middleware: MiddlewareItem[] = []

export function addMiddleware(mid: Koa.Middleware, weight?: number): void {
  middleware.push({
    mid,
    weight: weight === undefined ? 1 : weight,
  })
}

export function getMiddlewareList(): MiddlewareItem[] {
  return middleware.sort((prev, next) => {
    return next.weight - prev.weight
  })
}

export function resetMiddlewareList(): void {
  middleware = []
}
