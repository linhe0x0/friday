import _ from 'lodash'

// eslint-disable-next-line
export default function loader(filepath: string) {
  let mod

  try {
    // eslint-disable-next-line
    mod = require(filepath)

    const originalMod = mod

    if (mod && typeof mod === 'object' && mod.default) {
      mod = mod.default // Await to support es6 module's default export
    }

    mod = _.assign(mod, _.omit(originalMod, ['default']))
  } catch (err) {
    throw new Error(`Failed to import ${filepath}: ${err.stack}`)
  }

  return mod
}
