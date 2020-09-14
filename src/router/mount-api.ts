import glob from 'glob'
import Koa from 'koa'
import _ from 'lodash'
import path from 'path'

import { validate } from '../services/validator'
import loader from '../utilities/loader'
import useLogger from '../utilities/logger'

const logger = useLogger('friday:router')

interface fileRouteMetadata {
  file: string
  method: string
  url: string
}

const apiPrefix = '/api'

// eslint-disable-next-line @typescript-eslint/ban-types
export default function mountApi(): Function {
  const apiDir = path.resolve(process.cwd(), 'dist/app')

  const files = glob.sync(`${apiDir}/*/api/**/*.js`)
  const routeUrlList: fileRouteMetadata[] = _.filter(
    _.map(files, (item): fileRouteMetadata | undefined => {
      const filePath = item.substring(apiDir.length + 1)
      const [scope, ...paths] = filePath.split('/')
      const routesInFilePath: string[] = _.tail(paths)
      const values = _.split(_.last(routesInFilePath), '.')
      const filename = _.first(values)
      const method = values.length === 2 ? 'all' : values[1]

      const ignore = _.startsWith(filename, '_')

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

      url = url.replace(/\[(.*)\]/, (_s, name) => `:${name}`)

      return {
        file: filePath,
        method,
        url,
      }
    }),
    (item) => !!item
  ) as fileRouteMetadata[]

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
      throw new Error(
        `Failed to load your routes from ${filePath}. Expect function but got ${typeof handler}.`
      )
    }

    const { schema, middlewares } = handler || {}

    return {
      method: item.method,
      url: item.url,
      schema: schema || {},
      middlewares: middlewares || [],
      handler,
    }
  })

  return function mount(router) {
    _.forEach(routes, (item) => {
      const { method, url, schema, middlewares, handler } = item

      if (!router[method]) {
        throw new Error(`Unsupported route method: ${method} (${url})`)
      }

      router[method](
        url,
        ...middlewares,
        async (ctx: Koa.Context): Promise<void> => {
          if (!_.isEmpty(schema)) {
            try {
              validate(schema, _.assign({}, ctx.params, ctx.query, ctx.body))
            } catch (err) {
              ctx.throw(400, err)
              return
            }
          }

          const body = await handler(ctx)

          if (_.isUndefined(body)) {
            throw Error(`Unexpected response body value: ${body}.`)
          }

          ctx.body = body
        }
      )
    })

    return router
  }
}
