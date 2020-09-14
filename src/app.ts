import Koa from 'koa'
import bodyParser from 'koa-bodyparser'
import helmet from 'koa-helmet'
import serve from 'koa-static'
import _ from 'lodash'
import path from 'path'

import cors from '@koa/cors'

import debugMiddleware from './middlewares/debug'
import errorHandlerMiddleware from './middlewares/error-handler'
import loggerMiddleware from './middlewares/logger'
import requestIDMiddleware from './middlewares/request-id'
import outputRoutes from './router/output-routes'
import router from './router/router'
import { getOptionalConfig } from './services/config'
import { validate } from './services/validator'
import isDebug from './utilities/is-debug'
import useLogger from './utilities/logger'
import validateConfig from './utilities/validate-config'

const logger = useLogger('friday')

const app = new Koa()

if (!_.includes(['production', 'testing', 'test'], process.env.NODE_ENV)) {
  logger.warn(
    `Running in "${
      process.env.NODE_ENV || 'development'
    }" env. you can remove this warning by export NODE_ENV=production`
  )
}

const isDebugMode = isDebug()

if (isDebugMode) {
  logger.debug(
    `Running in "debug" mode. It's better to switch to "production" mode if you are in production environment.`
  )
  logger.debug('  - using env:    export NODE_ENV=production')
  logger.debug('  - using config: debug=false')
  logger.debug('')

  outputRoutes(router)
}

// Check if the config schema file exists and validate user configurations.
validateConfig()

/**
 * Extends properties or methods to ctx to be used across the entire app
 */
app.context.validate = validate

app.use(errorHandlerMiddleware)

/**
 * Help secure the app with various HTTP headers by helmet.
 */
const helmetOptions = getOptionalConfig('helmet')

app.use(helmet(helmetOptions))

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
 * Use cors middleware
 */
const corsConfig = getOptionalConfig('cors')

if (isDebugMode || corsConfig) {
  app.use(cors(corsConfig))
}

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
    'server error: %s, context: $o',
    err.message,
    _.pick(ctx, ['request', 'response'])
  )
})

export default app
