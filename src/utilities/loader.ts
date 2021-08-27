import path from 'path'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default function loader(filepath: string): any {
  try {
    // eslint-disable-next-line
    const mod = require(filepath)
    const ext = path.extname(filepath)
    const isJS = ext === '.js'

    if (isJS && !mod.default) {
      Object.defineProperty(mod, 'default', {
        value: mod,
        writable: false,
      })
    }

    return mod
  } catch (err) {
    throw new Error(`Failed to import ${filepath}: ${err.stack}`)
  }
}
