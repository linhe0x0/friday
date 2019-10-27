export enum EndpointProtocol {
  TCP = 'tcp:',
  HTTP = 'http:',
  UNIX = 'unix:',
}

export type Endpoint = {
  protocol: EndpointProtocol
  host: string
  port?: number
}
