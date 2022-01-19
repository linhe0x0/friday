import Koa from 'koa'

import { isStaticFile } from '../utilities/fs'

export default function access(
  ctx: Koa.Context,
  next: Koa.Next
): Promise<void> {
  const staticFile = isStaticFile(ctx.path)

  if (staticFile) {
    // Ignore request of static file by default.
    return next()
  }

  const contentLength = parseInt(ctx.headers['content-length'] || '0', 10)
  const contentType = ctx.headers['content-type'] || ''
  const json = contentType.indexOf('application/json') === 0
  const query = JSON.stringify(ctx.query)

  let body = '{}'

  if (contentLength > 0 && json) {
    try {
      body = JSON.stringify(ctx.request.body || {})
    } catch (err: any) {
      ctx.logger
        .withError(err)
        .error(`JSON body could not be parsed: ${err.message} \n`)
    }
  }

  ctx.logger.info(`Request query: ${query}, Request body: ${body}`)

  return next()
}
