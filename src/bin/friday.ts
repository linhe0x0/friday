#!/usr/bin/env node

import _ from 'lodash'
import yargs from 'yargs'

import { Endpoint, EndpointProtocol } from '../types/friday'
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
  .option('unix-socket', {
    alias: 'n',
    describe: 'path to a UNIX socket',
    type: 'string',
  })
  .option('silent', {
    alias: 's',
    describe: 'disable all output',
    type: 'boolean',
  })
  .example(
    '',
    `
  For TCP (traditional host/port) endpoint:

    $ friday -l tcp://hostname:1234

  For UNIX domain socket endpoint:

    $ friday -l unix:/path/to/socket.sock
`
  ).argv

const { host, port, listen, silent } = args
const defaultPort = parseInt(process.env.PORT || '3000', 10) || 3000
const defaultHost = '0.0.0.0'

if (_.isNil(process.env.NODE_ENV)) {
  process.env.NODE_ENV = 'production'
}

process.env.FRIDAY_ENV = 'production'

if (silent) {
  process.env.LOGGER_LEVEL = 'silent'
}

const isHostOrPortProvided = !!(host || port)

if (isHostOrPortProvided && listen) {
  console.error('Both host/port and tcp provided. You can only use one.')
  process.exit(1)
}

if (port) {
  if (!isValidPort(port)) {
    console.error(`Port option must be a number. Got: ${port}`)
    process.exit(1)
  }
}

const endpoint: Endpoint = listen
  ? parseEndpoint(listen)
  : {
      protocol: EndpointProtocol.HTTP,
      host: host || defaultHost,
      port,
    }

if (endpoint.protocol !== EndpointProtocol.UNIX) {
  _.defaults(endpoint, {
    host: defaultHost,
    port: defaultPort,
  })
}

const entryFile = resolveEntry(args._[0])

serve(endpoint, entryFile)
  .then(() => {
    let message = 'Server is running.'

    if (endpoint.protocol === EndpointProtocol.UNIX) {
      message = `Server is running at ${endpoint.host}.\n`
    } else {
      message = `Server is running at ${endpoint.protocol}//${endpoint.host}:${endpoint.port}.\n`
    }

    process.stdout.write(message)
  })
  .catch((err) => {
    console.error(err)
    process.exit(1)
  })
