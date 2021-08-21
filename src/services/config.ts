import config from 'config'

export function getConfig<T>(key: string): T {
  return config.get(key)
}

export function hasConfig(key: string): boolean {
  return config.has(key)
}

export function getOptionalConfig<T>(key: string): T | undefined {
  return config.has(key) ? config.get(key) : undefined
}

export function getConfigWithDefault<T>(key: string, defaultValue: T): T {
  return config.has(key) ? config.get(key) : defaultValue
}
