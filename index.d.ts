import * as Koa from 'koa'

/**
 * Logger
 *
 * dist/utilities/logger.d.ts
 */
type loggerContext = Record<string | number, any>
type MixinFn = () => object

interface LogFn {
  <T extends object>(obj: T, msg?: string, ...args: any[]): void
  (msg: string, ...args: any[]): void
}

declare class Logger {
  private logger
  private context?: loggerContext
  private err?: Error
  constructor(
    name: string,
    labels?: Record<string, string | number>,
    mixin?: MixinFn
  )
  private caller(
    method: string,
    mergingObject?: Record<string, any>,
    message?: string,
    ...interpolationValues: any[]
  ): void
  trace: LogFn
  debug: LogFn
  info: LogFn
  warn: LogFn
  error: LogFn
  fatal: LogFn
  withContext(payload: loggerContext): this
  withError(err: Error): this
}

/**
 * Module
 */
declare module '@sqrtthree/friday' {
  /**
   * Response
   */
  type DefaultResponseExtends = any
  interface DefaultResponse extends DefaultResponseExtends {}
  export type APIResponse<T = DefaultResponse> = Promise<
    T | string | null | undefined
  >

  /**
   * Validation
   */
  export interface ValidationSchema {
    required?: string[]
    properties: Record<string, any>
  }

  /**
   * Context
   */
  export interface Context extends Koa.Context {
    validate(
      schema: ValidationSchema,
      data: Record<string, any>,
      ...payload: Record<string, any>[]
    ): void

    logger: Logger
  }
}

export * from './dist/main'
