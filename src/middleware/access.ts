import Koa from 'koa'

export default function access(
  ctx: Koa.Context,
  next: Koa.Next
): Promise<void> {
  const contentLength = parseInt(ctx.headers['content-length'] || '0', 10)
  const contentType = ctx.headers['content-type'] || ''
  let bodyString = ''

  if (contentLength > 0 && contentType.indexOf('application/json') === 0) {
    try {
      const { body } = ctx.request

      if (body) {
        bodyString = JSON.stringify(body)
      }
    } catch (err) {
      ctx.logger
        .withError(err)
        .error(`JSON body could not be parsed: ${err.message} \n`)
    }
  }

  ctx.logger.info(`[${ctx.method}] ${ctx.url} ${bodyString}`)

  return next()
}
