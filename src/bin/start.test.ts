import path from 'path'
import type { StartCommandOptions } from './start'

jest.mock('../lib/serve', () => {
  return {
    __esModule: true,
    default: jest.fn().mockResolvedValue({
      close: () => {},
    }),
  }
})

jest.mock('../lib/command-logger')

beforeAll(() => {
  process.env.SUPPRESS_NO_CONFIG_WARNING = 'true'
  process.env.NODE_CONFIG_STRICT_MODE = 'false'
})

beforeEach(() => {
  process.env.FRIDAY_ENTRY_POINT = path.join(__dirname, './fixtures/app.js')

  jest.resetModules()
})

afterEach(() => {
  process.env.FRIDAY_ENTRY_POINT = undefined

  jest.resetAllMocks()
})

afterAll(() => {
  process.env.SUPPRESS_NO_CONFIG_WARNING = undefined
  process.env.NODE_CONFIG_STRICT_MODE = undefined
})

const run = (options: StartCommandOptions): void => {
  const start = require('./start')

  return start.default({
    $0: 'friday',
    _: ['start'],
    ...options,
  })
}

describe('start subcommand with default options', () => {
  test('should run start command when running without options', async () => {
    const serve = jest.requireMock('../lib/serve')

    run({})

    expect(serve.default.mock.calls[0][0]).toEqual({
      host: '0.0.0.0',
      port: 3000,
      protocol: 'http:',
    })
    expect(process.env.FRIDAY_ENV).toBe('production')
    expect(process.env.APP_ENV).toBe('production')
    expect(process.env.NODE_CONFIG_ENV).toBe('production')
  })
})

describe('start subcommand with specified options', () => {
  test('should run start command when running with specified host', async () => {
    const serve = jest.requireMock('../lib/serve')

    run({
      host: '127.0.0.1',
    })

    expect(serve.default.mock.calls[0][0]).toEqual({
      host: '127.0.0.1',
      port: 3000,
      protocol: 'http:',
    })
  })

  test('should run start command when running with specified port', async () => {
    const serve = jest.requireMock('../lib/serve')

    run({
      port: 8080,
    })

    expect(serve.default.mock.calls[0][0]).toEqual({
      host: '0.0.0.0',
      port: 8080,
      protocol: 'http:',
    })
  })

  test('should run start command when running with specified PORT environment', async () => {
    process.env.PORT = '8080'

    const serve = jest.requireMock('../lib/serve')

    run({})

    expect(serve.default.mock.calls[0][0]).toEqual({
      host: '0.0.0.0',
      port: 8080,
      protocol: 'http:',
    })

    process.env.PORT = undefined
  })

  test('should run start command when running with specified listen', async () => {
    const serve = jest.requireMock('../lib/serve')

    run({
      listen: 'tcp://127.0.0.1:8080',
    })

    expect(serve.default.mock.calls[0][0]).toEqual({
      host: '127.0.0.1',
      port: 8080,
      protocol: 'tcp:',
    })
  })

  test('should exit process when running with conflict host and listen', async () => {
    const logger = require('../lib/command-logger')
    const exit = jest
      .spyOn<any, string>(process, 'exit')
      .mockImplementation(() => {})

    run({
      host: '0.0.0.0',
      listen: 'tcp://0.0.0.0:8080',
    })

    expect(logger.default.error.mock.calls[0][0]).toBe(
      'Both host/port and tcp provided. You can only use one.'
    )
    expect(exit).toBeCalledWith(1)

    exit.mockRestore()
  })

  test('should exit process when running with conflict port and listen', async () => {
    const logger = require('../lib/command-logger')
    const exit = jest
      .spyOn<any, string>(process, 'exit')
      .mockImplementation(() => {})

    run({
      port: 3000,
      listen: 'tcp://0.0.0.0:8080',
    })

    expect(logger.default.error.mock.calls[0][0]).toBe(
      'Both host/port and tcp provided. You can only use one.'
    )
    expect(exit).toBeCalledWith(1)

    exit.mockRestore()
  })

  test('should exit process when running with invalid port', async () => {
    const logger = require('../lib/command-logger')
    const exit = jest
      .spyOn<any, string>(process, 'exit')
      .mockImplementation(() => {})

    const options: any = {
      port: 'invalid',
    }

    run(options)

    expect(logger.default.error.mock.calls[0][0]).toBe(
      'Port option must be a number but got: invalid'
    )
    expect(exit).toBeCalledWith(1)

    exit.mockRestore()
  })
})
