// eslint-disable-next-line import/no-extraneous-dependencies
import mock from 'mock-fs'
import mountRouter from './mount-router'

afterEach(mock.restore)

test('should mount routes with router.js', () => {
  mock({
    'dist/router.js': 'module.exports = function () {}',
  })

  const useRouter = mountRouter()

  expect(typeof useRouter).toBe('function')
})

test('should mount routes with router/index.js', () => {
  mock({
    'dist/router/index.js': 'module.exports = function () {}',
  })

  const useRouter = mountRouter()

  expect(typeof useRouter).toBe('function')
})

test('should return default router handler when there is no router file', () => {
  const useRouter = mountRouter()

  expect(typeof useRouter).toBe('function')
})
