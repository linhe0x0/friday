import _ from 'lodash'

import { entry } from './entry'

test('entry file', () => {
  expect(_.endsWith(entry, 'dist/main.js')).toBe(true)
})
