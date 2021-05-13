import { pkgInfo } from './pkg'

test('load json file', () => {
  expect(pkgInfo.name).toBe('@sqrtthree/friday')
})
