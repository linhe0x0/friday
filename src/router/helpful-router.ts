import type Koa from 'koa'
import prettyMilliseconds from 'pretty-ms'

import { getConfigWithDefault } from '../services/config'
import { pkgInfo } from '../utilities/pkg'

const info = function info(ctx: Koa.Context): void {
  const uptime = process.uptime()
  const name = getConfigWithDefault('app.name', pkgInfo.name)
  const version = getConfigWithDefault('app.version', pkgInfo.version)

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

export default function helpfulRouter(router: any): void {
  router.get('/_info', info)
  router.get('/_ping', pong)
  router.get('/ping', pong)
}
