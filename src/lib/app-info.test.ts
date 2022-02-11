import _ from 'lodash'

import { entry, rootDir, appDir } from './app-info'

test('entry file', () => {
  expect(_.endsWith(entry, 'dist/main.js')).toBe(true)
})

test('get root dir of app', () => {
  expect(_.endsWith(rootDir, 'friday/dist')).toBe(true)
})

test('get app dir of app', () => {
  expect(_.endsWith(appDir, 'friday/dist/app')).toBe(true)
})
