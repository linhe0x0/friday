import { spawn } from 'child_process'
import type { Arguments } from 'yargs'
import logger from '../lib/command-logger'
import start from './start'
import { findUp, isFileName, existsSync } from '../utilities/fs'

interface MainCommandOptions {
  entryPoint?: string | undefined
}

export default function main(argv: Arguments<MainCommandOptions>): void {
  if (argv._.length === 0 && argv.entryPoint) {
    const filename = isFileName(argv.entryPoint)

    if (!filename) {
      /**
       * Try to run subcommands that provided by friday-cli with friday. such as `friday dev`, `friday lint`.
       *
       * It's an alias for `friday-cli`.
       *
       * eg:
       *  friday dev  => friday-cli dev
       *  friday lint => friday-cli lint
       */
      const cwd = process.cwd()
      const nodeModules = findUp('node_modules', cwd)

      if (!nodeModules) {
        logger.error(
          'node_modules directory is not found from current working directory.'
        )
        process.exit(1)
      }

      const cliBinFile = `${nodeModules}/.bin/friday-cli`
      const cliBinFileExists = existsSync(cliBinFile)

      if (!cliBinFileExists) {
        logger.error('friday-cli is not found. Maybe you forgot to install it?')
        process.exit(1)
      }

      const commandOptions = process.argv.slice(2)

      const child = spawn(cliBinFile, commandOptions, {
        cwd,
        shell: process.platform === 'win32',
      })

      child.stdout.pipe(process.stdout)
      child.stderr.pipe(process.stderr)

      child.on('error', (error: string) => {
        console.error(error)
        process.exit(1)
      })
      child.on('close', (code) => {
        process.exit(code || 0)
      })

      return
    }
  }

  start(argv)
}
