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

// Use the following to make the file a module, because the file cannot be
// complied under '--isolatedModules' flag without it.
// eslint-disable-next-line jest/no-export
export {}
