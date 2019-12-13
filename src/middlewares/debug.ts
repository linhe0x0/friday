import chalk from 'chalk'
import consola from 'consola'
import Koa from 'koa'
import _ from 'lodash'
import PrettyError from 'pretty-error'

import { KoaError } from '../types/errors'

const pe = new PrettyError()

let requestCount = 0

const newLine = (): void => {
  process.stdout.write('\n')
}

const logRequest = (ctx: Koa.Context): void => {
  consola.log(chalk.grey(`> #${requestCount} ${ctx.method} ${ctx.url}`))

  if (
    ctx.headers['content-length'] > 0 &&
    ctx.headers['content-type'].indexOf('application/json') === 0
  ) {
    try {
      consola.log(ctx.request.body)
    } catch (err) {
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

  consola.log(ctx.body)
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

export default async function(ctx: Koa.Context, next: Function): Promise<void> {
  requestCount += 1

  newLine()

  consola.log(chalk.grey(`${_.repeat('-', process.stdout.columns || 80)}`))

  newLine()

  logRequest(ctx)

  newLine()

  const startTime = new Date()

  try {
    await next()
  } catch (err) {
    logError(err)

    throw err
  }

  const endTime = new Date()

  const duration = endTime.getTime() - startTime.getTime()

  logResponse(ctx, duration)
}
