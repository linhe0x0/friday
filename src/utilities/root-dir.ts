let dir = ''

export function getRootDir(): string {
  return process.env.USER_APP_ROOT_DIR || dir
}

export function setRootDir(value: string): void {
  dir = value
}
