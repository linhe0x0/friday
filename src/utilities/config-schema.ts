import config from 'config'
import _ from 'lodash'
import path from 'path'

import { validate, ValidationSchema } from '../services/validator'
import loader from './loader'
import useLogger from './logger'

const logger = useLogger('friday:config')

const schemas: ValidationSchema[] = []

export function addConfigSchema(schema: ValidationSchema): void {
  schemas.push(schema)
}

export function resetConfigSchema(): void {
  schemas.length = 0
}

export function validateConfig(): void {
  const configDir = config.util.getEnv('NODE_CONFIG_DIR')
  const schemaFilePath = path.join(configDir, 'schema.json')
  const configurations = config.util.loadFileConfigs()

  try {
    const schema: ValidationSchema = loader(schemaFilePath)

    addConfigSchema(schema)
  } catch (err) {
    logger.warn(`there is no config schema file in ${schemaFilePath}.`)
  }

  _.forEach(schemas, (schema) => {
    try {
      validate(schema, configurations)
    } catch (err) {
      logger.error(`Invalid configurations from ${configDir}:`)

      _.forEach(err.errors, (item) => {
        logger.error(`  ${item.dataPath} ${item.message}`)
      })

      throw err
    }
  })
}
