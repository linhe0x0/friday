import fs from 'fs'
import _ from 'lodash'
import path from 'path'

import loader from '../utilities/loader'
import useLogger from '../utilities/logger'

interface RouteFn {
  (router: any): any
}

const logger = useLogger('friday:router')

export default function mount(dir: string): RouteFn {
  const targetPathList = [
    path.resolve(dir, 'router.js'),
    path.resolve(dir, 'router/index.js'),
  ]

  let routerPath = ''

  _.forEach(targetPathList, (item) => {
    try {
      fs.accessSync(item, fs.constants.F_OK)

      routerPath = item

      // exit iteration early
      return false
    } catch (_err) {
      // go to next
      return true
    }
  })

  let userRouter: RouteFn

  if (routerPath) {
    try {
      userRouter = loader(routerPath).default
    } catch (err: any) {
      logger.error(
        `Failed to load your routes from expect router file: [${routerPath}]: %s`,
        err.message
      )

      throw err
    }

    if (typeof userRouter !== 'function') {
      throw new Error(
        `Failed to load your routes from ${routerPath}. Expect function but got ${typeof userRouter}.`
      )
    }
  } else {
    userRouter = (r) => r
  }

  return userRouter
}
