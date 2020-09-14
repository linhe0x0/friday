import chokidar from 'chokidar'
import _ from 'lodash'

export default function watch(
  target: string,
  ignored: string | RegExp | RegExp[],
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  callback: (...args: any) => any
): chokidar.FSWatcher {
  const watchConfig: chokidar.WatchOptions = {
    ignoreInitial: true,
    ignored: [
      /(^|[/\\])\../, // .dotfiles
      /\.(?!.*(json|js)$).*$/, // Non js/json files.
    ],
  }

  if (ignored) {
    if (Array.isArray(ignored)) {
      watchConfig.ignored = watchConfig.ignored.concat(ignored)
    } else {
      watchConfig.ignored.push(ignored)
    }
  }

  const watcher = chokidar.watch(target, watchConfig)

  watcher.on('all', _.debounce(callback, 10))

  return watcher
}
