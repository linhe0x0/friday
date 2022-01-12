import isValidPort from './is-valid-port'

test('should return true with port 3000', () => {
  expect(isValidPort(3000)).toBe(true)
})

test('should return false with port 0', () => {
  expect(isValidPort(0)).toBe(false)
})

test('should return false with port 65537', () => {
  expect(isValidPort(65537)).toBe(false)
})

test('should return false with port abc', () => {
  expect(isValidPort('abc')).toBe(false)
})
