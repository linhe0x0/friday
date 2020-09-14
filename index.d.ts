export * from './dist/main'

declare namespace Friday {
  /**
   * Response
   */
  type DefaultResponseExtends = any

  interface DefaultResponse extends DefaultResponseExtends {}

  type FridayApiResponse<T = DefaultResponse> = Promise<
    T | string | null | undefined
  >

  /**
   * Validation
   */
  interface ValidateSchema {
    required?: string[]
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    properties: Record<string, any>
  }
  interface Schema extends ValidateSchema {}
}

export default Friday
