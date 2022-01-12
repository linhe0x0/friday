export default function validPort(port: number): boolean {
  if (
    Number.isNaN(port) ||
    (!Number.isNaN(port) && (port < 1 || port >= 2 ** 16))
  ) {
    return false
  }

  return true
}
