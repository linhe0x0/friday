import path from 'path'

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
  } catch (err: any) {
    throw new Error(`Failed to import ${filepath}: ${err.stack}`)
  }
}
