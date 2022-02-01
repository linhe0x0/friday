import _ from 'lodash'
import type { Arguments } from 'yargs'

import logger from '../lib/command-logger'
import isValidPort from '../lib/is-valid-port'
import parseEndpoint from '../lib/parse-endpoint'
import { gracefulShutdown } from '../lib/process'
import serve, { Endpoint } from '../lib/serve'

interface StartCommandOptions {
  host?: string | undefined
  port?: number | undefined
  listen?: string | undefined
  env?: string | undefined
}

export default function start(argv: Arguments<StartCommandOptions>): void {
  const { host, port, listen, env } = argv
  const defaultHost = '0.0.0.0'
  const defaultPort = parseInt(process.env.PORT || '3000', 10) || 3000

  process.env.FRIDAY_ENV = 'production'
  process.env.APP_ENV = env || 'production'

  if (!process.env.NODE_CONFIG_ENV) {
    process.env.NODE_CONFIG_ENV = process.env.APP_ENV
  }

  if (!process.env.NODE_ENV) {
    process.env.NODE_ENV = 'production'
  }

  const isHostOrPortProvided = !!(host || port)

  if (isHostOrPortProvided && listen) {
    logger.error('Both host/port and tcp provided. You can only use one.')
    process.exit(1)
  }

  if (port) {
    if (!isValidPort(port)) {
      logger.error(`Port option must be a number but got: ${port}`)
      process.exit(1)
    }
  }

  let endpoint: Endpoint = {
    protocol: 'http:',
    host: host || defaultHost,
    port: port || defaultPort,
  }

  if (listen) {
    endpoint = parseEndpoint(listen)
  }

  if (endpoint.protocol !== 'unix:') {
    _.defaults(endpoint, {
      host: defaultHost,
      port: defaultPort,
    })
  }

  serve(endpoint)
    .then((server) => {
      gracefulShutdown(() => {
        logger.info('Gracefully shutting down. Please wait...')

        const { createApp, hooks } = require('../main')
        const app = createApp()

        hooks
          .emitHook('beforeClose', app)
          .then(() => {
            logger.debug('Closing app server...')

            return new Promise<void>((resolve, reject) => {
              server.close((err) => {
                if (err) {
                  reject(err)

                  return
                }

                logger.debug('Server has been closed')
                hooks.emitHook('onClose', app)
                resolve()
              })
            })
          })
          .then(() => {
            logger.success('Closed successfully')
            process.exit(0)
          })
          .catch((err) => {
            logger.error(`Failed to close the server: ${err.message}`)
            process.exit(1)
          })
      })

      // `friday start` is designed to run only in production, so
      // this message is perfectly for production.
      let message = 'Server is running.'

      if (endpoint.protocol === 'unix:') {
        message = `Server is running at ${endpoint.host}.\n`
      } else if (endpoint.host && endpoint.port) {
        message = `Server is running at ${endpoint.protocol}//${endpoint.host}:${endpoint.port}.\n`
      } else if (endpoint.port) {
        message = `Server is running on port ${endpoint.port}.\n`
      }

      process.stdout.write(message)
    })
    .catch((err) => {
      logger.error(`Cannot serve app:`, err.message)
      process.exit(2)
    })
}
