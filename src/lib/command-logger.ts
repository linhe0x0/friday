import consola, { LogLevel } from 'consola'

const isVerbose = process.argv.indexOf('--verbose') !== -1

const logger = consola.create({
  level: isVerbose ? LogLevel.Verbose : LogLevel.Info,
})

export default logger
