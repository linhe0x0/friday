import consola from 'consola'
import type Koa from 'koa'

import loader from './loader'
import { entry } from '../lib/app-info'

type entrySetupFun = (app: Koa) => Koa

export function getEntrySetupFun(): entrySetupFun {
  let fun: unknown

  try {
    fun = loader(entry).default
  } catch (err) {
    consola.error(err)
    process.exit(1)
  }

  if (typeof fun !== 'function') {
    consola.error(`The file "${entry}" does not export a default function.`)
    process.exit(1)
  }

  const isAsyncFunction = fun.constructor.name === 'AsyncFunction'

  if (isAsyncFunction) {
    consola.error('setup function must not be async function.')
    process.exit(1)
  }

  return fun as entrySetupFun
}
