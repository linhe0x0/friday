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
  labels?: Record<string, string | number>,
  mixin?: pino.MixinFn
): pino.Logger {
  const isDebugMode = isDebug()

  let logLevel: pino.LevelWithSilent = isDebugMode ? 'trace' : 'info'

  if (config.has('logger.level')) {
    logLevel = config.get('logger.level')
  }

  if (process.env.LOGGER_LEVEL) {
    logLevel = process.env.LOGGER_LEVEL as pino.Level
  }

  if (process.env.NODE_ENV === 'test' || process.env.NODE_ENV === 'testing') {
    logLevel = 'silent'
  }

  const defaultBaseLabels = {
    hostname: os.hostname(),
    pid: process.pid,
  }
  const baseLabels = _.assign(defaultBaseLabels, labels)
  const prettyPrint = isDebugMode
    ? {
        translateTime: 'SYS:HH:MM:ss',
        ignore: _.join(_.keys(defaultBaseLabels), ','),
      }
    : false

  const logger = pino({
    name,
    level: logLevel,
    base: baseLabels,
    mixin,
    nestedKey: 'context',
    timestamp: pino.stdTimeFunctions.isoTime,
    prettyPrint,
  })

  return logger
}

type loggerContext = Record<string | number, any>

class Logger {
  private logger: pino.Logger

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private context?: loggerContext = undefined

  private err?: Error = undefined

  constructor(
    name: string,
    labels?: Record<string, string | number>,
    mixin?: pino.MixinFn
  ) {
    this.logger = loggerGenerator(name, labels, mixin)
  }

  private caller(
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
      options.interpolationValues = _.concat([message], interpolationValues)
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

    const fn: pino.LogFn = this.logger[method].bind(this.logger)

    if (_.isEmpty(options.mergingObject)) {
      fn(options.message, ...options.interpolationValues)
    } else {
      fn(options.mergingObject, options.message, ...options.interpolationValues)
    }

    this.context = undefined
    this.err = undefined
  }

  trace: pino.LogFn = (...args) => {
    this.caller('trace', ...args)
  }

  debug: pino.LogFn = (...args) => {
    this.caller('debug', ...args)
  }

  info: pino.LogFn = (...args) => {
    this.caller('info', ...args)
  }

  warn: pino.LogFn = (...args) => {
    this.caller('warn', ...args)
  }

  error: pino.LogFn = (...args) => {
    this.caller('error', ...args)
  }

  fatal: pino.LogFn = (...args) => {
    this.caller('fatal', ...args)
  }

  withContext(payload: loggerContext) {
    this.context = payload

    return this
  }

  withError(err: Error) {
    this.err = err

    return this
  }
}

export default function useLogger(
  name: string,
  labels?: Record<string, string>,
  mixin?: () => Record<string, string>
): Logger {
  return new Logger(name, labels, mixin)
}
