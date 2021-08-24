import Koa from 'koa'

export default function access(
  ctx: Koa.Context,
  next: Koa.Next
): Promise<void> {
  const contentLength = parseInt(ctx.headers['content-length'] || '0', 10)
  const contentType = ctx.headers['content-type'] || ''
  const json = contentType.indexOf('application/json') === 0
  const query = JSON.stringify(ctx.query)

  let body = ''

  if (contentLength > 0 && json) {
    try {
      body = JSON.stringify(ctx.request.body || {})
    } catch (err) {
      ctx.logger
        .withError(err)
        .error(`JSON body could not be parsed: ${err.message} \n`)
    }
  }

  ctx.logger.info(`Request query: ${query}, Request body: ${body}`)

  return next()
}
