import _ from 'lodash'
import os from 'os'
import pino, { BaseLogger, LoggerOptions } from 'pino'
import pinoPretty from 'pino-pretty'

import { normalizeError } from '../lib/normalize-error'
import { hasConfig, getConfig } from '../services/config'
import { isDebugMode } from './env'

type MixinFn = () => any

export function loggerGenerator(
  name: string,
  labels?: Record<string, string | number>,
  mixinFn?: MixinFn
): pino.Logger {
  const isDebug = isDebugMode()

  let logLevel: pino.LevelWithSilent = isDebug ? 'trace' : 'info'

  if (hasConfig('logger.level')) {
    logLevel = getConfig('logger.level')
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

  let mixin: MixinFn | undefined = mixinFn

  if (!mixin) {
    mixin = () => ({})
  }

  const options: LoggerOptions = {
    name,
    level: logLevel,
    formatters: {
      level: (label: string): Record<string, string> => ({ level: label }),
    },
    base: baseLabels,
    mixin,
    nestedKey: 'context',
    timestamp: pino.stdTimeFunctions.isoTime,
  }

  if (isDebug) {
    const stream = pinoPretty({
      translateTime: 'SYS:HH:MM:ss',
      ignore: _.join(_.keys(defaultBaseLabels), ','),
    })

    const logger = pino(options, stream)

    return logger
  }

  const logger = pino(options)

  return logger
}

type loggerContext = Record<string | number, any>

interface LoggingMethodOptions {
  mergingObject: Record<string, any>
  message: string
  interpolationValues: any[]
}

class Logger implements BaseLogger {
  level: pino.LevelWithSilent | string = 'info'

  private logger: pino.Logger

  private context?: loggerContext | undefined = undefined

  private err?: Error | undefined = undefined

  constructor(
    name: string,
    labels?: Record<string, string | number>,
    mixin?: MixinFn
  ) {
    this.logger = loggerGenerator(name, labels, mixin)

    this.level = this.logger.level
  }

  private caller<T>(
    method: string,
    mergingObject?: T,
    message?: string,
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

  /**
   * Noop function.
   */
  // eslint-disable-next-line class-methods-use-this
  silent: pino.LogFn = () => undefined

  trace: pino.LogFn = <T>(...args: any[]) => {
    this.caller<T>('trace', ...args)
  }

  debug: pino.LogFn = <T>(...args: any[]) => {
    this.caller<T>('debug', ...args)
  }

  info: pino.LogFn = <T>(...args: any[]) => {
    this.caller<T>('info', ...args)
  }

  warn: pino.LogFn = <T>(...args: any[]) => {
    this.caller<T>('warn', ...args)
  }

  error: pino.LogFn = <T>(...args: any[]) => {
    this.caller<T>('error', ...args)
  }

  fatal: pino.LogFn = <T>(...args: any[]) => {
    this.caller<T>('fatal', ...args)
  }

  withContext(payload: loggerContext) {
    this.context = payload

    return this
  }

  withError(err: unknown) {
    const error = normalizeError(err)

    this.err = error

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
