import http from 'http'
import _ from 'lodash'

import type Koa from 'koa'

interface ErrorResponse {
  requestID: string
  code?: number | string
  message: string
  data?: any
  errors?: any[]
}

export default async function errorHandlerMiddleware(
  ctx: Koa.Context,
  next: Koa.Next
): Promise<void> {
  try {
    await next()
  } catch (err: any) {
    ctx.status = err.status || err.statusCode || 500

    const message = err.message || http.STATUS_CODES[ctx.status]
    const { requestID } = ctx.state

    if (ctx.status >= 500) {
      ctx.app.emit('error', err, ctx)
    }

    const response: ErrorResponse = {
      requestID,
      message,
    }

    const errorCode = err.code || err.errorCode

    if (errorCode) {
      response.code = errorCode
    }

    if (err.errors) {
      response.errors = err.errors
    }

    if (err.context) {
      _.assign(response, err.context)
    }

    _.assign(response, err.payload, err.extra)

    switch (ctx.accepts(['json', 'html', 'text'])) {
      case 'text':
        ctx.type = 'text/plain'
        ctx.body = message
        break
      case 'json':
        ctx.body = response
        break
      case 'html':
        ctx.type = 'text/html'

        if (ctx.status === 400) {
          ctx.flash = {
            message,
          }

          ctx.redirect('back')
        } else {
          const redirectURL =
            ctx.path === `/${ctx.status}` ? '/' : `/${ctx.status}`

          if (ctx.status === 404 && ctx.path === '/') {
            ctx.type = 'text/plain'
            // eslint-disable-next-line prefer-destructuring
            ctx.body = http.STATUS_CODES[404]
            return
          }

          ctx.redirect(`${redirectURL}?message=${encodeURIComponent(message)}`)
        }

        break
      default:
        ctx.status = 406
        ctx.body = message
        break
    }
  }
}
