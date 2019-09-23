import _ from 'lodash'

import loader from './loader'

const noop = () => {}

const hooksCache = {}

export default function useHooks(file: string) {
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
