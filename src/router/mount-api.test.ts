import path from 'path'
import Router from '@koa/router'
// eslint-disable-next-line import/no-extraneous-dependencies
import mountApi, {
  ignoredFile,
  fileRoutes,
  getConflictingFileRoutes,
  getRouteFiles,
  toRoutes,
} from './mount-api'

const getMockDir = (dir: string): string => {
  return path.join(__dirname, 'fixtures/api', dir)
}

describe('ignoreFile', () => {
  test('should ignore the file which starts with .', () => {
    expect(ignoredFile('.ignore.js')).toBe(true)
  })

  test('should ignore the file which starts with _', () => {
    expect(ignoredFile('_ignore.js')).toBe(true)
  })

  test('should ignore the file which ends with .test.js', () => {
    expect(ignoredFile('ignore.test.js')).toBe(true)
  })

  test('should ignore the file which ends with .spec.js', () => {
    expect(ignoredFile('ignore.spec.js')).toBe(true)
  })

  test('should not ignore the normal file', () => {
    expect(ignoredFile('users/[id].get.js')).toBe(false)
  })
})

describe('fileRoutes', () => {
  test('should return available routes with index.js', () => {
    const files = ['users/api/index.js']
    const routes = [
      {
        file: 'users/api/index.js',
        method: 'all',
        url: '/api/users',
      },
    ]

    expect(fileRoutes(files)).toEqual(routes)
  })

  test('should return available routes with index.method.js', () => {
    const files = [
      'users/api/index.all.js',
      'users/api/index.get.js',
      'users/api/index.post.js',
      'users/api/index.put.js',
      'users/api/index.patch.js',
      'users/api/index.delete.js',
      'users/api/index.options.js',
      'users/api/index.head.js',
    ]
    const routes = [
      {
        file: 'users/api/index.all.js',
        method: 'all',
        url: '/api/users',
      },
      {
        file: 'users/api/index.get.js',
        method: 'get',
        url: '/api/users',
      },
      {
        file: 'users/api/index.post.js',
        method: 'post',
        url: '/api/users',
      },
      {
        file: 'users/api/index.put.js',
        method: 'put',
        url: '/api/users',
      },
      {
        file: 'users/api/index.patch.js',
        method: 'patch',
        url: '/api/users',
      },
      {
        file: 'users/api/index.delete.js',
        method: 'delete',
        url: '/api/users',
      },
      {
        file: 'users/api/index.options.js',
        method: 'options',
        url: '/api/users',
      },
      {
        file: 'users/api/index.head.js',
        method: 'head',
        url: '/api/users',
      },
    ]

    expect(fileRoutes(files)).toEqual(routes)
  })

  test('should return empty routes with invalid filenames', () => {
    const files = ['users/api/.js']
    const routes = []

    expect(fileRoutes(files)).toEqual(routes)
  })

  test('should return empty routes with ignored filenames', () => {
    const files = ['users/api/_index.get.js']
    const routes = []

    expect(fileRoutes(files)).toEqual(routes)
  })

  test('should return available routes with [id].js', () => {
    const files = ['users/api/[id].js']
    const routes = [
      {
        file: 'users/api/[id].js',
        method: 'all',
        url: '/api/users/:id',
      },
    ]

    expect(fileRoutes(files)).toEqual(routes)
  })

  test('should return available routes with [id].method.js', () => {
    const files = [
      'users/api/[id].all.js',
      'users/api/[id].get.js',
      'users/api/[id].post.js',
    ]
    const routes = [
      {
        file: 'users/api/[id].all.js',
        method: 'all',
        url: '/api/users/:id',
      },
      {
        file: 'users/api/[id].get.js',
        method: 'get',
        url: '/api/users/:id',
      },
      {
        file: 'users/api/[id].post.js',
        method: 'post',
        url: '/api/users/:id',
      },
    ]

    expect(fileRoutes(files)).toEqual(routes)
  })

  test('should return available routes with [id]/index.method.js', () => {
    const files = [
      'users/api/[id]/index.js',
      'users/api/[id]/index.get.js',
      'users/api/[id]/index.post.js',
    ]
    const routes = [
      {
        file: 'users/api/[id]/index.js',
        method: 'all',
        url: '/api/users/:id',
      },
      {
        file: 'users/api/[id]/index.get.js',
        method: 'get',
        url: '/api/users/:id',
      },
      {
        file: 'users/api/[id]/index.post.js',
        method: 'post',
        url: '/api/users/:id',
      },
    ]

    expect(fileRoutes(files)).toEqual(routes)
  })

  test('should return available routes with [id]/resources.method.js', () => {
    const files = [
      'users/api/[id]/articles.js',
      'users/api/[id]/articles.get.js',
      'users/api/[id]/articles.post.js',
    ]
    const routes = [
      {
        file: 'users/api/[id]/articles.js',
        method: 'all',
        url: '/api/users/:id/articles',
      },
      {
        file: 'users/api/[id]/articles.get.js',
        method: 'get',
        url: '/api/users/:id/articles',
      },
      {
        file: 'users/api/[id]/articles.post.js',
        method: 'post',
        url: '/api/users/:id/articles',
      },
    ]

    expect(fileRoutes(files)).toEqual(routes)
  })

  test('should return available routes with multi-layered files', () => {
    const files = [
      'users/api/[id]/articles/tags.js',
      'users/api/[id]/articles/[aid].get.js',
      'users/api/[id]/articles/[aid]/tags.post.js',
    ]
    const routes = [
      {
        file: 'users/api/[id]/articles/tags.js',
        method: 'all',
        url: '/api/users/:id/articles/tags',
      },
      {
        file: 'users/api/[id]/articles/[aid].get.js',
        method: 'get',
        url: '/api/users/:id/articles/:aid',
      },
      {
        file: 'users/api/[id]/articles/[aid]/tags.post.js',
        method: 'post',
        url: '/api/users/:id/articles/:aid/tags',
      },
    ]

    expect(fileRoutes(files)).toEqual(routes)
  })
})

