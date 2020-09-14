import _ from 'lodash'

import loader from './loader'

// eslint-disable-next-line @typescript-eslint/no-empty-function
const noop = function noop(): void {}

const hooksCache = {}

export default function useHooks(
  file: string
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
): Record<string, () => Promise<any> | void> {
  let hooks = hooksCache[file]

  if (!hooks) {
    try {
      hooks = loader(file)

      hooksCache[file] = hooks
    } catch (err) {
      hooks = {}
    }
  }

  return _.defaults(hooks, {
    beforeClose: noop,
    afterClose: noop,
    beforeRestart: noop,
    beforeStart: noop,
    afterStart: noop,
    afterRestart: noop,
  })
}
