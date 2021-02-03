import consola from 'consola'
import Koa from 'koa'
import yargs from 'yargs'

import app from '../app'
import loader from './loader'
import resolveEntry from './resolve-entry'

const args = yargs.argv

export default async function getServer(): Promise<Koa> {
  const entryFile = resolveEntry(args._[0] as string)

  let entry

  try {
    entry = loader(entryFile)
  } catch (err) {
    consola.error(err.message)
    process.exit(1)
  }

  const userAPP = await entry(app)

  return userAPP.callback()
}
