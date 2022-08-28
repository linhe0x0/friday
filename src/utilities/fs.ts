import path from 'path'
import { access } from 'fs/promises'
import { constants, readFileSync, accessSync } from 'fs'

export function isFileName(filename: string): boolean {
  const ext = path.extname(filename)

  return !!ext
}

export function exists(target: string): Promise<boolean> {
  return access(target, constants.F_OK)
    .then(() => {
      return true
    })
    .catch(() => {
      return false
    })
}

export function existsSync(target: string): boolean {
  try {
    accessSync(target, constants.F_OK)

    return true
  } catch (err) {
    return false
  }
}

export const findUp = (name: string, cwd?: string, stopAt?: string): string => {
  const workingDir = cwd || process.cwd()

  let dir = path.resolve(workingDir)

  const { root } = path.parse(dir)
  const stop = path.resolve(dir, stopAt || root)

  let match = ''

  while (!match) {
    if (dir === stop) {
      break
    }

    const target = path.resolve(dir, name)
    const found = existsSync(target)

    if (found) {
      match = target
      break
    }

    dir = path.dirname(dir)
  }

  return match
}

export function parseJSON<T>(
  filename: string,
  encoding: BufferEncoding = 'utf8'
): T {
  const content = readFileSync(filename, {
    encoding,
  }).toString()

  return JSON.parse(content)
}
