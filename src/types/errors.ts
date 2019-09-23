import { ErrorObject } from 'ajv'

export interface ErrorResponse {
  message: string
  data?: any
  errors?: []
}

export interface KoaError extends Error {
  status: number
}

export interface TypeValidateError extends Error {
  errors?: ErrorObject[] | null | undefined
}
