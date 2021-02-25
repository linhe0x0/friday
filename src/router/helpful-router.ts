import Koa from 'koa'
import path from 'path'
import prettyMilliseconds from 'pretty-ms'

import { getConfigWithDefault } from '../services/config'
import loader from '../utilities/loader'
import useLogger from '../utilities/logger'

const logger = useLogger('friday:router')

const pkgPath = path.resolve(process.cwd(), 'package.json')

interface PkgInfo {
  name: string
  version: string
}

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
  const name = getConfigWithDefault('app.name', pkg.name)
  const version = getConfigWithDefault('app.version', pkg.version)

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

// eslint-disable-next-line @typescript-eslint/no-explicit-any,@typescript-eslint/explicit-module-boundary-types
export default function helpfulRouter(router: any): void {
  router.get('/_info', info)
  router.get('/_ping', pong)
  router.get('/ping', pong)
}
