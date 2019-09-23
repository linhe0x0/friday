import fs from 'fs'
import path from 'path'

export default function resolveEntry(targetPath: string): string {
  let filepath = targetPath

  if (!filepath) {
    try {
      const pkgPath = path.resolve(process.cwd(), 'package.json')

      // eslint-disable-next-line
      const pkg = require(pkgPath)

      filepath = pkg.main || 'dist/app.js'
    } catch (err) {
      if (err.code !== 'MODULE_NOT_FOUND') {
        console.error(`Could not read \`package.json\`: ${err.message}`)
        process.exit(1)
      }
    }
  }

  if (!filepath) {
    console.error('Please supply a entry file.')
    process.exit(1)
  }

  if (filepath[0] !== '/') {
    filepath = path.resolve(process.cwd(), filepath)
  }

  if (!fs.existsSync(filepath)) {
    console.error(`The file or directory "${filepath}" doesn't exist.`)
    process.exit(1)
  }

  return filepath
}
