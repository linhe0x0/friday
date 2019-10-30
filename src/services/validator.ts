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

  const validate = ajv.compile(schema)
  const isValid = validate(data)

  if (isValid) {
    return
  }

  const err: TypeValidateError = new Error('Schema validation error')

  err.errors = _.map(validate.errors, item => {
    item.dataPath = `data${item.dataPath.replace(/\//g, '.')}`

    return item
  })

  throw err
}

export default {
  validate,
}
