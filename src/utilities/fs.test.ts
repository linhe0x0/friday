import path from 'path'
import { exists, existsSync, isFileName, findUp, parseJSON } from './fs'

describe('isFileName', () => {
  test('should return true with static file', () => {
    expect(isFileName('test.png')).toBe(true)
    expect(isFileName('test.jpg')).toBe(true)
    expect(isFileName('test.css')).toBe(true)
    expect(isFileName('test.js')).toBe(true)
    expect(isFileName('test.html')).toBe(true)
  })

  test('should return false with dir', () => {
    expect(isFileName('app/dir')).toBe(false)
  })
})

describe('exists', () => {
  test('should return true if the file exists', async () => {
    const file = path.resolve(__dirname, 'fixtures/fs/valid.json')

    const result = await exists(file)

    expect(result).toBe(true)
  })

  test('should return false if the file dose not exists', async () => {
    const file = path.resolve(__dirname, 'fixtures/fs/not-exists.json')

    const result = await exists(file)

    expect(result).toBe(false)
  })
})

describe('existsSync', () => {
  test('should return true if the file exists', () => {
    const file = path.resolve(__dirname, 'fixtures/fs/valid.json')

    const result = existsSync(file)

    expect(result).toBe(true)
  })

  test('should return false if the file not exists', () => {
    const file = path.resolve(__dirname, 'fixtures/fs/not-exists.json')

    const result = existsSync(file)

    expect(result).toBe(false)
  })
})

describe('findUp', () => {
  test('should find target file if the file exists in the special working dir', () => {
    const cmd = path.resolve(__dirname, 'fixtures/fs')

    const result = findUp('valid.json', cmd)

    expect(result).toMatch('fixtures/fs/valid.json')
  })

  test('should find target file if the file exists', () => {
    const result = findUp('package.json')

    expect(result).toMatch('package.json')
  })

  test('should return empty string if the file dose not exists', () => {
    const cmd = path.resolve(__dirname, 'fixtures/fs')

    const result = findUp('dose-not-exists.json', cmd)

    expect(result).toBe('')
  })
})

describe('parseJSON', () => {
  test('should parse json content with valid json file', () => {
    const file = path.resolve(__dirname, 'fixtures/fs/valid.json')
    const result = parseJSON(file)

    expect(result).toEqual({
      a: 1,
    })
  })
})
