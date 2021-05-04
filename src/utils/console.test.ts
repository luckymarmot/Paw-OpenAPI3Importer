import logger from './console'

describe('logger utility', () => {
  it('should log string', () => {
    const _logger = jest.spyOn(logger, 'info')
    logger.info('Hello,', 'How are you?')
    expect(_logger).toHaveBeenCalledWith('Hello,', 'How are you?')
    expect(_logger).toMatchSnapshot()
  })

  it('should log object and nested object', () => {
    const _logger = jest.spyOn(logger, 'info')
    const object = {
      a: 'hello',
      b: { c: { d: 'world' } },
      c: [1, 2, 3, 4],
    }
    logger.info(object, object.c)
    expect(_logger).toHaveBeenCalledWith(object, object.c)
    expect(_logger).toMatchSnapshot()
  })
})
