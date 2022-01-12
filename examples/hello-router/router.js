module.exports = function (router) {
  router.get('/', async (ctx) => {
    ctx.body = 'Hello, router!'
  })

  return router
}
