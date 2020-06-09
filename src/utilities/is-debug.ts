import { getConfigWithDefault } from '../services/config'

export default function isDebugMode(): boolean {
  return getConfigWithDefault('debug', process.env.FRIDAY_ENV === 'development')
}