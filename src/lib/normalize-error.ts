export function normalizeError(err: unknown): Error {
  if (err instanceof Error) {
    return err
  }

  if (typeof err === 'string') {
    const error = new Error(err)

    return error
  }

  if (typeof err === 'number') {
    const error = new Error(`${err}`)

    return error
  }

  if (typeof err === 'function') {
    const result = err()

    return normalizeError(result)
  }

  const error = err as any
  const msg = error && error.message ? error.message : String(error)

  const e = new Error(msg)

  if (error.name) {
    e.name = error.name
  }

  if (error.stack) {
    e.stack = error.stack
  }

  return e
}
