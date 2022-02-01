import chalk from 'chalk'
import consola from 'consola'
import _ from 'lodash'
import PrettyError from 'pretty-error'
import type Koa from 'koa'

import { isStaticFile } from '../utilities/fs'

const pe = new PrettyError()

let requestCount = 0

const newLine = (): void => {
  process.stdout.write('\n')
}

const logRequest = (ctx: Koa.Context): void => {
  const contentLength = parseInt(ctx.headers['content-length'] || '0', 10)
  const contentType = ctx.headers['content-type'] || ''

  consola.log(chalk.grey(`> #${requestCount} ${ctx.method} ${ctx.url}`))

  if (contentLength > 0 && contentType.indexOf('application/json') === 0) {
    try {
      consola.log(ctx.request.body)
    } catch (err: any) {
      consola.error(`JSON body could not be parsed: ${err.message} \n`)
    }
  }
}

const logStatus = (statusCode: number): string => {
  if (statusCode >= 500) {
    return chalk.red(`${statusCode}`)
  }

  if (statusCode >= 400 && statusCode < 500) {
    return chalk.yellow(`${statusCode}`)
  }

  if (statusCode >= 300 && statusCode < 400) {
    return chalk.blue(`${statusCode}`)
  }

  if (statusCode >= 200 && statusCode < 300) {
    return chalk.green(`${statusCode}`)
  }

  return `${statusCode}`
}

const logResponse = (ctx: Koa.Context, duration: number): void => {
  consola.log(`< #${requestCount} ${logStatus(ctx.status)} [${duration}ms]`)

  newLine()

  const isHTMLResponse = ctx.accepts(['json', 'html', 'text']) === 'html'

  if (!isHTMLResponse) {
    consola.log(ctx.body)
  }
}

interface KoaError extends Error {
  status?: number
  statusCode?: number
}

const logError = (err: KoaError): void => {
  const status = err.status || err.statusCode || 500

  newLine()

  consola.log(`< ${logStatus(status)} ${err.message}`)

  if (status >= 500) {
    newLine()

    consola.error(pe.render(err))
  }
}

// eslint-disable-next-line consistent-return
export default async function debugMiddleware(
  ctx: Koa.Context,
  next: Koa.Next
): Promise<void> {
  const staticFile = isStaticFile(ctx.path)

  if (staticFile) {
    // Ignore request of static file by default.
    return next()
  }

  requestCount += 1

  newLine()

  consola.log(chalk.grey(`${_.repeat('-', process.stdout.columns || 80)}`))

  newLine()

  logRequest(ctx)

  newLine()

  const startTime = new Date()

  try {
    await next()
  } catch (err: any) {
    logError(err)

    throw err
  }

  const endTime = new Date()

  const duration = endTime.getTime() - startTime.getTime()

  logResponse(ctx, duration)
}
