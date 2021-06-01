import Koa from 'koa'

/**
 * Errors
 */
export { createError, throwError } from './services/errors'
export * as errors from './services/errors'

// Logger
export { default as useLogger } from './utilities/logger'

/**
 * Validator
 */
export { default as validator } from './services/validator'
export { validate } from './services/validator'

/**
 * Config
 */
export {
  getConfig,
  getOptionalConfig,
  getConfigWithDefault,
} from './services/config'

/**
 * App Hooks
 */
export * as hooks from './services/hooks'

/**
 * App Middleware
 */
export * as middleware from './services/middleware'

export function createApp(): Koa {
  // eslint-disable-next-line @typescript-eslint/no-var-requires,global-require
  const { application } = require('./app')

  return application
}
