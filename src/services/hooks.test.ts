import Koa from 'koa'

import { addHook, cleanAllHooks, emitHook, getHook } from './hooks'

beforeEach(() => {
  cleanAllHooks()
})

describe('addHook', () => {
  test('add new hook', () => {
    addHook('onReady', jest.fn())

    expect(getHook('onReady').length).toBe(1)
  })

  test('add hooks', () => {
    addHook('onReady', jest.fn())
    addHook('onReady', jest.fn())

    expect(getHook('onReady').length).toBe(2)
  })
})

describe('emitHook', () => {
  test('emit hook', async () => {
    let count = 0

    addHook('onReady', () => {
      return new Promise((resolve) => {
        count = 1

        resolve()
      })
    })

    expect(count).toBe(0)

    const app = new Koa()

    emitHook('onReady', app)

    expect(getHook('onReady').length).toBe(1)
    expect(count).toBe(1)
  })

  test('emit nonexistent hook', async () => {
    const app = new Koa()

    emitHook('onReady', app)

    expect(getHook('onReady').length).toBe(0)
  })
})

describe('cleanAllHooks', () => {
  test('clean all hook', () => {
    addHook('onReady', jest.fn())
    cleanAllHooks()

    expect(getHook('onReady').length).toBe(0)
  })
})
