import Ajv, { DefinedError, ErrorObject } from 'ajv'
import ajvErrors from 'ajv-errors'
import _ from 'lodash'

interface ValidationSchema {
  required?: string[]
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  properties: Record<string, any>
}

interface TypeValidateError extends Error {
  status: number
  statusCode: number
  errors: ErrorObject[] | null | undefined
}

export function validate(
  schema: ValidationSchema,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: Record<string, any>,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ...payload: Record<string, any>[]
): void {
  const ajv = new Ajv({
    allErrors: true,
  })

  ajvErrors(ajv)

  const validator = ajv.compile(schema)
  const target = _.assign({}, data, ...payload)
  const isValid = validator(target)

  if (isValid) {
    return
  }

  const err: Partial<TypeValidateError> = new Error('Schema validation error')

  err.status = 400
  err.statusCode = 400

  err.errors = _.map(validator.errors as DefinedError[], (item) => {
    const dataPath = item.instancePath.replace(/\//g, '.')

    return _.assign({}, item, {
      dataPath,
    })
  })

  throw err
}

export default {
  validate,
}
