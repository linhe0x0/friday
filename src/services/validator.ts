import Ajv, { DefinedError } from 'ajv'
import ajvErrors from 'ajv-errors'
import _ from 'lodash'

import { TypeValidateError } from '../types/errors'

interface ValidateSchema {
  required?: string[]
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  properties: Record<string, any>
}

export function validate(
  schema: ValidateSchema,
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
    const dataPath = item.dataPath.replace(/\//g, '.')

    return _.assign({}, item, {
      dataPath,
    })
  })

  throw err
}

export default {
  validate,
}
