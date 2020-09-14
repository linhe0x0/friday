import Koa from 'koa'
import _ from 'lodash'
import { v3 as uuidv3, v4 as uuidv4 } from 'uuid'

import isDebug from '../utilities/is-debug'
import useLogger from '../utilities/logger'

const isDebugMode = isDebug()

export default function loggerMiddleware(
  ctx: Koa.Context,
  next: Koa.Next
): Promise<void> {
  const requestID =
    ctx.header['x-request-id'] ||
    ctx.state.requestID ||
    uuidv3(Date.now().toString(), uuidv4())

  if (isDebugMode) {
    const shortRequestID = _.first(_.split(requestID, '-'))

    ctx.logger = useLogger(`request[${shortRequestID}]`)
  } else {
    const extraLabels = {
      'x-request-id': requestID,
    }

    if (ctx.state.traceId) {
      _.assign(extraLabels, {
        traceId: ctx.state.traceId,
      })
    }

    if (ctx.state.traceID) {
      _.assign(extraLabels, {
        traceID: ctx.state.traceID,
      })
    }

    const mixin = (): Record<string, string> => {
      const extra: Record<string, string> = {}
      const { userID } = ctx.state

      if (userID) {
        extra.traceUserID = userID
      }

      return extra
    }

    ctx.logger = useLogger(
      `[${ctx.method}]${ctx.url}`,
      undefined,
      extraLabels,
      mixin
    )
  }

  return next()
}
