import config from 'config'

export function getConfig<T>(key: string): T {
  return config.get(key)
}

export function getOptionalConfig<T>(key: string): T | undefined {
  return config.has(key) ? config.get(key) : undefined
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function getConfigWithDefault<T>(key: string, defaultValue: any): T {
  return config.has(key) ? config.get(key) : defaultValue
}
