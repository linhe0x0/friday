import parseEndpoint from './parse-endpoint'

test('should return endpoint data with unix:', () => {
  expect(parseEndpoint('unix:/tmp/foo')).toEqual({
    protocol: 'unix:',
    host: '/tmp/foo',
    port: undefined,
  })
})

test('should return endpoint data with tcp:', () => {
  expect(parseEndpoint('tcp://127.0.0.1:3000')).toEqual({
    protocol: 'tcp:',
    host: '127.0.0.1',
    port: 3000,
  })
})

test('should return endpoint data with http:', () => {
  expect(parseEndpoint('http://127.0.0.1:3000')).toEqual({
    protocol: 'http:',
    host: '127.0.0.1',
    port: 3000,
  })
})

test('should throw an error with unsupported protocol:', () => {
  expect(() => {
    parseEndpoint('file://tmp/foo')
  }).toThrow()
})
