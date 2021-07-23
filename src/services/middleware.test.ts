import {
  addMiddleware,
  getMiddlewareList,
  resetMiddlewareList,
  use,
} from './middleware'

beforeEach(() => {
  resetMiddlewareList()
})

test('add middleware', () => {
  expect(getMiddlewareList().length).toBe(0)

  addMiddleware(jest.fn)

  expect(getMiddlewareList().length).toBe(1)
  expect(getMiddlewareList()[0].weight).toBe(1)
})

test('add middleware with weight', () => {
  expect(getMiddlewareList().length).toBe(0)

  addMiddleware(jest.fn, 2)

  expect(getMiddlewareList().length).toBe(1)
  expect(getMiddlewareList()[0].weight).toBe(2)
})

test('add middleware and sort', () => {
  expect(getMiddlewareList().length).toBe(0)

  addMiddleware(jest.fn, 2)
  addMiddleware(jest.fn, 10)

  expect(getMiddlewareList().length).toBe(2)
  expect(getMiddlewareList()[0].weight).toBe(10)
  expect(getMiddlewareList()[1].weight).toBe(2)
})

test('add middleware with use alias', () => {
  expect(getMiddlewareList().length).toBe(0)

  use(jest.fn)

  expect(getMiddlewareList().length).toBe(1)
  expect(getMiddlewareList()[0].weight).toBe(1)
})
