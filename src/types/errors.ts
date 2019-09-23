import { ErrorObject } from 'ajv'

export interface ErrorResponse {
  message: string
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data?: any
  errors?: []
}

export interface KoaError extends Error {
  status: number
}

export interface TypeValidateError extends Error {
  errors?: ErrorObject[] | null | undefined
}
