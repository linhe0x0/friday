import Ajv from 'ajv'
import ajvErrors from 'ajv-errors'

import { TypeValidateError } from '../types/errors'

export default function validator(schema: Object, data: Object): void {
  const ajv = new Ajv({
    allErrors: true,
    jsonPointers: true,
  })

  ajvErrors(ajv)

  const validate = ajv.compile(schema)
  const isValid = validate(data)

  if (isValid) {
    return
  }

  const err: TypeValidateError = new Error('Schema validation error')

  err.errors = validate.errors

  throw err
}
