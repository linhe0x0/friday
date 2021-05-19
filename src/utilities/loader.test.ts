import path from 'path'

import loader from './loader'

test('load json file', () => {
  const pkg = loader(path.resolve(__dirname, '../../package.json'))

  expect(pkg.name).toBe('@sqrtthree/friday')
})

test('load common js file', () => {
  const js = loader(path.resolve(__dirname, './root-dir.js'))

  expect(typeof js === 'object').toBeTruthy()
})

test('load ESModule js file', () => {
  const js = loader(path.resolve(__dirname, './loader.js'))

  expect(typeof js === 'function').toBeTruthy()
})

test('load non existent file', () => {
  expect(() => {
    loader(path.resolve(__dirname, './a.js'))
  }).toThrow()
})
