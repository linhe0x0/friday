import path from 'path'

import loader from '../utilities/loader'
import loggerGenerator from '../utilities/logger'

const logger = loggerGenerator('friday:router')
const noop = (): void => {}

export default function mount(): Function {
  const routerPath = path.resolve(process.cwd(), 'dist/router.js')

  let userRouter: Function

  try {
    userRouter = loader(routerPath)
  } catch (err) {
    logger.warn(
      `Failed to load your routes from expect router file [${routerPath}]:`,
      err.message
    )
    logger.warn('Routes of your app is missed.')

    // eslint-disable-next-line @typescript-eslint/no-empty-function
    userRouter = noop
  }

  if (typeof userRouter !== 'function') {
    throw new Error(
      `Failed to load your routes from ${routerPath}. Expect function but got ${typeof userRouter}.`
    )
  }

  return userRouter
}
