import path from 'path'

import { entry } from '../lib/entry'

const p = path.parse(entry)

export const rootDir = p.dir
