import { getConfigWithDefault } from '../services/config'

export function isDebugMode(): boolean {
  return getConfigWithDefault('debug', process.env.FRIDAY_ENV === 'development')
}

export function isInitialStart(): boolean {
  return process.env.FRIDAY_RESTARTED !== 'true'
}
