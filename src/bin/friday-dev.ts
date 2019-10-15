#!/usr/bin/env node

import boxen from 'boxen'
import chalk from 'chalk'
import chokidar from 'chokidar'
import clipboardy from 'clipboardy'
import consola from 'consola'
import getPort from 'get-port'
import http from 'http'
import ip from 'ip'
import _ from 'lodash'
import path from 'path'
import yargs from 'yargs'

import useHooks from '../utilities/hooks'
import isValidPort from '../utilities/is-valid-port'
import parseEndpoint from '../utilities/parse-endpoint'
import resolveEntry from '../utilities/resolve-entry'
import serve from '../utilities/serve'
import watch from '../utilities/watcher'

const args = yargs
  .scriptName('friday')
  .option('host', {
    alias: 'h',
    describe: 'specify a host on which to listen',
    type: 'string',
  })
  .option('port', {
    alias: 'p',
    describe: 'specify a port on which to listen',
    type: 'number',
  })
  .option('listen', {
    alias: 'l',
    describe: 'specify a URI endpoint on which to listen',
    type: 'string',
  })
  .example(
    'friday -l tcp://hostname:1234',
    'for TCP (traditional host/port) endpoints'
  ).argv

const { host, port, listen } = args
const defaultPort = parseInt(process.env.PORT || '3000', 10) || 3000
const defaultHost = '0.0.0.0'

process.env.FRIDAY_ENV = 'development'

const isHostOrPortProvided = !!(host || port)

if (isHostOrPortProvided && listen) {
  console.error('Both host/port and tcp provided. You can only use one.')
  process.exit(1)
}

const endpoint: [number, string] = listen
  ? parseEndpoint(listen)
  : [defaultPort, defaultHost]

if (port) {
  if (!isValidPort(port)) {
    console.error(`Port option must be a number. Got: ${port}`)
    process.exit(1)
  }

  endpoint[0] = port
}

if (args.host) {
  endpoint[1] = args.host
}

const entryFile = resolveEntry(args._[0])
const originalPort = endpoint[0]

const hooks = useHooks(entryFile)

const copyToClipboard = function copyToClipboard(content: string): boolean {
  try {
    clipboardy.writeSync(content)
    return true
  } catch (err) {
    return false
  }
}

const restartServer = (
  watcher: chokidar.FSWatcher,
  filepath: string,
  server: http.Server
): Promise<http.Server> => {
  consola.info(
    `${chalk.green('File changed:')} ${path.relative(process.cwd(), filepath)}`
  )
  consola.info(chalk.blue('Restarting server...'))

  const watched = watcher.getWatched()
  const toDelete: string[] = []

  _.forEach(_.keys(watched), mainPath => {
    _.forEach(watched[mainPath], subPath => {
      const fullPath = path.join(mainPath, subPath)

      toDelete.push(fullPath)
    })
  })

  const haveToReloadFiles = _.map(['app.js', 'router/router.js'], item =>
    path.resolve(__dirname, '..', item)
  )

  const toReload = _.filter(_.keys(require.cache), item =>
    _.includes(haveToReloadFiles, item)
  )

  // Clean cache
  _.forEach(_.concat(toDelete, toReload), item => {
    let location: string

    try {
      location = require.resolve(item)
    } catch (err) {
      location = ''
    }

    if (location) {
      delete require.cache[location]
    }
  })

  return new Promise(function restart(resolve, reject): void {
    hooks.beforeClose()

    // Restart the server
    server.close(() => {
      hooks.afterClose()
      hooks.beforeRestart()

      serve(endpoint, entryFile)
        .then(newServer => {
          hooks.afterRestart()

          consola.info(chalk.blue('Server is ready.'))

          resolve(newServer)
        })
        .catch(reject)
    })
  })
}

getPort({
  port: endpoint[0],
})
  .then(result => {
    endpoint[0] = result

    return serve(endpoint, entryFile)
  })
  .then(curretServer => {
    const [usedPort, hostname] = endpoint
    const { isTTY } = process.stdout
    const ipAddress = ip.address()

    const toWatch = path.dirname(entryFile)

    const watcher = watch(
      toWatch,
      '',
      async (_event: string, filepath: string) => {
        try {
          // eslint-disable-next-line no-param-reassign
          curretServer = await restartServer(watcher, filepath, curretServer)
        } catch (err) {
          consola.error('Failed to restart the server.', err)
          process.exit(1)
        }
      }
    )

    let message = chalk.green('Friday is running:')

    if (originalPort !== usedPort) {
      message += ` ${chalk.red(
        `(on port ${usedPort}, because ${originalPort} is already in use.)`
      )}`
    }

    message += '\n\n'

    const localURL = `http://${
      hostname === '0.0.0.0' ? 'localhost' : hostname
    }:${usedPort}`
    const networkURL = `http://${ipAddress}:${usedPort}`

    message += `• ${chalk.bold('Local:           ')} ${localURL}\n`
    message += `• ${chalk.bold('On Your Network: ')} ${networkURL}\n\n`

    if (isTTY) {
      const copied = copyToClipboard(localURL)

      if (copied) {
        message += chalk.grey('Copied local address to clipboard.\n')
      }
    }

    message += chalk.grey(`And watching for file changes: ${toWatch}`)

    const box = boxen(message, {
      padding: 1,
      borderColor: 'green',
      margin: 1,
    })

    process.stdout.write(box)
  })
  .catch(err => {
    consola.error(err)
    process.exit(1)
  })
