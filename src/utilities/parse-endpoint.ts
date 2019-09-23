import { URL } from 'url'

export default function parseEndpoint(endpoint: string): [number, string] {
  const url = new URL(endpoint)

  if (url.protocol !== 'tcp:' && url.protocol !== 'http:') {
    throw new Error(
      `Unknown --listen endpoint scheme (protocol): ${url.protocol}`
    )
  }

  const port = parseInt(url.port, 10) || 3000

  return [port, url.hostname]
}