describe('getConflictingFileRoutes', () => {
  test('should return empty routes when there are no conflicting.', () => {
    const routes = [
      {
        file: 'users/api/index.get.js',
        method: 'get',
        url: '/api/users',
      },
      {
        file: 'users/api/index.post.js',
        method: 'post',
        url: '/api/users',
      },
    ]

    expect(getConflictingFileRoutes(routes)).toEqual([])
  })

  test('should return conflicting routes when with conflict.', () => {
    const routes = [
      {
        file: 'users/api/index.get.js',
        method: 'get',
        url: '/api/users',
      },
      {
        file: 'users/api/[id]/index.get.js',
        method: 'get',
        url: '/api/users/[id]',
      },
      {
        file: 'users/api/[id].get.js',
        method: 'get',
        url: '/api/users/[id]',
      },
    ]
    const conflicting = [
      [
        {
          file: 'users/api/[id]/index.get.js',
          method: 'get',
          url: '/api/users/[id]',
        },
        {
          file: 'users/api/[id].get.js',
          method: 'get',
          url: '/api/users/[id]',
        },
      ],
    ]

    expect(getConflictingFileRoutes(routes)).toEqual(conflicting)
  })
})

describe('getRouteFiles', () => {
  test('should return all matched route files', () => {
    const dir = getMockDir('match')
    const files = getRouteFiles(dir)

    expect(files).toEqual([
      'all-matched-2/api/[id].get.js',
      'all-matched/api/[id].get.js',
      'all-matched/api/[id].put.js',
      'all-matched/api/index.get.js',
      'all-matched/api/index.post.js',
    ])
  })
})

describe('toRoutes', () => {
  test('should return routes when converting valid routes', () => {
    const dir = getMockDir('to-routes-valid')

    const routes = toRoutes(
      [
        {
          file: 'namespace/api/index.get.js',
          method: 'get',
          url: '/api/namespace',
        },
      ],
      dir
    )

    expect(routes[0]!.method).toBe('get')
    expect(routes[0]!.url).toBe('/api/namespace')
    expect(routes[0]!.schema).toEqual({})
    expect(routes[0]!.middleware).toEqual([])
  })

  test('should return null when converting empty route', () => {
    const dir = getMockDir('to-routes-empty')

    const routes = toRoutes(
      [
        {
          file: 'namespace/api/index.get.js',
          method: 'get',
          url: '/api/namespace',
        },
      ],
      dir
    )

    expect(routes[0]).toBeNull()
  })

  test('should throw an error when converting invalid route', () => {
    const dir = getMockDir('to-routes-invalid')

    expect(() => {
      toRoutes(
        [
          {
            file: 'namespace/api/[to-routes-invalid].get.js',
            method: 'get',
            url: '/api/namespace/[to-routes-invalid]',
          },
        ],
        dir
      )
    }).toThrow('Failed to load your routes')
  })
})

describe('mountApi', () => {
  test('should mount routes when with valid data', () => {
    const dir = getMockDir('mount-with-valid-route')

    expect(() => {
      const router = new Router()
      const useApiRouter = mountApi(dir)

      useApiRouter(router)
    }).not.toThrow()
  })

  test('should mount routes when with empty data', () => {
    const dir = getMockDir('mount-with-empty-route')

    expect(() => {
      const router = new Router()
      const useApiRouter = mountApi(dir)

      useApiRouter(router)
    }).not.toThrow()
  })

  test('should throw an error when mounting conflict routes', () => {
    const dir = getMockDir('mount-conflict')

    expect(() => {
      mountApi(dir)
    }).toThrow('conflicts')
  })

  test('should throw an error when mounting unsupported routes', () => {
    const dir = getMockDir('unsupported')

    expect(() => {
      const router = new Router()
      const useApiRouter = mountApi(dir)

      useApiRouter(router)
    }).toThrow('Unsupported route method')
  })
})
