import _ from 'lodash'

interface RichErrorLike {
  name: string
  error?: Error
}

interface RichErrorOptions {
  name?: string
  message: string
  code?: number
  error?: Error
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  context?: Record<string, any>
}

class RichError extends Error {
  code?: number

  status?: number

  statusCode?: number

  error?: Error

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  context?: Record<string, any>

  constructor(name: string, message: string) {
    super(message)

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, RichError)
    }

    if (name) {
      this.name = name
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  with(context: Record<string, any>): RichError {
    this.context = context

    return this
  }

  withName(name: string): RichError {
    this.name = name

    return this
  }

  withError(err: Error): RichError {
    const endsWithColon = this.message.trimRight().endsWith(':')

    this.error = err
    this.message = `${this.message}${endsWithColon ? '' : ': '}${err.message}`

    return this
  }

  withCode(code: number): RichError {
    this.code = code
    this.status = code
    this.statusCode = code

    return this
  }

  throw(): void {
    // eslint-disable-next-line no-throw-literal
    throw this
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function createError(
  message: string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  context?: Record<string, any>
): RichError
export function createError(
  name: string,
  message: string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  context?: Record<string, any>
): RichError
export function createError(
  code: number,
  message: string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  context?: Record<string, any>
): RichError
export function createError(options: RichErrorOptions): RichError
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function createError(...args: any[]): RichError {
  const defaultErrorName = 'unknown'
  const opts: RichErrorOptions = {
    message: '',
  }

  if (typeof args[0] === 'object') {
    _.assign(opts, args[0])
  } else if (typeof args[0] === 'string') {
    if (args.length === 1) {
      ;[opts.message] = args
    } else if (args.length === 2 && typeof args[1] !== 'string') {
      ;[opts.message, opts.context] = args
    } else {
      ;[opts.name, opts.message, opts.context] = args
    }
  } else if (typeof args[0] === 'number') {
    ;[opts.code, opts.message, opts.context] = args
  }

  if (!opts.message) {
    throw new Error('Message is missed.')
  }

  const err = new RichError(opts.name || defaultErrorName, opts.message)

  if (opts.code) {
    err.withCode(opts.code)
  }

  if (opts.context) {
    err.with(opts.context)
  }

  if (opts.error) {
    err.withError(opts.error)
  }

  return err
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function throwError(
  message: string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  context?: Record<string, any>
): never
export function throwError(
  name: string,
  message: string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  context?: Record<string, any>
): never
export function throwError(
  code: number,
  message: string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  context?: Record<string, any>
): never
export function throwError(options: RichErrorOptions): never
// eslint-disable-next-line @typescript-eslint/no-explicit-any,@typescript-eslint/explicit-module-boundary-types
export function throwError(...args: any): never {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const err = createError(args[0], args[1], args[2])

  throw err
}

export const newError = (name: string, message?: string): RichError => {
  return new RichError(name, message || '')
}

export const is = (err: RichErrorLike, name: string): boolean => {
  const isSameName = err.name === name

  if (isSameName) {
    return isSameName
  }

  if (err.error) {
    return is(err.error, name)
  }

  return false
}
