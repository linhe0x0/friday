import Koa from 'koa'
import _ from 'lodash'

import Router from '@koa/router'

import { isInitialStart } from '../utilities/env'
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

  try {
    // Mount user routes from [USER_APP_ROOT_DIR]/app/*/api/**.js.
    const useApiRouter = mountApi()

    useApiRouter(router)

    // Mount user routes from [USER_APP_ROOT_DIR]/router.js.
    const useUserRouter = mountRouter()

    useUserRouter(router)

    if (router.stack.length === 0) {
      throw new Error('Routes are missing.')
    }
  } catch (err) {
    logger.error(err.message)
    process.exit(1)
  }

  helpfulRouter(router)

  app.use(router.routes())
  app.use(router.allowedMethods())

  const initialStart = isInitialStart()

  if (opts.debug && initialStart) {
    outputRoutes(router)
  }

  return router
}
