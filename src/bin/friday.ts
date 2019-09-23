#!/usr/bin/env node

import yargs from 'yargs'

import isValidPort from '../utilities/is-valid-port'
import parseEndpoint from '../utilities/parse-endpoint'
import resolveEntry from '../utilities/resolve-entry'
import serve from '../utilities/serve'

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
    'micro -l tcp://hostname:1234',
    'for TCP (traditional host/port) endpoints'
  ).argv

const { host, port, listen } = args
const defaultPort = 3000
const defaultHost = '127.0.0.1'

process.env.FRIDAY_ENV = 'production'

const isHostOrPortProvided = !!(host || port)

if (isHostOrPortProvided && listen) {
  console.error('Both host/port and tcp provided. You can only use one.')
  process.exit(1)
}

const endpoint: [number?, string?] = listen ? parseEndpoint(listen) : []

if (port) {
  if (!isValidPort(port)) {
    console.error(`Port option must be a number. Got: ${port}`)
    process.exit(1)
  }

  endpoint.push(port || defaultPort)
}

if (args.host) {
  endpoint.push(args.host)
}

if (endpoint.length === 0) {
  endpoint.push(defaultPort, defaultHost)
}

if (endpoint.length === 1) {
  endpoint.push(defaultHost)
}

const entryFile = resolveEntry(args._[0])

serve(endpoint, entryFile)
  .then(() => {
    const [usedPort, hostname] = endpoint

    process.stdout.write(
      `Server is running at http://${hostname}:${usedPort}.\n`
    )
  })
  .catch(err => {
    console.error(err)
    process.exit(1)
  })
