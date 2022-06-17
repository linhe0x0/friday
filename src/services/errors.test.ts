import { createError, throwError, newError, is, isErrors } from './errors'

describe('createError', () => {
  it('should create an error with the given message', () => {
    const err = createError('message')

    expect(err.message).toBe('message')
  })

  it('should create an error with the given message and context', () => {
    const err = createError('message', {
      id: '1',
    })

    expect(err.message).toBe('message')
    expect(err.context).toStrictEqual({
      id: '1',
    })
  })

  it('should create an error with the given name and message', () => {
    const err = createError('name', 'message')

    expect(err.name).toBe('name')
    expect(err.message).toBe('message')
  })

  it('should create an error with the given name, message and context', () => {
    const err = createError('name', 'message', {
      id: '1',
    })

    expect(err.name).toBe('name')
    expect(err.message).toBe('message')
    expect(err.context).toStrictEqual({
      id: '1',
    })
  })

  it('should create an error with the given status code and message', () => {
    const err = createError(401, 'message')

    expect(err.status).toBe(401)
    expect(err.statusCode).toBe(401)
    expect(err.message).toBe('message')
  })

  it('should create an error with the given status code, message and context', () => {
    const err = createError(401, 'message', {
      id: '1',
    })

    expect(err.status).toBe(401)
    expect(err.statusCode).toBe(401)
    expect(err.message).toBe('message')
    expect(err.context).toStrictEqual({
      id: '1',
    })
  })

  it('should create an error with the given error', () => {
    const err = createError({
      message: 'message',
      error: new Error('error'),
    })

    expect(err.error).toBeInstanceOf(Error)
    expect(err.error!.message).toBe('error')
  })

  it('should throw an error if no message is given', () => {
    expect(() => {
      createError({} as any)
    }).toThrowError('message is required')
  })
})

describe('throwError', () => {
  it('should throw an error with the given message', () => {
    expect(() => {
      throwError('message')
    }).toThrowError('message')
  })
})

describe('newError', () => {
  it('should create an error with the given name', () => {
    const err = newError('name')

    expect(err.name).toBe('name')
  })

  it('should create an error with the given name and message', () => {
    const err = newError('name', 'message')

    expect(err.name).toBe('name')
    expect(err.message).toBe('message')
  })

  it('should create an error with the given context', () => {
    const err = newError('name')

    err.withContext({
      id: '1',
    })

    expect(err.context).toStrictEqual({
      id: '1',
    })
  })

  it('should create an error with the name given by withName', () => {
    const err = newError('name')

    err.withName('new name')

    expect(err.name).toBe('new name')
  })

  it('should create an error with the given error', () => {
    const err = newError('name')

    err.withError(new Error('message'))

    expect(err.error).toBeInstanceOf(Error)
    expect(err.error!.message).toBe('message')
  })

  it('should create an error with the given status', () => {
    const err = newError('name')

    err.withStatus(401)

    expect(err.status).toBe(401)
    expect(err.statusCode).toBe(401)
  })

  it('should create an error and throw it', () => {
    expect(() => {
      const err = newError('name', 'message')

      err.throw()
    }).toThrowError('message')
  })
})

describe('is', () => {
  it('should return true if the error is the given name', () => {
    const err = newError('name')

    expect(is(err, 'name')).toBe(true)
  })

  it('should return false if the error is not the given name', () => {
    const err = newError('name')

    expect(is(err, 'other name')).toBe(false)
  })

  it('should return true if the error is the given message', () => {
    const err = newError('name')

    err.withError(new Error('error message'))

    expect(is(err, 'error message')).toBe(true)
  })

  it('should return false if the error is not the given message', () => {
    const err = newError('name')

    err.withError(new Error('error message'))

    expect(is(err, 'other name')).toBe(false)
  })
})

describe('isErrors', () => {
  it('should return true if the given error is an instance of Errors', () => {
    const err = newError('name', 'message')

    expect(isErrors(err)).toBe(true)
  })

  it('should return false if the given error is not an instance of Errors', () => {
    const err = newError('name', 'message')

    expect(isErrors(err)).toBe(true)
  })
})
