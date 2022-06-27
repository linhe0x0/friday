import fs from 'fs'
import path from 'path'

import { pkgInfo } from '../utilities/pkg'

// Look first for the "main" field in package.json and subsequently for app.js
// as the default entry_point.
let entryPoint = pkgInfo.main || 'app.js'

// If environment variable "FRIDAY_ENTRY_POINT" is specified, it will overwrite
// the default.
if (process.env.FRIDAY_ENTRY_POINT) {
  entryPoint = process.env.FRIDAY_ENTRY_POINT
}

if (entryPoint[0] !== '/') {
  entryPoint = path.resolve(process.cwd(), entryPoint)
}

if (!fs.existsSync(entryPoint)) {
  console.error(`The file or directory "${entryPoint}" doesn't exist.`)
  process.exit(1)
}

const entryPointData = path.parse(entryPoint)
const root = entryPointData.dir
const app = path.resolve(root, 'app')

export const entry = entryPoint
export const rootDir = root
export const appDir = app
