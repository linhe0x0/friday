import { getConfigWithDefault, hasConfig } from '../services/config'

export function isDebugMode(): boolean {
  const appDebug = hasConfig('app.debug')

  if (appDebug) {
    return getConfigWithDefault(
      'app.debug',
      process.env.FRIDAY_ENV === 'development'
    )
  }

  // deprecated option.
  // `app.debug` is recommended.
  return getConfigWithDefault('debug', process.env.FRIDAY_ENV === 'development')
}

export function isInitialStart(): boolean {
  return process.env.FRIDAY_RESTARTED !== 'true'
}
