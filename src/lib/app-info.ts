import fs from 'fs'
import path from 'path'

import { pkgInfo } from '../utilities/pkg'

let entryFilePath = pkgInfo.main || 'app.js'

if (entryFilePath[0] !== '/') {
  entryFilePath = path.resolve(process.cwd(), entryFilePath)
}

if (!fs.existsSync(entryFilePath)) {
  console.error(`The file or directory "${entryFilePath}" doesn't exist.`)
  process.exit(1)
}

const entryFileData = path.parse(entryFilePath)
const root = entryFileData.dir
const app = path.resolve(root, 'app')

export const entry = entryFilePath
export const rootDir = root
export const appDir = app
