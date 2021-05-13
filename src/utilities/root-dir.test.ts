import _ from 'lodash'

import { rootDir } from './root-dir'

test('get root dir of app', () => {
  expect(_.endsWith(rootDir, 'friday/dist')).toBe(true)
})
