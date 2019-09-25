import Koa from 'koa'
import uuidv3 from 'uuid/v3'
import uuidv4 from 'uuid/v4'

import loggerGenerator from '../utilities/logger'

export default function(ctx: Koa.Context, next: Function): Promise<void> {
  const requestID =
    ctx.header['x-request-id'] ||
    ctx.state.requestID ||
    uuidv3(Date.now().toString(), uuidv4())

  ctx.logger = loggerGenerator(`request[${requestID}]`)

  return next()
}
