import Koa from 'koa'
import _ from 'lodash'
import uuidv3 from 'uuid/v3'
import uuidv4 from 'uuid/v4'

import { getConfigWithDefault } from '../services/config'
import loggerGenerator from '../utilities/logger'

const debug = getConfigWithDefault(
  'debug',
  process.env.FRIDAY_ENV === 'development'
)

export default function(ctx: Koa.Context, next: Function): Promise<void> {
  const requestID =
    ctx.header['x-request-id'] ||
    ctx.state.requestID ||
    uuidv3(Date.now().toString(), uuidv4())

  if (debug) {
    const shortRequestID = _.first(_.split(requestID, '-'))

    ctx.logger = loggerGenerator(`request[${shortRequestID}]`)
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

    ctx.logger = loggerGenerator(
      `[${ctx.method}]${ctx.url}`,
      undefined,
      extraLabels
    )
  }

  return next()
}
