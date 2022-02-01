import Koa from 'koa'
import bodyParser from 'koa-bodyparser'
import helmet from 'koa-helmet'
import serve from 'koa-static'
import _ from 'lodash'
import path from 'path'

import cors from '@koa/cors'

import { getEntrySetupFun } from './lib/entry'
import accessMiddleware from './middleware/access'
import debugMiddleware from './middleware/debug'
import errorHandlerMiddleware from './middleware/error-handler'
import loggerMiddleware from './middleware/logger'
import requestIDMiddleware from './middleware/request-id'
import * as router from './router'
import { getOptionalConfig } from './services/config'
import { emitHook } from './services/hooks'
import { addMiddleware, getMiddlewareList } from './services/middleware'
import { validate } from './services/validator'
import { validateConfig } from './utilities/config-schema'
import { isDebugMode, isInitialStart } from './utilities/env'
import useLogger from './utilities/logger'

const logger = useLogger('friday')

const debug = isDebugMode()
const initialStart = isInitialStart()

if (debug && initialStart) {
  if (!_.includes(['production', 'testing', 'test'], process.env.NODE_ENV)) {
    logger.warn(
      `Running in "${
        process.env.NODE_ENV || 'development'
      }" env. you can remove this warning by export NODE_ENV=production`
    )
  }

  logger.debug(
    `Running in "debug" mode. It's better to switch to "production" mode if you are in production environment.`
  )
  logger.debug('  - using env:    export NODE_ENV=production')
  logger.debug('  - using config: debug=false')
  logger.debug('')
}

let app = new Koa()

/**
 * Defaulting app.env to the APP_ENV or NODE_ENV or "development".
 *
 * APP_ENV can be set with `--env`.
 */
app.env = process.env.APP_ENV || process.env.NODE_ENV || 'development'

/**
 * Extends properties or methods to ctx to be used across the entire app
 */
app.context.validate = validate

const setup = getEntrySetupFun()

app = setup(app)

// Check if the config schema file exists and validate user configurations.
validateConfig()

emitHook('onLoad', app)

/**
 * Set signed cookie keys.
 */
const cookieKeys = getOptionalConfig<string[]>('keys')

if (cookieKeys) {
  app.keys = cookieKeys
}

addMiddleware(errorHandlerMiddleware, 100)

/**
 * Help secure the app with various HTTP headers by helmet.
 */
const helmetOptions = getOptionalConfig<any>('helmet')
const helmetMiddleware = helmet(helmetOptions)

addMiddleware(helmetMiddleware, 10)

/**
 * Mount body-parser middleware.
 */
const bodyParserOptions = getOptionalConfig<bodyParser.Options>('bodyParser')
// Assign a new value due to the value from config.get() is immutable.
const bodyParserMiddleware = bodyParser(_.assign({}, bodyParserOptions))

addMiddleware(bodyParserMiddleware, 10)
addMiddleware(requestIDMiddleware, 10)
addMiddleware(loggerMiddleware, 10)

if (!debug) {
  addMiddleware(accessMiddleware, 10)
}

/**
 * Use static middleware.
 */
const staticConfig = getOptionalConfig<Record<string, string>>('static')
let staticRootDirectory: string | undefined = ''

if (staticConfig) {
  staticRootDirectory =
    typeof staticConfig === 'string' ? staticConfig : staticConfig.root
}

if (!staticRootDirectory) {
  staticRootDirectory = path.resolve(process.cwd(), 'public')
}

const staticOptions = _.defaults(_.get(staticConfig, 'options'), {})
const staticMiddleware = serve(staticRootDirectory, staticOptions)

addMiddleware(staticMiddleware, 10)

/**
 * Use cors middleware
 */
const corsConfig = getOptionalConfig('cors')

if (debug || corsConfig) {
  const corsMiddleware = cors(corsConfig)

  addMiddleware(corsMiddleware, 10)
}

/**
 * Use debug middleware when running in development env.
 */
if (process.env.FRIDAY_ENV === 'development') {
  addMiddleware(debugMiddleware, 10)
}

const allMiddlewareList = getMiddlewareList()

allMiddlewareList.forEach((item) => {
  app.use(item.mid)
})

/**
 * Register routes.
 */
router.mount(app, {
  debug: debug && initialStart,
})

/**
 * Catch errors.
 */
app.on('error', (err, ctx) => {
  emitHook('onError', app)

  if (process.env.FRIDAY_ENV === 'development') {
    return
  }

  const payload = {
    request: _.defaults(_.pick(ctx.request, ['method', 'url', 'header']), {
      body: ctx.request.body,
    }),
    response: _.pick(ctx.response, ['status', 'message', 'header']),
  }

  logger.withError(err).error(payload, 'server error: %s', err.message)
})

/**
 * Handle process signals.
 */
if (initialStart) {
  // Handle warnings
  process.on('warning', (warning) => {
    logger.warn(warning)
  })

  // Handle uncaught promises
  process.on('unhandledRejection', (err) => {
    if (err instanceof Error) {
      logger.withError(err).error(`Unhandled Rejection: ${err.message}`)
    } else {
      logger.error('Unhandled Rejection: %s', err)
    }
  })

  // Handle uncaught exceptions
  // Logger error and exit the process, does not exit gracefully.
  process.once('uncaughtException', (err) => {
    logger.fatal(err)
    process.exit(1)
  })
}

emitHook('onInit', app)

// Export immutable binding
export const application = app
