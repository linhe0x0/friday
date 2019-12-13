import Ajv from 'ajv'
import ajvErrors from 'ajv-errors'
import _ from 'lodash'

import { TypeValidateError } from '../types/errors'

export function validate(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  schema: Record<string, any>,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: Record<string, any>
): void {
  const ajv = new Ajv({
    allErrors: true,
    jsonPointers: true,
  })

  ajvErrors(ajv)

  const validator = ajv.compile(schema)
  const isValid = validator(data)

  if (isValid) {
    return
  }

  const err: Partial<TypeValidateError> = new Error('Schema validation error')

  err.status = 400
  err.statusCode = 400

  err.errors = _.map(validator.errors, item => {
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
