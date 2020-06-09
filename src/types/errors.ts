import { ErrorObject } from 'ajv'

export interface ErrorResponse {
  requestID: string
  code?: number | string
  message: string
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data?: any
  errors?: []
}

export interface KoaError extends Error {
  status: number
  statusCode: number
}

export interface TypeValidateError extends Error {
  status: number
  statusCode: number
  errors: ErrorObject[] | null | undefined
}
