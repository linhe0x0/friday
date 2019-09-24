import config from 'config'
import _ from 'lodash'
import os from 'os'
import pino from 'pino'

export default function loggerGenerator(
  name: string,
  level?: string,
  labels?: Record<string, string>
): pino.Logger {
  const debug = config.has('debug')
    ? config.get('debug')
    : process.env.FRIDAY_ENV === 'development'
  let logLevel = debug ? 'trace' : 'info'

  if (config.has('logger.level')) {
    logLevel = config.get('logger.level')
  }

  if (level) {
    logLevel = level
  }

  const baseLabels = _.assign(
    {
      hostname: os.hostname(),
      pid: process.pid,
    },
    labels
  )

  const logger = pino({
    name,
    level: logLevel,
    base: baseLabels,
    prettyPrint: debug
      ? {
          translateTime: 'SYS:HH:MM:ss',
          ignore: _.join(_.keys(baseLabels), ','),
        }
      : false,
  })

  return logger
}
