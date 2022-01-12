module.exports = async function healthcheck(ctx) {
  const now = new Date().toISOString()

  return {
    now,
    health: true,
  }
}
