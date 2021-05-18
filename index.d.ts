import * as Koa from 'koa'

declare module '@sqrtthree/friday' {
  /**
   * Context
   */
  export interface Context extends Koa.Context {}

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
}

export * from './dist/main'
