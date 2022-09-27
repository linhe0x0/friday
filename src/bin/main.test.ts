import { spawn } from 'child_process'
import main from './main'
import start from './start'
import logger from '../lib/command-logger'
import { findUp, existsSync } from '../utilities/fs'

jest.mock('./start', () => {
  return {
    __esModule: true,
    default: jest.fn(),
  }
})
jest.mock('../lib/command-logger', () => {
  return {
    __esModule: true,
    default: {
      verbose: jest.fn(),
      debug: jest.fn(),
      info: jest.fn(),
      warn: jest.fn(),
      error: jest.fn(),
    },
  }
})
jest.mock('../utilities/fs', () => {
  const originalModule = jest.requireActual('../utilities/fs')

  return {
    __esModule: true,
    ...originalModule,
    default: jest.fn(),
    findUp: jest.fn(),
    existsSync: jest.fn(),
  }
})

jest.mock('child_process', () => {
  const originalModule = jest.requireActual('../utilities/fs')

  return {
    ...originalModule,
    spawn: jest.fn(),
    //   spawn() {
    //     return {
    //       stdout: {
    //         pipe: jest.fn(),
    //       },
    //       stderr: {
    //         pipe: jest.fn(),
    //       },
    //       on: jest.fn(),
    //     }
    //   },
  }
})

beforeEach(() => {
  jest.resetModules()
})

afterEach(() => {
  jest.resetAllMocks()
})

describe('start command', () => {
  test('should call start function when running without any sub command', () => {
    main({
      _: [],
      $0: 'friday',
    })

    const { mock } = start as any

    expect(start).toBeCalledTimes(1)
    expect(mock.calls[0][0]).toEqual({
      _: [],
      $0: 'friday',
    })
  })

  test('should call start function when running with start sub command', () => {
    main({
      _: ['start'],
      $0: 'friday',
    })

    const { mock } = start as any

    expect(start).toBeCalledTimes(1)
    expect(mock.calls[0][0]).toEqual({
      _: ['start'],
      $0: 'friday',
    })
  })

  test('should call start function when running with entrypoint file', () => {
    main({
      _: [],
      $0: 'friday',
      entryPoint: 'app.js',
    })

    const { mock } = start as any

    expect(start).toBeCalledTimes(1)
    expect(mock.calls[0][0]).toEqual({
      _: [],
      $0: 'friday',
      entryPoint: 'app.js',
    })
  })
})

describe('sub command', () => {
  beforeEach(() => {
    ;(spawn as any).mockReturnValue({
      stdout: {
        pipe: jest.fn(),
      },
      stderr: {
        pipe: jest.fn(),
      },
      on: jest.fn(),
    })
  })

  test('should throw an error if node_modules is not found when running with dev sub command', () => {
    ;(findUp as any).mockReturnValue('')

    const exit = jest
      .spyOn<any, string>(process, 'exit')
      .mockImplementation(() => {})

    main({
      _: [],
      $0: 'friday',
      entryPoint: 'dev',
    })

    const { mock } = logger.error as any

    expect(mock.calls[0][0]).toBe(
      'node_modules directory is not found from current working directory.'
    )
    expect(exit).toBeCalledWith(1)

    exit.mockRestore()
  })

  test('should throw an error if friday-cli is not found when running with dev sub command', () => {
    ;(findUp as any).mockReturnValue('mock-path')
    ;(existsSync as any).mockReturnValue(false)

    const exit = jest
      .spyOn<any, string>(process, 'exit')
      .mockImplementation(() => {})

    main({
      _: [],
      $0: 'friday',
      entryPoint: 'dev',
    })

    const { mock } = logger.error as any

    expect(mock.calls[0][0]).toBe(
      'friday-cli is not found. Maybe you forgot to install it?'
    )
    expect(exit).toBeCalledWith(1)

    exit.mockRestore()
  })

  test('should create a child process to run sub command when running with dev sub command', () => {
    ;(findUp as any).mockReturnValue('mock-path')
    ;(existsSync as any).mockReturnValue(true)

    main({
      _: [],
      $0: 'friday',
      entryPoint: 'dev',
    })

    const { mock } = spawn as any

    expect(spawn).toBeCalledTimes(1)
    expect(mock.calls[0][0]).toEqual('mock-path/.bin/friday-cli')
  })
})
