export { default as useLogger } from './utilities/logger'

// App must be exported after useLogger due to side effect of router register.
export { default as app } from './app'

// Server
export { default as getServer } from './utilities/get-server'

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
