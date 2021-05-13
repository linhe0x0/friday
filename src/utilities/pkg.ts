import path from 'path'

import loader from './loader'

export const pkgPath = path.resolve(process.cwd(), 'package.json')

interface PkgInfo {
  name: string
  version: string
  main: string
}

let pkg: PkgInfo = {
  name: '',
  version: '',
  main: '',
}

try {
  pkg = loader(pkgPath)
} catch (err) {
  console.error(`${pkgPath} is not found.`)
  process.exit(1)
}

export const pkgInfo = pkg
