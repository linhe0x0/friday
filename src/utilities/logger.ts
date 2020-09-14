import config from 'config'
import _ from 'lodash'
import os from 'os'
import pino from 'pino'

import isDebug from './is-debug'

interface LoggingMethodOptions {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  mergingObject: Record<string, any>
  message: string
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  interpolationValues: any[]
}

export function loggerGenerator(
  name: string,
  level?: string,
  labels?: Record<string, string>,
  mixin?: () => Record<string, string>
): pino.Logger {
  const isDebugMode = isDebug()

  let logLevel = isDebugMode ? 'trace' : 'info'

  if (config.has('logger.level')) {
    logLevel = config.get('logger.level')
  }

  if (process.env.LOGGER_LEVEL) {
    logLevel = process.env.LOGGER_LEVEL
  }

  if (level) {
    logLevel = level
  }

  if (process.env.NODE_ENV === 'test' || process.env.NODE_ENV === 'testing') {
    logLevel = 'silent'
  }

  const baseLabels = _.assign(
    {
      hostname: os.hostname(),
      pid: process.pid,
    },
    labels
  )

  const mixinFn = mixin || ((): Record<string, string> => ({}))

  const logger = pino({
    name,
    level: logLevel,
    base: baseLabels,
    mixin: mixinFn,
    nestedKey: 'context',
    prettyPrint: isDebugMode
      ? {
          translateTime: 'SYS:HH:MM:ss',
          ignore: _.join(_.keys(baseLabels), ','),
        }
      : false,
  })

  return logger
}

class Logger {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  logger: any = null

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  context?: Record<string, any> = undefined

  err?: Error = undefined

  constructor(
    name: string,
    level?: string,
    labels?: Record<string, string>,
    mixin?: () => Record<string, string>
  ) {
    this.logger = loggerGenerator(name, level, labels, mixin)
  }

  caller(
    method: string,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    mergingObject?: Record<string, any>,
    message?: string,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ...interpolationValues: any[]
  ) {
    const options: LoggingMethodOptions = {
      mergingObject: {},
      message: '',
      interpolationValues: [],
    }

    if (typeof mergingObject === 'string') {
      options.message = mergingObject
      options.interpolationValues = interpolationValues
    } else {
      options.mergingObject = mergingObject || {}
      options.message = message || ''
      options.interpolationValues = interpolationValues
    }

    if (this.context) {
      _.assign(options.mergingObject, this.context)
    }

    if (this.err) {
      _.assign(options.mergingObject, {
        error: _.pick(this.err, ['name', 'message', 'stack']),
      })
    }

    this.logger[method].call(
      this.logger,
      options.mergingObject,
      options.message,
      ...options.interpolationValues
    )

    this.context = undefined
    this.err = undefined
  }

  trace(...args) {
    this.caller('trace', ...args)
  }

  debug(...args) {
    this.caller('debug', ...args)
  }

  info(...args) {
    this.caller('info', ...args)
  }

  warn(...args) {
    this.caller('warn', ...args)
  }

  error(...args) {
    this.caller('error', ...args)
  }

  fatal(...args) {
    this.caller('fatal', ...args)
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  withContext(payload: Record<string, any>) {
    this.context = payload
  }

  withError(err: Error) {
    this.err = err
  }
}

export default function useLogger(
  name: string,
  level?: string,
  labels?: Record<string, string>,
  mixin?: () => Record<string, string>
): Logger {
  return new Logger(name, level, labels, mixin)
}
