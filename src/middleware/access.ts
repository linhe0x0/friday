import Koa from 'koa'
import _ from 'lodash'

export default function access(
  ctx: Koa.Context,
  next: Koa.Next
): Promise<void> {
  let bodyString = ''

  if (
    ctx.headers['content-length'] > 0 &&
    ctx.headers['content-type'].indexOf('application/json') === 0
  ) {
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
