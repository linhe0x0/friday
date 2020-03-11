import fs from 'fs'
import _ from 'lodash'
import path from 'path'

import loader from '../utilities/loader'
import loggerGenerator from '../utilities/logger'

const logger = loggerGenerator('friday:router')
const noop = (): void => {}

export default function mount(): Function {
  let userRouter: Function = noop
  const targetPathList = [
    path.resolve(process.cwd(), 'dist/router.js'),
    path.resolve(process.cwd(), 'dist/router/index.js'),
  ]
  let routerPath = ''

  _.forEach(targetPathList, item => {
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

  try {
    if (routerPath === '') {
      throw new Error(`No such file or directory`)
    }

    userRouter = loader(routerPath)
  } catch (err) {
    logger.warn(
      `Failed to load your routes from expect router file: [${targetPathList}]:`,
      err.message
    )
    logger.warn('Routes of your app is missed.')
  }

  if (typeof userRouter !== 'function') {
    throw new Error(
      `Failed to load your routes from ${routerPath}. Expect function but got ${typeof userRouter}.`
    )
  }

  return userRouter
}
