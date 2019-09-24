import config from 'config'
import Koa from 'koa'
import bodyParser from 'koa-bodyparser'
import serve from 'koa-static'
import _ from 'lodash'
import path from 'path'

import debugMiddleware from './middlewares/debug'
import errorHandlerMiddleware from './middlewares/error-handler'
import loggerMiddleware from './middlewares/logger'
import requestIDMiddleware from './middlewares/request-id'
import router from './router/router'
import loggerGenerator from './utilities/logger'

const logger = loggerGenerator('friday')

const app = new Koa()

app.use(errorHandlerMiddleware)
app.use(bodyParser())
app.use(requestIDMiddleware)
app.use(loggerMiddleware)

/**
 * Use static middleware.
 */
const staticConfig = config.has('static') ? config.get('static') : null
let staticRootDirectory = ''

if (staticConfig) {
  staticRootDirectory =
    typeof staticConfig === 'string' ? staticConfig : staticConfig.root
}

if (!staticRootDirectory) {
  staticRootDirectory = path.resolve(process.cwd(), 'public')
}

const staticOptions = _.defaults(_.get(staticConfig, 'options'), {})

app.use(serve(staticRootDirectory, staticOptions))

/**
 * Use debug middleware when running in development env.
 */
if (process.env.FRIDAY_ENV === 'development') {
  app.use(debugMiddleware)
}

/**
 * Register routes.
 */
app.use(router.routes())
app.use(router.allowedMethods())

/**
 * Catch errors.
 */
app.on('error', (err, ctx) => {
  logger.error('server error:', err.message, ctx)
})

export default app
