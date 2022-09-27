const runCommand = (...args: string[]): void => {
  process.argv = ['node', 'friday', ...args]

  require('./friday')
}

beforeEach(() => {
  jest.resetModules()
})

afterEach(() => {
  jest.resetAllMocks()
})

describe('friday --help', () => {
  test('should output help info with example message when called with --help flag.', () => {
    const log = jest.spyOn(console, 'log').mockImplementation(() => {})
    const exit = jest
      .spyOn<any, string>(process, 'exit')
      .mockImplementation(() => {})

    runCommand('--help')

    expect(log.mock.calls[0]![0]).toMatchSnapshot()
    expect(exit).toBeCalledWith(0)

    log.mockRestore()
    exit.mockRestore()
  })

  test('should output help info of start command when called with --help flag.', () => {
    const log = jest.spyOn(console, 'log').mockImplementation(() => {})
    const exit = jest
      .spyOn<any, string>(process, 'exit')
      .mockImplementation(() => {})

    runCommand('start', '--help')

    expect(log.mock.calls[0]![0]).toMatchSnapshot()
    expect(exit).toBeCalledWith(0)

    log.mockRestore()
    exit.mockRestore()
  })
})

describe('run start command', () => {
  beforeAll(() => {
    jest.mock('./start')
  })

  afterAll(() => {
    jest.unmock('./start')
  })

  test('should run start command when running without subcommand', async () => {
    const start = jest.requireMock('./start')

    const exit = jest
      .spyOn<any, string>(process, 'exit')
      .mockImplementation(() => {})

    runCommand()

    expect(start.default).toHaveBeenCalledTimes(1)

    exit.mockRestore()
  })

  test('should run start command when running default command with specified entry-point', async () => {
    const start = jest.requireMock('./start')

    const exit = jest
      .spyOn<any, string>(process, 'exit')
      .mockImplementation(() => {})

    runCommand('app.js')

    expect(start.default).toHaveBeenCalledTimes(1)
    expect(start.default.mock.calls[0][0]).toMatchObject({
      entryPoint: 'app.js',
    })

    exit.mockRestore()
  })

  test('should run start command when running start subcommand', async () => {
    const start = jest.requireMock('./start')

    const exit = jest
      .spyOn<any, string>(process, 'exit')
      .mockImplementation(() => {})

    runCommand('start')

    expect(start.default).toBeCalledTimes(1)

    exit.mockRestore()
  })

  test('should run start command when running start subcommand with specified entry-point', async () => {
    const start = jest.requireMock('./start')

    const exit = jest
      .spyOn<any, string>(process, 'exit')
      .mockImplementation(() => {})

    runCommand('start', 'app.js')

    expect(start.default).toBeCalledTimes(1)
    expect(start.default.mock.calls[0][0]).toMatchObject({
      entryPoint: 'app.js',
    })

    exit.mockRestore()
  })
})

describe('run sub command: dev', () => {
  beforeAll(() => {
    jest.mock('child_process', () => {
      return {
        spawn() {
          return {
            stdout: {
              pipe: jest.fn(),
            },
            stderr: {
              pipe: jest.fn(),
            },
            on: jest.fn(),
          }
        },
      }
    })
    jest.mock('./start')
    jest.mock('../lib/command-logger')
  })

  afterAll(() => {
    jest.unmock('child_process')
    jest.unmock('./start')
    jest.unmock('../lib/command-logger')
  })

  test('run dev sub command with missing friday-cli package', () => {
    const logger = require('../lib/command-logger')
    const exit = jest
      .spyOn<any, string>(process, 'exit')
      .mockImplementation(() => {})

    runCommand('dev')

    expect(logger.default.error.mock.calls[0][0]).toBe(
      'friday-cli is not found. Maybe you forgot to install it?'
    )
    expect(exit).toBeCalledWith(1)

    exit.mockRestore()
  })
})

// Use the following to make the file a module, because the file cannot be
// complied under '--isolatedModules' flag without it.
// eslint-disable-next-line jest/no-export
export {}
