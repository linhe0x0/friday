import path from 'path'

import loader from './loader'

test('load json file', () => {
  const pkg = loader(path.resolve(__dirname, '../../package.json'))

  expect(pkg.name).toBe('@sqrtthree/friday')
})

test('load common js file', () => {
  const js = loader(path.resolve(__dirname, '../../dist/utilities/pkg.js'))

  expect(typeof js).toBe('object')
  expect(js.default).toBeDefined()
  expect(js.pkgInfo).toBeDefined()
  expect(js.default.pkgInfo).toBe(js.pkgInfo)
})

test('load ESModule js file', () => {
  const js = loader(path.resolve(__dirname, '../../dist/utilities/loader.js'))

  expect(js.default).toBeDefined()
  expect(typeof js.default).toBe('function')
})

test('load non existent file', () => {
  expect(() => {
    loader(path.resolve(__dirname, './a.js'))
  }).toThrow()
})
