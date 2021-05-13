import path from 'path'

import { entry } from './entry'

const p = path.parse(entry)

export const rootDir = p.dir
