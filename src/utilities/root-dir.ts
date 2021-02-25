import path from 'path'

export function getRootDir(): string {
  if (process.env.USER_APP_ROOT_DIR) {
    return process.env.USER_APP_ROOT_DIR
  }

  // Value of USER_APP_ENTRY_FILE will be set automatically in friday-cli.
  const entry = process.env.USER_APP_ENTRY_FILE || process.argv[1]
  const { dir } = path.parse(entry)

  return dir
}
