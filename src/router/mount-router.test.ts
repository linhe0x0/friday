import path from 'path'
import mountRouter from './mount-router'

test('should mount routes with router.js', () => {
  const dir = path.join(__dirname, 'fixtures/router')
  const useRouter = mountRouter(dir)

  expect(typeof useRouter).toBe('function')
})

test('should mount routes with router/index.js', () => {
  const dir = path.join(__dirname, 'fixtures/router')
  const useRouter = mountRouter(dir)

  expect(typeof useRouter).toBe('function')
})

test('should return default router handler when there is no router file', () => {
  const dir = path.join(__dirname, 'fixtures/empty')
  const useRouter = mountRouter(dir)

  expect(typeof useRouter).toBe('function')
})
