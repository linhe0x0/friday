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

  error?: Error

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  context?: Record<string, any>

  constructor(name: string, message: string) {
    super(message)

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

    return this
  }

  throw(): void {
    // eslint-disable-next-line no-throw-literal
    throw this
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function throwError(message: string, context?: Record<string, any>): void
function throwError(
  name: string,
  message: string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  context?: Record<string, any>
): void
function throwError(
  code: number,
  message: string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  context?: Record<string, any>
): void
function throwError(options: RichErrorOptions): void
function throwError(...args): void {
  const defaultErrorName = 'unknown'
  const opts: RichErrorOptions = {
    message: '',
  }

  if (typeof args[0] === 'object') {
    Object.assign(opts, args[0])
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

  const e = new RichError(opts.name || defaultErrorName, opts.message)

  e.throw()
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

export default {
  throwError,
  newError,
  new: newError,
  throw: throwError,
  is,
}
