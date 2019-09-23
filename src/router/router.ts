import Router from '@koa/router'

import helpfulRouter from './helpful-router'
import mountRouter from './mount'

const router = new Router()

// Mount user routes from [USER_APP_ROOT_DIR]/dist/router.js.
const useUserRouter = mountRouter()

helpfulRouter(router)

useUserRouter(router)

export default router
