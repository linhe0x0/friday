import consola from 'consola'
import fs from 'fs'
import Koa from 'koa'
import path from 'path'

import loader from './loader'
import { pkgInfo } from './pkg'

let filepath = pkgInfo.main || 'app.js'

if (filepath[0] !== '/') {
  filepath = path.resolve(process.cwd(), filepath)
}

if (!fs.existsSync(filepath)) {
  console.error(`The file or directory "${filepath}" doesn't exist.`)
  process.exit(1)
}

export const entry = filepath

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
