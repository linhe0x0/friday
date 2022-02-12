import glob from 'glob'
import _ from 'lodash'
import path from 'path'
import { isURL } from 'validator'
import type Koa from 'koa'

import { validate } from '../services/validator'
import loader from '../utilities/loader'
import useLogger from '../utilities/logger'
import { appDir } from '../lib/app-info'

const logger = useLogger('friday:router')

const apiPrefix = '/api'

export function ignoredFile(filename: string): boolean {
  if (_.startsWith(filename, '.')) {
    return true
  }

  if (_.startsWith(filename, '_')) {
    return true
  }

  if (_.endsWith(filename, '.test.js')) {
    return true
  }

  if (_.endsWith(filename, '.spec.js')) {
    return true
  }

  return false
}

interface fileRouteMetadata {
  file: string
  method: string
  url: string
}

export function fileRoutes(files: string[]): fileRouteMetadata[] {
  const routes: (fileRouteMetadata | undefined)[] = _.map(
    files,
    (filePath): fileRouteMetadata | undefined => {
      const [scope, ...paths] = filePath.split('/')
      const routesInFilePath: string[] = _.tail(paths)
      const values = _.split(_.last(routesInFilePath), '.')
      const filename = _.first(values)
      const method = values.length === 2 ? 'all' : values[1] || 'all'

      if (!filename) {
        return undefined
      }

      const ignore = ignoredFile(filename)

      if (ignore) {
        return undefined
      }

      let url = `${apiPrefix}/${scope}`

      const initialRoutesInFilePath = _.initial(routesInFilePath)

      if (initialRoutesInFilePath.length) {
        url += `/${_.join(initialRoutesInFilePath, '/')}`
      }

      if (filename !== 'index') {
        url += `/${filename}`
      }

      // eslint-disable-next-line no-useless-escape
      url = url.replace(/\[([^\[\]]+)\]/g, (_s, name) => `:${name}`)

      return {
        file: filePath,
        method,
        url,
      }
    }
  )
  const availableRoutes: fileRouteMetadata[] = _.filter(
    routes,
    (item) => !!item
  ) as fileRouteMetadata[]

  return availableRoutes
}

export function getRouteFiles(dir: string): string[] {
  const files = glob.sync(`${dir}/*/api/**/*.js`)

  const results = files.map((item: string) => {
    return item.substring(dir.length + 1)
  })

  return results
}

export function getConflictingFileRoutes(
  routes: fileRouteMetadata[]
): fileRouteMetadata[][] {
  const conflicts = _.filter(
    _.map(routes, (item, index) => {
      const results: fileRouteMetadata[] = []

      for (let i = index + 1, len = routes.length; i < len; i += 1) {
        const target = routes[i] as fileRouteMetadata

        if (item.method === target.method && item.url === target.url) {
          if (!results.length) {
            results.push(item)
          }

          results.push(target)
        }
      }

      return results
    }),
    (item) => item.length > 0
  )

  return conflicts
}

interface Route {
  method: string
  url: string
  schema: any
  middleware: any
  handler: any
}

export function toRoutes(
  data: fileRouteMetadata[],
  baseDir: string
): (Route | null)[] {
  return _.map(data, (item) => {
    const filePath = path.resolve(baseDir, item.file)
    const route = loader(filePath)
    const { schema, middleware } = route
    const handler = route.handler || route.default

    if (typeof handler !== 'function') {
      const isEmptyObject = _.isEqual(handler, {})

      if (isEmptyObject) {
        logger.warn(
          `Expect function but got nothing when loading routes from ${filePath}. The file will be ignored.`
        )

        return null
      }

      throw new Error(
        `Failed to load your routes from ${filePath}. Expect function but got ${typeof handler}.`
      )
    }

    return {
      method: item.method,
      url: item.url,
      schema: schema || {},
      middleware: middleware || [],
      handler,
    }
  })
}

// eslint-disable-next-line @typescript-eslint/ban-types
export default function mountApi(): Function {
  const routeFiles = getRouteFiles(appDir)
  const routeUrlList = fileRoutes(routeFiles)
  const conflicts = getConflictingFileRoutes(routeUrlList)

  if (conflicts.length) {
    let conflictMessage = ''

    _.forEach(conflicts, (item) => {
      conflictMessage += '\n'

      _.forEach(item, (route) => {
        conflictMessage += `  ${route.url} <= ${route.file}\n`
      })
    })

    const message = `There are some conflicts that need to be resolved manually.
${conflictMessage}
`

    logger.error(message)

    throw new Error(message)
  }

  const routes = toRoutes(routeUrlList, appDir)

  return function mount(router) {
    _.forEach(routes, (item) => {
      if (!item) {
        return
      }

      const { method, url, schema, middleware, handler } = item

      if (!router[method]) {
        throw new Error(`Unsupported route method: ${method} (${url})`)
      }

      router[method](
        url,
        ...middleware,
        async (ctx: Koa.Context): Promise<void> => {
          const hasSchema = !_.isEmpty(schema)

          if (hasSchema) {
            const s = _.defaults(schema, {
              type: 'object',
            })
            const d = _.assign({}, ctx.params, ctx.query, ctx.request.body)

            try {
              validate(s, d)
            } catch (err: any) {
              ctx.throw(400, err)
            }
          }

          const body = await handler(ctx)

          if (_.isUndefined(body)) {
            throw Error(`Unexpected response body value: ${body}.`)
          }

          const redirect =
            _.isString(body) && isURL(body, { require_host: false })

          if (redirect) {
            ctx.redirect(body)
          } else {
            ctx.body = body
          }
        }
      )
    })

    return router
  }
}
