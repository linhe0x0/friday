import _ from 'lodash'

interface ErrorsLike {
  name: string
  error?: Error
}

interface ErrorsOptions {
  name?: string
  message: string
  statusCode?: number
  error?: Error
  context?: Record<string, any>
}

class Errors extends Error {
  status?: number

  statusCode?: number

  error?: Error

  context?: Record<string, any>

  constructor(name: string, message: string) {
    super(message)

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, Errors)
    }

    if (name) {
      this.name = name
    }
  }

  with(context: Record<string, any>): Errors {
    this.context = context

    return this
  }

  /**
   * Alias for with.
   */
  withContext(context: Record<string, any>): Errors {
    this.context = context

    return this
  }

  withName(name: string): Errors {
    this.name = name

    return this
  }

  withError(err: Error): Errors {
    const endsWithColon = this.message.trimRight().endsWith(':')

    this.error = err

    if (this.message) {
      this.message = `${this.message}${endsWithColon ? '' : ': '}${err.message}`
    } else {
      this.message = err.message
    }

    return this
  }

  withStatus(statusCode: number): Errors {
    this.status = statusCode
    this.statusCode = statusCode

    return this
  }

  throw(): void {
    // eslint-disable-next-line no-throw-literal
    throw this
  }
}

export function createError(
  message: string,
  context?: Record<string, any>
): Errors
export function createError(
  name: string,
  message: string,
  context?: Record<string, any>
): Errors
export function createError(
  statusCode: number,
  message: string,
  context?: Record<string, any>
): Errors
export function createError(options: ErrorsOptions): Errors
export function createError(...args: any[]): Errors {
  const defaultErrorName = 'unknown'
  const opts: ErrorsOptions = {
    message: '',
  }

  if (typeof args[0] === 'object') {
    _.assign(opts, args[0])
  } else if (typeof args[0] === 'string') {
    if (args.length === 1) {
      ;[opts.message] = args
    } else if (args.length === 2 && typeof args[1] !== 'string') {
      ;[opts.message, opts.context] = args
    } else if (!args[1]) {
      ;[opts.message, opts.context] = args
    } else {
      ;[opts.name, opts.message, opts.context] = args
    }
  } else if (typeof args[0] === 'number') {
    ;[opts.statusCode, opts.message, opts.context] = args
  }

  if (!opts.message) {
    throw new Error('message is required.')
  }

  const err = new Errors(opts.name || defaultErrorName, opts.message)

  if (opts.statusCode) {
    err.withStatus(opts.statusCode)
  }

  if (opts.context) {
    err.with(opts.context)
  }

  if (opts.error) {
    err.withError(opts.error)
  }

  return err
}

export function throwError(
  message: string,
  context?: Record<string, any>
): never
export function throwError(
  name: string,
  message: string,
  context?: Record<string, any>
): never
export function throwError(
  statusCode: number,
  message: string,
  context?: Record<string, any>
): never
export function throwError(options: ErrorsOptions): never
export function throwError(...args: any): never {
  const err = createError(args[0], args[1], args[2])

  throw err
}

export function newError(name: string, message?: string): Errors {
  return new Errors(name, message || '')
}

export function is(err: ErrorsLike, name: string): boolean {
  const isSameName = err.name === name

  if (isSameName) {
    return isSameName
  }

  if (err.error) {
    return err.error.message === name
  }

  return false
}

export function isErrors(err: unknown | any): err is Errors {
  return err instanceof Errors
}
