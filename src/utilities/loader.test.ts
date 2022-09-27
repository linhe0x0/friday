import path from 'path'

import loader from './loader'

test('load json file', () => {
  const pkg = loader(path.resolve(__dirname, './fixtures/loader/loader.json'))

  expect(pkg.name).toBe('loader json')
})

test('load common js file', () => {
  const js = loader(
    path.resolve(__dirname, './fixtures/loader/loader-common.js')
  )

  expect(typeof js).toBe('object')
  expect(js.default).toBeDefined()
  expect(js.main).toBeDefined()
  expect(js.default.main).toBe(js.main)

  const js2 = loader(
    path.resolve(__dirname, './fixtures/loader/loader-common2.js')
  )

  expect(typeof js2).toBe('function')
  expect(js2.default).toBeDefined()
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
