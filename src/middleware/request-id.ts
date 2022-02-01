import type Koa from 'koa'
import { v3 as uuidv3, v4 as uuidv4 } from 'uuid'

export default function requestIDMiddleware(
  ctx: Koa.Context,
  next: Koa.Next
): Promise<void> {
  const requestID =
    ctx.header['x-request-id'] || uuidv3(Date.now().toString(), uuidv4())

  ctx.state.requestID = requestID

  ctx.set('x-request-id', requestID)

  return next()
}
