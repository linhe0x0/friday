import Koa from 'koa'
import uuidv3 from 'uuid/v3'
import uuidv4 from 'uuid/v4'

export default function(ctx: Koa.Context, next: Function): Promise<void> {
  const requestID =
    ctx.header['x-request-id'] || uuidv3(Date.now().toString(), uuidv4())

  ctx.state.requestID = requestID

  ctx.set('x-request-id', requestID)

  return next()
}
