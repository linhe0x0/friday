import consola from 'consola'
import http from 'http'

import { Endpoint, EndpointProtocol } from '../types/friday'
import useHooks from './hooks'
import loader from './loader'

export default async function serve(
  endpoint: Endpoint,
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

  return new Promise(function listen(resolve, reject): void {
    const listenCallback = (): void => {
      hooks.afterStart()

      resolve(server)
    }

    if (endpoint.protocol === EndpointProtocol.UNIX) {
      /**
       * UNIX domain socket endpoint.
       */
      const path = endpoint.host

      server.listen(path, listenCallback)
    } else {
      const { host, port } = endpoint

      server.listen(port, host, listenCallback)
    }

    server.on('error', (err) => {
      reject(err)
    })
  })
}
