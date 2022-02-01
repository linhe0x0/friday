import http from 'http'

export type EndpointProtocol = 'tcp:' | 'http:' | 'unix:'

export interface Endpoint {
  protocol: EndpointProtocol
  host: string
  port?: number | undefined
}

export default async function serve(endpoint: Endpoint): Promise<http.Server> {
  return new Promise(function listen(resolve, reject): void {
    // Reload app and hooks due to cache refreshing.
    const { createApp, hooks } = require('../main')
    const app = createApp()
    const server = http.createServer(app.callback())

    server.on('error', (err) => {
      reject(err)
    })

    const listenCallback = (): void => {
      resolve(server)

      hooks.emitHook('onReady', app)
    }

    if (endpoint.protocol === 'unix:') {
      /**
       * UNIX domain socket endpoint.
       */
      const path = endpoint.host

      server.listen(path, listenCallback)
    } else {
      const { host, port } = endpoint

      server.listen(port, host, listenCallback)
    }
  })
}
