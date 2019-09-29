import http from 'http'
import Koa from 'koa'

import { ErrorResponse } from '../types/errors'

export default async function(ctx: Koa.Context, next: Function): Promise<void> {
  try {
    await next()
  } catch (err) {
    ctx.status = err.status || 500

    const message = err.message || http.STATUS_CODES[ctx.status]

    if (ctx.status >= 500) {
      ctx.app.emit('error', err, ctx)
    }

    const response: ErrorResponse = {
      message,
    }

    switch (ctx.accepts(['json', 'html', 'text'])) {
      case 'text':
        ctx.type = 'text/plain'
        ctx.body = message
        break
      case 'json':
        if (err.errors) {
          response.errors = err.errors
        }

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
