export default function isValidPort(port: number | string): boolean {
  if (typeof port === 'string') {
    const p = parseInt(port, 10)

    if (Number.isNaN(p)) {
      return false
    }
  }

  if (
    Number.isNaN(port) ||
    (!Number.isNaN(port) && (port < 1 || port >= 2 ** 16))
  ) {
    return false
  }

  return true
}
