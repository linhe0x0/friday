import fs from 'fs'
import path from 'path'

import { pkgInfo } from './pkg'

let filepath = pkgInfo.main || 'app.js'

if (filepath[0] !== '/') {
  filepath = path.resolve(process.cwd(), filepath)
}

if (!fs.existsSync(filepath)) {
  console.error(`The file or directory "${filepath}" doesn't exist.`)
  process.exit(1)
}

export const entry = filepath
