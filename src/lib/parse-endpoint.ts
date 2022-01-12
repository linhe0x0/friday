import _ from 'lodash'
import { URL } from 'url'

import type { Endpoint, EndpointProtocol } from './serve'

export default function parseEndpoint(endpoint: string): Endpoint {
  const url = new URL(endpoint)

  if (!_.includes(['tcp:', 'http:', 'unix:'], url.protocol)) {
    throw new Error(
      `Unknown --listen endpoint scheme (protocol): ${url.protocol}`
    )
  }

  const host = url.protocol === 'unix:' ? url.pathname : url.hostname
  const port = url.port ? parseInt(url.port, 10) : undefined

  return {
    protocol: url.protocol as EndpointProtocol,
    host,
    port,
  }
}
