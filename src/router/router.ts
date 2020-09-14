import Router from '@koa/router'

import useLogger from '../utilities/logger'
import helpfulRouter from './helpful-router'
import mountApi from './mount-api'
import mountRouter from './mount-router'

const logger = useLogger('friday:router')
const router = new Router()

try {
  // Mount user routes from [USER_APP_ROOT_DIR]/dist/app/*/api/**.js.
  const useApiRouter = mountApi()

  useApiRouter(router)

  // Mount user routes from [USER_APP_ROOT_DIR]/dist/router.js.
  const useUserRouter = mountRouter(router.stack.length)

  useUserRouter(router)
} catch (err) {
  logger.error(err.message)
  process.exit(1)
}

helpfulRouter(router)

export default router
