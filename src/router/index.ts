import Koa from 'koa'
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

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export function mount(app: Koa, options?: Partial<MountOptions>) {
  const opts = _.defaults(options, {
    debug: false,
  })

  const router = new Router()

  helpfulRouter(router)

  setTimeout(() => {
    try {
      // Mount user routes from [USER_APP_ROOT_DIR]/dist/app/*/api/**.js.
      const useApiRouter = mountApi()

      useApiRouter(router)

      // Mount user routes from [USER_APP_ROOT_DIR]/dist/router.js.
      const useUserRouter = mountRouter()

      useUserRouter(router)
    } catch (err) {
      logger.error(err.message)
      process.exit(1)
    }

    if (router.stack.length === 0) {
      logger.warn('Routes are missed.')
    }

    app.use(router.routes())
    app.use(router.allowedMethods())

    if (opts.debug) {
      outputRoutes(router)
    }
  }, 0)

  return router
}
