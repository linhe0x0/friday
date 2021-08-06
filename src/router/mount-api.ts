import glob from 'glob'
import Koa from 'koa'
import _ from 'lodash'
import path from 'path'
import { isURL } from 'validator'

import { validate } from '../services/validator'
import loader from '../utilities/loader'
import useLogger from '../utilities/logger'
import { rootDir } from '../utilities/root-dir'

const logger = useLogger('friday:router')

interface fileRouteMetadata {
  file: string
  method: string
  url: string
}

const apiPrefix = '/api'

const ignoredFile = (filename: string): boolean => {
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

export function fileRoutes(dir: string): fileRouteMetadata[] {
  const files = glob.sync(`${dir}/*/api/**/*.js`)

  return _.filter(
    _.map(files, (item): fileRouteMetadata | undefined => {
      const filePath = item.substring(dir.length + 1)
      const [scope, ...paths] = filePath.split('/')
      const routesInFilePath: string[] = _.tail(paths)
      const values = _.split(_.last(routesInFilePath), '.')
      const filename = _.first(values)
      const method = values.length === 2 ? 'all' : values[1]

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
    }),
    (item) => !!item
  ) as fileRouteMetadata[]
}

// eslint-disable-next-line @typescript-eslint/ban-types
export default function mountApi(): Function {
  const apiDir = path.resolve(rootDir, 'app')
  const routeUrlList = fileRoutes(apiDir)

  const conflicts = _.filter(
    _.map(routeUrlList, (item, index) => {
      const results: fileRouteMetadata[] = []

      for (let i = index + 1; i < routeUrlList.length; i += 1) {
        const target = routeUrlList[i]

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

  const routes = _.map(routeUrlList, (item) => {
    const filePath = path.resolve(apiDir, item.file)
    const handler = loader(filePath)

    if (typeof handler !== 'function') {
      const isEmptyObject = _.isEqual(handler, {})

      if (isEmptyObject) {
        logger.warn(
          `Expect function but got nothing when loading routes from ${filePath}. The file will be ignored.`
        )
      } else {
        throw new Error(
          `Failed to load your routes from ${filePath}. Expect function but got ${typeof handler}.`
        )
      }
    }

    const { schema, middleware } = handler || {}

    return {
      method: item.method,
      url: item.url,
      schema: schema || {},
      middleware: middleware || [],
      handler,
    }
  })

  return function mount(router) {
    _.forEach(routes, (item) => {
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
            } catch (err) {
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
