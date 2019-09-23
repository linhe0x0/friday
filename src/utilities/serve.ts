import consola from 'consola'
import http from 'http'

import useHooks from './hooks'
import loader from './loader'

export default async function serve(
  endpoint: [number?, string?],
  entryFile: string
): Promise<http.Server> {
  let app
  let entry

  const hooks = useHooks(entryFile)

  try {
    app = loader('../app')
  } catch (err) {
    consola.error(err.message)
    process.exit(1)
  }

  try {
    entry = loader(entryFile)
  } catch (err) {
    consola.error(err.message)
    process.exit(1)
  }

  if (typeof entry !== 'function') {
    consola.error(`The file "${entryFile}" does not export a function.`)
    process.exit(1)
  }

  const application = await entry(app)

  hooks.beforeStart()

  const server = http.createServer(application.callback())

  const [port, hostname] = endpoint

  return new Promise((resolve, reject) => {
    server.listen(port, hostname, () => {
      hooks.afterStart()

      resolve(server)
    })

    server.on('error', err => {
      reject(err)
    })
  })
}
