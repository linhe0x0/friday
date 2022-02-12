import Koa from 'koa'
import Router from '@koa/router'
// eslint-disable-next-line import/no-extraneous-dependencies
import request from 'supertest'

import helpfulRouter from './helpful-router'

const app = new Koa()
const router = new Router()

helpfulRouter(router)

app.use(router.routes())

describe('test _ping endpoint', () => {
  test('GET /_ping', async () => {
    const response = await request(app.callback()).get('/_ping')

    expect(response.text).toBe('pong')
  })

  test('GET /ping', async () => {
    const response = await request(app.callback()).get('/ping')

    expect(response.text).toBe('pong')
  })
})

describe('test _info endpoint', () => {
  test('GET /_info', async () => {
    const response = await request(app.callback()).get('/_info')

    expect(response.body.name).toBe('@sqrtthree/friday')
    expect(response.body.version).toBeTruthy()
    expect(response.body.env).toBe('test')
  })
})
