import config from 'config'
import Koa from 'koa'
import path from 'path'
import prettyMilliseconds from 'pretty-ms'

import { PkgInfo } from '../types/pkg'
import loader from '../utilities/loader'
import loggerGenerator from '../utilities/logger'

const logger = loggerGenerator('friday:router')

const pkgPath = path.resolve(process.cwd(), 'package.json')

let pkg: PkgInfo = {
  name: '',
  version: '',
}

try {
  pkg = loader(pkgPath)
} catch (err) {
  logger.warn(
    `${pkgPath} is not found. This results in a missing name and version in the /_info endpoint.`
  )
}

const info = function info(ctx: Koa.Context): void {
  const uptime = process.uptime()
  const name = config.has('app.name') ? config.get('app.name') : pkg.name
  const version = config.has('app.version')
    ? config.get('app.version')
    : pkg.version

  ctx.body = {
    name,
    version,
    env: process.env.NODE_ENV || '',
    uptime: prettyMilliseconds(uptime * 1000),
  }
}

const pong = function pong(ctx: Koa.Context): void {
  ctx.body = 'pong'
}

export default function helpfulRouter(router): void {
  router.get('/_info', info)
  router.get('/_ping', pong)
  router.get('/ping', pong)
}
