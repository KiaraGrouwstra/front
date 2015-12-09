import { WS } from './ws.ts'
//let WS = require('./ws.ts')

describe('WebSocket', () => {

  beforeEach(() => {
    ws = new WS()
  })

  it('should expose an Observable', () =>
    expect(ws.out).toEqual(1)
  )

})
