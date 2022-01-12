#!/usr/bin/env node

import yargs from 'yargs'

import start from './start'

// eslint-disable-next-line no-unused-expressions
yargs
  .scriptName('friday')
  .usage('$0 <cmd> [args]')
  .command(
    ['start', '$0'],
    'start a server, as it is the default command',
    {
      host: {
        alias: 'h',
        describe: 'specify a host on which to listen',
        type: 'string',
      },
      port: {
        alias: 'p',
        describe: 'specify a port on which to listen',
        type: 'number',
      },
      listen: {
        alias: 'l',
        describe: 'specify a URI endpoint on which to listen',
        type: 'string',
      },
      'unix-socket': {
        alias: 'n',
        describe: 'path to a UNIX socket',
        type: 'string',
      },
    },
    start
  )
  .help()
  .example(
    '',
    `
  For TCP (traditional host/port) endpoint:

    $ friday -p 1234
    $ friday -h 127.0.0.1
    $ friday -l tcp://127.0.0.1:1234

  For UNIX domain socket endpoint:

    $ friday -n unix:/path/to/socket.sock
`
  ).argv
