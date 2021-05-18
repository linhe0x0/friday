import Koa from 'koa'
import _ from 'lodash'

type HookType =
  | 'onInit'
  | 'onReady'
  | 'beforeClose'
  | 'onClose'
  | 'onError'
  | 'beforeRestart'
  | 'onRestart'
type HookHandler = (app: Koa) => void | Promise<void>
type Hooks = Record<string, HookHandler[]>

let hooks: Hooks = {}

export function addHook(type: HookType, handler: HookHandler): void {
  if (!hooks[type]) {
    hooks[type] = []
  }

  hooks[type].push(handler)
}

export function emitHook(type: HookType, app: Koa): Promise<void | void[]> {
  const actions = hooks[type]

  if (!actions || !actions.length) {
    return Promise.resolve()
  }

  const a = _.map(actions, (action) => action(app))

  return Promise.all(a)
}

export function getHook(type: HookType): HookHandler[] {
  return hooks[type] || []
}

export function cleanAllHooks(): void {
  hooks = {}
}
