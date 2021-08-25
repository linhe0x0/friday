import path from 'path'

export function isStaticFile(filename: string): boolean {
  const ext = path.extname(filename)

  return !!ext
}
