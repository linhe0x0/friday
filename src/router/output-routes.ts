import _ from 'lodash'

import loggerGenerator from '../utilities/logger'

const logger = loggerGenerator('friday:router')

export default function outputRoutes(router): void {
  logger.debug('Served routes:')

  router.stack.forEach(item => {
    const { methods, path } = item
    let methodTexts = methods.join(', ')

    if (methodTexts) {
      if (
        methodTexts ===
        'HEAD, ACL, BIND, CHECKOUT, CONNECT, COPY, DELETE, GET, HEAD, LINK, LOCK, M-SEARCH, MERGE, MKACTIVITY, MKCALENDAR, MKCOL, MOVE, NOTIFY, OPTIONS, PATCH, POST, PROPFIND, PROPPATCH, PURGE, PUT, REBIND, REPORT, SEARCH, SOURCE, SUBSCRIBE, TRACE, UNBIND, UNLINK, UNLOCK, UNSUBSCRIBE'
      ) {
        methodTexts = 'ALL'
      }

      logger.debug('  ', _.padEnd(methodTexts, 10), path)
    }
  })

  logger.debug('')
}
