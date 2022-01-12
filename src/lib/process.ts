export function gracefulShutdown(fn: () => void): void {
  let isExiting = false

  const onceWrapper = () => {
    if (!isExiting) {
      isExiting = true

      fn()
    }
  }

  process.on('SIGINT', onceWrapper)
  process.on('SIGTERM', onceWrapper)
  process.on('exit', onceWrapper)
}
