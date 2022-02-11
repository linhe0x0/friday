import { ignoredFile } from './mount-api'

test('should ignore the file which starts with .', () => {
  expect(ignoredFile('.ignore.js')).toBe(true)
})

test('should ignore the file which starts with _', () => {
  expect(ignoredFile('_ignore.js')).toBe(true)
})

test('should ignore the file which ends with .test.js', () => {
  expect(ignoredFile('ignore.test.js')).toBe(true)
})

test('should ignore the file which ends with .spec.js', () => {
  expect(ignoredFile('ignore.spec.js')).toBe(true)
})

test('should not ignore the normal file', () => {
  expect(ignoredFile('users/[id].get.js')).toBe(false)
})
