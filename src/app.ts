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
import { getOptionalConfig } from './services/config'
import loggerGenerator from './utilities/logger'
import validateConfig from './utilities/validate-config'

const logger = loggerGenerator('friday')

const app = new Koa()

// Check if the config schema file exists and validate user configurations.
validateConfig()

app.use(errorHandlerMiddleware)

/**
 * Mount body-parser middleware.
 */
const bodyParserOptions = getOptionalConfig<bodyParser.Options>('bodyParser')

// Assign a new value due to the value from config.get() is immutable.
app.use(bodyParser(_.assign({}, bodyParserOptions)))

app.use(requestIDMiddleware)
app.use(loggerMiddleware)

/**
 * Use static middleware.
 */
const staticConfig = getOptionalConfig<Record<string, string>>('static')
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
  logger.error(
    'server error:',
    err.message,
    _.pick(ctx, ['request', 'response'])
  )
})

export default app
