import path from 'path'

import loader from '../utilities/loader'
import loggerGenerator from '../utilities/logger'

const logger = loggerGenerator('friday:router')

export default function mount() {
  const routerPath = path.resolve(process.cwd(), 'dist/router.js')

  let userRouter: Function

  try {
    userRouter = loader(routerPath)
  } catch (err) {
    logger.warn('Routes of your app is missed.')

    userRouter = () => {}
  }

  return userRouter
}
