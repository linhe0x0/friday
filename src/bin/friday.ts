#!/usr/bin/env node

import yargs from 'yargs'

import main from './main'

const bin = yargs
  .scriptName('friday')
  .usage('$0 <cmd> [args]')
  .command(
    ['start [entry-point]', '$0 [entry-point]'],
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
      env: {
        alias: 'e',
        describe: 'specify an environment of application and config files',
        type: 'string',
      },
    },
    main
  )
  .help()
  .example(
    '',
    `
By default, app will be listened on 0.0.0.0:3000 and look first for the "main" field in package.json and subsequently for app.js as the default entry_point.

Listen endpoints (specified by the --listen or -l options above) instruct app to listen on the specified interface/port, UNIX domain socket.

  For TCP (traditional host/port) endpoint:

    $ friday -p 1234
    $ friday -h 127.0.0.1
    $ friday -l tcp://127.0.0.1:1234

  For UNIX domain socket endpoint:

    $ friday -l unix:/path/to/socket.sock
`
  )

bin.parse()
