import { normalizeError } from './normalize-error'

test('should return an error with Error instance', () => {
  const error = new Error('test')

  expect(normalizeError(error)).toBe(error)
})

test('should return an error with string', () => {
  const err = normalizeError('stringify error')

  expect(err).toEqual(new Error('stringify error'))
})

test('should return an error with number', () => {
  const err = normalizeError(1)

  expect(err).toEqual(new Error('1'))
})

test('should return an error with function', () => {
  const err = normalizeError(() => {
    return 'function error'
  })

  expect(err).toEqual(new Error('function error'))
})

test('should return an error with object', () => {
  const err = normalizeError({
    name: 'object name',
    message: 'object with message',
    stack: 'object stack',
  })

  expect(err).toEqual(new Error('object with message'))
  expect(err.name).toBe('object name')
  expect(err.stack).toBe('object stack')
})

test('should return an error with empty object', () => {
  const err = normalizeError({})

  expect(err).toEqual(new Error('[object Object]'))
})
