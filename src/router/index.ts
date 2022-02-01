import type Koa from 'koa'
import _ from 'lodash'

import Router from '@koa/router'

import useLogger from '../utilities/logger'
import helpfulRouter from './helpful-router'
import mountApi from './mount-api'
import mountRouter from './mount-router'
import outputRoutes from './output-routes'

const logger = useLogger('friday:router')

interface MountOptions {
  debug: boolean
}

export function mount(app: Koa, options?: Partial<MountOptions>) {
  const opts = _.defaults(options, {
    debug: false,
  })

  const router = new Router()

  try {
    // Mount user routes from [USER_APP_ROOT_DIR]/app/*/api/**.js.
    const useApiRouter = mountApi()

    useApiRouter(router)

    // Mount user routes from [USER_APP_ROOT_DIR]/router.js.
    const useUserRouter = mountRouter()

    useUserRouter(router)

    if (router.stack.length === 0) {
      logger.warn('Routes are missing.')
    }
  } catch (err: any) {
    logger.error(err.message)
    process.exit(1)
  }

  helpfulRouter(router)

  app.use(router.routes())
  app.use(router.allowedMethods())

  if (opts.debug) {
    outputRoutes(router)
  }

  return router
}
