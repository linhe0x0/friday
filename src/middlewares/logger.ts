import config from 'config'
import Koa from 'koa'
import _ from 'lodash'
import uuidv3 from 'uuid/v3'
import uuidv4 from 'uuid/v4'

import loggerGenerator from '../utilities/logger'

const debug = config.has('debug')
  ? config.get('debug')
  : process.env.FRIDAY_ENV === 'development'

export default function(ctx: Koa.Context, next: Function): Promise<void> {
  const requestID =
    ctx.header['x-request-id'] ||
    ctx.state.requestID ||
    uuidv3(Date.now().toString(), uuidv4())

  if (debug) {
    const shortRequestID = _.first(_.split(requestID, '-'))

    ctx.logger = loggerGenerator(`request[${shortRequestID}]`)
  } else {
    ctx.logger = loggerGenerator(`request`)
  }

  return next()
}
