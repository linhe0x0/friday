import Ajv from 'ajv'
import ajvErrors from 'ajv-errors'
import Koa from 'koa'
import _ from 'lodash'

import { TypeValidateError } from '../types/errors'
import { ValidateSchema } from '../types/validator'

export function validate(
  schema: ValidateSchema,
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

export function validateCtxPayload(
  schema: ValidateSchema,
  ctx: Koa.Context
): void {
  const payload = _.pick({}, ctx.request.body, ctx.query, ctx.params)

  return validate(schema, payload)
}

export default {
  validate,
  validateCtxPayload,
}
