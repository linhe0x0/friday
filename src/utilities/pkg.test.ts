import os from 'os'
import { pkgUp, readPkgUp } from './pkg'

describe('pkgUp', () => {
  test('should find package.json file', () => {
    const pkg = pkgUp()

    expect(pkg).toMatch('package.json')
  })

  test('should return empty when finding a package.json file that dose not exist', () => {
    const cmd = os.tmpdir()
    const pkg = pkgUp(cmd)

    expect(pkg).toBe('')
  })
})

describe('readPkgUp', () => {
  test('should find package.json file and parse content', () => {
    const { pkgInfo, pkgPath, pkgDir } = readPkgUp()

    expect(pkgPath).toMatch('package.json')
    expect(pkgDir).toBeTruthy()
    expect(pkgInfo).toHaveProperty('name', '@sqrtthree/friday')
    expect(pkgInfo).toHaveProperty('version')
    expect(pkgInfo).toHaveProperty('main')
  })

  test('should exit the process when finding a package.json file than dose not exist', () => {
    const error = jest
      .spyOn<any, string>(console, 'error')
      .mockImplementation(() => {})
    const exit = jest
      .spyOn<any, string>(process, 'exit')
      .mockImplementation(() => {})

    const cmd = os.tmpdir()

    readPkgUp(cmd)

    expect((error.mock as any).calls[0][0]).toBe('cannot find package.json.')
    expect(exit).toHaveBeenCalledWith(1)
  })
})
