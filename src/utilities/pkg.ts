import path from 'path'

import { findUp, parseJSON } from './fs'

export const pkgUp = (cwd?: string, stopAt?: string): string => {
  return findUp('package.json', cwd, stopAt)
}

interface PkgInfo {
  name?: string
  version?: string
  main?: string
}

interface ReadPkgUp {
  pkgInfo: PkgInfo
  pkgPath: string
  pkgDir: string
}

export const readPkgUp = (cwd?: string): ReadPkgUp => {
  const pkgPath = pkgUp(cwd)

  if (!pkgPath) {
    console.error('cannot find package.json.')
    process.exit(1)
  }

  const pkgDir = path.dirname(pkgPath)

  let pkgInfo: PkgInfo = {}

  try {
    pkgInfo = parseJSON<PkgInfo>(pkgPath)
  } catch (err) {
    console.error(`cannot parse package.json`)
    process.exit(1)
  }

  return {
    pkgInfo,
    pkgPath,
    pkgDir,
  }
}
